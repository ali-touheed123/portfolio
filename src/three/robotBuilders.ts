import * as THREE from 'three';

export interface InteractiveRobotHandle {
  group: THREE.Group;
  headGroup: THREE.Group;
  leftArm?: THREE.Group;
  rightArm?: THREE.Group;
  accentProp?: THREE.Object3D;
  update: (t: number, dt: number, pointer: THREE.Vector2, impulse: number) => void;
  dispose: () => void;
}

function createVisorFaceTexture(variant: 'beats' | 'seeker' | 'wave' | 'guide', wink = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  if (variant === 'wave') {
    ctx.fillStyle = '#071019';
    ctx.fillRect(0, 0, 512, 320);

    // Subtle CRT horizontal scanlines
    ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
    for (let y = 0; y < 320; y += 8) {
      ctx.fillRect(0, y, 512, 2);
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';

    // Happy squinting arc eyes (^  ^)
    ctx.beginPath();
    ctx.arc(165, 155, 36, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    if (wink) {
      ctx.beginPath();
      ctx.moveTo(314, 145);
      ctx.lineTo(378, 145);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(347, 155, 36, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    // Cheerful smile
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 178, 42, Math.PI * 0.16, Math.PI * 0.84);
    ctx.stroke();
  } else if (variant === 'guide') {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, 512, 320);
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 22;

    // Left eye: winking happy arc
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(168, 150, 32, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    // Right eye: crisp glowing cyan iris ring + dark pupil
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(345, 142, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#070b14';
    ctx.beginPath();
    ctx.arc(345, 142, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(355, 131, 6, 0, Math.PI * 2);
    ctx.fill();

    // Gentle cyan smile
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(256, 172, 36, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  } else if (variant === 'beats') {
    ctx.fillStyle = '#090914';
    ctx.fillRect(0, 0, 512, 320);
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;

    // Two expressive glowing cyan capsule eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(142, 118, 48, 62, 24);
    ctx.roundRect(322, 118, 48, 62, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(158, 136, 9, 0, Math.PI * 2);
    ctx.arc(338, 136, 9, 0, Math.PI * 2);
    ctx.fill();

    // Minimal digital smile
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(256, 182, 32, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();
  } else {
    // Seeker visor: glossy deep purple night dome with cyan reflection bubble & sparkle
    const grad = ctx.createRadialGradient(180, 110, 20, 256, 160, 260);
    grad.addColorStop(0, '#3b1d5e');
    grad.addColorStop(0.55, '#190c2e');
    grad.addColorStop(1, '#080514');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 320);

    // Subtle specular cyan bubble reflection
    ctx.fillStyle = 'rgba(56, 189, 248, 0.36)';
    ctx.beginPath();
    ctx.ellipse(165, 112, 46, 26, -0.35, 0, Math.PI * 2);
    ctx.fill();

    // Cute tiny eyes peeking inside
    ctx.fillStyle = '#67e8f9';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(204, 152, 16, 0, Math.PI * 2);
    ctx.arc(308, 152, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createChestScreenTexture(primary: string, accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 256, 192);

  ctx.strokeStyle = primary;
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, 228, 164);

  // Waveform / HUD bars
  ctx.fillStyle = primary;
  [44, 76, 108, 140, 172, 204].forEach((x, idx) => {
    const h = 38 + Math.sin(idx * 1.4) * 28;
    ctx.fillRect(x, 126 - h, 14, h);
  });

  ctx.fillStyle = accent;
  ctx.fillRect(34, 34, 92, 10);
  ctx.fillRect(34, 52, 54, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeStarMesh(): THREE.Mesh {
  const shape = new THREE.Shape();
  const outer = 0.28;
  const inner = 0.13;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 4,
  });
  geo.center();

  const mat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    emissive: '#f59e0b',
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.65,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

function disposeGroup(group: THREE.Group, textures: THREE.Texture[]) {
  textures.forEach((t) => t.dispose());
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}

/**
 * 01 · Beats Astro (from robot1.jfif):
 * Seated white & lavender astronaut wearing glowing purple/pink over-ear headphones,
 * chest holographic display, backpack with latches, purple-soled boots.
 */
export function buildBeatsAstroRobot(): InteractiveRobotHandle {
  const root = new THREE.Group();
  const headGroup = new THREE.Group();
  const leftArm = new THREE.Group();
  const rightArm = new THREE.Group();
  const textures: THREE.Texture[] = [];

  const whiteSuit = new THREE.MeshStandardMaterial({ color: '#eef2ff', roughness: 0.36, metalness: 0.08 });
  const lavenderTrim = new THREE.MeshStandardMaterial({ color: '#8b5cf6', roughness: 0.32, metalness: 0.28 });
  const pinkCushion = new THREE.MeshStandardMaterial({ color: '#c084fc', roughness: 0.45, metalness: 0.15 });
  const soleMat = new THREE.MeshStandardMaterial({ color: '#6d28d9', roughness: 0.42, metalness: 0.18 });
  const visorTex = createVisorFaceTexture('beats');
  const screenTex = createChestScreenTexture('#38bdf8', '#c084fc');
  textures.push(visorTex, screenTex);

  const visorMat = new THREE.MeshPhysicalMaterial({
    map: visorTex,
    roughness: 0.12,
    metalness: 0.1,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
  });

  // Torso (slightly leaning comfortably forward in a seated pose)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.34, 16, 28), whiteSuit);
  torso.position.set(0, 0.72, 0);
  torso.castShadow = true;
  root.add(torso);

  // Chest holographic panel
  const chestBezel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.08), lavenderTrim);
  chestBezel.position.set(0, 0.74, 0.33);
  root.add(chestBezel);

  const chestDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.2),
    new THREE.MeshBasicMaterial({ map: screenTex })
  );
  chestDisplay.position.set(0, 0.74, 0.376);
  root.add(chestDisplay);

  // Rounded Backpack with lavender side latches
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.56, 0.28), whiteSuit);
  pack.position.set(0, 0.76, -0.34);
  pack.castShadow = true;
  root.add(pack);

  [-0.26, 0.26].forEach((lx) => {
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.14), lavenderTrim);
    latch.position.set(lx, 0.78, -0.34);
    root.add(latch);
  });

  // Seated bent legs + purple boots sticking forward
  [-0.2, 0.2].forEach((lx) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.32, 12, 20), whiteSuit);
    thigh.rotation.x = Math.PI / 2.25;
    thigh.position.set(lx, 0.3, 0.26);
    thigh.castShadow = true;
    root.add(thigh);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.26, 12, 20), whiteSuit);
    shin.rotation.x = 0.22;
    shin.position.set(lx, 0.18, 0.54);
    root.add(shin);

    const boot = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.14, 12, 20), soleMat);
    boot.rotation.x = Math.PI / 2;
    boot.position.set(lx, 0.08, 0.62);
    boot.castShadow = true;
    root.add(boot);
  });

  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.11, 0.34, 12, 20);
  const lArmMesh = new THREE.Mesh(armGeo, whiteSuit);
  lArmMesh.position.set(0, -0.18, 0.06);
  lArmMesh.rotation.z = 0.26;
  lArmMesh.rotation.x = -0.35;
  leftArm.position.set(-0.43, 0.88, 0);
  leftArm.add(lArmMesh);
  root.add(leftArm);

  const rArmMesh = new THREE.Mesh(armGeo, whiteSuit);
  rArmMesh.position.set(0, -0.18, 0.06);
  rArmMesh.rotation.z = -0.26;
  rArmMesh.rotation.x = -0.35;
  rightArm.position.set(0.43, 0.88, 0);
  rightArm.add(rArmMesh);
  root.add(rightArm);

  // Head + Visor + Over-Ear Headphones
  headGroup.position.set(0, 1.36, 0.02);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.46, 36, 28), whiteSuit);
  helmet.scale.set(1.06, 0.96, 1.0);
  helmet.castShadow = true;
  headGroup.add(helmet);

  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24, -Math.PI * 0.38, Math.PI * 0.76, Math.PI * 0.24, Math.PI * 0.52), visorMat);
  visor.rotation.y = Math.PI / 2;
  visor.position.set(0, -0.02, 0.065);
  headGroup.add(visor);

  // Headphone headband
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.055, 16, 40, Math.PI), lavenderTrim);
  band.rotation.z = 0;
  headGroup.add(band);

  const headphoneGroup = new THREE.Group();
  [-0.5, 0.5].forEach((hx) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.11, 24), pinkCushion);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(hx, 0.02, 0);
    cup.castShadow = true;
    headphoneGroup.add(cup);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.024, 12, 24), lavenderTrim);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(hx + (hx > 0 ? 0.058 : -0.058), 0.02, 0);
    headphoneGroup.add(ring);
  });
  headGroup.add(headphoneGroup);
  root.add(headGroup);

  return {
    group: root,
    headGroup,
    leftArm,
    rightArm,
    accentProp: headphoneGroup,
    update: (t, _dt, pointer, impulse) => {
      const bounce = Math.sin(t * 2.8) * 0.03 + impulse * Math.sin(t * 14) * 0.12;
      root.position.y = bounce;
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, pointer.x * 0.45, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -pointer.y * 0.28 + Math.sin(t * 4.2) * 0.04, 0.08);
      headphoneGroup.scale.setScalar(1 + Math.sin(t * 5.6) * 0.025 + impulse * 0.08);
      rightArm.rotation.x = Math.sin(t * 2.4) * 0.18 - impulse * 0.7;
      leftArm.rotation.x = -Math.sin(t * 2.4) * 0.14;
    },
    dispose: () => disposeGroup(root, textures),
  };
}

