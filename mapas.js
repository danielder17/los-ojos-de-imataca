/* ============================================================================
   Catálogo de mapas de fondo y relieve 3D — todo sin clave de API.
   Sentinel-2 multitemporal: mosaicos anuales sin nubes de EOX (CC BY-NC-SA 4.0),
   disponibles para 2017-2025; 2026 aún no publicado (se usa 2025 y se avisa).
   Relieve 3D: tiles de elevación Mapterhorn (codificación terrarium, CORS *),
   consumidos mediante un CustomHeightmapTerrainProvider de CesiumJS.
============================================================================ */
window.MAPAS = (function () {
  'use strict';

  const CREDITO_S2 = 'Sentinel-2 cloudless · EOX (CC BY-NC-SA 4.0)';
  /* Cobertura verificada tile a tile sobre la reserva (27-09-2026):
     2017 no tiene mosaico en esta zona; 2019 y 2020 solo hasta el zoom 10. */
  const MAX_POR_ANIO = {2018:13, 2019:10, 2020:10, 2021:13, 2022:13, 2023:13, 2024:13, 2025:13};
  const ANIOS_CON_MOSAICO = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const S2_MAX = 2025;
  const EOX = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-{anio}_3857/default/g/{z}/{y}/{x}.jpg';

  const CATALOGO = [
    { id: 's2',        nombre: 'Sentinel-2 anual (multitemporal)', proveedor: null, multitemporal: true,
      nota: 'Mosaico anual sin nubes · 2017-2025' },
    { id: 'esri-sat',  nombre: 'ESRI Satellite',   tipo: 'arcgis',
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      nota: 'Imagen de muy alta resolución' },
    { id: 'esri-topo', nombre: 'ESRI Topográfico', tipo: 'arcgis',
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
      nota: 'Base cartográfica con curvas' },
    { id: 'hillshade', nombre: 'Relieve sombreado', tipo: 'arcgis',
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer',
      nota: 'Sombreado global de pendientes' },
    { id: 'osm',       nombre: 'OpenStreetMap',    tipo: 'xyz',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', max: 19,
      nota: 'Cartografía colaborativa' },
    { id: 'opentopo',  nombre: 'OpenTopoMap',      tipo: 'xyz',
      url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png', max: 17,
      nota: 'Topografía de estilo suizo' },
    { id: 'carto',     nombre: 'Carto Oscuro',     tipo: 'xyz',
      url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', max: 19,
      nota: 'Fondo oscuro para datos' }
  ];

  /* Devuelve el año que realmente se puede mostrar: 2026 aún no está publicado y
     2017 no tiene mosaico sobre la reserva, así que se usa el más cercano disponible. */
  function anioS2(anio) {
    if (ANIOS_CON_MOSAICO.indexOf(anio) >= 0) return anio;
    if (anio > S2_MAX) return S2_MAX;
    return ANIOS_CON_MOSAICO[0];      // 2017 -> 2018
  }
  function hayMosaico(anio) { return ANIOS_CON_MOSAICO.indexOf(anio) >= 0; }

  function proveedorS2(anio) {
    const real = anioS2(anio);
    return new Cesium.UrlTemplateImageryProvider({
      url: EOX.replace('{anio}', real),
      maximumLevel: MAX_POR_ANIO[real] || 13,
      credit: CREDITO_S2
    });
  }

  function proveedor(id, anio) {
    const ficha = CATALOGO.find(c => c.id === id) || CATALOGO[0];
    if (ficha.multitemporal) return proveedorS2(anio);
    if (ficha.tipo === 'arcgis') {
      // En Cesium >= 1.104 los proveedores ArcGIS se crean con fromUrl()
      return Cesium.ArcGisMapServerImageryProvider.fromUrl(ficha.url);
    }
    return Promise.resolve(new Cesium.UrlTemplateImageryProvider({
      url: ficha.url, maximumLevel: ficha.max || 18, credit: ficha.nombre
    }));
  }

  /* ------------------------------------------------------------- relieve 3D */
  function proveedorRelieve() {
    const MAXZ = 12;              // zoom máximo publicado por Mapterhorn
    const LADO = 512;             // los tiles vienen en 512 px
    const MUESTRAS = 32;          // resolución que pide Cesium por tile de terreno
    const cache = new Map();
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = MUESTRAS;
    const ctx = lienzo.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;   // vecino más cercano: evita mezclar los canales de altura

    function descargar(z, x, y) {
      const clave = z + '/' + x + '/' + y;
      if (cache.has(clave)) return cache.get(clave);
      const promesa = new Promise((ok, fallo) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => ok(img);
        img.onerror = () => fallo(new Error('sin relieve ' + clave));
        img.src = 'https://tiles.mapterhorn.com/' + z + '/' + x + '/' + y + '.webp';
      });
      cache.set(clave, promesa);
      if (cache.size > 400) cache.delete(cache.keys().next().value);
      return promesa;
    }

    return new Cesium.CustomHeightmapTerrainProvider({
      width: MUESTRAS, height: MUESTRAS,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      callback: function (x, y, level) {
        const z = Math.min(level, MAXZ);
        const d = level - z;
        const tx = x >> d, ty = y >> d;
        return descargar(z, tx, ty).then(img => {
          const factor = Math.pow(2, d);
          const ventana = LADO / factor;
          const ox = (x - (tx << d)) * ventana;
          const oy = (y - (ty << d)) * ventana;
          ctx.clearRect(0, 0, MUESTRAS, MUESTRAS);
          ctx.drawImage(img, ox, oy, ventana, ventana, 0, 0, MUESTRAS, MUESTRAS);
          const datos = ctx.getImageData(0, 0, MUESTRAS, MUESTRAS).data;
          const alturas = new Float32Array(MUESTRAS * MUESTRAS);
          for (let i = 0, p = 0; i < alturas.length; i++, p += 4) {
            alturas[i] = datos[p] * 256 + datos[p + 1] + datos[p + 2] / 256 - 32768;  // terrarium
          }
          return alturas;
        });
      }
    });
  }

  return { CATALOGO, ANIOS_S2: ANIOS_CON_MOSAICO, ANIOS_CON_MOSAICO, S2_MAX,
           proveedor, proveedorS2, proveedorRelieve, anioS2, hayMosaico, CREDITO_S2 };
})();
