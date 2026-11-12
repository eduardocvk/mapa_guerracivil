import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { events, stages, legacyStageDates, resolveStageIndex } from '../dist/data/history.js';
const require=createRequire(import.meta.url),turf=require('../dist/vendor/turf.min.js');
const territories=JSON.parse(readFileSync(new URL('../dist/data/territories.json',import.meta.url)));
const spain=JSON.parse(readFileSync(new URL('../dist/data/spain.geojson',import.meta.url)));
assert.equal(stages.length,54);assert.equal(events.length,45);
assert.equal(stages[0].date,'1936-07-22');assert.equal(stages.at(-1).date,'1939-04-01');
assert.equal(new Set(events.map(e=>e.id)).size,events.length);
for(let i=0;i<stages.length;i++){
 const s=stages[i];if(i)assert(s.date>stages[i-1].date);
 assert(territories[s.territory]);const event=events.find(e=>e.id===s.event);assert(event);assert(event.start<=s.date,`No future event at ${s.date}`);
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
console.log(`Verified: ${stages.length} chronological stages, ${events.length} events, valid territorial coverage and DOM references.`);

// Highlight real control changes; dates sharing a snapshot must stay unhighlighted.
const changes=JSON.parse(readFileSync(new URL('../dist/data/changes.json',import.meta.url)));
assert.equal(changes.length,stages.length);
for(const [i,s]of stages.entries()){
 if(!i||s.territory===stages[i-1].territory)assert.equal(changes[i].features.length,0,`No fabricated change at ${s.date}`);
 else assert(turf.area(changes[i])>1,`Expected territorial changes at ${s.date}`);
 for(const f of changes[i].features)assert(turf.booleanValid(f),`Valid change highlight at ${s.date}`);
}
function changedAt(date,point,side){const index=stages.findIndex(s=>s.date===date);return changes[index].features.some(f=>f.properties.side===side&&turf.booleanPointInPolygon(turf.point(point),f));}
assert(changedAt('1937-06-19',[-2.94,43.26],'rebel'),'Highlight fall of Bilbao');
assert(changedAt('1937-10-21',[-5.66,43.54],'rebel'),'Highlight fall of Gijón');
assert(changedAt('1939-01-26',[2.17,41.39],'rebel'),'Highlight fall of Barcelona');
assert(changedAt('1939-03-30',[-.38,39.47],'rebel'),'Highlight final occupation of Valencia');
console.log('Verified: changes are visible at the major turning points and absent for shared snapshots.');

// Intermediate snapshots must retain or change cities at the correct milestones.
assert.equal(side('merida',[-6.34,38.92]),'rebel');
assert.equal(side('merida',[-6.97,38.88]),'republic','Badajoz still resists on August 11');
assert.equal(side('irun',[-1.79,43.33]),'rebel');
assert.equal(side('irun',[-1.98,43.32]),'republic','San Sebastián remains Republican before September 13');
assert.equal(side('gipuzkoa',[-1.98,43.32]),'rebel');
assert.equal(side('gernika-bombing',[-2.68,43.32]),'republic','Gernika has not been occupied on the day of the bombing');
assert.equal(side('north',[-2.68,43.32]),'rebel');
assert.equal(side('brunete',[-3.99,40.40]),'republic');
assert.equal(side('bilbao',[-3.99,40.40]),'rebel');
assert.equal(side('belchite',[-.75,41.30]),'republic');
assert.equal(side('lleida',[.62,41.62]),'rebel');
assert.equal(side('lleida',[.48,40.47]),'republic','The coast is not cut before April 15');
assert.equal(side('split',[-.05,39.99]),'republic','Castellón before June');
assert.equal(side('levante',[-.05,39.99]),'rebel');
assert.equal(side('tarragona',[1.25,41.12]),'rebel');
assert.equal(side('tarragona',[2.17,41.39]),'republic');
assert.equal(side('barcelona',[4.26,39.89]),'republic');
assert.equal(side('border',[4.26,39.89]),'rebel');
for(const [i,legacyDate]of legacyStageDates.entries())assert.equal(stages[resolveStageIndex(new URLSearchParams({etapa:String(i)}))].date,legacyDate,'Old date links retain their meaning');
for(const s of stages)assert.equal(stages[resolveStageIndex(new URLSearchParams({fecha:s.date}))].date,s.date);
assert.equal(stages[resolveStageIndex(new URLSearchParams())].date,'1936-11-08');
for(const event of events.filter(e=>e.source))assert(event.source.url.startsWith('https://'));
console.log('Verified intermediate city controls, sourced new events and old/new date links.');
