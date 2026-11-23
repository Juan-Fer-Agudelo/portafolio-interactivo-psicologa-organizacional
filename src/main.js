import { Experience } from './experience/Experience.js';
import { Ambient } from './audio.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg class="icon"><use href="#i-${name}" /></svg>`;

const root = document.documentElement;
const backdrop = $('.backdrop');
let experience = null;
let lastFocus = null;

/* ---------- Paneles ---------- */
const openPanelEl = () => $('.panel.visible');

function openPanel(id) {
  const panel = document.getElementById(id);
  if (!panel || panel.classList.contains('visible')) return;
  $$('.panel.visible').forEach((p) => p.classList.remove('visible'));
  lastFocus = document.activeElement;
  panel.classList.add('visible');
  panel.scrollTop = 0;
  backdrop.classList.add('visible');
  root.classList.add('panel-open');
  $('.close-button', panel).focus({ preventScroll: true });
}

function closePanel(panel = openPanelEl()) {
  if (!panel) return;
  panel.classList.remove('visible');
  backdrop.classList.remove('visible');
  root.classList.remove('panel-open');
  window.dispatchEvent(new Event('panelclose'));
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

function showPanel(id) {
  if (experience) experience.showPanel(id);
  else openPanel(id);
}

$$('.close-button').forEach((button) => {
  button.addEventListener('click', () => closePanel(button.closest('.panel')));
});
backdrop.addEventListener('click', () => closePanel());

/* ---------- Menú ---------- */
const nav = $('.site-nav');
const navToggle = $('.nav-toggle');
const navList = $('.nav-list');
const menuIsOpen = () => nav.classList.contains('open');

function setMenu(open) {
  nav.classList.toggle('open', open);
  root.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navToggle.innerHTML = icon(open ? 'close' : 'menu');
}

navToggle.addEventListener('click', () => setMenu(!menuIsOpen()));
navList.addEventListener('click', (e) => {
  if (e.target === navList) setMenu(false);
});
$$('[data-panel]', nav).forEach((button) => {
  button.addEventListener('click', () => {
    setMenu(false);
    button.blur();
    if (openPanelEl()) return;
    showPanel(button.dataset.panel);
  });
});

/* ---------- Teclado: Escape y foco atrapado ---------- */
function trapFocus(e, container) {
  if (!container) return;
  const items = $$('a[href], button:not([disabled]), input, textarea', container).filter(
    (el) => el.offsetParent !== null
  );
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  } else if (!container.contains(document.activeElement)) {
    e.preventDefault();
    first.focus();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    setMenu(false);
    closePanel();
  } else if (e.key === 'Tab') {
    if (openPanelEl()) trapFocus(e, openPanelEl());
    else if (menuIsOpen()) trapFocus(e, nav);
  }
});

/* ---------- Música ---------- */
const ambient = new Ambient();
const audioButton = $('#audio-button');
audioButton.addEventListener('click', () => {
  const playing = ambient.toggle();
  audioButton.innerHTML = icon(playing ? 'sound-on' : 'sound-off');
  audioButton.setAttribute('aria-label', playing ? 'Pausar música' : 'Activar música');
  audioButton.setAttribute('aria-pressed', String(playing));
});

/* ---------- Pista de scroll ---------- */
const scrollHint = $('.scroll-hint');
const onScroll = () => {
  if (window.scrollY > 50) {
    scrollHint.classList.add('dismissed');
    window.removeEventListener('scroll', onScroll);
  }
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Pestañas de proyectos ---------- */
const tabs = [
  { button: $('#tab-a-btn'), section: $('#tab-a') },
  { button: $('#tab-b-btn'), section: $('#tab-b') },
];
tabs.forEach((tab) => {
  tab.button.addEventListener('click', () => {
    tabs.forEach((other) => {
      const active = other === tab;
      other.button.classList.toggle('active', active);
      other.button.setAttribute('aria-selected', String(active));
      other.section.classList.toggle('hidden', !active);
    });
  });
});

/* ---------- Formulario de contacto ---------- */
// MODO DEMO: el formulario todavía no envía correos.
// Conecta aquí tu servicio (EmailJS, Formspree, un backend propio...) dentro de sendMessage().
async function sendMessage(data) {
  console.info('Mensaje de contacto (modo demo, no enviado):', data);
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { demo: true };
}

const form = $('#contact-form');
const submitButton = $('#submit-button');
const formMessage = $('#form-message');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando…';
  formMessage.textContent = '';
  try {
    const result = await sendMessage(Object.fromEntries(new FormData(form)));
    formMessage.style.color = result.demo ? '#9a6b12' : '#2f7a4d';
    formMessage.textContent = result.demo
      ? 'Modo demo: el formulario aún no está conectado a un servicio de correo.'
      : '¡Mensaje enviado con éxito!';
    form.reset();
  } catch {
    formMessage.style.color = '#b3412b';
    formMessage.textContent = 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar mensaje';
  }
});

/* ---------- Aviso móvil ---------- */
const mobileNotice = $('.mobile-container');
if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760) {
  mobileNotice.style.display = 'flex';
}
$('#mobile-button').addEventListener('click', () => {
  mobileNotice.style.display = 'none';
});

/* ---------- Carga ---------- */
const loading = $('.loading-container');
const percentage = $('.loading-percentage');
let shown = 0;
let goal = 15;
let finished = false;

function tickProgress() {
  shown += Math.max(1, (goal - shown) * 0.12);
  shown = Math.min(shown, goal);
  percentage.textContent = `${Math.round(shown)}%`;
  if (shown >= 100) {
    if (!finished) {
      finished = true;
      window.setTimeout(() => loading.classList.add('done'), 250);
    }
    return;
  }
  requestAnimationFrame(tickProgress);
}

async function boot() {
  requestAnimationFrame(tickProgress);
  // Las texturas se dibujan con la fuente del sitio: hay que esperarla.
  try {
    await Promise.race([
      Promise.all([document.fonts.load('600 40px "Fredoka"'), document.fonts.load('500 40px "Fredoka"')]),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    /* si la fuente falla se usa la de reserva */
  }
  goal = 60;
  await new Promise((resolve) => requestAnimationFrame(resolve));

  try {
    experience = new Experience($('canvas.webgl'), {
      openPanel,
      isPanelOpen: () => !!openPanelEl(),
      label: $('.hover-label'),
    });
    window.experience = experience;
  } catch (error) {
    console.error('No se pudo iniciar la escena 3D:', error);
  }
  goal = 100;
}

boot();
