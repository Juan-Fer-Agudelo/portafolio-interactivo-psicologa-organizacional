import * as THREE from 'three';
import gsap from 'gsap';
import {
  floorTexture,
  portraitTexture,
  experienceTexture,
  educationTexture,
  screenTexture,
  envelopeTexture,
  clockTexture,
  signTexture,
  puffTexture,
} from './textures.js';

const C = {
  wall: '#5f8a83',
  wainscot: '#f1e6d3',
  wood: '#8a5a3c',
  woodDark: '#6b4530',
  woodLight: '#c79a6b',
  cream: '#fbf5ea',
  mustard: '#e9b44c',
  terracotta: '#d9785a',
  plum: '#7d6b9c',
  dark: '#2b2a33',
  green: '#4f8f5b',
  greenDark: '#3a7049',
};

// Aleatorio determinista para que la escena sea siempre igual.
function seeded(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const std = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...opts });

function shadow(mesh, cast = true, receive = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

function box(parent, w, h, d, material, x = 0, y = 0, z = 0) {
  const mesh = shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function cyl(parent, rTop, rBottom, h, material, x = 0, y = 0, z = 0, segments = 24) {
  const mesh = shadow(new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function sphere(parent, r, material, x = 0, y = 0, z = 0) {
  const mesh = shadow(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), material));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export class Room {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.targets = [];
    this.rand = seeded(7);

    this.buildLights();
    this.buildShell();
    this.buildSign();
    this.buildFrames();
    this.buildDesk();
    this.buildShelves();
    this.buildClock();
    this.buildFloorItems();
    this.buildCat();
    this.buildFairyLights();
  }

  /* ---------- Registro de objetos interactivos ---------- */
  addTarget({ group, size, offset = [0, 0, 0], label, panel = null, onClick = null, onHover = null }) {
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.set(...offset);
    group.add(hit);
    const target = { group, hit, label, panel, onClick, onHover };
    this.targets.push(target);
    return target;
  }

  get hitMeshes() {
    return this.targets.map((t) => t.hit);
  }

  targetFromHit(hit) {
    return this.targets.find((t) => t.hit === hit) || null;
  }

  targetFromPanel(panel) {
    return this.targets.find((t) => t.panel === panel) || null;
  }

  setHover(target, active) {
    if (target.onHover) {
      target.onHover(active);
      return;
    }
    const s = active ? 1.05 : 1;
    gsap.to(target.group.scale, { x: s, y: s, z: s, duration: 0.4, ease: 'power2.out' });
  }

  /* ---------- Luces ---------- */
  buildLights() {
    this.scene.add(new THREE.AmbientLight('#fff1e0', 1.0));
    this.scene.add(new THREE.HemisphereLight('#fff6ea', '#7a5a45', 0.7));

    const sun = new THREE.DirectionalLight('#fff3e2', 1.9);
    sun.position.set(-5, 10, 9);
    sun.target.position.set(0, 2, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 9;
    sun.shadow.camera.bottom = -4;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.03;
    sun.shadow.radius = 4;
    this.scene.add(sun, sun.target);
  }

  /* ---------- Paredes y piso ---------- */
  buildShell() {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), std(C.wall, { roughness: 0.95 }));
    wall.position.set(0, 6, 0);
    wall.receiveShadow = true;
    this.group.add(wall);

    // Zócalo de madera clara
    box(this.group, 26, 1.25, 0.06, std(C.wainscot), 0, 0.625, 0.03);
    box(this.group, 26, 0.09, 0.1, std(C.cream), 0, 1.29, 0.05);
    box(this.group, 26, 0.22, 0.1, std(C.cream), 0, 0.11, 0.05);
    const groove = std('#dccdb4');
    for (let x = -12.5; x <= 12.5; x += 0.62) {
      box(this.group, 0.03, 0.95, 0.07, groove, x, 0.72, 0.03).castShadow = false;
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      std('#ffffff', { map: floorTexture(), roughness: 0.7 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 13);
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  buildSign() {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 0.985),
      new THREE.MeshBasicMaterial({ map: signTexture(), transparent: true, toneMapped: false })
    );
    sign.position.set(0.6, 5.6, 0.02);
    this.group.add(sign);
  }

  /* ---------- Cuadros (Sobre mí, Experiencia, Formación) ---------- */
  buildFrames() {
    const make = (w, h, texture, x, y, frameColor, label, panel) => {
      const g = new THREE.Group();
      g.position.set(x, y, 0.07);
      box(g, w + 0.2, h + 0.2, 0.1, std(frameColor));
      const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std('#ffffff', { map: texture, roughness: 0.6 }));
      art.position.z = 0.052;
      g.add(art);
      // Clavo y cuerda
      const stringMat = std('#3a332f');
      const l = box(g, 0.02, 0.36, 0.02, stringMat, -0.16, h / 2 + 0.24, -0.03);
      l.rotation.z = -0.75;
      const r = box(g, 0.02, 0.36, 0.02, stringMat, 0.16, h / 2 + 0.24, -0.03);
      r.rotation.z = 0.75;
      sphere(g, 0.04, std('#c9c2b8', { metalness: 0.6, roughness: 0.3 }), 0, h / 2 + 0.37, -0.02);
      this.group.add(g);
      this.addTarget({ group: g, size: [w + 0.2, h + 0.2, 0.2], label, panel });
      return g;
    };

    this.frames = [
      make(1.2, 1.5, portraitTexture(), -1.75, 3.85, C.woodLight, 'Sobre mí', 'about-panel'),
      make(1.7, 1.2, experienceTexture(), 0.6, 4.05, C.woodDark, 'Experiencia', 'experience-panel'),
      make(1.2, 1.5, educationTexture(), 2.95, 3.85, C.mustard, 'Formación', 'education-panel'),
    ];
  }

  /* ---------- Escritorio ---------- */
  buildDesk() {
    const desk = new THREE.Group();
    desk.position.set(0.6, 0, 0.95);
    this.group.add(desk);

    const wood = std(C.wood);
    const TOP = 1.5; // altura de la superficie
    box(desk, 5.2, 0.1, 1.6, std(C.woodLight), 0, TOP - 0.05, 0);
    [[-2.45, -0.65], [-2.45, 0.65], [1.0, -0.65], [1.0, 0.65]].forEach(([x, z]) => {
      box(desk, 0.12, TOP - 0.1, 0.12, wood, x, (TOP - 0.1) / 2, z);
    });
    // Cajonera
    box(desk, 1.3, 1.25, 1.45, wood, 1.85, 0.775, 0);
    [1.08, 0.5].forEach((y) => {
      box(desk, 1.12, 0.48, 0.04, std(C.woodLight), 1.85, y, 0.735);
      sphere(desk, 0.05, std(C.mustard, { metalness: 0.4, roughness: 0.4 }), 1.85, y, 0.78);
    });

    // --- Monitor (Proyectos) ---
    const monitor = new THREE.Group();
    monitor.position.set(0, TOP, -0.35);
    desk.add(monitor);
    const dark = std(C.dark, { roughness: 0.5 });
    cyl(monitor, 0.34, 0.38, 0.05, dark, 0, 0.025, 0);
    box(monitor, 0.1, 0.5, 0.07, dark, 0, 0.28, 0);
    box(monitor, 2.0, 1.16, 0.08, dark, 0, 1.02, 0);
    this.screenTextures = { idle: screenTexture(false), hover: screenTexture(true) };
    this.screenMaterial = new THREE.MeshBasicMaterial({ map: this.screenTextures.idle, toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.025), this.screenMaterial);
    screen.position.set(0, 1.02, 0.042);
    monitor.add(screen);
    this.addTarget({
      group: monitor,
      size: [2.0, 1.2, 0.3],
      offset: [0, 1.02, 0.05],
      label: 'Proyectos',
      panel: 'projects-panel',
      onHover: (active) => {
        this.screenMaterial.map = active ? this.screenTextures.hover : this.screenTextures.idle;
        const s = active ? 1.03 : 1;
        gsap.to(monitor.scale, { x: s, y: s, z: s, duration: 0.4, ease: 'power2.out' });
      },
    });

    // Teclado y ratón
    box(desk, 1.05, 0.04, 0.34, std('#e9e3d8'), 0, TOP + 0.02, 0.4);
    box(desk, 0.95, 0.012, 0.26, std('#cfc7b9'), 0, TOP + 0.046, 0.4).castShadow = false;
    const mouse = sphere(desk, 0.09, std('#e9e3d8'), 0.78, TOP + 0.03, 0.42);
    mouse.scale.set(0.8, 0.45, 1.2);

    // --- Sobre (Contacto) ---
    box(desk, 0.78, 0.09, 0.56, std(C.plum), -1.85, TOP + 0.045, -0.15);
    box(desk, 0.72, 0.08, 0.52, std(C.terracotta), -1.82, TOP + 0.13, -0.13).rotation.y = 0.12;
    box(desk, 0.66, 0.07, 0.48, std(C.wall), -1.86, TOP + 0.205, -0.15).rotation.y = -0.08;

    const mail = new THREE.Group();
    mail.position.set(-1.85, TOP, 0.32);
    desk.add(mail);
    this.envelope = new THREE.Group();
    mail.add(this.envelope);
    this.envelopeMaterial = std('#ffffff', {
      map: envelopeTexture(),
      roughness: 0.7,
      emissive: new THREE.Color(C.mustard),
      emissiveIntensity: 0.1,
    });
    const paper = std('#fbf0d6');
    const env = shadow(
      new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.52, 0.03), [paper, paper, paper, paper, this.envelopeMaterial, paper])
    );
    env.position.set(0, 0.27, 0);
    env.rotation.x = -0.28;
    this.envelope.add(env);
    this.addTarget({
      group: mail,
      size: [0.86, 0.62, 0.36],
      offset: [0, 0.3, -0.04],
      label: 'Contacto',
      panel: 'contact-panel',
      onHover: (active) => {
        gsap.to(this.envelope.position, { y: active ? 0.14 : 0, duration: 0.25, ease: 'power2.out' });
        const s = active ? 1.1 : 1;
        gsap.to(this.envelope.scale, { x: s, y: s, z: s, duration: 0.25, ease: 'power2.out' });
      },
    });

    // Portalápices
    cyl(desk, 0.11, 0.1, 0.24, std(C.mustard), -1.15, TOP + 0.12, -0.45);
    [['#d9785a', 0.12, -0.03], ['#3f645e', -0.1, 0.03], ['#fbf5ea', 0.02, 0.1]].forEach(([c, rz, dx]) => {
      const p = cyl(desk, 0.014, 0.014, 0.34, std(c), -1.15 + dx, TOP + 0.33, -0.45, 8);
      p.rotation.z = rz;
    });

    // Taza con vapor
    const mugX = 1.25;
    const mugZ = 0.3;
    cyl(desk, 0.11, 0.095, 0.2, std(C.terracotta, { roughness: 0.5 }), mugX, TOP + 0.1, mugZ);
    cyl(desk, 0.092, 0.092, 0.01, std('#4a2f22', { roughness: 0.3 }), mugX, TOP + 0.196, mugZ).castShadow = false;
    const handle = shadow(
      new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16, Math.PI), std(C.terracotta, { roughness: 0.5 }))
    );
    handle.position.set(mugX + 0.1, TOP + 0.1, mugZ);
    handle.rotation.z = -Math.PI / 2;
    desk.add(handle);

    this.steam = [];
    const puff = puffTexture();
    for (let i = 0; i < 4; i++) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: puff, transparent: true, opacity: 0, depthWrite: false })
      );
      desk.add(sprite);
      this.steam.push({ sprite, phase: i / 4, base: new THREE.Vector3(mugX, TOP + 0.24, mugZ) });
    }

    // Libreta
    const notebook = box(desk, 0.5, 0.035, 0.66, std(C.wall), 1.95, TOP + 0.018, 0.25);
    notebook.rotation.y = -0.22;
    const page = box(desk, 0.44, 0.012, 0.6, std(C.cream), 1.95, TOP + 0.04, 0.25);
    page.rotation.y = -0.22;
    page.castShadow = false;

    // Lámpara de escritorio
    const lamp = new THREE.Group();
    lamp.position.set(2.2, TOP, -0.45);
    desk.add(lamp);
    const metal = std(C.dark, { metalness: 0.5, roughness: 0.4 });
    cyl(lamp, 0.2, 0.22, 0.05, metal, 0, 0.025, 0);
    cyl(lamp, 0.022, 0.022, 0.95, metal, 0, 0.5, 0, 10);
    const shade = shadow(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.32, 0.34, 24, 1, true),
        std(C.mustard, { side: THREE.DoubleSide, emissive: new THREE.Color('#e9a13a'), emissiveIntensity: 0.45 })
      )
    );
    shade.position.y = 1.08;
    lamp.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 12),
      new THREE.MeshBasicMaterial({ color: '#fff0c4', toneMapped: false })
    );
    bulb.position.y = 0.98;
    lamp.add(bulb);
    const glow = new THREE.PointLight('#ffc978', 1.4, 4.5, 2);
    glow.position.set(0, 0.7, 0.4);
    lamp.add(glow);

    // Planta pequeña
    this.buildPlant(desk, 1.38, TOP, -0.5, 0.42);
  }

  buildPlant(parent, x, y, z, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(scale);
    parent.add(g);
    cyl(g, 0.4, 0.3, 0.62, std(C.terracotta), 0, 0.31, 0);
    cyl(g, 0.43, 0.43, 0.09, std('#c7694d'), 0, 0.62, 0);
    cyl(g, 0.36, 0.36, 0.02, std('#4a3327'), 0, 0.67, 0).castShadow = false;
    const greens = [C.green, C.greenDark, '#6aa66f'];
    const blobs = [
      [0, 1.25, 0, 0.5],
      [-0.38, 1.0, 0.1, 0.36],
      [0.4, 1.05, -0.05, 0.38],
      [0.12, 1.72, 0.05, 0.36],
      [-0.2, 1.5, -0.12, 0.32],
      [0.3, 1.45, 0.2, 0.28],
    ];
    blobs.forEach(([bx, by, bz, r], i) => {
      const leaf = shadow(
        new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), std(greens[i % greens.length], { flatShading: true }))
      );
      leaf.position.set(bx, by, bz);
      leaf.rotation.set(i, i * 1.7, i * 0.6);
      g.add(leaf);
    });
    cyl(g, 0.04, 0.05, 0.6, std('#5b4030'), 0, 0.9, 0, 8);
    return g;
  }

  /* ---------- Repisas con libros ---------- */
  buildShelves() {
    const palette = [C.terracotta, C.mustard, C.plum, C.cream, '#3f645e', '#cf6f86', '#5a87b0', '#e9e3d8'];
    const shelf = (x, y, w, extra) => {
      const g = new THREE.Group();
      g.position.set(x, y, 0);
      this.group.add(g);
      box(g, w, 0.08, 0.55, std(C.woodLight), 0, 0, 0.3);
      [-w / 2 + 0.2, w / 2 - 0.2].forEach((bx) => {
        const bracket = box(g, 0.05, 0.3, 0.05, std(C.dark), bx, -0.17, 0.08);
        bracket.castShadow = false;
      });
      let cursor = -w / 2 + 0.12;
      const limit = extra ? w / 2 - 0.75 : w / 2 - 0.1;
      while (cursor < limit) {
        const bw = 0.09 + this.rand() * 0.08;
        const bh = 0.42 + this.rand() * 0.26;
        const color = palette[Math.floor(this.rand() * palette.length)];
        const book = box(g, bw, bh, 0.36, std(color), cursor + bw / 2, 0.04 + bh / 2, 0.3);
        if (this.rand() > 0.85) {
          book.rotation.z = -0.18;
          book.position.x += 0.04;
          cursor += 0.07;
        }
        cursor += bw + 0.012;
      }
      if (extra) extra(g, w);
      return g;
    };

    shelf(-4.45, 3.1, 2.0, (g, w) => this.buildPlant(g, w / 2 - 0.36, 0.04, 0.3, 0.4));
    shelf(-4.45, 4.35, 2.0);
    shelf(5.0, 3.1, 1.7, (g, w) => {
      // Reloj de arena decorativo
      const glass = std('#dff1ee', { transparent: true, opacity: 0.55, roughness: 0.1 });
      const base = std(C.woodDark);
      cyl(g, 0.14, 0.14, 0.03, base, w / 2 - 0.36, 0.055, 0.3);
      cyl(g, 0.11, 0.02, 0.17, glass, w / 2 - 0.36, 0.155, 0.3, 16);
      cyl(g, 0.02, 0.11, 0.17, glass, w / 2 - 0.36, 0.325, 0.3, 16);
      cyl(g, 0.14, 0.14, 0.03, base, w / 2 - 0.36, 0.425, 0.3);
    });
  }

  /* ---------- Reloj con hora real ---------- */
  buildClock() {
    const clock = new THREE.Group();
    clock.position.set(5.0, 4.75, 0.06);
    this.group.add(clock);
    const rim = cyl(clock, 0.62, 0.62, 0.1, std(C.woodDark), 0, 0, 0, 40);
    rim.rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.54, 40), std('#ffffff', { map: clockTexture(), roughness: 0.6 }));
    face.position.z = 0.052;
    clock.add(face);

    const hand = (len, width, color) => {
      const pivot = new THREE.Group();
      pivot.position.z = 0.065;
      const m = new THREE.Mesh(new THREE.BoxGeometry(width, len, 0.012), std(color));
      m.position.y = len / 2 - 0.04;
      pivot.add(m);
      clock.add(pivot);
      return pivot;
    };
    this.hourHand = hand(0.3, 0.045, C.dark);
    this.minuteHand = hand(0.44, 0.03, C.dark);
    this.secondHand = hand(0.46, 0.012, C.terracotta);
    const cap = cyl(clock, 0.035, 0.035, 0.03, std(C.terracotta), 0, 0, 0.075, 16);
    cap.rotation.x = Math.PI / 2;
  }

  /* ---------- Objetos del piso ---------- */
  buildFloorItems() {
    // Planta grande
    this.buildPlant(this.group, -5.0, 0, 1.3, 1.25);

    // Tapete
    const rug = cyl(this.group, 2.0, 2.0, 0.03, std(C.terracotta, { roughness: 1 }), -2.6, 0.015, 2.9, 48);
    rug.castShadow = false;
    const ring = cyl(this.group, 1.6, 1.6, 0.034, std(C.cream, { roughness: 1 }), -2.6, 0.017, 2.9, 48);
    ring.castShadow = false;
    const inner = cyl(this.group, 1.35, 1.35, 0.038, std(C.terracotta, { roughness: 1 }), -2.6, 0.019, 2.9, 48);
    inner.castShadow = false;

    // Sillón
    const chair = new THREE.Group();
    chair.position.set(5.1, 0, 1.9);
    chair.rotation.y = -0.45;
    this.group.add(chair);
    const fabric = std(C.mustard, { roughness: 1 });
    box(chair, 1.5, 0.4, 1.3, fabric, 0, 0.55, 0);
    box(chair, 1.5, 1.25, 0.32, fabric, 0, 1.2, -0.5);
    box(chair, 0.28, 0.62, 1.3, fabric, -0.75, 0.9, 0);
    box(chair, 0.28, 0.62, 1.3, fabric, 0.75, 0.9, 0);
    box(chair, 1.15, 0.16, 0.95, std('#f0c468', { roughness: 1 }), 0, 0.82, 0.1);
    const pillow = box(chair, 0.6, 0.6, 0.18, std(C.cream, { roughness: 1 }), 0.1, 1.2, -0.25);
    pillow.rotation.set(-0.2, 0, 0.35);
    [[-0.6, -0.5], [0.6, -0.5], [-0.6, 0.5], [0.6, 0.5]].forEach(([x, z]) => {
      cyl(chair, 0.05, 0.035, 0.36, std(C.woodDark), x, 0.18, z, 10);
    });

    // Mesita auxiliar
    cyl(this.group, 0.45, 0.45, 0.06, std(C.woodLight), 3.6, 1.0, 2.4, 32);
    cyl(this.group, 0.05, 0.05, 1.0, std(C.woodDark), 3.6, 0.5, 2.4, 10);
    cyl(this.group, 0.28, 0.3, 0.05, std(C.woodDark), 3.6, 0.025, 2.4, 24);
    box(this.group, 0.5, 0.06, 0.36, std(C.plum), 3.6, 1.06, 2.4).rotation.y = 0.4;
  }

  /* ---------- Gato ---------- */
  buildCat() {
    const cat = new THREE.Group();
    cat.position.set(-2.75, 0.04, 2.9);
    cat.rotation.y = 0.35;
    this.group.add(cat);

    this.catCoats = [
      { fur: '#e8934a', accent: '#fbf5ea' },
      { fur: '#6b6f7a', accent: '#ffffff' },
    ];
    this.catCoat = 0;
    this.catFur = std(this.catCoats[0].fur, { roughness: 1 });
    this.catAccent = std(this.catCoats[0].accent, { roughness: 1 });
    const darkMat = std('#2d2a32', { roughness: 0.3 });

    this.catBody = new THREE.Group();
    cat.add(this.catBody);
    const body = sphere(this.catBody, 0.38, this.catFur, 0, 0.4, 0);
    body.scale.set(1, 1.12, 0.95);
    const chest = sphere(this.catBody, 0.2, this.catAccent, 0, 0.4, 0.2);
    chest.scale.set(1, 1.25, 0.9);
    this.catHead = new THREE.Group();
    this.catHead.position.set(0, 0.95, 0.1);
    this.catBody.add(this.catHead);
    sphere(this.catHead, 0.28, this.catFur).scale.set(1.08, 0.95, 0.95);
    [-0.16, 0.16].forEach((x) => {
      const ear = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 4), this.catFur));
      ear.position.set(x, 0.27, 0);
      ear.rotation.y = Math.PI / 4;
      this.catHead.add(ear);
      const eye = sphere(this.catHead, 0.038, darkMat, x * 0.62, 0.03, 0.25);
      eye.castShadow = false;
    });
    sphere(this.catHead, 0.09, this.catAccent, 0, -0.07, 0.21).scale.set(1.3, 0.8, 0.8);
    sphere(this.catHead, 0.025, std('#e58a8a'), 0, -0.03, 0.285).castShadow = false;
    [-0.14, 0.14].forEach((x) => sphere(cat, 0.09, this.catAccent, x, 0.07, 0.32).scale.set(1, 0.7, 1.3));

    // Cola
    this.catTail = new THREE.Group();
    this.catTail.position.set(0.24, 0.12, -0.2);
    cat.add(this.catTail);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.3, -0.02, 0.1),
      new THREE.Vector3(0.48, 0.06, 0.34),
      new THREE.Vector3(0.44, 0.24, 0.5),
    ]);
    this.catTail.add(shadow(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.06, 8), this.catFur)));
    sphere(this.catTail, 0.062, this.catAccent, 0.44, 0.24, 0.5);

    this.addTarget({
      group: cat,
      size: [1.1, 1.4, 1.0],
      offset: [0.1, 0.65, 0.1],
      label: '¡Miau!',
      onClick: () => {
        this.catCoat = (this.catCoat + 1) % this.catCoats.length;
        this.catFur.color.set(this.catCoats[this.catCoat].fur);
        this.catAccent.color.set(this.catCoats[this.catCoat].accent);
        gsap.fromTo(this.catBody.position, { y: 0 }, { y: 0.28, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
      },
      onHover: (active) => {
        gsap.to(this.catHead.rotation, { z: active ? 0.28 : 0, duration: 0.3, ease: 'power2.out' });
      },
    });
  }

  /* ---------- Guirnalda de luces ---------- */
  buildFairyLights() {
    const colors = ['#ffd98a', '#ffb38a', '#ffe9b8'];
    const points = [];
    const count = 26;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = THREE.MathUtils.lerp(-6.4, 6.4, t);
      // Dos ondas colgantes
      const y = 6.55 - Math.abs(Math.sin(t * Math.PI * 2)) * 0.32;
      points.push(new THREE.Vector3(x, y, 0.08));
    }
    const wire = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 120, 0.012, 5),
      std('#3a332f')
    );
    this.group.add(wire);
    this.bulbs = points.map((p, i) => {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 8),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length], toneMapped: false })
      );
      bulb.position.copy(p).add(new THREE.Vector3(0, -0.07, 0.02));
      this.group.add(bulb);
      return bulb;
    });
  }

  /* ---------- Animación ---------- */
  update(elapsed) {
    // Reloj
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    this.secondHand.rotation.z = -(Math.floor(s) / 60) * Math.PI * 2;
    this.minuteHand.rotation.z = -(m / 60) * Math.PI * 2;
    this.hourHand.rotation.z = -(h / 12) * Math.PI * 2;

    // Cuadros que se mecen suavemente
    this.frames.forEach((frame, i) => {
      frame.rotation.z = Math.sin(elapsed * (0.9 + i * 0.25) + i * 2) * 0.018;
    });

    // Sobre que palpita
    this.envelopeMaterial.emissiveIntensity = 0.08 + (0.5 + 0.5 * Math.sin(elapsed * 2.4)) * 0.3;

    // Vapor
    this.steam.forEach(({ sprite, phase, base }) => {
      const t = (elapsed * 0.28 + phase) % 1;
      sprite.position.set(base.x + Math.sin((t + phase) * 6.0) * 0.05, base.y + t * 0.62, base.z);
      const scale = 0.14 + t * 0.26;
      sprite.scale.set(scale, scale, scale);
      sprite.material.opacity = Math.sin(t * Math.PI) * 0.4;
    });

    // Gato
    this.catTail.rotation.y = Math.sin(elapsed * 1.6) * 0.35;
    this.catBody.scale.y = 1 + Math.sin(elapsed * 1.8) * 0.012;

    // Luces
    this.bulbs.forEach((bulb, i) => {
      const k = 0.82 + 0.18 * Math.sin(elapsed * 1.5 + i * 0.9);
      bulb.scale.setScalar(k);
    });
  }
}
