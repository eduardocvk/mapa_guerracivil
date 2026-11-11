import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { events, stages } from '../dist/data/history.js';
const require=createRequire(import.meta.url),turf=require('../dist/vendor/turf.min.js');
const territories=JSON.parse(readFileSync(new URL('../dist/data/territories.json',import.meta.url)));
const spain=JSON.parse(readFileSync(new URL('../dist/data/spain.geojson',import.meta.url)));
assert.equal(stages.length,22);assert.equal(events.length,22);
assert.equal(stages[0].date,'1936-07-22');assert.equal(stages.at(-1).date,'1939-04-01');
assert.equal(new Set(events.map(e=>e.id)).size,events.length);
for(let i=0;i<stages.length;i++){
 const s=stages[i];if(i)assert(s.date>stages[i-1].date);
 assert(territories[s.territory]);assert(events.find(e=>e.id===s.event));
}
for(const e of events){assert(e.start<=e.end);assert(Number.isFinite(e.lat)&&Number.isFinite(e.lng));}
const expectedArea=turf.area(turf.simplify(spain,{tolerance:.008,highQuality:true}));
for(const [name,fc]of Object.entries(territories)){
 for(const f of fc.features)assert(turf.booleanValid(f),`${name} must be valid`);
 const area=fc.features.reduce((sum,f)=>sum+turf.area(f),0);
 assert(Math.abs(area-expectedArea)/expectedArea<.0001,`${name} must cover Spain without gaps`);
 if(fc.features.length>1){const overlap=turf.intersect(fc);assert(!overlap||turf.area(overlap)<1,`${name} sides must not overlap beyond floating-point tolerance`);}
}
function side(stage,point){return territories[stage].features.find(f=>turf.booleanPointInPolygon(turf.point(point),f))?.properties.side;}
for(const s of Object.keys(territories)){
 assert.equal(side(s,[-15.43,28.12]),'rebel',`${s}: Canarias`);
 assert.equal(side(s,[-3.70,42.34]),'rebel',`${s}: Burgos`);
 assert.equal(side(s,[-4.78,37.89]),'rebel',`${s}: Córdoba`);
 assert.equal(side(s,[-3.60,37.18]),'rebel',`${s}: Granada`);
 assert.equal(side(s,[-5.85,43.36]),'rebel',`${s}: Oviedo`);
 assert.equal(side(s,[2.65,39.57]),'rebel',`${s}: Mallorca`);
 assert.equal(side(s,[-1.11,40.34]),s==='teruel'?'republic':'rebel',`${s}: Teruel`);
}
assert.equal(side('madrid',[-3.70,40.42]),'republic','Madrid must remain Republican in November 1936');
assert.equal(side('initial',[1.43,38.91]),'rebel','Ibiza July 1936');
assert.equal(side('august',[1.43,38.91]),'republic','Ibiza August 1936');
assert.equal(side('madrid',[1.43,38.91]),'rebel','Ibiza November 1936');
assert.equal(side('initial',[2.17,41.39]),'republic','Barcelona 1936');
assert.equal(side('split',[-.38,39.47]),'republic','Valencia 1938');
assert.equal(side('split',[.48,40.47]),'rebel','Vinaròs after partition');
assert.equal(side('central',[2.17,41.39]),'rebel','Barcelona after Catalonia campaign');
assert.equal(side('last',[-3.70,40.42]),'rebel','Madrid March 28');
assert.equal(side('end',[-3.70,40.42]),'rebel','Madrid April 1');
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]));ids.add('chronology-list');
for(const m of app.matchAll(/\$\('([^']+)'\)/g))assert(ids.has(m[1]),`Missing DOM element: ${m[1]}`);
console.log('Verified: 22 chronological stages, 22 event records, valid territorial coverage and key city controls, DOM references.');
