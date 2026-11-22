import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { STATIONS } from '../data/portfolioData';
import {
  createBoucleArmchair,
  createFloorLamp,
  createOakSideTableAndTea,
  createOliveTreePlanter,
  createSanctuaryArchitecture,
  createZenStoneSculpture,
  ModelResources,
} from './models';
import {
  createContactShadowTexture,
  createLinenWeaveTexture,
  createOakWoodTexture,
  createPlasterWallTexture,
} from './textures';

// Pre-allocated scratch math helpers (Zero GC inside render loop)
const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _currentTarget = new THREE.Vector3(0.3, 1.0, -0.4);
const _dummyObj = new THREE.Object3D();

export interface SanctuaryCallbacks {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export class SanctuaryEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId = 0;
  private disposed = false;
  private paused = false;
  private reducedMotion = false;

  private resources: ModelResources = { geometries: [], materials: [] };
  private textures: THREE.Texture[] = [];
  private envRT: THREE.WebGLRenderTarget | null = null;

  private scrollProgress = 0;
  private pointerX = 0;
  private pointerY = 0;
  private elapsed = 0;
  private lastTime = performance.now();

  private topStone: THREE.Mesh | null = null;
  private motesMesh: THREE.InstancedMesh | null = null;
  private moteData: { x: number; y: number; z: number; speed: number; phase: number }[] = [];

  private callbacks: SanctuaryCallbacks;

  constructor(
    container: HTMLElement,
    reducedMotion: boolean,
    callbacks: SanctuaryCallbacks = {},
  ) {
    this.container = container;
    this.reducedMotion = reducedMotion;
    this.callbacks = callbacks;

    this.isSoftwareGl = SanctuaryEngine.detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const bgHex = 0xeeeae1;
    this.scene.background = new THREE.Color(bgHex);
    this.scene.fog = new THREE.FogExp2(bgHex, 0.068);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 45);
    this.camera.position.set(...STATIONS[0].cameraPos);
    _currentTarget.set(...STATIONS[0].target);
    this.camera.lookAt(_currentTarget);

