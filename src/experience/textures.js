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
  ctx.fillStyle = '#3a2618';
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
  t.repeat.set(5, 5);
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
    ctx.fillStyle = '#7a3420';
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
    ctx.fillStyle = '#f6ead6';
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
    ctx.strokeStyle = '#7a3420';
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
    node(w / 2, 70, '#cf6a32');
    node(140, 255, '#b5562f');
    node(w / 2, 255, '#e9b44c');
    node(w - 140, 255, '#8c3b3b');
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
    ctx.fillStyle = '#3a2618';
    ctx.font = `600 44px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Diploma', w / 2, 120);
    ctx.fillStyle = '#b9ad98';
    [165, 195, 225, 255].forEach((y, i) => {
      const lw = [280, 320, 240, 300][i];
      ctx.fillRect((w - lw) / 2, y, lw, 9);
    });
    // Sello
    ctx.fillStyle = '#cf6a32';
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
    ctx.fillStyle = hover ? '#4a3020' : '#2e1f18';
    ctx.fillRect(0, 0, w, h);
    // Barra superior
    ctx.fillStyle = hover ? '#6a4530' : '#443024';
    ctx.fillRect(0, 0, w, 58);
    ['#cf6a32', '#e9b44c', '#d9a366'].forEach((c, i) => {
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
    ctx.fillStyle = hover ? '#f4d58f' : '#d8c3a5';
    ctx.fillText(hover ? 'Clic para ver los proyectos  →' : 'Casos, talleres y publicaciones', 58, 196);
    // Tarjetas
    const colors = ['#d9a366', '#e9b44c', '#cf6a32'];
    for (let i = 0; i < 3; i++) {
      const x = 56 + i * 312;
      ctx.fillStyle = hover ? '#6a4530' : '#443024';
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
    ctx.fillStyle = '#cf6a32';
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
    ctx.fillStyle = '#3a2618';
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
  return tex(1200, 640, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(60, 28, 14, 0.75)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 6;
    // Escribe una línea reduciendo la letra hasta que quepa en el ancho
    const line = (text, y, size, weight, stroke) => {
      let px = size;
      do {
        ctx.font = `${weight} ${px}px ${FONT}`;
        px -= 4;
      } while (ctx.measureText(text).width > w - 70 && px > 20);
      ctx.strokeStyle = 'rgba(74, 34, 16, 0.6)';
      ctx.lineWidth = stroke;
      ctx.strokeText(text, w / 2, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, w / 2, y);
    };
    line('¡HOLA! SOY', 125, 190, 600, 12);
    line('MARÍA ANTONIA', 335, 190, 600, 12);
    line('Psicóloga · Generalista de Recursos Humanos', 525, 66, 600, 8);
  });
}

/* ---------- Cuadros con ícono ---------- */
function drawIcon(ctx, kind, cx, cy, s) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (kind === 'person') {
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.42, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.36, s * 0.58, s * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'briefcase') {
    ctx.lineWidth = s * 0.11;
    rounded(ctx, cx - s * 0.26, cy - s * 0.62, s * 0.52, s * 0.4, s * 0.1);
    ctx.stroke();
    rounded(ctx, cx - s * 0.7, cy - s * 0.36, s * 1.4, s * 0.98, s * 0.14);
    ctx.fill();
    // Línea del cierre, en un tono más oscuro
    ctx.fillStyle = 'rgba(120, 110, 60, 0.55)';
    ctx.fillRect(cx - s * 0.7, cy + s * 0.02, s * 1.4, s * 0.06);
    rounded(ctx, cx - s * 0.13, cy - s * 0.06, s * 0.26, s * 0.22, s * 0.05);
    ctx.fill();
  } else {
    // Birrete
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.6);
    ctx.lineTo(cx + s * 0.95, cy - s * 0.2);
    ctx.lineTo(cx, cy + s * 0.2);
    ctx.lineTo(cx - s * 0.95, cy - s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.5, cy + s * 0.12);
    ctx.lineTo(cx - s * 0.5, cy + s * 0.48);
    ctx.quadraticCurveTo(cx, cy + s * 0.8, cx + s * 0.5, cy + s * 0.48);
    ctx.lineTo(cx + s * 0.5, cy + s * 0.12);
    ctx.lineTo(cx, cy + s * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = s * 0.06;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.78, cy - s * 0.14);
    ctx.lineTo(cx - s * 0.78, cy + s * 0.5);
    ctx.stroke();
    rounded(ctx, cx - s * 0.86, cy + s * 0.46, s * 0.16, s * 0.3, s * 0.05);
    ctx.fill();
  }
}

/** Devuelve { map, glow }: el fondo redondeado con el ícono y su mapa de brillo. */
export function iconTextures(kind, background, aspect) {
  const W = 512;
  const H = Math.round(W / aspect);
  const s = Math.min(W, H) * 0.3;
  const map = tex(W, H, (ctx) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = background;
    rounded(ctx, 0, 0, W, H, 86);
    ctx.fill();
    drawIcon(ctx, kind, W / 2, H / 2, s);
  });
  const glow = tex(W, H, (ctx) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    drawIcon(ctx, kind, W / 2, H / 2, s);
  });
  return { map, glow };
}

/* ---------- Gato ---------- */
// Textura de la cabeza (esfera): el frente de la cara queda en u = 0.25.
export function catFaceTexture(base, patch, eyesOpen = false) {
  return tex(1024, 512, (ctx, w, h) => {
    const cx = w * 0.25;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    // Manchas: coronilla, nuca y los lados de la frente
    ctx.fillStyle = patch;
    ctx.fillRect(0, 0, w, 150);
    ctx.fillRect(520, 0, 480, h);
    ctx.beginPath();
    ctx.ellipse(cx - 150, 150, 120, 95, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 150, 150, 120, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    // Franja clara entre los ojos
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(cx, 120, 46, 130, 0, 0, Math.PI * 2);
    ctx.fill();
    // Mejillas
    ctx.fillStyle = 'rgba(240, 150, 140, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 118, 305, 34, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 118, 305, 34, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ojos cerrados y felices
    ctx.strokeStyle = '#2f2420';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    [-1, 1].forEach((side) => {
      const ex = cx + side * 80;
      if (eyesOpen) {
        ctx.fillStyle = '#2a1f1c';
        ctx.beginPath();
        ctx.ellipse(ex, 270, 23, 31, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + 8, 258, 9, 0, Math.PI * 2);
        ctx.arc(ex - 7, 283, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(ex, 272, 30, Math.PI * 1.13, Math.PI * 1.87);
        ctx.stroke();
      }
    });
    // Nariz y boca
    ctx.fillStyle = '#e8898a';
    ctx.beginPath();
    ctx.moveTo(cx - 13, 298);
    ctx.quadraticCurveTo(cx, 292, cx + 13, 298);
    ctx.quadraticCurveTo(cx, 320, cx - 13, 298);
    ctx.fill();
    ctx.strokeStyle = '#d0706f';
    ctx.lineWidth = 5;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(cx + side * 12, 316, 12, Math.PI * 0.08, Math.PI * 0.92);
      ctx.stroke();
    });
    // Bigotes cortos
    ctx.strokeStyle = patch;
    ctx.lineWidth = 6;
    [-1, 1].forEach((side) => {
      [-16, 4, 24].forEach((dy, i) => {
        ctx.beginPath();
        ctx.moveTo(cx + side * 150, 306 + dy);
        ctx.lineTo(cx + side * 182, 300 + dy + (i - 1) * 7);
        ctx.stroke();
      });
    });
  });
}

/** Botón "cambiar gato": pastilla con carita y nombre. */
export function catButtonTexture(name, base, patch) {
  return tex(512, 200, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#8a4326';
    rounded(ctx, 0, 0, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = '#f3d9c0';
    ctx.lineWidth = 10;
    rounded(ctx, 8, 8, w - 16, h - 16, h / 2 - 8);
    ctx.stroke();
    // Carita
    const cx = 110;
    const cy = 104;
    ctx.fillStyle = patch;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(cx + side * 52, cy - 14);
      ctx.lineTo(cx + side * 46, cy - 66);
      ctx.lineTo(cx + side * 10, cy - 42);
      ctx.fill();
    });
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 56, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.ellipse(cx - 30, cy - 26, 30, 22, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2f2420';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(cx + side * 22, cy + 4, 10, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    });
    ctx.fillStyle = '#e8898a';
    ctx.beginPath();
    ctx.arc(cx, cy + 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3d9c0';
    ctx.font = `600 62px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 325, 104);
  });
}

