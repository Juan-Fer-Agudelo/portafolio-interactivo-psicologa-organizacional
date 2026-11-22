import * as THREE from 'three';

export interface ModelResources {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
}

function trackGeo<T extends THREE.BufferGeometry>(
  res: ModelResources,
  geo: T,
): T {
  res.geometries.push(geo);
  return geo;
}

function trackMat<T extends THREE.Material>(res: ModelResources, mat: T): T {
  res.materials.push(mat);
  return mat;
}

function addContactShadow(
  group: THREE.Group,
  res: ModelResources,
  shadowTex: THREE.Texture,
  radiusX: number,
  radiusZ: number,
  opacity = 0.4,
) {
  const geo = trackGeo(res, new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2));
  const mat = trackMat(
    res,
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity,
    }),
  );
  const plane = new THREE.Mesh(geo, mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.005;
  group.add(plane);
}

/**
 * 1. Bouclé Therapy Armchair (7-part composite group, bottom-center pivoted at y=0)
 */
export function createBoucleArmchair(
  res: ModelResources,
  linenTex: THREE.Texture,
  oakTex: THREE.Texture,
  shadowTex: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TherapyArmchair';

  const boucleMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xf0ece3,
      map: linenTex,
      roughness: 0.92,
      metalness: 0.0,
    }),
  );
  const sagePillowMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x4a6b5d,
      map: linenTex,
      roughness: 0.88,
      metalness: 0.0,
    }),
  );
  const oakMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xc29b70,
      map: oakTex,
      roughness: 0.58,
      metalness: 0.05,
    }),
  );

  // Tapered wooden legs (4)
  const legGeo = trackGeo(res, new THREE.CylinderGeometry(0.026, 0.017, 0.2, 16));
  const legPositions: [number, number, number][] = [
    [-0.34, 0.1, 0.3],
    [0.34, 0.1, 0.3],
    [-0.34, 0.1, -0.3],
    [0.34, 0.1, -0.3],
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, oakMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);
  });

  // Oak base plinth frame
  const frameShape = new THREE.Shape();
  frameShape.moveTo(-0.4, -0.36);
  frameShape.lineTo(0.4, -0.36);
  frameShape.lineTo(0.4, 0.36);
  frameShape.lineTo(-0.4, 0.36);
  frameShape.closePath();
  const frameGeo = trackGeo(
    res,
    new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 3,
    }),
  );
  frameGeo.rotateX(Math.PI / 2);
  const frame = new THREE.Mesh(frameGeo, oakMat);
  frame.position.y = 0.26;
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);

  // Plush seat cushion with beveled silhouette
  const seatShape = new THREE.Shape();
  const sw = 0.36;
  const sd = 0.35;
  seatShape.moveTo(-sw + 0.06, -sd);
  seatShape.quadraticCurveTo(0, -sd - 0.03, sw - 0.06, -sd);
  seatShape.quadraticCurveTo(sw, -sd, sw, -sd + 0.06);
  seatShape.lineTo(sw, sd - 0.06);
  seatShape.quadraticCurveTo(sw, sd, sw - 0.06, sd);
  seatShape.quadraticCurveTo(0, sd + 0.04, -sw + 0.06, sd);
  seatShape.quadraticCurveTo(-sw, sd, -sw, sd - 0.06);
  seatShape.lineTo(-sw, -sd + 0.06);
  seatShape.quadraticCurveTo(-sw, -sd, -sw + 0.06, -sd);

  const seatGeo = trackGeo(
    res,
    new THREE.ExtrudeGeometry(seatShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.04,
      bevelSegments: 5,
    }),
  );
  seatGeo.rotateX(Math.PI / 2);
  const seat = new THREE.Mesh(seatGeo, boucleMat);
  seat.position.set(0, 0.45, 0.03);
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);

  // Curved wraparound backrest
  const backGeo = trackGeo(
    res,
    new THREE.CylinderGeometry(0.45, 0.44, 0.56, 28, 1, true, Math.PI * 0.65, Math.PI * 0.7),
  );
  const backMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xf0ece3,
      map: linenTex,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
  );
  const backOuter = new THREE.Mesh(backGeo, backMat);
  backOuter.position.set(0, 0.66, 0.02);
  backOuter.castShadow = true;
  backOuter.receiveShadow = true;
  group.add(backOuter);

  // Thick upholstered backrest arch cushion
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.37, 0.44, 0.16),
    new THREE.Vector3(-0.41, 0.72, -0.14),
    new THREE.Vector3(0, 0.86, -0.35),
    new THREE.Vector3(0.41, 0.72, -0.14),
    new THREE.Vector3(0.37, 0.44, 0.16),
  ]);
  const archGeo = trackGeo(res, new THREE.TubeGeometry(archCurve, 32, 0.11, 14, false));
  const arch = new THREE.Mesh(archGeo, boucleMat);
  arch.castShadow = true;
  arch.receiveShadow = true;
  group.add(arch);

  // Accent sage lumbar pillow
  const pillowGeo = trackGeo(res, new THREE.BoxGeometry(0.38, 0.25, 0.1, 4, 4, 2));
  const posAttr = pillowGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const py = posAttr.getY(i);
    const pz = posAttr.getZ(i);
    const bulge = Math.cos((px / 0.19) * (Math.PI / 2)) * Math.cos((py / 0.125) * (Math.PI / 2));
    posAttr.setZ(i, pz + Math.sign(pz || 1) * bulge * 0.035);
  }
  pillowGeo.computeVertexNormals();
  const pillow = new THREE.Mesh(pillowGeo, sagePillowMat);
  pillow.position.set(-0.08, 0.56, -0.14);
  pillow.rotation.set(-0.25, 0.18, 0.06);
  pillow.castShadow = true;
  pillow.receiveShadow = true;
  group.add(pillow);

  addContactShadow(group, res, shadowTex, 0.65, 0.62, 0.42);
  return group;
}

