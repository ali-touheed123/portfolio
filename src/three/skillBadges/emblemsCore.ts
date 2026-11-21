import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import {
  BADGE_TOTAL_HALF_Z,
  createPillBaseGeometries,
  createRoundedRectShape,
  createStandardPillShell,
  createTypographyTextures,
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

export function buildReactBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.32,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.32,
        bgStops: ['#046582', '#035771', '#02465d', '#035d79'],
        lightBlobRgb: '18, 175, 210',
        darkBlobRgb: '1, 24, 34',
        edgeGlowRgba: 'rgba(18, 228, 255, 0.9)',
        edgeStrokeRgba: 'rgba(16, 224, 255, 0.56)',
        innerStrokeRgba: 'rgba(68, 240, 255, 0.78)',
        seed: 101,
      },
      rimColor: 0x1eeeff,
      rimEmissive: 0x0ed7f5,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'React',
        fontSizeFactor: 0.48,
        textXFraction: 0.42,
        textColor: '#F3FDFF',
        glowColor: 'rgba(120, 245, 255, 0.5)',
      },
    },
    maxAniso,
    tracker
  );

  const atomMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x44f4ff,
      emissive: 0x1ae3ff,
      emissiveIntensity: 0.95,
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 1.0,
    })
  );

  const orbitPts: THREE.Vector3[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    orbitPts.push(new THREE.Vector3(Math.cos(a) * 0.27, Math.sin(a) * 0.105, 0));
  }
  const orbitCurve = new THREE.CatmullRomCurve3(orbitPts, true);
  const orbitGeo = tracker.track(new THREE.TubeGeometry(orbitCurve, 64, 0.015, 8, true));
  const coreGeo = tracker.track(new THREE.CylinderGeometry(0.052, 0.052, 0.032, 20));
  coreGeo.rotateX(Math.PI / 2);

  const createAtom = () => {
    const g = new THREE.Group();
    g.position.set(-0.72, 0, BADGE_TOTAL_HALF_Z + 0.016);
    [0, Math.PI / 3, -Math.PI / 3].forEach((rot) => {
      const m = new THREE.Mesh(orbitGeo, atomMat);
      m.rotation.z = rot;
      g.add(m);
    });
    g.add(new THREE.Mesh(coreGeo, atomMat));
    return g;
  };

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, createAtom);
  return root;
}

export function buildNextjsBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 2.68,
      badgeH: 1.05,
      cornerR: 0.35,
      smoky: {
        badgeW: 2.68,
        badgeH: 1.05,
        cornerR: 0.35,
        bgStops: ['#102028', '#14191e', '#18191a', '#15181b'],
        lightBlobRgb: '56, 68, 82',
        darkBlobRgb: '6, 8, 12',
        edgeGlowRgba: 'rgba(148, 163, 184, 0.55)',
        edgeStrokeRgba: 'rgba(148, 163, 184, 0.4)',
        innerStrokeRgba: 'rgba(203, 213, 225, 0.45)',
        seed: 202,
      },
      rimColor: 0x38414a,
      rimEmissive: 0x1e252c,
      rimEmissiveIntensity: 0.5,
      typography: {
        badgeW: 2.68,
        badgeH: 1.05,
        text: 'Next.js',
        fontSizeFactor: 0.44,
        textXFraction: 0.39,
        textColor: '#F8FAFC',
        glowColor: 'rgba(255, 255, 255, 0.35)',
      },
    },
    maxAniso,
    tracker
  );

  const circleGeo = tracker.track(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 32));
  circleGeo.rotateX(Math.PI / 2);
  const circleMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x080b0f,
      roughness: 0.2,
      metalness: 0.35,
      clearcoat: 1.0,
    })
  );
  const ringGeo = tracker.track(new THREE.TorusGeometry(0.28, 0.014, 10, 36));
  const whiteMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xdbeafe,
      emissiveIntensity: 0.35,
      roughness: 0.14,
      metalness: 0.1,
    })
  );

  const pillarShape = createRoundedRectShape(0.052, 0.28, 0.01);
  const pillarGeo = tracker.track(
    new THREE.ExtrudeGeometry(pillarShape, { depth: 0.022, bevelEnabled: false })
  );
  pillarGeo.center();

  const slashShape = new THREE.Shape();
  slashShape.moveTo(-0.105, 0.14);
  slashShape.lineTo(-0.045, 0.14);
  slashShape.lineTo(0.145, -0.17);
  slashShape.lineTo(0.088, -0.17);
  slashShape.closePath();
  const slashGeo = tracker.track(
    new THREE.ExtrudeGeometry(slashShape, { depth: 0.024, bevelEnabled: false })
  );
  slashGeo.center();

  const createMark = () => {
    const g = new THREE.Group();
    g.position.set(-0.68, 0, BADGE_TOTAL_HALF_Z + 0.008);
    g.add(new THREE.Mesh(circleGeo, circleMat));
    const rMesh = new THREE.Mesh(ringGeo, whiteMat);
    rMesh.position.z = 0.012;
    g.add(rMesh);
    const leftP = new THREE.Mesh(pillarGeo, whiteMat);
    leftP.position.set(-0.092, 0, 0.014);
    g.add(leftP);
    const rightP = new THREE.Mesh(pillarGeo, whiteMat);
    rightP.position.set(0.092, 0.025, 0.014);
    rightP.scale.set(1, 0.78, 1);
    g.add(rightP);
    const sl = new THREE.Mesh(slashGeo, whiteMat);
    sl.position.set(0.01, -0.015, 0.018);
    g.add(sl);
    return g;
  };

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, createMark);
  return root;
}