/**
 * 02 · Star Seeker (from robot2.jfif):
 * Floating matte-white astronaut with violet backpack, coral stripes, dark glossy dome visor,
 * reaching upward toward a glowing beveled golden star.
 */
export function buildStarSeekerRobot(): InteractiveRobotHandle {
  const root = new THREE.Group();
  const headGroup = new THREE.Group();
  const rightArm = new THREE.Group();
  const leftArm = new THREE.Group();
  const textures: THREE.Texture[] = [];

  const suitMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4, metalness: 0.05 });
  const violetMat = new THREE.MeshStandardMaterial({ color: '#7c3aed', roughness: 0.34, metalness: 0.25 });
  const coralMat = new THREE.MeshStandardMaterial({ color: '#f43f5e', roughness: 0.35, metalness: 0.15 });
  const visorTex = createVisorFaceTexture('seeker');
  textures.push(visorTex);

  const visorMat = new THREE.MeshPhysicalMaterial({
    map: visorTex,
    roughness: 0.08,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  // Floating angled body
  const body = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.4, 16, 28), suitMat);
  torso.position.set(0, 0.85, 0);
  torso.castShadow = true;
  body.add(torso);

  // Coral chest button + loop badge
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 24), coralMat);
  badge.rotation.x = Math.PI / 2;
  badge.position.set(0, 0.92, 0.31);
  body.add(badge);

  // Coral belt trim
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.032, 12, 32), coralMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.set(0, 0.68, 0);
  body.add(belt);

  // Violet jet-backpack
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.52, 0.24), violetMat);
  pack.position.set(0, 0.88, -0.32);
  pack.castShadow = true;
  body.add(pack);

  // Floating tucked legs with coral stripes
  [-0.16, 0.16].forEach((lx, i) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.36, 12, 20), suitMat);
    leg.position.set(lx, 0.34 - i * 0.06, -0.05 + i * 0.08);
    leg.rotation.x = 0.28 + i * 0.18;
    leg.castShadow = true;
    body.add(leg);

    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.022, 10, 24), coralMat);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.set(lx, 0.26 - i * 0.06, 0.01 + i * 0.08);
    body.add(stripe);
  });

  // Left arm balanced outward
  const lArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.36, 12, 18), suitMat);
  lArm.position.set(0, -0.18, 0);
  leftArm.position.set(-0.38, 1.02, 0);
  leftArm.rotation.z = 0.55;
  leftArm.add(lArm);
  body.add(leftArm);

  // Right arm reaching up toward the floating golden star
  const rArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.42, 12, 18), suitMat);
  rArm.position.set(0, 0.22, 0.05);
  rightArm.position.set(0.36, 1.06, 0.04);
  rightArm.rotation.z = -0.58;
  rightArm.rotation.x = -0.32;
  rightArm.add(rArm);
  body.add(rightArm);

  // Head
  headGroup.position.set(0, 1.44, 0.04);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.42, 36, 28), suitMat);
  helmet.castShadow = true;
  headGroup.add(helmet);

  const domeVisor = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 24, -Math.PI * 0.4, Math.PI * 0.8, Math.PI * 0.2, Math.PI * 0.58),
    visorMat
  );
  domeVisor.rotation.y = Math.PI / 2;
  domeVisor.position.set(0, -0.02, 0.06);
  headGroup.add(domeVisor);
  body.add(headGroup);

  root.add(body);

  // Orbiting glowing golden star
  const star = makeStarMesh();
  star.position.set(0.74, 1.88, 0.22);
  root.add(star);

  return {
    group: root,
    headGroup,
    leftArm,
    rightArm,
    accentProp: star,
    update: (t, dt, pointer, impulse) => {
      body.position.y = Math.sin(t * 2.1) * 0.09 + impulse * 0.18;
      body.rotation.z = Math.sin(t * 1.4) * 0.04 - 0.04;
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, pointer.x * 0.42 + 0.12, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -pointer.y * 0.24 - 0.12, 0.08);
      star.rotation.y += dt * (1.8 + impulse * 8.0);
      star.position.y = 1.88 + Math.sin(t * 2.8) * 0.08 + impulse * 0.16;
      star.scale.setScalar(1 + Math.sin(t * 4) * 0.05 + impulse * 0.22);
      rightArm.rotation.z = -0.58 + Math.sin(t * 2.2) * 0.07;
    },
    dispose: () => disposeGroup(root, textures),
  };
}

