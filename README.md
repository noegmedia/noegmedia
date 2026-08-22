# NoéGMedia — Repo limpio v3

Diseño verde andaluz · Outfit · GitHub Pages · Editor propio sin dependencias externas

---

## Estructura completa

```
index.html                  ← Portada (hero vídeo + redes + café + contacto)
sobre-noegmedia.html        ← Sobre NoéGMedia
blog.html                   ← Listado del blog
editor.html                 ← Editor del blog (acceso con token GitHub)
build-blog.js               ← Genera HTML de artículos automáticamente
404.html                    ← Página de error
CNAME                       ← noegmedia.es
robots.txt                  ← SEO / bots
llms.txt                    ← Visibilidad en IAs (ChatGPT, Perplexity, Claude)
sitemap.xml                 ← Mapa del sitio

blog/
  _plantilla.md             ← Plantilla de referencia (no se publica)
  streaming-multicamara-equipo-compacto.md  ← Artículo de ejemplo

img/
  favicon.svg               ← Favicon (elemento decorativo de la web)
  logo-noegmedia.svg        ← ⚠️ SUBIR MANUALMENTE desde el repo anterior

legal/
  privacidad-cookies.html
  terminos-web.html
  terminos-servicios.html

.github/workflows/
  build-blog.yml            ← Action: genera HTMLs al publicar un artículo
```

---

## ⚠️ Tras subir el repo — checklist

### 1. Sube el logo
Copia `img/logo-noegmedia.svg` desde el repo anterior.
Sin él el navbar aparece sin imagen en ninguna página.

### 2. Añade el vídeo de fondo del hero
En `index.html` busca `TU_ID_VIDEO` (aparece dos veces en el iframe) y sustitúyelo por el ID real de tu vídeo de YouTube.

El ID es lo que va después de `?v=` en la URL:
```
youtube.com/watch?v=dQw4w9WgXcQ  →  ID: dQw4w9WgXcQ
```

### 3. Activa GitHub Pages
Settings → Pages → Branch: main / root → Save

### 4. Activa el workflow del blog
Actions → "Construir Blog" → Run workflow
Genera el HTML del artículo de ejemplo.

---

## Cómo publicar artículos del blog

El blog tiene su propio editor en `editor.html`.
No necesitas Netlify, Decap CMS ni nada externo.

### Primer acceso al editor

1. Ve a `noegmedia.es/editor.html`
2. Crea un **Personal Access Token** en GitHub:
   - github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - New token → Scope: `repo` → Generate
3. Rellena en el login:
   - **Usuario**: `noegmedia`
   - **Repositorio**: `noegmedia`
   - **Token**: el que acabas de crear
4. El token se guarda en el navegador — solo necesitas hacerlo una vez

### Publicar un artículo

1. Abre `noegmedia.es/editor.html`
2. Clic en **+ Nuevo**
3. Rellena: título, categoría, fecha, resumen, emoji, tags
4. Escribe el contenido en la pestaña **Escribir** (Markdown)
5. Activa el toggle **Publicado**
6. Clic en **Publicar**
7. En ~2 minutos el artículo aparece en `blog.html` y en el preview de `index.html`

### Atajos de teclado del editor

| Atajo         | Acción              |
|---------------|---------------------|
| `Ctrl+S`      | Guardar / Publicar  |
| `Ctrl+N`      | Nuevo artículo      |

---

## Flujo técnico completo

```
Editor → guarda .md en blog/ via GitHub API
       ↓
GitHub Action detecta el nuevo .md
       ↓
build-blog.js genera:
  - blog/{slug}.html   (HTML estático con SEO completo)
  - blog.html          (listado actualizado)
  - index.html         (preview de los 3 últimos artículos)
       ↓
GitHub Pages sirve todo como HTML estático
```

---

## Colores

| Variable    | Valor     | Uso                        |
|-------------|-----------|----------------------------|
| `--verde`   | `#007A4D` | Secciones, botones, navbar |
| `--verde-o` | `#005C3A` | Hover, sección contacto    |
| `--verde-c` | `#E8F5EE` | Fondos suaves, tags        |
| `--blanco`  | `#FAFAF7` | Fondo principal            |
| `--negro`   | `#111210` | Textos, footer             |

Tipografía: **Outfit** (Google Fonts) — 400 cuerpo · 900 títulos
