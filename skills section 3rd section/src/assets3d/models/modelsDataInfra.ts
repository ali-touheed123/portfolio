import * as THREE from 'three';
import {
  applyNormalizedUVs,
  createBasePillAssembly,
  createLinearGradientRimMaterial,
  createRoundedRectShape,
  createSmokyFaceTexture,
  createTaperedStrokeShape,
  createTypographyTextures,
  svgMarkupToExtrudedGroup,
} from '../badgePrimitives';
import type { BuiltSkillBadge } from '../types';

export function buildDockerBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.33;
  const baseTex = createSmokyFaceTexture(W, H, '#0d2b57', '#061835', 'rgba(59, 158, 255, 0.42)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.3,
    metalness: 0.24,
    envMapIntensity: 0.92,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x3b9eff,
    emissive: 0x1a75f0,
    emissiveIntensity: 1.12,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Docker',
    textXRatio: 0.422,
    textYRatio: 0.51,
    fontSizeRatio: 0.46,
    fontWeight: 600,
    fillStyle: '#f0f9ff',
    glowColor: 'rgba(59, 158, 255, 0.48)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const whaleMat = new THREE.MeshStandardMaterial({
    color: 0x269ef2,
    emissive: 0x0284c7,
    emissiveIntensity: 0.42,
    roughness: 0.22,
    metalness: 0.2,
  });
  const containerMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.24,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf2f8ff,
    roughness: 0.2,
  });

  const makeWhale = () => {
    const grp = new THREE.Group();
    const whaleSvg = `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><path d="M88 26c-4-1-8 0-11 2-1-8-8-13-8-13s-5 6-4 15c-2 2-6 3-11 3H10c-2 0-4 2-4 4 0 15 12 24 31 24 22 0 38-10 44-27 4 1 9 0 12-4-2-2-3-3-5-4z"/></svg>`;
    const body = svgMarkupToExtrudedGroup(whaleSvg, whaleMat, 0.56, 0.032, 0.004, 0.003);
    body.position.set(0, -0.055, 0.01);
    grp.add(body);

    // Extruded container grid on whale back
    const boxGeo = new THREE.BoxGeometry(0.068, 0.056, 0.028);
    const coords: [number, number][] = [
      [-0.17, 0.025],
      [-0.09, 0.025],
      [-0.01, 0.025],
      [0.07, 0.025],
      [-0.09, 0.092],
      [-0.01, 0.092],
      [0.07, 0.092],
      [-0.01, 0.158],
    ];
    for (const [cx, cy] of coords) {
      const box = new THREE.Mesh(boxGeo, containerMat);
      box.position.set(cx, cy, 0.024);
      grp.add(box);
    }

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), whiteMat);
    eye.position.set(0.04, -0.055, 0.036);
    grp.add(eye);

    grp.position.set(-0.76, -0.01, 0.006);
    return grp;
  };

  frontMount.add(makeWhale());
  backMount.add(makeWhale());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildMysqlBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.33;
  const baseTex = createSmokyFaceTexture(W, H, '#0d2b57', '#061835', 'rgba(59, 158, 255, 0.36)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x3b9eff,
    emissive: 0x1a75f0,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'MySQL',
    textXRatio: 0.415,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#f0f9ff',
    glowColor: 'rgba(59, 158, 255, 0.42)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const dolphinMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0x93c5fd,
    emissiveIntensity: 0.35,
    roughness: 0.18,
    metalness: 0.18,
  });

  const makeDolphin = () => {
    const grp = new THREE.Group();
    const backShape = createTaperedStrokeShape(
      [
        [-0.24, -0.08],
        [-0.12, 0.12],
        [0.06, 0.18],
        [0.2, 0.08],
        [0.26, -0.02],
      ],
      [0.015, 0.038, 0.058, 0.036, 0.01]
    );
    const bellyShape = createTaperedStrokeShape(
      [
        [-0.18, -0.1],
        [-0.04, 0.03],
        [0.12, 0.03],
        [0.22, -0.02],
      ],
      [0.012, 0.028, 0.025, 0.008]
    );
    const finShape = createTaperedStrokeShape(
      [
        [-0.03, 0.15],
        [-0.06, 0.24],
        [0.03, 0.19],
      ],
      [0.032, 0.014, 0.008]
    );

    const extrudeOpts = {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    };
    grp.add(
      new THREE.Mesh(new THREE.ExtrudeGeometry(backShape, extrudeOpts), dolphinMat),
      new THREE.Mesh(new THREE.ExtrudeGeometry(bellyShape, extrudeOpts), dolphinMat),
      new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, extrudeOpts), dolphinMat)
    );
    grp.rotation.z = 0.25;
    grp.position.set(-0.78, -0.01, 0.008);
    return grp;
  };

  frontMount.add(makeDolphin());
  backMount.add(makeDolphin());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildVercelBadge(): BuiltSkillBadge {
  const W = 2.74;
  const H = 1.04;
  const R = 0.36;

  const outerMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0xcbd5e1,
    emissiveIntensity: 0.1,
    roughness: 0.22,
    metalness: 0.18,
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    {
      width: W,
      height: H,
      cornerRadius: R,
      bodyDepth: 0.11,
      bevelThickness: 0.044,
      bevelSize: 0.034,
    },
    outerMat,
    null
  );

  const innerTex = createSmokyFaceTexture(W - 0.12, H - 0.1, '#161920', '#050608', 'rgba(255, 255, 255, 0.06)', 0.45, 0.06);
  const innerMat = new THREE.MeshStandardMaterial({
    map: innerTex,
    roughness: 0.34,
    metalness: 0.3,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Vercel',
    textXRatio: 0.385,
    textYRatio: 0.51,
    fontSizeRatio: 0.43,
    fontWeight: 600,
    maxWidthRatio: 0.5,
    fillStyle: '#f8fafc',
  });
  const typoMat = new THREE.MeshStandardMaterial({
    map: typo.map,
    bumpMap: typo.bumpMap,
    bumpScale: 0.008,
    transparent: true,
    roughness: 0.18,
    depthWrite: false,
  });
  const triMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xcbd5e1,
    emissiveIntensity: 0.18,
    roughness: 0.16,
    metalness: 0.12,
  });

  const makeFace = () => {
    const grp = new THREE.Group();
    const plateShape = createRoundedRectShape(W - 0.14, H - 0.12, 0.32);
    const plateGeo = new THREE.ShapeGeometry(plateShape, 24);
    applyNormalizedUVs(plateGeo, W - 0.14, H - 0.12);
    grp.add(new THREE.Mesh(plateGeo, innerMat));

    const textGeo = new THREE.ShapeGeometry(createRoundedRectShape(W * 0.96, H * 0.94, R * 0.92), 20);
    applyNormalizedUVs(textGeo, W, H);
    const tMesh = new THREE.Mesh(textGeo, typoMat);
    tMesh.position.z = 0.004;
    grp.add(tMesh);

    const triH = 0.38;
    const triHalfW = triH / Math.sqrt(3);
    const triShape = new THREE.Shape();
    triShape.moveTo(0, triH * 0.55);
    triShape.lineTo(-triHalfW, -triH * 0.45);
    triShape.lineTo(triHalfW, -triH * 0.45);
    triShape.closePath();
    const triGeo = new THREE.ExtrudeGeometry(triShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    const triMesh = new THREE.Mesh(triGeo, triMat);
    triMesh.position.set(-0.74, 0, 0.005);
    grp.add(triMesh);
    return grp;
  };

  frontMount.add(makeFace());
  backMount.add(makeFace());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildGithubBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.34;
  const baseTex = createSmokyFaceTexture(W, H, '#5a1394', '#3d0868', 'rgba(230, 110, 255, 0.38)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.25,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xe66eff,
    emissive: 0xc228ff,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'GitHub',
    textXRatio: 0.39,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#fbf7ff',
    glowColor: 'rgba(230, 110, 255, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const octocatSvg = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;
  const iconMat = new THREE.MeshStandardMaterial({
    color: 0xfbf7ff,
    emissive: 0xe879f9,
    emissiveIntensity: 0.3,
    roughness: 0.18,
    metalness: 0.15,
  });

  const makeOcto = () => {
    const g = svgMarkupToExtrudedGroup(octocatSvg, iconMat, 0.56, 0.036, 0.005, 0.004);
    g.position.set(-0.78, 0, 0.015);
    return g;
  };
  frontMount.add(makeOcto());
  backMount.add(makeOcto());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildViteBadge(): BuiltSkillBadge {
  const W = 2.5;
  const H = 1.0;
  const R = 0.34;

  const baseTex = createSmokyFaceTexture(W, H, '#2a2247', '#1e1c2f', 'rgba(155, 77, 255, 0.34)', 0.26);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.26,
    envMapIntensity: 0.9,
  });
  const rimMat = createLinearGradientRimMaterial('#9b4dff', '#ffcc29', 1.08);
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Vite',
    textXRatio: 0.445,
    textYRatio: 0.51,
    fontSizeRatio: 0.48,
    fontWeight: 600,
    fillStyle: '#fcfaff',
    glowColor: 'rgba(255, 204, 41, 0.38)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const shieldSvg = `<svg viewBox="0 0 256 257" xmlns="http://www.w3.org/2000/svg"><path d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"/></svg>`;
  const boltSvg = `<svg viewBox="0 0 256 257" xmlns="http://www.w3.org/2000/svg"><path d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"/></svg>`;

  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.24,
  });
  const boltMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.65,
    roughness: 0.16,
    metalness: 0.2,
  });

  const makeViteLogo = () => {
    const grp = new THREE.Group();
    const shield = svgMarkupToExtrudedGroup(shieldSvg, shieldMat, 0.54, 0.032, 0.004, 0.003);
    shield.position.set(0, 0, 0.01);
    const bolt = svgMarkupToExtrudedGroup(boltSvg, boltMat, 0.28, 0.036, 0.004, 0.003);
    bolt.position.set(0.03, 0.04, 0.028);
    grp.add(shield, bolt);
    grp.position.set(-0.55, 0, 0.004);
    return grp;
  };

  frontMount.add(makeViteLogo());
  backMount.add(makeViteLogo());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildN8nBadge(): BuiltSkillBadge {
  const W = 2.45;
  const H = 1.05;
  const R = 0.34;
  const baseTex = createSmokyFaceTexture(W, H, '#4f162c', '#290714', 'rgba(255, 94, 132, 0.36)', 0.26);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xff5e84,
    emissive: 0xe63968,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'n8n',
    textXRatio: 0.525,
    textYRatio: 0.51,
    fontSizeRatio: 0.48,
    fontWeight: 700,
    fillStyle: '#fff5f7',
    glowColor: 'rgba(255, 94, 132, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    {
      width: W,
      height: H,
      cornerRadius: R,
      bodyDepth: 0.13,
      bevelThickness: 0.044,
      bevelSize: 0.038,
    },
    baseMat,
    rimMat,
    typo
  );

  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0xff6b8e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.72,
    roughness: 0.2,
    metalness: 0.25,
  });

  const makeNodes = () => {
    const grp = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.052, 0.017, 10, 22);
    const nodes: [number, number][] = [
      [-0.29, 0],
      [-0.1, 0],
      [0.24, 0.14],
      [0.18, -0.14],
    ];
    for (const [nx, ny] of nodes) {
      const m = new THREE.Mesh(ringGeo, nodeMat);
      m.position.set(nx, ny, 0.018);
      grp.add(m);
    }

    const addCurve = (pts: THREE.Vector3[]) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 18, 0.014, 8, false);
      grp.add(new THREE.Mesh(geo, nodeMat));
    };
    addCurve([new THREE.Vector3(-0.24, 0, 0.018), new THREE.Vector3(-0.15, 0, 0.018)]);
    addCurve([
      new THREE.Vector3(-0.05, 0.01, 0.018),
      new THREE.Vector3(0.06, 0.12, 0.018),
      new THREE.Vector3(0.19, 0.14, 0.018),
    ]);
    addCurve([
      new THREE.Vector3(-0.05, -0.01, 0.018),
      new THREE.Vector3(0.05, -0.12, 0.018),
      new THREE.Vector3(0.13, -0.14, 0.018),
    ]);

    grp.position.set(-0.52, 0, 0.005);
    return grp;
  };

  frontMount.add(makeNodes());
  backMount.add(makeNodes());

  return { group: root, width: W, height: H, depth: 0.26 };
}