export function buildNodejsBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.32,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.32,
        bgStops: ['#056e3b', '#045d32', '#034a27', '#056335'],
        lightBlobRgb: '34, 197, 94',
        darkBlobRgb: '2, 26, 12',
        edgeGlowRgba: 'rgba(38, 255, 92, 0.88)',
        edgeStrokeRgba: 'rgba(38, 255, 92, 0.56)',
        innerStrokeRgba: 'rgba(110, 245, 54, 0.78)',
        seed: 303,
      },
      rimColor: 0x26ff5c,
      rimEmissive: 0x16db42,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Node.js',
        fontSizeFactor: 0.45,
        textXFraction: 0.37,
        textColor: '#F3FFF5',
        glowColor: 'rgba(110, 255, 130, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  // Hexagon with cutout
  const hexShape = new THREE.Shape();
  const rOut = 0.285;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * rOut;
    const y = Math.sin(a) * rOut;
    if (i === 0) hexShape.moveTo(x, y);
    else hexShape.lineTo(x, y);
  }
  hexShape.closePath();

  const innerHole = new THREE.Path();
  const rIn = 0.21;
  for (let i = 5; i >= 0; i--) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * rIn;
    const y = Math.sin(a) * rIn;
    if (i === 5) innerHole.moveTo(x, y);
    else innerHole.lineTo(x, y);
  }
  innerHole.closePath();
  hexShape.holes.push(innerHole);

  const hexGeo = tracker.track(
    new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    })
  );

  const innerHexShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * 0.145;
    const y = Math.sin(a) * 0.145;
    if (i === 0) innerHexShape.moveTo(x, y);
    else innerHexShape.lineTo(x, y);
  }
  innerHexShape.closePath();
  const innerHexGeo = tracker.track(
    new THREE.ExtrudeGeometry(innerHexShape, { depth: 0.018, bevelEnabled: false })
  );

  const nodeMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x6ef536,
      emissive: 0x39d318,
      emissiveIntensity: 0.72,
      roughness: 0.16,
      metalness: 0.06,
      clearcoat: 1.0,
    })
  );

  const createHex = () => {
    const g = new THREE.Group();
    g.position.set(-0.77, 0, BADGE_TOTAL_HALF_Z + 0.004);
    g.add(new THREE.Mesh(hexGeo, nodeMat));
    g.add(new THREE.Mesh(innerHexGeo, nodeMat));
    return g;
  };

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, createHex);
  return root;
}

