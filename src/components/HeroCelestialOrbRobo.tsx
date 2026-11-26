import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSkyTheme } from '../context/ThemeContext';
import { useIsInViewport } from '../hooks/useIsInViewport';
import { detectSoftwareWebGL, disposeObjectSubtree } from '../utils/webgl';

interface HeroCelestialOrbRoboProps {
  className?: string;
}

const VERTEX_SOURCE = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SOURCE = `
  precision highp float;

  uniform vec2  u_resolution;
  uniform float u_time;
  uniform float u_progress;   // 0.0 = Moon (Night), 1.0 = Sun (Day)
  uniform float u_hover;      // 0.0 -> 1.0 hover warmth
  uniform vec2  u_mouse;      // Normalized subtle parallax

  #define PI 3.14159265359

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p = rot * p * 2.04 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  float craterLayer(vec2 p, float scale) {
    vec2 sp = p * scale;
    vec2 id = floor(sp);
    vec2 gv = fract(sp) - 0.5;
    float h = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offs = vec2(float(x), float(y));
        vec2 rnd = hash22(id + offs);
        vec2 center = offs + (rnd - 0.5) * 0.65;
        float dist = length(gv - center);
        float radius = 0.14 + 0.24 * fract(rnd.x * 13.7);
        float bowl = smoothstep(radius, radius * 0.25, dist);
        float rim  = exp(-pow((dist - radius * 0.96) / (radius * 0.22), 2.0));
        h += (-0.55 * bowl + 0.26 * rim) * step(0.32, rnd.y);
      }
    }
    return h;
  }

  float lunarHeight(vec2 p) {
    float base = fbm(p * 3.1) * 0.35;
    float c1 = craterLayer(p, 3.6) * 0.55;
    float c2 = craterLayer(p + vec2(4.2, 1.9), 8.2) * 0.24;
    return base + c1 + c2;
  }

  vec3 tonemapACES(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  void main() {
    float minDim = min(u_resolution.x, u_resolution.y);
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / minDim;
    vec2 p = uv - u_mouse * 0.006;

    float t = smoothstep(0.0, 1.0, u_progress);
    float twilight = sin(t * PI);

    float breath = 1.0 + 0.035 * t + 0.012 * u_hover + 0.015 * sin(t * PI);
    float R = 0.225 * breath;
    float d = length(p);
    float angle = atan(p.y, p.x);

    // Lunar cool silver + subtle Neon Lime rim aura on hover
    float moonHalo = exp(-max(0.0, d - R * 0.85) * 7.2) * 0.44
                   + exp(-max(0.0, d - R * 0.90) * 2.8) * 0.15;
    vec3 moonGlowBase = mix(vec3(0.55, 0.72, 0.85), vec3(0.22, 1.0, 0.08), 0.26 + 0.34 * u_hover);
    vec3 moonAuraColor = moonGlowBase * moonHalo * (1.0 + 0.32 * u_hover);

    // Warm solar corona + wispy flares
    float flareNoise = fbm(vec2(angle * 3.0 + u_time * 0.08, d * 4.5 - u_time * 0.18));
    float softRays = 0.82 + 0.18 * sin(angle * 7.0 + u_time * 0.15 + flareNoise * 3.0);
    float sunHaloInner = exp(-max(0.0, d - R * 0.94) * 14.0) * (1.20 + 0.35 * flareNoise);
    float sunHaloMid   = exp(-max(0.0, d - R * 0.85) * 5.0) * 0.68 * softRays;
    float sunHaloWide  = exp(-max(0.0, d - R * 0.55) * 2.4) * 0.30;
    vec3 sunAuraColor = vec3(1.0, 0.88, 0.55) * sunHaloInner
                      + vec3(1.0, 0.62, 0.22) * sunHaloMid
                      + vec3(1.0, 0.78, 0.45) * sunHaloWide;
    sunAuraColor *= (1.0 + 0.24 * u_hover);

    // Ignition pulse ring during Night <-> Day transition
    float pulseRing = exp(-pow((d - (R + 0.03 + t * 0.12)) / 0.055, 2.0)) * twilight * 0.48;
    vec3 pulseColor = mix(vec3(0.22, 1.0, 0.08), vec3(1.0, 0.42, 0.22), t) * pulseRing;

    vec3 auraCol = mix(moonAuraColor, sunAuraColor, t) + pulseColor;
    float auraStrength = mix(moonHalo, sunHaloInner + sunHaloMid + sunHaloWide, t) + pulseRing;

    float edgeFade = 1.0 - smoothstep(0.34, 0.485, d);
    auraCol *= edgeFade;
    auraStrength *= edgeFade;

    float edgeAA = 2.0 / minDim;
    float orbMask = 1.0 - smoothstep(R - edgeAA, R + edgeAA, d);

    vec3 col = auraCol;
    if (orbMask > 0.001) {
      vec2 np = p / R;
      float z = sqrt(max(0.0, 1.0 - dot(np, np)));
      vec3 N = normalize(vec3(np, z));
      vec2 sUV = N.xy / (0.62 + 0.38 * N.z);

      // Moon surface
      float eps = 0.008;
      float h0 = lunarHeight(sUV);
      float hx = lunarHeight(sUV + vec2(eps, 0.0));
      float hy = lunarHeight(sUV + vec2(0.0, eps));
      vec3 craterN = normalize(N + vec3((h0 - hx) * 1.6, (h0 - hy) * 1.6, 0.0));

      float maria = smoothstep(0.40, 0.66, fbm(sUV * 1.35 + vec2(2.4, -1.3)));
      vec3 regolith = mix(vec3(0.86, 0.88, 0.92), vec3(0.42, 0.46, 0.52), maria * 0.78);
      regolith *= (0.86 + 0.28 * h0);

      vec3 moonLightDir = normalize(vec3(-0.62 + u_mouse.x * 0.14, 0.38 + u_mouse.y * 0.14, 0.68));
      float diff = max(dot(craterN, moonLightDir), 0.0);
      float limb = pow(max(N.z, 0.0), 0.35);
      vec3 earthshine = vec3(0.06, 0.12, 0.09) * (0.65 + 0.35 * N.z);
      vec3 moonCol = regolith * (diff * 1.18 + 0.08) * limb + earthshine * (1.0 - diff);
      moonCol += vec3(0.22, 1.0, 0.12) * pow(1.0 - N.z, 3.3) * 0.22 * (0.55 + 0.45 * u_hover);

      // Sun surface
      vec2 sunUV = sUV * 2.6;
      float warp1 = fbm(sunUV + vec2(u_time * 0.07, -u_time * 0.05));
      float warp2 = fbm(sunUV * 1.8 - vec2(u_time * 0.09, u_time * 0.06) + warp1 * 1.6);
      float plasma = fbm(sunUV * 2.5 + vec2(warp1, warp2) * 1.4 + u_time * 0.04);

      float sunLimb = pow(max(N.z, 0.0), 0.42);
      vec3 sunCore  = vec3(1.22, 1.06, 0.72);
      vec3 sunMid   = vec3(1.08, 0.66, 0.18);
      vec3 sunEdge  = vec3(0.92, 0.28, 0.05);
      vec3 sunCol = mix(sunEdge, sunMid, smoothstep(0.15, 0.65, sunLimb));
      sunCol = mix(sunCol, sunCore, smoothstep(0.45, 0.92, sunLimb * (0.72 + 0.45 * plasma)));
      sunCol += vec3(1.0, 0.92, 0.60) * smoothstep(0.56, 0.85, plasma) * 0.35 * sunLimb;
      sunCol += vec3(1.0, 0.55, 0.16) * pow(1.0 - N.z, 2.8) * 0.55;

      float igniteEmber = smoothstep(0.15, 0.55, twilight) * (0.4 + 0.6 * (1.0 - maria));
      vec3 emberGlow = vec3(1.0, 0.48, 0.14) * igniteEmber * 0.65;

      vec3 orbCol = mix(moonCol, sunCol, t) + emberGlow;
      col = mix(col, orbCol, orbMask);
    }

    col = tonemapACES(col);
    col = pow(col, vec3(0.95));
    float alpha = clamp(max(orbMask, auraStrength * 1.45), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

const ANGRY_QUOTES = [
  "Hey! Don't poke me!",
  'Hands off the suit!',
  'Orbit interrupted!',
  'Watch the visor!',
];

function createSuitTextures() {
  const size = 256;
  const nCanvas = document.createElement('canvas');
  nCanvas.width = size;
  nCanvas.height = size;
  const nCtx = nCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;

  nCtx.fillStyle = 'rgb(128, 128, 255)';
  nCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = 'rgb(96, 96, 96)';
  rCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const alt = ((x + y) / 4) % 2 === 0;
      nCtx.fillStyle = alt ? 'rgb(134, 130, 255)' : 'rgb(122, 126, 255)';
      nCtx.fillRect(x, y, 3, 3);
      rCtx.fillStyle = alt ? 'rgb(104, 104, 104)' : 'rgb(88, 88, 88)';
      rCtx.fillRect(x, y, 4, 4);
    }
  }

  nCtx.strokeStyle = 'rgb(106, 106, 245)';
  nCtx.lineWidth = 2;
  rCtx.strokeStyle = 'rgb(145, 145, 145)';
  rCtx.lineWidth = 2;
  [64, 192].forEach((pos) => {
    nCtx.beginPath();
    nCtx.moveTo(0, pos);
    nCtx.lineTo(size, pos);
    nCtx.stroke();
    rCtx.beginPath();
    rCtx.moveTo(0, pos);
    rCtx.lineTo(size, pos);
    rCtx.stroke();
  });

  const normalMap = new THREE.CanvasTexture(nCanvas);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 4);

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  return { normalMap, roughnessMap };
}

export const HeroCelestialOrbRobo: React.FC<HeroCelestialOrbRoboProps> = ({ className = '' }) => {
  const { isDay, toggleTheme } = useSkyTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const skyCanvasRef = useRef<HTMLCanvasElement>(null);
  const roboCanvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const isVisible = useIsInViewport(containerRef, '120px');
  const isVisibleRef = useRef(isVisible);
  isVisibleRef.current = isVisible;

  const targetProgressRef = useRef<number>(isDay ? 1 : 0);
  const toggleThemeRef = useRef(toggleTheme);
  toggleThemeRef.current = toggleTheme;

  const [size, setSize] = useState<number>(() => {
    if (typeof window === 'undefined') return 176;
    if (window.innerWidth < 640) return 112;
    if (window.innerWidth < 1024) return 148;
    return 180;
  });
  const [cursorMode, setCursorMode] = useState<'default' | 'pointer'>('default');
  const [bubbleText, setBubbleText] = useState<string>(ANGRY_QUOTES[0]);

  useEffect(() => {
    targetProgressRef.current = isDay ? 1 : 0;
  }, [isDay]);

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 640) setSize(112);
      else if (w < 1024) setSize(148);
      else setSize(180);
    };
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const skyCanvas = skyCanvasRef.current;
    const roboCanvas = roboCanvasRef.current;
    const angryBubble = bubbleRef.current;
    if (!container || !skyCanvas || !roboCanvas || !angryBubble) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();
    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    // =========================================================================
    // 1. MOON / SUN SHADER SETUP (alpha: true feathered corner orb)
    // =========================================================================
    const gl = skyCanvas.getContext('webgl', {
      antialias: !isSoftwareGl,
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uProg = gl.getUniformLocation(program, 'u_progress');
    const uHover = gl.getUniformLocation(program, 'u_hover');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    skyCanvas.width = Math.floor(size * dpr);
    skyCanvas.height = Math.floor(size * dpr);
    gl.viewport(0, 0, skyCanvas.width, skyCanvas.height);

    // =========================================================================
    // 2. THREE.JS ASTRO-ROBO SCENE
    // =========================================================================
    const CAM_Z = 10;
    const CAM_FOV = 38;

    const renderer = new THREE.WebGLRenderer({
      canvas: roboCanvas,
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(dpr);
    renderer.setSize(size, size, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    // Procedural Studio PMREM Environment
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0a0d0a);

    const softboxMain = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 7),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(3.1, 3.2, 3.4), side: THREE.DoubleSide })
    );
    softboxMain.position.set(-5, 6, 8);
    softboxMain.lookAt(0, 0, 0);
    envScene.add(softboxMain);

    const softboxRim = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 4),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 2.8, 0.9), side: THREE.DoubleSide })
    );
    softboxRim.position.set(6, 2, -7);
    softboxRim.lookAt(0, 0, 0);
    envScene.add(softboxRim);

    const floorBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.28, 0.34, 0.3), side: THREE.DoubleSide })
    );
    floorBounce.position.set(0, -8, 0);
    floorBounce.lookAt(0, 0, 0);
    envScene.add(floorBounce);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(envScene, 0.045);
    scene.environment = envRT.texture;
    pmrem.dispose();
    disposeObjectSubtree(envScene);

    const hemiLight = new THREE.HemisphereLight(0xd8ffe0, 0x1a1a1a, 0.95);
    scene.add(hemiLight);

    const orbPointLight = new THREE.PointLight(0xb8ffd0, 2.1, 22, 1.4);
    scene.add(orbPointLight);

    const frontFillLight = new THREE.DirectionalLight(0xf2fff4, 1.2);
    frontFillLight.position.set(-2.6, 3.4, 8.2);
    scene.add(frontFillLight);

    const rimDirLight = new THREE.DirectionalLight(0x39ff14, 0.85);
    rimDirLight.position.set(4.5, 1.5, -4.5);
    scene.add(rimDirLight);

    const occluderMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 36),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true })
    );
    occluderMesh.renderOrder = -10;
    scene.add(occluderMesh);

    const { normalMap: suitNorm, roughnessMap: suitRough } = createSuitTextures();

    // Neon Lime / Red / Matte Carbon / Pearl White Suit Palette
    const helmetWhiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2f5f8,
      roughness: 0.22,
      metalness: 0.06,
      clearcoat: 0.65,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.05,
    });

    const suitFabricMat = new THREE.MeshPhysicalMaterial({
      color: 0xecedf2,
      roughness: 0.44,
      metalness: 0.03,
      normalMap: suitNorm,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughnessMap: suitRough,
      sheen: 0.4,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0xc8ffc0),
      clearcoat: 0.12,
      clearcoatRoughness: 0.35,
      envMapIntensity: 0.85,
    });

    const carbonTrimMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      roughness: 0.28,
      metalness: 0.26,
      clearcoat: 0.5,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.0,
    });

    const jointMetalMat = new THREE.MeshStandardMaterial({
      color: 0x2e333a,
      roughness: 0.32,
      metalness: 0.62,
      envMapIntensity: 1.1,
    });

    const soleDarkMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b0b0d,
      roughness: 0.48,
      metalness: 0.15,
      normalMap: suitNorm,
      normalScale: new THREE.Vector2(0.2, 0.2),
      clearcoat: 0.2,
    });

    const limeAccentMat = new THREE.MeshPhysicalMaterial({
      color: 0x39ff14,
      emissive: new THREE.Color(0x168a05),
      emissiveIntensity: 0.35,
      roughness: 0.26,
      metalness: 0.12,
      clearcoat: 0.45,
    });

    const earGlowMat = new THREE.MeshPhysicalMaterial({
      color: 0x39ff14,
      emissive: new THREE.Color(0x28c70a),
      emissiveIntensity: 0.65,
      roughness: 0.22,
      clearcoat: 0.6,
    });

    const thrusterGlowMat = new THREE.MeshStandardMaterial({
      color: 0x39ff14,
      emissive: new THREE.Color(0x39ff14),
      emissiveIntensity: 1.35,
      roughness: 0.2,
    });

    const visorDarkMat = new THREE.MeshPhysicalMaterial({
      color: 0x050706,
      roughness: 0.14,
      metalness: 0.12,
      clearcoat: 0.6,
    });

    const visorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x080c09,
      transparent: true,
      opacity: 0.24,
      roughness: 0.03,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.65,
      depthWrite: false,
    });

    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const faceCtx = faceCanvas.getContext('2d')!;
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;

    const faceScreenMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      emissiveMap: faceTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 1.75,
      transparent: true,
      roughness: 0.25,
      depthWrite: false,
    });

    const chestCanvas = document.createElement('canvas');
    chestCanvas.width = 256;
    chestCanvas.height = 160;
    const chestCtx = chestCanvas.getContext('2d')!;
    const chestTex = new THREE.CanvasTexture(chestCanvas);
    chestTex.colorSpace = THREE.SRGBColorSpace;

    const chestScreenMat = new THREE.MeshStandardMaterial({
      map: chestTex,
      emissiveMap: chestTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 1.35,
      roughness: 0.12,
    });

    const shadCanvas = document.createElement('canvas');
    shadCanvas.width = 128;
    shadCanvas.height = 128;
    const sCtx = shadCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
    sGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.7)');
    sGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.26)');
    sGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadTex = new THREE.CanvasTexture(shadCanvas);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.78,
    });

    const robotRoot = new THREE.Group();
    scene.add(robotRoot);

    const shadowDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.set(0, 0.015, 0.02);
    robotRoot.add(shadowDisc);

    const bodyGroup = new THREE.Group();
    robotRoot.add(bodyGroup);

    const angryLight = new THREE.PointLight(0xff073a, 0, 3.5);
    angryLight.position.set(0, 0.68, 0.68);
    bodyGroup.add(angryLight);

    // Torso & Pelvis
    const torsoGroup = new THREE.Group();
    bodyGroup.add(torsoGroup);

    const chestMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.265, 0.2, 20, 40), suitFabricMat);
    chestMesh.position.set(0, 0.16, 0);
    chestMesh.scale.set(1.08, 1.0, 0.94);
    torsoGroup.add(chestMesh);

    [-1, 1].forEach((side) => {
      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.016, 10, 28, Math.PI * 0.65), carbonTrimMat);
      strap.position.set(side * 0.14, 0.22, 0.03);
      strap.rotation.y = Math.PI / 2;
      strap.rotation.x = -0.35;
      torsoGroup.add(strap);
    });

    const waistRing = new THREE.Mesh(new THREE.TorusGeometry(0.258, 0.036, 18, 44), carbonTrimMat);
    waistRing.rotation.x = Math.PI / 2;
    waistRing.position.set(0, -0.01, 0);
    waistRing.scale.set(1.06, 0.94, 1);
    torsoGroup.add(waistRing);

    const beltBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 0.045), limeAccentMat);
    beltBuckle.position.set(0, -0.01, 0.245);
    torsoGroup.add(beltBuckle);

    const pelvisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.262, 36, 26), suitFabricMat);
    pelvisMesh.position.set(0, -0.1, 0);
    pelvisMesh.scale.set(1.06, 0.78, 0.94);
    torsoGroup.add(pelvisMesh);

    const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.044, 18, 44), carbonTrimMat);
    collarRing.rotation.x = Math.PI / 2;
    collarRing.position.set(0, 0.42, 0.01);
    torsoGroup.add(collarRing);

    const neckJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.1, 28), jointMetalMat);
    neckJoint.position.set(0, 0.44, 0);
    torsoGroup.add(neckJoint);

    const chestPanelGroup = new THREE.Group();
    chestPanelGroup.position.set(0, 0.17, 0.242);
    chestPanelGroup.rotation.x = -0.12;
    torsoGroup.add(chestPanelGroup);

    const panelFrame = new THREE.Mesh(new THREE.BoxGeometry(0.255, 0.16, 0.036), carbonTrimMat);
    chestPanelGroup.add(panelFrame);

    const panelScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.165, 0.105), chestScreenMat);
    panelScreen.position.set(-0.022, 0, 0.019);
    chestPanelGroup.add(panelScreen);

    const panelGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.175, 0.112), visorGlassMat);
    panelGlass.position.set(-0.022, 0, 0.021);
    chestPanelGroup.add(panelGlass);

    const panelButton = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.018, 22), limeAccentMat);
    panelButton.rotation.x = Math.PI / 2;
    panelButton.position.set(0.088, 0.014, 0.016);
    chestPanelGroup.add(panelButton);

    const panelLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), thrusterGlowMat);
    panelLed.position.set(0.088, -0.034, 0.019);
    chestPanelGroup.add(panelLed);

    // Backpack
    const backpackGroup = new THREE.Group();
    backpackGroup.position.set(0, 0.15, -0.27);
    torsoGroup.add(backpackGroup);

    const packUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.12, 16, 32), helmetWhiteMat);
    packUpper.position.set(0, 0.11, 0);
    packUpper.scale.set(1.18, 0.86, 0.72);
    backpackGroup.add(packUpper);

    const packLower = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.12, 16, 32), helmetWhiteMat);
    packLower.position.set(0, -0.09, 0);
    packLower.scale.set(1.18, 0.86, 0.72);
    backpackGroup.add(packLower);

    const packBand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.034, 0.24), carbonTrimMat);
    packBand.position.set(0, 0.01, 0.01);
    backpackGroup.add(packBand);

    [-1, 1].forEach((side) => {
      const latch = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.07, 10, 18), soleDarkMat);
      latch.position.set(side * 0.21, 0.08, 0.01);
      backpackGroup.add(latch);

      const latchLow = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.06, 10, 18), soleDarkMat);
      latchLow.position.set(side * 0.21, -0.08, 0.01);
      backpackGroup.add(latchLow);

      const nozzleRim = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.064, 0.06, 22), jointMetalMat);
      nozzleRim.position.set(side * 0.1, -0.26, -0.01);
      backpackGroup.add(nozzleRim);

      const nozzleGlow = new THREE.Mesh(new THREE.SphereGeometry(0.044, 16, 12), thrusterGlowMat);
      nozzleGlow.position.set(side * 0.1, -0.29, -0.01);
      nozzleGlow.scale.set(1, 0.55, 1);
      backpackGroup.add(nozzleGlow);
    });

    // Head, Helmet, Visor & Headphones
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.45, 0);
    bodyGroup.add(headGroup);

    const helmetOuter = new THREE.Mesh(new THREE.SphereGeometry(0.455, 48, 36), helmetWhiteMat);
    helmetOuter.position.set(0, 0.34, -0.02);
    helmetOuter.scale.set(1.06, 0.96, 1.02);
    headGroup.add(helmetOuter);

    const visorBezel = new THREE.Mesh(new THREE.TorusGeometry(0.335, 0.045, 22, 48), helmetWhiteMat);
    visorBezel.position.set(0, 0.32, 0.24);
    visorBezel.scale.set(1.08, 0.92, 0.9);
    headGroup.add(visorBezel);

    const visorInnerTrim = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.016, 16, 44), jointMetalMat);
    visorInnerTrim.position.set(0, 0.32, 0.26);
    visorInnerTrim.scale.set(1.08, 0.92, 0.9);
    headGroup.add(visorInnerTrim);

    const visorDark = new THREE.Mesh(new THREE.SphereGeometry(0.415, 40, 32), visorDarkMat);
    visorDark.position.set(0, 0.32, 0.1);
    visorDark.scale.set(1.04, 0.9, 0.85);
    headGroup.add(visorDark);

    const facePatch = new THREE.Mesh(
      new THREE.SphereGeometry(0.419, 36, 24, Math.PI / 2 - 0.66, 1.32, Math.PI / 2 - 0.46, 0.92),
      faceScreenMat
    );
    facePatch.position.set(0, 0.32, 0.101);
    facePatch.scale.set(1.04, 0.9, 0.85);
    facePatch.renderOrder = 2;
    headGroup.add(facePatch);

    const visorGlass = new THREE.Mesh(new THREE.SphereGeometry(0.425, 40, 32), visorGlassMat);
    visorGlass.position.set(0, 0.32, 0.102);
    visorGlass.scale.set(1.04, 0.9, 0.85);
    visorGlass.renderOrder = 3;
    headGroup.add(visorGlass);

    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(0.49, 0.044, 18, 48, Math.PI * 1.04),
      carbonTrimMat
    );
    headband.position.set(0, 0.34, -0.02);
    headband.rotation.z = -Math.PI * 0.02;
    headband.rotation.x = -0.14;
    headGroup.add(headband);

    [-1, 1].forEach((side) => {
      const earCupGroup = new THREE.Group();
      earCupGroup.position.set(side * 0.475, 0.31, -0.02);
      headGroup.add(earCupGroup);

      const cupBase = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.155, 0.085, 32), carbonTrimMat);
      cupBase.rotation.z = Math.PI / 2;
      earCupGroup.add(cupBase);

      const cupHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.095, 18), jointMetalMat);
      cupHinge.rotation.z = Math.PI / 2;
      cupHinge.position.set(-side * 0.015, 0.12, 0);
      earCupGroup.add(cupHinge);

      const cupRing = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.025, 16, 32), helmetWhiteMat);
      cupRing.rotation.y = Math.PI / 2;
      cupRing.position.x = side * 0.02;
      earCupGroup.add(cupRing);

      const cupPad = new THREE.Mesh(new THREE.SphereGeometry(0.132, 24, 18), earGlowMat);
      cupPad.scale.set(0.38, 1, 1);
      cupPad.position.x = side * 0.042;
      earCupGroup.add(cupPad);
    });

    // Articulated Arms & 5-finger Hands
    function buildArm(side: number) {
      const armRoot = new THREE.Group();
      armRoot.position.set(side * 0.31, 0.33, 0.01);
      bodyGroup.add(armRoot);

      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.104, 22, 16), suitFabricMat);
      armRoot.add(shoulder);

      const shoulderJointRing = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.016, 12, 24), jointMetalMat);
      shoulderJointRing.rotation.y = Math.PI / 2;
      shoulderJointRing.position.set(-side * 0.04, 0, 0);
      armRoot.add(shoulderJointRing);

      const shoulderPatch = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.026, 8, 14), limeAccentMat);
      shoulderPatch.position.set(side * 0.095, -0.04, 0.01);
      shoulderPatch.rotation.z = side * 0.4;
      armRoot.add(shoulderPatch);

      const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.14, 14, 24), suitFabricMat);
      upperArm.position.set(0, -0.11, 0);
      armRoot.add(upperArm);

      const elbowPivot = new THREE.Group();
      elbowPivot.position.set(0, -0.21, 0);
      armRoot.add(elbowPivot);

      const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.072, 16, 12), jointMetalMat);
      elbowPivot.add(elbowJoint);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.13, 14, 24), suitFabricMat);
      forearm.position.set(0, -0.1, 0);
      elbowPivot.add(forearm);

      const wristCuff = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.026, 14, 28), carbonTrimMat);
      wristCuff.rotation.x = Math.PI / 2;
      wristCuff.position.set(0, -0.18, 0);
      elbowPivot.add(wristCuff);

      const handGroup = new THREE.Group();
      handGroup.position.set(0, -0.23, 0.01);
      elbowPivot.add(handGroup);

      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 14), suitFabricMat);
      palm.scale.set(0.92, 0.95, 0.72);
      handGroup.add(palm);

      const fingerList: THREE.Group[] = [];
      for (let f = 0; f < 4; f++) {
        const fPivot = new THREE.Group();
        const fOffset = (f - 1.5) * 0.03;
        fPivot.position.set(fOffset * 0.35, -0.048, fOffset * 0.75);
        handGroup.add(fPivot);

        const fingerMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.044, 8, 12), suitFabricMat);
        fingerMesh.position.set(0, -0.026, 0);
        fPivot.add(fingerMesh);
        fingerList.push(fPivot);
      }

      const thumbPivot = new THREE.Group();
      thumbPivot.position.set(-side * 0.042, -0.012, 0.046);
      handGroup.add(thumbPivot);

      const thumbMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.038, 8, 12), suitFabricMat);
      thumbMesh.position.set(0, -0.022, 0.01);
      thumbMesh.rotation.set(0.45, 0, side * 0.38);
      thumbPivot.add(thumbMesh);

      return { armRoot, elbowPivot, fingerList, thumbPivot };
    }

    const leftArm = buildArm(-1);
    const rightArm = buildArm(1);

    function buildLeg(side: number) {
      const hipRoot = new THREE.Group();
      hipRoot.position.set(side * 0.155, -0.15, 0.01);
      bodyGroup.add(hipRoot);

      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), jointMetalMat);
      hipRoot.add(hipJoint);

      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.106, 0.16, 14, 24), suitFabricMat);
      thigh.position.set(0, -0.12, 0);
      hipRoot.add(thigh);

      const kneeBand = new THREE.Mesh(new THREE.TorusGeometry(0.104, 0.022, 12, 28), carbonTrimMat);
      kneeBand.rotation.x = Math.PI / 2;
      kneeBand.position.set(0, -0.21, 0);
      hipRoot.add(kneeBand);

      const kneePivot = new THREE.Group();
      kneePivot.position.set(0, -0.23, 0);
      hipRoot.add(kneePivot);

      const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 12), jointMetalMat);
      kneePivot.add(kneeJoint);

      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.102, 0.15, 14, 24), suitFabricMat);
      shin.position.set(0, -0.11, 0);
      kneePivot.add(shin);

      const ankleCuff = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.03, 14, 28), carbonTrimMat);
      ankleCuff.rotation.x = Math.PI / 2;
      ankleCuff.position.set(0, -0.2, 0);
      kneePivot.add(ankleCuff);

      const footPivot = new THREE.Group();
      footPivot.position.set(0, -0.23, 0);
      kneePivot.add(footPivot);

      const bootUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.102, 0.13, 14, 24), helmetWhiteMat);
      bootUpper.rotation.x = Math.PI / 2;
      bootUpper.position.set(0, -0.035, 0.065);
      bootUpper.scale.set(1.06, 1.0, 0.84);
      footPivot.add(bootUpper);

      const bootToeCap = new THREE.Mesh(new THREE.SphereGeometry(0.086, 18, 14), carbonTrimMat);
      bootToeCap.position.set(0, -0.048, 0.135);
      bootToeCap.scale.set(1.12, 0.65, 0.85);
      footPivot.add(bootToeCap);

      const bootSole = new THREE.Mesh(new THREE.CapsuleGeometry(0.106, 0.14, 14, 24), soleDarkMat);
      bootSole.rotation.x = Math.PI / 2;
      bootSole.position.set(0, -0.075, 0.068);
      bootSole.scale.set(1.1, 1.02, 0.48);
      footPivot.add(bootSole);

      return { hipRoot, kneePivot, footPivot };
    }

    const leftLeg = buildLeg(-1);
    const rightLeg = buildLeg(1);

    const robotHitMeshes: THREE.Object3D[] = [];
    robotRoot.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj !== visorGlass && obj !== shadowDisc && obj !== panelGlass) {
        robotHitMeshes.push(obj);
      }
    });

    const sparkGeo = new THREE.SphereGeometry(0.042, 8, 8);
    const sparks = Array.from({ length: 16 }, () => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff073a,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(sparkGeo, mat);
      scene.add(mesh);
      return {
        mesh,
        mat,
        life: Math.random(),
        vx: (Math.random() - 0.5) * 0.75,
        vy: 0.75 + Math.random() * 0.85,
        vz: (Math.random() - 0.5) * 0.75,
      };
    });

    // =========================================================================
    // 3. FACE & CHEST SCREEN OLED TEXTURE HELPERS
    // =========================================================================
    function updateFaceTexture(
      time: number,
      angryAmt: number,
      blinkAmt: number,
      lookX: number,
      lookY: number,
      hoverAlert: number
    ) {
      faceCtx.clearRect(0, 0, 512, 512);

      // Calm = Neon Lime (#39FF14 = 57,255,20), Angry = Neon Red (#FF073A = 255,7,58)
      const r = Math.round(57 + (255 - 57) * angryAmt);
      const g = Math.round(255 + (7 - 255) * angryAmt);
      const b = Math.round(20 + (58 - 20) * angryAmt);
      const mainColor = `rgb(${r},${g},${b})`;
      const coreColor = angryAmt > 0.5 ? 'rgba(255, 196, 208, 0.94)' : 'rgba(220, 255, 210, 0.95)';

      faceCtx.save();
      faceCtx.translate(256 + lookX * 26, 252 + lookY * 18);

      const openY = Math.max(0.08, (1.0 - blinkAmt * 0.92) * (1.0 - angryAmt * 0.25 + hoverAlert * 0.14));
      const eyeW = 36 * (1 + hoverAlert * 0.1);
      const eyeH = 48 * openY;

      faceCtx.shadowColor = mainColor;
      faceCtx.shadowBlur = 28 + angryAmt * 14;

      [-78, 78].forEach((ex, idx) => {
        const side = idx === 0 ? -1 : 1;
        faceCtx.save();
        faceCtx.translate(ex, -12);

        if (angryAmt > 0.08) {
          faceCtx.rotate(side * angryAmt * 0.28);
        }

        faceCtx.fillStyle = mainColor;
        faceCtx.beginPath();
        faceCtx.ellipse(0, 0, eyeW, eyeH, 0, 0, Math.PI * 2);
        faceCtx.fill();

        faceCtx.fillStyle = coreColor;
        faceCtx.beginPath();
        faceCtx.ellipse(0, 0, eyeW * 0.56, eyeH * 0.56, 0, 0, Math.PI * 2);
        faceCtx.fill();

        if (angryAmt > 0.12) {
          faceCtx.globalCompositeOperation = 'destination-out';
          faceCtx.fillStyle = '#000';
          faceCtx.beginPath();
          faceCtx.moveTo(-eyeW * 1.4, -eyeH * 1.3);
          faceCtx.lineTo(eyeW * 1.4, -eyeH * 1.3);
          faceCtx.lineTo(eyeW * 1.4, -eyeH * (0.35 - side * 0.35 * angryAmt));
          faceCtx.lineTo(-eyeW * 1.4, -eyeH * (0.35 + side * 0.35 * angryAmt));
          faceCtx.closePath();
          faceCtx.fill();
          faceCtx.globalCompositeOperation = 'source-over';
        }

        faceCtx.restore();

        if (angryAmt > 0.15) {
          faceCtx.save();
          faceCtx.globalAlpha = Math.min(1, angryAmt * 1.2);
          faceCtx.strokeStyle = mainColor;
          faceCtx.lineWidth = 13;
          faceCtx.lineCap = 'round';
          faceCtx.beginPath();
          faceCtx.moveTo(ex - side * 42, -74);
          faceCtx.lineTo(ex + side * 26, -50);
          faceCtx.stroke();
          faceCtx.restore();
        }
      });

      faceCtx.strokeStyle = mainColor;
      faceCtx.lineCap = 'round';
      faceCtx.lineJoin = 'round';
      faceCtx.lineWidth = 11;

      if (angryAmt > 0.35) {
        const shake = Math.sin(time * 26) * 2.5 * angryAmt;
        faceCtx.beginPath();
        faceCtx.moveTo(-46, 68 + shake);
        faceCtx.lineTo(-22, 54);
        faceCtx.lineTo(0, 68 - shake);
        faceCtx.lineTo(22, 54);
        faceCtx.lineTo(46, 68 + shake);
        faceCtx.stroke();
      } else if (hoverAlert > 0.35 && angryAmt < 0.2) {
        faceCtx.fillStyle = mainColor;
        faceCtx.beginPath();
        faceCtx.ellipse(0, 56, 16, 19 * hoverAlert + 4, 0, 0, Math.PI * 2);
        faceCtx.fill();
      } else {
        const curve = 24 * (1 - angryAmt * 2.2);
        faceCtx.beginPath();
        faceCtx.moveTo(-36, 50);
        faceCtx.quadraticCurveTo(0, 50 + curve, 36, 50);
        faceCtx.stroke();
      }

      faceCtx.restore();
      faceTex.needsUpdate = true;
    }

    function updateChestTexture(time: number, angryAmt: number) {
      chestCtx.fillStyle = angryAmt > 0.5 ? '#21040b' : '#0b1409';
      chestCtx.fillRect(0, 0, 256, 160);

      const col = angryAmt > 0.5 ? '#FF073A' : '#39FF14';
      chestCtx.strokeStyle = col;
      chestCtx.fillStyle = col;
      chestCtx.lineWidth = 5;
      chestCtx.shadowColor = col;
      chestCtx.shadowBlur = 12;

      for (let i = 0; i < 8; i++) {
        const speed = angryAmt > 0.5 ? 14 : 5;
        const h = 24 + Math.abs(Math.sin(time * speed + i * 0.9)) * 74;
        chestCtx.fillRect(22 + i * 27, 130 - h, 15, h);
      }
      chestTex.needsUpdate = true;
    }

    // =========================================================================
    // 4. INTERACTIVE STATE & PRE-ALLOCATED VECTORS (ZERO GC)
    // =========================================================================
    let progress = targetProgressRef.current;
    let orbHover = 0;
    let targetOrbHover = 0;

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const pointerNDC = new THREE.Vector2(99, 99);
    const raycaster = new THREE.Raycaster();

    let isRobotHovered = false;
    let isRobotAngry = false;
    let angryTimer = 0;
    let angryClicks = 0;
    let angryBlend = 0;
    let hoverAlert = 0;
    let hoverCooldown = 0;
    let angerBurst = 0;

    const posDir = new THREE.Vector3(-0.3, 0.58, 0.76).normalize();
    const moveDir = new THREE.Vector3(0.88, 0.25, 0.18);
    moveDir.addScaledVector(posDir, -moveDir.dot(posDir)).normalize();

    let pendingTurnAngle = 0;
    let turnBank = 0;
    let walkPhase = 0;
    let blinkTimer = 2.2;
    let blinkAmt = 0;

    const rotAxis = new THREE.Vector3();
    const basisRight = new THREE.Vector3();
    const basisMat = new THREE.Matrix4();
    const targetQuat = new THREE.Quaternion();
    const surfaceUp = new THREE.Vector3();
    const walkForward = new THREE.Vector3();
    const bubbleAnchor = new THREE.Vector3();
    const invRobotQuat = new THREE.Quaternion();
    const camDirLocal = new THREE.Vector3();
    const orbCenter = new THREE.Vector3();
    const worldHead = new THREE.Vector3();

    const nightKey = new THREE.Color(0xb8ffd0);
    const dayKey = new THREE.Color(0xffe7b8);
    const hemiNightSky = new THREE.Color(0xd8ffe0);
    const hemiDaySky = new THREE.Color(0xc4ebff);
    const hemiNightGround = new THREE.Color(0x1a1a1a);
    const hemiDayGround = new THREE.Color(0x5b462e);
    const frontNight = new THREE.Color(0xeefdf2);
    const frontDay = new THREE.Color(0xfff6e0);
    const tmpColor = new THREE.Color();

    const calmEarCol = new THREE.Color(0x39ff14);
    const angryEarCol = new THREE.Color(0xff073a);
    const calmEarEm = new THREE.Color(0x28c70a);
    const angryEarEm = new THREE.Color(0xff073a);

    const calmThrusterCol = new THREE.Color(0x39ff14);
    const angryThrusterCol = new THREE.Color(0xff073a);
    const calmThrusterEm = new THREE.Color(0x39ff14);
    const angryThrusterEm = new THREE.Color(0xff073a);

    const visH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(CAM_FOV * 0.5));
    const minVis = visH;

    const testRobotHit = (clientX: number, clientY: number) => {
      const rect = roboCanvas.getBoundingClientRect();
      if (
        rect.width <= 0 ||
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return false;
      }
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects([occluderMesh, ...robotHitMeshes], false);
      return hits.length > 0 && hits[0].object !== occluderMesh;
    };

    const testOrbHit = (clientX: number, clientY: number) => {
      const rect = roboCanvas.getBoundingClientRect();
      if (rect.width <= 0) return false;
      const dx = (clientX - rect.left) / rect.width - 0.5;
      const dy = (clientY - rect.top) / rect.height - 0.5;
      return Math.hypot(dx, dy) <= 0.29;
    };

    const steerNewDirection = () => {
      const sign = Math.random() > 0.5 ? 1 : -1;
      pendingTurnAngle += sign * (1.85 + Math.random() * 1.0);
      hoverAlert = 1.0;
      hoverCooldown = 0.65;
    };

    const onWindowPointerMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);

      const hitRobo = testRobotHit(e.clientX, e.clientY);
      const hitOrb = !hitRobo && testOrbHit(e.clientX, e.clientY);

      if (hitRobo && !isRobotHovered && hoverCooldown <= 0) {
        steerNewDirection();
      }
      isRobotHovered = hitRobo;
      targetOrbHover = hitOrb ? 1 : 0;
      setCursorMode(hitRobo || hitOrb ? 'pointer' : 'default');
    };

    const onContainerClick = (e: MouseEvent) => {
      if (testRobotHit(e.clientX, e.clientY)) {
        e.stopPropagation();
        e.preventDefault();
        isRobotAngry = true;
        angryTimer = 5.0;
        angerBurst = 1.0;
        setBubbleText(ANGRY_QUOTES[angryClicks % ANGRY_QUOTES.length]);
        angryClicks++;
        return;
      }

      if (testOrbHit(e.clientX, e.clientY)) {
        e.stopPropagation();
        toggleThemeRef.current();
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    container.addEventListener('click', onContainerClick);

    const onContextLost = (e: Event) => {
      e.preventDefault();
    };
    roboCanvas.addEventListener('webglcontextlost', onContextLost);

    let rafId = 0;
    let lastTime = performance.now();
    let animElapsed = 0;

    const render = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
      lastTime = now;

      if (!isVisibleRef.current) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const timeSec = now * 0.001;
      animElapsed += dt;

      progress += (targetProgressRef.current - progress) * (1 - Math.exp(-2.8 * dt));
      orbHover += (targetOrbHover - orbHover) * (1 - Math.exp(-7.0 * dt));
      mouse.x += (mouse.tx - mouse.x) * (1 - Math.exp(-4.5 * dt));
      mouse.y += (mouse.ty - mouse.y) * (1 - Math.exp(-4.5 * dt));

      // 1. Render Moon / Sun Shader
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, skyCanvas.width, skyCanvas.height);
      gl.uniform1f(uTime, timeSec);
      gl.uniform1f(uProg, progress);
      gl.uniform1f(uHover, orbHover);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // 2. Sync Occluder & Walking Astro-Robo
      const tSmooth = progress * progress * (3 - 2 * progress);
      const breath = 1.0 + 0.035 * tSmooth + 0.012 * orbHover + 0.015 * Math.sin(tSmooth * Math.PI);

      const rProj = 0.225 * breath * minVis;
      const rSphere = (rProj * CAM_Z) / Math.sqrt(CAM_Z * CAM_Z + rProj * rProj);
      orbCenter.set(mouse.x * 0.006 * minVis, mouse.y * 0.006 * minVis, 0);

      occluderMesh.position.copy(orbCenter);
      occluderMesh.scale.setScalar(rSphere * 0.996);

      orbPointLight.color.copy(nightKey).lerp(dayKey, tSmooth);
      orbPointLight.intensity = 2.0 + 1.5 * tSmooth;
      orbPointLight.position.copy(orbCenter);

      hemiLight.color.copy(hemiNightSky).lerp(hemiDaySky, tSmooth);
      hemiLight.groundColor.copy(hemiNightGround).lerp(hemiDayGround, tSmooth);
      hemiLight.intensity = 0.88 + 0.42 * tSmooth;

      frontFillLight.color.copy(frontNight).lerp(frontDay, tSmooth);
      frontFillLight.intensity = 1.15 + 0.28 * tSmooth;

      if (isRobotAngry) {
        angryTimer -= dt;
        if (angryTimer <= 0) {
          isRobotAngry = false;
          angryTimer = 0;
        }
      }

      if (hoverCooldown > 0) hoverCooldown = Math.max(0, hoverCooldown - dt);
      hoverAlert = Math.max(0, hoverAlert - dt * 1.45);
      angerBurst = Math.max(0, angerBurst - dt * 1.5);

      const targetAngry = isRobotAngry ? 1.0 : 0.0;
      angryBlend += (targetAngry - angryBlend) * (1 - Math.exp(-8.5 * dt));

      if (pointerNDC.x <= 1 && pointerNDC.x >= -1 && pointerNDC.y <= 1 && pointerNDC.y >= -1) {
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObjects([occluderMesh, ...robotHitMeshes], false);
        const stillHovered = hits.length > 0 && hits[0].object !== occluderMesh;
        if (stillHovered && !isRobotHovered && hoverCooldown <= 0) {
          steerNewDirection();
        }
        isRobotHovered = stillHovered;
      }

      if (Math.abs(pendingTurnAngle) > 0.001) {
        const stepTurn = pendingTurnAngle * (1 - Math.exp(-8.5 * dt));
        pendingTurnAngle -= stepTurn;
        moveDir.applyAxisAngle(posDir, stepTurn);
        moveDir.addScaledVector(posDir, -moveDir.dot(posDir)).normalize();
        turnBank = THREE.MathUtils.clamp(stepTurn * 16, -0.35, 0.35);
      } else {
        turnBank *= Math.exp(-6.0 * dt);
      }

      const walkMoveFactor = (prefersReduced ? 0.25 : 1.0) * (1.0 - angryBlend);
      const surfaceSpeed = (0.34 + hoverAlert * 0.22) * walkMoveFactor;
      if (surfaceSpeed > 0.001) {
        rotAxis.crossVectors(posDir, moveDir).normalize();
        const dAngle = surfaceSpeed * dt;
        posDir.applyAxisAngle(rotAxis, dAngle).normalize();
        moveDir.applyAxisAngle(rotAxis, dAngle);
        moveDir.addScaledVector(posDir, -moveDir.dot(posDir)).normalize();
      }

      const robotScale = 0.72 * (minVis / 7.28);
      robotRoot.scale.setScalar(robotScale);
      robotRoot.position.copy(orbCenter).addScaledVector(posDir, rSphere);

      surfaceUp.copy(posDir);
      walkForward.copy(moveDir);
      basisRight.crossVectors(surfaceUp, walkForward).normalize();
      basisMat.makeBasis(basisRight, surfaceUp, walkForward);
      targetQuat.setFromRotationMatrix(basisMat);
      robotRoot.quaternion.slerp(targetQuat, 1 - Math.exp(-12.0 * dt));

      walkPhase += dt * (4.6 + hoverAlert * 2.2) * walkMoveFactor;

      const strideBounce = Math.abs(Math.sin(walkPhase)) * 0.052 * walkMoveFactor;
      const angryStandExtra = angryBlend * 0.04;
      const angryShake = Math.sin(timeSec * 44) * 0.028 * angerBurst;

      bodyGroup.position.set(angryShake, 0.736 + strideBounce + angryStandExtra, 0);
      bodyGroup.rotation.x = 0.06 * walkMoveFactor - 0.06 * angryBlend;
      bodyGroup.rotation.z = turnBank + Math.cos(walkPhase) * 0.045 * walkMoveFactor;

      const swingL = Math.sin(walkPhase);
      const swingR = Math.sin(walkPhase + Math.PI);

      leftLeg.hipRoot.rotation.x = THREE.MathUtils.lerp(swingL * 0.46, -0.05, angryBlend);
      rightLeg.hipRoot.rotation.x = THREE.MathUtils.lerp(swingR * 0.46, -0.05, angryBlend);
      leftLeg.hipRoot.rotation.z = THREE.MathUtils.lerp(-0.04, -0.14, angryBlend);
      rightLeg.hipRoot.rotation.z = THREE.MathUtils.lerp(0.04, 0.14, angryBlend);

      leftLeg.kneePivot.rotation.x = THREE.MathUtils.lerp(Math.max(0, -swingL) * 0.62 + 0.06, 0.08, angryBlend);
      rightLeg.kneePivot.rotation.x = THREE.MathUtils.lerp(Math.max(0, -swingR) * 0.62 + 0.06, 0.08, angryBlend);

      leftLeg.footPivot.rotation.x = THREE.MathUtils.lerp(swingL * -0.18, 0.0, angryBlend);
      rightLeg.footPivot.rotation.x = THREE.MathUtils.lerp(swingR * -0.18, 0.0, angryBlend);

      const angryArmX = -0.45 - Math.sin(timeSec * 10) * 0.08 * angryBlend;
      leftArm.armRoot.rotation.x = THREE.MathUtils.lerp(swingR * 0.38, angryArmX, angryBlend);
      rightArm.armRoot.rotation.x = THREE.MathUtils.lerp(swingL * 0.38, angryArmX, angryBlend);
      leftArm.armRoot.rotation.z = THREE.MathUtils.lerp(-0.14, -0.38 - angerBurst * 0.22, angryBlend);
      rightArm.armRoot.rotation.z = THREE.MathUtils.lerp(0.14, 0.38 + angerBurst * 0.22, angryBlend);

      leftArm.elbowPivot.rotation.x = THREE.MathUtils.lerp(-0.36, -1.35, angryBlend);
      rightArm.elbowPivot.rotation.x = THREE.MathUtils.lerp(-0.36, -1.35, angryBlend);

      const fingerCurl = 0.22 + angryBlend * 1.15;
      for (let i = 0; i < leftArm.fingerList.length; i++) {
        leftArm.fingerList[i].rotation.x = -fingerCurl;
        rightArm.fingerList[i].rotation.x = -fingerCurl;
      }
      leftArm.thumbPivot.rotation.z = -0.25 - angryBlend * 0.75;
      rightArm.thumbPivot.rotation.z = 0.25 + angryBlend * 0.75;

      invRobotQuat.copy(robotRoot.quaternion).invert();
      camDirLocal.copy(camera.position).sub(robotRoot.position).normalize().applyQuaternion(invRobotQuat);
      const camYaw = THREE.MathUtils.clamp(Math.atan2(camDirLocal.x, camDirLocal.z), -0.95, 0.95);
      const camPitch = THREE.MathUtils.clamp(
        -Math.asin(THREE.MathUtils.clamp(camDirLocal.y, -0.8, 0.8)) * 0.45,
        -0.32,
        0.32
      );

      const musicNod = Math.sin(timeSec * 3.6) * 0.05 * (1 - angryBlend);
      const angryHeadShake = Math.sin(timeSec * 26) * 0.14 * angerBurst;

      headGroup.rotation.x = THREE.MathUtils.lerp(musicNod - hoverAlert * 0.08, camPitch + 0.08, angryBlend);
      headGroup.rotation.y = THREE.MathUtils.lerp(Math.sin(timeSec * 1.5) * 0.12, camYaw, angryBlend) + angryHeadShake;
      headGroup.rotation.z = Math.sin(timeSec * 1.9) * 0.04 * (1 - angryBlend);

      shadowMat.opacity = 0.75 * (1 - strideBounce * 3.0);
      shadowDisc.scale.setScalar(1.0 + angryBlend * 0.14);

      const pulse = 0.5 + 0.5 * Math.sin(timeSec * 10);
      earGlowMat.color.copy(calmEarCol).lerp(angryEarCol, angryBlend);
      earGlowMat.emissive.copy(calmEarEm).lerp(angryEarEm, angryBlend);
      earGlowMat.emissiveIntensity = 0.55 + angryBlend * (0.95 + 0.45 * pulse);

      thrusterGlowMat.color.copy(calmThrusterCol).lerp(angryThrusterCol, angryBlend);
      thrusterGlowMat.emissive.copy(calmThrusterEm).lerp(angryThrusterEm, angryBlend);
      thrusterGlowMat.emissiveIntensity = 1.2 + angryBlend * 1.1;

      limeAccentMat.color.copy(calmEarCol).lerp(angryEarCol, angryBlend);
      limeAccentMat.emissive.copy(calmEarEm).lerp(angryEarEm, angryBlend);

      tmpColor.setHex(0x39ff14).lerp(angryEarCol, angryBlend);
      rimDirLight.color.copy(tmpColor);

      angryLight.intensity = angryBlend * (1.4 + 0.6 * pulse);

      blinkTimer -= dt;
      if (blinkTimer <= 0) {
        blinkTimer = 2.6 + Math.random() * 2.8;
        blinkAmt = 1.0;
      }
      if (blinkAmt > 0) {
        blinkAmt = Math.max(0, blinkAmt - dt * 7.5);
      }

      const lookX = mouse.x * 0.35 * (1 - angryBlend) + Math.sin(animElapsed * 1.3) * 0.14 * (1 - angryBlend);
      const lookY = mouse.y * -0.25 * (1 - angryBlend);
      updateFaceTexture(timeSec, angryBlend, blinkAmt, lookX, lookY, hoverAlert);
      updateChestTexture(timeSec, angryBlend);

      robotRoot.updateMatrixWorld(true);
      if (angryBlend > 0.02) {
        bubbleAnchor.set(0, 1.92, 0.05).applyMatrix4(robotRoot.matrixWorld);
        bubbleAnchor.project(camera);

        const bx = THREE.MathUtils.clamp((bubbleAnchor.x * 0.5 + 0.5) * size, 20, size - 16);
        const by = THREE.MathUtils.clamp((-bubbleAnchor.y * 0.5 + 0.5) * size, 6, size - 24);
        const popScale = 0.78 + 0.22 * angryBlend + Math.sin(angerBurst * Math.PI) * 0.12;

        angryBubble.style.opacity = String(Math.min(1, angryBlend * 1.15));
        angryBubble.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0) translate(-72%, -100%) scale(${popScale.toFixed(3)})`;
      } else {
        angryBubble.style.opacity = '0';
      }

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        if (angryBlend > 0.15) {
          s.life += dt * (1.25 + i * 0.04);
          if (s.life > 1) {
            s.life = 0;
            worldHead.set(0, 1.6, 0).applyMatrix4(robotRoot.matrixWorld);
            s.mesh.position.set(
              worldHead.x + (Math.random() - 0.5) * 0.55 * robotScale,
              worldHead.y + (Math.random() - 0.5) * 0.55 * robotScale,
              worldHead.z + (Math.random() - 0.5) * 0.55 * robotScale
            );
          } else {
            s.mesh.position.addScaledVector(posDir, s.vy * dt * robotScale);
            s.mesh.position.x += s.vx * dt * robotScale;
            s.mesh.position.z += s.vz * dt * robotScale;
          }
          s.mesh.scale.setScalar(robotScale * (1 - s.life) * 0.95);
          s.mat.opacity = Math.sin(s.life * Math.PI) * angryBlend * 0.9;
        } else {
          s.mat.opacity = Math.max(0, s.mat.opacity - dt * 3);
        }
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onWindowPointerMove);
      container.removeEventListener('click', onContainerClick);
      roboCanvas.removeEventListener('webglcontextlost', onContextLost);

      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);

      sparkGeo.dispose();
      envRT.dispose();
      disposeObjectSubtree(scene);
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      aria-pressed={isDay}
      aria-label={
        isDay
          ? 'Sun orb active (Day mode). Click orb to switch to Night mode, or poke the astro-robot.'
          : 'Moon orb active (Night mode). Click orb to switch to Day mode, or poke the astro-robot.'
      }
      title={isDay ? 'Click orb for Night Sky · Poke robot!' : 'Click orb for Day Sky · Poke robot!'}
      style={{ width: size, height: size, cursor: cursorMode }}
      className={`select-none pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39FF14]/80 rounded-full ${className || 'relative'}`}
    >
      <canvas
        ref={skyCanvasRef}
        style={{ width: size, height: size }}
        className="absolute inset-0 block pointer-events-none"
      />
      <canvas
        ref={roboCanvasRef}
        style={{ width: size, height: size }}
        className="absolute inset-0 block pointer-events-none z-10"
      />
      {/* 3D-tracked Angry Speech Bubble (no backdrop-filter over WebGL) */}
      <div
        ref={bubbleRef}
        role="status"
        aria-live="polite"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute top-0 left-0 z-20 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border-[1.5px] border-[#FF073A] text-white text-xs font-semibold tracking-wide whitespace-nowrap shadow-[0_10px_28px_rgba(0,0,0,0.65),0_0_20px_rgba(255,7,58,0.4)] origin-[72%_100%]"
      >
        {bubbleText}
        <span
          aria-hidden="true"
          className="absolute left-[72%] -bottom-1.5 w-2.5 h-2.5 -translate-x-1/2 rotate-45 bg-[#1A1A1A] border-r-[1.5px] border-b-[1.5px] border-[#FF073A]"
        />
      </div>
    </div>
  );
};
