import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import {
  BADGE_TOTAL_HALF_Z,
  createRoundedRectShape,
  createStandardPillShell,
  ResourceTracker,
} from './sharedPill';

const svgLoader = new SVGLoader();

function addDualFaceEmblem(
  frontAnchor: THREE.Group,
  backAnchor: THREE.Group,
  makeGroup: () => THREE.Object3D
) {
  frontAnchor.add(makeGroup());
  backAnchor.add(makeGroup());
}

export function buildGsapLenisBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.2,
      badgeH: 1.0,
      cornerR: 0.27,
      smoky: {
        badgeW: 3.2,
        badgeH: 1.0,
        cornerR: 0.27,
        bgStops: ['#103c15', '#0b2d0f', '#061c08', '#0e3613'],
        lightBlobRgb: '42, 138, 48',
        darkBlobRgb: '2, 14, 4',
        edgeGlowRgba: 'rgba(72, 255, 54, 0.9)',
        edgeStrokeRgba: 'rgba(72, 255, 54, 0.54)',
        innerStrokeRgba: 'rgba(116, 255, 92, 0.78)',
        seed: 7331,
      },
      rimColor: 0x62ff47,
      rimEmissive: 0x32e01d,
      typography: {
        badgeW: 3.2,
        badgeH: 1.0,
        text: 'GSAP & Lenis',
        fontWeight: 700,
        fontSizeFactor: 0.34,
        textXFraction: 0.31,
        textColor: '#F7FFF7',
        glowColor: 'rgba(195, 255, 195, 0.48)',
      },
    },
    maxAniso,
    tracker
  );

  // Flowing lime-green superhero cape + white muscular figure + green boots
  const capeShape = new THREE.Shape();
  capeShape.moveTo(0.02, 0.22);
  capeShape.quadraticCurveTo(0.14, 0.23, 0.19, 0.16);
  capeShape.bezierCurveTo(0.18, -0.02, 0.12, -0.18, -0.02, -0.25);
  capeShape.bezierCurveTo(-0.18, -0.22, -0.28, -0.16, -0.34, -0.04);
  capeShape.bezierCurveTo(-0.26, 0.1, -0.12, 0.18, 0.02, 0.22);

  const torsoShape = new THREE.Shape();
  torsoShape.moveTo(0, 0.32);
  torsoShape.bezierCurveTo(0.07, 0.32, 0.08, 0.22, 0.05, 0.17);
  torsoShape.lineTo(0.19, 0.09);
  torsoShape.lineTo(0.14, -0.06);
  torsoShape.lineTo(0.11, -0.31);
  torsoShape.lineTo(0.03, -0.31);
  torsoShape.lineTo(0, -0.09);
  torsoShape.lineTo(-0.07, -0.32);
  torsoShape.lineTo(-0.14, -0.32);
  torsoShape.lineTo(-0.1, -0.05);
  torsoShape.lineTo(-0.2, 0.07);
  torsoShape.lineTo(-0.06, 0.18);
  torsoShape.bezierCurveTo(-0.08, 0.23, -0.06, 0.32, 0, 0.32);

  const capeGeo = tracker.track(
    new THREE.ExtrudeGeometry(capeShape, {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    })
  );
  const torsoGeo = tracker.track(
    new THREE.ExtrudeGeometry(torsoShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 2,
    })
  );
  const bootGeo = tracker.track(new THREE.BoxGeometry(0.075, 0.14, 0.024));

  const capeMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x7ed316,
      emissive: 0x308c0a,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      clearcoat: 0.9,
    })
  );
  const suitMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf4faf5,
      emissive: 0xdfffe2,
      emissiveIntensity: 0.2,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-1.05, -0.01, BADGE_TOTAL_HALF_Z + 0.005);
    g.add(new THREE.Mesh(capeGeo, capeMat));
    const t = new THREE.Mesh(torsoGeo, suitMat);
    t.position.z = 0.012;
    g.add(t);
    const bL = new THREE.Mesh(bootGeo, capeMat);
    bL.position.set(-0.1, -0.25, 0.02);
    bL.rotation.z = -0.14;
    g.add(bL);
    const bR = new THREE.Mesh(bootGeo, capeMat);
    bR.position.set(0.07, -0.24, 0.02);
    bR.rotation.z = 0.08;
    g.add(bR);
    return g;
  });
  return root;
}

