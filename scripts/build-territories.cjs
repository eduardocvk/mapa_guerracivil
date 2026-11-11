// Reconstrucción didáctica propia. Coordenadas [longitud, latitud].
// Las geometrías son esquemáticas y NO representan cartografía militar diaria.
const fs=require('node:fs');
const turf=require('../dist/vendor/turf.min.js');
const spain=turf.simplify(JSON.parse(fs.readFileSync('dist/data/spain.geojson')),{tolerance:0.008,highQuality:true});
const poly=p=>turf.polygon([[...p,p[0]]]);
const main=(line)=>poly([...line,[4,44],[5,44],[5,35],[-5,35]]);
const eastInitial=[[-5.25,36.25],[-5.15,36.9],[-5.25,37.35],[-5.6,37.7],[-6.7,37.7],[-7.6,38.0],[-7.6,39.5],[-5.0,39.5],[-4.8,40.2],[-4.25,40.55],[-3.65,41.05],[-3.25,41.15],[-2.7,41.3],[-2.15,41.0],[-1.6,40.7],[-1.15,40.65],[-.8,41.2],[-.1,41.5],[.3,42.0],[.1,42.6],[.7,43.0]];
const eastAug=[[-5.25,36.25],[-5.15,36.9],[-5.25,37.35],[-5.6,37.7],[-6.1,38.3],[-5.75,39.0],[-5.3,39.7],[-4.8,40.2],...eastInitial.slice(10)];
const eastSep=[[-5.25,36.25],[-5.15,36.9],[-5.0,37.3],[-5.2,37.8],[-5.65,38.4],[-5.15,39.0],[-4.4,39.6],[-3.9,39.8],[-4.4,40.15],[-4.15,40.55],...eastInitial.slice(10)];
const eastMadrid=[[-5.25,36.25],[-5.15,36.9],[-5.0,37.3],[-5.2,37.8],[-5.65,38.4],[-5.15,39.0],[-4.4,39.6],[-3.9,39.8],[-3.75,40.15],[-3.75,40.43],[-4.1,40.65],...eastInitial.slice(10)];
const eastMalaga=[[-3.1,36.65],[-3.3,36.95],[-3.65,37.15],[-3.55,37.5],[-4.2,37.5],[-4.6,37.9],[-5.2,37.8],...eastMadrid.slice(4)];
const cantabrian=poly([[-7.15,43.7],[-7.0,43.1],[-6.35,42.9],[-5.6,42.95],[-5.3,43.1],[-4.7,42.8],[-4.2,42.95],[-3.7,42.9],[-3.2,43.0],[-2.9,42.95],[-2.4,43.0],[-2.0,43.15],[-1.7,43.3],[-1.65,44],[-7.15,44]]);
const northSep=poly([[-7.15,44],[-7.15,43.7],[-7.0,43.1],[-6.35,42.9],[-5.6,42.95],[-5.3,43.1],[-4.7,42.8],[-4.2,42.95],[-3.7,42.9],[-3.2,43.0],[-2.9,42.95],[-2.5,43.1],[-2.35,43.4],[-2.35,44]]);
const northApr=poly([[-7.15,44],[-7.15,43.7],[-7.0,43.1],[-6.35,42.9],[-5.6,42.95],[-5.3,43.1],[-4.7,42.8],[-4.2,42.95],[-3.7,42.9],[-3.2,43.0],[-2.9,43.05],[-2.7,43.23],[-2.65,43.45],[-2.65,44]]);
const northBilbao=poly([[-7.15,44],[-7.15,43.7],[-7.0,43.1],[-6.35,42.9],[-5.6,42.95],[-5.3,43.1],[-4.7,42.8],[-4.2,42.95],[-3.7,43.0],[-3.35,43.15],[-3.2,43.4],[-3.2,44]]);
const asturias=poly([[-7.1,44],[-7.1,43.3],[-6.4,43.05],[-5.7,43.05],[-5.4,43.15],[-4.9,43.1],[-4.6,43.3],[-4.5,43.5],[-4.5,44]]);
const central=poly([...eastMalaga.slice(0,13),[-3.25,41.15],[-2.7,41.3],[-2.15,41.0],[-1.6,40.7],[-1.35,40.15],[-.6,40.1],[.2,40.05],[.35,39.9],[1,39.6],[1,35],[-3.1,35]]);
const catalonia=poly([[.6,40.65],[.6,41.0],[.75,41.3],[.6,41.6],[.65,42.0],[.75,42.5],[.8,43],[5,44],[5,40.65]]);
const ebro=poly([[.25,40.7],[.25,41.15],[.6,41.35],[.7,41.65],[.65,42],[.75,42.5],[.8,43],[5,44],[5,40.65]]);
const girona=poly([[2.25,41.55],[1.8,41.9],[1.6,42.2],[1.65,42.7],[2.1,43],[5,44],[5,41.55]]);
const menorca=turf.bboxPolygon([3.75,39.75,4.5,40.2]);
const last=poly([[-3.1,36.6],[-3.3,37.1],[-3.6,37.5],[-3.8,38.2],[-3.3,38.6],[-2.3,39.2],[-1.5,39.8],[.35,39.9],[1,39.6],[1,35],[-3.1,35]]);
const configs={initial:[main(eastInitial),cantabrian,menorca],august:[main(eastAug),cantabrian,menorca],september:[main(eastSep),northSep,menorca],madrid:[main(eastMadrid),northSep,menorca],malaga:[main(eastMalaga),northSep,menorca],north:[main(eastMalaga),northApr,menorca],bilbao:[main(eastMalaga),northBilbao,menorca],santander:[main(eastMalaga),asturias,menorca],october:[main(eastMalaga),menorca],teruel:[main(eastMalaga),turf.circle([-1.11,40.34],24,{units:'kilometers'}),menorca],split:[central,catalonia,menorca],ebro:[central,ebro,menorca],barcelona:[central,girona,menorca],central:[central],last:[last],end:[]};
const output={};
const balearicMask=turf.bboxPolygon([1,38.3,4.6,40.3]);
const cordoba=poly([[-5.8,37.45],[-4.65,37.45],[-4.3,37.65],[-4.35,38.15],[-5.4,38.3],[-5.8,37.45]]);
const granadaEnclave=turf.circle([-3.60,37.18],18,{units:'kilometers'});
const granadaLink=poly([[-4.9,37.55],[-4.9,37.05],[-4.1,36.9],[-3.9,36.9],[-3.4,36.9],[-3.25,37.25],[-3.55,37.5],[-4.9,37.55]]);
const teruelZone=poly([[-1.7,41.2],[-1.5,40.75],[-1.4,40.15],[-.95,40.1],[-.75,40.6],[-.85,41.1],[-1.7,41.2]]);
const oviedo=turf.circle([-5.85,43.36],8,{units:'kilometers'});
const ibiza=turf.bboxPolygon([1.1,38.5,1.7,39.2]);
for(const [name,polys] of Object.entries(configs)){
 let republican=null;
 if(polys.length){
  const merged=polys.length===1?polys[0]:turf.union(turf.featureCollection(polys));
  let corrected=turf.difference(turf.featureCollection([merged,balearicMask]));
  const exclusions=[cordoba,name==='initial'?granadaEnclave:granadaLink,oviedo,teruelZone];
  for(const excluded of exclusions) corrected=turf.difference(turf.featureCollection([corrected,excluded]));
  const additions=[];
  if(!['central','last'].includes(name))additions.push(menorca);
  if(name==='august')additions.push(ibiza);
  if(name==='teruel')additions.push(turf.circle([-1.11,40.34],20,{units:'kilometers'}));
  if(additions.length)corrected=turf.union(turf.featureCollection([corrected,...additions]));
  republican=turf.intersect(turf.featureCollection([spain,corrected]));
 }
 const rebel=republican?turf.difference(turf.featureCollection([spain,republican])):spain;
 const features=[];
 if(rebel){rebel.properties={side:'rebel'};features.push(rebel);}
 if(republican){republican.properties={side:'republic'};features.push(republican);}
 output[name]=turf.featureCollection(features);
 for(const f of features) if(!turf.booleanValid(f)) throw new Error('Invalid geometry: '+name);
}
fs.writeFileSync('dist/data/territories.json',JSON.stringify(output));
console.log('16 valid territorial snapshots generated.');
