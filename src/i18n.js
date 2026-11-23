// Idiomas del sitio. El español es el texto original del HTML; el inglés se
// aplica encima reemplazando cada texto por su traducción (src/i18n/en.js).
import en from './i18n/en.js';

const STORAGE_KEY = 'lang';
const es = Object.fromEntries(Object.entries(en).map(([spanish, english]) => [english, spanish]));
const ATTRIBUTES = ['aria-label', 'alt', 'placeholder', 'title'];
const listeners = [];

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    /* sin almacenamiento: se decide por el idioma del navegador */
  }
  return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
}

let lang = initialLang();

/** Cuántas veces se ha pedido una traducción: sirve para saber qué texturas tienen texto. */
export const usage = { count: 0 };

export const getLang = () => lang;

/** Devuelve el texto en el idioma actual. Recibe siempre el texto en español. */
export function t(spanish) {
  usage.count++;
  return lang === 'en' && en[spanish] ? en[spanish] : spanish;
}

/** Traduce un texto cualquiera que ya esté en pantalla, en uno u otro idioma. */
function convert(text) {
  const key = text.replace(/\s+/g, ' ').trim();
  if (!key) return null;
  const table = lang === 'en' ? en : es;
  return Object.hasOwn(table, key) ? table[key] : null;
}

/** Aplica el idioma actual a todos los textos y atributos del documento. */
export function translateDocument(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, [data-no-translate]')) continue;
    const translated = convert(node.nodeValue);
    if (translated === null) continue;
    const lead = /^\s/.test(node.nodeValue) ? ' ' : '';
    const trail = /\s$/.test(node.nodeValue) ? ' ' : '';
    node.nodeValue = lead + translated + trail;
  }
  root.querySelectorAll(ATTRIBUTES.map((a) => `[${a}]`).join(',')).forEach((element) => {
    ATTRIBUTES.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      const translated = value && convert(value);
      if (translated) element.setAttribute(attribute, translated);
    });
  });
  document.documentElement.lang = lang;
  document.title = convert(document.title) ?? document.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = convert(description.content) ?? description.content;
}

export function onLangChange(callback) {
  listeners.push(callback);
}

export function setLang(next) {
  if (next === lang || (next !== 'es' && next !== 'en')) return;
  lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* el idioma se aplica igual, solo no se recuerda */
  }
  translateDocument();
  listeners.forEach((callback) => callback(lang));
}