export function buildMotionBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.34,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.34,
        bgStops: ['#44126a', '#370d57', '#2c0848', '#3f1063'],
        lightBlobRgb: '148, 46, 215',
        darkBlobRgb: '18, 2, 34',
        edgeGlowRgba: 'rgba(228, 72, 255, 0.85)',
        edgeStrokeRgba: 'rgba(225, 72, 255, 0.65)',
        innerStrokeRgba: 'rgba(255, 130, 214, 0.78)',
        seed: 7319,
        gradientRimStops: [
          [0, '#ffa4df'],
          [0.45, '#e148ff'],
          [1, '#c83cff'],
        ],
      },
      rimColor: 0xe148ff,
      rimEmissive: 0xc83cff,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Motion',
        fontSizeFactor: 0.44,
        textXFraction: 0.38,
        textColor: '#FAF5FF',
        glowColor: 'rgba(244, 218, 255, 0.52)',
      },
    },
    maxAniso,
    tracker
  );

  // Origami M gradient canvas
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, '#ffa16c');
  grad.addColorStop(0.35, '#ff6d91');
  grad.addColorStop(0.68, '#7c3cf2');
  grad.addColorStop(1, '#22f2ff');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  const logoTex = tracker.track(new THREE.CanvasTexture(canvas));
  logoTex.colorSpace = THREE.SRGBColorSpace;
  logoTex.anisotropy = maxAniso;

  const M_H = 0.56;
  const M_W = M_H * 0.9;
  const x = (u: number) => (u - 0.5) * M_W;
  const y = (v: number) => (0.5 - v) * M_H;

  const mShape = new THREE.Shape();
  mShape.moveTo(x(0), y(0));
  mShape.lineTo(x(0.5), y(0.48));
  mShape.lineTo(x(1), y(0));
  mShape.lineTo(x(1), y(1));
  mShape.lineTo(x(0.74), y(0.74));
  mShape.lineTo(x(0.5), y(1));
  mShape.lineTo(x(0.26), y(0.74));
  mShape.lineTo(x(0), y(1));
  mShape.closePath();

  const mGeo = tracker.track(
    new THREE.ExtrudeGeometry(mShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    })
  );
  const pos = mGeo.attributes.position;
  const uv = mGeo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(
      i,
      THREE.MathUtils.clamp(pos.getX(i) / M_W + 0.5, 0, 1),
      THREE.MathUtils.clamp(pos.getY(i) / M_H + 0.5, 0, 1)
    );
  }
  uv.needsUpdate = true;

  const mMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      map: logoTex,
      emissive: 0xffffff,
      emissiveMap: logoTex,
      emissiveIntensity: 0.42,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const m = new THREE.Mesh(mGeo, mMat);
    m.position.set(-0.74, 0, BADGE_TOTAL_HALF_Z + 0.008);
    return m;
  });
  return root;
}

