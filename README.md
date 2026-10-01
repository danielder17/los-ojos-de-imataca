# Los Ojos de Imataca · atlas inmersivo

> **Publicado:**
> - **Dominio propio: https://rfigrup.com/los-ojos-de-imataca/** (proxy desde tu landing)
> - Producción (Vercel): https://los-ojos-de-imataca.vercel.app
> - Respaldo (GitHub Pages): https://danielder17.github.io/los-ojos-de-imataca/
> - Código: https://github.com/danielder17/los-ojos-de-imataca
>
> Cada `git push` a `main` vuelve a desplegar automáticamente en Vercel, y el cambio aparece
> también en rfigrup.com/los-ojos-de-imataca/ sin tocar el sitio principal.

Consola geoespacial local (CesiumJS) con las capas y estadísticas del proyecto Imataca:
serie multitemporal Sentinel-2 2017-2026, clasificación FAO 2025 por bloque, tipología
ecológica N2 del usuario y la capa de cobertura del bloque P6, sobre una interfaz de consola
con efecto vidrio, riel plegable y recorrido multitemporal animado.

La estética y las microanimaciones están inspiradas en **God's Eye View** (MIT, Bilawal Sidhu) y
en los componentes de **ReactBits** (MIT), portados a JavaScript sin dependencias para que el
atlas funcione como página local, sin compilación ni cuentas de servicio.

Todas las cifras provienen de archivos de resultado del proyecto (`imataca-gee/salidas`) o de
recuentos de píxeles reproducibles; ninguna es estimada a mano.

---

## 1. Cómo abrirlo

```bat
cd C:\Users\IGVSB\zcode\workspace\default\atlas_imataca\web
python -m http.server 8765 --bind 127.0.0.1
```

Navegador: **http://127.0.0.1:8765/cesium/**

> No abra `index.html` con doble clic: con origen `file://` el navegador bloquea `datos.js`,
> `efectos.js`, `mapas.js`, los GeoJSON y los tiles.

**Internet**: se usa para los mapas de fondo (Sentinel-2 de EOX, ESRI, OSM, OpenTopoMap, Carto)
y para el relieve 3D (Mapterhorn). Sin conexión, el globo queda en fondo oscuro y **las capas
locales —bloques, límite de la reserva, cobertura P6 y tipología N2— siguen funcionando**.

## 2. Controles

| Control | Qué hace |
|---|---|
| Panel de control (riel izquierdo) | Se pliega con el encabezado; agrupa unidad de análisis, capas y fondos |
| Lista de bloques | Vuela al bloque y abre su ficha estadística |
| Clic sobre el globo | Selecciona el bloque donde se hace clic |
| ⌂ Reserva completa | Vista general y cifras de la reserva |
| ▶ Recorrido guiado | Tour automático: reserva → P1 … P6 → reserva (≈5 s por paso) |
| ▶ Recorrido multitemporal | Anima los años 2017-2026: cambia a la vez el mosaico Sentinel-2 y las cifras |
| ⑃ Comparar años | Pantalla dividida: año de referencia a la izquierda, año activo a la derecha |
| Capas del proyecto | Bloques, límite de la reserva, cobertura P6 y tipología N2 con control de opacidad |
| Mapa de fondo | Sentinel-2 anual, ESRI Satellite, ESRI Topográfico, relieve sombreado, OSM, OpenTopoMap, Carto Oscuro |
| Relieve 3D | Terreno real (elevación Mapterhorn) sobre cualquier fondo |
| Tira de años | Año de la serie que alimenta las estadísticas y el fondo multitemporal |
| Barras de clase | Abren el detalle de esa clase en el bloque activo |
| Leyenda + ficha de tipología | Se anclan sobre la serie multitemporal y se pueden arrastrar. **Clic en una clase**: **despliega la ficha individual** de esa tipología (otro clic la cierra). El globo no se filtra desde la leyenda: las capas se muestran completas según sus casillas. La ficha incluye un mapa espacial propio (con la clase resaltada y las demás atenuadas, barra de escala), superficie en **km² y hectáreas**, **gráfico de línea** de la evolución del área 2017-2026 (o del período disponible), **gráfico de dona** con la proporción frente a las demás y descripción. La identificación de la clase en el minimapa es por color de paleta más cercano, inmune al redondeo de alfa del navegador. La ficha aparece y desaparece con la selección (otro clic sobre la clase la quita del mapa y la cierra; botón × para cerrar). Botones TODAS / NINGUNA / SOLO LA FICHA |
| Migas del panel derecho | Navegan hacia atrás en el drill-down |