export function buildTypescriptBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 2.85,
      badgeH: 1.08,
      cornerR: 0.38,
      smoky: {
        badgeW: 2.85,
        badgeH: 1.08,
        cornerR: 0.38,
        bgStops: ['#0b5ca0', '#094b84', '#063765', '#0a5190'],
        lightBlobRgb: '56, 168, 255',
        darkBlobRgb: '4, 24, 52',
        edgeGlowRgba: 'rgba(38, 168, 255, 0.9)',
        edgeStrokeRgba: 'rgba(38, 168, 255, 0.56)',
        innerStrokeRgba: 'rgba(96, 196, 255, 0.78)',
        seed: 404,
      },
      rimColor: 0x26a8ff,
      rimEmissive: 0x1680db,
      typography: {
        badgeW: 2.85,
        badgeH: 1.08,
        text: 'TypeScript',
        fontSizeFactor: 0.39,
        textXFraction: 0.36,
        textColor: '#F5FAFF',
        glowColor: 'rgba(130, 210, 255, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  // Raised TS square tile
  const tsCanvas = document.createElement('canvas');
  tsCanvas.width = 256;
  tsCanvas.height = 256;
  const ctx = tsCanvas.getContext('2d')!;
  ctx.fillStyle = '#3178c6';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 128px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('TS', 234, 238);

  const tsTex = tracker.track(new THREE.CanvasTexture(tsCanvas));
  tsTex.colorSpace = THREE.SRGBColorSpace;
  tsTex.anisotropy = maxAniso;

  const squareShape = createRoundedRectShape(0.58, 0.58, 0.08);
  const squareGeo = tracker.track(
    new THREE.ExtrudeGeometry(squareShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    })
  );
  const pos = squareGeo.attributes.position;
  const uv = squareGeo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / 0.58 + 0.5, pos.getY(i) / 0.58 + 0.5);
  }
  uv.needsUpdate = true;

  const tsMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      map: tsTex,
      emissive: 0x1c5ea8,
      emissiveIntensity: 0.35,
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const m = new THREE.Mesh(squareGeo, tsMat);
    m.position.set(-0.76, 0, BADGE_TOTAL_HALF_Z + 0.004);
    return m;
  });
  return root;
}

export function buildTailwindBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.06,
      badgeH: 1.0,
      cornerR: 0.35,
      smoky: {
        badgeW: 3.06,
        badgeH: 1.0,
        cornerR: 0.35,
        bgStops: ['#0d4048', '#0a333b', '#07272e', '#0c3b43'],
        lightBlobRgb: '56, 224, 240',
        darkBlobRgb: '3, 18, 24',
        edgeGlowRgba: 'rgba(56, 248, 255, 0.88)',
        edgeStrokeRgba: 'rgba(56, 248, 255, 0.54)',
        innerStrokeRgba: 'rgba(92, 250, 255, 0.78)',
        seed: 505,
      },
      rimColor: 0x38f8ff,
      rimEmissive: 0x1ad2e6,
      typography: {
        badgeW: 3.06,
        badgeH: 1.0,
        text: 'Tailwind CSS',
        fontSizeFactor: 0.36,
        textXFraction: 0.33,
        textColor: '#F3FDFF',
        glowColor: 'rgba(56, 248, 255, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 33"><path d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"/></svg>`;
  const parsed = svgLoader.parse(svgMarkup);
  const shapes: THREE.Shape[] = [];
  parsed.paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));

  const waveGeo = tracker.track(
    new THREE.ExtrudeGeometry(shapes, {
      depth: 2.2,
      bevelEnabled: true,
      bevelThickness: 0.45,
      bevelSize: 0.35,
      bevelSegments: 3,
      curveSegments: 16,
    })
  );
  waveGeo.translate(-27, -16.2, -1.1);
  const sc = 0.56 / 54;
  waveGeo.scale(sc, -sc, sc);

  const waveMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x38e8ff,
      emissive: 0x16b8e0,
      emissiveIntensity: 0.68,
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const m = new THREE.Mesh(waveGeo, waveMat);
    m.position.set(-0.92, 0, BADGE_TOTAL_HALF_Z + 0.012);
    return m;
  });
  return root;
}

export function buildSupabaseBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.33,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.33,
        bgStops: ['#047551', '#036445', '#015238', '#046a49'],
        lightBlobRgb: '46, 255, 178',
        darkBlobRgb: '1, 26, 16',
        edgeGlowRgba: 'rgba(46, 255, 178, 0.88)',
        edgeStrokeRgba: 'rgba(46, 255, 178, 0.56)',
        innerStrokeRgba: 'rgba(92, 255, 200, 0.78)',
        seed: 606,
      },
      rimColor: 0x2effb2,
      rimEmissive: 0x12d68d,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Supabase',
        fontSizeFactor: 0.43,
        textXFraction: 0.36,
        textColor: '#F2FFF9',
        glowColor: 'rgba(46, 255, 178, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  const upperBolt = new THREE.Shape();
  upperBolt.moveTo(-0.02, 0.28);
  upperBolt.lineTo(-0.22, -0.02);
  upperBolt.lineTo(-0.02, -0.02);
  upperBolt.lineTo(-0.02, 0.28);

  const lowerBolt = new THREE.Shape();
  lowerBolt.moveTo(0.02, -0.28);
  lowerBolt.lineTo(0.22, 0.02);
  lowerBolt.lineTo(0.02, 0.02);
  lowerBolt.lineTo(0.02, -0.28);

  const upperGeo = tracker.track(
    new THREE.ExtrudeGeometry(upperBolt, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    })
  );
  const lowerGeo = tracker.track(
    new THREE.ExtrudeGeometry(lowerBolt, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    })
  );

  const topMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x3effb5,
      emissive: 0x1ee695,
      emissiveIntensity: 0.75,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );
  const botMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x0ed984,
      emissive: 0x079a5b,
      emissiveIntensity: 0.55,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.82, 0, BADGE_TOTAL_HALF_Z + 0.006);
    g.add(new THREE.Mesh(upperGeo, topMat));
    g.add(new THREE.Mesh(lowerGeo, botMat));
    return g;
  });
  return root;
}