export function buildMatterjsBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.34,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.34,
        bgStops: ['#102413', '#152d19', '#0c1c0f', '#122816'],
        lightBlobRgb: '42, 108, 52',
        darkBlobRgb: '4, 14, 6',
        edgeGlowRgba: 'rgba(72, 232, 82, 0.85)',
        edgeStrokeRgba: 'rgba(66, 224, 76, 0.5)',
        innerStrokeRgba: 'rgba(88, 240, 96, 0.68)',
        seed: 4219,
      },
      rimColor: 0x52eb5c,
      rimEmissive: 0x34cf3e,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Matter.js',
        fontSizeFactor: 0.43,
        textXFraction: 0.37,
        textColor: '#F7FFF8',
        glowColor: 'rgba(225, 255, 232, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  const sc = 0.64;
  const tealMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x3aa59f,
      emissive: 0x1b635e,
      emissiveIntensity: 0.35,
      roughness: 0.18,
      clearcoat: 1.0,
    })
  );
  const yellowMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xfcc932,
      emissive: 0xe2a412,
      emissiveIntensity: 0.32,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );
  const coralMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf25835,
      emissive: 0xd43616,
      emissiveIntensity: 0.32,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );

  const nodeGeo = tracker.track(new THREE.CylinderGeometry(0.072 * sc, 0.072 * sc, 0.022, 18));
  nodeGeo.rotateX(Math.PI / 2);
  const yellowGeo = tracker.track(new THREE.CylinderGeometry(0.172 * sc, 0.172 * sc, 0.022, 22));
  yellowGeo.rotateX(Math.PI / 2);
  const coralGeo = tracker.track(
    new THREE.ExtrudeGeometry(createRoundedRectShape(0.32 * sc, 0.32 * sc, 0.015), {
      depth: 0.02,
      bevelEnabled: false,
    })
  );
  const strutGeo = tracker.track(new THREE.BoxGeometry(0.032, 1, 0.016));

  const pts = [
    new THREE.Vector2(-0.265 * sc, 0.255 * sc),
    new THREE.Vector2(-0.355 * sc, -0.325 * sc),
    new THREE.Vector2(0.005 * sc, -0.005 * sc),
  ];

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.82, 0, BADGE_TOTAL_HALF_Z + 0.01);
    pts.forEach((p) => {
      const m = new THREE.Mesh(nodeGeo, tealMat);
      m.position.set(p.x, p.y, 0);
      g.add(m);
    });
    const pairs: Array<[number, number]> = [
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    pairs.forEach(([aIdx, bIdx]) => {
      const a = pts[aIdx];
      const b = pts[bIdx];
      const len = a.distanceTo(b);
      const strut = new THREE.Mesh(strutGeo, tealMat);
      strut.scale.set(1, len, 1);
      strut.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 0);
      strut.rotation.z = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2;
      g.add(strut);
    });
    const yc = new THREE.Mesh(yellowGeo, yellowMat);
    yc.position.set(0.255 * sc, 0.285 * sc, 0);
    g.add(yc);

    const cs = new THREE.Mesh(coralGeo, coralMat);
    cs.position.set(0.255 * sc, -0.285 * sc, -0.01);
    g.add(cs);
    return g;
  });
  return root;
}

export function buildReactQueryBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.24,
      badgeH: 1.0,
      cornerR: 0.32,
      smoky: {
        badgeW: 3.24,
        badgeH: 1.0,
        cornerR: 0.32,
        bgStops: ['#441714', '#381210', '#2b0d0c', '#3e1512'],
        lightBlobRgb: '138, 44, 34',
        darkBlobRgb: '20, 5, 5',
        edgeGlowRgba: 'rgba(255, 102, 74, 0.86)',
        edgeStrokeRgba: 'rgba(255, 96, 68, 0.52)',
        innerStrokeRgba: 'rgba(255, 124, 92, 0.72)',
        seed: 7391,
      },
      rimColor: 0xff6e54,
      rimEmissive: 0xf24a34,
      typography: {
        badgeW: 3.24,
        badgeH: 1.0,
        text: 'React Query',
        fontSizeFactor: 0.39,
        textXFraction: 0.32,
        textColor: '#FFF9F7',
        glowColor: 'rgba(255, 175, 155, 0.42)',
      },
    },
    maxAniso,
    tracker
  );

  // 6 swirling coral petals + yellow hexagon center
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0.05, 0);
  petalShape.bezierCurveTo(0.14, 0.16, 0.28, 0.08, 0.25, -0.05);
  petalShape.bezierCurveTo(0.2, -0.14, 0.1, -0.08, 0.05, 0);

  const petalGeo = tracker.track(
    new THREE.ExtrudeGeometry(petalShape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelSegments: 2,
    })
  );
  const hexGeo = tracker.track(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 6));
  hexGeo.rotateX(Math.PI / 2);

  const redMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xff5252,
      emissive: 0xe63638,
      emissiveIntensity: 0.72,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );
  const yellowMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf6d564,
      emissive: 0xdba828,
      emissiveIntensity: 0.58,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-1.02, 0, BADGE_TOTAL_HALF_Z + 0.006);
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(petalGeo, redMat);
      m.rotation.z = i * (Math.PI / 3);
      g.add(m);
    }
    const hex = new THREE.Mesh(hexGeo, yellowMat);
    hex.position.z = 0.012;
    g.add(hex);
    return g;
  });
  return root;
}

