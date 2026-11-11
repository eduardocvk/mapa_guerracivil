import {characters,places,parts,sources,visibleStops,visibleCharacters} from './data.js';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let person=characters.some(c=>c.id===params.get('personaje'))||params.get('personaje')==='todos'?params.get('personaje'):'odisto';
let part=Math.max(0,Math.min(4,Number(params.get('parte')??3)||0));
let playing=false,timer,expanded=false,scrollBeforeExpand=0,activeEpisode=null;
const map=L.map('map',{zoomControl:false,zoomSnap:.25,zoomDelta:.5,minZoom:4,maxZoom:14,preferCanvas:true}).setView([40.1,-3.1],6);
let loadedTiles=0,failedTiles=0;
const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · Mapa literario orientativo'}).addTo(map);
tiles.on('tileload',()=>{loadedTiles++;$('map-status').textContent='';});
tiles.on('tileerror',()=>{failedTiles++;if(failedTiles>3&&!loadedTiles)$('map-status').textContent='No se ha podido cargar el mapa base. Los episodios y recorridos siguen disponibles.';});
L.control.scale({imperial:false,maxWidth:80}).addTo(map);
const routeLayer=L.layerGroup().addTo(map),areaLayer=L.layerGroup().addTo(map),markerLayer=L.layerGroup().addTo(map);
let markerByPlace=new Map();
const chosen=()=>visibleCharacters(person);
const episodeKey=(c,s)=>`${c.id}-${s.index}`;
function pause(){clearInterval(timer);playing=false;$('play').textContent='▶';$('play').setAttribute('aria-label','Reproducir el recorrido');}
function play(){if(part===4)setPart(0);playing=true;$('play').textContent='Ⅱ';$('play').setAttribute('aria-label','Pausar el recorrido');timer=setInterval(()=>{if(part<4)setPart(part+1);else pause();},4200);}
function syncUrl(){const url=new URL(location.href);url.searchParams.set('personaje',person);url.searchParams.set('parte',part);history.replaceState(null,'',url);}
function fitRoute(){
 const coords=chosen().flatMap(c=>visibleStops(c,part).map(s=>[places[s.place].lat,places[s.place].lng]));
 if(!coords.length)return;
 const bounds=L.latLngBounds(coords);
 if(bounds.getNorthEast().equals(bounds.getSouthWest()))map.setView(coords[0],7);
 else map.fitBounds(bounds,{paddingTopLeft:[40,95],paddingBottomRight:[55,55],maxZoom:8});
}
function chooseCharacter(id){pause();person=id;activeEpisode=null;render();fitRoute();}
function setPart(n){part=Math.max(0,Math.min(4,n));activeEpisode=null;map.closePopup();render();fitRoute();}
function popup(placeId){
 const point=places[placeId],marker=markerByPlace.get(placeId);if(!marker)return;
 const episodes=chosen().flatMap(c=>visibleStops(c,part).filter(s=>s.place===placeId).map(s=>({c,s})));
 const html=`<span class="eyebrow">${point.precision==='fiction'?'GEOGRAFÍA DE FICCIÓN':point.precision==='area'?'ÁMBITO REGIONAL APROXIMADO':'REFERENCIA URBANA'}</span><h3>${point.name}</h3><p class="popup-sub">${point.real}</p>${episodes.map(({c,s})=>`<div class="episode"><span class="person-name"><span class="person-dot" style="--person:${c.color}"></span>${c.name} · ${parts[s.part].name} · ${s.index+1}</span><strong>${s.title}</strong><p>${s.text}</p><a href="${sources[s.source].url}" target="_blank" rel="noopener">${sources[s.source].title} ↗</a></div>`).join('')}<div class="precision-note">${point.note||'Coordenadas representativas del lugar, sin precisión sobre el punto exacto del episodio.'}</div>`;
 marker.bindPopup(html,{maxWidth:310,maxHeight:Math.max(100,Math.min(260,map.getSize().y-160)),autoPanPaddingTopLeft:[map.getSize().x<400?8:30,map.getSize().y<340?55:115],autoPanPaddingBottomRight:[map.getSize().x<400?8:40,35]}).openPopup();
}
function openStop(c,s){pause();activeEpisode=episodeKey(c,s);if(!$('markers-toggle').checked){$('markers-toggle').checked=true;drawMap();}renderProfile();if(!map.getBounds().contains([places[s.place].lat,places[s.place].lng]))map.panTo([places[s.place].lat,places[s.place].lng]);popup(s.place);}
function drawMap(){
 routeLayer.clearLayers();areaLayer.clearLayers();markerLayer.clearLayers();markerByPlace.clear();
 const groups=new Map();
 for(const c of chosen()){
  const stops=visibleStops(c,part);
  if($('routes-toggle').checked && stops.length>1){
   // Straight links express sequence only; they are not navigational routes.
   L.polyline(stops.map(s=>[places[s.place].lat,places[s.place].lng]),{color:c.color,weight:person==='todos'?2.6:3.3,opacity:person==='todos'?.65:.85,dashArray:'7 7',lineCap:'round'}).addTo(routeLayer).bindTooltip(`${c.name} · conexión orientativa`,{sticky:true});
  }
  for(const s of stops){if(!groups.has(s.place))groups.set(s.place,[]);groups.get(s.place).push({c,s});}
 }
 for(const [placeId,episodes]of groups){
  const p=places[placeId],people=[...new Map(episodes.map(e=>[e.c.id,e.c])).values()];
  const color=people.length===1?people[0].color:'#515f48';
  if($('areas-toggle').checked&&p.precision==='area')L.circle([p.lat,p.lng],{radius:p.radius,color,weight:1,dashArray:'4 5',fillColor:color,fillOpacity:.06,interactive:false}).addTo(areaLayer);
  if(!$('markers-toggle').checked)continue;
  const label=person==='todos'?(people.length>1?`${people.length}p`:people[0].initial):episodes.map(e=>e.s.index+1).join('·');
  const isActive=episodes.some(({c,s})=>episodeKey(c,s)===activeEpisode);
  const icon=L.divIcon({className:'place-icon',iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-16],html:`<span class="place-badge ${p.precision==='area'?'region':''} ${isActive?'is-active':''}" style="--person:${color}">${label}</span>`});
  const m=L.marker([p.lat,p.lng],{icon,title:`${p.name} · ${people.map(c=>c.name).join(', ')}`,keyboard:true}).addTo(markerLayer);
  m.on('click',()=>{pause();activeEpisode=episodeKey(episodes[0].c,episodes[0].s);renderProfile();popup(placeId);});
  markerByPlace.set(placeId,m);
 }
}
function renderProfile(){
 const c=person==='todos'?null:characters.find(c=>c.id===person);
 document.documentElement.style.setProperty('--accent',c?.color||'#6a7756');
 $('profile-initial').textContent=c?.initial||'6';$('profile-name').textContent=c?`${c.name} ${c.id==='pablito'?'':c.id==='jacobo'||c.id==='angel'?'':'Ardolento'}`.trim():'Los Ardolento';
 $('profile-role').textContent=c?.role||'UNA FAMILIA · SEIS MIRADAS';
 $('profile-bio').textContent=c?c.bio:'Los colores identifican a cada personaje. Las rutas se cruzan en los lugares compartidos.';
 $('route-note').textContent=c?.note||'Selección de episodios; los trazos no reconstruyen caminos exactos. Cada ficha incluye su fuente.';
 const count=chosen().reduce((sum,c)=>sum+visibleStops(c,part).length,0);
 $('stop-count').textContent=`${count} ${count===1?'episodio':'episodios'}`;
 $('stop-list').replaceChildren();
 if(!c){for(const character of characters){const b=document.createElement('button');b.className='compare-person';b.innerHTML=`<span><span class="person-dot" style="--person:${character.color}"></span>${character.name}</span><small>${visibleStops(character,part).length} hitos ↗</small>`;b.onclick=()=>chooseCharacter(character.id);$('stop-list').append(b);}return;}
 for(const s of visibleStops(c,part)){
  const p=places[s.place],b=document.createElement('button');b.className=`stop ${activeEpisode===episodeKey(c,s)?'selected':''}`;
  b.innerHTML=`<span class="stop-number">${s.index+1}</span><span><strong>${p.name}</strong><small>${parts[s.part].name} · ${s.title}</small></span><span class="stop-arrow">↗</span>`;
  b.onclick=()=>openStop(c,s);$('stop-list').append(b);
 }
}
function render(){
 $('part-slider').value=part;$('part-slider').setAttribute('aria-valuetext',`${parts[part].name}, ${parts[part].period}`);
 $('part-slider').style.background=`linear-gradient(to right, var(--rust) ${part/4*100}%, #d8dfcd ${part/4*100}%)`;
 $('part-title').textContent=`${parts[part].name} · ${parts[part].period}`;
 const fresh=chosen().reduce((sum,c)=>sum+c.stops.filter(s=>s.part===part).length,0);
 $('part-caption').textContent=fresh?`${fresh} ${fresh===1?'episodio situado':'episodios situados'} en esta parte`:'Sin nuevos lugares situados en esta parte';
 $('previous').disabled=part===0;$('next').disabled=part===4;
 document.querySelectorAll('[data-person]').forEach(b=>{b.classList.toggle('active',b.dataset.person===person);b.setAttribute('aria-pressed',String(b.dataset.person===person));});
 document.querySelectorAll('[data-part]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.part)===part);b.setAttribute('aria-current',Number(b.dataset.part)===part?'step':'false');});
 $('compare').setAttribute('aria-pressed',String(person==='todos'));$('expanded-character').value=person;
 $('legend-characters').innerHTML=chosen().map(c=>`<span class="legend-person"><span class="person-dot" style="--person:${c.color}"></span>${c.name}</span>`).join('');
 renderProfile();drawMap();syncUrl();
}
for(const c of characters){const b=document.createElement('button');b.className='character-button';b.dataset.person=c.id;b.innerHTML=`<span class="person-dot" style="--person:${c.color}"></span>${c.name}`;b.onclick=()=>chooseCharacter(c.id);$('characters').append(b);const o=document.createElement('option');o.value=c.id;o.textContent=c.name;$('expanded-character').append(o);}
const allOption=document.createElement('option');allOption.value='todos';allOption.textContent='Todos los personajes';$('expanded-character').append(allOption);$('expanded-character').onchange=e=>chooseCharacter(e.target.value);
for(const [i,p]of parts.entries()){const b=document.createElement('button');b.dataset.part=i;b.textContent=p.name;b.style.left=`${i*25}%`;b.style.transform=i===4?'translateX(-100%)':i?'translateX(-50%)':'none';b.onclick=()=>{pause();setPart(i);};$('part-labels').append(b);}
$('compare').onclick=()=>chooseCharacter(person==='todos'?'odisto':'todos');
$('part-slider').oninput=e=>{pause();setPart(Number(e.target.value));};$('previous').onclick=()=>{pause();setPart(part-1);};$('next').onclick=()=>{pause();setPart(part+1);};$('play').onclick=()=>playing?pause():play();
$('fit-route').onclick=fitRoute;$('zoom-in').onclick=()=>map.zoomIn();$('zoom-out').onclick=()=>map.zoomOut();
for(const id of ['routes-toggle','markers-toggle','areas-toggle'])$(id).onchange=drawMap;
$('layers-open').onclick=()=>{$('layers-panel').hidden=!$('layers-panel').hidden;$('layers-open').setAttribute('aria-expanded',String(!$('layers-panel').hidden));};
document.addEventListener('click',e=>{if(!e.target.closest('#layers-panel')&&!e.target.closest('#layers-open')){$('layers-panel').hidden=true;$('layers-open').setAttribute('aria-expanded','false');}});
$('legend-toggle').onclick=()=>{$('legend').hidden=!$('legend').hidden;$('legend-toggle').textContent=$('legend').hidden?'Mostrar leyendas':'Ocultar leyendas';$('legend-toggle').setAttribute('aria-expanded',String(!$('legend').hidden));$('map-wrap').classList.toggle('legends-hidden',$('legend').hidden);};
const workspace=$('workspace'),outside=[document.querySelector('header'),document.querySelector('.intro'),document.querySelector('footer')];
function expand(value){pause();map.closePopup();expanded=value;if(value){scrollBeforeExpand=scrollY;document.body.style.top=`-${scrollBeforeExpand}px`;document.body.classList.add('map-expanded');workspace.classList.add('expanded');workspace.setAttribute('role','dialog');workspace.setAttribute('aria-modal','true');}else{workspace.classList.remove('expanded');workspace.removeAttribute('role');workspace.removeAttribute('aria-modal');document.body.classList.remove('map-expanded');document.body.style.top='';window.scrollTo({top:scrollBeforeExpand,behavior:'instant'});}outside.forEach(el=>{el.inert=value;});$('expand').setAttribute('aria-expanded',String(value));$('expand').setAttribute('aria-label',value?'Salir de la vista ampliada':'Ampliar el mapa');$('expand-icon').textContent=value?'×':'⛶';$('expand-label').textContent=value?'Volver':'Ampliar';$('layers-panel').hidden=true;$('layers-open').setAttribute('aria-expanded','false');requestAnimationFrame(()=>{map.invalidateSize({pan:false});$('expand').focus({preventScroll:true});});}
$('expand').onclick=()=>expand(!expanded);
document.addEventListener('keydown',e=>{if(!expanded||$('sources-dialog').open)return;if(e.key==='Escape'){e.preventDefault();expand(false);}if(e.key==='Tab'){const focusable=[...workspace.querySelectorAll('button:not(:disabled),input,select,a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
$('source-list').innerHTML=Object.values(sources).map(s=>`<a class="source" href="${s.url}" target="_blank" rel="noopener">${s.title} ↗<small>${s.kind}</small></a>`).join('');
for(const id of ['sources-open','sources-bottom'])$(id).onclick=()=>{pause();$('sources-dialog').showModal();};$('close-sources').onclick=()=>$('sources-dialog').close();$('sources-dialog').addEventListener('click',e=>{if(e.target!==$('sources-dialog'))return;const r=$('sources-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('sources-dialog').close();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
new ResizeObserver(()=>map.invalidateSize()).observe($('map'));
render();fitRoute();
