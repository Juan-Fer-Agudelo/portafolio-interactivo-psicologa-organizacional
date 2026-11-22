import * as THREE from 'three';

function createCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export function createOakWoodTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = createCanvas(size);

  ctx.fillStyle = '#B78E65';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 2) {
    const wave = Math.sin(y * 0.045) * 10 + Math.cos(y * 0.015) * 6;
    const tone = 165 + Math.sin(y * 0.08 + wave * 0.05) * 18;
    ctx.fillStyle = `rgb(${Math.round(tone + 18)}, ${Math.round(tone - 18)}, ${Math.round(tone - 56)})`;
    ctx.fillRect(0, y, size, 2);
  }

  ctx.strokeStyle = 'rgba(92, 60, 32, 0.14)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 36; i++) {
    const startY = (i / 36) * size;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    for (let x = 0; x <= size; x += 32) {
      const offset = Math.sin(x * 0.02 + i * 0.8) * 5;
      ctx.lineTo(x, startY + offset);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createLinenWeaveTexture(
  maxAnisotropy: number,
  baseHex = '#ECE7DD',
  threadHex = '#DFD8CA',
): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = createCanvas(size);

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = threadHex;
  for (let y = 0; y < size; y += 4) {
    ctx.globalAlpha = 0.25 + ((y * 7) % 10) * 0.02;
    ctx.fillRect(0, y, size, 1.5);
  }
  for (let x = 0; x < size; x += 4) {
    ctx.globalAlpha = 0.22 + ((x * 5) % 10) * 0.02;
    ctx.fillRect(x, 0, 1.5, size);
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createPlasterWallTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = createCanvas(size);

  ctx.fillStyle = '#EFECE5';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 240; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 43758.5453) % 1;
    const px = Math.abs(x) * size;
    const py = Math.abs(y) * size;
    const r = 20 + (i % 45);
    const grad = ctx.createRadialGradient(px, py, 2, px, py, r);
    grad.addColorStop(0, i % 2 === 0 ? 'rgba(225, 219, 208, 0.14)' : 'rgba(255, 253, 248, 0.14)');
    grad.addColorStop(1, 'rgba(239, 236, 229, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = createCanvas(size);
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 4, half, half, half);
  grad.addColorStop(0, 'rgba(31, 36, 33, 0.55)');
  grad.addColorStop(0.55, 'rgba(31, 36, 33, 0.18)');
  grad.addColorStop(1, 'rgba(31, 36, 33, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
