import * as THREE from 'three';
import {
  applyNormalizedUVs,
  createBasePillAssembly,
  createRoundedRectShape,
  createSmokyFaceTexture,
  createTypographyTextures,
  filletPolyline2D,
  offsetRibbonToShape,
  svgMarkupToExtrudedGroup,
} from '../badgePrimitives';
import type { BuiltSkillBadge } from '../types';

export function buildReactBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.32;
  const baseTex = createSmokyFaceTexture(W, H, '#046582', '#02465d', 'rgba(0, 224, 255, 0.42)', 0.22);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x1eeeff,
    emissive: 0x00dcff,
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'React',
    textXRatio: 0.388,
    textYRatio: 0.515,
    fontSizeRatio: 0.48,
    fontWeight: 600,
    fillStyle: '#f4fdff',
    glowColor: 'rgba(0, 224, 255, 0.55)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const createReactAtom = (): THREE.Group => {
    const atom = new THREE.Group();
    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0x6ef6ff,
      emissive: 0x00d9ff,
      emissiveIntensity: 1.05,
      roughness: 0.18,
      metalness: 0.32,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x9cfaff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1.2,
      roughness: 0.16,
      metalness: 0.25,
    });
    const innerHoleMat = new THREE.MeshStandardMaterial({
      color: 0x002d3c,
      roughness: 0.4,
      metalness: 0.2,
    });

    const angles = [0, Math.PI / 3, -Math.PI / 3];
    for (const ang of angles) {
      const pts: THREE.Vector3[] = [];
      const segs = 40;
      for (let i = 0; i < segs; i++) {
        const t = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(t) * 0.325, Math.sin(t) * 0.128, 0));
      }
      const curve = new THREE.CatmullRomCurve3(pts, true);
      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.0175, 10, true);
      const orbitMesh = new THREE.Mesh(tubeGeo, orbitMat);
      orbitMesh.scale.z = 0.72;
      orbitMesh.rotation.z = ang;
      atom.add(orbitMesh);
    }

    const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.0165, 12, 24), coreMat);
    coreRing.scale.z = 0.78;
    atom.add(coreRing);

    const holeDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.016, 20), innerHoleMat);
    holeDisk.rotation.x = Math.PI / 2;
    atom.add(holeDisk);

    atom.position.set(-0.88, -0.004, 0.018);
    return atom;
  };

  frontMount.add(createReactAtom());
  backMount.add(createReactAtom());

  return { group: root, width: W, height: H, depth: 0.25 };
}

