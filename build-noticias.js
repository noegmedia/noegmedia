/**
 * build-noticias.js
 * Lee los archivos .md de /noticias/ y genera:
 *   - Un HTML estático por cada noticia en /noticias/{slug}.html
 *   - El listado actualizado en /noticias.html
 *
 * Ejecutar: node build-noticias.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

// ─── PARSER DE FRONT MATTER ───────────────────────────────────────────────────
function parseFrontMatter(contenido) {
  const match = contenido.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, cuerpo: contenido };

  const meta = {};
  match[1].split('\n').forEach(linea => {
    const idx = linea.indexOf(':');
    if (idx === -1) return;
    const clave = linea.slice(0, idx).trim();
    const valor = linea.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    meta[clave] = valor;
  });

  return { meta, cuerpo: match[2].trim() };
}

// ─── PARSER MARKDOWN → HTML ───────────────────────────────────────────────────
function mdAHtml(md) {
  let h = md
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Negrita e itálica
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Imágenes y enlaces
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1rem 0">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Listas ul
  h = h.replace(/(^[-*] .+$\n?)+/gm, bloque => {
    const items = bloque.trim().split('\n')
      .map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Listas ol
  h = h.replace(/(^\d+\. .+$\n?)+/gm, bloque => {
    const items = bloque.trim().split('\n')
      .map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Párrafos (bloques separados por línea en blanco que no sean ya HTML)
  h = h.split(/\n{2,}/).map(bloque => {
    bloque = bloque.trim();
    if (!bloque || bloque.startsWith('<')) return bloque;
    return `<p>${bloque.replace(/\n/g, ' ')}</p>`;
  }).join('\n');

  return h;
}

// ─── FORMATEAR FECHA ──────────────────────────────────────────────────────────
function formatFecha(str) {
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return str; }
}

// ─── LEER NOTICIAS ────────────────────────────────────────────────────────────
const DIR = 'noticias';
const archivos = readdirSync(DIR)
  .filter(f => f.endsWith('.md') && !f.startsWith('_'))
  .sort()
  .reverse(); // más recientes primero (orden alfabético invertido si usas fecha en nombre)

const noticias = archivos.map(archivo => {
  const slug = basename(archivo, '.md');
  const raw  = readFileSync(join(DIR, archivo), 'utf-8');
  const { meta, cuerpo } = parseFrontMatter(raw);
  return { slug, meta, cuerpo, archivo };
}).filter(n => n.meta.publicado !== 'false');

console.log(`📰 ${noticias.length} noticias encontradas`);

// ─── LEER HTML BASE (navbar + footer del proyecto actual) ─────────────────────
// Tomamos index.html como referencia para extraer navbar y footer
const indexHtml = readFileSync('index.html', 'utf-8');

// Extraer navbar (desde <nav hasta el cierre del nav-mobile)
const navbarMatch = indexHtml.match(/<nav class="navbar"[\s\S]*?<\/div>\s*\n*<!-- HERO/);
const navbarHtml  = navbarMatch
  ? navbarMatch[0].replace('<!-- HERO', '').trim()
  : '<!-- navbar no encontrada -->';

// Extraer footer (desde <footer hasta </footer>)
const footerMatch = indexHtml.match(/<footer>[\s\S]*?<\/footer>/);
const footerHtml  = footerMatch ? footerMatch[0] : '<!-- footer no encontrado -->';

// ─── PLANTILLA HTML PARA CADA ARTÍCULO ───────────────────────────────────────
function plantillaArticulo({ slug, meta, cuerpoHtml }) {
  const titulo    = meta.titulo    || 'Noticia';
  const resumen   = meta.resumen   || '';
  const fecha     = meta.fecha     || '';
  const categoria = meta.categoria || 'Noticias';
  const canonical = `https://www.noegmedia.es/noticias/${slug}.html`;

  const schemaArticle = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": titulo,
    "description": resumen,
    "datePublished": fecha ? new Date(fecha).toISOString() : '',
    "author": {
      "@type": "Person",
      "name": "Noé G.",
      "url": "https://www.linkedin.com/in/noeg-media/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "NoéGMedia",
      "url": "https://www.noegmedia.es",
      "logo": { "@type": "ImageObject", "url": "https://www.noegmedia.es/img/favicon.svg" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical }
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${resumen.replace(/"/g, '&quot;')}">
  <meta property="og:title" content="${titulo.replace(/"/g, '&quot;')} | NoéGMedia">
  <meta property="og:description" content="${resumen.replace(/"/g, '&quot;')}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="es_ES">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titulo.replace(/"/g, '&quot;')} | NoéGMedia">
  <meta name="twitter:description" content="${resumen.replace(/"/g, '&quot;')}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../css/style.css">
  <title>${titulo} | NoéGMedia</title>
  <script type="application/ld+json">${schemaArticle}<\/script>
  <style>
    .articulo-wrap { max-width: 720px; margin: 0 auto; padding: 8rem 2rem 5rem; }
    .articulo-meta { display:flex; gap:2rem; margin-bottom:2.5rem; padding-bottom:1.5rem; border-bottom:1px solid rgba(255,255,255,0.06); }
    .articulo-meta span { font-family:var(--fuente-mono,monospace); font-size:0.78rem; color:#777; }
    .articulo-meta .cat { color:var(--dorado,#c9a84c); }
    .articulo-cuerpo h2 { font-size:1.6rem; margin:2.5rem 0 1rem; font-family:var(--fuente-titulo,serif); }
    .articulo-cuerpo h3 { font-size:1.15rem; margin:2rem 0 0.8rem; font-family:var(--fuente-titulo,serif); font-style:normal; }
    .articulo-cuerpo p  { margin-bottom:1.2rem; line-height:1.8; }
    .articulo-cuerpo ul, .articulo-cuerpo ol { padding-left:1.5rem; margin-bottom:1.2rem; }
    .articulo-cuerpo li { margin-bottom:0.4rem; font-size:0.95rem; }
    .articulo-cuerpo strong { color:var(--dorado,#c9a84c); font-weight:600; }
    .articulo-cuerpo a { color:var(--dorado,#c9a84c); }
    .articulo-cuerpo blockquote { border-left:3px solid var(--dorado,#c9a84c); padding:0.8rem 1.4rem; margin:1.8rem 0; font-style:italic; background:rgba(201,168,76,0.04); border-radius:0 4px 4px 0; }
    .breadcrumb { display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:#777; margin-bottom:1.5rem; }
    .breadcrumb a { color:#777; } .breadcrumb a:hover { color:var(--dorado,#c9a84c); }
    .articulo-pie { display:flex; gap:1rem; flex-wrap:wrap; margin-top:4rem; padding-top:2rem; border-top:1px solid rgba(255,255,255,0.06); }
  </style>
</head>
<body>

${navbarHtml}

<div class="articulo-wrap">
  <nav class="breadcrumb">
    <a href="../index.html">Inicio</a> <span>›</span>
    <a href="../noticias.html">Noticias</a> <span>›</span>
    <span>${titulo}</span>
  </nav>

  <div class="articulo-meta">
    <span>${formatFecha(fecha)}</span>
    <span class="cat">${categoria}</span>
  </div>

  <h1 style="margin-bottom:2.5rem">${titulo}</h1>

  <div class="articulo-cuerpo">
    ${cuerpoHtml}
  </div>

  <div class="articulo-pie">
    <a href="../noticias.html" class="btn btn-secundario">← Volver a noticias</a>
    <a href="../contacto.html" class="btn btn-primario">Solicitar información</a>
  </div>
</div>

${footerHtml}

<script src="../js/main.js"><\/script>
</body>
</html>`;
}

// ─── GENERAR HTML POR NOTICIA ─────────────────────────────────────────────────
for (const noticia of noticias) {
  const cuerpoHtml = mdAHtml(noticia.cuerpo);
  const html = plantillaArticulo({ ...noticia, cuerpoHtml });
  const destino = join(DIR, `${noticia.slug}.html`);
  writeFileSync(destino, html, 'utf-8');
  console.log(`  ✅ ${destino}`);
}

// ─── GENERAR LISTADO noticias.html ────────────────────────────────────────────
// Leer el noticias.html actual y reemplazar el bloque de tarjetas
const noticiasSrc = readFileSync('noticias.html', 'utf-8');

const tarjetas = noticias.map(({ slug, meta }) => {
  const emoji    = meta.emoji    || '📰';
  const cat      = meta.categoria || 'Noticias';
  const titulo   = meta.titulo   || 'Sin título';
  const resumen  = meta.resumen  || '';
  const fecha    = formatFecha(meta.fecha);

  return `
    <article class="noticia-card" onclick="window.location='noticias/${slug}.html'">
      <div class="noticia-thumb">
        <span class="noticia-thumb-cat">${cat}</span>
        <span class="noticia-emoji">${emoji}</span>
      </div>
      <div class="noticia-cuerpo">
        <div class="noticia-fecha">${fecha}</div>
        <h2 class="noticia-h2">${titulo}</h2>
        <p>${resumen}</p>
        <a href="noticias/${slug}.html" class="noticia-leer">Leer más →</a>
      </div>
    </article>`;
}).join('\n');

// Reemplazar el contenedor de noticias (entre los comentarios del bloque)
const noticiasFinal = noticiasSrc.replace(
  /(<div id="noticias-contenedor"[^>]*>)[\s\S]*?(<\/div>)/,
  `$1\n${tarjetas}\n    $2`
);

writeFileSync('noticias.html', noticiasFinal, 'utf-8');
console.log('  ✅ noticias.html actualizado');

console.log('\n🎉 Build completado');
