import * as THREE from 'three';
import {
  createBasePillAssembly,
  createLinearGradientRimMaterial,
  createSmokyFaceTexture,
  createTypographyTextures,
} from '../badgePrimitives';
import type { BuiltSkillBadge } from '../types';

export function buildGsapLenisBadge(): BuiltSkillBadge {
  const W = 3.2;
  const H = 1.0;
  const R = 0.27;
  const baseTex = createSmokyFaceTexture(W, H, '#103c15', '#061c08', 'rgba(98, 255, 71, 0.36)', 0.22);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x62ff47,
    emissive: 0x32e01d,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.32,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'GSAP & Lenis',
    textXRatio: 0.32,
    textYRatio: 0.51,
    fontSizeRatio: 0.36,
    fontWeight: 700,
    maxWidthRatio: 0.62,
    fillStyle: '#f2fff0',
    glowColor: 'rgba(98, 255, 71, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  // Stylized 3D Green-Caped Superhero emblem on left
  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x62ff47,
    emissive: 0x16a34a,
    emissiveIntensity: 0.55,
    roughness: 0.22,
  });
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.1,
  });

  const makeHero = () => {
    const grp = new THREE.Group();
    const capeShape = new THREE.Shape();
    capeShape.moveTo(-0.18, 0.26);
    capeShape.lineTo(0.24, 0.18);
    capeShape.quadraticCurveTo(0.32, -0.05, 0.14, -0.28);
    capeShape.lineTo(-0.26, -0.22);
    capeShape.quadraticCurveTo(-0.24, 0.05, -0.18, 0.26);
    const capeGeo = new THREE.ExtrudeGeometry(capeShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    grp.add(new THREE.Mesh(capeGeo, greenMat));

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.22, 12), suitMat);
    torso.position.set(0, 0.01, 0.025);
    torso.rotation.z = -0.18;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), suitMat);
    head.position.set(0.03, 0.18, 0.03);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.22, 10), greenMat);
    arm.position.set(0.11, 0.14, 0.03);
    arm.rotation.z = -0.65;
    grp.add(torso, head, arm);
    grp.position.set(-1.02, 0, 0.008);
    return grp;
  };

  frontMount.add(makeHero());
  backMount.add(makeHero());

  return { group: root, width: W, height: H, depth: 0.25 };
}