export function buildZustandBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.33,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.33,
        bgStops: ['#4c2f14', '#3b230d', '#2b1808', '#462a10'],
        lightBlobRgb: '165, 102, 42',
        darkBlobRgb: '20, 10, 3',
        edgeGlowRgba: 'rgba(255, 164, 68, 0.85)',
        edgeStrokeRgba: 'rgba(245, 152, 54, 0.56)',
        innerStrokeRgba: 'rgba(255, 184, 96, 0.72)',
        seed: 7391,
      },
      rimColor: 0xf4a046,
      rimEmissive: 0xd97518,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Zustand',
        fontWeight: 700,
        fontSizeFactor: 0.44,
        textXFraction: 0.38,
        textColor: '#FFFFFF',
        glowColor: 'rgba(255, 232, 200, 0.48)',
      },
    },
    maxAniso,
    tracker
  );

  const furMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x73492e,
      roughness: 0.28,
      clearcoat: 0.65,
    })
  );
  const creamMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6c39e,
      roughness: 0.25,
      clearcoat: 0.7,
    })
  );
  const darkMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x241108,
      roughness: 0.22,
    })
  );

  const headGeo = tracker.track(new THREE.SphereGeometry(0.165, 16, 12));
  headGeo.scale(1.12, 0.94, 0.38);
  const bodyGeo = tracker.track(new THREE.SphereGeometry(0.165, 16, 12));
  bodyGeo.scale(1.0, 1.04, 0.36);
  const earGeo = tracker.track(new THREE.SphereGeometry(0.062, 12, 10));
  earGeo.scale(1, 1, 0.35);
  const snoutGeo = tracker.track(new THREE.SphereGeometry(0.072, 12, 10));
  snoutGeo.scale(1.2, 0.88, 0.45);
  const eyeGeo = tracker.track(new THREE.SphereGeometry(0.02, 8, 8));

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.78, -0.01, BADGE_TOTAL_HALF_Z + 0.022);
    const head = new THREE.Mesh(headGeo, furMat);
    head.position.set(0, 0.13, 0);
    g.add(head);

    const earL = new THREE.Mesh(earGeo, furMat);
    earL.position.set(-0.14, 0.26, -0.01);
    g.add(earL);
    const earR = new THREE.Mesh(earGeo, furMat);
    earR.position.set(0.14, 0.26, -0.01);
    g.add(earR);

    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.set(0, -0.14, -0.01);
    g.add(body);

    const belly = new THREE.Mesh(snoutGeo, creamMat);
    belly.position.set(0.01, -0.15, 0.036);
    belly.scale.set(1.25, 1.45, 0.65);
    g.add(belly);

    const snout = new THREE.Mesh(snoutGeo, creamMat);
    snout.position.set(0.02, 0.09, 0.05);
    g.add(snout);

    const nose = new THREE.Mesh(eyeGeo, darkMat);
    nose.position.set(0.02, 0.11, 0.082);
    nose.scale.set(1.3, 0.9, 0.8);
    g.add(nose);

    const eyeL = new THREE.Mesh(eyeGeo, darkMat);
    eyeL.position.set(-0.06, 0.155, 0.058);
    g.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, darkMat);
    eyeR.position.set(0.085, 0.155, 0.058);
    g.add(eyeR);

    return g;
  });
  return root;
}

