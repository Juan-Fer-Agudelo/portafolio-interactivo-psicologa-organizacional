import * as THREE from 'three';
import gsap from 'gsap';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  floorTexture,
  wallpaperTexture,
  iconTextures,
  catFaceTexture,
  catButtonTexture,
  catLabelTexture,
  projectsScreenTexture,
  helloScreenTexture,
  envelopeTexture,
  clockTexture,
  signTexture,
  puffTexture,
} from './textures.js';

/*
 * La escena es un recorrido vertical en tres paradas (la cámara baja con el scroll):
 *   1. Pared: saludo, repisa con gato, reloj y lámpara, y los tres cuadros.
 *   2. Escritorio: monitor (Proyectos), taza, planta, libros.
 *   3. Debajo del escritorio: tapete, cama del gato, luz de noche y el sobre (Contacto).
 */
const C = {
  wood: '#8a5a3c',
  woodDark: '#6b4530',
  woodLight: '#c79a6b',
  cream: '#fbf5ea',
  mustard: '#e9b44c',
  terracotta: '#cf6a32',
  plum: '#8c3b3b',
  sage: '#b5562f',
  dark: '#2e211b',
  green: '#7d8a3a',
  greenDark: '#5f6b2a',
};

const FLOOR_Y = -10.3;
const DESK_TOP_Y = -6.3;
const SHELF_TOP_Y = -0.58;

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

