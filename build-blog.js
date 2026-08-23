/**
 * build-blog.js - NoéGMedia
 * Genera HTML estático de cada artículo .md en /blog/
 * Soporta: imagen destacada, filtro por categoría (data-categoria), emoji fallback
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
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,   '<em>$1</em>')
    .replace(/`(.+?)`/g,     '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
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
    return new Date(str.length === 10 ? str + 'T00:00:00Z' : str)
      .toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' });
  } catch { return str; }
}
function fechaISO(str) {
  if (!str) return '';
  try { return new Date(str.length === 10 ? str + 'T00:00:00Z' : str).toISOString(); }
  catch { return ''; }
}

// ─── LEER ARTÍCULOS ───────────────────────────────────────────────────────────
const DIR = 'blog';
const archivos = readdirSync(DIR)
  .filter(f => f.endsWith('.md') && !f.startsWith('_'))
  .sort().reverse();

const articulos = archivos.map(archivo => {
  const slug = basename(archivo, '.md');
  const raw  = readFileSync(join(DIR, archivo), 'utf-8');
  const { meta, cuerpo } = parseFrontMatter(raw);
  return { slug, meta, cuerpo };
}).filter(a => {
  const pub = a.meta.publicado ?? a.meta.published ?? 'true';
  return String(pub).toLowerCase() !== 'false';
});

console.log(`📝 ${articulos.length} artículos encontrados`);
if (articulos.length === 0) { console.log('Sin artículos publicados.'); process.exit(0); }

// ─── GENERAR HTML POR ARTÍCULO ────────────────────────────────────────────────
for (const { slug, meta, cuerpo } of articulos) {
  const titulo    = meta.titulo    || 'Sin título';
  const resumen   = meta.resumen   || '';
  const fecha     = meta.fecha     || meta.date || '';
  const categoria = meta.categoria || 'Blog';
  const tags      = meta.tags      || '';
  const imagen    = meta.imagen    || '';   // ruta desde la raíz: /img/blog/foto.jpg
  const canonical = `https://www.noegmedia.es/blog/${slug}.html`;

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": titulo,
    "description": resumen,
    "datePublished": fechaISO(fecha),
    "keywords": tags,
    ...(imagen ? { "image": `https://www.noegmedia.es${imagen}` } : {}),
    "author": { "@type": "Person", "name": "Noé G.", "url": "https://www.linkedin.com/in/noeg-media/" },
    "publisher": { "@type": "Organization", "name": "NoéGMedia", "url": "https://www.noegmedia.es",
      "logo": { "@type": "ImageObject", "url": "https://www.noegmedia.es/img/favicon.svg" } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical }
  });

  const tagsHtml = tags
    ? tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')
    : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${resumen.replace(/"/g,'&quot;')}">
  <meta property="og:title" content="${titulo.replace(/"/g,'&quot;')} — NoéGMedia">
  <meta property="og:description" content="${resumen.replace(/"/g,'&quot;')}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="es_ES">
  ${imagen ? `<meta property="og:image" content="https://www.noegmedia.es${imagen}">` : ''}
  <meta name="twitter:card" content="${imagen ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${titulo.replace(/"/g,'&quot;')} — NoéGMedia">
  <meta name="twitter:description" content="${resumen.replace(/"/g,'&quot;')}">
  ${imagen ? `<meta name="twitter:image" content="https://www.noegmedia.es${imagen}">` : ''}
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="../img/favicon.svg" type="image/svg+xml">
  <title>${titulo} — NoéGMedia</title>
  <script type="application/ld+json">${schema}<\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;900&display=swap" rel="stylesheet">
  <style>
    :root{--verde:#007A4D;--verde-o:#005C3A;--verde-c:#E8F5EE;--blanco:#FAFAF7;--negro:#111210;--gris:#6B7280;--t:0.35s cubic-bezier(0.4,0,0.2,1)}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'Outfit',system-ui,sans-serif;font-weight:400;background:var(--blanco);color:var(--negro);overflow-x:hidden}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--verde);border-radius:2px}
    a{color:inherit;text-decoration:none}img{max-width:100%;display:block}

    .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 3rem;display:flex;align-items:center;justify-content:space-between;background:rgba(250,250,247,0.96);backdrop-filter:blur(12px);box-shadow:0 1px 0 rgba(0,122,77,0.1)}
    .nav-logo{height:32px}.nav-links{display:flex;align-items:center;gap:2.5rem;list-style:none}
    .nav-links a{font-size:0.9rem;font-weight:500;color:var(--negro);transition:color var(--t)}.nav-links a:hover,.nav-links a.activo{color:var(--verde)}
    .nav-contacto{font-size:0.85rem;font-weight:600;padding:0.55rem 1.4rem;border-radius:100px;border:1.5px solid var(--verde);color:var(--verde);transition:all var(--t)}.nav-contacto:hover{background:var(--verde);color:#fff}
    .burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px}.burger span{display:block;width:22px;height:1.5px;background:var(--negro)}
    .nav-mobile{display:none;position:fixed;inset:0;z-index:99;background:var(--verde-o);flex-direction:column;align-items:center;justify-content:center;gap:2.5rem}
    .nav-mobile.open{display:flex}.nav-mobile a{font-size:2rem;font-weight:900;color:#fff}
    .nav-mobile-close{position:absolute;top:1.5rem;right:2rem;background:none;border:none;color:rgba(255,255,255,0.5);font-size:1rem;cursor:pointer}

    .art-wrap{max-width:720px;margin:0 auto;padding:7rem 2rem 6rem}
    .breadcrumb{display:flex;align-items:center;gap:0.5rem;font-size:0.78rem;color:var(--gris);margin-bottom:3rem}
    .breadcrumb a{color:var(--gris);transition:color var(--t)}.breadcrumb a:hover{color:var(--verde)}
    .art-cat{font-size:0.72rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--verde);display:flex;align-items:center;gap:0.7rem;margin-bottom:1rem}
    .art-cat::before{content:'';width:22px;height:1.5px;background:var(--verde)}
    .art-titulo{font-size:clamp(1.8rem,5vw,3.2rem);font-weight:900;line-height:1.05;letter-spacing:-0.03em;color:var(--negro);margin-bottom:1.5rem}
    .art-meta{display:flex;align-items:center;gap:1.5rem;padding:1.2rem 0;border-top:1px solid rgba(0,122,77,0.1);border-bottom:1px solid rgba(0,122,77,0.1);margin-bottom:2.5rem}
    .art-fecha,.art-autor{font-size:0.82rem;font-weight:500;color:var(--gris)}

    /* Imagen destacada */
    .art-imagen{width:100%;max-height:440px;object-fit:cover;border-radius:16px;margin-bottom:2.5rem;border:1px solid rgba(0,122,77,0.08);box-shadow:0 8px 32px rgba(0,122,77,0.1)}

    .art-cuerpo h2{font-size:1.5rem;font-weight:900;letter-spacing:-0.02em;color:var(--negro);margin:2.5rem 0 1rem;padding-left:1rem;border-left:3px solid var(--verde)}
    .art-cuerpo h3{font-size:1.15rem;font-weight:700;color:var(--negro);margin:2rem 0 0.8rem}
    .art-cuerpo p{margin-bottom:1.3rem;line-height:1.85;color:var(--gris);font-size:1rem}
    .art-cuerpo ul,.art-cuerpo ol{padding-left:1.5rem;margin-bottom:1.3rem}
    .art-cuerpo li{margin-bottom:0.5rem;line-height:1.7;color:var(--gris)}
    .art-cuerpo strong{color:var(--negro);font-weight:600}
    .art-cuerpo em{font-style:italic}
    .art-cuerpo a{color:var(--verde);font-weight:500;border-bottom:1px solid rgba(0,122,77,0.25);transition:border-color var(--t)}.art-cuerpo a:hover{border-color:var(--verde)}
    .art-cuerpo code{font-size:0.85rem;background:var(--verde-c);color:var(--verde-o);padding:0.15rem 0.5rem;border-radius:4px}
    .art-cuerpo blockquote{border-left:3px solid var(--verde);padding:1rem 1.5rem;margin:2rem 0;background:var(--verde-c);border-radius:0 10px 10px 0}
    .art-cuerpo blockquote p{color:var(--verde-o);font-style:italic;margin:0}
    .art-cuerpo img{border-radius:12px;margin:1.5rem 0;border:1px solid rgba(0,122,77,0.1)}

    .art-tags{display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(0,122,77,0.1)}
    .tag{font-size:0.72rem;font-weight:500;letter-spacing:0.06em;padding:0.3rem 0.8rem;background:var(--verde-c);color:var(--verde-o);border-radius:100px}
    .compartir{margin-top:2.5rem;padding:2rem;background:#fff;border:1px solid rgba(0,122,77,0.1);border-radius:16px}
    .compartir-titulo{font-size:0.72rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--gris);margin-bottom:1rem}
    .compartir-btns{display:flex;gap:0.7rem;flex-wrap:wrap}
    .share-btn{font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:500;padding:0.55rem 1.1rem;border:1.5px solid rgba(0,122,77,0.15);border-radius:100px;color:var(--gris);background:none;cursor:pointer;transition:all var(--t);display:inline-flex;align-items:center;gap:0.4rem;text-decoration:none}.share-btn:hover{border-color:var(--verde);color:var(--verde)}
    .art-pie{display:flex;gap:1rem;flex-wrap:wrap;margin-top:3rem}
    .btn-volver{font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:500;padding:0.75rem 1.8rem;border-radius:100px;border:1.5px solid rgba(0,122,77,0.2);color:var(--gris);transition:all var(--t);display:inline-flex;align-items:center;gap:0.5rem}.btn-volver:hover{border-color:var(--verde);color:var(--verde)}
    .btn-contacto{font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:600;padding:0.75rem 1.8rem;border-radius:100px;background:var(--verde);color:#fff;border:none;cursor:pointer;transition:all var(--t);display:inline-flex;align-items:center;gap:0.5rem}.btn-contacto:hover{background:var(--verde-o);transform:translateY(-2px)}
    footer{background:var(--negro);padding:2.5rem 3rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
    .footer-logo{height:28px;filter:brightness(0) invert(0.35)}
    .footer-copy{font-size:0.78rem;color:rgba(255,255,255,0.25)}
    .footer-legal{display:flex;gap:1.5rem}
    .footer-legal a{font-size:0.75rem;color:rgba(255,255,255,0.25);transition:color var(--t)}.footer-legal a:hover{color:rgba(255,255,255,0.6)}
    @media(max-width:900px){.nav{padding:1rem 1.5rem}.nav-links,.nav-contacto{display:none}.burger{display:flex}.art-wrap{padding:6rem 1.5rem 5rem}footer{flex-direction:column;text-align:center}}
  </style>
</head>
<body>
<nav class="nav">
  <a href="../index.html"><img src="../img/logo-noegmedia.svg" alt="NoéGMedia" class="nav-logo"></a>
  <ul class="nav-links">
    <li><a href="../index.html">Inicio</a></li>
    <li><a href="../blog.html" class="activo">Blog</a></li>
    <li><a href="../sobre-noegmedia.html">Sobre NoéGMedia</a></li>
    <li><a href="../index.html#contacto" class="nav-contacto">Contacto</a></li>
  </ul>
  <button class="burger" id="burger"><span></span><span></span><span></span></button>
</nav>
<div class="nav-mobile" id="nav-mobile">
  <button class="nav-mobile-close" id="close-nav">cerrar ✕</button>
  <a href="../index.html">Inicio</a>
  <a href="../blog.html">Blog</a>
  <a href="../sobre-noegmedia.html">Sobre NoéGMedia</a>
  <a href="../index.html#contacto">Contacto</a>
</div>

<div class="art-wrap">
  <nav class="breadcrumb">
    <a href="../index.html">Inicio</a> <span>›</span>
    <a href="../blog.html">Blog</a> <span>›</span>
    <span>${titulo}</span>
  </nav>
  <div class="art-cat">${categoria}</div>
  <h1 class="art-titulo">${titulo}</h1>
  <div class="art-meta">
    <time class="art-fecha" datetime="${fechaISO(fecha)}">${formatFecha(fecha)}</time>
    <span class="art-autor">por Noé G.</span>
  </div>
  ${imagen ? `<img src="../${imagen}" alt="${titulo}" class="art-imagen">` : ''}
  <div class="art-cuerpo">${mdAHtml(cuerpo)}</div>
  ${tagsHtml ? `<div class="art-tags">${tagsHtml}</div>` : ''}
  <div class="compartir">
    <div class="compartir-titulo">Compartir</div>
    <div class="compartir-btns">
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener" class="share-btn">in LinkedIn</a>
      <a href="https://x.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(titulo)}" target="_blank" rel="noopener" class="share-btn">𝕏 Twitter</a>
      <button class="share-btn" onclick="navigator.clipboard.writeText('${canonical}').then(()=>{this.textContent='✓ Copiado'});setTimeout(()=>{this.textContent='🔗 Copiar enlace'},2000)">🔗 Copiar enlace</button>
    </div>
  </div>
  <div class="art-pie">
    <a href="../blog.html" class="btn-volver">← Volver al blog</a>
    <a href="../index.html#contacto" class="btn-contacto">¿Hablamos? →</a>
  </div>
</div>

<footer>
  <img src="../img/logo-noegmedia.svg" alt="NoéGMedia" class="footer-logo">
  <span class="footer-copy">© 2026 NoéGMedia · Marbella, Andalucía</span>
  <div class="footer-legal">
    <a href="../legal/privacidad-cookies.html">Privacidad</a>
    <a href="../legal/terminos-servicios.html">Términos</a>
  </div>
</footer>
<script>
  document.getElementById('burger').addEventListener('click',()=>document.getElementById('nav-mobile').classList.add('open'));
  document.getElementById('close-nav').addEventListener('click',()=>document.getElementById('nav-mobile').classList.remove('open'));
<\/script>
</body>
</html>`;

  writeFileSync(join(DIR, `${slug}.html`), html, 'utf-8');
  console.log(`  ✅ blog/${slug}.html`);
}

// ─── ACTUALIZAR blog.html ─────────────────────────────────────────────────────
const blogSrc = readFileSync('blog.html', 'utf-8');

const tarjetas = articulos.map(({ slug, meta }) => {
  const titulo   = meta.titulo    || 'Sin título';
  const resumen  = meta.resumen   || '';
  const fecha    = meta.fecha     || meta.date || '';
  const cat      = meta.categoria || 'Blog';
  const emoji    = meta.emoji     || '📝';
  const imagen   = meta.imagen    || '';

  const thumbStyle = imagen
    ? `style="background-image:url('${imagen}');background-size:cover;background-position:center"`
    : '';
  const thumbIco = imagen ? '' : `<span class="blog-card-thumb-ico">${emoji}</span>`;

  return `
    <a href="blog/${slug}.html" class="blog-card" data-categoria="${cat}">
      <div class="blog-card-thumb" ${thumbStyle}>
        <span class="blog-cat">${cat}</span>
        ${thumbIco}
      </div>
      <div class="blog-card-body">
        <div class="blog-fecha">${formatFecha(fecha)}</div>
        <h2 class="blog-titulo">${titulo}</h2>
        <p class="blog-resumen">${resumen}</p>
        <span class="blog-leer">Leer artículo →</span>
      </div>
    </a>`;
}).join('\n');

const blogFinal = blogSrc.replace(
  /(<div id="blog-contenedor"[^>]*>)[\s\S]*?(<\/div>\s*\n*\s*<!--)/,
  `$1\n${tarjetas}\n    $2`
);

if (blogFinal !== blogSrc) {
  writeFileSync('blog.html', blogFinal, 'utf-8');
  console.log('  ✅ blog.html actualizado');
} else {
  console.warn('  ⚠️  No se encontró #blog-contenedor en blog.html');
}

// ─── ACTUALIZAR PREVIEW EN index.html ────────────────────────────────────────
const indexSrc = readFileSync('index.html', 'utf-8');

const preview = articulos.slice(0, 3).map(({ slug, meta }) => {
  const titulo  = meta.titulo    || 'Sin título';
  const resumen = meta.resumen   || '';
  const fecha   = meta.fecha     || meta.date || '';
  const cat     = meta.categoria || 'Blog';
  const emoji   = meta.emoji     || '📝';
  const imagen  = meta.imagen    || '';

  const thumbStyle = imagen
    ? `style="background-image:url('${imagen}');background-size:cover;background-position:center"`
    : '';
  const thumbIco = imagen ? '' : `<span class="blog-card-thumb-ico">${emoji}</span>`;

  return `
    <a href="blog/${slug}.html" class="blog-card" data-categoria="${cat}">
      <div class="blog-card-thumb" ${thumbStyle}>
        <span class="blog-cat">${cat}</span>
        ${thumbIco}
      </div>
      <div class="blog-card-body">
        <div class="blog-fecha">${formatFecha(fecha)}</div>
        <h2 class="blog-titulo">${titulo}</h2>
        <p class="blog-resumen">${resumen}</p>
        <span class="blog-leer">Leer artículo →</span>
      </div>
    </a>`;
}).join('\n');

const indexFinal = indexSrc.replace(
  /(<div id="blog-preview"[^>]*>)[\s\S]*?(<\/div>\s*\n*\s*<!--)/,
  `$1\n${preview}\n    $2`
);

if (indexFinal !== indexSrc) {
  writeFileSync('index.html', indexFinal, 'utf-8');
  console.log('  ✅ index.html preview actualizado');
}

console.log('\n🎉 Build completado');