export function buildNextjsBadge(overrideRimHex?: string): BuiltSkillBadge {
  const W = 2.68;
  const H = 1.05;
  const R = 0.35;
  const isCyanVariant = Boolean(overrideRimHex);
  const baseTex = createSmokyFaceTexture(
    W,
    H,
    isCyanVariant ? '#083a4d' : '#18242c',
    isCyanVariant ? '#051524' : '#0e1318',
    isCyanVariant ? 'rgba(34, 211, 238, 0.34)' : 'rgba(148, 163, 184, 0.22)',
    isCyanVariant ? 0.32 : 0.5
  );
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.38,
    envMapIntensity: 0.95,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: overrideRimHex ? new THREE.Color(overrideRimHex) : new THREE.Color(0x3a4552),
    emissive: overrideRimHex ? new THREE.Color(overrideRimHex) : new THREE.Color(0x16202b),
    emissiveIntensity: overrideRimHex ? 1.05 : 0.85,
    roughness: 0.26,
    metalness: 0.5,
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat
  );

  const createNextLogo = (): THREE.Group => {
    const grp = new THREE.Group();
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      roughness: 0.25,
      metalness: 0.2,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf7fbff,
      emissive: 0xdbeafe,
      emissiveIntensity: 0.4,
      roughness: 0.16,
      metalness: 0.15,
    });

    // Left N-circle emblem
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.022, 32), darkMat);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(-0.78, 0, 0.011);
    grp.add(disc);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 10, 32), whiteMat);
    ring.position.set(-0.78, 0, 0.022);
    grp.add(ring);

    const nLeft = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.27, 0.018), whiteMat);
    nLeft.position.set(-0.875, 0, 0.025);
    const nRight = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.25, 0.018), whiteMat);
    nRight.position.set(-0.685, 0.01, 0.025);
    const nDiag = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.37, 0.018), whiteMat);
    nDiag.position.set(-0.765, -0.02, 0.027);
    nDiag.rotation.z = 0.64;
    grp.add(nLeft, nRight, nDiag);

    // Extruded Next.js text plate on right
    const typo = createTypographyTextures({
      width: W,
      height: H,
      text: 'Next.js',
      textXRatio: 0.37,
      textYRatio: 0.51,
      fontSizeRatio: 0.45,
      fontWeight: 600,
      fillStyle: '#f8fafc',
      glowColor: 'rgba(226, 232, 240, 0.38)',
    });
    const shape = createRoundedRectShape(W * 0.96, H * 0.94, R * 0.92);
    const geo = new THREE.ShapeGeometry(shape, 20);
    applyNormalizedUVs(geo, W, H);
    const mat = new THREE.MeshStandardMaterial({
      map: typo.map,
      bumpMap: typo.bumpMap,
      bumpScale: 0.009,
      transparent: true,
      roughness: 0.18,
      depthWrite: false,
    });
    grp.add(new THREE.Mesh(geo, mat));
    return grp;
  };

  frontMount.add(createNextLogo());
  backMount.add(createNextLogo());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildNodejsBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.32;
  const baseTex = createSmokyFaceTexture(W, H, '#056e3b', '#034a27', 'rgba(38, 255, 92, 0.36)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.22,
    envMapIntensity: 0.85,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x26ff5c,
    emissive: 0x00ee3c,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.32,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Node.js',
    textXRatio: 0.392,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#f4fff7',
    glowColor: 'rgba(74, 222, 128, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const createNodeHex = (): THREE.Group => {
    const grp = new THREE.Group();
    const hexMat = new THREE.MeshStandardMaterial({
      color: 0x6ef536,
      emissive: 0x45d618,
      emissiveIntensity: 0.85,
      roughness: 0.22,
      metalness: 0.28,
    });
    const r = 0.31;
    const hexPts: THREE.Vector2[] = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 3;
      hexPts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    }
    const filleted = filletPolyline2D(hexPts, 0.04, 4);
    const hexShape = new THREE.Shape();
    hexShape.moveTo(filleted[0].x, filleted[0].y);
    for (let i = 1; i < filleted.length; i++) hexShape.lineTo(filleted[i].x, filleted[i].y);
    hexShape.closePath();

    const innerPts = filleted.map((p) => p.clone().multiplyScalar(0.76));
    const hole = new THREE.Path();
    hole.moveTo(innerPts[0].x, innerPts[0].y);
    for (let i = 1; i < innerPts.length; i++) hole.lineTo(innerPts[i].x, innerPts[i].y);
    hole.closePath();
    hexShape.holes.push(hole);

    const hexGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    grp.add(new THREE.Mesh(hexGeo, hexMat));

    // Inner stylized JS ribbon inside hexagon
    const sPts = [
      new THREE.Vector2(-0.08, 0.1),
      new THREE.Vector2(0.06, 0.12),
      new THREE.Vector2(-0.06, 0.0),
      new THREE.Vector2(0.09, -0.02),
      new THREE.Vector2(0.07, -0.14),
      new THREE.Vector2(-0.08, -0.13),
    ];
    const ribbonShape = offsetRibbonToShape(sPts, 0.028, 'round', 'round');
    const ribbonGeo = new THREE.ExtrudeGeometry(ribbonShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelSegments: 2,
    });
    grp.add(new THREE.Mesh(ribbonGeo, hexMat));

    grp.position.set(-0.87, -0.004, 0.006);
    return grp;
  };

  frontMount.add(createNodeHex());
  backMount.add(createNodeHex());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildTypescriptBadge(): BuiltSkillBadge {
  const W = 2.85;
  const H = 1.12;
  const R = 0.42;
  const baseTex = createSmokyFaceTexture(W, H, '#0b5ca0', '#063765', 'rgba(38, 168, 255, 0.42)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.3,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x26a8ff,
    emissive: 0x0088ff,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'TypeScript',
    textXRatio: 0.335,
    textYRatio: 0.51,
    fontSizeRatio: 0.4,
    fontWeight: 500,
    maxWidthRatio: 0.59,
    fillStyle: '#f8fcff',
    glowColor: 'rgba(56, 189, 248, 0.42)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  // Raised TS Square texture
  const sqCanvas = document.createElement('canvas');
  sqCanvas.width = 256;
  sqCanvas.height = 256;
  const sctx = sqCanvas.getContext('2d')!;
  const sg = sctx.createLinearGradient(0, 0, 256, 256);
  sg.addColorStop(0, '#0ea5e9');
  sg.addColorStop(1, '#0260b0');
  sctx.fillStyle = sg;
  sctx.fillRect(0, 0, 256, 256);
  sctx.fillStyle = '#ffffff';
  sctx.font = 'bold 132px "Plus Jakarta Sans", Inter, sans-serif';
  sctx.textAlign = 'right';
  sctx.textBaseline = 'alphabetic';
  sctx.fillText('TS', 236, 232);
  const sqTex = new THREE.CanvasTexture(sqCanvas);
  sqTex.colorSpace = THREE.SRGBColorSpace;

  const createTsSquare = (): THREE.Group => {
    const grp = new THREE.Group();
    const blockShape = createRoundedRectShape(0.6, 0.6, 0.068);
    const blockGeo = new THREE.ExtrudeGeometry(blockShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 2,
    });
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x0574ce,
      roughness: 0.25,
      metalness: 0.2,
    });
    grp.add(new THREE.Mesh(blockGeo, blockMat));

    const faceGeo = new THREE.ShapeGeometry(createRoundedRectShape(0.58, 0.58, 0.06));
    applyNormalizedUVs(faceGeo, 0.58, 0.58);
    const faceMat = new THREE.MeshStandardMaterial({
      map: sqTex,
      roughness: 0.22,
      metalness: 0.15,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.z = 0.025;
    grp.add(faceMesh);
    grp.position.set(-0.84, 0, 0.006);
    return grp;
  };

  frontMount.add(createTsSquare());
  backMount.add(createTsSquare());

  return { group: root, width: W, height: H, depth: 0.25 };
}