/**
 * 03 · Wave Bot (from robot3.jfif):
 * Cheerful rounded-square-head turquoise & white robot with twin ear antennas,
 * CRT scanline face with happy eyes, glowing cyan chest core, waving right arm.
 */
export function buildWaveBotRobot(): InteractiveRobotHandle {
  const root = new THREE.Group();
  const headGroup = new THREE.Group();
  const rightArm = new THREE.Group();
  const leftArm = new THREE.Group();
  const textures: THREE.Texture[] = [];

  const whiteMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.34, metalness: 0.1 });
  const tealMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', roughness: 0.28, metalness: 0.25 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: '#67e8f9',
    emissive: '#22d3ee',
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  const faceTex = createVisorFaceTexture('wave');
  textures.push(faceTex);

  // Cute rounded body
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.32, 16, 28), whiteMat);
  torso.position.set(0, 0.68, 0);
  torso.castShadow = true;
  root.add(torso);

  // Glowing cyan circular chest core
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 12, 28), tealMat);
  coreRing.position.set(0, 0.72, 0.31);
  root.add(coreRing);

  const coreGem = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 20), glowMat);
  coreGem.position.set(0, 0.72, 0.3);
  root.add(coreGem);

  // Legs
  [-0.15, 0.15].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.24, 12, 18), tealMat);
    leg.position.set(lx, 0.26, 0);
    leg.castShadow = true;
    root.add(leg);
  });

  // Left arm relaxed
  const lArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.32, 12, 18), whiteMat);
  lArm.position.set(0, -0.16, 0);
  leftArm.position.set(-0.4, 0.84, 0);
  leftArm.rotation.z = 0.24;
  leftArm.add(lArm);
  root.add(leftArm);

  // Right waving arm
  const rArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.36, 12, 18), whiteMat);
  rArm.position.set(0, 0.18, 0);
  const handBall = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), tealMat);
  handBall.position.set(0, 0.4, 0);
  rightArm.position.set(0.4, 0.84, 0);
  rightArm.rotation.z = -0.65;
  rightArm.add(rArm, handBall);
  root.add(rightArm);

  // Rounded-square CRT Monitor Head
  headGroup.position.set(0, 1.38, 0);
  const headHousing = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.72, 0.62), whiteMat);
  headHousing.castShadow = true;
  headGroup.add(headHousing);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.56, 0.08), tealMat);
  bezel.position.set(0, 0, 0.29);
  headGroup.add(bezel);

  const crtFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 0.46),
    new THREE.MeshBasicMaterial({ map: faceTex })
  );
  crtFace.position.set(0, 0, 0.335);
  headGroup.add(crtFace);

  // Twin side ear-antennas with glowing cyan pads
  [-0.5, 0.5].forEach((ex) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 20), glowMat);
    pad.rotation.z = Math.PI / 2;
    pad.position.set(ex, 0.02, 0);
    headGroup.add(pad);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 12), tealMat);
    mast.position.set(ex * 1.04, 0.22, 0);
    headGroup.add(mast);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), glowMat);
    tip.position.set(ex * 1.04, 0.36, 0);
    headGroup.add(tip);
  });

  root.add(headGroup);

  return {
    group: root,
    headGroup,
    leftArm,
    rightArm,
    accentProp: coreGem,
    update: (t, _dt, pointer, impulse) => {
      root.position.y = Math.sin(t * 2.5) * 0.08 + impulse * 0.15;
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, pointer.x * 0.45, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -pointer.y * 0.26, 0.08);
      rightArm.rotation.z = -0.68 + Math.sin(t * (5.2 + impulse * 6)) * 0.28;
      coreGem.scale.setScalar(1 + Math.sin(t * 4) * 0.1 + impulse * 0.35);
    },
    dispose: () => disposeGroup(root, textures),
  };
}