## 2 bis · Serie Landsat 1985-2024 (MapBiomas)

La línea de tiempo tiene dos fuentes conmutables: **SENTINEL-2** (2017-2026, motor propio) y
**RFI-LANDSAT** (1985-2024, serie MapBiomas validada). Al elegir RFI-LANDSAT, la tira de años pasa a
1985-2024 y el panel muestra la estadística del año activo: KPIs (bosque, bosque inundable, uso
minero, áreas agrícolas, agua, manglar, Δ bosque desde 1985), curvas 1985-2024 de bosque y minería,
y las 16 clases hoja como barras. La sección incluye la **comparación de años**: se eligen dos años
y una tabla muestra la superficie de cada clase en ambos años con el delta (ha y %), ordenada por la
magnitud del cambio. El recorrido multitemporal anima los 40 años con la estadística.

La visualización espacial de esta fuente usa las **capas vectoriales originales** del proyecto
(límite de la reserva, bloques P1-P6, polígono RFI Landsat y la tipología N2 del sector norte),
con una **leyenda simple no dinámica** que las lista junto con las 9 clases de la tipología N2.

- Fuente espacial: API pública de MapBiomas Venezuela (`maps/map` con `tenant-id: mapbiomas`,
  `territoryId` de Imataca) → tiles de Earth Engine con validez ~25 min (cacheados en el visor).
- Los años sin mosaico Sentinel-2 propio no afectan a esta fuente: la clasificación existe para los
  40 años.
- **Recorte al polígono RFI**: el territorio MapBiomas usado en el export abarca un área mayor que el
  límite digitalizado de la reserva, por lo que la capa se recorta en el propio visor contra el
  polígono RFI (máscara por tesela en el proveedor de tiles): la cobertura se pinta estrictamente
  dentro del límite, sin extenderse sobre el entorno.

**Validación realizada** (informe completo en `trabajo/validacion_landsat.json`):

- El CSV entregado coincide valor a valor con el JSON de origen de MapBiomas (40 años × 31 clases).
- La suma de clases daba el **doble del total**: el export incluye clases padre junto a sus hojas.
  Estructura resuelta y verificada al centésimo (peor desviación 0,03 ha en 40 años):
  `1 Formaciones boscosas = 3+6+5+4` · `10 Herbazales/arbustales = 11+12+29` ·
  `14 Áreas agrícolas = 9+15+18+21` · `22 Áreas sin vegetación = 23+24+25+30` · `26 ≡ 33 (agua)`.
  El atlas usa solo las 16 clases hoja, que suman exactamente el total.
- **Recorte MapBiomas: 3.794.413 ha = +44.688 ha (+1,19 %)** respecto de la unión de bloques del
  proyecto (3.749.725 ha): las cifras MapBiomas **no son sumables** con las Sentinel-2 (sensor,
  metodología y polígono de recorte distintos). La ficha lo advierte.

**Convención de nombres**: todas las capas de esta serie se referencian como
**«RFI Landsat AAAA»** con su año (RFI Landsat 1985 … RFI Landsat 2024) — en la tira de años,
el encabezado de la vista (`RFI Landsat 2024 · Imataca según MapBiomas`) y las fichas de clase
(`RFI Landsat 2024 · Uso minero`).

**Alineamiento verificado y observación detallada**: la capa se dibuja sobre el polígono RFI
sin desplazamiento — verificado por composición de tiles: 97,68 % de los píxeles clasificados caen
dentro del polígono y ninguna coincidencia mejora en desplazamientos de hasta ±14 km
(`verificar_alineamiento_landsat.py`, reproducible). Lo que puede percibirse como desplazamiento
entre años es el **cambio real de las clases** (1985 ≠ 2024: la minería de 2024 está donde en 1985
había bosque) y una franja de ~2 píxeles donde el clip raster de MapBiomas excede el polígono
digitalizado. Para la observación detallada, la capa tiene **deslizador de opacidad** (0-100 %)
y su reconstrucción al alternar tipologías no parpadea (la capa nueva se añade antes de retirar
la anterior). Sugerencia de lectura: active una sola tipología con la leyenda y compare con el
mismo año en el otro extremo de la serie — el cambio es del propio territorio, no de la capa.