export function buildN8nBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 2.55,
      badgeH: 1.04,
      cornerR: 0.34,
      smoky: {
        badgeW: 2.55,
        badgeH: 1.04,
        cornerR: 0.34,
        bgStops: ['#4f162c', '#3b0c1e', '#290714', '#431024'],
        lightBlobRgb: '182, 46, 88',
        darkBlobRgb: '20, 3, 10',
        edgeGlowRgba: 'rgba(255, 84, 128, 0.9)',
        edgeStrokeRgba: 'rgba(248, 72, 118, 0.62)',
        innerStrokeRgba: 'rgba(255, 108, 145, 0.78)',
        seed: 8421,
      },
      rimColor: 0xff5e84,
      rimEmissive: 0xe63968,
      typography: {
        badgeW: 2.55,
        badgeH: 1.04,
        text: 'n8n',
        fontWeight: 700,
        fontSizeFactor: 0.45,
        textXFraction: 0.56,
        textColor: '#FFF9FB',
        glowColor: 'rgba(255, 175, 200, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  const iconMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xff6b8e,
      emissive: 0xe23c69,
      emissiveIntensity: 0.9,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  const ringGeo = tracker.track(new THREE.TorusGeometry(0.05, 0.018, 10, 20));
  const barGeo = tracker.track(new THREE.BoxGeometry(0.14, 0.03, 0.022));

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.49, 0, BADGE_TOTAL_HALF_Z + 0.016);
    const nodes = [
      [-0.33, 0],
      [-0.14, 0],
      [0.24, 0.14],
      [0.2, -0.14],
    ];
    nodes.forEach(([nx, ny]) => {
      const m = new THREE.Mesh(ringGeo, iconMat);
      m.position.set(nx, ny, 0);
      g.add(m);
    });
    const b1 = new THREE.Mesh(barGeo, iconMat);
    b1.position.set(-0.235, 0, 0);
    g.add(b1);

    const bUp = new THREE.Mesh(barGeo, iconMat);
    bUp.scale.set(2.2, 0.9, 1);
    bUp.position.set(0.04, 0.07, 0);
    bUp.rotation.z = 0.38;
    g.add(bUp);

    const bDown = new THREE.Mesh(barGeo, iconMat);
    bDown.scale.set(2.0, 0.9, 1);
    bDown.position.set(0.02, -0.07, 0);
    bDown.rotation.z = -0.4;
    g.add(bDown);

    return g;
  });
  return root;
}

export function buildPlaywrightBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.32,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.32,
        bgStops: ['#0a4a1d', '#073c17', '#042a10', '#08421a'],
        lightBlobRgb: '26, 175, 62',
        darkBlobRgb: '2, 24, 8',
        edgeGlowRgba: 'rgba(46, 238, 72, 0.9)',
        edgeStrokeRgba: 'rgba(42, 232, 68, 0.58)',
        innerStrokeRgba: 'rgba(62, 248, 88, 0.76)',
        seed: 7319,
      },
      rimColor: 0x3bf24e,
      rimEmissive: 0x1fd935,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Playwright',
        fontSizeFactor: 0.42,
        textXFraction: 0.36,
        textColor: '#F3FFF5',
        glowColor: 'rgba(135, 255, 155, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  const maskBase = new THREE.Shape();
  maskBase.moveTo(0, 0.31);
  maskBase.bezierCurveTo(0.16, 0.31, 0.31, 0.36, 0.41, 0.43);
  maskBase.bezierCurveTo(0.45, 0.45, 0.46, 0.41, 0.45, 0.32);
  maskBase.bezierCurveTo(0.42, 0.02, 0.33, -0.26, 0.16, -0.43);
  maskBase.bezierCurveTo(0.06, -0.52, -0.06, -0.52, -0.16, -0.43);
  maskBase.bezierCurveTo(-0.33, -0.26, -0.42, 0.02, -0.45, 0.32);
  maskBase.bezierCurveTo(-0.46, 0.41, -0.45, 0.45, -0.41, 0.43);
  maskBase.bezierCurveTo(-0.31, 0.36, -0.16, 0.31, 0, 0.31);

  const greenMask = maskBase.clone();
  const smile = new THREE.Path();
  smile.moveTo(-0.21, -0.1);
  smile.bezierCurveTo(-0.18, -0.32, 0.18, -0.32, 0.21, -0.1);
  smile.bezierCurveTo(0.08, -0.12, -0.08, -0.12, -0.21, -0.1);
  greenMask.holes.push(smile);

  const redMask = maskBase.clone();
  const frown = new THREE.Path();
  frown.moveTo(-0.19, -0.26);
  frown.bezierCurveTo(-0.08, -0.19, 0.08, -0.19, 0.19, -0.26);
  frown.bezierCurveTo(0.1, -0.11, -0.1, -0.11, -0.19, -0.26);
  redMask.holes.push(frown);

  const opts = {
    depth: 0.015,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2,
    curveSegments: 16,
  };
  const greenGeo = tracker.track(new THREE.ExtrudeGeometry(greenMask, opts));
  const redGeo = tracker.track(new THREE.ExtrudeGeometry(redMask, opts));

  const greenMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x35c948,
      emissive: 0x0f6b20,
      emissiveIntensity: 0.35,
      roughness: 0.18,
      clearcoat: 1.0,
    })
  );
  const redMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xe35a4b,
      emissive: 0x5c140c,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    const rMesh = new THREE.Mesh(redGeo, redMat);
    rMesh.position.set(-1.05, 0.02, BADGE_TOTAL_HALF_Z + 0.004);
    rMesh.rotation.z = 0.28;
    rMesh.scale.set(0.43, 0.43, 1);
    g.add(rMesh);

    const gMesh = new THREE.Mesh(greenGeo, greenMat);
    gMesh.position.set(-0.74, -0.02, BADGE_TOTAL_HALF_Z + 0.024);
    gMesh.rotation.z = -0.19;
    gMesh.scale.set(0.54, 0.54, 1);
    g.add(gMesh);
    return g;
  });
  return root;
}