/**
 * 2. Oak Side Table with Ceramic Tea Cup & Open Therapy Journal (8-part composite group)
 */
export function createOakSideTableAndTea(
  res: ModelResources,
  oakTex: THREE.Texture,
  shadowTex: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SideTableAndTea';

  const oakMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xb98f64,
      map: oakTex,
      roughness: 0.55,
      metalness: 0.04,
    }),
  );
  const ceramicMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0xe6e0d4,
      roughness: 0.28,
      metalness: 0.02,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    }),
  );
  const teaMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0x6f4e2e,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 0.9,
    }),
  );
  const journalCoverMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x2f483e,
      roughness: 0.82,
      metalness: 0.02,
    }),
  );
  const paperMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xf7f4ec,
      roughness: 0.9,
      metalness: 0.0,
    }),
  );
  const brassMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0xc5a267,
      roughness: 0.22,
      metalness: 0.92,
      anisotropy: 0.7,
    }),
  );

  // Turned table legs (3) using LatheGeometry
  const legProfile = [
    new THREE.Vector2(0.014, 0),
    new THREE.Vector2(0.018, 0.15),
    new THREE.Vector2(0.024, 0.44),
    new THREE.Vector2(0.028, 0.48),
    new THREE.Vector2(0, 0.48),
  ];
  const legGeo = trackGeo(res, new THREE.LatheGeometry(legProfile, 18));
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + 0.3;
    const leg = new THREE.Mesh(legGeo, oakMat);
    leg.position.set(Math.cos(angle) * 0.21, 0, Math.sin(angle) * 0.21);
    leg.rotation.z = Math.cos(angle) * 0.07;
    leg.rotation.x = -Math.sin(angle) * 0.07;
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);
  }

  // Beveled circular oak tabletop via LatheGeometry
  const topProfile = [
    new THREE.Vector2(0, 0.475),
    new THREE.Vector2(0.28, 0.475),
    new THREE.Vector2(0.31, 0.49),
    new THREE.Vector2(0.31, 0.51),
    new THREE.Vector2(0.295, 0.52),
    new THREE.Vector2(0, 0.52),
  ];
  const topGeo = trackGeo(res, new THREE.LatheGeometry(topProfile, 36));
  const tabletop = new THREE.Mesh(topGeo, oakMat);
  tabletop.castShadow = true;
  tabletop.receiveShadow = true;
  group.add(tabletop);

  // Ceramic mug (LatheGeometry) + handle (TubeGeometry) + tea liquid
  const mugProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.036, 0),
    new THREE.Vector2(0.044, 0.02),
    new THREE.Vector2(0.044, 0.095),
    new THREE.Vector2(0.039, 0.098),
    new THREE.Vector2(0.036, 0.02),
    new THREE.Vector2(0, 0.02),
  ];
  const mugGeo = trackGeo(res, new THREE.LatheGeometry(mugProfile, 24));
  const mug = new THREE.Mesh(mugGeo, ceramicMat);
  mug.position.set(0.09, 0.52, 0.07);
  mug.castShadow = true;
  mug.receiveShadow = true;
  group.add(mug);

  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.041, 0.078, 0),
    new THREE.Vector3(0.068, 0.072, 0),
    new THREE.Vector3(0.068, 0.034, 0),
    new THREE.Vector3(0.041, 0.028, 0),
  ]);
  const handleGeo = trackGeo(res, new THREE.TubeGeometry(handleCurve, 16, 0.006, 10, false));
  const handle = new THREE.Mesh(handleGeo, ceramicMat);
  handle.position.copy(mug.position);
  handle.rotation.y = 0.5;
  mug.add(handle);
  handle.position.set(0, 0, 0);

  const teaGeo = trackGeo(res, new THREE.CircleGeometry(0.037, 20));
  teaGeo.rotateX(-Math.PI / 2);
  const tea = new THREE.Mesh(teaGeo, teaMat);
  tea.position.set(0.09, 0.602, 0.07);
  group.add(tea);

  // Clinical notebook / journal + brass pen
  const coverGeo = trackGeo(res, new THREE.BoxGeometry(0.18, 0.014, 0.24));
  const cover = new THREE.Mesh(coverGeo, journalCoverMat);
  cover.position.set(-0.08, 0.527, -0.02);
  cover.rotation.y = -0.24;
  cover.castShadow = true;
  cover.receiveShadow = true;
  group.add(cover);

  const pagesGeo = trackGeo(res, new THREE.BoxGeometry(0.168, 0.012, 0.226));
  const pages = new THREE.Mesh(pagesGeo, paperMat);
  pages.position.set(0.002, 0.01, 0);
  cover.add(pages);

  const penGeo = trackGeo(res, new THREE.CylinderGeometry(0.0045, 0.0035, 0.145, 12));
  penGeo.rotateZ(Math.PI / 2);
  const pen = new THREE.Mesh(penGeo, brassMat);
  pen.position.set(-0.06, 0.548, 0.02);
  pen.rotation.y = 0.52;
  pen.castShadow = true;
  group.add(pen);

  addContactShadow(group, res, shadowTex, 0.36, 0.36, 0.36);
  return group;
}

