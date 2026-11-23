import { t } from '../i18n.js';
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Room } from './Room.js';

const CONFIG = {
  background: '#241812',
  fov: 35,
  cameraY: 0, // altura inicial de la cámara
  cameraZ: 9,
  scrollFactor: 6, // cuánto baja la cámara por cada alto de pantalla
  minHalfWidth: 4.4, // ancho mínimo de pared visible a cada lado
  maxZ: 20,
  fly: { duration: 0.9, maxDuration: 1.7, fill: 0.5, minDistance: 2.4 },
};

export class Experience {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ openPanel: (id: string) => void, isPanelOpen: () => boolean, label: HTMLElement }} ui
   */
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    this.mouse = new THREE.Vector2(10, 10);
    this.pointer = { x: 0, y: 0 };
    this.hovered = null;
    this.flying = false;
    this.flownAway = false;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.background);

    this.camera = new THREE.PerspectiveCamera(CONFIG.fov, this.sizes.width / this.sizes.height, 0.05, 100);
    this.camera.position.copy(this.restPosition());
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(CONFIG.background);

    this.raycaster = new THREE.Raycaster();
    this.room = new Room(this.scene);

    this.setupPostProcessing();
    this.resize();
    this.bindEvents();

    this.renderer.setAnimationLoop(() => this.update());
  }

  setupPostProcessing() {
    const target = new THREE.WebGLRenderTarget(this.sizes.width, this.sizes.height, {
      samples: 4,
      type: THREE.HalfFloatType,
    });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(this.sizes.width, this.sizes.height), 0.38, 0.7, 0.92);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  /* ---------- Cámara ---------- */
  restZ() {
    const aspect = this.sizes.width / this.sizes.height;
    const tan = Math.tan(THREE.MathUtils.degToRad(CONFIG.fov / 2));
    return THREE.MathUtils.clamp(CONFIG.minHalfWidth / (tan * aspect), CONFIG.cameraZ, CONFIG.maxZ);
  }

  restPosition() {
    const progress = (window.scrollY / this.sizes.height) * CONFIG.scrollFactor;
    return new THREE.Vector3(0, CONFIG.cameraY - progress, this.restZ());
  }

  /** Avance del scroll entre 0 (arriba) y 1 (abajo). */
  scrollProgress() {
    const max = document.documentElement.scrollHeight - this.sizes.height;
    return max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
  }

  flyTo(target, done) {
    const boxObj = new THREE.Box3().setFromObject(target.group);
    const center = boxObj.getCenter(new THREE.Vector3());
    const size = boxObj.getSize(new THREE.Vector3());
    const rest = this.restPosition();
    const tan = Math.tan(THREE.MathUtils.degToRad(CONFIG.fov / 2));
    const fitH = size.y / (2 * tan * CONFIG.fly.fill);
    const fitW = size.x / (2 * tan * this.camera.aspect * CONFIG.fly.fill);
    const distance = Math.max(fitH, fitW, CONFIG.fly.minDistance);
    const dest = new THREE.Vector3(center.x, center.y, Math.min(rest.z, boxObj.max.z + distance));
    if (target.flyOffset) dest.add(new THREE.Vector3(...target.flyOffset));

    const duration = Math.min(
      CONFIG.fly.duration + this.camera.position.distanceTo(dest) * 0.08,
      CONFIG.fly.maxDuration
    );
    this.flownAway = true;
    this.flying = true;
    gsap.killTweensOf(this.camera.position);
    gsap.to(this.camera.position, {
      x: dest.x,
      y: dest.y,
      z: dest.z,
      duration,
      ease: 'power2.inOut',
      onComplete: () => {
        this.flying = false;
      },
    });
    window.setTimeout(done, duration * 600);
  }

  flyBack() {
    if (!this.flownAway) return;
    const rest = this.restPosition();
    const duration = Math.min(
      CONFIG.fly.duration + this.camera.position.distanceTo(rest) * 0.08,
      CONFIG.fly.maxDuration
    );
    this.flying = true;
    gsap.killTweensOf(this.camera.position);
    gsap.to(this.camera.position, {
      x: rest.x,
      y: rest.y,
      z: rest.z,
      duration,
      ease: 'power2.inOut',
      onComplete: () => {
        this.flying = false;
        this.flownAway = false;
      },
    });
  }

  /** Abre un panel volando primero hacia su objeto en la habitación. */
  showPanel(panelId) {
    const target = this.room.targetFromPanel(panelId);
    if (!target) {
      this.ui.openPanel(panelId);
      return;
    }
    this.setHovered(null);
    this.flyTo(target, () => this.ui.openPanel(panelId));
  }

  /* ---------- Eventos ---------- */
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('panelclose', () => this.flyBack());

    window.addEventListener('mousemove', (e) => {
      this.pointer.x = e.clientX;
      this.pointer.y = e.clientY;
      this.setMouse(e.clientX, e.clientY, e.target);
    });
    document.documentElement.addEventListener('mouseleave', () => this.mouse.set(10, 10));

    this.canvas.addEventListener('click', (e) => {
      if (this.ui.isPanelOpen() || this.flying || this.flownAway) return;
      this.setMouse(e.clientX, e.clientY, e.target);
      const target = this.pick();
      if (!target) return;
      if (target.onClick) target.onClick();
      if (target.panel) this.showPanel(target.panel);
    });
  }

  setMouse(x, y, element) {
    if (element !== this.canvas) {
      this.mouse.set(10, 10);
      return;
    }
    this.mouse.x = (x / this.sizes.width) * 2 - 1;
    this.mouse.y = -(y / this.sizes.height) * 2 + 1;
  }

  pick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.room.hitMeshes, false);
    return hits.length ? this.room.targetFromHit(hits[0].object) : null;
  }

  setHovered(target) {
    if (target === this.hovered) return;
    if (this.hovered) this.room.setHover(this.hovered, false);
    if (target) this.room.setHover(target, true);
    this.hovered = target;
    document.body.style.cursor = target ? 'pointer' : 'default';
    if (target) this.ui.label.textContent = t(target.label);
    this.ui.label.classList.toggle('visible', !!target);
  }

  resize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(this.sizes.width, this.sizes.height);
  }

  /* ---------- Bucle ---------- */
  update() {
    this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;

    // La cámara baja directamente con el scroll
    if (!this.flying && !this.flownAway) this.camera.position.copy(this.restPosition());

    this.room.update(elapsed, this.scrollProgress());

    const blocked = this.ui.isPanelOpen() || this.flying || this.flownAway;
    this.setHovered(blocked ? null : this.pick());
    this.ui.label.style.transform = `translate(${this.pointer.x + 16}px, ${this.pointer.y + 18}px)`;

    this.composer.render();
  }
}
