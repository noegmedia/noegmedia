# NoéGMedia — Repo limpio v2

Diseño verde andaluz · Outfit · GitHub Pages + Decap CMS

---

## Estructura completa

```
index.html                  ← Portada (hero vídeo + redes + café + contacto)
sobre-noegmedia.html        ← Sobre NoéGMedia
blog.html                   ← Listado del blog
build-blog.js               ← Genera HTML de artículos automáticamente
404.html                    ← Página de error
CNAME                       ← noegmedia.es
robots.txt                  ← SEO / bots
llms.txt                    ← Visibilidad en IAs (ChatGPT, Perplexity, Claude)
sitemap.xml                 ← Mapa del sitio

admin/
  index.html                ← Panel Decap CMS
  config.yml                ← Configuración del CMS (colección Blog)

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
  build-blog.yml            ← Action: genera HTMLs al publicar artículo
```

---

## ⚠️ Tras subir el repo

### 1. Sube el logo
Copia `img/logo-noegmedia.svg` desde el repo anterior.
Sin él el navbar aparece sin imagen.

### 2. Añade el vídeo de fondo
En `index.html` busca `TU_ID_VIDEO` (aparece dos veces) y reemplaza por el ID de tu vídeo de YouTube.
El ID es lo que va después de `?v=` en la URL:
```
youtube.com/watch?v=dQw4w9WgXcQ  →  ID: dQw4w9WgXcQ
```

### 3. Activa GitHub Pages
Settings → Pages → Branch: main / root → Save

### 4. Activa el workflow del blog
Actions → "Construir Blog" → Run workflow
Esto genera el HTML del artículo de ejemplo.

### 5. Accede al panel
`noegmedia.es/admin` → Login con Netlify Identity

---

## Publicar un artículo del blog

1. Ve a `noegmedia.es/admin`
2. Panel → Blog → Nuevo artículo
3. Rellena título, categoría, resumen y contenido
4. Publicar
5. En ~2 minutos aparece en `blog.html` y en el preview de `index.html`

---

## Colores de la web

| Variable      | Valor     | Uso                          |
|---------------|-----------|------------------------------|
| `--verde`     | `#007A4D` | Secciones, botones, acentos  |
| `--verde-o`   | `#005C3A` | Hover, sección contacto      |
| `--verde-c`   | `#E8F5EE` | Fondos suaves, tags          |
| `--blanco`    | `#FAFAF7` | Fondo principal              |
| `--negro`     | `#111210` | Textos principales, footer   |

Tipografía: **Outfit** (Google Fonts) — 400 cuerpo, 900 títulos