    this.setupEnvironment();
    this.setupLighting();
    this.buildSanctuary();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.startLoop();
  }

  private static detectSoftwareWebGL(): boolean {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return true;
    }
  }

  private setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();
  }

  private setupLighting() {
    // Cool sky / warm ground fill
    const hemiLight = new THREE.HemisphereLight(0xdfe8ec, 0xcabaa5, 0.72);
    hemiLight.position.set(0, 8, 0);
    this.scene.add(hemiLight);

    // Warm morning sun streaming through arched window
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.05);
    keyLight.position.set(-3.2, 4.8, 2.2);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    const d = 5.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Soft rim fill from opposite side
    const rimLight = new THREE.DirectionalLight(0xdce6e0, 0.55);
    rimLight.position.set(4.5, 3.0, -2.5);
    this.scene.add(rimLight);

    // Warm floor lamp accent light
    const lampLight = new THREE.PointLight(0xffdfb4, 1.35, 6.5, 1.8);
    lampLight.position.set(1.55, 1.46, -1.0);
    this.scene.add(lampLight);
  }

  private buildSanctuary() {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const oakTex = createOakWoodTexture(maxAniso);
    const linenTex = createLinenWeaveTexture(maxAniso);
    const plasterTex = createPlasterWallTexture(maxAniso);
    const shadowTex = createContactShadowTexture();
    this.textures.push(oakTex, linenTex, plasterTex, shadowTex);

    const arch = createSanctuaryArchitecture(
      this.resources,
      plasterTex,
      oakTex,
      linenTex,
    );
    this.scene.add(arch);

    // Primary Patient Armchair
    const chair1 = createBoucleArmchair(this.resources, linenTex, oakTex, shadowTex);
    chair1.position.set(0.75, 0, -0.55);
    chair1.rotation.y = -0.45;
    this.scene.add(chair1);

    // Second Armchair (angled thoughtfully for dialogue)
    const chair2 = createBoucleArmchair(this.resources, linenTex, oakTex, shadowTex);
    chair2.position.set(-0.95, 0, -0.15);
    chair2.rotation.y = 0.72;
    this.scene.add(chair2);

    // Side table with ceramic tea cup & therapy notebook
    const table = createOakSideTableAndTea(this.resources, oakTex, shadowTex);
    table.position.set(0.05, 0, -0.12);
    this.scene.add(table);

    // Olive tree beside the arched window
    const oliveTree = createOliveTreePlanter(this.resources, shadowTex);
    oliveTree.position.set(-1.75, 0, -1.65);
    this.scene.add(oliveTree);

    // Floor lamp behind right armchair
    const lamp = createFloorLamp(this.resources, linenTex, shadowTex);
    lamp.position.set(1.5, 0, -1.25);
    lamp.rotation.y = -0.6;
    this.scene.add(lamp);

    // Balanced stone cairn sculpture
    const cairn = createZenStoneSculpture(this.resources, shadowTex);
    cairn.group.position.set(1.42, 0, -0.15);
    this.topStone = cairn.topStone;
    this.scene.add(cairn.group);

    // Floating sunlit light motes (InstancedMesh, 36 particles)
    const moteGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const moteMat = new THREE.MeshBasicMaterial({
      color: 0xfff4dd,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    this.resources.geometries.push(moteGeo);
    this.resources.materials.push(moteMat);

    const count = 36;
    this.motesMesh = new THREE.InstancedMesh(moteGeo, moteMat, count);
    this.motesMesh.frustumCulled = false;
    for (let i = 0; i < count; i++) {
      this.moteData.push({
        x: -1.8 + ((i * 37) % 100) * 0.036,
        y: 0.4 + ((i * 53) % 100) * 0.022,
        z: -1.8 + ((i * 71) % 100) * 0.026,
        speed: 0.25 + (i % 5) * 0.08,
        phase: i * 0.7,
      });
    }
    this.scene.add(this.motesMesh);
  }

  public setScrollProgress(progress: number) {
    this.scrollProgress = THREE.MathUtils.clamp(progress, 0, 1);
  }

  public setReducedMotion(value: boolean) {
    this.reducedMotion = value;
  }

  public setPaused(value: boolean) {
    this.paused = value;
    if (!value && !this.disposed) {
      this.lastTime = performance.now();
      this.scheduleNext();
    }
  }

  private handleResize = () => {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handlePointerMove = (e: PointerEvent) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    this.pointerX = (e.clientX / w - 0.5) * 2;
    this.pointerY = (e.clientY / h - 0.5) * 2;
  };

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    this.paused = true;
    this.callbacks.onContextLost?.();
  };

  private handleContextRestored = () => {
    this.paused = false;
    this.callbacks.onContextRestored?.();
    this.scheduleNext();
  };

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private updateCameraAndScene(dt: number) {
    const segCount = STATIONS.length - 1;
    const scaled = this.scrollProgress * segCount;
    const idx = Math.min(Math.floor(scaled), segCount - 1);
    const t = THREE.MathUtils.smoothstep(scaled - idx, 0, 1);

    const a = STATIONS[idx];
    const b = STATIONS[idx + 1];

    _desiredPos.set(
      THREE.MathUtils.lerp(a.cameraPos[0], b.cameraPos[0], t),
      THREE.MathUtils.lerp(a.cameraPos[1], b.cameraPos[1], t),
      THREE.MathUtils.lerp(a.cameraPos[2], b.cameraPos[2], t),
    );
    _desiredTarget.set(
      THREE.MathUtils.lerp(a.target[0], b.target[0], t),
      THREE.MathUtils.lerp(a.target[1], b.target[1], t),
      THREE.MathUtils.lerp(a.target[2], b.target[2], t),
    );

    if (!this.reducedMotion) {
      _desiredPos.x += this.pointerX * 0.14;
      _desiredPos.y -= this.pointerY * 0.08;
    }

    const alpha = this.reducedMotion ? 1 : 1 - Math.exp(-5.2 * dt);
    this.camera.position.lerp(_desiredPos, alpha);
    _currentTarget.lerp(_desiredTarget, alpha);
    this.camera.lookAt(_currentTarget);

    if (!this.reducedMotion) {
      this.elapsed += dt;
      if (this.topStone) {
        this.topStone.position.y = 0.925 + Math.sin(this.elapsed * 0.9) * 0.008;
        this.topStone.rotation.y = this.elapsed * 0.12;
      }

      if (this.motesMesh) {
        for (let i = 0; i < this.moteData.length; i++) {
          const m = this.moteData[i];
          _dummyObj.position.set(
            m.x + Math.sin(this.elapsed * 0.35 + m.phase) * 0.12,
            m.y + Math.sin(this.elapsed * m.speed + m.phase) * 0.14,
            m.z + Math.cos(this.elapsed * 0.3 + m.phase) * 0.1,
          );
          const s = 0.7 + Math.sin(this.elapsed * 0.8 + m.phase) * 0.3;
          _dummyObj.scale.setScalar(s);
          _dummyObj.updateMatrix();
          this.motesMesh.setMatrixAt(i, _dummyObj.matrix);
        }
        this.motesMesh.instanceMatrix.needsUpdate = true;
      }
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed || this.paused) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    if (this.disposed || this.paused) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.updateCameraAndScene(dt);
    this.renderer.render(this.scene, this.camera);
    this.scheduleNext();
  };

  private scheduleNext() {
    if (this.disposed || this.paused) return;
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private startLoop() {
    this.lastTime = performance.now();
    this.tick();
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.resources.geometries.forEach((g) => g.dispose());
    this.resources.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.envRT?.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