**Leyenda simple no dinámica**: lista las capas vectoriales originales visibles (límite de la
reserva, bloques, polígono RFI Landsat y las 9 clases de la tipología N2 con sus colores).
Se despliega al activar la fuente RFI-LANDSAT y se cierra al volver a Sentinel-2. El botón **COMPARAR AÑOS** divide la pantalla: a la izquierda
el año de referencia (selector) y a la derecha el año activo, ambos con la clasificación RFI
Landsat. El recorrido multitemporal anima años y capa espacial juntos.

Hallazgos de la serie: el bosque (clase 3) pasa de 2.722.657 ha (1985) a 2.656.960 ha (2024),
−65.698 ha (−2,4 %); el uso minero se multiplica ×13,5 (2.432 → 32.769 ha), con aceleración clara
desde 2009-2010; las áreas agrícolas ×3,1 (17.194 → 52.596 ha); el manglar se mantiene estable
(±0,5 % en 40 años).

### Capas vectoriales (extraídas de rfigrup.com/imataca)

Del sitio del proyecto se extrajeron y validaron (el administrador confirmó que son las capas correspondientes a las imágenes Landsat de la serie):

- **`data/rfi_boundary.geojson`** — polígono «Reserva Forestal Imataca» (1.334 vértices, WGS84).
  Área geodésica **3.733.771 ha**; coincide con la unión de bloques del proyecto al **99,91 %**
  (diferencias de borde de ~3.400 ha por lado): es el mismo límite, digitalización distinta.
  Publicado en el atlas como capa conmutable **«Polígono RFI Landsat»** (polilínea anclada al terreno, visible a cualquier escala). El visor usa la versión simplificada.
- `imataca_boundary_simple.geojson` — versión simplificada (906 vértices, 3.733.449 ha,
  error de simplificación 0,009 %): no se publica, se conserva como respaldo.
