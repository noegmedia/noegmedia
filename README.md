# NoéGMedia — Web en GitHub Pages

Sitio web estático de **NoéGMedia** alojado en GitHub Pages con dominio personalizado `noegmedia.es`.

---

## 🗂️ Estructura del proyecto

```
noegmedia/
├── index.html                  ← Página de inicio
├── sobre-nosotros.html         ← Sobre NoéGMedia
├── noticias.html               ← Listado de noticias
├── noticia.html                ← Artículo individual (carga el .md por URL)
├── contacto.html               ← Formulario de contacto
├── 404.html                    ← Página de error 404
├── CNAME                       ← Dominio personalizado para GitHub Pages
│
├── proyectos/
│   ├── streaming.html
│   ├── filmmaking.html
│   └── creative.html
│
├── legal/
│   ├── privacidad-cookies.html
│   ├── terminos-web.html
│   └── terminos-servicios.html
│
├── noticias/
│   ├── indice.json             ← Lista de archivos de noticias (EDITAR AQUÍ)
│   └── bienvenida-noegmedia-github.md  ← Ejemplo de noticia
│
├── css/
│   └── style.css
├── js/
│   └── main.js
└── img/
    └── favicon.svg
```

---

## 🚀 Despliegue en GitHub Pages

### Paso 1 — Crear el repositorio

1. Ve a [github.com](https://github.com) e inicia sesión
2. Clic en **"New repository"**
3. Nombre: `noegmedia` (o el que prefieras, ej. `noegmedia.github.io`)
4. Visibilidad: **Public** (necesario para GitHub Pages gratuito)
5. Clic en **"Create repository"**

### Paso 2 — Subir los archivos

**Opción A — Desde GitHub web (más fácil):**
1. En el repositorio recién creado, haz clic en **"uploading an existing file"**
2. Arrastra toda la carpeta del proyecto
3. Escribe un commit message: `Primer despliegue NoéGMedia`
4. Clic en **"Commit changes"**

**Opción B — Desde terminal con Git:**
```bash
cd /ruta/a/noegmedia
git init
git add .
git commit -m "Primer despliegue NoéGMedia"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/noegmedia.git
git push -u origin main
```

### Paso 3 — Activar GitHub Pages

1. Ve a **Settings** del repositorio
2. En el menú lateral, clic en **Pages**
3. En "Source", selecciona **"Deploy from a branch"**
4. Branch: **main** / Folder: **/ (root)**
5. Clic en **Save**

Tras unos minutos, la web estará disponible en:
`https://TU_USUARIO.github.io/noegmedia`

### Paso 4 — Configurar el dominio noegmedia.es

#### En el panel de tu registrador de dominio, añade estos registros DNS:

```
Tipo    Nombre    Valor
A       @         185.199.108.153
A       @         185.199.109.153
A       @         185.199.110.153
A       @         185.199.111.153
CNAME   www       TU_USUARIO.github.io
```

#### En GitHub Pages (Settings → Pages):
1. En "Custom domain", escribe `noegmedia.es`
2. Clic en **Save**
3. Marca **"Enforce HTTPS"** (cuando esté disponible, ~24-48h)

El archivo `CNAME` ya está incluido en el proyecto con el dominio correcto.

---

## 📰 Cómo publicar noticias

### 1. Crea el archivo Markdown

Crea un nuevo archivo `.md` en la carpeta `noticias/` con este formato:

```markdown
---
titulo: "Título de tu noticia"
fecha: "2026-05-01"
categoria: "Streaming"
resumen: "Breve descripción de 1-2 frases que aparece en la tarjeta."
emoji: "📡"
---

## Introducción

Contenido de la noticia en **Markdown**.

## Sección 2

Más contenido...
```

**Emojis sugeridos por categoría:**
- Streaming: `📡`
- Filmmaking: `🎬`
- Creative: `✦` o `🎨`
- Marbella / Local: `🌊`
- Empresa / NoéGMedia: `🚀`
- Técnico / Equipo: `🎥`

### 2. Añade el archivo al índice

Edita `noticias/indice.json` y añade el nombre del archivo:

```json
[
  "mi-nueva-noticia.md",
  "bienvenida-noegmedia-github.md"
]
```

> ⚠️ El orden en el array determina el orden de aparición. Pon los más recientes primero.

### 3. Sube los cambios a GitHub

```bash
git add noticias/mi-nueva-noticia.md noticias/indice.json
git commit -m "Nueva noticia: Título de la noticia"
git push
```

La noticia aparecerá automáticamente en la web en segundos.

---

## 📧 Configurar el formulario de contacto

El formulario usa [Formspree](https://formspree.io) (gratuito hasta 50 envíos/mes):

1. Regístrate en [formspree.io](https://formspree.io)
2. Crea un nuevo formulario y copia tu ID (ej. `xpwzabcd`)
3. En `contacto.html`, busca esta línea y sustituye `XXXXXXXX`:
   ```html
   <form id="form-contacto" action="https://formspree.io/f/XXXXXXXX" method="POST">
   ```
4. Guarda, sube los cambios y listo.

**Alternativas gratuitas:** [Netlify Forms](https://www.netlify.com/products/forms/), [Web3Forms](https://web3forms.com), [EmailJS](https://www.emailjs.com).

---

## 🎨 Personalización rápida

### Cambiar colores (css/style.css)
```css
:root {
  --dorado: #c9a84c;        /* Color de acento principal */
  --negro: #0a0a0a;         /* Fondo principal */
  --negro-card: #161616;    /* Fondo de tarjetas */
}
```

### Añadir imágenes reales
Coloca tus imágenes en `img/` y reemplaza los fondos en las secciones hero. Por ejemplo:
```html
<div class="hero-bg" style="background-image:url('img/hero.jpg');background-size:cover"></div>
```

### Actualizar datos de contacto
Busca en `contacto.html` los apartados de ubicación, Instagram y LinkedIn y actualiza con los datos reales.

---

## 🔧 Mantenimiento

- Para editar textos: abre el `.html` correspondiente y modifica directamente
- Para añadir proyectos: duplica uno de los archivos en `proyectos/` y edita
- Para actualizar el footer o navbar: cada página tiene su propio navbar/footer (busca y reemplaza en todos los archivos si cambias algo global)

---

## 📄 Licencia

© 2026 NoéGMedia — Todos los derechos reservados.
Este código se proporciona únicamente para uso de NoéGMedia.