export function buildTailwindBadge(): BuiltSkillBadge {
  const W = 3.06;
  const H = 1.0;
  const R = 0.35;
  const baseTex = createSmokyFaceTexture(W, H, '#0d4048', '#07272e', 'rgba(56, 248, 255, 0.36)', 0.22);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x38f8ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 1.05,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Tailwind CSS',
    textXRatio: 0.315,
    textYRatio: 0.51,
    fontSizeRatio: 0.37,
    fontWeight: 600,
    maxWidthRatio: 0.62,
    fillStyle: '#f0fdff',
    glowColor: 'rgba(56, 248, 255, 0.42)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const tailwindSvg = `<svg viewBox="0 0 256 153.6" xmlns="http://www.w3.org/2000/svg"><path d="M128 0C93.867 0 72.533 17.067 64 51.2 76.8 34.133 91.733 27.733 108.8 32c9.737 2.434 16.697 9.499 24.401 17.318C145.751 62.057 160.275 76.8 192 76.8c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C174.249 14.743 159.725 0 128 0zM64 76.8C29.867 76.8 8.533 93.867 0 128c12.8-17.067 27.733-23.467 44.8-19.2 9.737 2.434 16.697 9.499 24.401 17.318C81.751 138.857 96.275 153.6 128 153.6c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C110.249 91.543 95.725 76.8 64 76.8z"/></svg>`;
  const waveMat = new THREE.MeshStandardMaterial({
    color: 0x38e8ff,
    emissive: 0x0891b2,
    emissiveIntensity: 0.78,
    roughness: 0.2,
    metalness: 0.25,
  });

  const makeWaves = () => {
    const g = svgMarkupToExtrudedGroup(tailwindSvg, waveMat, 0.54, 0.036, 0.005, 0.004);
    g.position.set(-0.94, 0, 0.015);
    return g;
  };
  frontMount.add(makeWaves());
  backMount.add(makeWaves());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildSupabaseBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.33;
  const baseTex = createSmokyFaceTexture(W, H, '#047551', '#015238', 'rgba(46, 255, 178, 0.38)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.22,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x2effb2,
    emissive: 0x00ee8e,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.3,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Supabase',
    textXRatio: 0.35,
    textYRatio: 0.51,
    fontSizeRatio: 0.43,
    fontWeight: 600,
    fillStyle: '#f2fff9',
    glowColor: 'rgba(46, 255, 178, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const lowerSvg = `<svg viewBox="0 0 109 113" xmlns="http://www.w3.org/2000/svg"><path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"/></svg>`;
  const upperSvg = `<svg viewBox="0 0 109 113" xmlns="http://www.w3.org/2000/svg"><path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z"/></svg>`;

  const lowerMat = new THREE.MeshStandardMaterial({
    color: 0x0ed984,
    emissive: 0x059669,
    emissiveIntensity: 0.6,
    roughness: 0.22,
    metalness: 0.25,
  });
  const upperMat = new THREE.MeshStandardMaterial({
    color: 0x3effb5,
    emissive: 0x10b981,
    emissiveIntensity: 0.85,
    roughness: 0.18,
    metalness: 0.2,
  });

  const makeBolt = () => {
    const grp = new THREE.Group();
    const low = svgMarkupToExtrudedGroup(lowerSvg, lowerMat, 0.31, 0.032, 0.004, 0.003);
    low.position.set(0.08, -0.09, 0.01);
    const up = svgMarkupToExtrudedGroup(upperSvg, upperMat, 0.31, 0.034, 0.004, 0.003);
    up.position.set(-0.08, 0.09, 0.014);
    grp.add(low, up);
    grp.position.set(-0.9, 0, 0.006);
    return grp;
  };

  frontMount.add(makeBolt());
  backMount.add(makeBolt());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildPythonBadge(overrideRimHex?: string): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.42;

  const isPurpleVariant = Boolean(overrideRimHex);
  const baseTex = createSmokyFaceTexture(
    W,
    H,
    isPurpleVariant ? '#2c144a' : '#0a1f3a',
    isPurpleVariant ? '#1b0b33' : '#58400c',
    isPurpleVariant ? 'rgba(168, 85, 247, 0.36)' : 'rgba(255, 202, 58, 0.3)',
    0.26
  );
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.3,
    metalness: 0.28,
    envMapIntensity: 0.9,
  });
  const rimColor = overrideRimHex ? new THREE.Color(overrideRimHex) : new THREE.Color(0xffca3a);
  const rimEmissive = overrideRimHex ? new THREE.Color('#9333ea') : new THREE.Color(0xc97b00);
  const rimMat = new THREE.MeshStandardMaterial({
    color: rimColor,
    emissive: rimEmissive,
    emissiveIntensity: 1.02,
    roughness: 0.24,
    metalness: 0.65,
  });

  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Python',
    textXRatio: 0.402,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#f8fafc',
    glowColor: isPurpleVariant ? 'rgba(168, 85, 247, 0.45)' : 'rgba(250, 204, 21, 0.35)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    {
      width: W,
      height: H,
      cornerRadius: R,
      rimRadiusPrimary: 0.025,
      rimRadiusCenter: 0.02,
    },
    baseMat,
    rimMat,
    typo
  );

  const pythonHalfSvg = `<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg"><path d="M54.8 4.4c-26.2 0-24.6 11.4-24.6 11.4l.1 11.8h25v3.5H20.3S4 29.3 4 55.6c0 26.3 14.3 25.4 14.3 25.4h8.5V68.7s-.5-14.3 14-14.3h24.5s13.7.2 13.7-13.3V18.3S81 4.4 54.8 4.4zm-13.5 8c2.4 0 4.4 2 4.4 4.4s-2 4.4-4.4 4.4-4.4-2-4.4-4.4 2-4.4 4.4-4.4z"/></svg>`;
  const blueSnakeMat = new THREE.MeshStandardMaterial({
    color: 0x3b7eb8,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.25,
  });
  const yellowSnakeMat = new THREE.MeshStandardMaterial({
    color: 0xffd13b,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.25,
  });

  const makeSnakes = () => {
    const grp = new THREE.Group();
    const blueHalf = svgMarkupToExtrudedGroup(pythonHalfSvg, blueSnakeMat, 0.44, 0.038, 0.005, 0.004);
    blueHalf.position.set(-0.035, 0.06, 0.012);

    const yellowHalf = svgMarkupToExtrudedGroup(pythonHalfSvg, yellowSnakeMat, 0.44, 0.038, 0.005, 0.004);
    yellowHalf.rotation.z = Math.PI;
    yellowHalf.position.set(0.035, -0.06, 0.012);

    grp.add(blueHalf, yellowHalf);
    grp.position.set(-0.77, 0, 0.006);
    return grp;
  };

  frontMount.add(makeSnakes());
  backMount.add(makeSnakes());

  return { group: root, width: W, height: H, depth: 0.25 };
}