- **Paleta oficial MapBiomas** (25 clases con sus colores, de `data.js` del sitio): el atlas ahora
  colorea las clases Landsat con la paleta oficial (Bosque #1f8d49, Uso minero #9c0027, Agua
  #2532e4…), sustituyendo la paleta de presentación provisional.

Tabla de áreas del recorte (validación cruzada):

| Referencia | ha | Método |
|---|---|---|
| Polígono RF (rfigrup.com) — geodésico | 3.733.771 | pyproj/WGS84 |
| Unión de bloques P1-P6 — geodésico | 3.733.832 | pyproj/WGS84 (99,91 % de coincidencia con el polígono RF) |
| Unión de bloques P1-P6 — área GEE | 3.749.725 | cálculo de área de Earth Engine |
| Estadísticas MapBiomas — ráster 30 m | 3.794.413 | conteo de píxeles de la plataforma (+1,60 % sobre el polígono; afecta a todas las clases por igual y no altera las tendencias) |

## 3. Niveles de información (drill-down)

1. **Reserva** — superficie de la unión (3.749.725 ha), vegetación (NDVI ≥ 0,50), vegetación
   densa (NDVI ≥ 0,70), NDVI medio y la estimación acotada de bosque FAO (§5).
2. **Bloque** (P1…P6) — superficie, vegetación, NDVI y kNDVI del año activo; uso y cobertura del
   suelo FAO 2025 con kappa y puntos de entrenamiento; barras por clase.
3. **Clase** — superficie, porcentaje, error estándar y margen del 95 %; comparación de la misma
   clase en los seis bloques; serie anual cuando la clase la tiene (bosque ≥ 0,70 ·
   otra vegetación 0,50-0,70 · sin vegetación < 0,50 + máscara de agua JRC).
4. **Año** — eje 2017-2026 aplicado a los niveles anteriores y al mosaico de fondo.

## 4. Serie multitemporal Sentinel-2 (cobertura verificada)

> **Fichas de la leyenda**: para las clases FAO de P6 con serie anual (bosque, otra vegetación, sin vegetación y agua) la ficha muestra su evolución 2017-2026 según el motor de umbrales de NDVI; para cultivo, minería y urbano se indica que solo se discriminan en la clasificación FAO 2025. Para la tipología N2 la serie mostrada es la de la reserva completa (el desglose anual por tipología aún no ha sido calculado y queda como trabajo pendiente).


Los mosaicos anuales sin nubes son de **EOX** (Sentinel-2, CC BY-NC-SA 4.0) y no requieren clave.
Cobertura comprobada tile a tile sobre la reserva el 27-09-2026:

| Año | Mosaico | Zoom máximo |
|---|---|---|
| 2017 | **no disponible en esta zona** | — |
| 2018 | sí | 13 |
| 2019-2020 | sí | 10 |
| 2021-2025 | sí | 13 |
| 2026 | aún no publicado (se muestra 2025) | — |

Los años sin mosaico se marcan con asterisco en la tira: al seleccionarlos, el visor muestra el
mosaico disponible más cercano y lo indica en el panel de fondos. Las **estadísticas** sí cubren
2017-2026 completos (provienen del muestreo en Earth Engine, no del mosaico).

## 5. Cifras verificadas

| Indicador | Valor | Fuente |
|---|---|---|
| Superficie de la reserva (unión) | 3.749.725 ha | `serie_RESERVA.csv` |
| Bosque FAO 2025 en la reserva | 3.440.159 ha (91,7 %) — cotas 3.407.669-3.504.924 ha | Informe metodológico §4.2 bis |
| Vegetación densa 2025 (NDVI ≥ 0,70) | 3.639.688 ha (97,07 %) | muestreo de la unión |
| Bosque FAO por bloque | P1 83,6 % · P2 91,7 % · P3 83,1 % · P4 96,7 % · P5 94,3 % · P6 92,1 % | `clasificacion_fao_2025.csv` |
| Variación de la vegetación de la reserva 2019-2026 | −3.418 ha (−0,4σ: sin cambio estadístico) | informe §4 |

**Los bloques se solapan**: su suma (4.446.863 ha) supera la superficie de la unión
(3.749.725 ha), así que las cifras por bloque no son sumables. El nivel Reserva usa por eso la
estimación acotada.

## 6. Advertencia de integridad · capa de cobertura P6

La capa `P6_Imataca.tif` entregada por el usuario viene de la app de muestreo ejecutada en la
cuenta de comparación, y **su clase «Bosque (FAO)» está vacía (0 ha)**: la app evaluaba el
criterio de copa sobre la banda `lossyear` de Hansen sin `unmask(0)`, banda que solo tiene dato
donde hubo pérdida (~9 % del área). El resultado quedaba enmascarado en todo el bloque y el
bosque se reclasificaba como «otra vegetación».

- La app **ya está corregida** (`app_gee/imataca_fao_app.js`) y el detalle técnico consta en
  `app_gee/CORRECCION_APP_FAO.md`.
- Las cifras de bosque de este atlas **no** provienen de esa capa, sino de la corrida verificada
  del motor Python (tabla del §5).
- En el mapa, la clase 2 debe leerse como **«vegetación»** (bosque + otra vegetación).

## 7. Estructura

```
atlas_imataca/
  web/
    cesium/
      index.html          consola (CesiumJS + panel de estadísticas + riel)
      efectos.js          ClickSpark, SpotlightCard, Magnet, DecryptedText, CountUp, Aurora
                          (portados de ReactBits, MIT)
      mapas.js            catálogo de fondos + cobertura anual EOX + relieve 3D Mapterhorn
      datos.js            generado por atlas_datos.py (no editar a mano)
      data/               GeoJSON de bloques y reserva
      tiles_p6/xyz_clip/  tiles XYZ de la cobertura P6 (10 m) · paleta exacta, 8,1 MB
      tiles_n2/xyz/       tiles XYZ de la tipología N2 (30 m) · paleta exacta, 8,5 MB
      vendor/             CesiumJS 1.124 (Apache-2.0)
  trabajo/                intermediarios (GeoTIFF de trabajo, scripts de rasterizado)
  v1_web/                 versión anterior del atlas (referencia)
```

Generadores (raíz del espacio de trabajo): `atlas_datos.py` (datos.js),
`atlas_tiles.py` (tiles XYZ desde cualquier GeoTIFF en Web Mercator),
`imataca-gee/08_clasificacion_fao.py` y `imataca-gee/app_gee/imataca_fao_app.js`.

## 8. Pendientes conocidos

### 8.1 Tipología ecológica N2 — **publicada**

Capa ráster de 30 m y estadísticas por clase, ambas en el visor (casilla «Tipología N2» y
botón «Tipología N2 · estadísticas»). Áreas del recuento de píxeles del ráster publicado:

| Clase | ha | % | Clase | ha | % |
|---|---|---|---|---|---|
| Bosque Húmedo Tropical | 335.825 | 31,9 | Minería Activa | 28.206 | 2,7 |
| Bosque Siempreverde Estacional | 316.518 | 30,1 | Bosque Deciduo | 27.864 | 2,6 |
| Bosque de Pantano | 127.728 | 12,1 | Cuerpos de Agua | 8.226 | 0,8 |
| Manglar | 125.591 | 11,9 | Agrícola | 7.445 | 0,7 |
| Herbazal Pantano | 75.047 | 7,1 | | | |

Total clasificado: **1.052.448 ha** (sector norte de la reserva, 7,79-8,64° N, fuera de los
bloques P1-P6).

**Nota técnica (dos errores corregidos en el camino).** El origen es
`Clasificaciones/Area_N2_Reclas.gpkg`: 10 polígonos con 1,9 GB de geometría (hasta 31 M de
vértices por clase). Publicarla exigió resolver dos problemas reales:

1. `gdal_rasterize -a_srs` **no reproyecta** la geometría: solo declara el CRS de salida. Con
   coordenadas en grados y una extensión UTM el resultado eran rásteres vacíos — y como el
   proceso sí leía toda la geometría, parecía «lento» cuando en realidad no rasterizaba nada.
   La solución es reproyectar primero (`ogr2ogr -t_srs EPSG:32620`) y rasterizar después.
2. **El área geodésica que se publicó el 27-09 era incorrecta**: `ST_Area_Spheroid` de DuckDB
   subestimaba ~2×. Verificado contra dos métodos independientes —`pyproj` (geodesia pura) y el
   recuento de píxeles del ráster— que coinciden dentro del 0,01 % (clase 1: 349.594 vs 349.579
   ha). La tabla de arriba ya está corregida.

Para reproducirlo: `trabajo/publicar_n2.py` (simplificación por clase con DuckDB, base de datos
en disco) + `trabajo/reparar_n2.py` (reproyección, rasterizado y combinación) + 
`python atlas_tiles.py --tif trabajo/n2_colored.tif --salida atlas_imataca/web/cesium/tiles_n2/xyz --zmin 6 --zmax 13`.

### 8.2 Otros pendientes

- **Bosque FAO sobre la unión completa**: el cálculo directo excedió la cuota de cómputo; se
  reintentará por teselas cuando la cuota se restablezca (1 de octubre o nivel Contributor).
- **Capa P6**: conviene reexportarla con la app corregida en la cuenta de comparación y sustituir
  los tiles por los nuevos.
- 2026 es un año **parcial** (compuesto hasta septiembre) y sin mosaico propio.
- **Entrega por Telegram**: el bot `@GoyoZC_bot` no tiene conversación reciente, así que no hay
  `chat_id` al que enviar; basta con escribirle cualquier mensaje para habilitar el envío.
- Los tiles de ambas capas temáticas se generan con **paleta exacta y vecino más cercano**
  (`atlas_tiles_clases.py`): cada píxel conserva su código de clase y no aparecen colores
  intermedios inventados por el remuestreo. Además pesan una fracción del RGBA equivalente
  (P6: 8,1 MB frente a 43 MB; N2: 8,5 MB frente a 113 MB).
- **Reexportar la capa P6 requiere cuota de Earth Engine**: consultada hoy, la cuenta está en
  *modo restringido* por cuota agotada, así que la clasificación corregida no puede ejecutarse
  hasta el 1 de octubre (o desde la cuenta de comparación, que tiene su propia cuota).

## 9. Licencias y créditos

- CesiumJS 1.124 — Apache-2.0 (`vendor/`).
- ReactBits — MIT (componentes portados en `efectos.js`).
- God's Eye View (Bilawal Sidhu, MIT) — referencia de lenguaje visual.
- Sentinel-2 cloudless (EOX) — CC BY-NC-SA 4.0 · Sentinel-2 (ESA), Hansen GFC, ESA WorldCover,
  GEDI (NASA), JRC Global Surface Water — datos abiertos procesados en Google Earth Engine.
- Relieve 3D: Mapterhorn (tiles de elevación, uso libre).
- Elaboración propia: motor de muestreo, clasificación FAO, atlas y esta consola.
