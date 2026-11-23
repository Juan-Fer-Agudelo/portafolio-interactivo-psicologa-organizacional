import * as THREE from 'three';

// Todas las texturas se dibujan en canvas: no hay imágenes externas.
const FONT = '"Fredoka", "Trebuchet MS", sans-serif';

function tex(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function caption(ctx, w, h, text) {
  const bandH = h * 0.17;
  ctx.fillStyle = '#fbf5ea';
  ctx.fillRect(0, h - bandH, w, bandH);
  ctx.fillStyle = '#2d2a32';
  ctx.font = `600 ${bandH * 0.52}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h - bandH / 2);
}

export function floorTexture() {
  const t = tex(1024, 1024, (ctx, w, h) => {
    const tones = ['#b98558', '#b07a4f', '#bd8a5e', '#a87348', '#b47f53'];
    const planks = 8;
    const pw = w / planks;
    for (let i = 0; i < planks; i++) {
      ctx.fillStyle = tones[i % tones.length];
      ctx.fillRect(i * pw, 0, pw, h);
      // Vetas suaves
      ctx.strokeStyle = 'rgba(70, 40, 20, 0.10)';
      ctx.lineWidth = 2;
      for (let k = 1; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(i * pw + (pw * k) / 4, 0);
        ctx.lineTo(i * pw + (pw * k) / 4 + 6, h);
        ctx.stroke();
      }
      // Juntas
      ctx.fillStyle = 'rgba(60, 34, 18, 0.45)';
      ctx.fillRect(i * pw, 0, 4, h);
      const offset = ((i * 37) % 100) / 100;
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(i * pw, ((offset + j / 3) % 1) * h, pw, 4);
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 4);
  return t;
}

export function portraitTexture() {
  return tex(480, 600, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f6cfae');
    g.addColorStop(1, '#e99f8a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.4, w * 0.36, 0, Math.PI * 2);
    ctx.fill();
    // Silueta
    ctx.fillStyle = '#3f645e';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.94, w * 0.36, h * 0.3, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.4, w * 0.17, 0, Math.PI * 2);
    ctx.fill();
    caption(ctx, w, h, 'Sobre mí');
  });
}

export function experienceTexture() {
  return tex(680, 480, (ctx, w, h) => {
    ctx.fillStyle = '#e4efe9';
    ctx.fillRect(0, 0, w, h);
    // Organigrama
    const node = (x, y, color) => {
      ctx.fillStyle = color;
      rounded(ctx, x - 55, y - 28, 110, 56, 14);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(x - 28, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, y - 9, 44, 6);
      ctx.fillRect(x - 8, y + 3, 30, 6);
    };
    ctx.strokeStyle = '#3f645e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w / 2, 95);
    ctx.lineTo(w / 2, 160);
    ctx.moveTo(140, 225);
    ctx.lineTo(140, 160);
    ctx.lineTo(w - 140, 160);
    ctx.lineTo(w - 140, 225);
    ctx.moveTo(w / 2, 160);
    ctx.lineTo(w / 2, 225);
    ctx.stroke();
    node(w / 2, 70, '#d9785a');
    node(140, 255, '#5f8a83');
    node(w / 2, 255, '#e9b44c');
    node(w - 140, 255, '#7d6b9c');
    caption(ctx, w, h, 'Experiencia');
  });
}

export function educationTexture() {
  return tex(480, 600, (ctx, w, h) => {
    ctx.fillStyle = '#fbf5ea';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c9a44a';
    ctx.lineWidth = 8;
    ctx.strokeRect(26, 26, w - 52, h - 52 - h * 0.17);
    ctx.lineWidth = 2;
    ctx.strokeRect(42, 42, w - 84, h - 84 - h * 0.17);
    ctx.fillStyle = '#2d2a32';
    ctx.font = `600 44px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Diploma', w / 2, 120);
    ctx.fillStyle = '#b9ad98';
    [165, 195, 225, 255].forEach((y, i) => {
      const lw = [280, 320, 240, 300][i];
      ctx.fillRect((w - lw) / 2, y, lw, 9);
    });
    // Sello
    ctx.fillStyle = '#d9785a';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 34, 360);
    ctx.lineTo(w / 2 - 50, 450);
    ctx.lineTo(w / 2 - 12, 425);
    ctx.lineTo(w / 2, 372);
    ctx.moveTo(w / 2 + 34, 360);
    ctx.lineTo(w / 2 + 50, 450);
    ctx.lineTo(w / 2 + 12, 425);
    ctx.lineTo(w / 2, 372);
    ctx.fill();
    ctx.fillStyle = '#e9b44c';
    ctx.beginPath();
    ctx.arc(w / 2, 345, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbf5ea';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w / 2, 345, 32, 0, Math.PI * 2);
    ctx.stroke();
    caption(ctx, w, h, 'Formación');
  });
}

