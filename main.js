/* ============================================
   NoéGMedia - JavaScript Principal
   ============================================ */

// ─── CARGADOR ───
window.addEventListener('load', () => {
  setTimeout(() => {
    const cargador = document.getElementById('cargador');
    if (cargador) cargador.classList.add('oculto');
  }, 1300);
});

// ─── NAVBAR SCROLL ───
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

// ─── HAMBURGUESA MENÚ ───
const hamburguesa = document.getElementById('hamburguesa');
const navMovil = document.getElementById('nav-movil');
const cerrarNav = document.getElementById('cerrar-nav');

if (hamburguesa && navMovil) {
  hamburguesa.addEventListener('click', () => navMovil.classList.add('abierto'));
  cerrarNav?.addEventListener('click', () => navMovil.classList.remove('abierto'));
  navMovil.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMovil.classList.remove('abierto'));
  });
}

// ─── MARCAR ENLACE ACTIVO ───
const rutaActual = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar-menu a, .nav-movil a').forEach(enlace => {
  const href = enlace.getAttribute('href');
  if (href && (href === rutaActual || 
      (rutaActual === '' && href === 'index.html') ||
      (rutaActual === 'index.html' && href === 'index.html'))) {
    enlace.classList.add('activo');
  }
  if (href && rutaActual.includes('streaming') && href.includes('streaming')) enlace.classList.add('activo');
  if (href && rutaActual.includes('filmmaking') && href.includes('filmmaking')) enlace.classList.add('activo');
  if (href && rutaActual.includes('creative') && href.includes('creative')) enlace.classList.add('activo');
  if (href && rutaActual.includes('sobre') && href.includes('sobre')) enlace.classList.add('activo');
  if (href && rutaActual.includes('noticias') && href.includes('noticias')) enlace.classList.add('activo');
  if (href && rutaActual.includes('contacto') && href.includes('contacto')) enlace.classList.add('activo');
});

// ─── ANIMACIONES AL HACER SCROLL ───
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada, idx) => {
    if (entrada.isIntersecting) {
      setTimeout(() => {
        entrada.target.style.opacity = '1';
        entrada.target.style.transform = 'translateY(0)';
      }, idx * 80);
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.servicio-card, .diferencia-item, .categoria-card, .noticia-card, .feature-item, .stat-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observador.observe(el);
});

