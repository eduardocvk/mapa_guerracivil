// Guía de lectura: orden orientativo dentro de cada parte, no calendario de la guerra.
// Las tramas paralelas no se presuponen simultáneas. No se interpolan desplazamientos.
export const moments=[
 ['origen',0,'La casa compartida','Primavera de 1936 · marco narrativo'],
 ['cuidados',1,'Ángeles cuida de la familia','1936 · sin día confirmado'],
 ['badajoz',1,'Pablito en Badajoz','1936 · durante el avance hacia Madrid'],
 ['toledo',1,'Los caminos hacia Toledo','1936 · entorno del asedio'],
 ['partida-jose',1,'José y Jacobo dejan Jándula','1936 · antes de llegar a Madrid'],
 ['madrid',1,'La llegada a Madrid','1936 · sin día confirmado'],
 ['biblioteca',1,'Libros en la Biblioteca Nacional','1936 · estancia en Madrid'],
 ['huida-odisto',1,'Odisto abandona Jándula','1936 · orden narrativo orientativo'],
 ['nochevieja36',1,'Una noche en el Hotel Florida','Nochevieja de 1936 · referencia de la guía'],
 ['jarama',2,'Pablito en el Jarama','1937 · contexto de la batalla'],
 ['sanclemente',2,'Odisto pasa por San Clemente','1937 · camino de Cuenca'],
 ['cuenca',2,'El refugio de Cuenca','1937 · sin día confirmado'],
 ['guadalajara',2,'Los hermanos en Guadalajara','1937 · contexto de la batalla'],
 ['angeles-pedro',2,'Ángeles y Pedro, cerca de Jándula','1937 · sin día confirmado'],
 ['torca',2,'La búsqueda en las torcas','1937 · entorno de Cuenca'],
 ['norte',2,'José es enviado al norte','1937 · ámbito de campaña'],
 ['segovia',2,'Las cartas desde Segovia','1937 · frente del centro'],
 ['brunete',2,'Pablito en Brunete','1937 · contexto de la batalla'],
 ['tarragona',2,'Odisto en la enfermería','1937 · sin día confirmado'],
 ['meiras',2,'Una misión en Meirás','1937 · recorrido por Galicia'],
 ['rias',2,'El episodio de las Rías Baixas','1937 · ámbito regional'],
 ['compostela',2,'El camino a Compostela','1937 · sin día confirmado'],
 ['reencuentro',2,'El reencuentro en Madrid','1937 · sin día confirmado'],
 ['convalecencia',3,'La convalecencia de Odisto','1938 · sin día confirmado'],
 ['ebro',3,'Los hermanos en el Ebro','1938 · contexto de la batalla'],
 ['vuelta-pablito',3,'Pablito emprende el regreso','Después del Ebro · sin itinerario intermedio contrastado'],
 ['barcelona',3,'El hospital de Barcelona','Finales de 1938 · marco narrativo'],
 ['nochevieja38',3,'Otra Nochevieja, en Barcelona','Nochevieja de 1938 · referencia de la guía'],
 ['alicante',3,'Odisto llega al puerto','Final de la guerra · 1939'],
 ['jandula-pablito',3,'Pablito ha vuelto a Jándula','Posguerra inmediata · orden orientativo'],
 ['jandula-odisto',3,'Odisto vuelve a la casa','Posguerra inmediata · 1939'],
 ['epilogo',4,'La huerta y una nueva generación','Primavera de 1940 · referencia de la guía']
].map(([id,part,title,when],index)=>({id,part,title,when,index}));
export const momentIndex=id=>moments.findIndex(moment=>moment.id===id);
export const lastMomentOfPart=part=>moments.findLastIndex(moment=>moment.part===part);
export function resolveMoment(params){
 const id=params.get('momento');const exact=momentIndex(id);if(exact>=0)return exact;
 const raw=Number(params.get('parte')??3);const part=Number.isFinite(raw)?Math.max(0,Math.min(4,Math.trunc(raw))):3;
 return lastMomentOfPart(part);
}