function cyl(parent, rTop, rBottom, h, material, x = 0, y = 0, z = 0, segments = 28) {
  const mesh = shadow(new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function sphere(parent, r, material, x = 0, y = 0, z = 0) {
  const mesh = shadow(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), material));
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

    this.buildLights();
    this.buildShell();
    this.buildSign();
    this.buildShelf();
    this.buildFrames();
    this.buildDesk();
    this.buildUnderDesk();
    this.bulbs = [];
  }

  /* ---------- Registro de objetos interactivos ---------- */
  addTarget({ group, size, offset = [0, 0, 0], label, panel = null, onClick = null, onHover = null, flyOffset = null }) {
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.set(...offset);
    group.add(hit);
    const target = { group, hit, label, panel, onClick, onHover, flyOffset };
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
    const s = active ? 1.04 : 1;
    gsap.to(target.group.scale, { x: s, y: s, z: s, duration: 0.4, ease: 'power2.out' });
  }

  /* ---------- Luces (cambian con el scroll: de cálido a nocturno) ---------- */
  buildLights() {
    this.ambient = new THREE.AmbientLight('#fff1e0', 0.85);
    this.hemi = new THREE.HemisphereLight('#fff6ea', '#7a5a45', 0.5);
    this.scene.add(this.ambient, this.hemi);

    this.sun = new THREE.DirectionalLight('#fff3e2', 1.5);
    this.sun.position.set(-5, 5, 13);
    this.sun.target.position.set(0, -4, 0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -9;
    this.sun.shadow.camera.right = 9;
    this.sun.shadow.camera.top = 9.5;
    this.sun.shadow.camera.bottom = -9.5;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 40;
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.04;
    this.sun.shadow.radius = 5;
    this.scene.add(this.sun, this.sun.target);
  }

  /* ---------- Pared y piso ---------- */
  buildShell() {
    const paper = wallpaperTexture();
    paper.repeat.set(34 / 4.6, 19 / 4.6);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(34, 19), std('#ededed', { map: paper, roughness: 0.95 }));
    wall.position.set(0, FLOOR_Y + 9.5, 0);
    wall.receiveShadow = true;
    this.group.add(wall);

    box(this.group, 34, 0.55, 0.14, std(C.woodLight), 0, FLOOR_Y + 0.275, 0.07);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 30),
      std('#ffffff', { map: floorTexture(), roughness: 0.7 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, FLOOR_Y, 15);
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  buildSign() {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 1.547),
      new THREE.MeshBasicMaterial({ map: signTexture(), transparent: true, toneMapped: false })
    );
    sign.position.set(-1.0, 1.88, 0.03);
    this.group.add(sign);
  }

  /* ---------- Parada 1: repisa con planta, gato, lámpara y reloj ---------- */
  buildShelf() {
    const shelf = shadow(
      new THREE.Mesh(new RoundedBoxGeometry(4.0, 0.34, 1.25, 4, 0.08), std('#c98a45'))
    );
    shelf.position.set(-2.24, SHELF_TOP_Y - 0.17, 0.625);
    this.group.add(shelf);

    this.buildClock(-3.3, 1.0, 1.05);

    // Suculenta en maceta gris verdosa
    const pot = new THREE.Group();
    pot.position.set(-3.75, SHELF_TOP_Y, 0.7);
    this.group.add(pot);
    cyl(pot, 0.3, 0.26, 0.42, std('#9aa79a'), 0, 0.21, 0);
    const leafMat = std('#7d8a3a', { flatShading: true });
    const leafMat2 = std('#96a04a', { flatShading: true });
    for (let ring = 0; ring < 2; ring++) {
      const n = ring === 0 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 + ring * 0.4;
        const rad = ring === 0 ? 0.2 : 0.09;
        const leaf = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.36, 5), ring ? leafMat2 : leafMat));
        leaf.position.set(Math.cos(ang) * rad, 0.52 + ring * 0.08, Math.sin(ang) * rad);
        leaf.rotation.set(Math.sin(ang) * (0.55 - ring * 0.3), 0, -Math.cos(ang) * (0.55 - ring * 0.3));
        pot.add(leaf);
      }
    }

    this.buildCat(-2.35, SHELF_TOP_Y, 0.66, 1.18);

    // Lámpara encendida con pantalla de campana
    const lamp = new THREE.Group();
    lamp.position.set(-1.05, SHELF_TOP_Y, 0.62);
    this.group.add(lamp);
    cyl(lamp, 0.26, 0.3, 0.07, std(C.woodDark), 0, 0.035, 0);
    cyl(lamp, 0.04, 0.04, 0.4, std(C.woodDark), 0, 0.25, 0, 12);
    const profile = [
      [0.44, 0],
      [0.42, 0.12],
      [0.36, 0.34],
      [0.27, 0.56],
      [0.17, 0.74],
      [0.07, 0.86],
      [0.0, 0.9],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const shade = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 40),
      new THREE.MeshBasicMaterial({ color: '#ffc24a', side: THREE.DoubleSide, toneMapped: false })
    );
    shade.position.y = 0.42;
    lamp.add(shade);
    // Halo cálido alrededor de la pantalla
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: puffTexture(),
        color: '#ffb44a',
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    halo.position.set(0, 0.85, 0.3);
    halo.scale.set(2.6, 2.6, 1);
    lamp.add(halo);
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 20, 14),
      new THREE.MeshBasicMaterial({ color: '#fffbea', toneMapped: false })
    );
    core.position.y = 0.62;
    core.scale.set(1, 0.8, 1);
    lamp.add(core);
    this.lampLight = new THREE.PointLight('#ffb866', 7, 9, 2);
    this.lampLight.position.set(0.1, 0.9, 1.3);
    lamp.add(this.lampLight);
  }

  buildClock(x, y, scale) {
    const clock = new THREE.Group();
    clock.position.set(x, y, 0.08);
    clock.scale.setScalar(scale);
    this.group.add(clock);
    const rim = cyl(clock, 0.62, 0.62, 0.1, std('#c98a45'), 0, 0, 0, 48);
    rim.rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.54, 48), std('#ffffff', { map: clockTexture(), roughness: 0.6 }));
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

  buildPlant(parent, x, y, z, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(scale);
    parent.add(g);
    cyl(g, 0.4, 0.3, 0.62, std(C.terracotta), 0, 0.31, 0);
    cyl(g, 0.43, 0.43, 0.09, std('#b85a28'), 0, 0.62, 0);
    cyl(g, 0.36, 0.36, 0.02, std('#4a3327'), 0, 0.67, 0).castShadow = false;
    const greens = [C.green, C.greenDark, '#96a04a'];
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

  /* ---------- Gato: cabeza grande, ojos felices, manchas y almohadillas ---------- */
  buildCat(x, y, z, scale) {
    const cat = new THREE.Group();
    cat.position.set(x, y, z);
    cat.rotation.y = 0.12;
    cat.scale.setScalar(scale);
    this.group.add(cat);

    this.catCoats = [
      { name: 'CANELA', base: '#f7e3cf', patch: '#e2823c' },
      { name: 'HUMO', base: '#eeeae6', patch: '#77787f' },
    ];
    this.catCoats.forEach((coat) => {
      coat.faceOpen = catFaceTexture(coat.base, coat.patch, true);
      coat.faceClosed = catFaceTexture(coat.base, coat.patch, false);
      coat.button = catButtonTexture(coat.name, coat.base, coat.patch);
    });
    this.catCoat = 0;
    const coat = this.catCoats[0];
    const soft = { roughness: 0.95 };
    this.catBase = std(coat.base, soft);
    this.catPatch = std(coat.patch, soft);
    this.catHeadMat = std('#ffffff', { map: coat.faceOpen, ...soft });
    const pink = std('#f0a3a0', soft);

    this.catBody = new THREE.Group();
    cat.add(this.catBody);
    this.catFeet = new THREE.Group();
    cat.add(this.catFeet);

    // Cuerpo
    const body = sphere(this.catBody, 0.33, this.catBase, 0, 0.4, 0);
    body.scale.set(0.98, 1.22, 0.9);
    const back = sphere(this.catBody, 0.3, this.catPatch, 0.03, 0.47, -0.1);
    back.scale.set(1, 1.15, 0.85);

    // Patas delanteras
    [-0.13, 0.13].forEach((px) => {
      const leg = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.36, 6, 14), this.catBase));
      leg.position.set(px, 0.3, 0.22);
      this.catBody.add(leg);
      sphere(this.catFeet, 0.1, this.catBase, px, 0.075, 0.27).scale.set(1, 0.72, 1.25);
    });

    // Patas traseras con almohadillas
    [-1, 1].forEach((side) => {
      const foot = sphere(this.catFeet, 0.12, this.catBase, side * 0.31, 0.11, 0.2);
      foot.scale.set(0.95, 0.9, 1.15);
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.048, 18), pink);
      pad.position.set(side * 0.31, 0.095, 0.342);
      this.catFeet.add(pad);
      [-1, 0, 1].forEach((k) => {
        const toe = new THREE.Mesh(new THREE.CircleGeometry(0.02, 12), pink);
        toe.position.set(side * 0.31 + k * 0.045, 0.165 - Math.abs(k) * 0.012, 0.336);
        this.catFeet.add(toe);
      });
    });

    // Cabeza
    this.catHead = new THREE.Group();
    this.catHead.position.set(0, 1.03, 0.06);
    this.catBody.add(this.catHead);
    const head = sphere(this.catHead, 0.37, this.catHeadMat);
    head.scale.set(1.2, 0.98, 1.0);
    [-1, 1].forEach((side) => {
      const ear = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 20), this.catPatch));
      ear.position.set(side * 0.27, 0.33, -0.02);
      ear.rotation.z = -side * 0.3;
      ear.scale.z = 0.6;
      this.catHead.add(ear);
      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 20), pink);
      inner.position.set(side * 0.265, 0.31, 0.045);
      inner.rotation.z = -side * 0.3;
      inner.scale.z = 0.4;
      this.catHead.add(inner);
    });

    // Cola
    this.catTail = new THREE.Group();
    this.catTail.position.set(0.2, 0.14, -0.18);
    cat.add(this.catTail);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.28, -0.03, 0.08),
      new THREE.Vector3(0.44, 0.02, 0.3),
      new THREE.Vector3(0.4, 0.14, 0.46),
    ]);
    this.catTail.add(shadow(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.065, 10), this.catPatch)));
    sphere(this.catTail, 0.066, this.catPatch, 0.4, 0.14, 0.46);

    // Lugares del gato según la parada del scroll
    this.cat = cat;
    this.catSpots = [
      { pos: new THREE.Vector3(x, y, z), scale, rotY: 0.12, pose: 'sit', eyesOpen: true },
      { pos: new THREE.Vector3(2.2, DESK_TOP_Y, 2.55), scale: 1.5, rotY: -0.12, pose: 'sit', eyesOpen: false },
      { pos: new THREE.Vector3(-2.6, FLOOR_Y + 0.4, 1.6), scale: 1.3, rotY: 0.1, pose: 'sleep', eyesOpen: false },
    ];
    this.catSpot = 0;
    this.catJumping = false;
    this.catEyesOpen = true;

    this.addTarget({
      group: cat,
      size: [0.95, 1.6, 0.9],
      offset: [0, 0.8, 0.1],
      label: '¡Miau!',
      onClick: () => this.toggleCat(),
      onHover: (active) => {
        if (this.catJumping || this.catSpots[this.catSpot].pose !== 'sit') return;
        gsap.to(this.catHead.rotation, { z: active ? 0.22 : 0, duration: 0.3, ease: 'power2.out' });
      },
    });
  }

  toggleCat() {
    this.catCoat = (this.catCoat + 1) % this.catCoats.length;
    const coat = this.catCoats[this.catCoat];
    this.catBase.color.set(coat.base);
    this.catPatch.color.set(coat.patch);
    this.catHeadMat.map = this.catEyesOpen ? coat.faceOpen : coat.faceClosed;
    if (this.catButtonMat) this.catButtonMat.map = coat.button;
    if (!this.catJumping && this.catSpots[this.catSpot].pose === 'sit') {
      gsap.fromTo(this.catBody.position, { y: 0 }, { y: 0.22, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
  }

  setCatEyes(open) {
    this.catEyesOpen = open;
    const coat = this.catCoats[this.catCoat];
    this.catHeadMat.map = open ? coat.faceOpen : coat.faceClosed;
  }

  /** Postura: sentado, o dormido de lado en la cama. */
  setCatPose(pose, duration = 0.35) {
    const sleep = pose === 'sleep';
    const ease = 'power2.inOut';
    gsap.to(this.catBody.rotation, { z: sleep ? -1.25 : 0, duration, ease });
    gsap.to(this.catBody.position, { x: sleep ? -0.5 : 0, y: sleep ? 0.3 : 0, duration, ease });
    gsap.to(this.catHead.rotation, { z: sleep ? 0.6 : 0, duration, ease });
    const feet = sleep ? 0.001 : 1;
    gsap.to(this.catFeet.scale, { x: feet, y: feet, z: feet, duration, ease });
    gsap.to(this.catTail.position, { y: sleep ? 0.3 : 0.14, duration, ease });
  }

  /** Salta de su lugar actual al lugar indicado (0 repisa, 1 escritorio, 2 cama). */
  jumpCat(to) {
    const cat = this.cat;
    const dest = this.catSpots[to];
    const start = cat.position.clone();
    const startScale = cat.scale.x;
    const dir = Math.sign(dest.pos.x - start.x) || 1;
    const goingUp = dest.pos.y > start.y;
    const arc = goingUp ? 1.7 : 1.1;
    const state = { t: 0 };

    this.catJumping = true;
    this.setCatPose('sit', 0.2);
    this.setCatEyes(true);

    gsap
      .timeline({
        onComplete: () => {
          this.catSpot = to;
          this.catJumping = false;
          this.setCatEyes(dest.eyesOpen);
          this.setCatPose(dest.pose, 0.5);
        },
      })
      // Se agacha mirando hacia donde va a saltar
      .to(this.catBody.scale, { y: 0.8, duration: 0.2, ease: 'power2.out' }, 0.15)
      .to(cat.rotation, { y: dir * 0.95, duration: 0.3, ease: 'power2.out' }, 0.05)
      .to(this.catBody.scale, { y: 1.12, duration: 0.1, ease: 'power2.out' })
      // Vuelo en parábola
      .to(state, {
        t: 1,
        duration: 0.9,
        ease: 'sine.inOut',
        onUpdate: () => {
          const t = state.t;
          cat.position.lerpVectors(start, dest.pos, t);
          cat.position.y += arc * 4 * t * (1 - t);
          cat.scale.setScalar(THREE.MathUtils.lerp(startScale, dest.scale, t));
          // Se inclina hacia adelante al caer y hacia atrás al subir
          cat.rotation.z = -dir * Math.sin(t * Math.PI) * (goingUp ? -0.35 : 0.6);
        },
      })
      // Aterriza
      .to(this.catBody.scale, { y: 0.84, duration: 0.09, ease: 'power2.out' })
      .to(this.catBody.scale, { y: 1, duration: 0.2, ease: 'power2.out' })
      .to(cat.rotation, { y: dest.rotY, z: 0, duration: 0.3, ease: 'power2.out' }, '<');
  }

  updateCat(elapsed, scroll) {
    const want = scroll < 0.3 ? 0 : scroll < 0.8 ? 1 : 2;
    if (!this.catJumping && want !== this.catSpot) this.jumpCat(want);
    this.catTail.rotation.y = Math.sin(elapsed * 1.6) * 0.35;
    if (!this.catJumping) {
      const asleep = this.catSpots[this.catSpot].pose === 'sleep';
      this.catBody.scale.y = 1 + Math.sin(elapsed * (asleep ? 1.1 : 1.8)) * (asleep ? 0.03 : 0.012);
    }
  }

  /* ---------- Parada 1: cuadros con ícono y botón del gato ---------- */
  buildFrames() {
    const wood = std('#c48646');
    const make = (w, h, kind, background, x, y, label, panel) => {
      const g = new THREE.Group();
      g.position.set(x, y, 0.13);
      g.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.24, 6, 0.12), wood)));
      const iw = w - 0.38;
      const ih = h - 0.38;
      const { map, glow } = iconTextures(kind, background, iw / ih);
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(iw, ih),
        std('#ffffff', {
          map,
          transparent: true,
          roughness: 0.7,
          emissive: new THREE.Color('#fff1dc'),
          emissiveMap: glow,
          emissiveIntensity: 1.2,
        })
      );
      art.position.z = 0.125;
      g.add(art);
      this.group.add(g);
      this.addTarget({ group: g, size: [w, h, 0.3], label, panel });
      return g;
    };

    this.frames = [
      make(1.52, 2.2, 'person', '#b5655a', 1.12, 0.85, 'Sobre mí', 'about-panel'),
      make(2.3, 2.0, 'briefcase', '#7a7a32', 3.16, -0.46, 'Experiencia', 'experience-panel'),
      make(1.7, 1.52, 'cap', '#6f6862', 0.96, -1.32, 'Formación', 'education-panel'),
    ];

    // Botón para cambiar de gato
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.54),
      new THREE.MeshBasicMaterial({ map: catLabelTexture(), transparent: true, toneMapped: false })
    );
    label.position.set(3.12, 1.72, 0.03);
    this.group.add(label);

    const button = new THREE.Group();
    button.position.set(3.12, 1.1, 0.1);
    this.group.add(button);
    button.add(shadow(new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.5, 0.16, 6, 0.08), std('#f3d9c0'))));
    this.catButtonMat = new THREE.MeshBasicMaterial({
      map: this.catCoats[0].button,
      transparent: true,
      toneMapped: false,
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.414), this.catButtonMat);
    face.position.z = 0.085;
    button.add(face);
    this.addTarget({
      group: button,
      size: [1.14, 0.5, 0.3],
      label: 'Cambiar gato',
      onClick: () => this.toggleCat(),
    });
  }

  /* ---------- Parada 2: escritorio con dos monitores ---------- */
  buildDesk() {
    // Estructura
    box(this.group, 9.9, 0.26, 3.3, std(C.woodLight), 0, DESK_TOP_Y - 0.13, 1.65);
    const legMat = std('#efe7d8');
    const legH = DESK_TOP_Y - 0.26 - FLOOR_Y;
    [[-4.6, 0.3], [4.6, 0.3], [-4.6, 3.0], [4.6, 3.0]].forEach(([x, z]) => {
      box(this.group, 0.26, legH, 0.26, legMat, x, FLOOR_Y + legH / 2, z);
    });

    // --- Monitores gruesos y redondeados ---
    const shell = std('#5a3b2d', { roughness: 0.6 });
    const makeMonitor = (x, rotY, texture) => {
      const g = new THREE.Group();
      g.position.set(x, DESK_TOP_Y, 0.95);
      g.rotation.y = rotY;
      this.group.add(g);
      cyl(g, 0.5, 0.62, 0.1, shell, 0, 0.05, 0.05, 32).scale.z = 0.6;
      cyl(g, 0.11, 0.14, 0.5, shell, 0, 0.3, 0, 16);
      const body = shadow(new THREE.Mesh(new RoundedBoxGeometry(2.86, 2.34, 0.5, 6, 0.24), shell));
      body.position.y = 1.72;
      g.add(body);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.98), material);
      screen.position.set(0, 1.72, 0.256);
      g.add(screen);
      return { group: g, material };
    };

    this.screenTextures = { idle: projectsScreenTexture(false), hover: projectsScreenTexture(true) };
    const left = makeMonitor(-0.3, 0.14, this.screenTextures.idle);
    this.screenMaterial = left.material;
    makeMonitor(2.62, -0.14, helloScreenTexture());

    this.screenLight = new THREE.PointLight('#ffd9a8', 0, 7, 2);
    this.screenLight.position.set(1.2, DESK_TOP_Y + 1.6, 2.6);
    this.group.add(this.screenLight);

    this.addTarget({
      group: left.group,
      size: [2.86, 2.34, 0.6],
      offset: [0, 1.72, 0.05],
      label: 'Proyectos',
      panel: 'projects-panel',
      onHover: (active) => {
        this.screenMaterial.map = active ? this.screenTextures.hover : this.screenTextures.idle;
        const s = active ? 1.03 : 1;
        gsap.to(left.group.scale, { x: s, y: s, z: s, duration: 0.4, ease: 'power2.out' });
      },
    });

    // --- Objetos pequeños: se construyen a media escala y se amplían x2 ---
    const desk = new THREE.Group();
    desk.position.set(0, DESK_TOP_Y, 1.65);
    desk.scale.setScalar(2);
    this.group.add(desk);

    // Teclado oscuro, alfombrilla y ratón
    const keyDark = std('#2b211d', { roughness: 0.7 });
    box(desk, 1.5, 0.04, 0.44, keyDark, 1.05, 0.02, 0.42);
    const keyMat = std('#3d302a', { roughness: 0.8 });
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 15; col++) {
        const key = box(desk, 0.075, 0.016, 0.075, keyMat, 0.385 + col * 0.095, 0.048, 0.27 + row * 0.1);
        key.castShadow = false;
      }
    }
    box(desk, 0.62, 0.014, 0.46, std('#5f7a3a', { roughness: 1 }), 2.08, 0.007, 0.44);
    const mouse = sphere(desk, 0.09, std('#cfc7b9'), 2.08, 0.04, 0.44);
    mouse.scale.set(0.75, 0.45, 1.15);

    // Planta de hojas largas detrás del monitor
    const plant = new THREE.Group();
    plant.position.set(-1.28, 0, -0.42);
    desk.add(plant);
    cyl(plant, 0.26, 0.19, 0.4, std('#b9703f'), 0, 0.2, 0);
    const greens = [std(C.green), std(C.greenDark), std('#96a04a')];
    [
      [-1.0, 0.9],
      [-0.55, 1.1],
      [-0.15, 1.25],
      [0.3, 1.15],
      [0.75, 0.95],
      [1.15, 0.7],
      [-1.35, 0.6],
    ].forEach(([lean, len], i) => {
      const pivot = new THREE.Group();
      pivot.position.y = 0.38;
      pivot.rotation.z = -lean * 0.62;
      pivot.rotation.y = i * 0.9;
      const leaf = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), greens[i % 3]));
      leaf.scale.set(0.24, len, 0.05);
      leaf.position.y = len * 0.5;
      pivot.add(leaf);
      plant.add(pivot);
    });

    // Portalápices y libreta
    cyl(desk, 0.13, 0.1, 0.2, std('#c98a45'), -1.72, 0.1, 0.18);
    [['#8fb3a8', 0.14, -0.04], ['#d9772f', -0.1, 0.03], ['#b9675a', 0.04, 0.08]].forEach(([c, rz, dx]) => {
      const p = cyl(desk, 0.018, 0.018, 0.3, std(c), -1.72 + dx, 0.28, 0.18, 8);
      p.rotation.z = rz;
    });
    const notebook = box(desk, 0.56, 0.04, 0.4, std('#8c3b5a'), -1.36, 0.02, 0.5);
    notebook.rotation.y = 0.18;
    const pencil = cyl(desk, 0.014, 0.014, 0.42, std('#d9772f'), -1.36, 0.052, 0.47, 8);
    pencil.rotation.set(0, 0.5, Math.PI / 2);
    cyl(desk, 0.12, 0.09, 0.1, std('#5f6b2a'), -1.5, 0.05, 0.02);

    // Taza oscura con vapor
    const mugX = -0.98;
    const mugZ = 0.5;
    const mugMat = std('#3a211c', { roughness: 0.5 });
    cyl(desk, 0.115, 0.1, 0.22, mugMat, mugX, 0.11, mugZ);
    cyl(desk, 0.095, 0.095, 0.01, std('#1c0f0c', { roughness: 0.3 }), mugX, 0.216, mugZ).castShadow = false;
    const handle = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.02, 8, 16, Math.PI), mugMat));
    handle.position.set(mugX + 0.105, 0.11, mugZ);
    handle.rotation.z = -Math.PI / 2;
    desk.add(handle);

    this.steam = [];
    const puff = puffTexture();
    for (let i = 0; i < 4; i++) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: puff, color: '#ffd9cf', transparent: true, opacity: 0, depthWrite: false })
      );
      desk.add(sprite);
      this.steam.push({ sprite, phase: i / 4, base: new THREE.Vector3(mugX, 0.26, mugZ) });
    }
  }

  /* ---------- Parada 3: debajo del escritorio ---------- */
  buildUnderDesk() {
    // Enchufe con luz de noche
    const socket = new THREE.Group();
    socket.position.set(2.3, -8.55, 0.04);
    this.group.add(socket);
    box(socket, 0.62, 0.62, 0.06, std(C.cream), 0, 0, 0);
    box(socket, 0.3, 0.3, 0.16, std('#efe7d8'), 0.42, 0, 0.08);
    const night = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 20, 14),
      new THREE.MeshBasicMaterial({ color: '#ffd28a' })
    );
    night.position.set(0.42, 0.12, 0.22);
    socket.add(night);
    this.nightBulb = night;
    this.nightLight = new THREE.PointLight('#ffb866', 0, 12, 2);
    this.nightLight.position.set(0.42, 0.12, 1.3);
    socket.add(this.nightLight);

    // Tapete
    const rugY = FLOOR_Y + 0.02;
    cyl(this.group, 3.0, 3.0, 0.04, std(C.terracotta, { roughness: 1 }), 1.2, rugY, 2.9, 56).castShadow = false;
    cyl(this.group, 2.45, 2.45, 0.046, std(C.cream, { roughness: 1 }), 1.2, rugY + 0.002, 2.9, 56).castShadow = false;
    cyl(this.group, 2.1, 2.1, 0.052, std(C.mustard, { roughness: 1 }), 1.2, rugY + 0.004, 2.9, 56).castShadow = false;
    cyl(this.group, 1.2, 1.2, 0.058, std(C.terracotta, { roughness: 1 }), 1.2, rugY + 0.006, 2.9, 56).castShadow = false;

    // Cama del gato
    const bed = new THREE.Group();
    bed.position.set(-2.5, FLOOR_Y, 1.5);
    this.group.add(bed);
    cyl(bed, 1.25, 1.3, 0.6, std('#7a3420', { roughness: 1 }), 0, 0.3, 0, 36);
    cyl(bed, 1.0, 1.0, 0.12, std(C.terracotta, { roughness: 1 }), 0, 0.58, 0, 36);

    // --- Sobre en el piso (Contacto) ---
    const mail = new THREE.Group();
    mail.position.set(0.4, FLOOR_Y + 0.03, 4.1);
    mail.rotation.y = 0.2;
    this.group.add(mail);
    const sheet = box(mail, 1.5, 0.02, 1.05, std(C.cream), -0.25, 0.01, -0.12);
    sheet.rotation.y = 0.3;
    const pen = cyl(mail, 0.035, 0.035, 0.75, std(C.dark), -0.85, 0.06, 0.15, 10);
    pen.rotation.set(Math.PI / 2, 0, 0.9);
    this.envelope = new THREE.Group();
    mail.add(this.envelope);
    this.envelopeMaterial = std('#ffffff', {
      map: envelopeTexture(),
      roughness: 0.7,
      emissive: new THREE.Color(C.mustard),
      emissiveIntensity: 0.2,
    });
    const paperMat = std('#fbf0d6');
    const env = shadow(
      new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.05, 0.82),
        [paperMat, paperMat, this.envelopeMaterial, paperMat, paperMat, paperMat]
      )
    );
    env.position.set(0.15, 0.2, 0.1);
    env.rotation.x = 0.42; // inclinado hacia la cámara para que se lea
    this.envelope.add(env);
    this.addTarget({
      group: mail,
      size: [1.5, 0.6, 1.0],
      offset: [0.1, 0.25, 0.1],
      label: 'Contacto',
      panel: 'contact-panel',
      flyOffset: [0, 0.9, 0],
      onHover: (active) => {
        gsap.to(this.envelope.position, { y: active ? 0.2 : 0, duration: 0.25, ease: 'power2.out' });
        const s = active ? 1.1 : 1;
        gsap.to(this.envelope.scale, { x: s, y: s, z: s, duration: 0.25, ease: 'power2.out' });
      },
    });
  }

  /* ---------- Guirnalda de luces ---------- */
  buildFairyLights() {
    const colors = ['#ffd98a', '#ffb38a', '#ffe9b8'];
    const points = [];
    const count = 22;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = THREE.MathUtils.lerp(-6.6, 6.6, t);
      const y = 2.78 - Math.abs(Math.sin(t * Math.PI * 2)) * 0.24;
      points.push(new THREE.Vector3(x, y, 0.1));
    }
    const wire = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 120, 0.014, 5),
      std('#3a332f')
    );
    this.group.add(wire);
    this.bulbs = points.map((p, i) => {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 8),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length], toneMapped: false })
      );
      bulb.position.copy(p).add(new THREE.Vector3(0, -0.08, 0.02));
      this.group.add(bulb);
      return bulb;
    });
  }

  /* ---------- Animación ---------- */
  /**
   * @param {number} elapsed segundos desde el inicio
   * @param {number} scroll avance del scroll, de 0 (arriba) a 1 (abajo)
   */
  update(elapsed, scroll = 0) {
    // De la luz cálida de arriba a la penumbra de abajo
    const lerp = THREE.MathUtils.lerp;
    const night = THREE.MathUtils.smoothstep(scroll, 0.15, 0.85);
    this.ambient.intensity = lerp(0.6, 0.2, night);
    this.hemi.intensity = lerp(0.35, 0.1, night);
    this.sun.intensity = lerp(1.0, 0.22, night);
    this.nightLight.intensity = lerp(0, 13, night);
    this.screenLight.intensity = lerp(0, 2.5, night);
    this.nightBulb.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.04);

    // Reloj
    const now = new Date();
    const s = now.getSeconds();
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    this.secondHand.rotation.z = -(s / 60) * Math.PI * 2;
    this.minuteHand.rotation.z = -(m / 60) * Math.PI * 2;
    this.hourHand.rotation.z = -(h / 12) * Math.PI * 2;

    // Cuadros que se mecen suavemente
    this.frames.forEach((frame, i) => {
      frame.rotation.z = Math.sin(elapsed * (0.9 + i * 0.25) + i * 2) * 0.015;
    });

    // Sobre que palpita
    this.envelopeMaterial.emissiveIntensity = 0.15 + (0.5 + 0.5 * Math.sin(elapsed * 2.4)) * 0.55;

    // Vapor
    this.steam.forEach(({ sprite, phase, base }) => {
      const t = (elapsed * 0.28 + phase) % 1;
      sprite.position.set(base.x + Math.sin((t + phase) * 6.0) * 0.05, base.y + t * 0.62, base.z);
      const scale = 0.14 + t * 0.26;
      sprite.scale.set(scale, scale, scale);
      sprite.material.opacity = Math.sin(t * Math.PI) * 0.4;
    });

    // Gato
    this.updateCat(elapsed, scroll);

    // Luces
    this.bulbs.forEach((bulb, i) => {
      bulb.scale.setScalar(0.82 + 0.18 * Math.sin(elapsed * 1.5 + i * 0.9));
    });
  }
}
