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