/**
 * 04 · Guide Bot (from robot4.jfif):
 * Floating white & slate-silver bot with cyan-ringed headphones + top antenna,
 * winking cyan visor face, chest speaker core, articulated pointing hand.
 */
export function buildGuideBotRobot(): InteractiveRobotHandle {
  const root = new THREE.Group();
  const headGroup = new THREE.Group();
  const leftArm = new THREE.Group();
  const rightArm = new THREE.Group();
  const textures: THREE.Texture[] = [];

  const shellMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.14 });
  const silverMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.32, metalness: 0.48 });
  const cyanEmissive = new THREE.MeshStandardMaterial({
    color: '#22d3ee',
    emissive: '#06b6d4',
    emissiveIntensity: 1.35,
    roughness: 0.18,
  });
  const guideTex = createVisorFaceTexture('guide');
  textures.push(guideTex);

  const visorMat = new THREE.MeshPhysicalMaterial({
    map: guideTex,
    roughness: 0.1,
    metalness: 0.12,
    clearcoat: 0.95,
  });

  // Floating sleek tapered egg-torso (hover bot silhouette)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.36, 18, 28), shellMat);
  torso.position.set(0, 0.78, 0);
  torso.castShadow = true;
  root.add(torso);

  // Chest speaker core
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.024, 14, 28), cyanEmissive);
  ring.position.set(0, 0.82, 0.31);
  root.add(ring);

  const speaker = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 24), silverMat);
  speaker.rotation.x = Math.PI / 2;
  speaker.position.set(0, 0.82, 0.3);
  root.add(speaker);

  // Hover thruster base ring
  const hoverRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.032, 12, 28), cyanEmissive);
  hoverRing.rotation.x = Math.PI / 2;
  hoverRing.position.set(0, 0.38, 0);
  root.add(hoverRing);

  // Right arm tucked casually
  const rArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.3, 12, 18), silverMat);
  rArm.position.set(0, -0.15, 0);
  rightArm.position.set(0.4, 0.9, 0);
  rightArm.rotation.z = -0.25;
  rightArm.add(rArm);
  root.add(rightArm);

  // Left arm pointing forward toward the visitor/project!
  const lUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.34, 12, 18), shellMat);
  lUpper.rotation.x = Math.PI / 2;
  lUpper.position.set(0, 0, 0.22);
  const pointerFinger = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.14, 8, 12), cyanEmissive);
  pointerFinger.rotation.x = Math.PI / 2;
  pointerFinger.position.set(0, 0.02, 0.48);
  leftArm.position.set(-0.4, 0.92, 0.06);
  leftArm.rotation.y = 0.22;
  leftArm.add(lUpper, pointerFinger);
  root.add(leftArm);

  // Head + Cyan-ringed headphones + Top Antenna
  headGroup.position.set(0, 1.42, 0.02);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.44, 36, 28), shellMat);
  skull.scale.set(1.06, 0.94, 0.98);
  skull.castShadow = true;
  headGroup.add(skull);

  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.415, 32, 24, -Math.PI * 0.38, Math.PI * 0.76, Math.PI * 0.22, Math.PI * 0.54),
    visorMat
  );
  visor.rotation.y = Math.PI / 2;
  visor.position.set(0, -0.02, 0.055);
  headGroup.add(visor);

  // Headphones & glowing cyan rings
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.045, 14, 36, Math.PI), silverMat);
  headGroup.add(band);

  [-0.47, 0.47].forEach((hx) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 24), shellMat);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(hx, 0, 0);
    headGroup.add(cup);

    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 12, 24), cyanEmissive);
    glowRing.rotation.y = Math.PI / 2;
    glowRing.position.set(hx + (hx > 0 ? 0.05 : -0.05), 0, 0);
    headGroup.add(glowRing);
  });

  // Top beacon antenna
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.28, 12), silverMat);
  mast.position.set(0.24, 0.48, -0.04);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), cyanEmissive);
  beacon.position.set(0.24, 0.64, -0.04);
  headGroup.add(mast, beacon);

  root.add(headGroup);

  return {
    group: root,
    headGroup,
    leftArm,
    rightArm,
    accentProp: beacon,
    update: (t, _dt, pointer, impulse) => {
      root.position.y = Math.sin(t * 2.3) * 0.09 + impulse * 0.16;
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, pointer.x * 0.48, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -pointer.y * 0.28, 0.08);
      leftArm.rotation.y = 0.22 + pointer.x * 0.25;
      leftArm.rotation.x = -pointer.y * 0.22 - impulse * 0.25;
      beacon.scale.setScalar(1 + Math.sin(t * 6) * 0.12 + impulse * 0.4);
      hoverRing.scale.setScalar(1 + Math.sin(t * 4.5) * 0.06);
    },
    dispose: () => disposeGroup(root, textures),
  };
}
