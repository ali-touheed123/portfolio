import * as THREE from 'three';
import {
  createBasePillAssembly,
  createSmokyFaceTexture,
  createTypographyTextures,
  svgMarkupToExtrudedGroup,
} from '../badgePrimitives';
import type { BuiltSkillBadge } from '../types';

export function buildReactQueryBadge(): BuiltSkillBadge {
  const W = 3.24;
  const H = 1.0;
  const R = 0.32;
  const baseTex = createSmokyFaceTexture(W, H, '#441714', '#2b0d0c', 'rgba(255, 110, 84, 0.38)', 0.22);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.24,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xff6e54,
    emissive: 0xf24a34,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.34,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'React Query',
    textXRatio: 0.315,
    textYRatio: 0.51,
    fontSizeRatio: 0.4,
    fontWeight: 600,
    maxWidthRatio: 0.63,
    fillStyle: '#fff5f5',
    glowColor: 'rgba(255, 110, 84, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const coralMat = new THREE.MeshStandardMaterial({
    color: 0xff5252,
    emissive: 0xe11d48,
    emissiveIntensity: 0.45,
    roughness: 0.22,
  });
  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xf6d564,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.2,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x18091f,
    roughness: 0.35,
  });

  const makeTanStack = () => {
    const grp = new THREE.Group();
    const backing = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.016, 24), darkMat);
    backing.rotation.x = Math.PI / 2;
    backing.position.z = 0.008;
    grp.add(backing);

    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), coralMat);
      petal.scale.set(1.35, 0.65, 0.28);
      petal.position.set(Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.02);
      petal.rotation.z = a + 0.52;
      grp.add(petal);
    }

    const hexDark = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.132, 0.024, 6), darkMat);
    hexDark.rotation.x = Math.PI / 2;
    hexDark.position.z = 0.022;
    const hexGold = new THREE.Mesh(new THREE.CylinderGeometry(0.106, 0.106, 0.028, 6), yellowMat);
    hexGold.rotation.x = Math.PI / 2;
    hexGold.position.z = 0.026;
    const core = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 18), darkMat);
    core.position.z = 0.042;
    grp.add(hexDark, hexGold, core);

    grp.position.set(-1.04, 0, 0.006);
    return grp;
  };

  frontMount.add(makeTanStack());
  backMount.add(makeTanStack());

  return { group: root, width: W, height: H, depth: 0.24 };
}

export function buildZustandBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.33;
  const baseTex = createSmokyFaceTexture(W, H, '#4c2f14', '#2b1808', 'rgba(244, 160, 70, 0.38)', 0.24);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.22,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xf4a046,
    emissive: 0xd97518,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.35,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Zustand',
    textXRatio: 0.38,
    textYRatio: 0.51,
    fontSizeRatio: 0.47,
    fontWeight: 600,
    fillStyle: '#fffbeb',
    glowColor: 'rgba(244, 160, 70, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  // Sculpted 3D Bear mascot holding golden acorn
  const furMat = new THREE.MeshStandardMaterial({ color: 0x7c4a26, roughness: 0.38 });
  const darkFurMat = new THREE.MeshStandardMaterial({ color: 0x241108, roughness: 0.4 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: 0xf5d0a9, roughness: 0.32 });
  const acornMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.3,
    roughness: 0.25,
  });

  const makeBear = () => {
    const grp = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), furMat);
    head.scale.set(1.1, 0.96, 0.4);
    head.position.set(0, 0.04, 0.02);

    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), furMat);
    earL.scale.set(1, 1, 0.45);
    earL.position.set(-0.15, 0.18, 0.02);
    const earR = earL.clone();
    earR.position.x = 0.15;

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), furMat);
    belly.scale.set(1.12, 0.85, 0.42);
    belly.position.set(0, -0.14, 0.018);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 10), snoutMat);
    snout.scale.set(1.15, 0.85, 0.45);
    snout.position.set(0, 0.0, 0.065);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), darkFurMat);
    nose.position.set(0, 0.018, 0.095);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), darkFurMat);
    eyeL.position.set(-0.072, 0.07, 0.085);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.072;

    const acorn = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), acornMat);
    acorn.scale.set(1.2, 0.85, 0.6);
    acorn.position.set(0, -0.14, 0.078);

    grp.add(head, earL, earR, belly, snout, nose, eyeL, eyeR, acorn);
    grp.position.set(-0.82, 0, 0.008);
    return grp;
  };

  frontMount.add(makeBear());
  backMount.add(makeBear());

  return { group: root, width: W, height: H, depth: 0.25 };
}

export function buildPlaywrightBadge(): BuiltSkillBadge {
  const W = 3.0;
  const H = 1.0;
  const R = 0.32;
  const baseTex = createSmokyFaceTexture(W, H, '#0a4a1d', '#042a10', 'rgba(59, 242, 78, 0.38)', 0.22);
  const baseMat = new THREE.MeshStandardMaterial({
    map: baseTex,
    roughness: 0.32,
    metalness: 0.22,
    envMapIntensity: 0.9,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x3bf24e,
    emissive: 0x1fd935,
    emissiveIntensity: 1.08,
    roughness: 0.2,
    metalness: 0.32,
  });
  const typo = createTypographyTextures({
    width: W,
    height: H,
    text: 'Playwright',
    textXRatio: 0.365,
    textYRatio: 0.51,
    fontSizeRatio: 0.44,
    fontWeight: 600,
    maxWidthRatio: 0.6,
    fillStyle: '#f2fff5',
    glowColor: 'rgba(59, 242, 78, 0.45)',
  });

  const { root, frontMount, backMount } = createBasePillAssembly(
    { width: W, height: H, cornerRadius: R },
    baseMat,
    rimMat,
    typo
  );

  const maskSvg = `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg"><path d="M12 18c25-12 51-12 76 0 4 38-6 72-38 86C18 90 8 56 12 18zM28 45c4-4 12-4 16 0-4 4-12 4-16 0zm28 0c4-4 12-4 16 0-4 4-12 4-16 0zM32 68c8 12 28 12 36 0H32z"/></svg>`;
  const coralMaskMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 0.42,
    roughness: 0.22,
  });
  const greenMaskMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 0.5,
    roughness: 0.22,
  });

  const makeMasks = () => {
    const grp = new THREE.Group();
    const tragedy = svgMarkupToExtrudedGroup(maskSvg, coralMaskMat, 0.34, 0.026, 0.004, 0.003);
    tragedy.rotation.z = 0.28;
    tragedy.position.set(-0.18, 0.04, 0.012);

    const comedy = svgMarkupToExtrudedGroup(maskSvg, greenMaskMat, 0.42, 0.03, 0.004, 0.003);
    comedy.rotation.z = -0.19;
    comedy.position.set(0.11, -0.02, 0.026);

    grp.add(tragedy, comedy);
    grp.position.set(-0.9, 0, 0.005);
    return grp;
  };

  frontMount.add(makeMasks());
  backMount.add(makeMasks());

  return { group: root, width: W, height: H, depth: 0.25 };
}