export function buildPythonBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.36,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.36,
        bgStops: ['#122645', '#1d324f', '#423618', '#5e4914'],
        lightBlobRgb: '255, 202, 58',
        darkBlobRgb: '10, 22, 42',
        edgeGlowRgba: 'rgba(255, 202, 58, 0.88)',
        edgeStrokeRgba: 'rgba(255, 202, 58, 0.56)',
        innerStrokeRgba: 'rgba(255, 218, 96, 0.78)',
        seed: 707,
      },
      rimColor: 0xffca3a,
      rimEmissive: 0xd99e18,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Python',
        fontSizeFactor: 0.45,
        textXFraction: 0.4,
        textColor: '#FFFDF5',
        glowColor: 'rgba(255, 210, 80, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  // Dual mirrored Python snake shapes
  const makeSnakeShape = () => {
    const s = new THREE.Shape();
    s.moveTo(-0.08, 0.26);
    s.lineTo(0.11, 0.26);
    s.absarc(0.11, 0.16, 0.1, Math.PI / 2, 0, true);
    s.lineTo(0.21, 0.03);
    s.lineTo(-0.04, 0.03);
    s.lineTo(-0.04, 0.06);
    s.lineTo(0.1, 0.06);
    s.lineTo(0.1, 0.13);
    s.lineTo(-0.18, 0.13);
    s.absarc(-0.18, 0.02, 0.11, Math.PI / 2, Math.PI, false);
    s.lineTo(-0.29, -0.05);
    s.lineTo(-0.14, -0.05);
    s.lineTo(-0.14, 0.17);
    s.absarc(-0.08, 0.2, 0.06, Math.PI, Math.PI / 2, true);
    s.closePath();
    return s;
  };

  const snakeGeo = tracker.track(
    new THREE.ExtrudeGeometry(makeSnakeShape(), {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    })
  );
  const blueMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x3b7eb8,
      emissive: 0x1a4f82,
      emissiveIntensity: 0.45,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );
  const goldMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffd13b,
      emissive: 0xd99e18,
      emissiveIntensity: 0.55,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.74, 0, BADGE_TOTAL_HALF_Z + 0.006);
    const topSnake = new THREE.Mesh(snakeGeo, blueMat);
    topSnake.position.set(-0.02, 0.02, 0.002);
    g.add(topSnake);
    const botSnake = new THREE.Mesh(snakeGeo, goldMat);
    botSnake.rotation.z = Math.PI;
    botSnake.position.set(0.02, -0.02, 0.002);
    g.add(botSnake);
    return g;
  });
  return root;
}