/**
 * 3. Olive Tree in Matte Stoneware Planter (Composite Group + InstancedMesh foliage)
 */
export function createOliveTreePlanter(
  res: ModelResources,
  shadowTex: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'OliveTreePlanter';

  const potMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xd8d2c6,
      roughness: 0.86,
      metalness: 0.02,
    }),
  );
  const soilMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x4b3f35,
      roughness: 0.96,
      metalness: 0.0,
    }),
  );
  const barkMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x7b6958,
      roughness: 0.9,
      metalness: 0.0,
    }),
  );

  // Planter via LatheGeometry
  const potProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.18, 0),
    new THREE.Vector2(0.24, 0.22),
    new THREE.Vector2(0.25, 0.44),
    new THREE.Vector2(0.23, 0.46),
    new THREE.Vector2(0.21, 0.44),
    new THREE.Vector2(0.19, 0.36),
    new THREE.Vector2(0, 0.36),
  ];
  const potGeo = trackGeo(res, new THREE.LatheGeometry(potProfile, 30));
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  // Soil disc
  const soilGeo = trackGeo(res, new THREE.CircleGeometry(0.21, 24));
  soilGeo.rotateX(-Math.PI / 2);
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 0.41;
  soil.receiveShadow = true;
  group.add(soil);

  // Trunk & 2 organic limbs via TubeGeometry
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.4, 0),
    new THREE.Vector3(0.03, 0.85, 0.02),
    new THREE.Vector3(-0.02, 1.32, -0.02),
    new THREE.Vector3(0.04, 1.72, 0.01),
  ]);
  const trunkGeo = trackGeo(res, new THREE.TubeGeometry(trunkCurve, 20, 0.028, 10, false));
  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  trunk.castShadow = true;
  group.add(trunk);

  const limb1Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.01, 1.15, 0),
    new THREE.Vector3(-0.18, 1.42, 0.12),
    new THREE.Vector3(-0.32, 1.65, 0.16),
  ]);
  const limb1Geo = trackGeo(res, new THREE.TubeGeometry(limb1Curve, 14, 0.015, 8, false));
  const limb1 = new THREE.Mesh(limb1Geo, barkMat);
  limb1.castShadow = true;
  group.add(limb1);

  const limb2Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.01, 1.28, -0.01),
    new THREE.Vector3(0.2, 1.54, -0.14),
    new THREE.Vector3(0.32, 1.78, -0.18),
  ]);
  const limb2Geo = trackGeo(res, new THREE.TubeGeometry(limb2Curve, 14, 0.014, 8, false));
  const limb2 = new THREE.Mesh(limb2Geo, barkMat);
  limb2.castShadow = true;
  group.add(limb2);

  // Instanced olive leaves (56 leaves) with subtle per-instance scale & tint variation
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.035, 0.055, 0, 0.13);
  leafShape.quadraticCurveTo(-0.035, 0.055, 0, 0);
  const leafGeo = trackGeo(res, new THREE.ShapeGeometry(leafShape, 6));
  const leafMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
  );

  const leafCount = 56;
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  leaves.castShadow = true;
  leaves.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const anchors = [
    new THREE.Vector3(0.04, 1.72, 0.01),
    new THREE.Vector3(-0.3, 1.65, 0.15),
    new THREE.Vector3(0.3, 1.76, -0.16),
    new THREE.Vector3(0.08, 1.55, 0.18),
    new THREE.Vector3(-0.12, 1.48, -0.18),
  ];

  for (let i = 0; i < leafCount; i++) {
    const anchor = anchors[i % anchors.length];
    const theta = (i * 2.39996) % (Math.PI * 2);
    const radius = 0.08 + ((i * 17) % 10) * 0.022;
    const hOffset = (((i * 13) % 10) - 4) * 0.035;

    dummy.position.set(
      anchor.x + Math.cos(theta) * radius,
      anchor.y + hOffset,
      anchor.z + Math.sin(theta) * radius,
    );
    dummy.rotation.set(
      0.4 + ((i * 7) % 5) * 0.25,
      theta,
      (((i * 3) % 5) - 2) * 0.2,
    );
    const scale = 0.85 + ((i * 11) % 7) * 0.05; // ±15% variation
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    leaves.setMatrixAt(i, dummy.matrix);

    const shade = 0.88 + ((i * 19) % 10) * 0.02;
    color.setRGB(0.42 * shade, 0.54 * shade, 0.43 * shade);
    leaves.setColorAt(i, color);
  }
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  leaves.computeBoundingSphere();
  group.add(leaves);

  addContactShadow(group, res, shadowTex, 0.34, 0.34, 0.38);
  return group;
}