export function catLabelTexture() {
  return tex(512, 240, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(60, 28, 14, 0.75)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 92px ${FONT}`;
    ctx.fillText('CAMBIAR', w / 2, 66);
    ctx.fillText('GATO', w / 2, 168);
  });
}

// Papel de pared botánico de otoño: hojas, ramas y puntos dibujados por código.
// Es repetible en ambas direcciones (cada motivo se dibuja también desplazado).
export function wallpaperTexture() {
  const SIZE = 1024;
  let seed = 41;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const LEAF = ['#7a2e24', '#a5523a', '#8a4a34', '#6f6a3e', '#857a4a', '#5b4630', '#b06a4a'];
  const INK = '#33221b';

  // Hoja almendrada con nervio central y venas
  const leaf = (ctx, len, color) => {
    const w = len * 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w, -len * 0.25, w, -len * 0.75, 0, -len);
    ctx.bezierCurveTo(-w, -len * 0.75, -w, -len * 0.25, 0, 0);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.5, len * 0.022);
    ctx.beginPath();
    ctx.moveTo(0, len * 0.12);
    ctx.lineTo(0, -len * 0.94);
    for (let i = 1; i <= 4; i++) {
      const y = -len * (0.12 + i * 0.17);
      const reach = w * 0.62 * Math.sin((i / 5) * Math.PI);
      ctx.moveTo(0, y);
      ctx.lineTo(reach, y - len * 0.09);
      ctx.moveTo(0, y);
      ctx.lineTo(-reach, y - len * 0.09);
    }
    ctx.stroke();
  };

  // Rama con hojitas ovaladas en pares
  const branch = (ctx, len, color) => {
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.5, len * 0.02);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len);
    ctx.stroke();
    ctx.fillStyle = color;
    const pairs = 4;
    for (let i = 0; i < pairs; i++) {
      const y = -len * (0.2 + (i / pairs) * 0.68);
      const s = len * (0.2 - i * 0.02);
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(0, y);
        ctx.rotate(side * 0.95);
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.62, s * 0.3, s * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.beginPath();
    ctx.ellipse(0, -len * 1.04, len * 0.055, len * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // Ramita fina tipo helecho, solo trazos
  const sprig = (ctx, len, color) => {
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2.5, len * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len);
    for (let i = 1; i <= 5; i++) {
      const y = -len * (i / 6);
      const reach = len * (0.26 - i * 0.025);
      ctx.moveTo(0, y);
      ctx.lineTo(reach, y - reach * 0.75);
      ctx.moveTo(0, y);
      ctx.lineTo(-reach, y - reach * 0.75);
    }
    ctx.stroke();
  };

  // Disco con rayos (semilla / flor seca)
  const disc = (ctx, len, color) => {
    const r = len * 0.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.5, r * 0.07);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      ctx.moveTo(Math.cos(ang) * r * 0.25, Math.sin(ang) * r * 0.25);
      ctx.lineTo(Math.cos(ang) * r * 0.78, Math.sin(ang) * r * 0.78);
    }
    ctx.stroke();
  };

  const KINDS = [leaf, leaf, branch, branch, sprig, disc];

  // Se decide primero la lista de motivos para poder repetirla en los bordes
  const motifs = [];
  const cells = 6;
  const cell = SIZE / cells;
  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      motifs.push({
        draw: pick(KINDS),
        x: (cx + 0.5 + (rand() - 0.5) * 0.5) * cell,
        y: (cy + 0.5 + (rand() - 0.5) * 0.5) * cell,
        angle: (rand() - 0.5) * 2.4,
        len: cell * (0.82 + rand() * 0.36),
        color: pick(LEAF),
      });
    }
  }
  const specks = [];
  for (let i = 0; i < 110; i++) {
    specks.push({
      x: rand() * SIZE,
      y: rand() * SIZE,
      r: 3 + rand() * 9,
      ring: rand() > 0.8,
      color: pick([INK, '#7a2e24', '#a5523a', '#8a6a4f', '#6f6a3e']),
    });
  }

  const t = tex(SIZE, SIZE, (ctx, w) => {
    ctx.fillStyle = '#c9ae90';
    ctx.fillRect(0, 0, w, w);
    for (const dx of [-w, 0, w]) {
      for (const dy of [-w, 0, w]) {
        specks.forEach((s) => {
          ctx.beginPath();
          ctx.arc(s.x + dx, s.y + dy, s.r, 0, Math.PI * 2);
          if (s.ring) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 3;
            ctx.stroke();
          } else {
            ctx.fillStyle = s.color;
            ctx.fill();
          }
        });
        motifs.forEach((m) => {
          ctx.save();
          // El motivo se dibuja hacia arriba desde su base: se centra antes de girar
          ctx.translate(m.x + dx, m.y + dy);
          ctx.rotate(m.angle);
          ctx.translate(0, m.draw === disc ? 0 : m.len / 2);
          m.draw(ctx, m.len, m.color);
          ctx.restore();
        });
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
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

/* ---------- Pantallas del escritorio ---------- */
const PIXEL = '"Courier New", monospace';

function screenBase(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffcf8f';
  rounded(ctx, 0, 0, w, h, 70);
  ctx.fill();
  // Barra inferior
  ctx.strokeStyle = '#5a2e1e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, h - 96);
  ctx.lineTo(w, h - 96);
  ctx.stroke();
  ctx.fillStyle = '#f6a583';
  ctx.fillRect(26, h - 74, 44, 40);
  ctx.strokeRect(26, h - 74, 44, 40);
}

export function projectsScreenTexture(hover = false) {
  return tex(1024, 812, (ctx, w, h) => {
    screenBase(ctx, w, h);
    const bw = 700;
    const bh = 250;
    const bx = (w - bw) / 2;
    const by = 190;
    ctx.fillStyle = '#5a2e1e';
    rounded(ctx, bx + 12, by + 14, bw, bh, 22);
    ctx.fill();
    ctx.fillStyle = hover ? '#ffb27a' : '#f08a5c';
    rounded(ctx, bx, by, bw, bh, 22);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#5a2e1e';
    ctx.stroke();
    ctx.fillStyle = '#4a2416';
    ctx.font = `700 112px ${PIXEL}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PROYECTOS', w / 2, by + bh / 2 + 6);
  });
}

export function helloScreenTexture() {
  return tex(1024, 812, (ctx, w, h) => {
    screenBase(ctx, w, h);
    const ww = 640;
    const wh = 400;
    const wx = (w - ww) / 2;
    const wy = 130;
    ctx.fillStyle = '#ffbd80';
    rounded(ctx, wx, wy, ww, wh, 16);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#5a2e1e';
    ctx.stroke();
    ctx.fillStyle = '#f6a583';
    ctx.fillRect(wx + 3, wy + 3, ww - 6, 76);
    ctx.beginPath();
    ctx.moveTo(wx, wy + 80);
    ctx.lineTo(wx + ww, wy + 80);
    ctx.stroke();
    // Cerrar
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(wx + ww - 62, wy + 24);
    ctx.lineTo(wx + ww - 30, wy + 56);
    ctx.moveTo(wx + ww - 30, wy + 24);
    ctx.lineTo(wx + ww - 62, wy + 56);
    ctx.stroke();
    ctx.fillStyle = '#4a2416';
    ctx.font = `700 118px ${PIXEL}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Hola :)', w / 2, wy + 80 + (wh - 80) / 2 + 6);
  });
}
