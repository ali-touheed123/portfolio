import * as THREE from 'three';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3.0 - 2.0 * t);
}

function normalize3(x: number, y: number, z: number): [number, number, number] {
  const l = Math.sqrt(x * x + y * y + z * z) || 1.0;
  return [x / l, y / l, z / l];
}

function evaluateFollicleMask(x: number, y: number, z: number): number {
  const lEyeDist = Math.hypot(x + 0.33, y - 0.17, z - 0.87);
  const rEyeDist = Math.hypot(x - 0.33, y - 0.17, z - 0.87);
  const eyeMask = smoothstep(0.18, 0.27, Math.min(lEyeDist, rEyeDist));
  const distMouth = Math.hypot(x, y - 0.0, z - 0.96);
  const mouthMask = 0.24 + 0.76 * smoothstep(0.065, 0.16, distMouth);
  const bottomMask = smoothstep(-1.05, -0.7, y);
  return Math.max(0.0, Math.min(1.25, eyeMask * mouthMask * bottomMask));
}

function evaluateGroomFlow(
  x: number,
  y: number,
  z: number,
  nx: number,
  ny: number,
  nz: number
): [number, number, number] {
  let fx = x * 0.25;
  let fy = -0.85;
  let fz = (z - 0.15) * 0.25;

  const eyeCenters: [number, number, number][] = [
    [-0.33, 0.17, 0.86],
    [0.33, 0.17, 0.86],
  ];
  for (let i = 0; i < 2; i++) {
    const [ex, ey, ez] = eyeCenters[i];
    const dx = x - ex;
    const dy = y - ey;
    const dz = z - ez;
    const d = Math.hypot(dx, dy, dz) + 1e-5;
    if (d < 0.48) {
      const influence = (1.0 - d / 0.48) * 0.85;
      fx += (dx / d) * influence;
      fy += (dy / d) * influence * 0.6;
      fz += (dz / d) * influence * 0.3;
    }
  }

  const dotFN = fx * nx + fy * ny + fz * nz;
  const tx = fx - dotFN * nx;
  const ty = fy - dotFN * ny;
  const tz = fz - dotFN * nz;
  const len = Math.hypot(tx, ty, tz);
  return len > 1e-5 ? [tx / len, ty / len, tz / len] : [1.0, 0.0, 0.0];
}

function sculptBlobPosition(u: number, v: number, w: number): [number, number, number] {
  let x = u;
  let y = v;
  let z = w;

  const bellyWidth = 1.0 + 0.22 * Math.exp(-Math.pow((y + 0.24) / 0.55, 2.0));
  const cheekPuff = 1.0 + 0.14 * Math.exp(-Math.pow((y + 0.05) / 0.38, 2.0)) * Math.max(0, z);
  x *= bellyWidth * cheekPuff;
  z *= 0.94 + 0.12 * Math.exp(-Math.pow((y + 0.22) / 0.6, 2.0));
  y *= 0.96;

  if (y < -0.55) {
    const t = (-0.55 - y) / 0.45;
    y = -0.55 - Math.tanh(t * 1.15) * 0.32;
  }

  // Perky ears
  const leftEarDir = normalize3(-0.46, 0.86, 0.06);
  const rightEarDir = normalize3(0.46, 0.86, 0.06);
  const dotLEar = Math.max(0.0, u * leftEarDir[0] + v * leftEarDir[1] + w * leftEarDir[2]);
  const dotREar = Math.max(0.0, u * rightEarDir[0] + v * rightEarDir[1] + w * rightEarDir[2]);
  const earProfile = Math.pow(Math.max(dotLEar, dotREar), 14.0) * 0.44;
  x += u * earProfile * 0.75;
  y += v * earProfile * 1.15;
  z += w * earProfile * 0.55;

  // Cute stubby arms
  const leftArmDir = normalize3(-0.94, -0.08, 0.28);
  const rightArmDir = normalize3(0.94, -0.08, 0.28);
  const dotLArm = Math.max(0.0, u * leftArmDir[0] + v * leftArmDir[1] + w * leftArmDir[2]);
  const dotRArm = Math.max(0.0, u * rightArmDir[0] + v * rightArmDir[1] + w * rightArmDir[2]);
  const armProfile = Math.pow(Math.max(dotLArm, dotRArm), 18.0) * 0.24;
  x += u * armProfile * 1.1;
  y += v * armProfile * 0.6;
  z += w * armProfile * 0.9;

  // Eye socket indent
  const dEye = Math.min(
    Math.hypot(x + 0.33, y - 0.17, z - 0.86),
    Math.hypot(x - 0.33, y - 0.17, z - 0.86)
  );
  if (dEye < 0.32) {
    z -= (1.0 - smoothstep(0.0, 0.32, dEye)) * 0.065;
  }

  return [x, y, z];
}