/**
 * 4. Balanced River-Stone Sculpture (5-part composite LatheGeometry cairn)
 */
export function createZenStoneSculpture(
  res: ModelResources,
  shadowTex: THREE.Texture,
): { group: THREE.Group; topStone: THREE.Mesh } {
  const group = new THREE.Group();
  group.name = 'ZenStoneSculpture';

  const plinthMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xded8cc,
      roughness: 0.78,
      metalness: 0.03,
    }),
  );
  const stoneColors = [0x8b867d, 0xa8a196, 0x62746a, 0xc7bfb2];

  // Travertine pedestal base
  const plinthGeo = trackGeo(res, new THREE.CylinderGeometry(0.22, 0.24, 0.56, 32));
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = 0.28;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  const stoneSpecs = [
    { rx: 0.16, ry: 0.07, y: 0.62 },
    { rx: 0.125, ry: 0.058, y: 0.74 },
    { rx: 0.09, ry: 0.048, y: 0.84 },
    { rx: 0.06, ry: 0.04, y: 0.925 },
  ];

  let topStone!: THREE.Mesh;

  stoneSpecs.forEach((spec, idx) => {
    const pts: THREE.Vector2[] = [];
    for (let s = 0; s <= 12; s++) {
      const t = (s / 12) * Math.PI;
      const r = Math.sin(t) * spec.rx * (1 + Math.sin(t * 2) * 0.08);
      const y = -Math.cos(t) * spec.ry;
      pts.push(new THREE.Vector2(Math.max(0, r), y));
    }
    const geo = trackGeo(res, new THREE.LatheGeometry(pts, 28));
    const mat = trackMat(
      res,
      new THREE.MeshStandardMaterial({
        color: stoneColors[idx],
        roughness: 0.68 + (idx % 2) * 0.25,
        metalness: idx === 2 ? 0.12 : 0.02,
      }),
    );
    const stone = new THREE.Mesh(geo, mat);
    stone.position.set(
      idx % 2 === 0 ? 0.006 : -0.005,
      spec.y,
      idx === 1 ? 0.008 : 0,
    );
    stone.rotation.z = (idx - 1.5) * 0.04;
    stone.castShadow = true;
    stone.receiveShadow = true;
    group.add(stone);
    if (idx === stoneSpecs.length - 1) topStone = stone;
  });

  addContactShadow(group, res, shadowTex, 0.3, 0.3, 0.35);
  return { group, topStone };
}