export function buildPostgresBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.24,
      badgeH: 1.0,
      cornerR: 0.32,
      smoky: {
        badgeW: 3.24,
        badgeH: 1.0,
        cornerR: 0.32,
        bgStops: ['#143973', '#102e5e', '#0a1f45', '#113266'],
        lightBlobRgb: '59, 130, 246',
        darkBlobRgb: '4, 14, 38',
        edgeGlowRgba: 'rgba(59, 130, 246, 0.9)',
        edgeStrokeRgba: 'rgba(59, 130, 246, 0.58)',
        innerStrokeRgba: 'rgba(110, 168, 255, 0.78)',
        seed: 808,
      },
      rimColor: 0x3b82f6,
      rimEmissive: 0x1d4ed8,
      typography: {
        badgeW: 3.24,
        badgeH: 1.0,
        text: 'PostgreSQL',
        fontSizeFactor: 0.39,
        textXFraction: 0.33,
        textColor: '#F3F8FF',
        glowColor: 'rgba(96, 165, 250, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  // Sculpted 3D Slonik elephant head silhouette + trunk + tusks
  const headShape = new THREE.Shape();
  headShape.moveTo(0, 0.24);
  headShape.bezierCurveTo(0.24, 0.27, 0.32, 0.06, 0.26, -0.14);
  headShape.bezierCurveTo(0.2, -0.26, 0.09, -0.12, 0.06, -0.18);
  headShape.bezierCurveTo(0.06, -0.34, 0.01, -0.36, -0.02, -0.28);
  headShape.bezierCurveTo(-0.04, -0.18, -0.09, -0.18, -0.22, -0.14);
  headShape.bezierCurveTo(-0.32, -0.04, -0.24, 0.27, 0, 0.24);

  const headGeo = tracker.track(
    new THREE.ExtrudeGeometry(headShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 3,
      curveSegments: 20,
    })
  );
  const blueMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x336791,
      emissive: 0x1b4266,
      emissiveIntensity: 0.5,
      roughness: 0.16,
      clearcoat: 1.0,
    })
  );
  const tuskMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xcbe2ff,
      emissiveIntensity: 0.35,
      roughness: 0.12,
    })
  );
  const tuskGeo = tracker.track(new THREE.ConeGeometry(0.024, 0.13, 12));

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.98, 0.02, BADGE_TOTAL_HALF_Z + 0.006);
    g.add(new THREE.Mesh(headGeo, blueMat));
    const tL = new THREE.Mesh(tuskGeo, tuskMat);
    tL.position.set(-0.06, -0.16, 0.024);
    tL.rotation.z = 2.6;
    g.add(tL);
    const tR = new THREE.Mesh(tuskGeo, tuskMat);
    tR.position.set(0.08, -0.16, 0.024);
    tR.rotation.z = -2.6;
    g.add(tR);
    return g;
  });
  return root;
}

export function buildMysqlBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.33,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.33,
        bgStops: ['#0d2b57', '#092246', '#061835', '#0b264e'],
        lightBlobRgb: '59, 158, 255',
        darkBlobRgb: '3, 12, 28',
        edgeGlowRgba: 'rgba(59, 158, 255, 0.9)',
        edgeStrokeRgba: 'rgba(59, 158, 255, 0.56)',
        innerStrokeRgba: 'rgba(116, 188, 255, 0.78)',
        seed: 909,
      },
      rimColor: 0x3b9eff,
      rimEmissive: 0x1874d9,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'MySQL',
        fontSizeFactor: 0.44,
        textXFraction: 0.4,
        textColor: '#F3F9FF',
        glowColor: 'rgba(96, 178, 255, 0.45)',
      },
    },
    maxAniso,
    tracker
  );

  // Leaping Sakila dolphin arc
  const dolphinShape = new THREE.Shape();
  dolphinShape.moveTo(-0.28, -0.12);
  dolphinShape.bezierCurveTo(-0.24, 0.14, 0.04, 0.3, 0.24, 0.12);
  dolphinShape.bezierCurveTo(0.28, 0.08, 0.3, 0.01, 0.22, -0.02);
  dolphinShape.bezierCurveTo(0.14, 0.06, -0.02, 0.09, -0.14, -0.04);
  dolphinShape.lineTo(-0.22, -0.18);
  dolphinShape.closePath();

  const dolphinGeo = tracker.track(
    new THREE.ExtrudeGeometry(dolphinShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
      curveSegments: 20,
    })
  );
  const dolphinMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x6ec3ff,
      emissive: 0x2684e6,
      emissiveIntensity: 0.65,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const m = new THREE.Mesh(dolphinGeo, dolphinMat);
    m.position.set(-0.74, 0.02, BADGE_TOTAL_HALF_Z + 0.008);
    return m;
  });
  return root;
}