export function screenTexture(hover = false) {
  return tex(1024, 564, (ctx, w, h) => {
    ctx.fillStyle = hover ? '#2f4a59' : '#243442';
    ctx.fillRect(0, 0, w, h);
    // Barra superior
    ctx.fillStyle = hover ? '#3d5f70' : '#2e4355';
    ctx.fillRect(0, 0, w, 58);
    ['#d9785a', '#e9b44c', '#7fb5a8'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(34 + i * 34, 29, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#fbf5ea';
    ctx.font = `600 62px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Proyectos', 56, 150);
    ctx.font = `400 28px ${FONT}`;
    ctx.fillStyle = hover ? '#f4d58f' : '#9fb4c0';
    ctx.fillText(hover ? 'Clic para ver los proyectos  →' : 'Casos, talleres y publicaciones', 58, 196);
    // Tarjetas
    const colors = ['#7fb5a8', '#e9b44c', '#d9785a'];
    for (let i = 0; i < 3; i++) {
      const x = 56 + i * 312;
      ctx.fillStyle = hover ? '#3d5f70' : '#2e4355';
      rounded(ctx, x, 240, 288, 270, 22);
      ctx.fill();
      ctx.fillStyle = colors[i];
      const bars = [[0.5, 0.8, 0.6, 0.95], [0.9, 0.55, 0.7, 0.4], [0.35, 0.6, 0.85, 0.7]][i];
      bars.forEach((v, k) => {
        const bh = 150 * v;
        rounded(ctx, x + 34 + k * 58, 450 - bh, 40, bh, 8);
        ctx.fill();
      });
      ctx.fillStyle = 'rgba(251,245,234,0.75)';
      ctx.fillRect(x + 34, 468, 150, 10);
    }
  });
}

export function envelopeTexture() {
  return tex(512, 340, (ctx, w, h) => {
    ctx.fillStyle = '#fbf0d6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d6b979';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.beginPath();
    ctx.moveTo(6, 8);
    ctx.lineTo(w / 2, h * 0.58);
    ctx.lineTo(w - 6, 8);
    ctx.moveTo(6, h - 8);
    ctx.lineTo(w * 0.36, h * 0.42);
    ctx.moveTo(w - 6, h - 8);
    ctx.lineTo(w * 0.64, h * 0.42);
    ctx.stroke();
    ctx.fillStyle = '#d9785a';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.58, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbf0d6';
    ctx.font = `600 34px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@', w / 2, h * 0.58 + 1);
  });
}

export function clockTexture() {
  return tex(512, 512, (ctx, w) => {
    const c = w / 2;
    ctx.fillStyle = '#fbf5ea';
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d2a32';
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate((i / 12) * Math.PI * 2);
      const big = i % 3 === 0;
      ctx.fillRect(big ? -7 : -3.5, -c + 34, big ? 14 : 7, big ? 46 : 28);
      ctx.restore();
    }
  });
}

export function signTexture() {
  return tex(1400, 300, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fbf5ea';
    ctx.font = `600 150px ${FONT}`;
    ctx.fillText('Tu Nombre Aquí', w / 2, 105);
    ctx.fillStyle = '#f4d58f';
    ctx.font = `500 62px ${FONT}`;
    ctx.fillText('Psicóloga Organizacional', w / 2, 240);
  });
}

export function puffTexture() {
  return tex(64, 64, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
}