export function buildMongodbBadge(): BuiltSkillBadge {
  const W = 3.04;
  const H = 1.02;
  const R = 0.34;
  const baseTex = createSmokyFaceTexture(W, H, '#074f29', '#032915', 'rgba(34, 197, 94, 0.36)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.22,
    envMapIntensity: 0.85,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 1.05,
    roughness: 0.2,
    metalness: 0.32,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'MongoDB',
    textXRatio: 0.372,
    textYRatio: 0.51,
    fontSizeRatio: 0.44,
    fontWeight: 600,
    fillStyle: '#f2fff7',
    glowColor: 'rgba(34, 197, 94, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const leafLeftSvg = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg"><path d="M32 6C20 26 8 48 8 76c0 21 12 36 22 40l2 8V6z"/></svg>`;
  const leafRightSvg = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg"><path d="M32 6v118l2-8c10-4 22-19 22-40C56 48 44 26 32 6z"/></svg>`;

  const leftLeafMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    emissive: 0x22c55e,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.2,
  });
  const rightLeafMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    emissive: 0x15803d,
    emissiveIntensity: 0.3,
    roughness: 0.24,
    metalness: 0.22,
  });

  const makeLeaf = () => {
    const grp = new THREE.Group();
    const leftMesh = svgMarkupToExtrudedGroup(leafLeftSvg, leftLeafMat, 0.18, 0.032, 0.004, 0.003);
    leftMesh.position.set(-0.088, 0, 0.012);
    const rightMesh = svgMarkupToExtrudedGroup(leafRightSvg, rightLeafMat, 0.18, 0.032, 0.004, 0.003);
    rightMesh.position.set(0.088, 0, 0.012);
    grp.add(leftMesh, rightMesh);
    grp.position.set(-0.92, 0, 0.008);
    return grp;
  };

  frontMount.add(makeLeaf());
  backMount.add(makeLeaf());

  return { group: root, width: W, height: H, depth: 0.25 };
}