export function buildDockerBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.33,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.33,
        bgStops: ['#0d2b57', '#092246', '#061835', '#0b264e'],
        lightBlobRgb: '38, 158, 242',
        darkBlobRgb: '3, 12, 28',
        edgeGlowRgba: 'rgba(59, 158, 255, 0.92)',
        edgeStrokeRgba: 'rgba(59, 158, 255, 0.6)',
        innerStrokeRgba: 'rgba(116, 198, 255, 0.82)',
        seed: 1010,
      },
      rimColor: 0x3b9eff,
      rimEmissive: 0x1b7ae6,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Docker',
        fontSizeFactor: 0.44,
        textXFraction: 0.42,
        textColor: '#F3FAFF',
        glowColor: 'rgba(59, 158, 255, 0.5)',
      },
    },
    maxAniso,
    tracker
  );

  const whaleShape = new THREE.Shape();
  whaleShape.moveTo(-0.28, -0.02);
  whaleShape.lineTo(0.24, -0.02);
  whaleShape.bezierCurveTo(0.26, -0.18, 0.14, -0.25, -0.04, -0.25);
  whaleShape.bezierCurveTo(-0.22, -0.25, -0.32, -0.14, -0.28, -0.02);
  const whaleGeo = tracker.track(
    new THREE.ExtrudeGeometry(whaleShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    })
  );
  const boxGeo = tracker.track(new THREE.BoxGeometry(0.088, 0.068, 0.026));
  const whaleMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x269ef2,
      emissive: 0x0f62b5,
      emissiveIntensity: 0.65,
      roughness: 0.15,
      clearcoat: 1.0,
    })
  );
  const boxMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x56c2ff,
      emissive: 0x2084d6,
      emissiveIntensity: 0.5,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.74, 0.02, BADGE_TOTAL_HALF_Z + 0.006);
    g.add(new THREE.Mesh(whaleGeo, whaleMat));
    const grid = [
      [-0.18, 0.04],
      [-0.08, 0.04],
      [0.02, 0.04],
      [0.12, 0.04],
      [-0.08, 0.12],
      [0.02, 0.12],
      [0.12, 0.12],
      [0.02, 0.2],
    ];
    grid.forEach(([bx, by]) => {
      const c = new THREE.Mesh(boxGeo, boxMat);
      c.position.set(bx, by, 0.01);
      g.add(c);
    });
    return g;
  });
  return root;
}

export function buildThreejsBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.34,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.34,
        bgStops: ['#043259', '#032849', '#021e38', '#042c4f'],
        lightBlobRgb: '36, 185, 255',
        darkBlobRgb: '1, 12, 24',
        edgeGlowRgba: 'rgba(36, 185, 255, 0.9)',
        edgeStrokeRgba: 'rgba(36, 185, 255, 0.56)',
        innerStrokeRgba: 'rgba(98, 210, 255, 0.78)',
        seed: 1111,
      },
      rimColor: 0x24b9ff,
      rimEmissive: 0x0e8cd9,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'Three.js',
        fontSizeFactor: 0.44,
        textXFraction: 0.38,
        textColor: '#F3FAFF',
        glowColor: 'rgba(36, 185, 255, 0.5)',
      },
    },
    maxAniso,
    tracker
  );

  // Subdivided 4x4 triangle wireframe struts + nodes
  const metalMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6f4ff,
      emissive: 0x70c4ff,
      emissiveIntensity: 0.45,
      roughness: 0.14,
      metalness: 0.5,
      clearcoat: 1.0,
    })
  );

  const vertices: Array<[number, number]> = [];
  const R = 0.28;
  const rows = 4;
  for (let r = 0; r <= rows; r++) {
    const tY = r / rows;
    const y = (0.5 - tY) * R * 1.75;
    const halfSpan = tY * R;
    for (let c = 0; c <= r; c++) {
      const x = r === 0 ? 0 : -halfSpan + (c / r) * halfSpan * 2;
      vertices.push([x, y]);
    }
  }
  const nodeGeo = tracker.track(new THREE.SphereGeometry(0.018, 8, 8));
  const strutGeo = tracker.track(new THREE.CylinderGeometry(0.008, 0.008, 1, 6));

  const idxOf = (r: number, c: number) => (r * (r + 1)) / 2 + c;
  const edges: Array<[number, number]> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= r; c++) {
      edges.push([idxOf(r, c), idxOf(r + 1, c)]);
      edges.push([idxOf(r, c), idxOf(r + 1, c + 1)]);
      edges.push([idxOf(r + 1, c), idxOf(r + 1, c + 1)]);
    }
  }

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.76, -0.02, BADGE_TOTAL_HALF_Z + 0.022);
    g.rotation.z = -0.35;
    vertices.forEach(([x, y]) => {
      const s = new THREE.Mesh(nodeGeo, metalMat);
      s.position.set(x, y, 0);
      g.add(s);
    });
    edges.forEach(([aIdx, bIdx]) => {
      const [ax, ay] = vertices[aIdx];
      const [bx, by] = vertices[bIdx];
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy);
      const strut = new THREE.Mesh(strutGeo, metalMat);
      strut.scale.set(1, len, 1);
      strut.position.set((ax + bx) / 2, (ay + by) / 2, 0);
      strut.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
      g.add(strut);
    });
    return g;
  });
  return root;
}