export function buildViteBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const rimCanvas = document.createElement('canvas');
  rimCanvas.width = 512;
  rimCanvas.height = 32;
  const rCtx = rimCanvas.getContext('2d')!;
  const rGrad = rCtx.createLinearGradient(0, 0, 512, 0);
  rGrad.addColorStop(0, '#9b4dff');
  rGrad.addColorStop(0.5, '#cf7ce0');
  rGrad.addColorStop(1, '#ffcc29');
  rCtx.fillStyle = rGrad;
  rCtx.fillRect(0, 0, 512, 32);
  const rimTex = tracker.track(new THREE.CanvasTexture(rimCanvas));
  rimTex.colorSpace = THREE.SRGBColorSpace;
  rimTex.anisotropy = maxAniso;

  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 2.55,
      badgeH: 1.0,
      cornerR: 0.34,
      smoky: {
        badgeW: 2.55,
        badgeH: 1.0,
        cornerR: 0.34,
        bgStops: ['#2a2247', '#221f38', '#1e1c2f', '#2b242c'],
        lightBlobRgb: '84, 68, 134',
        darkBlobRgb: '10, 8, 20',
        edgeGlowRgba: 'rgba(168, 85, 247, 0.85)',
        edgeStrokeRgba: 'rgba(168, 85, 247, 0.56)',
        innerStrokeRgba: 'rgba(255, 208, 56, 0.78)',
        seed: 7919,
        gradientRimStops: [
          [0, '#9b4dff'],
          [0.5, '#cf7ce0'],
          [1, '#ffcc29'],
        ],
      },
      rimColor: 0xffffff,
      rimEmissive: 0xffffff,
      rimMapTex: rimTex,
      typography: {
        badgeW: 2.55,
        badgeH: 1.0,
        text: 'Vite',
        fontSizeFactor: 0.47,
        textXFraction: 0.45,
        textColor: '#F7FAFF',
        glowColor: 'rgba(255, 255, 255, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  // Vite cyan-to-purple shield + golden lightning bolt
  const triShape = new THREE.Shape();
  triShape.moveTo(-0.28, 0.22);
  triShape.lineTo(0.28, 0.22);
  triShape.lineTo(0, -0.26);
  triShape.closePath();

  const boltShape = new THREE.Shape();
  boltShape.moveTo(-0.04, 0.25);
  boltShape.lineTo(0.11, 0.25);
  boltShape.lineTo(0.04, 0.05);
  boltShape.lineTo(0.14, 0.07);
  boltShape.lineTo(-0.04, -0.26);
  boltShape.lineTo(-0.01, -0.03);
  boltShape.lineTo(-0.1, -0.05);
  boltShape.closePath();

  const triGeo = tracker.track(
    new THREE.ExtrudeGeometry(triShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    })
  );
  const boltGeo = tracker.track(
    new THREE.ExtrudeGeometry(boltShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    })
  );

  const triMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x7c7cff,
      emissive: 0x41d1ff,
      emissiveIntensity: 0.55,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );
  const boltMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffdd35,
      emissive: 0xffa800,
      emissiveIntensity: 0.75,
      roughness: 0.13,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.56, 0, BADGE_TOTAL_HALF_Z + 0.006);
    g.add(new THREE.Mesh(triGeo, triMat));
    const b = new THREE.Mesh(boltGeo, boltMat);
    b.position.z = 0.012;
    g.add(b);
    return g;
  });
  return root;
}

