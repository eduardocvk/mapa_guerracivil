import {characters,places,parts,sources,visibleStops} from './novela/data.js';

export function selectedEpisodes(selectedIds,part){
 const selected=new Set(selectedIds);
 return characters.filter(c=>selected.has(c.id)).map(character=>({character,stops:visibleStops(character,part)}));
}

export function mountNovelLayer({map,pause,showInfo,onChange=()=>{}}){
 const $=id=>document.getElementById(id);
 const params=new URLSearchParams(location.search);
 if(window.matchMedia('(max-width:760px)').matches)$('literary-controls').open=false;
 const supplied=params.has('personajes');
 let selectedIds=new Set(supplied?(params.get('personajes')||'').split(',').filter(id=>characters.some(c=>c.id===id)):characters.map(c=>c.id));
 let part=Math.max(0,Math.min(parts.length-1,Number(params.get('parte')??3)||0));
 let enabled=params.get('novela')!=='0';
 for(const [name,zIndex]of [['novel-routes',410],['novel-markers',625]]){const pane=map.createPane(name);pane.style.zIndex=zIndex;}
 const routes=L.layerGroup().addTo(map),markers=L.layerGroup().addTo(map);
 let markerByPlace=new Map();
 const active=()=>enabled?selectedEpisodes(selectedIds,part):[];
 const sync=()=>{const url=new URL(location.href);url.searchParams.set('personajes',[...selectedIds].join(','));url.searchParams.set('parte',part);url.searchParams.set('novela',enabled?'1':'0');history.replaceState(null,'',url);};
 function openPlace(placeId){
  const p=places[placeId],m=markerByPlace.get(placeId);if(!m)return;
  const episodes=active().flatMap(({character,stops})=>stops.filter(s=>s.place===placeId).map(stop=>({character,stop})));
  const html=`<div class="popup-type">NOVELA · ${p.precision==='fiction'?'LUGAR FICTICIO':p.precision==='area'?'ÁMBITO APROXIMADO':'REFERENCIA URBANA'}</div><h3>${p.name}</h3><p class="popup-date">${p.real}</p>${episodes.map(({character:c,stop:s})=>`<div class="literary-episode"><strong><span class="literary-dot" style="--person:${c.color}"></span>${c.name} · ${parts[s.part].name} · ${s.index+1}</strong><p>${s.title}. ${s.text}</p><a href="${sources[s.source].url}" target="_blank" rel="noopener">${sources[s.source].title} ↗</a></div>`).join('')}<p class="literary-precision">${p.note||'Coordenadas representativas del lugar. Los trazos unen episodios, sin identificar caminos exactos.'}</p>`;
  m.bindPopup(html,{maxWidth:310,maxHeight:Math.max(100,Math.min(260,map.getSize().y-130)),autoPanPaddingTopLeft:[8,65],autoPanPaddingBottomRight:[8,25]}).openPopup();
 }
 function draw(){
  routes.clearLayers();markers.clearLayers();markerByPlace.clear();const groups=new Map();
  for(const {character:c,stops}of active()){
   if(stops.length>1){const coords=stops.map(s=>[places[s.place].lat,places[s.place].lng]);
    L.polyline(coords,{pane:'novel-routes',color:'#fffdf4',weight:6.5,opacity:.9,interactive:false}).addTo(routes);
    L.polyline(coords,{pane:'novel-routes',color:c.color,weight:3.2,opacity:.95,dashArray:'8 6'}).addTo(routes).bindTooltip(`${c.name} · recorrido literario orientativo`,{sticky:true});
   }
   for(const s of stops){if(!groups.has(s.place))groups.set(s.place,[]);groups.get(s.place).push({character:c,stop:s});}
  }
  for(const [placeId,episodes]of groups){const p=places[placeId],people=[...new Map(episodes.map(e=>[e.character.id,e.character])).values()];const color=people.length===1?people[0].color:'#48573f';
   if(p.precision==='area')L.circle([p.lat,p.lng],{pane:'novel-routes',radius:p.radius,color,weight:1,dashArray:'4 6',fillOpacity:.035,interactive:false}).addTo(routes);
   const label=people.length>1?`${people.length}p`:people[0].initial;
   const icon=L.divIcon({className:'literary-marker',iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-16],html:`<span style="--person:${color}">${label}</span>`});
   const m=L.marker([p.lat,p.lng],{pane:'novel-markers',icon,title:`Novela · ${p.name} · ${people.map(c=>c.name).join(', ')}`,keyboard:true}).addTo(markers);m.on('click',()=>{pause();openPlace(placeId);});markerByPlace.set(placeId,m);
  }
  $('novel-toggle').checked=enabled;
  $('novel-count').textContent=enabled?`${selectedIds.size} ${selectedIds.size===1?'activo':'activos'}`:'Ocultos';
  $('novel-part').value=part;
  document.querySelectorAll('[data-character]').forEach(input=>{input.checked=selectedIds.has(input.dataset.character);});
  $('novel-legend').hidden=!enabled||!selectedIds.size;
  document.querySelector('.novel-legend-title').textContent=`NOVELA · ${parts[part].name} · ${parts[part].period}`;
  $('novel-legend-items').innerHTML=active().map(({character:c})=>`<span><span class="literary-dot" style="--person:${c.color}"></span>${c.name}</span>`).join('');
  $('novel-fit').disabled=!enabled||!selectedIds.size;
  sync();onChange(part);
 }
 function fit(){const coords=active().flatMap(({stops})=>stops.map(s=>[places[s.place].lat,places[s.place].lng]));if(!coords.length)return;const bounds=L.latLngBounds(coords);if(bounds.getNorthEast().equals(bounds.getSouthWest()))map.setView(coords[0],7);else map.fitBounds(bounds,{padding:[45,55],maxZoom:8});}
 for(const [i,p]of parts.entries()){const option=document.createElement('option');option.value=i;option.textContent=`${p.name} · ${p.period}`;$('novel-part').append(option);}
 for(const c of characters){const label=document.createElement('label');label.className='character-switch';label.innerHTML=`<input type="checkbox" data-character="${c.id}" checked><span class="literary-dot" style="--person:${c.color}"></span><span>${c.name}</span>`;const input=label.querySelector('input');input.onchange=()=>{pause();enabled=true;if(input.checked)selectedIds.add(c.id);else selectedIds.delete(c.id);draw();};$('novel-characters').append(label);}
 $('novel-all').onclick=()=>{pause();enabled=true;selectedIds=new Set(characters.map(c=>c.id));draw();};
 $('novel-none').onclick=()=>{pause();selectedIds.clear();draw();};
 $('novel-toggle').onchange=()=>{enabled=$('novel-toggle').checked;draw();};
 $('novel-part').onchange=()=>{pause();part=Number($('novel-part').value);draw();};$('novel-fit').onclick=fit;
 $('novel-sources').onclick=()=>showInfo('LA NOVELA SOBRE EL MAPA',`<h2>Los caminos de los Ardolento.</h2><p>Selección de seis personajes y episodios de <em>La península de las casas vacías</em>, de David Uclés. Las casillas permiten combinar cualquier grupo de personajes en este mismo mapa literario. El mapa de la Guerra Civil está disponible en una página independiente.</p><p>El control temporal recorre las partes del libro. Los colores identifican personajes. Las fuentes consultadas no permiten asignar un día exacto a cada episodio.</p><p>Recorridos orientativos basados en fuentes públicas, no una concordancia completa cotejada con el texto íntegro. Jándula toma Quesada como referencia. Los trazos unen episodios sin atribuir caminos intermedios; los círculos indican ámbitos regionales aproximados. Cada ficha enlaza su fuente.</p>${Object.values(sources).map(s=>`<a class="source-link" href="${s.url}" target="_blank" rel="noopener">${s.title} ↗<span>${s.kind}</span></a>`).join('')}`);
 draw();return {draw,fit,setPart(value){part=Math.max(0,Math.min(4,value));draw();},getPart(){return part;}};
}