export function buildR3fBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 2.8,
      badgeH: 1.04,
      cornerR: 0.38,
      smoky: {
        badgeW: 2.8,
        badgeH: 1.04,
        cornerR: 0.38,
        bgStops: ['#0c3e4f', '#09313f', '#062430', '#0a3645'],
        lightBlobRgb: '91, 224, 255',
        darkBlobRgb: '3, 18, 24',
        edgeGlowRgba: 'rgba(91, 224, 255, 0.88)',
        edgeStrokeRgba: 'rgba(91, 224, 255, 0.56)',
        innerStrokeRgba: 'rgba(130, 238, 255, 0.78)',
        seed: 1212,
      },
      rimColor: 0x5be0ff,
      rimEmissive: 0x22b5db,
      typography: {
        badgeW: 2.8,
        badgeH: 1.04,
        text: 'R3F',
        fontSizeFactor: 0.49,
        textXFraction: 0.44,
        textColor: '#F3FDFF',
        glowColor: 'rgba(91, 224, 255, 0.5)',
      },
    },
    maxAniso,
    tracker
  );

  const cyanMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xb8f4ff,
      emissive: 0x45d6ff,
      emissiveIntensity: 0.75,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  const orbitPts: THREE.Vector3[] = [];
  for (let i = 0; i < 42; i++) {
    const a = (i / 42) * Math.PI * 2;
    orbitPts.push(new THREE.Vector3(Math.cos(a) * 0.27, Math.sin(a) * 0.105, 0));
  }
  const orbitGeo = tracker.track(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(orbitPts, true), 56, 0.015, 8, true)
  );
  const cubeGeo = tracker.track(new THREE.BoxGeometry(0.11, 0.11, 0.11));

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.62, 0, BADGE_TOTAL_HALF_Z + 0.02);
    [0, Math.PI / 3, -Math.PI / 3].forEach((rot) => {
      const m = new THREE.Mesh(orbitGeo, cyanMat);
      m.rotation.z = rot;
      g.add(m);
    });
    const cube = new THREE.Mesh(cubeGeo, cyanMat);
    cube.rotation.set(0.45, 0.65, 0.25);
    g.add(cube);
    return g;
  });
  return root;
}

export function buildWebglBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 3.0,
      badgeH: 1.0,
      cornerR: 0.34,
      smoky: {
        badgeW: 3.0,
        badgeH: 1.0,
        cornerR: 0.34,
        bgStops: ['#2a0804', '#210502', '#160301', '#260703'],
        lightBlobRgb: '255, 90, 38',
        darkBlobRgb: '14, 2, 1',
        edgeGlowRgba: 'rgba(255, 90, 38, 0.9)',
        edgeStrokeRgba: 'rgba(255, 90, 38, 0.56)',
        innerStrokeRgba: 'rgba(255, 130, 82, 0.78)',
        seed: 1313,
      },
      rimColor: 0xff5a26,
      rimEmissive: 0xd93812,
      typography: {
        badgeW: 3.0,
        badgeH: 1.0,
        text: 'WebGL',
        fontSizeFactor: 0.45,
        textXFraction: 0.38,
        textColor: '#FFF7F5',
        glowColor: 'rgba(255, 110, 68, 0.5)',
      },
    },
    maxAniso,
    tracker
  );

  // Extruded Crimson Crescent Shield
  const crescentShape = new THREE.Shape();
  crescentShape.absarc(0, 0, 0.27, 0.6, Math.PI * 2 - 0.6, false);
  crescentShape.absarc(0.09, 0, 0.21, Math.PI * 2 - 0.8, 0.8, true);
  crescentShape.closePath();

  const crescentGeo = tracker.track(
    new THREE.ExtrudeGeometry(crescentShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    })
  );
  const crimsonMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xe62929,
      emissive: 0xa60c0c,
      emissiveIntensity: 0.65,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const m = new THREE.Mesh(crescentGeo, crimsonMat);
    m.position.set(-0.74, 0, BADGE_TOTAL_HALF_Z + 0.008);
    return m;
  });
  return root;
}