export function buildMotionBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.34;
  const baseTex = createSmokyFaceTexture(W, H, '#44126a', '#2c0848', 'rgba(232, 121, 249, 0.36)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = createLinearGradientRimMaterial('#ffa4df', '#c83cff', 1.1);
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Motion',
    textXRatio: 0.42,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#fdf4ff',
    glowColor: 'rgba(232, 121, 249, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const facetA = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0.45,
    roughness: 0.2,
  });
  const facetB = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    emissive: 0xd946ef,
    emissiveIntensity: 0.45,
    roughness: 0.2,
  });

  const makeOrigamiM = () => {
    const grp = new THREE.Group();
    const mkBar = (w: number, h: number, x: number, y: number, rz: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.028), mat);
      m.position.set(x, y, 0.02);
      m.rotation.z = rz;
      return m;
    };
    grp.add(
      mkBar(0.11, 0.44, -0.22, 0, -0.24, facetA),
      mkBar(0.11, 0.44, -0.07, 0, 0.24, facetB),
      mkBar(0.11, 0.44, 0.07, 0, -0.24, facetA),
      mkBar(0.11, 0.44, 0.22, 0, 0.24, facetB)
    );
    grp.position.set(-0.78, 0, 0.005);
    return grp;
  };

  frontMount.add(makeOrigamiM());
  backMount.add(makeOrigamiM());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildWebglBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.34;
  const baseTex = createSmokyFaceTexture(W, H, '#2a0804', '#160301', 'rgba(255, 90, 38, 0.38)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.26,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xff5a26,
    emissive: 0xff3308,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'WebGL',
    textXRatio: 0.43,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#ffffff',
    glowColor: 'rgba(255, 90, 38, 0.42)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  // Crimson extruded crescent emblem
  const crimsonMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    emissive: 0x991b1b,
    emissiveIntensity: 0.5,
    roughness: 0.22,
    metalness: 0.25,
  });

  const makeCrescent = () => {
    const outer = new THREE.Shape();
    outer.absellipse(0, 0, 0.35, 0.23, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(0.09, 0, 0.28, 0.17, 0, Math.PI * 2, true, 0);
    outer.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(outer, {
      depth: 0.026,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 2,
      curveSegments: 28,
    });
    const mesh = new THREE.Mesh(geo, crimsonMat);
    mesh.position.set(-0.78, 0, 0.01);
    return mesh;
  };

  frontMount.add(makeCrescent());
  backMount.add(makeCrescent());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildMatterjsBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.34;
  const baseTex = createSmokyFaceTexture(W, H, '#102413', '#0c1c0f', 'rgba(82, 235, 92, 0.34)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x52eb5c,
    emissive: 0x34cf3e,
    emissiveIntensity: 1.05,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Matter.js',
    textXRatio: 0.38,
    textYRatio: 0.51,
    fontSizeRatio: 0.44,
    fontWeight: 600,
    fillStyle: '#f0fff4',
    glowColor: 'rgba(82, 235, 92, 0.4)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x2dd4bf,
    emissive: 0x0d9488,
    emissiveIntensity: 0.45,
    roughness: 0.22,
  });
  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xfcc932,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.22,
  });
  const coralMat = new THREE.MeshStandardMaterial({
    color: 0xf25835,
    emissive: 0xdc2626,
    emissiveIntensity: 0.35,
    roughness: 0.22,
  });

  const makeMatter = () => {
    const grp = new THREE.Group();
    const pts: [number, number][] = [
      [0, 0.22],
      [-0.22, -0.16],
      [0.22, -0.16],
    ];
    for (let i = 0; i < 3; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % 3];
      const curve = new THREE.LineCurve3(new THREE.Vector3(a[0], a[1], 0.018), new THREE.Vector3(b[0], b[1], 0.018));
      grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 4, 0.018, 8, false), trussMat));
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), trussMat);
      node.position.set(a[0], a[1], 0.02);
      grp.add(node);
    }

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.082, 14, 14), yellowMat);
    ball.position.set(-0.04, 0.03, 0.025);
    const sq = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.04), coralMat);
    sq.position.set(0.11, -0.05, 0.022);
    sq.rotation.z = 0.25;
    grp.add(ball, sq);

    grp.position.set(-0.84, 0, 0.006);
    return grp;
  };

  frontMount.add(makeMatter());
  backMount.add(makeMatter());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildR3fBadge(): BuiltSkillBadge {
  const W = 2.8;
  const H = 1.04;
  const R = 0.38;
  const baseTex = createSmokyFaceTexture(W, H, '#0c3e4f', '#062430', 'rgba(91, 224, 255, 0.38)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.3,
    metalness: 0.25,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x5be0ff,
    emissive: 0x22bfff,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'R3F',
    textXRatio: 0.465,
    textYRatio: 0.51,
    fontSizeRatio: 0.5,
    fontWeight: 700,
    fillStyle: '#f0fcff',
    glowColor: 'rgba(91, 224, 255, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const cyanMat = new THREE.MeshStandardMaterial({
    color: 0x5be0ff,
    emissive: 0x00b4d8,
    emissiveIntensity: 0.9,
    roughness: 0.18,
  });

  const makeR3f = () => {
    const grp = new THREE.Group();
    const angles = [0, Math.PI / 3, -Math.PI / 3];
    for (const a of angles) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < 36; i++) {
        const t = (i / 36) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(t) * 0.33, Math.sin(t) * 0.13, 0));
      }
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 40, 0.0145, 8, true),
        cyanMat
      );
      tube.rotation.z = a;
      grp.add(tube);
    }
    grp.add(new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.0105, 10, 22), cyanMat));
    const tri = new THREE.Mesh(new THREE.ConeGeometry(0.056, 0.08, 3), cyanMat);
    tri.rotation.x = Math.PI / 2;
    grp.add(tri);
    grp.position.set(-0.62, 0, 0.018);
    return grp;
  };

  frontMount.add(makeR3f());
  backMount.add(makeR3f());

  return { group: root, width: W, height: H, depth: 0.25 };
}