/**
 * 5. Minimalist Brass & Linen Floor Lamp (5-part composite group)
 */
export function createFloorLamp(
  res: ModelResources,
  linenTex: THREE.Texture,
  shadowTex: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'FloorLamp';

  const brassMat = trackMat(
    res,
    new THREE.MeshPhysicalMaterial({
      color: 0xc5a56f,
      roughness: 0.24,
      metalness: 0.9,
      anisotropy: 0.75,
    }),
  );
  const shadeMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xf7f2e7,
      map: linenTex,
      emissive: 0xffdeb3,
      emissiveIntensity: 0.32,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );

  // Weighted base
  const baseGeo = trackGeo(res, new THREE.CylinderGeometry(0.18, 0.2, 0.032, 32));
  const base = new THREE.Mesh(baseGeo, brassMat);
  base.position.y = 0.016;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Slender vertical stem
  const stemGeo = trackGeo(res, new THREE.CylinderGeometry(0.014, 0.016, 1.48, 16));
  const stem = new THREE.Mesh(stemGeo, brassMat);
  stem.position.y = 0.77;
  stem.castShadow = true;
  group.add(stem);

  // Curved brass arm
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.5, 0),
    new THREE.Vector3(0.05, 1.66, 0.04),
    new THREE.Vector3(0.22, 1.68, 0.14),
    new THREE.Vector3(0.26, 1.58, 0.16),
  ]);
  const armGeo = trackGeo(res, new THREE.TubeGeometry(armCurve, 20, 0.012, 10, false));
  const arm = new THREE.Mesh(armGeo, brassMat);
  arm.castShadow = true;
  group.add(arm);

  // Linen drum shade
  const shadeGeo = trackGeo(res, new THREE.CylinderGeometry(0.16, 0.21, 0.26, 32, 1, true));
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.set(0.26, 1.46, 0.16);
  shade.castShadow = true;
  group.add(shade);

  // Warm bulb core
  const bulbMat = trackMat(
    res,
    new THREE.MeshBasicMaterial({ color: 0xffe4bd }),
  );
  const bulbGeo = trackGeo(res, new THREE.SphereGeometry(0.036, 16, 16));
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(0.26, 1.47, 0.16);
  group.add(bulb);

  addContactShadow(group, res, shadowTex, 0.26, 0.26, 0.34);
  return group;
}

/**
 * 6. Architectural Consultation Sanctuary (Floor, Woven Rug, Arched Window Wall, Sheer Drapes)
 */