export function buildPostgresqlBadge(): BuiltSkillBadge {
  const W = 3.24;
  const H = 1.0;
  const R = 0.32;
  const baseTex = createSmokyFaceTexture(W, H, '#143973', '#0a1f45', 'rgba(59, 130, 246, 0.4)', 0.22);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1d68eb,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'PostgreSQL',
    textXRatio: 0.325,
    textYRatio: 0.51,
    fontSizeRatio: 0.4,
    fontWeight: 600,
    maxWidthRatio: 0.62,
    fillStyle: '#f1f7ff',
    glowColor: 'rgba(59, 130, 246, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  // Sculpted 3D Slonik elephant head silhouette + tusks + trunk
  const makeElephant = (): THREE.Group => {
    const grp = new THREE.Group();
    const elephantBlue = new THREE.MeshStandardMaterial({
      color: 0x336791,
      emissive: 0x1e40af,
      emissiveIntensity: 0.32,
      roughness: 0.24,
      metalness: 0.22,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.1,
    });

    const headSvg = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M84 22c-10-9-26-10-37-2-8-4-20-2-27 7-11 13-11 35-2 48 5 7 13 11 19 8l3-15c2 2 6 3 9 3 0 10-3 24-2 30 1 6 10 8 14 2 5-8 5-21 5-32 4-1 8-2 11-5 6 7 14 5 19-2 9-12 10-32-12-42z"/></svg>`;
    const headMesh = svgMarkupToExtrudedGroup(headSvg, elephantBlue, 0.52, 0.036, 0.006, 0.005);
    headMesh.position.set(0, 0, 0.01);
    grp.add(headMesh);

    // White outline rim backing
    const rimBacking = svgMarkupToExtrudedGroup(headSvg, whiteMat, 0.56, 0.018, 0.003, 0.003);
    rimBacking.position.set(0, 0, 0.004);
    grp.add(rimBacking);

    // Tusks & eyes
    const tuskGeo = new THREE.SphereGeometry(0.04, 12, 10);
    const tuskL = new THREE.Mesh(tuskGeo, whiteMat);
    tuskL.scale.set(0.55, 1.5, 0.55);
    tuskL.rotation.z = 0.45;
    tuskL.position.set(-0.075, -0.055, 0.04);

    const tuskR = new THREE.Mesh(tuskGeo, whiteMat);
    tuskR.scale.set(0.55, 1.5, 0.55);
    tuskR.rotation.z = -0.45;
    tuskR.position.set(0.075, -0.055, 0.04);

    const eyeGeo = new THREE.SphereGeometry(0.022, 10, 10);
    const eyeL = new THREE.Mesh(eyeGeo, whiteMat);
    eyeL.position.set(-0.07, 0.055, 0.04);
    const eyeR = new THREE.Mesh(eyeGeo, whiteMat);
    eyeR.position.set(0.07, 0.055, 0.04);

    grp.add(tuskL, tuskR, eyeL, eyeR);
    grp.position.set(-1.02, 0, 0.006);
    return grp;
  };

  frontMount.add(makeElephant());
  backMount.add(makeElephant());

  return { group: root, width: W, height: H, depth: 0.25 };
}