const SHELL_VERTEX = /* glsl */ `
  attribute float aFollicleMask;
  attribute vec3 aGroomTangent;
  attribute float aShellIndex;

  uniform float uFurLength;
  uniform float uCurliness;
  uniform float uTime;
  uniform vec3 uPointerLocalPos;
  uniform float uPointerActive;
  uniform float uBoopShockwave;

  varying float vLayerHeight;
  varying float vFollicleMask;
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  varying vec3 vSurfNormal;
  varying vec3 vHairTangent;
  varying float vCombMemory;

  void main() {
    float h = clamp(aShellIndex, 0.0, 1.0);
    vLayerHeight = h;
    vFollicleMask = aFollicleMask;
    vLocalPos = position;

    vec3 localNormal = normalize(normal);
    vec3 groomDir = normalize(aGroomTangent);
    vec3 sideDir = normalize(cross(localNormal, groomDir) + vec3(1e-4, 0.0, 0.0));

    vec3 shockDisp = vec3(0.0);
    if (uBoopShockwave > 0.01) {
      float waveFront = (1.0 - uBoopShockwave) * 2.2;
      float dFront = abs(distance(localNormal, vec3(0.0, 0.1, 0.98)) - waveFront);
      if (dFront < 0.4) {
        float ripple = (1.0 - dFront / 0.4) * uBoopShockwave;
        shockDisp = normalize(localNormal - vec3(0.0, 0.1, 0.98) + vec3(0.0, 1e-4, 0.0)) * ripple * 0.48;
      }
    }

    vec3 pointerPush = vec3(0.0);
    vCombMemory = 0.0;
    if (uPointerActive > 0.5) {
      float pDist = distance(position, uPointerLocalPos);
      if (pDist < 0.65) {
        vec3 away = normalize(position - uPointerLocalPos + vec3(0.0, 1e-4, 0.0));
        away -= localNormal * dot(away, localNormal);
        float weight = pow(1.0 - pDist / 0.65, 1.6);
        pointerPush = away * weight * 0.42;
        vCombMemory = weight * 0.7;
      }
    }

    float effectiveLen = uFurLength * aFollicleMask;
    float bend = pow(h, 1.5);
    vec3 windWave = vec3(
      sin(position.y * 4.2 + uTime * 2.5) * 0.055,
      cos(position.x * 3.8 + uTime * 2.1) * 0.03,
      cos(position.z * 4.0 - uTime * 2.3) * 0.055
    );

    float curlPhase = h * mix(3.0, 7.2, uCurliness) + dot(position, vec3(5.0, 5.8, 4.8));
    float curlEnv = h * h * (3.0 - 2.0 * h);
    vec3 curlOffset = (sideDir * sin(curlPhase) + groomDir * (cos(curlPhase) - 1.0) * 0.5) * (uCurliness * effectiveLen * 0.25 * curlEnv);

    vec3 displaced = position
      + localNormal * (h * effectiveLen)
      + groomDir * (bend * effectiveLen * 0.34)
      + curlOffset
      + (shockDisp + windWave + pointerPush) * bend * effectiveLen;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;
    vSurfNormal = normalize(mat3(modelMatrix) * localNormal);
    vHairTangent = normalize(mat3(modelMatrix) * normalize(localNormal + groomDir * 0.4 + pointerPush));
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const SHELL_FRAGMENT = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uTipColor;
  uniform float uFurDensity;
  uniform vec3 uKeyLightDir;

  varying float vLayerHeight;
  varying float vFollicleMask;
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  varying vec3 vSurfNormal;
  varying vec3 vHairTangent;
  varying float vCombMemory;

  vec2 octahedralUV(vec3 n) {
    vec3 d = n / (abs(n.x) + abs(n.y) + abs(n.z) + 1e-6);
    vec2 oct = d.y >= 0.0
      ? d.xz
      : (1.0 - abs(d.zx)) * vec2(d.x >= 0.0 ? 1.0 : -1.0, d.z >= 0.0 ? 1.0 : -1.0);
    return oct * 0.5 + 0.5;
  }

  vec3 hash23(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xxz + p3.yxx) * p3.zyx);
  }

  void main() {
    if (vFollicleMask < 0.04) discard;

    float gridScale = mix(54.0, 92.0, clamp(uFurDensity, 0.0, 1.0));
    vec2 baseUV = octahedralUV(normalize(vLocalPos));
    vec2 sampleUV = baseUV * gridScale;
    vec2 cellId = floor(sampleUV);
    vec2 cellLocal = fract(sampleUV) - 0.5;
    vec3 rand = hash23(cellId);

    float fiberMaxH = mix(0.35, 1.0, rand.z) * clamp(vFollicleMask * 1.15, 0.0, 1.0);
    if (vLayerHeight > fiberMaxH) discard;

    float normH = clamp(vLayerHeight / max(0.15, fiberMaxH), 0.0, 1.0);
    float distToAxis = length(cellLocal - (rand.xy - 0.5) * 0.25);
    if (distToAxis > 0.62 * (1.0 - pow(normH, 1.25))) discard;

    vec3 N = normalize(vSurfNormal);
    vec3 T = normalize(vHairTangent);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uKeyLightDir);
    vec3 H = normalize(L + V);

    float dotTH = clamp(dot(T, H), -1.0, 1.0);
    float sinTH = sqrt(max(1e-5, 1.0 - dotTH * dotTH));
    float specR = pow(sinTH, 38.0) * 0.32 * (1.0 + vCombMemory * 0.4);
    float fresnelRim = pow(1.0 - max(0.0, dot(N, V)), 2.5) * 0.45;
    float ao = mix(0.28, 1.0, pow(vLayerHeight, 0.72));
    float diff = clamp((dot(N, L) + 0.5) / 1.5, 0.0, 1.0);

    vec3 albedo = mix(uBaseColor, uTipColor, smoothstep(0.08, 0.9, pow(vLayerHeight, 0.8)));
    vec3 color = albedo * (0.45 + 0.7 * diff) * ao + uTipColor * (specR + fresnelRim) * (0.3 + 0.7 * vLayerHeight);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface MochiFurHandle {
  group: THREE.Group;
  update: (t: number, dt: number, pointer: THREE.Vector2, impulse: number) => void;
  setPalette: (baseHex: string, tipHex: string) => void;
  dispose: () => void;
}

/**
 * Interactive 3D Mochi-Puff Fur Creature inspired directly by Ali's raw/3d-gpu-fur-simulation.
 */
export function buildMochiFurCreature(isSoftwareGl: boolean): MochiFurHandle {
  const root = new THREE.Group();
  const shellCount = isSoftwareGl ? 18 : 38;

  const baseGeo = new THREE.SphereGeometry(0.84, 64, 48);
  const posAttr = baseGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const [sx, sy, sz] = sculptBlobPosition(
      posAttr.getX(i) / 0.84,
      posAttr.getY(i) / 0.84,
      posAttr.getZ(i) / 0.84
    );
    posAttr.setXYZ(i, sx * 0.84, sy * 0.84 + 0.86, sz * 0.84);
  }
  baseGeo.computeVertexNormals();
  const normAttr = baseGeo.attributes.normal;

  const follicleMask = new Float32Array(posAttr.count);
  const groomTangent = new Float32Array(posAttr.count * 3);
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i) / 0.84;
    const y = (posAttr.getY(i) - 0.86) / 0.84;
    const z = posAttr.getZ(i) / 0.84;
    const nx = normAttr.getX(i);
    const ny = normAttr.getY(i);
    const nz = normAttr.getZ(i);
    follicleMask[i] = evaluateFollicleMask(x, y, z);
    const [tx, ty, tz] = evaluateGroomFlow(x, y, z, nx, ny, nz);
    groomTangent[i * 3] = tx;
    groomTangent[i * 3 + 1] = ty;
    groomTangent[i * 3 + 2] = tz;
  }

  baseGeo.setAttribute('aFollicleMask', new THREE.BufferAttribute(follicleMask, 1));
  baseGeo.setAttribute('aGroomTangent', new THREE.BufferAttribute(groomTangent, 3));

  const skinMat = new THREE.MeshStandardMaterial({
    color: '#4a3248',
    roughness: 0.78,
    metalness: 0.04,
  });
  const bodyMesh = new THREE.Mesh(baseGeo, skinMat);
  bodyMesh.castShadow = true;
  root.add(bodyMesh);

  // Volumetric fur shells
  const shellGeo = new THREE.InstancedBufferGeometry();
  shellGeo.index = baseGeo.index;
  shellGeo.attributes.position = baseGeo.attributes.position;
  shellGeo.attributes.normal = baseGeo.attributes.normal;
  shellGeo.attributes.aFollicleMask = baseGeo.attributes.aFollicleMask;
  shellGeo.attributes.aGroomTangent = baseGeo.attributes.aGroomTangent;

  const shellIndices = new Float32Array(shellCount);
  for (let i = 0; i < shellCount; i++) {
    shellIndices[i] = (i + 1) / shellCount;
  }
  shellGeo.setAttribute('aShellIndex', new THREE.InstancedBufferAttribute(shellIndices, 1));
  shellGeo.instanceCount = shellCount;

  const uniforms = {
    uBaseColor: { value: new THREE.Color('#6d28d9') },
    uTipColor: { value: new THREE.Color('#f0abfc') },
    uFurLength: { value: 0.16 },
    uFurDensity: { value: 0.82 },
    uCurliness: { value: 0.45 },
    uTime: { value: 0 },
    uKeyLightDir: { value: new THREE.Vector3(0.6, 0.85, 0.7) },
    uPointerLocalPos: { value: new THREE.Vector3(0, 0.86, 1) },
    uPointerActive: { value: 0 },
    uBoopShockwave: { value: 0 },
  };

  const shellMat = new THREE.ShaderMaterial({
    vertexShader: SHELL_VERTEX,
    fragmentShader: SHELL_FRAGMENT,
    uniforms,
    depthWrite: true,
    transparent: false,
  });
  const furShells = new THREE.Mesh(shellGeo, shellMat);
  furShells.frustumCulled = false;
  root.add(furShells);

  // Glossy Expressive Eyes + Catchlights + Rosy Cheeks
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 0.86, 0);
  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: '#090d16',
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });
  const catchMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: '#fb7185',
    roughness: 0.6,
    emissive: '#f43f5e',
    emissiveIntensity: 0.18,
  });

  const pupils: THREE.Mesh[] = [];
  [-0.27, 0.27].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 24), eyeMat);
    eye.position.set(ex, 0.15, 0.76);
    faceGroup.add(eye);

    const catchLight = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), catchMat);
    catchLight.position.set(ex + 0.035, 0.185, 0.865);
    faceGroup.add(catchLight);
    pupils.push(catchLight);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), cheekMat);
    cheek.scale.set(1.25, 0.72, 0.4);
    cheek.position.set(ex * 1.48, -0.02, 0.74);
    faceGroup.add(cheek);
  });

  // Cute tiny nose bean
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 16), cheekMat);
  nose.scale.set(1.3, 0.85, 0.8);
  nose.position.set(0, 0.04, 0.84);
  faceGroup.add(nose);

  root.add(faceGroup);

  return {
    group: root,
    setPalette: (baseHex, tipHex) => {
      uniforms.uBaseColor.value.set(baseHex);
      uniforms.uTipColor.value.set(tipHex);
      skinMat.color.set(baseHex).multiplyScalar(0.55);
    },
    update: (t, _dt, pointer, impulse) => {
      uniforms.uTime.value = t;
      uniforms.uBoopShockwave.value = Math.min(1, impulse);
      uniforms.uPointerLocalPos.value.set(pointer.x * 0.9, 0.86 + pointer.y * 0.65, 0.88);
      uniforms.uPointerActive.value = Math.hypot(pointer.x, pointer.y) > 0.02 ? 1.0 : 0.0;

      // Breath + jelly boop squash & stretch
      const squash = Math.sin(t * 2.2) * 0.025 + impulse * Math.sin(t * 18) * 0.12;
      root.scale.set(1 - squash * 0.65, 1 + squash, 1 - squash * 0.65);
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, pointer.x * 0.36, 0.08);
      root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, -pointer.y * 0.16, 0.08);

      pupils.forEach((p, idx) => {
        const baseEx = idx === 0 ? -0.27 : 0.27;
        p.position.x = baseEx + 0.03 + pointer.x * 0.025;
        p.position.y = 0.18 + pointer.y * 0.022;
      });
    },
    dispose: () => {
      baseGeo.dispose();
      shellGeo.dispose();
      skinMat.dispose();
      shellMat.dispose();
      eyeMat.dispose();
      catchMat.dispose();
      cheekMat.dispose();
      faceGroup.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
    },
  };
}