export function buildShaderBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const { root, frontFaceAnchor, backFaceAnchor } = createStandardPillShell(
    {
      badgeW: 2.9,
      badgeH: 1.0,
      cornerR: 0.35,
      smoky: {
        badgeW: 2.9,
        badgeH: 1.0,
        cornerR: 0.35,
        bgStops: ['#46160b', '#361007', '#260904', '#3e1309'],
        lightBlobRgb: '255, 90, 46',
        darkBlobRgb: '20, 4, 2',
        edgeGlowRgba: 'rgba(255, 90, 46, 0.92)',
        edgeStrokeRgba: 'rgba(255, 90, 46, 0.58)',
        innerStrokeRgba: 'rgba(255, 132, 82, 0.8)',
        seed: 1414,
      },
      rimColor: 0xff5a2e,
      rimEmissive: 0xe63612,
      typography: {
        badgeW: 2.9,
        badgeH: 1.0,
        text: 'Shader',
        fontSizeFactor: 0.45,
        textXFraction: 0.4,
        textColor: '#FFF7F5',
        glowColor: 'rgba(255, 110, 68, 0.5)',
      },
    },
    maxAniso,
    tracker
  );

  // Custom GLSL iridescent glass outer cube + glowing ember inner core
  const outerGeo = tracker.track(new THREE.BoxGeometry(0.4, 0.4, 0.4));
  const innerGeo = tracker.track(new THREE.BoxGeometry(0.21, 0.21, 0.21));
  const shaderGlassMat = tracker.track(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          float fresnel = pow(1.0 - abs(vNormal.z), 2.0);
          vec3 spectral = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + vPos.x * 4.5 + vPos.y * 3.5);
          vec3 col = mix(vec3(1.0, 0.42, 0.22), spectral, 0.65);
          gl_FragColor = vec4(col * (0.7 + fresnel * 0.7), 0.48 + fresnel * 0.4);
        }
      `,
      transparent: true,
      depthWrite: false,
    })
  );
  const coreMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xff4d1f,
      emissive: 0xff3b12,
      emissiveIntensity: 1.25,
      roughness: 0.14,
      clearcoat: 1.0,
    })
  );

  addDualFaceEmblem(frontFaceAnchor, backFaceAnchor, () => {
    const g = new THREE.Group();
    g.position.set(-0.72, 0, BADGE_TOTAL_HALF_Z + 0.12);
    g.rotation.set(0.55, 0.78, 0.1);
    g.add(new THREE.Mesh(innerGeo, coreMat));
    g.add(new THREE.Mesh(outerGeo, shaderGlassMat));
    return g;
  });
  return root;
}

export function buildVercelBadge(maxAniso: number, tracker: ResourceTracker): THREE.Group {
  const badgeW = 2.68;
  const badgeH = 1.04;
  const cornerR = 0.36;
  const root = new THREE.Group();
  const geos = createPillBaseGeometries(badgeW, badgeH, cornerR, tracker);

  // Dark brushed slate body with crisp white edge glow + well-padded "Vercel" text
  const bodyTex = createTypographyTextures(
    {
      badgeW,
      badgeH,
      text: 'Vercel',
      fontWeight: 700,
      fontSizeFactor: 0.43,
      textXFraction: 0.37,
      maxWidthFraction: 0.52,
      textColor: '#FFFFFF',
      glowColor: 'rgba(255, 255, 255, 0.45)',
    },
    maxAniso,
    tracker
  );

  const bgBodyMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0x15181e,
      roughness: 0.18,
      metalness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    })
  );
  root.add(new THREE.Mesh(geos.bodyGeo, bgBodyMat));

  const whiteRimMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.42,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
    })
  );
  root.add(new THREE.Mesh(geos.rimFrontGeo, whiteRimMat));
  root.add(new THREE.Mesh(geos.rimBackGeo, whiteRimMat));
  root.add(new THREE.Mesh(geos.rimMidGeo, whiteRimMat));

  const typoMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      map: bodyTex.mapTex,
      bumpMap: bodyTex.bumpTex,
      bumpScale: 0.007,
      emissive: 0xffffff,
      emissiveMap: bodyTex.mapTex,
      emissiveIntensity: 0.45,
      transparent: true,
      alphaTest: 0.01,
      roughness: 0.14,
      clearcoat: 1.0,
      depthWrite: false,
    })
  );

  // Crisp equilateral white Vercel triangle
  const triShape = new THREE.Shape();
  triShape.moveTo(0, 0.24);
  triShape.lineTo(-0.26, -0.2);
  triShape.lineTo(0.26, -0.2);
  triShape.closePath();

  const triGeo = tracker.track(
    new THREE.ExtrudeGeometry(triShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 3,
    })
  );
  const triMat = tracker.track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xe2e8f0,
      emissiveIntensity: 0.52,
      roughness: 0.12,
      clearcoat: 1.0,
    })
  );

  const addFace = (rotY: number) => {
    const face = new THREE.Group();
    face.rotation.y = rotY;
    const typo = new THREE.Mesh(geos.facePlateGeo, typoMat);
    typo.position.z = BADGE_TOTAL_HALF_Z + 0.0025;
    face.add(typo);

    const tri = new THREE.Mesh(triGeo, triMat);
    tri.position.set(-0.68, 0.01, BADGE_TOTAL_HALF_Z + 0.008);
    face.add(tri);
    root.add(face);
  };

  addFace(0);
  addFace(Math.PI);

  return root;
}
