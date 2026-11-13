import {characters,places,parts,sources,moments,visibleStops,visibleStopsAtMoment,readingSteps,resolveMoment,lastMomentOfPart} from './novela/data.js?v=7';

export function selectedEpisodes(selectedIds,part){const selected=new Set(selectedIds);return characters.filter(c=>selected.has(c.id)).map(character=>({character,stops:visibleStops(character,part)}));}
export function selectedEpisodesAtMoment(selectedIds,index){const selected=new Set(selectedIds);return characters.filter(c=>selected.has(c.id)).map(character=>({character,stops:visibleStopsAtMoment(character,index)}));}
export function snapMoment(selectedIds,index){const steps=readingSteps(selectedIds);if(!steps.length)return index;return (steps.findLast(m=>m.index<=index)||steps[0]).index;}

export function mountNovelLayer({map,pause,showInfo,onChange=()=>{}}){
 const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
 if(window.matchMedia('(max-width:760px)').matches)$('literary-controls').open=false;
 const requested=params.get('personajes')??params.get('personaje');
 let selectedIds=new Set(requested!==null&&requested!=='todos'?requested.split(',').filter(id=>characters.some(c=>c.id===id)):characters.map(c=>c.id));
 let cursor=snapMoment(selectedIds,resolveMoment(params)),enabled=params.get('novela')!=='0';
 for(const [name,zIndex]of [['novel-routes',410],['novel-markers',625]]){map.createPane(name).style.zIndex=zIndex;}
 const routes=L.layerGroup().addTo(map),markers=L.layerGroup().addTo(map);let markerByPlace=new Map();
 const active=()=>enabled?selectedEpisodesAtMoment(selectedIds,cursor):[];
 const sync=()=>{const url=new URL(location.href);url.searchParams.set('personajes',[...selectedIds].join(','));url.searchParams.set('momento',moments[cursor].id);url.searchParams.set('parte',moments[cursor].part);url.searchParams.set('novela',enabled?'1':'0');url.searchParams.delete('personaje');history.replaceState(null,'',url);};
 function openPlace(placeId){
  const p=places[placeId],m=markerByPlace.get(placeId);if(!m)return;
  const episodes=active().flatMap(({character,stops})=>stops.filter(s=>s.place===placeId).map(stop=>({character,stop})));
  episodes.sort((a,b)=>Number(b.stop.momentIndex===cursor)-Number(a.stop.momentIndex===cursor)||b.stop.momentIndex-a.stop.momentIndex);
  const html=`<div class="popup-type">NOVELA · ${p.precision==='fiction'?'LUGAR FICTICIO':p.precision==='area'?'ÁMBITO APROXIMADO':p.precision==='site'?'EMPLAZAMIENTO DE REFERENCIA':'REFERENCIA URBANA'}</div><h3>${p.name}</h3><p class="popup-date">${p.real}</p>${episodes.map(({character:c,stop:s})=>`<div class="literary-episode ${s.momentIndex===cursor?'current-episode':''}"><strong><span class="literary-dot" style="--person:${c.color}"></span>${c.name} · episodio ${s.index+1}</strong><p>${s.title}. ${s.text}</p><small>${parts[s.part].name} · ${moments[s.momentIndex].when}</small>${s.locationNote?`<p class="literary-precision">${s.locationNote}</p>`:''}<a href="${sources[s.source].url}" target="_blank" rel="noopener">${sources[s.source].title} ↗</a></div>`).join('')}<p class="literary-precision">${p.note||'Coordenadas representativas del lugar. Los trazos unen episodios, sin identificar caminos exactos.'}</p>`;
  m.bindPopup(html,{maxWidth:310,maxHeight:Math.max(100,Math.min(260,map.getSize().y-130)),autoPanPaddingTopLeft:[8,65],autoPanPaddingBottomRight:[8,25]}).openPopup();
 }
 function draw(){
  routes.clearLayers();markers.clearLayers();markerByPlace.clear();const groups=new Map();
  for(const {character:c,stops}of active()){
   // Consecutive episodes at the same coordinate are narrative steps, not extra journeys.
   const coords=stops.map(s=>[places[s.place].lat,places[s.place].lng]).filter((p,i,all)=>!i||p[0]!==all[i-1][0]||p[1]!==all[i-1][1]);
   if(coords.length>1){L.polyline(coords,{pane:'novel-routes',color:'#fffdf4',weight:6.5,opacity:.9,interactive:false}).addTo(routes);L.polyline(coords,{pane:'novel-routes',color:c.color,weight:3.2,opacity:.95,dashArray:'8 6'}).addTo(routes).bindTooltip(`${c.name} · recorrido literario orientativo`,{sticky:true});}
   for(const s of stops){if(!groups.has(s.place))groups.set(s.place,[]);groups.get(s.place).push({character:c,stop:s});}
  }
  for(const [placeId,episodes]of groups){const p=places[placeId],people=[...new Map(episodes.map(e=>[e.character.id,e.character])).values()],isCurrent=episodes.some(e=>e.stop.momentIndex===cursor),color=people.length===1?people[0].color:'#48573f';
   if(p.precision==='area')L.circle([p.lat,p.lng],{pane:'novel-routes',radius:p.radius,color,weight:1,dashArray:'4 6',fillOpacity:.035,interactive:false}).addTo(routes);
   const label=people.length>1?`${people.length}p`:people[0].initial;
   const icon=L.divIcon({className:'literary-marker',iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-16],html:`<span class="${isCurrent?'current-moment-marker':''}" style="--person:${color}">${label}</span>`});
   const m=L.marker([p.lat,p.lng],{pane:'novel-markers',icon,zIndexOffset:isCurrent?1000:0,title:`${isCurrent?'Episodio activo · ':''}${p.name} · ${people.map(c=>c.name).join(', ')}`,keyboard:true}).addTo(markers);m.on('click',()=>{pause();openPlace(placeId);});markerByPlace.set(placeId,m);
  }
  const steps=readingSteps(selectedIds),part=moments[cursor].part;
  $('novel-toggle').checked=enabled;$('novel-count').textContent=enabled?`${selectedIds.size} ${selectedIds.size===1?'activo':'activos'}`:'Ocultos';$('novel-part').value=part;
  for(const option of $('novel-part').options)option.disabled=!steps.some(m=>m.part===Number(option.value));
  document.querySelectorAll('[data-character]').forEach(input=>input.checked=selectedIds.has(input.dataset.character));
  $('novel-legend').hidden=!enabled||!selectedIds.size;document.querySelector('.novel-legend-title').textContent=`NOVELA · ${parts[part].name}`;
  $('novel-legend-items').innerHTML=active().map(({character:c})=>`<span><span class="literary-dot" style="--person:${c.color}"></span>${c.name}</span>`).join('');$('novel-fit').disabled=!enabled||!selectedIds.size;
  sync();onChange({moment:moments[cursor],steps,position:Math.max(0,steps.findIndex(m=>m.index===cursor)),enabled});
 }
 function fit(){const coords=active().flatMap(({stops})=>stops.map(s=>[places[s.place].lat,places[s.place].lng]));if(!coords.length)return;const bounds=L.latLngBounds(coords);if(bounds.getNorthEast().equals(bounds.getSouthWest()))map.setView(coords[0],7);else map.fitBounds(bounds,{padding:[45,55],maxZoom:8});}
 function follow(){if(!$('follow-toggle').checked||!enabled)return;const episode=active().flatMap(e=>e.stops).find(s=>s.momentIndex===cursor);if(!episode)return;const p=places[episode.place];map.setView([p.lat,p.lng],p.precision==='site'?13:p.precision==='area'?7:8);}
 function setCursor(index){cursor=snapMoment(selectedIds,index);map.closePopup();draw();follow();}
 for(const [i,p]of parts.entries()){const option=document.createElement('option');option.value=i;option.textContent=`${p.name} · ${p.period}`;$('novel-part').append(option);}
 for(const c of characters){const label=document.createElement('label');label.className='character-switch';label.innerHTML=`<input type="checkbox" data-character="${c.id}" checked><span class="literary-dot" style="--person:${c.color}"></span><span>${c.name}</span>`;label.querySelector('input').onchange=e=>{pause();enabled=true;if(e.target.checked)selectedIds.add(c.id);else selectedIds.delete(c.id);cursor=snapMoment(selectedIds,cursor);draw();};$('novel-characters').append(label);}
 $('novel-all').onclick=()=>{pause();enabled=true;selectedIds=new Set(characters.map(c=>c.id));draw();};$('novel-none').onclick=()=>{pause();selectedIds.clear();draw();};
 $('novel-toggle').onchange=()=>{pause();enabled=$('novel-toggle').checked;draw();};$('novel-part').onchange=()=>{pause();setCursor(lastMomentOfPart(Number($('novel-part').value)));};$('novel-fit').onclick=fit;
 $('novel-sources').onclick=()=>showInfo('LA NOVELA SOBRE EL MAPA',`<h2>Un recorrido, episodio a episodio.</h2><p>Selección de ${characters.reduce((n,c)=>n+c.stops.length,0)} episodios de seis personajes, organizados en ${moments.length} momentos de lectura. Las casillas permiten combinar personajes en el mismo mapa literario. El mapa de la Guerra Civil permanece separado.</p><p>La barra avanza por los pasos de los personajes seleccionados. El orden dentro de cada parte es orientativo: las tramas paralelas no se presuponen simultáneas. Los años y las referencias temporales proceden del marco de la narración y de las guías; no son una datación diaria contrastada de los desplazamientos. Los pasos pueden representar permanencia en un lugar, sin viaje nuevo.</p><p>Recorridos basados en fuentes públicas, no una concordancia completa cotejada con el texto íntegro. Jándula toma Quesada como referencia. Los trazos unen episodios sin atribuir caminos intermedios. La torca y el pajar no se localizan en un punto concreto. Cada ficha enlaza su fuente.</p>${Object.values(sources).map(s=>`<a class="source-link" href="${s.url}" target="_blank" rel="noopener">${s.title} ↗<span>${s.kind}</span></a>`).join('')}`);
 draw();return {draw,fit,getPart(){return moments[cursor].part;},setPart(part){setCursor(lastMomentOfPart(part));},getSteps(){return readingSteps(selectedIds);},getPosition(){return Math.max(0,readingSteps(selectedIds).findIndex(m=>m.index===cursor));},setPosition(position){const steps=readingSteps(selectedIds);if(steps.length)setCursor(steps[Math.max(0,Math.min(steps.length-1,position))].index);}};
}
