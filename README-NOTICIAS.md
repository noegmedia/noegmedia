# Añadir sistema de noticias con panel de administración

Esta guía explica exactamente qué archivos añadir al repositorio `noegmedia/noegmedia` y cómo configurar el panel de administración web para publicar noticias.

---

## Archivos que hay que añadir al repo

```
.github/
  workflows/
    build-noticias.yml     ← Automatización: genera el HTML al publicar
build-noticias.js          ← Script que convierte .md → HTML estático
noticias/
  _plantilla.md            ← Plantilla de referencia (no se publica)
public/
  admin/
    index.html             ← Panel de administración web
    config.yml             ← Configuración del CMS
```

Las páginas HTML existentes **no se tocan**.

---

## Paso 1 — Preparar noticias.html

El script necesita encontrar el contenedor de noticias en `noticias.html`.  
Asegúrate de que el `<div>` del listado tenga exactamente este id:

```html
<div id="noticias-contenedor" class="noticias-grid">
  <!-- Las noticias se cargan dinámicamente -->
</div>
```

Ábrelo en GitHub y comprueba que ese `id="noticias-contenedor"` existe.  
Si ya lo tiene (viene del proyecto original), no hay que cambiar nada.

---

## Paso 2 — Subir los archivos al repo

1. Ve a `github.com/noegmedia/noegmedia`
2. Sube los archivos manteniendo la estructura de carpetas:
   - `.github/workflows/build-noticias.yml`
   - `build-noticias.js`
   - `noticias/_plantilla.md`
   - `public/admin/index.html`
   - `public/admin/config.yml`

**Truco:** En GitHub puedes arrastrar carpetas enteras al explorador del repo.

---

## Paso 3 — Activar GitHub Actions

1. Ve a tu repo → pestaña **Actions**
2. Si aparece un aviso "Workflows aren't being run", haz clic en **"I understand my workflows, go ahead and enable them"**
3. Listo. A partir de ahora, cada vez que se suba o edite un `.md` en la carpeta `noticias/`, GitHub Actions ejecutará el build automáticamente.

Para probarlo manualmente:
- Actions → "Construir Noticias" → "Run workflow" → "Run workflow"

---

## Paso 4 — Configurar el panel de administración (Decap CMS)

El panel en `/admin` necesita autenticarse con tu cuenta de GitHub.  
Como GitHub Pages no tiene servidor propio, se usa un **proxy de autenticación gratuito**.

### 4a — Crear la GitHub OAuth App

1. Ve a **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Rellena:
   - **Application name:** `NoéGMedia CMS`
   - **Homepage URL:** `https://www.noegmedia.es`
   - **Authorization callback URL:** `https://sveltia-cms-auth.pages.dev/callback`
3. Haz clic en **Register application**
4. Anota el **Client ID** y genera un **Client Secret**

### 4b — Desplegar el proxy de autenticación (gratis, 5 minutos)

1. Ve a **cloudflare.com** y crea una cuenta gratuita (si no tienes)
2. Ve a **Workers & Pages → Create → Pages → Connect to Git**
3. Conecta tu GitHub y selecciona el repo: `sveltia/sveltia-cms-auth`  
   *(Si no aparece, haz fork de `https://github.com/sveltia/sveltia-cms-auth` primero)*
4. En la configuración del deploy, añade estas variables de entorno:
   - `GITHUB_CLIENT_ID` → el Client ID de tu OAuth App
   - `GITHUB_CLIENT_SECRET` → el Client Secret
5. Deploy. Cloudflare te dará una URL del tipo `https://sveltia-cms-auth-xxx.pages.dev`

### 4c — Actualizar config.yml con tu URL

Edita `public/admin/config.yml` y cambia esta línea:

```yaml
base_url: https://sveltia-cms-auth.pages.dev
```

por la URL que te dio Cloudflare:

```yaml
base_url: https://sveltia-cms-auth-xxx.pages.dev   # la tuya
```

---

## Paso 5 — Acceder al panel

Una vez configurado todo, ve a:

```
https://www.noegmedia.es/admin/
```

1. Haz clic en **"Login with GitHub"**
2. Autoriza el acceso a tu repositorio
3. Ya estás dentro del panel

### Publicar una noticia:

1. Panel → **Noticias** → **Nueva noticia**
2. Rellena título, categoría, resumen y contenido
3. Haz clic en **Publicar**
4. GitHub Actions detecta el nuevo `.md` y en ~2 minutos genera el HTML estático
5. La noticia aparece en la web con SEO completo

---

## Cómo funciona el build

```
Escribes en el panel → se guarda .md en /noticias/ en el repo
         ↓
GitHub Actions detecta el cambio y ejecuta build-noticias.js
         ↓
El script lee todos los .md y genera:
  - /noticias/{slug}.html   → página de cada artículo (HTML estático, SEO completo)
  - /noticias.html          → listado actualizado con las tarjetas
         ↓
Los archivos generados se suben al repo automáticamente
         ↓
GitHub Pages los sirve como HTML estático
```

---

## Publicar sin el panel (opcional)

Si prefieres escribir en un editor de texto, también funciona:

1. Copia `noticias/_plantilla.md`
2. Renómbrala con el slug del artículo, ej: `noticias/streaming-gala-marbella.md`
3. Rellena el frontmatter y el contenido
4. Sube el archivo al repo (desde GitHub web o con `git push`)
5. GitHub Actions genera el HTML automáticamente

---

## Solución de problemas

**El panel no carga o da error de autenticación**  
→ Revisa que la "Authorization callback URL" en la OAuth App coincide exactamente con la URL de Cloudflare + `/callback`

**El build no se ejecuta al subir un .md**  
→ Ve a Actions y comprueba que el workflow está habilitado. También puedes ejecutarlo manualmente con "Run workflow".

**noticias.html no se actualiza**  
→ Asegúrate de que el `div` con `id="noticias-contenedor"` existe en `noticias.html`