export function buildShaderBadge(): BuiltSkillBadge {
  const W = 2.9;
  const H = 1.0;
  const R = 0.35;
  const baseTex = createSmokyFaceTexture(W, H, '#46160b', '#260904', 'rgba(255, 90, 46, 0.44)', 0.225);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.3,
    metalness: 0.26,
    envMapIntensity: 0.92,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xff5a2e,
    emissive: 0xe63c12,
    emissiveIntensity: 1.12,
    roughness: 0.2,
    metalness: 0.38,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Shader',
    textXRatio: 0.385,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#fff5f0',
    glowColor: 'rgba(255, 90, 46, 0.48)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    {
      width: W,
      height: H,
      cornerRadius: R,
      rimRadiusPrimary: 0.024,
      rimRadiusCenter: 0.02,
    },
    baseMat,
    rimMat,
    typo
  );

  const innerCubeMat = new THREE.MeshStandardMaterial({
    color: 0xff3b18,
    emissive: 0xff5722,
    emissiveIntensity: 1.25,
    roughness: 0.15,
  });
  const outerGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xff9e7d,
    emissive: 0xf97316,
    emissiveIntensity: 0.28,
    transparent: true,
    opacity: 0.42,
    roughness: 0.12,
    metalness: 0.1,
  });
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffb899,
    wireframe: true,
  });

  const makeNestedCube = () => {
    const grp = new THREE.Group();
    const inner = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.17, 0.17), innerCubeMat);
    const outer = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), outerGlassMat);
    const wire = new THREE.Mesh(new THREE.BoxGeometry(0.326, 0.326, 0.326), wireMat);
    grp.add(inner, outer, wire);
    grp.rotation.set(Math.atan(Math.SQRT1_2), -Math.PI / 4, 0);
    grp.position.set(-0.79, 0, 0.14);
    return grp;
  };

  frontMount.add(makeNestedCube());
  backMount.add(makeNestedCube());

  return { group: root, width: W, height: H, depth: 0.36 };
}

export function buildThreejsBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.34;
  const baseTex = createSmokyFaceTexture(W, H, '#043259', '#021e38', 'rgba(36, 185, 255, 0.38)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.3,
    metalness: 0.25,
    envMapIntensity: 0.92,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x24b9ff,
    emissive: 0x008cff,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Three.js',
    textXRatio: 0.388,
    textYRatio: 0.51,
    fontSizeRatio: 0.46,
    fontWeight: 600,
    fillStyle: '#f0f9ff',
    glowColor: 'rgba(36, 185, 255, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  // 4x4 Subdivided Wireframe Triangle
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.35,
  });

  const makeSubdividedTriangle = () => {
    const grp = new THREE.Group();
    const vTop = new THREE.Vector3(-0.22, 0.24, 0.018);
    const vRight = new THREE.Vector3(0.28, 0.08, 0.018);
    const vBottom = new THREE.Vector3(-0.08, -0.25, 0.018);

    const grid: THREE.Vector3[][] = [];
    const N = 4;
    for (let r = 0; r <= N; r++) {
      const row: THREE.Vector3[] = [];
      for (let c = 0; c <= N - r; c++) {
        const u = r / N;
        const v = c / N;
        const w = 1 - u - v;
        row.push(
          new THREE.Vector3()
            .addScaledVector(vTop, w)
            .addScaledVector(vRight, v)
            .addScaledVector(vBottom, u)
        );
      }
      grid.push(row);
    }

    const addSeg = (a: THREE.Vector3, b: THREE.Vector3) => {
      const curve = new THREE.LineCurve3(a, b);
      grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 2, 0.0082, 6, false), wireMat));
    };

    const sphereGeo = new THREE.SphereGeometry(0.014, 8, 8);
    for (let r = 0; r <= N; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const joint = new THREE.Mesh(sphereGeo, wireMat);
        joint.position.copy(grid[r][c]);
        grp.add(joint);
        if (c + 1 < grid[r].length) addSeg(grid[r][c], grid[r][c + 1]);
        if (r + 1 <= N && c < grid[r + 1].length) addSeg(grid[r][c], grid[r + 1][c]);
        if (r + 1 <= N && c - 1 >= 0 && c - 1 < grid[r + 1].length) addSeg(grid[r][c], grid[r + 1][c - 1]);
      }
    }

    grp.position.set(-0.82, 0, 0.006);
    grp.scale.z = 0.85;
    return grp;
  };

  frontMount.add(makeSubdividedTriangle());
  backMount.add(makeSubdividedTriangle());

  return { group: root, width: W, height: H, depth: 0.24 };
}
