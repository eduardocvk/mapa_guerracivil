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

## Mapa literario: La península de las casas vacías

`dist/novela/` contiene un segundo mapa, enlazado desde el atlas histórico y accesible en `/novela/`. Incluye seis personajes, 31 episodios, colores por personaje, comparación, filtro por partes, vista ampliada para móvil y leyendas ocultables. Cada ficha enlaza su fuente.

Es una selección de episodios basada en fuentes públicas; no una reconstrucción completa cotejada con el texto íntegro. Jándula se representa tomando Quesada como referencia. Los centros de ciudad y los círculos regionales son aproximados. Las líneas discontinuas unen episodios, sin atribuir carreteras o lugares intermedios a los personajes. Las fuentes primarias y secundarias están diferenciadas en la web y en `dist/novela/data.js`.
