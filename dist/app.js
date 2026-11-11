import {events,stages} from './data/history.js';
import {mountNovelLayer} from './novel-layer.js';
const $=id=>document.getElementById(id);
const fullDate=new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const shortDate=new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const date=s=>new Date(s+'T12:00:00Z');
const formatted=s=>fullDate.format(date(s));
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const range=e=>e.start===e.end?formatted(e.start):`${shortDate.format(date(e.start))} — ${shortDate.format(date(e.end))}`;
const sourceUrl='https://warwick.ac.uk/services/library/mrc/collections/digital/scw/timeline2/';
let current=Math.max(0,Math.min(stages.length-1,Number(new URLSearchParams(location.search).get('etapa')??3)||0));
let playing=false,timer,speed=1,territories=null,territoryLayer=null,changes=null,changesLayer=null,selected=stages[current].event;
const map=L.map('map',{zoomControl:false,zoomSnap:.25,zoomDelta:.5,minZoom:4,maxZoom:12,scrollWheelZoom:true,preferCanvas:true}).setView([39.9,-3.1],5.7);
map.fitBounds([[35.8,-9.5],[43.9,4.4]],{padding:[30,35]});
L.control.scale({imperial:false,position:'bottomleft',maxWidth:80}).addTo(map);
let tileErrors=0,tileSuccess=0;
const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · Territorios: reconstrucción esquemática',maxZoom:19,subdomains:'abc'}).addTo(map);
tiles.on('tileerror',()=>{tileErrors++;if(tileErrors>3&&!tileSuccess)$('map-status').textContent='El mapa base no está disponible. Los territorios y las batallas siguen siendo interactivos.';});
tiles.on('tileload',()=>{tileSuccess++;if(territories)$('map-status').textContent='';});
const markers=L.layerGroup().addTo(map),markerById=new Map();
mountNovelLayer({map,pause,showInfo});
const symbols={Bombardeo:'✦',Retirada:'↗',Sublevación:'⚑','Fin de la guerra':'⚑',Ocupación:'⚑'};
function eventIcon(e,isSelected=false){return L.divIcon({className:'battle-marker',iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-17],html:`<span class="marker-inner ${isSelected?'selected':''}">${symbols[e.type]||'⚔'}</span>${isSelected?`<span class="marker-label">${e.name.replace(/^La |^El /,'')}</span>`:''}`});}
function eventsInView(){const s=stages[current];if($('past-toggle').checked)return events.filter(e=>e.start<=s.date);const previous=current?stages[current-1].date:'1936-07-16';return events.filter(e=>e.start<=s.date&&(e.end>=previous||e.id===s.event));}
function showPopup(e,{pan=true}={}){selected=e.id;for(const [id,m]of markerById){m.setIcon(eventIcon(events.find(v=>v.id===id),id===selected));m.setZIndexOffset(id===selected?1000:0);}const m=markerById.get(e.id);if(!m)return;const ongoing=e.start<=stages[current].date&&e.end>stages[current].date;
const result=ongoing?'En curso en la fecha seleccionada':e.result;
m.bindPopup(`<div class="popup-type">${e.type}${ongoing?' · En curso':''}</div><h3>${e.name}</h3><p class="popup-date">${range(e)}<br>${e.place}</p><p class="popup-body">${e.text}</p><div class="popup-result">${result}</div><a class="popup-source" href="${sourceUrl}" target="_blank" rel="noopener">Consultar cronología histórica ↗</a>`,{maxWidth:310,autoPan:pan,autoPanPaddingTopLeft:[35,65],autoPanPaddingBottomRight:[45,25],maxHeight:Math.max(110,Math.min(270,map.getSize().y-135))}).openPopup();renderCards();}
function renderCards(){const visible=eventsInView();$('event-count').textContent=`${visible.length} ${visible.length===1?'hito':'hitos'}`;$('event-list').replaceChildren();visible.sort((a,b)=>(b.id===stages[current].event)-(a.id===stages[current].event)||b.start.localeCompare(a.start)).forEach(e=>{const b=document.createElement('button');b.className=`event-card ${e.id===selected?'active':''}`;b.innerHTML=`<span class="event-icon">${symbols[e.type]||'⚔'}</span><span class="event-copy"><strong>${e.name}</strong><small>${shortDate.format(date(e.start))}${e.end>stages[current].date?' · En curso':''}</small></span><span class="event-arrow">↗</span>`;b.onclick=()=>{pause();if(!map.getBounds().contains([e.lat,e.lng]))map.setView([e.lat,e.lng],6);showPopup(e);};$('event-list').append(b);});}
function drawMarkers(){markers.clearLayers();markerById.clear();if(!$('battles-toggle').checked)return;eventsInView().forEach(e=>{const marker=L.marker([e.lat,e.lng],{icon:eventIcon(e,e.id===selected),title:`${e.name} · ${e.place}`,keyboard:true,zIndexOffset:e.id===selected?1000:0}).addTo(markers);marker.on('click',()=>{pause();showPopup(e);});markerById.set(e.id,marker);});}
function drawChanges(){
 if(changesLayer){map.removeLayer(changesLayer);changesLayer=null;}
 const show=Boolean(changes && $('territories-toggle').checked && $('changes-toggle').checked && changes[current]?.features.length);
 $('changes-key').hidden=!show;
 if(!show)return;
 changesLayer=L.geoJSON(changes[current],{interactive:false,style:{color:'#ad710c',weight:2.6,opacity:1,dashArray:'6 4',fillColor:'#ecc76e',fillOpacity:.14}}).addTo(map);
}
function drawTerritories(){
 if(territoryLayer){map.removeLayer(territoryLayer);territoryLayer=null;}
 if(territories && $('territories-toggle').checked){
  territoryLayer=L.geoJSON(territories[stages[current].territory],{
   style:f=>({color:f.properties.side==='republic'?'#9b4635':'#315f80',weight:1.5,fillColor:f.properties.side==='republic'?'#c36b53':'#4c83a8',fillOpacity:Number($('opacity').value)/100,opacity:.95}),
   onEachFeature:(f,l)=>l.bindTooltip(`${f.properties.side==='republic'?'Zona republicana':'Zona sublevada'} · ${formatted(stages[current].date)}<br>Control aproximado en esta etapa`,{sticky:true})
  }).addTo(map);
  territoryLayer.bringToBack();
 }
 drawChanges();
}
function updateFrontNote(){
 const same=current>0 && stages[current].territory===stages[current-1].territory;
 $('front-note').textContent=current===0?'Esquema territorial inicial':same?'Mismo esquema territorial que la etapa anterior':'Cambios respecto a la etapa anterior';
 $('front-note').classList.toggle('front-unchanged',same);
 $('map-stage-caption').textContent=stages[current].title;
}
function update(push=true){const s=stages[current];selected=s.event;$('date-slider').value=current;$('date-slider').setAttribute('aria-valuetext',`${formatted(s.date)}. ${s.title}`);$('date-slider').style.background=`linear-gradient(to right, #a86151 0%,#a86151 ${current/21*100}%,#d8decf ${current/21*100}%,#d8decf 100%)`;
const d=date(s.date);$('date-display').innerHTML=`${d.getUTCDate()} de ${new Intl.DateTimeFormat('es-ES',{month:'long'}).format(d)} <span>${d.getUTCFullYear()}</span>`;$('timeline-date').textContent=formatted(s.date);$('stage-number').textContent=`${String(current+1).padStart(2,'0')} / ${stages.length}`;$('phase-label').textContent=`ETAPA ${String(current+1).padStart(2,'0')} · ${s.date.slice(0,4)}`;$('stage-title').textContent=s.title;$('stage-text').textContent=s.text;$('previous').disabled=current===0;$('next').disabled=current===stages.length-1;
document.querySelectorAll('[data-year]').forEach(b=>b.classList.toggle('active',s.date.startsWith(b.dataset.year)));drawTerritories();drawMarkers();renderCards();updateFrontNote();if(push){const url=new URL(location.href);url.searchParams.set('etapa',current);history.replaceState(null,'',url);} }
function setStage(n){current=Math.max(0,Math.min(stages.length-1,n));map.closePopup();update();}
function pause(){playing=false;clearInterval(timer);$('play').textContent='▶';$('play').setAttribute('aria-label','Reproducir cronología');}
function start(){if(current===stages.length-1)setStage(0);playing=true;$('play').textContent='Ⅱ';$('play').setAttribute('aria-label','Pausar cronología');clearInterval(timer);timer=setInterval(()=>{if(current<stages.length-1)setStage(current+1);else pause();},3500/speed);}
$('play').onclick=()=>playing?pause():start();$('previous').onclick=()=>{pause();setStage(current-1);};$('next').onclick=()=>{pause();setStage(current+1);};$('date-slider').addEventListener('input',e=>{pause();setStage(Number(e.target.value));});$('speed').onclick=()=>{speed=speed===1?2:speed===2?.5:1;$('speed').textContent=`${speed===.5?'0,5':speed}×`;if(playing)start();};
document.querySelectorAll('[data-year]').forEach(b=>b.onclick=()=>{pause();setStage(stages.findIndex(s=>s.date.startsWith(b.dataset.year)));});
for(let i=0;i<stages.length;i++)$('milestones').append(document.createElement('span'));
document.querySelectorAll('[data-year]').forEach((b,i)=>{const positions=[0,4/21*100,13/21*100,100];b.style.left=positions[i]+'%';if(i===3)b.style.transform='translateX(-100%)';});
// A viewport-sized layout also works on mobile Safari, without the Fullscreen API.
const atlas=$('atlas');
let expanded=false,scrollBeforeExpand=0,literaryWasOpen=true;
const inertOutside=[document.querySelector('.topbar'),document.querySelector('.intro'),document.querySelector('footer')];
function setExpanded(value){
 expanded=value;pause();map.closePopup();$('layers-panel').hidden=true;$('layers-open').setAttribute('aria-expanded','false');
 if(value){
  scrollBeforeExpand=window.scrollY;literaryWasOpen=$('literary-controls').open;$('literary-controls').open=false;
  document.body.style.top=`-${scrollBeforeExpand}px`;
  document.body.classList.add('map-expanded');
  atlas.classList.add('is-expanded');
  atlas.setAttribute('role','dialog');atlas.setAttribute('aria-modal','true');
 }else{
  $('literary-controls').open=literaryWasOpen;atlas.classList.remove('is-expanded');atlas.removeAttribute('role');atlas.removeAttribute('aria-modal');
  document.body.classList.remove('map-expanded');document.body.style.top='';
  window.scrollTo({top:scrollBeforeExpand,behavior:'instant'});
 }
 inertOutside.forEach(node=>{if(node)node.inert=value;});
 $('expand-map').setAttribute('aria-expanded',String(value));
 $('expand-map').setAttribute('aria-label',value?'Salir de la vista ampliada':'Ampliar el mapa');
 $('expand-label').textContent=value?'Volver':'Ampliar';$('expand-icon').textContent=value?'×':'⛶';
 $('map-stage-caption').setAttribute('aria-hidden',String(!value));
 requestAnimationFrame(()=>{map.invalidateSize({pan:false});$('expand-map').focus({preventScroll:true});});
}
$('expand-map').onclick=()=>setExpanded(!expanded);
$('legend-toggle').onclick=()=>{
 const visible=$('map-legend').hidden;
 $('map-legend').hidden=!visible;
 $('map-wrap').classList.toggle('legends-hidden',!visible);
 $('legend-toggle').textContent=visible?'Ocultar leyendas':'Mostrar leyendas';
 $('legend-toggle').setAttribute('aria-expanded',String(visible));
};
document.addEventListener('keydown',e=>{
 if(!expanded || $('info-dialog').open || $('search-dialog').open)return;
 if(e.key==='Escape'){e.preventDefault();setExpanded(false);return;}
 if(e.key==='Tab'){
  const focusable=[...atlas.querySelectorAll('summary,select,button:not(:disabled),input:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }
});
$('zoom-in').onclick=()=>map.zoomIn();$('zoom-out').onclick=()=>map.zoomOut();function reset(){map.fitBounds([[35.8,-9.5],[43.9,4.4]],{padding:[20,30]});$('peninsula').hidden=true;$('canaries').hidden=false;}
$('reset-view').onclick=reset;$('canaries').onclick=()=>{map.fitBounds([[27.5,-18.3],[29.6,-13.1]],{padding:[50,70]});$('peninsula').hidden=false;$('canaries').hidden=true;};$('peninsula').onclick=reset;
$('layers-open').onclick=()=>{const hidden=!$('layers-panel').hidden;$('layers-panel').hidden=hidden;$('layers-open').setAttribute('aria-expanded',String(!hidden));};
document.addEventListener('click',e=>{if(!e.target.closest('#layers-panel')&&!e.target.closest('#layers-open')){$('layers-panel').hidden=true;$('layers-open').setAttribute('aria-expanded','false');}});
$('changes-toggle').onchange=drawChanges;$('territories-toggle').onchange=drawTerritories;$('opacity').oninput=drawTerritories;$('battles-toggle').onchange=drawMarkers;$('past-toggle').onchange=()=>{drawMarkers();renderCards();};
const methodology=`<h2>Leer el territorio,<br>entender la historia.</h2><p>Este atlas ofrece una aproximación didáctica a la evolución de la Guerra Civil española. Las <strong>22 fechas seleccionadas</strong> recogen cambios de fase y acontecimientos significativos.</p><h3>Cómo se ha reconstruido el mapa</h3><p>Las áreas de color son una <strong>reconstrucción propia y esquemática</strong> de las grandes zonas de control. Los frentes están generalizados: no son límites administrativos, no indican la lealtad de la población y no deben interpretarse con precisión local. Las fechas que comparten fase conservan el mismo esquema territorial: la línea temporal lo indica expresamente. El contorno discontinuo dorado señala las áreas que cambian de control respecto a la etapa cronológica anterior, según estos esquemas; no representa una línea de frente adicional.</p><p>El control avanza entre etapas sin interpolación diaria. Los marcadores señalan localizaciones representativas; las fichas explican el desarrollo completo de cada acontecimiento, incluido su desenlace cuando es posterior a la fecha seleccionada.</p><p>Se representan la península, Baleares y Canarias. El Protectorado español de Marruecos se contextualiza con un marcador, pero sus zonas de control no están cartografiadas.</p><h3>Fuentes para seguir explorando</h3><a class="source-link" href="${sourceUrl}" target="_blank" rel="noopener">Universidad de Warwick · Cronología de la Guerra Civil ↗<span>Modern Records Centre · fechas y acontecimientos</span></a><a class="source-link" href="https://www.ign.es/resources/acercaDe/libDigPub/Mapas_cartografos_Guerra_Civil.pdf" target="_blank" rel="noopener">Instituto Geográfico Nacional · Mapas y cartógrafos ↗<span>Cartografía histórica de 1936–1939</span></a><a class="source-link" href="https://www.uab.cat/es/bibliotecas/coleccion-mapas-guerra-civil" target="_blank" rel="noopener">Universitat Autònoma de Barcelona · Colección de mapas ↗<span>Mapas originales de ambos bandos</span></a><a class="source-link" href="https://encyclopedia.ushmm.org/content/en/article/spanish-civil-war" target="_blank" rel="noopener">United States Holocaust Memorial Museum · Spanish Civil War ↗<span>Contexto histórico e internacional</span></a><p>Base: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© colaboradores de OpenStreetMap</a>. Límites geográficos actuales: <a href="https://github.com/datasets/geo-countries" target="_blank" rel="noopener">Natural Earth / geo-countries</a> (dominio público), simplificados. Visualización con Leaflet. Los límites actuales sirven únicamente de recorte geográfico.</p>`;
function showInfo(kicker,html){pause();$('modal-kicker').textContent=kicker;$('info-content').innerHTML=html;$('info-dialog').showModal();$('info-dialog').scrollTop=0;}
for(const id of ['about','sources','precision'])$(id).onclick=()=>showInfo(id==='about'?'ATLAS DE LA MEMORIA':'FUENTES Y METODOLOGÍA',methodology);
$('close-info').onclick=()=>$('info-dialog').close();$('close-search').onclick=()=>$('search-dialog').close();
for(const id of ['info-dialog','search-dialog'])$(id).addEventListener('click',e=>{if(e.target===$(id)){const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();}});
function jumpToEvent(e){pause();const idx=stages.findIndex(s=>s.event===e.id);setStage(idx<0?stages.findIndex(s=>s.date>=e.end):idx);if(!eventsInView().some(v=>v.id===e.id)){$('past-toggle').checked=true;drawMarkers();renderCards();}if(!map.hasLayer(markers))markers.addTo(map);$('battles-toggle').checked=true;drawMarkers();if(!map.getBounds().contains([e.lat,e.lng]))map.setView([e.lat,e.lng],6);showPopup(e);if(innerWidth<761&&!expanded)$('map').scrollIntoView({behavior:'smooth',block:'center'});}
function search(){const q=normalize($('search-input').value.trim());const results=events.filter(e=>normalize(e.name+' '+e.place+' '+e.type).includes(q));$('search-results').replaceChildren();if(!results.length){$('search-results').innerHTML='<p class="no-results">No hay resultados. Prueba con otra batalla o localidad.</p>';return;}results.forEach(e=>{const b=document.createElement('button');b.className='search-result';b.innerHTML=`<span><strong>${e.name}</strong><small>${e.place} · ${shortDate.format(date(e.start))}</small></span><span>↗</span>`;b.onclick=()=>{$('search-dialog').close();jumpToEvent(e);};$('search-results').append(b);});}
$('search-open').onclick=()=>{pause();$('search-input').value='';search();$('search-dialog').showModal();$('search-input').focus();};$('search-input').oninput=search;
$('chronology').onclick=()=>{showInfo('1936 — 1939','<h2>La guerra, paso a paso.</h2><p>Selecciona una fecha para explorar esa etapa en el mapa.</p><div id="chronology-list"></div>');let year='';stages.forEach((s,i)=>{if(s.date.slice(0,4)!==year){year=s.date.slice(0,4);const h=document.createElement('div');h.className='chronology-year';h.textContent=year;$('chronology-list').append(h);}const b=document.createElement('button');b.className='chronology-row';b.innerHTML=`<span>${shortDate.format(date(s.date)).replace(' '+year,'')}</span><span><strong>${s.title}</strong></span><span>↗</span>`;b.onclick=()=>{$('info-dialog').close();setStage(i);reset();const e=events.find(e=>e.id===s.event);showPopup(e);if(innerWidth<761&&!expanded)$('map').scrollIntoView({behavior:'smooth'});};$('chronology-list').append(b);});};
$('explore').onclick=()=>$('map').scrollIntoView({behavior:'smooth',block:'center'});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
new ResizeObserver(()=>map.invalidateSize()).observe($('map'));
update(false);
try{
 const loadData=async path=>{const r=await fetch(path);if(!r.ok)throw new Error(`${path}: ${r.status}`);return r.json();};
 [territories,changes]=await Promise.all([loadData('./data/territories.json'),loadData('./data/changes.json').catch(error=>{console.error('Stage comparisons:',error);return null;})]);
 drawTerritories();if(tileErrors<4||tileSuccess)$('map-status').textContent='';
}catch(e){$('map-status').textContent='No se han podido cargar los territorios. Recarga la página para reintentarlo.';console.error('Territorial data:',e);}
