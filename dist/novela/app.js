import {mountNovelLayer} from '../novel-layer.js?v=7';
import {parts} from './data.js?v=7';
const $=id=>document.getElementById(id);
let timer,playing=false,expanded=false,scrollBefore=0,controlsWereOpen=true;
function pause(){clearInterval(timer);playing=false;$('play').textContent='▶';$('play').setAttribute('aria-label','Reproducir el recorrido');}
function showInfo(kicker,html){pause();$('modal-kicker').textContent=kicker;$('info-content').innerHTML=html;$('info-dialog').showModal();}
const map=L.map('map',{zoomControl:false,zoomSnap:.25,zoomDelta:.5,minZoom:4,maxZoom:14,preferCanvas:true}).setView([40.1,-3.1],6);
let loaded=0,failed=0;
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · Recorridos literarios orientativos'}).addTo(map).on('tileload',()=>{loaded++;$('map-status').textContent='';}).on('tileerror',()=>{failed++;if(failed>3&&!loaded)$('map-status').textContent='No se ha podido cargar el mapa base. Los recorridos y episodios siguen disponibles.';});
let timelineState={steps:[],position:0,enabled:true,moment:null};
function updateTimeline(state){
 timelineState=state;const count=state.steps.length,disabled=!count||!state.enabled;
 $('moment-slider').max=Math.max(0,count-1);$('moment-slider').value=state.position;$('moment-slider').disabled=disabled;
 $('moment-slider').style.background=`linear-gradient(to right,#a95337 ${state.position/Math.max(1,count-1)*100}%,#d8dfcd ${state.position/Math.max(1,count-1)*100}%)`;
 $('moment-slider').setAttribute('aria-valuetext',count?`${state.position+1} de ${count}. ${state.moment.title}. ${state.moment.when}`:'Sin personajes seleccionados');
 $('reading-counter').textContent=count?`PASO ${state.position+1} DE ${count}`:'ACTIVA UN PERSONAJE';
 $('timeline-date').textContent=count?state.moment.title:'Selecciona un personaje';
 $('front-note').textContent=!state.enabled?'Recorridos ocultos':count?`${parts[state.moment.part].name} · ${state.moment.when}`:'Cada casilla añade sus propios pasos de lectura.';
 $('moment-picker').disabled=disabled;$('previous').disabled=disabled||state.position===0;$('next').disabled=disabled||state.position===count-1;$('play').disabled=disabled;
 document.querySelectorAll('[data-part]').forEach(b=>{b.classList.toggle('active',count&&Number(b.dataset.part)===state.moment.part);b.disabled=disabled||!state.steps.some(m=>m.part===Number(b.dataset.part));});
}
const layer=mountNovelLayer({map,pause,showInfo,onChange:updateTimeline});layer.fit();
for(const [i,p]of parts.entries()){const b=document.createElement('button');b.textContent=p.name;b.dataset.part=i;b.onclick=()=>{pause();layer.setPart(i);};$('part-labels').append(b);}updateTimeline(timelineState);
$('moment-slider').oninput=e=>{pause();layer.setPosition(Number(e.target.value));};
$('previous').onclick=()=>{pause();layer.setPosition(layer.getPosition()-1);};$('next').onclick=()=>{pause();layer.setPosition(layer.getPosition()+1);};
$('play').onclick=()=>{if(playing){pause();return;}if(layer.getPosition()===layer.getSteps().length-1)layer.setPosition(0);playing=true;$('play').textContent='Ⅱ';$('play').setAttribute('aria-label','Pausar el recorrido');timer=setInterval(()=>{if(layer.getPosition()<layer.getSteps().length-1)layer.setPosition(layer.getPosition()+1);else pause();},3500);};
$('moment-picker').onclick=()=>{
 showInfo('LOS PASOS DEL RECORRIDO','<h2>Elige un episodio.</h2><p>Estos pasos corresponden a los personajes activos. El orden entre tramas paralelas es orientativo, sin una datación diaria confirmada.</p><div id="reading-list"></div>');
 timelineState.steps.forEach((moment,i)=>{const b=document.createElement('button');b.className='reading-row';b.innerHTML=`<span>${i+1}</span><span><strong>${moment.title}</strong><small>${parts[moment.part].name} · ${moment.when}</small></span><span>↗</span>`;if(i===timelineState.position)b.setAttribute('aria-current','step');b.onclick=()=>{$('info-dialog').close();layer.setPosition(i);};$('reading-list').append(b);});
};
$('zoom-in').onclick=()=>map.zoomIn();$('zoom-out').onclick=()=>map.zoomOut();$('fit-map').onclick=()=>layer.fit();
$('layers-open').onclick=()=>{$('layers-panel').hidden=!$('layers-panel').hidden;$('layers-open').setAttribute('aria-expanded',String(!$('layers-panel').hidden));};document.addEventListener('click',e=>{if(!e.target.closest('#layers-panel')&&!e.target.closest('#layers-open')){$('layers-panel').hidden=true;$('layers-open').setAttribute('aria-expanded','false');}});
$('legend-toggle').onclick=()=>{$('map-legend').hidden=!$('map-legend').hidden;$('legend-toggle').textContent=$('map-legend').hidden?'Mostrar leyendas':'Ocultar leyendas';$('legend-toggle').setAttribute('aria-expanded',String(!$('map-legend').hidden));};
const outside=[document.querySelector('header'),document.querySelector('.intro'),document.querySelector('footer')];
function expand(value){pause();expanded=value;map.closePopup();if(value){scrollBefore=scrollY;controlsWereOpen=$('literary-controls').open;$('literary-controls').open=false;document.body.style.top=`-${scrollBefore}px`;document.body.classList.add('map-expanded');$('atlas').classList.add('is-expanded');$('atlas').setAttribute('role','dialog');$('atlas').setAttribute('aria-modal','true');}else{$('literary-controls').open=controlsWereOpen;$('atlas').classList.remove('is-expanded');$('atlas').removeAttribute('role');$('atlas').removeAttribute('aria-modal');document.body.classList.remove('map-expanded');document.body.style.top='';window.scrollTo({top:scrollBefore,behavior:'instant'});}outside.forEach(el=>el.inert=value);$('expand-map').setAttribute('aria-expanded',String(value));$('expand-map').setAttribute('aria-label',value?'Salir de la vista ampliada':'Ampliar el mapa');$('expand-icon').textContent=value?'×':'⛶';$('expand-label').textContent=value?'Volver':'Ampliar';$('layers-panel').hidden=true;requestAnimationFrame(()=>{map.invalidateSize({pan:false});$('expand-map').focus({preventScroll:true});});}
$('expand-map').onclick=()=>expand(!expanded);document.addEventListener('keydown',e=>{if(!expanded||$('info-dialog').open)return;if(e.key==='Escape'){e.preventDefault();expand(false);}if(e.key==='Tab'){const focusable=[...$('atlas').querySelectorAll('summary,select,button:not(:disabled),input,a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0]?.focus();}}});
$('sources-bottom').onclick=()=>$('novel-sources').click();$('close-info').onclick=()=>$('info-dialog').close();$('info-dialog').addEventListener('click',e=>{if(e.target!==$('info-dialog'))return;const r=$('info-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('info-dialog').close();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});new ResizeObserver(()=>map.invalidateSize()).observe($('map'));
