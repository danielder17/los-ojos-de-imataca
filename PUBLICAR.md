# Publicar "Los Ojos de Imataca" · guía paso a paso

El atlas es un sitio **100 % estático** (HTML + JavaScript + datos): no necesita servidor de
aplicaciones ni base de datos, por lo que se publica **gratis** en GitHub + Vercel o directamente
en GitHub Pages.

**Estado actual (ya preparado):**

| Elemento | Estado |
|---|---|
| Repositorio local con commit inicial | `C:\Users\IGVSB\.zcode\workspace\default\publicacion` |
| Tamaño del sitio | **49,4 MB** · 3.084 archivos · archivo mayor ~5 MB |
| Configuración de despliegue | `vercel.json` incluido (caché de tiles y datos) |
| Herramienta GitHub CLI | `C:\Users\IGVSB\.zcode\workspace\default\herramientas\gh.exe` (v2.62.0) |
| Herramienta Vercel CLI | instalada globalmente (`vercel`, v62) |
| Respaldo comprimido | `Documents\Proyecto_Imataca\Los_Ojos_de_Imataca\publicacion_para_github.zip` (16,9 MB) |

---

## PASO 1 · Subir a GitHub

### 1.1 Autenticarte (una sola vez)

Abre una terminal (CMD o PowerShell) y ejecuta:

```bat
"C:\Users\IGVSB\.zcode\workspace\default\herramientas\gh.exe" auth login
```

Responde:

1. **What account do you want to log into?** → `GitHub.com`
2. **Preferred protocol?** → `HTTPS`
3. **Authenticate Git with your GitHub credentials?** → `Yes`
4. **How would you like to authenticate?** → `Login with a web browser`

Copia el código de un uso que aparece, se abrirá el navegador, pégalo y autoriza.

### 1.2 Crear el repositorio y subir el atlas

```bat
cd C:\Users\IGVSB\.zcode\workspace\default\publicacion
"C:\Users\IGVSB\.zcode\workspace\default\herramientas\gh.exe" repo create los-ojos-de-imataca --public --source=. --push
```

- Con `--public` el repositorio es visible para cualquiera (recomendado si el atlas es de difusión).
- Si prefieres mantenerlo **privado**, usa `--private`: Vercel también despliega repositorios
  privados en el plan gratuito, y el atlas seguirá siendo accesible por su URL pública.

Resultado: `https://github.com/Danielder/los-ojos-de-imataca`

---

## PASO 2 · Publicar en Vercel (recomendado)

### Opción A · Desde la web (la más simple, sin comandos)

1. Entra a [vercel.com](https://vercel.com) y elige **Sign Up → Continue with GitHub** (plan **Hobby**, gratis).
2. Autoriza a Vercel el acceso a tus repositorios.
3. **Add New… → Project → Import Git Repository** → elige `los-ojos-de-imataca`.
4. En la configuración del proyecto:
   - **Framework Preset:** `Other`
   - **Build Command:** *(dejar vacío)*
   - **Output Directory:** *(dejar vacío)*
   - **Root Directory:** `./`
   - **Environment Variables:** ninguna
5. **Deploy**. En ~1 minuto tendrás la URL: `https://los-ojos-de-imataca.vercel.app`

### Opción B · Con la CLI (si prefieres terminal)

```bat
cd C:\Users\IGVSB\.zcode\workspace\default\publicacion
vercel login
vercel --prod
```

`vercel login` abre el navegador para autorizar; `vercel --prod` publica y devuelve la URL.

---

## PASO 3 · Alternativa 100 % gratuita y sin terceros: GitHub Pages

Sirve el mismo repositorio, sin Vercel:

1. En GitHub, entra al repositorio → **Settings → Pages**.
2. **Source:** `Deploy from a branch` · **Branch:** `main` · carpeta `/ (root)` → **Save**.
3. En 1-2 minutos el atlas estará en
   `https://danielder.github.io/los-ojos-de-imataca/`

> GitHub Pages es gratis sin límite práctico para este tamaño (1 GB de sitio, 100 GB/mes de
> tráfico). Vercel ofrece mejor CDN y despliegues instantáneos en cada cambio. **Ambos son gratis**;
> puede usar los dos a la vez.

---

## PASO 4 · Actualizaciones futuras

Cada vez que cambies algo del atlas (una capa nueva, un dato corregido):

```bat
cd C:\Users\IGVSB\.zcode\workspace\default\publicacion
git add -A
git commit -m "Actualizo capa RFI Landsat"
git push
```

Vercel vuelve a desplegar **automáticamente** en ~1 minuto; GitHub Pages tarda 1-2 minutos.

---

## Costos y límites

| Concepto | Plan gratuito | ¿Alcanza para este atlas? |
|---|---|---|
| GitHub (repositorio) | Gratis · aviso si un archivo supera 50 MB · recomendado < 1 GB | Sí: 49 MB total, archivo mayor 5 MB |
| Vercel Hobby | Gratis · 100 GB de tráfico/mes · 100 MB por archivo · 15.000 archivos · 100 despliegues/día | Sí: 49 MB, 3.084 archivos, sin funciones de servidor |
| GitHub Pages | Gratis · 1 GB de sitio · 100 GB/mes de tráfico | Sí |
| **Dominio propio** (opcional) | ~US$ 10-12/año (ej. `ojosdeimataca.org`) | Se conecta gratis en Vercel → Domains, o en GitHub Pages → Custom domain |

**Nota sobre el plan Hobby de Vercel:** es para uso personal/no comercial. Este atlas es de difusión
institucional sin venta de servicios, por lo que encaja; si más adelante se le da un uso comercial,
correspondería el plan Pro (US$ 20/mes). Con GitHub Pages esa restricción no existe.

## Requisitos de conexión (importante)

El atlas es local, pero algunas capas se sirven desde servicios públicos **sin clave de API**:

- **Imágenes de fondo**: ESRI World Imagery, OpenStreetMap, EOX (Sentinel-2), Mapterhorn (relieve).
- **Serie RFI Landsat**: tiles de MapBiomas Venezuela (Earth Engine) — requieren conexión.

Sin internet el visor funciona, pero muestra el fondo oscuro y sin la capa Landsat del año.
No hace falta ninguna cuenta, token ni clave de Cesium ion.

## Verificación posterior al despliegue

Comprobar en la URL publicada:

1. El globo carga y aparecen los 6 bloques y el límite de la reserva.
2. Botón **RFI-LANDSAT** → tira de años 1985-2024, leyenda con las 16 tipologías y sus colores.
3. **RECORRIDO MULTITEMPORAL** anima los años; **COMPARAR AÑOS** abre la división y la tabla de deltas.
4. Consola del navegador (F12) sin errores en rojo.