export function buildGithubBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.34,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.34,
        bgStops: ['#5a1394', '#4b0d7c', '#3d0868', '#55118c'],
        lightBlobRgb: '168, 62, 240',
        darkBlobRgb: '26, 2, 48',
        edgeGlowRgba: 'rgba(218, 56, 255, 0.88)',
        edgeStrokeRgba: 'rgba(214, 52, 255, 0.56)',
        innerStrokeRgba: 'rgba(228, 86, 255, 0.74)',
        seed: 4219,
      },
      rimColor: 0xe66eff,
      rimEmissive: 0xc228ff,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'GitHub',
        fontSizeFactor: 0.5,
        textXFraction: 0.42,
        textColor: '#FAF5FF',
        glowColor: 'rgba(240, 210, 255, 0.55)',
      },
    },
    maxAniso,
    tracker
  );

  const octocatSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;
  const parsed = svgLoader.parse(octocatSvg);
  const shapes: THREE.Shape[] = [];
  parsed.paths.forEach((p) => shapes.push(...p.toShapes()));

  const octoGeo = tracker.track(
    new THREE.ExtrudeGeometry(shapes, {
      depth: 0.24,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.025,
      bevelSegments: 2,
      curveSegments: 16,
    })
  );
  octoGeo.translate(-8, -8, -0.12);
  const s = 0.62 / 16;
  octoGeo.scale(s, s, s);

  const octoMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xfbf7ff,
      emissive: 0xf3e4ff,
      emissiveIntensity: 0.42,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const m = new THREE.Mesh(octoGeo, octoMat);
    m.rotation.x = Math.PI;
    m.position.set(-0.75, 0, BADGE_TOTAL_HALF_Z + 0.008);
    return m;
  });
  return root;
}

export function buildNeutralPlaceholderBadge(
  opts: {
    label: string;
    rimHex: number;
    emissiveHex: number;
    glowRgba: string;
    bgStops: [string, string, string, string];
    accentRgb: string;
    seed: number;
  },
  maxAniso: number,
  tracker: ResourceTracker
): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 2.95,
      badgeH: 1.0,
      cornerR: 0.34,
      smoky: {
        badgeW: 2.95,
        badgeH: 1.0,
        cornerR: 0.34,
        bgStops: opts.bgStops,
        lightBlobRgb: opts.accentRgb,
        darkBlobRgb: '6, 8, 18',
        edgeGlowRgba: opts.glowRgba,
        edgeStrokeRgba: opts.glowRgba,
        innerStrokeRgba: opts.glowRgba,
        seed: opts.seed,
      },
      rimColor: opts.rimHex,
      rimEmissive: opts.emissiveHex,
      rimEmissiveIntensity: 0.78,
      typography: {
        badgeW: 2.95,
        badgeH: 1.0,
        text: opts.label,
        fontWeight: 700,
        fontSizeFactor: 0.44,
        textXFraction: 0.5,
        textAlign: 'center',
        maxWidthFraction: 0.65,
        textColor: '#F8FAFC',
        glowColor: opts.glowRgba,
      },
    },
    maxAniso,
    tracker
  );

  // Subtle neutral minimal side bracket bars indicating stylized 3D placeholder capsule
  const barGeo = tracker.track(new THREE.BoxGeometry(0.055, 0.26, 0.025));
  const barMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: opts.rimHex,
      emissive: opts.emissiveHex,
      emissiveIntensity: 0.65,
      roughness: 0.18,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    const left = new THREE.Mesh(barGeo, barMat);
    left.position.set(-1.05, 0, BADGE_TOTAL_HALF_Z + 0.01);
    const right = new THREE.Mesh(barGeo, barMat);
    right.position.set(1.05, 0, BADGE_TOTAL_HALF_Z + 0.01);
    g.add(left, right);
    return g;
  });

  return root;
}
