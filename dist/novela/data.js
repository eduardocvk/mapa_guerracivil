// Selección de episodios documentados en fuentes públicas; no itinerarios exhaustivos.
export const sources={
 siruela:{title:'Siruela · Presentación y muestra de la novela',url:'https://www.siruela.com/archivos/Interior_Folleto_Peni769nsula_montado.pdf',kind:'Editorial · fuente primaria'},
 indice:{title:'Siruela · Índice y fragmento de la edición en cartoné',url:'https://www.siruela.com/archivos/fragmentos/LaPeninsulaDeLasCasasVacias_CARTONE.pdf',kind:'Editorial · estructura de la obra'},
 nau:{title:'Amigos de la Nau Gran · Análisis de personajes',url:'https://lecturasamigosnaugran.blogspot.com/2025/01/david-ucles-analisis.html',kind:'Club de lectura · fuente secundaria'},
 syra:{title:'Camino de Letras con Syra · Lectura comentada',url:'https://camino-syra.blogspot.com/2026/04/la-peninsula-de-las-casas-vacias-de.html',kind:'Lectura comentada · fuente secundaria'},
 folio:{title:'Folio / Alighieria · Guía de lectura',url:'https://www.alighieria.com/revista-folio/lo-leo-o-no-todo-lo-que-tienes-que-saber-antes-de-leer-la-peninsula-de-las-casas-vacias-de-david-ucles',kind:'Guía de lectura · fuente secundaria'}
};
export const parts=[
 {name:'Simiente',period:'1936',caption:'El origen compartido'},
 {name:'Leño',period:'1936',caption:'La familia se dispersa'},
 {name:'Ascua',period:'1937',caption:'Caminos que se separan'},
 {name:'Ceniza',period:'1938–1939',caption:'La guerra y el regreso'},
 {name:'Epílogo',period:'1940',caption:'La memoria continúa'}
];
// Las coordenadas corresponden a centros urbanos o áreas representativas actuales.
export const places={
 jandula:{name:'Jándula',real:'Quesada, Jaén · referencia geográfica',lat:37.844,lng:-3.066,precision:'fiction',note:'Pueblo ficticio inspirado en Quesada. El marcador no reconstruye su callejero.'},
 sanclemente:{name:'San Clemente',real:'Cuenca, Castilla-La Mancha',lat:39.404,lng:-2.429,precision:'city'},
 cuenca:{name:'Cuenca',real:'Castilla-La Mancha',lat:40.071,lng:-2.135,precision:'city'},
 tarragona:{name:'Tarragona',real:'Cataluña',lat:41.118,lng:1.245,precision:'city'},
 barcelona:{name:'Barcelona',real:'Cataluña',lat:41.387,lng:2.17,precision:'city'},
 alicante:{name:'Alicante',real:'Comunidad Valenciana',lat:38.344,lng:-.482,precision:'city',note:'Referencia al ámbito portuario; el punto no identifica un muelle de la narración.'},
 madrid:{name:'Madrid',real:'Comunidad de Madrid',lat:40.416,lng:-3.704,precision:'city'},
 guadalajara:{name:'Frente de Guadalajara',real:'Entorno de Brihuega · referencia regional',lat:40.761,lng:-2.87,precision:'area',radius:18000,note:'Área orientativa de la batalla. No se conoce la posición exacta de los personajes.'},
 norte:{name:'Frente del norte',real:'Bizkaia · referencia regional',lat:43.24,lng:-2.72,precision:'area',radius:30000,note:'Se sitúa el ámbito de la campaña, sin atribuir a José una posición concreta en Gernika o Bilbao.'},
 ebro:{name:'Frente del Ebro',real:'Entorno de Gandesa · referencia regional',lat:41.053,lng:.438,precision:'area',radius:23000,note:'Área orientativa del frente; no localiza un encuentro en un punto exacto.'},
 badajoz:{name:'Badajoz',real:'Extremadura',lat:38.879,lng:-6.97,precision:'city'},
 toledo:{name:'Toledo',real:'Castilla-La Mancha',lat:39.858,lng:-4.024,precision:'city'},
 jarama:{name:'Frente del Jarama',real:'Sureste de Madrid · referencia regional',lat:40.215,lng:-3.53,precision:'area',radius:13000},
 brunete:{name:'Brunete',real:'Comunidad de Madrid',lat:40.405,lng:-3.998,precision:'city'},
 meiras:{name:'Meirás',real:'Sada, A Coruña',lat:43.404,lng:-8.275,precision:'city'},
 compostela:{name:'Santiago de Compostela',real:'Galicia',lat:42.881,lng:-8.544,precision:'city'},
 segovia:{name:'Frente de Segovia',real:'Sierra de Guadarrama · referencia regional',lat:40.89,lng:-4.02,precision:'area',radius:18000}
};
const stop=(place,part,title,text,source)=>({place,part,title,text,source});
export const characters=[
 {id:'odisto',name:'Odisto',surname:'Ardolento',initial:'O',color:'#a95337',role:'El padre · la huida y el regreso',bio:'Campesino y padre de familia, ligado a su huerta.',source:'nau',stops:[
 stop('jandula',0,'La casa de partida','El hogar de los Ardolento, en la Jándula de ficción.','siruela'),
 stop('sanclemente',2,'Camino de Cuenca','Paso de Odisto durante su huida hacia Cuenca.','syra'),
 stop('cuenca',2,'Refugio en Cuenca','Encuentra refugio en la ciudad imaginada sobre andamios.','folio'),
 stop('tarragona',2,'La enfermería','Su itinerario reaparece en una enfermería de Tarragona.','folio'),
 stop('barcelona',3,'El traslado','Es trasladado a un hospital de Barcelona.','folio'),
 stop('alicante',3,'El puerto','Presencia la concentración de refugiados en el puerto.','folio'),
 stop('jandula',3,'Volver a la casa','Regresa a Jándula después de la guerra.','syra'),
 stop('jandula',4,'El epílogo','La narración vuelve a la huerta familiar.','folio')
 ]},
 {id:'jose',name:'José',surname:'Ardolento',initial:'J',color:'#386b75',role:'El primogénito · el frente republicano',bio:'Hijo mayor de Odisto. Combate con la República.',source:'nau',stops:[
 stop('jandula',0,'El origen','La casa familiar antes de la partida.','siruela'),
 stop('madrid',1,'Junto a Jacobo','Llega a Madrid con Jacobo.','syra'),
 stop('guadalajara',2,'Dos hermanos, dos bandos','Encuentro de José y Paulo en frentes opuestos.','syra'),
 stop('norte',2,'La campaña del norte','Destinado al norte; se representa un ámbito regional.','folio'),
 stop('madrid',2,'Reencuentro en Madrid','José y Jacobo se reencuentran en la capital.','folio'),
 stop('ebro',3,'El Ebro','Su trayectoria alcanza el frente del Ebro.','syra')
 ]},
 {id:'pablito',name:'Pablito',surname:'Pablo · Paulo · Paolo',initial:'P',color:'#706293',role:'El otro hermano · el ejército sublevado',bio:'Hijo de Odisto y mellizo de Ángeles. Se alista con los sublevados.',source:'nau',stops:[
 stop('jandula',0,'La misma casa','Comparte el origen de sus hermanos.','siruela'),
 stop('badajoz',1,'Hacia el oeste','Forma parte de la columna que pasa por Badajoz.','syra'),
 stop('toledo',1,'La toma de Toledo','Participa en el avance sobre Toledo.','syra'),
 stop('jarama',2,'El Jarama','Combate en el frente del Jarama.','folio'),
 stop('guadalajara',2,'Frente a José','Los hermanos coinciden en bandos contrarios.','syra'),
 stop('brunete',2,'La infiltración','Se infiltra durante la batalla de Brunete.','folio'),
 stop('meiras',2,'La misión en Galicia','Es enviado a una misión relacionada con Meirás.','folio'),
 stop('compostela',2,'Compostela','Su recorrido continúa hacia Santiago.','folio'),
 stop('ebro',3,'La batalla','Coincide con José en el frente del Ebro.','syra'),
 stop('jandula',3,'Regreso','El itinerario vuelve a Jándula.','syra')
 ]},
 {id:'angeles',name:'Ángeles',surname:'Ardolento',initial:'Á',color:'#8a7535',role:'La hermana · permanecer y cuidar',bio:'Asume el cuidado familiar tras la muerte de su madre.',source:'nau',note:'Una historia de permanencia: se sitúa Jándula, sin inventar un recorrido entre ciudades ni localizar el pajar de la novela.',stops:[
 stop('jandula',0,'El centro de la familia','Su historia se concentra en Jándula y su entorno.','nau')
 ]},
 {id:'jacobo',name:'Jacobo',surname:'El compañero de José',initial:'Jc',color:'#b75d77',role:'El compañero · la separación',bio:'Compañero de José, con quien llega a Madrid.',source:'syra',stops:[
 stop('jandula',0,'El pueblo compartido','El punto de partida del vínculo con José.','folio'),
 stop('madrid',1,'Llegar juntos','Viaja a Madrid con José.','syra'),
 stop('segovia',2,'Cartas desde el frente','Escribe desde el frente de Segovia.','syra'),
 stop('madrid',2,'La vuelta a Madrid','Se reencuentra con José en la capital.','folio')
 ]},
 {id:'angel',name:'Ángel',surname:'El hermano de Odisto',initial:'Án',color:'#5a7952',role:'El tío · hacia Toledo',bio:'Hermano de Odisto. Parte para buscar a su suegro.',source:'folio',stops:[
 stop('jandula',0,'La huerta','El entorno familiar del que parte.','folio'),
 stop('toledo',1,'La búsqueda','Se dirige a Toledo durante el asedio del Alcázar.','folio')
 ]}
];
export function visibleStops(character,part){return character.stops.map((stop,index)=>({...stop,index})).filter(stop=>stop.part<=part);}
export function visibleCharacters(id){return id==='todos'?characters:characters.filter(character=>character.id===id);}
