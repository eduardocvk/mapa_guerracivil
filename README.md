# España en guerra · 1936–1939

Atlas en español de la Guerra Civil con OpenStreetMap y Leaflet. Incluye 22 etapas, reproducción de la cronología, territorios por bando, 22 fichas geolocalizadas, búsqueda, capas y navegación entre península, Baleares y Canarias. Adaptado a móvil y teclado, con vista ampliada que mantiene la barra temporal en la parte inferior y permite ocultar las leyendas. El contorno dorado resalta cambios respecto a la etapa cronológica anterior; las fechas con el mismo esquema lo indican expresamente.

## Desarrollo

No requiere instalar dependencias. Node.js 18+ y Python 3 para el servidor de desarrollo.

```sh
npm run build
npm run check
npm run dev
```

Abrir http://localhost:3000. `dist/` contiene la web estática completa y puede desplegarse en cualquier alojamiento estático. Los enlaces `?etapa=0` a `?etapa=21` permiten compartir una fecha. Se necesita conexión a Internet para las teselas de OpenStreetMap; Leaflet, las geometrías y los datos históricos se incluyen localmente. Las fuentes tipográficas tienen alternativas locales.

## Estructura

- `dist/data/history.js`: etapas y fichas históricas.
- `scripts/build-territories.cjs`: reconstrucción esquemática propia, recortada a la costa española mediante Turf.
- `dist/data/spain.geojson`: límites geográficos de Natural Earth / geo-countries (dominio público).
- `dist/data/territories.json`: geometrías generadas por etapa.
- `dist/data/changes.json`: diferencias de control por fecha, para resaltarlas sobre el mapa.
- `dist/app.js`, `dist/style.css`, `dist/index.html`: aplicación sin framework.
- `dist/vendor/`: Leaflet 1.9.4 (BSD-2-Clause) y Turf 7 (MIT).

## Criterio histórico

Las zonas de control son **esquemas didácticos**, no polígonos militares diarios ni límites administrativos. Las 22 fechas utilizan 16 esquemas territoriales, sin interpolación. Los enclaves menores y las líneas de frente están generalizados; no debe utilizarse para inferir el control de una localidad concreta. Las fichas describen el acontecimiento completo e identifican si estaba en curso en la fecha seleccionada. El Protectorado de Marruecos se contextualiza con un marcador, sin cartografiar su control.

Fuentes de consulta y ampliación:

- [Universidad de Warwick: cronología](https://warwick.ac.uk/services/library/mrc/collections/digital/scw/timeline2/).
- [IGN: Mapas y cartógrafos en la Guerra Civil](https://www.ign.es/resources/acercaDe/libDigPub/Mapas_cartografos_Guerra_Civil.pdf).
- [UAB: colección de mapas](https://www.uab.cat/es/bibliotecas/coleccion-mapas-guerra-civil).
- [USHMM: contexto histórico](https://encyclopedia.ushmm.org/content/en/article/spanish-civil-war).

Base cartográfica © [colaboradores de OpenStreetMap](https://www.openstreetmap.org/copyright), ODbL. Teselas estándar: respeta la [política de uso](https://operations.osmfoundation.org/policies/tiles/); no se realiza precarga ni descarga masiva. Para tráfico elevado, configura un proveedor de teselas adecuado.

## Publicación en GitHub Pages

El workflow `.github/workflows/pages.yml` verifica y publica `dist/` en GitHub Pages con cada cambio de la aplicación en `main`. También puede ejecutarse desde Actions con **Run workflow**.

La fuente de Pages debe estar configurada como **GitHub Actions** en Settings → Pages. El despliegue publica únicamente la web estática, sin metadatos de Sites ni el código de las herramientas de desarrollo.

## Historia y novela en el mismo mapa

Los territorios y batallas de la Guerra Civil y los recorridos de seis personajes de *La península de las casas vacías* se muestran en un único mapa. Cada personaje tiene una casilla independiente; pueden activarse todos, ninguno o cualquier combinación. El panel Capas permite ocultar los recorridos en conjunto sin perder la selección, y gestionar territorios y batallas de forma independiente.

El filtro por partes de la novela es independiente de la fecha histórica, para no atribuir días concretos a episodios cuya datación exacta no está contrastada. Las preferencias se conservan en el enlace mediante `personajes`, `parte` y `novela`. El panel puede plegarse; la vista ampliada conserva los controles y la barra temporal abajo. Los antiguos enlaces `/novela/` llevan al mapa unificado y conservan la selección de personaje y parte.

Los 31 episodios son una selección basada en fuentes públicas, no una reconstrucción completa cotejada con el texto íntegro. Jándula se representa tomando Quesada como referencia. Los centros de ciudad y los círculos regionales son aproximados. Las líneas unen episodios sin atribuir carreteras o lugares intermedios a los personajes. Fuentes primarias y secundarias: `dist/novela/data.js`. Control de capas: `dist/novel-layer.js`.
