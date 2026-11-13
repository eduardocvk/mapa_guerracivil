import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {characters,places,parts,sources,visibleStops,visibleCharacters,moments,visibleStopsAtMoment,readingSteps,resolveMoment,lastMomentOfPart} from '../dist/novela/data.js';
assert.equal(characters.length,6);
assert.equal(new Set(characters.map(c=>c.id)).size,characters.length);
assert.equal(parts.length,5);
for(const character of characters){
 assert(sources[character.source],`Profile source: ${character.id}`);
 assert.equal(character.stops[0].place,'jandula');
 for(const [i,s]of character.stops.entries()){
  assert(places[s.place],`Known location: ${s.place}`);assert(sources[s.source],`Source for ${character.id}/${i}`);
  assert(Number.isInteger(s.part)&&s.part>=0&&s.part<parts.length);
  if(i)assert(s.part>=character.stops[i-1].part,`Chronological reading order for ${character.id}`);
 }
 for(let part=0;part<parts.length;part++){
  const stops=visibleStops(character,part);
  assert(stops.every(s=>s.part<=part),'Future episodes must not be shown');
  assert.deepEqual(stops.map(s=>s.index),Array.from({length:stops.length},(_,i)=>i),'Keep episode indices stable across filters');
 }
}
for(const [id,p]of Object.entries(places)){
 assert(p.lat>=36&&p.lat<=44&&p.lng>=-10&&p.lng<=4,`Location within geographic scope: ${id}`);
 assert(['fiction','city','area','site'].includes(p.precision));
 if(p.precision==='area')assert(p.radius>0,'Regional locations must include uncertainty radius');
}
assert.equal(places.jandula.precision,'fiction');
assert.equal(places.norte.precision,'area');
assert.equal(new Set(characters.find(c=>c.id==='angeles').stops.map(s=>s.place)).size,1,'Do not invent travelling locations for Ángeles');
assert.deepEqual([0,1,2,3,4].map(p=>visibleStops(characters[0],p).length),[1,2,6,11,12]);
assert.equal(visibleCharacters('todos').length,6);assert.equal(visibleCharacters('jose')[0].name,'José');
for(const source of Object.values(sources))assert(source.url.startsWith('https://'));
// Every subset is supported: characters are independent layers, not exclusive tabs.
const {selectedEpisodes,selectedEpisodesAtMoment,snapMoment}=await import('../dist/novel-layer.js');
for(let mask=0;mask<(1<<characters.length);mask++){
 const ids=characters.filter((_,i)=>mask&(1<<i)).map(c=>c.id);
 for(let part=0;part<parts.length;part++){
  const episodes=selectedEpisodes(ids,part);
  assert.deepEqual(episodes.map(e=>e.character.id),ids);
  assert(episodes.every(e=>e.stops.every(s=>s.part<=part)));
 }
}
assert.deepEqual(selectedEpisodes([],3),[],'All routes can be disabled');
assert.deepEqual(selectedEpisodes(['jose','pablito'],3).map(e=>e.character.id),['jose','pablito']);
const html=readFileSync(new URL('../dist/novela/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../dist/novel-layer.js',import.meta.url),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);ids.push('reading-list');
for(const m of app.matchAll(/\$\('([^']+)'\)/g))assert(ids.includes(m[1]),`Missing DOM control: ${m[1]}`);
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 if(m[1].startsWith('http'))continue;
 assert(existsSync(resolve(dirname(new URL('../dist/novela/index.html',import.meta.url).pathname),m[1].split('?')[0])),`Local resource: ${m[1]}`);
}
const historical=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const historicalApp=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
assert(historical.includes('id="territories-toggle"'));
assert(!historical.includes('id="novel-characters"'),'History must have its own map');
assert(!historicalApp.includes('mountNovelLayer'),'Literary routes must not be mounted on history');
assert(html.includes('id="novel-characters"')&&html.includes('id="map"'));
assert(!html.includes('id="territories-toggle"'),'Novel must have its own map');
assert(!html.includes('location.replace'),'Literary page must not redirect to history');
const novelApp=readFileSync(new URL('../dist/novela/app.js',import.meta.url),'utf8');
for(const m of novelApp.matchAll(/\$\('([^']+)'\)/g))assert(ids.includes(m[1]),`Missing literary control: ${m[1]}`);
console.log('Verified two separate maps; literary map supports all 64 character combinations and reading filters.');

assert.equal(moments.length,32);
assert.equal(characters.reduce((n,c)=>n+c.stops.length,0),46);
assert.equal(new Set(moments.map(m=>m.id)).size,moments.length);
for(const c of characters){
 assert.equal(new Set(c.stops.map(s=>s.id)).size,c.stops.length);
 for(const [i,s]of c.stops.entries()){
  assert.equal(moments[s.momentIndex].id,s.moment);
  assert.equal(moments[s.momentIndex].part,s.part);
  if(i)assert(s.momentIndex>c.stops[i-1].momentIndex);
 }
}
for(let mask=0;mask<(1<<characters.length);mask++){
 const selected=characters.filter((_,i)=>mask&(1<<i)).map(c=>c.id),steps=readingSteps(selected);
 for(const [i,m]of moments.entries()){
  const episodes=selectedEpisodesAtMoment(selected,i);
  assert(episodes.every(e=>selected.includes(e.character.id)&&e.stops.every(s=>s.momentIndex<=i)),'No unselected character or future episode leaks into the map');
  const snapped=snapMoment(selected,i);
  if(steps.length)assert(steps.some(s=>s.index===snapped),'Cursor belongs to an active character');
  else assert.equal(snapped,i,'Empty selection preserves reading position');
 }
 for(const step of steps)assert(selectedEpisodesAtMoment(selected,step.index).some(e=>e.stops.some(s=>s.momentIndex===step.index)),'Every slider step has a sourced active episode');
}
assert.deepEqual(readingSteps([]),[]);
assert.equal(readingSteps(['odisto']).length,12);
assert.equal(readingSteps(['jose']).length,9);
for(let part=0;part<5;part++)assert.equal(resolveMoment(new URLSearchParams({parte:String(part)})),lastMomentOfPart(part),'Old part links retain their reading boundary');
for(const m of moments)assert.equal(resolveMoment(new URLSearchParams({momento:m.id})),m.index);
assert.equal(moments[resolveMoment(new URLSearchParams({parte:'1.7'}))].part,1);
assert.equal(moments[resolveMoment(new URLSearchParams({parte:'NaN'}))].part,3);
const jose=characters.find(c=>c.id==='jose');
const library=visibleStopsAtMoment(jose,moments.find(m=>m.id==='biblioteca').index);
assert(library.some(s=>s.place==='biblioteca'));
assert(!library.some(s=>s.place==='florida'),'Do not show the Hotel Florida before its moment');
console.log('Verified 32 reading moments, 46 sourced episodes, all selection combinations, no future leaks and compatible links.');