// ─── PARSER MARKDOWN SIMPLE ───
function parsearMarkdown(md) {
  if (!md) return '';
  let html = md;

  // Front matter (eliminar)
  html = html.replace(/^---[\s\S]*?---\n/, '');

  // H1-H6
  html = html.replace(/^#{6}\s(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#{1}\s(.+)$/gm, '<h1>$1</h1>');

  // Blockquote
  html = html.replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links e imágenes
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:1rem 0;">');
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Listas ul
  html = html.replace(/(^[-*]\s.+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[-*]\s/, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Listas ol
  html = html.replace(/(^\d+\.\s.+$\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\.\s/, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Párrafos (líneas que no son HTML)
  html = html.split('\n\n').map(bloque => {
    bloque = bloque.trim();
    if (!bloque) return '';
    if (bloque.startsWith('<')) return bloque;
    return `<p>${bloque.replace(/\n/g, ' ')}</p>`;
  }).join('\n');

  return html;
}

// ─── SISTEMA DE NOTICIAS ───
async function cargarNoticias() {
  const contenedor = document.getElementById('noticias-contenedor');
  if (!contenedor) return;

  // Lista de archivos de noticias (se actualiza manualmente o via build)
  const archivos = window.NOTICIAS_ARCHIVOS || [];

  if (archivos.length === 0) {
    // Intentar cargar el índice
    try {
      const res = await fetch('../noticias/indice.json');
      if (res.ok) {
        const data = await res.json();
        archivos.push(...data);
      }
    } catch(e) {
      // No hay índice, mostrar mensaje
    }
  }

  if (archivos.length === 0) {
    contenedor.innerHTML = '<p class="sin-noticias" style="color:var(--gris-texto);text-align:center;padding:3rem">Pronto publicaremos las primeras noticias.</p>';
    return;
  }

  const promesas = archivos.map(async (archivo) => {
    try {
      const res = await fetch(`../noticias/${archivo}`);
      const texto = await res.text();
      return { archivo, texto };
    } catch { return null; }
  });

  const resultados = (await Promise.all(promesas)).filter(Boolean);
  
  contenedor.innerHTML = resultados.map(({ archivo, texto }) => {
    const meta = extraerFrontMatter(texto);
    const slug = archivo.replace('.md', '');
    return tarjetaNoticia(meta, slug);
  }).join('');
}

function extraerFrontMatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { titulo: 'Sin título', fecha: '', categoria: '', resumen: '', emoji: '📰' };
  
  const meta = {};
  match[1].split('\n').forEach(linea => {
    const [clave, ...valor] = linea.split(':');
    if (clave && valor) meta[clave.trim()] = valor.join(':').trim().replace(/^["']|["']$/g, '');
  });
  return meta;
}

function tarjetaNoticia(meta, slug) {
  const emoji = meta.emoji || '📰';
  const cat = meta.categoria || 'Noticias';
  return `
  <article class="noticia-card" onclick="window.location.href='noticia.html?slug=${slug}'">
    <div class="noticia-thumb">
      <span class="noticia-thumb-cat">${cat}</span>
      <span class="noticia-emoji">${emoji}</span>
    </div>
    <div class="noticia-cuerpo">
      <div class="noticia-fecha">${formatearFecha(meta.fecha)}</div>
      <h3>${meta.titulo || 'Sin título'}</h3>
      <p>${meta.resumen || ''}</p>
      <span class="noticia-leer">Leer más →</span>
    </div>
  </article>`;
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  try {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return fechaStr; }
}

// ─── CARGAR ARTÍCULO ───
async function cargarArticulo() {
  const contenedor = document.getElementById('articulo-contenido');
  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) { contenedor.innerHTML = '<p>Artículo no encontrado.</p>'; return; }

  try {
    const res = await fetch(`../noticias/${slug}.md`);
    if (!res.ok) throw new Error('No encontrado');
    const texto = await res.text();
    const meta = extraerFrontMatter(texto);
    const cuerpo = texto.replace(/^---[\s\S]*?---\n/, '');

    document.title = `${meta.titulo} - NoéGMedia`;
    
    // Actualizar breadcrumb
    const breadcrumbTitulo = document.getElementById('breadcrumb-titulo');
    if (breadcrumbTitulo) breadcrumbTitulo.textContent = meta.titulo;

    // Rellenar meta
    const elTitulo = document.getElementById('articulo-titulo');
    const elFecha = document.getElementById('articulo-fecha');
    const elCat = document.getElementById('articulo-cat');
    if (elTitulo) elTitulo.textContent = meta.titulo;
    if (elFecha) elFecha.textContent = formatearFecha(meta.fecha);
    if (elCat) elCat.textContent = meta.categoria || 'Noticias';

    contenedor.innerHTML = parsearMarkdown(cuerpo);
  } catch(e) {
    contenedor.innerHTML = '<p style="color:var(--gris-texto)">Artículo no encontrado. <a href="noticias.html">Volver a noticias</a></p>';
  }
}

// ─── FORMULARIO CONTACTO ───
const formContacto = document.getElementById('form-contacto');
if (formContacto) {
  formContacto.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = formContacto.querySelector('button[type="submit"]');
    btn.textContent = '✓ Mensaje enviado';
    btn.disabled = true;
    btn.style.background = '#2d5a27';
    btn.style.color = '#fff';
    setTimeout(() => {
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
      btn.style.background = '';
      btn.style.color = '';
      formContacto.reset();
    }, 4000);
  });
}

// ─── INICIALIZAR SEGÚN PÁGINA ───
document.addEventListener('DOMContentLoaded', () => {
  cargarNoticias();
  cargarArticulo();
});