export function createSanctuaryArchitecture(
  res: ModelResources,
  plasterTex: THREE.Texture,
  oakTex: THREE.Texture,
  linenTex: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SanctuaryArchitecture';

  const floorMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xdccbb4,
      map: oakTex,
      roughness: 0.72,
      metalness: 0.02,
    }),
  );
  const rugMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xe6e0d5,
      map: linenTex,
      roughness: 0.96,
      metalness: 0.0,
    }),
  );
  const wallMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xf1eee7,
      map: plasterTex,
      roughness: 0.9,
      metalness: 0.0,
    }),
  );
  const mullionMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0xa6835c,
      map: oakTex,
      roughness: 0.52,
      metalness: 0.05,
    }),
  );
  const skyGlowMat = trackMat(
    res,
    new THREE.MeshBasicMaterial({
      color: 0xfff8eb,
    }),
  );

  // Wide floor disc so horizon blends seamlessly into fog
  const floorGeo = trackGeo(res, new THREE.CircleGeometry(14, 64));
  floorGeo.rotateX(-Math.PI / 2);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.receiveShadow = true;
  group.add(floor);

  // Woven area rug (offset >= 0.02 on Y to prevent Z-fighting)
  const rugGeo = trackGeo(res, new THREE.CylinderGeometry(2.15, 2.18, 0.022, 48));
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.position.set(0.15, 0.011, -0.2);
  rug.receiveShadow = true;
  group.add(rug);

  // Arched window wall built via Shape + hole + ExtrudeGeometry
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-5.5, 0);
  wallShape.lineTo(5.5, 0);
  wallShape.lineTo(5.5, 4.4);
  wallShape.lineTo(-5.5, 4.4);
  wallShape.closePath();

  const archHole = new THREE.Path();
  const ax = -1.1;
  const aw = 0.85;
  archHole.moveTo(ax - aw, 0.45);
  archHole.lineTo(ax - aw, 2.35);
  archHole.absarc(ax, 2.35, aw, Math.PI, 0, true);
  archHole.lineTo(ax + aw, 0.45);
  archHole.closePath();
  wallShape.holes.push(archHole);

  const wallGeo = trackGeo(
    res,
    new THREE.ExtrudeGeometry(wallShape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    }),
  );
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, 0, -2.55);
  wall.receiveShadow = true;
  wall.castShadow = true;
  group.add(wall);

  // Warm daylight backdrop behind the arched window
  const backdropGeo = trackGeo(res, new THREE.PlaneGeometry(2.4, 3.8));
  const backdrop = new THREE.Mesh(backdropGeo, skyGlowMat);
  backdrop.position.set(ax, 1.9, -2.85);
  group.add(backdrop);

  // Oak window sill & vertical mullion divider
  const sillGeo = trackGeo(res, new THREE.BoxGeometry(1.88, 0.06, 0.34));
  const sill = new THREE.Mesh(sillGeo, mullionMat);
  sill.position.set(ax, 0.45, -2.42);
  sill.castShadow = true;
  sill.receiveShadow = true;
  group.add(sill);

  const mullionVGeo = trackGeo(res, new THREE.BoxGeometry(0.045, 2.72, 0.06));
  const mullionV = new THREE.Mesh(mullionVGeo, mullionMat);
  mullionV.position.set(ax, 1.82, -2.42);
  mullionV.castShadow = true;
  group.add(mullionV);

  const mullionHGeo = trackGeo(res, new THREE.BoxGeometry(1.66, 0.045, 0.06));
  const mullionH = new THREE.Mesh(mullionHGeo, mullionMat);
  mullionH.position.set(ax, 1.55, -2.42);
  mullionH.castShadow = true;
  group.add(mullionH);

  // Floating oak wall shelf on the right side of the wall
  const shelfGeo = trackGeo(res, new THREE.BoxGeometry(1.65, 0.045, 0.26));
  const shelf = new THREE.Mesh(shelfGeo, mullionMat);
  shelf.position.set(1.55, 1.85, -2.18);
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  group.add(shelf);

  // Small ceramic vessel on the shelf
  const vaseProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.06, 0),
    new THREE.Vector2(0.09, 0.11),
    new THREE.Vector2(0.045, 0.21),
    new THREE.Vector2(0.052, 0.24),
    new THREE.Vector2(0.04, 0.24),
  ];
  const vaseGeo = trackGeo(res, new THREE.LatheGeometry(vaseProfile, 24));
  const vaseMat = trackMat(
    res,
    new THREE.MeshStandardMaterial({
      color: 0x4a6b5d,
      roughness: 0.45,
      metalness: 0.05,
    }),
  );
  const vase = new THREE.Mesh(vaseGeo, vaseMat);
  vase.position.set(1.3, 1.872, -2.18);
  vase.castShadow = true;
  group.add(vase);

  return group;
}
