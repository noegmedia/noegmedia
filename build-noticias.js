/**
 * build-noticias.js - NoéGMedia
 * Convierte los .md de /noticias/ en HTML estático con SEO completo.
 * Compatible con Decap CMS (usa "title" o "titulo" indistintamente).
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

// ─── FRONT MATTER ─────────────────────────────────────────────────────────────
function parseFrontMatter(contenido) {
  const match = contenido.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, cuerpo: contenido };

  const meta = {};
  match[1].split(/\r?\n/).forEach(linea => {
    const idx = linea.indexOf(':');
    if (idx === -1) return;
    const clave = linea.slice(0, idx).trim();
    const valor = linea.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    meta[clave] = valor;
  });

  // Decap CMS puede guardar "title" en vez de "titulo" → normalizamos
  if (!meta.titulo && meta.title)       meta.titulo    = meta.title;
  if (!meta.resumen && meta.summary)    meta.resumen   = meta.summary;
  if (!meta.categoria && meta.category) meta.categoria = meta.category;

  return { meta, cuerpo: match[2].trim() };
}

// ─── MARKDOWN → HTML ──────────────────────────────────────────────────────────
function mdAHtml(md) {
  let h = md
    .replace(/^> (.+)$/gm,   '<blockquote>$1</blockquote>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1rem 0">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,  '<a href="$2">$1</a>');

  h = h.replace(/(^[-*] .+$\n?)+/gm, bloque => {
    const items = bloque.trim().split('\n').map(l => `<li>${l.replace(/^[-*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });
  h = h.replace(/(^\d+\. .+$\n?)+/gm, bloque => {
    const items = bloque.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });
  h = h.split(/\n{2,}/).map(bloque => {
    bloque = bloque.trim();
    if (!bloque || bloque.startsWith('<')) return bloque;
    return `<p>${bloque.replace(/\n/g, ' ')}</p>`;
  }).join('\n');

  return h;
}

// ─── FECHA ────────────────────────────────────────────────────────────────────
function formatFecha(str) {
  if (!str) return '';
  try {
    const fecha = new Date(str.length === 10 ? str + 'T00:00:00Z' : str);
    return fecha.toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' });
  } catch { return str; }
}

// ─── LEER NOTICIAS ────────────────────────────────────────────────────────────
const DIR = 'noticias';
const archivos = readdirSync(DIR)
  .filter(f => f.endsWith('.md') && !f.startsWith('_'))
  .sort().reverse();

const noticias = archivos.map(archivo => {
  const slug = basename(archivo, '.md');
  const raw  = readFileSync(join(DIR, archivo), 'utf-8');
  const { meta, cuerpo } = parseFrontMatter(raw);
  return { slug, meta, cuerpo };
}).filter(n => {
  const pub = n.meta.publicado ?? n.meta.published ?? 'true';
  return String(pub).toLowerCase() !== 'false';
});

console.log(`\u{1F4F0} ${noticias.length} noticias encontradas`);
if (noticias.length === 0) {
  console.log('Revisa que los .md tienen publicado: true');
  process.exit(0);
}

// ─── EXTRAER NAVBAR Y FOOTER DE index.html ────────────────────────────────────
const indexHtml = readFileSync('index.html', 'utf-8');

const navbarMatch = indexHtml.match(/<nav class="navbar"[\s\S]*?<\/div>\s*\n*(?=\s*<!--)/);
const navbarHtml  = navbarMatch ? navbarMatch[0].trim() : '';

const footerMatch = indexHtml.match(/<footer[\s\S]*?<\/footer>/);
const footerHtml  = footerMatch ? footerMatch[0] : '';

if (!navbarHtml) console.warn('No se encontro navbar en index.html');
if (!footerHtml) console.warn('No se encontro footer en index.html');

// ─── GENERAR HTML POR ARTÍCULO ────────────────────────────────────────────────
for (const { slug, meta, cuerpo } of noticias) {
  const titulo    = meta.titulo    || 'Sin titulo';
  const resumen   = meta.resumen   || '';
  const fecha     = meta.fecha     || meta.date || '';
  const categoria = meta.categoria || 'Noticias';
  const canonical = `https://www.noegmedia.es/noticias/${slug}.html`;

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": titulo,
    "description": resumen,
    "datePublished": fecha ? new Date(fecha.length === 10 ? fecha + 'T00:00:00Z' : fecha).toISOString() : '',
    "author": { "@type": "Person", "name": "Noe G.", "url": "https://www.linkedin.com/in/noeg-media/" },
    "publisher": {
      "@type": "Organization", "name": "NoéGMedia", "url": "https://www.noegmedia.es",
      "logo": { "@type": "ImageObject", "url": "https://www.noegmedia.es/img/favicon.svg" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical }
  });

  const html = `<!DOCTYPE html>
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
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../css/style.css">
  <title>${titulo} | NoéGMedia</title>
  <script type="application/ld+json">${schema}<\/script>
  <style>
    .articulo-wrap{max-width:720px;margin:0 auto;padding:8rem 2rem 5rem}
    .articulo-meta{display:flex;gap:2rem;margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.06)}
    .articulo-meta span{font-family:var(--fuente-mono,monospace);font-size:.78rem;color:#777}
    .articulo-meta .cat{color:var(--dorado,#c9a84c)}
    .articulo-cuerpo h2{font-size:1.6rem;margin:2.5rem 0 1rem;font-family:var(--fuente-titulo,serif)}
    .articulo-cuerpo h3{font-size:1.15rem;margin:2rem 0 .8rem;font-family:var(--fuente-titulo,serif);font-style:normal}
    .articulo-cuerpo p{margin-bottom:1.2rem;line-height:1.8}
    .articulo-cuerpo ul,.articulo-cuerpo ol{padding-left:1.5rem;margin-bottom:1.2rem}
    .articulo-cuerpo li{margin-bottom:.4rem;font-size:.95rem}
    .articulo-cuerpo strong{color:var(--dorado,#c9a84c);font-weight:600}
    .articulo-cuerpo a{color:var(--dorado,#c9a84c)}
    .articulo-cuerpo blockquote{border-left:3px solid var(--dorado,#c9a84c);padding:.8rem 1.4rem;margin:1.8rem 0;font-style:italic;background:rgba(201,168,76,.04);border-radius:0 4px 4px 0}
    .breadcrumb{display:flex;align-items:center;gap:.5rem;font-size:.8rem;color:#777;margin-bottom:1.5rem}
    .breadcrumb a{color:#777}.breadcrumb a:hover{color:var(--dorado,#c9a84c)}
    .articulo-pie{display:flex;gap:1rem;flex-wrap:wrap;margin-top:4rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,0.06)}
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
  <div class="articulo-cuerpo">${mdAHtml(cuerpo)}</div>
  <div class="articulo-pie">
    <a href="../noticias.html" class="btn btn-secundario">← Volver a noticias</a>
    <a href="../contacto.html" class="btn btn-primario">Solicitar informacion</a>
  </div>
</div>
${footerHtml}
<script src="../js/main.js"><\/script>
</body>
</html>`;

  writeFileSync(join(DIR, `${slug}.html`), html, 'utf-8');
  console.log(`  OK noticias/${slug}.html`);
}

// ─── ACTUALIZAR noticias.html ─────────────────────────────────────────────────
const noticiasSrc = readFileSync('noticias.html', 'utf-8');

const tarjetas = noticias.map(({ slug, meta }) => {
  const emoji   = meta.emoji    || '📰';
  const cat     = meta.categoria || 'Noticias';
  const titulo  = meta.titulo   || 'Sin titulo';
  const resumen = meta.resumen  || '';
  const fecha   = meta.fecha    || meta.date || '';

  return `
    <article class="noticia-card" onclick="window.location='noticias/${slug}.html'" style="cursor:pointer">
      <div class="noticia-thumb">
        <span class="noticia-thumb-cat">${cat}</span>
        <span class="noticia-emoji">${emoji}</span>
      </div>
      <div class="noticia-cuerpo">
        <div class="noticia-fecha">${formatFecha(fecha)}</div>
        <h3 style="font-style:normal;font-size:1.05rem;font-weight:700;margin-bottom:0.65rem;color:var(--blanco,#f5f0eb);line-height:1.35">${titulo}</h3>
        <p>${resumen}</p>
        <a href="noticias/${slug}.html" class="noticia-leer">Leer mas</a>
      </div>
    </article>`;
}).join('\n');

const noticiasFinal = noticiasSrc.replace(
  /(<div id="noticias-contenedor"[^>]*>)[\s\S]*?(<\/div>\s*\n*\s*<!--)/,
  `$1\n${tarjetas}\n      $2`
);

if (noticiasFinal === noticiasSrc) {
  console.warn('AVISO: No se encontro #noticias-contenedor en noticias.html');
} else {
  writeFileSync('noticias.html', noticiasFinal, 'utf-8');
  console.log('  OK noticias.html actualizado');
}

console.log('\nBuild completado');
