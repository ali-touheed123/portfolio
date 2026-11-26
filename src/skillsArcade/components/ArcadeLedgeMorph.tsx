import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSkyTheme } from '../../context/ThemeContext';
import { useIsInViewport } from '../../hooks/useIsInViewport';
import { detectSoftwareWebGL, disposeObjectSubtree } from '../../utils/webgl';
import { mediaUrl } from '../../config/media';

const DEPTH_3D = 24;
const REMOVE_WHITE_BG = true;
const MAGNET_RADIUS = 42;
const MAGNET_PULL = 0.4;
const CAMERA_FOV = 45;

// Seat/hands horizontal line in character.png (y = 282 / 480 = 0.5875 from top)
// Matches the exact perched proportions over the arcade bezel
const CHAR_MAX_DIM = 480;
const VIRTUAL_STAGE_HEIGHT = 480;
const SEAT_CENTER_OFFSET_RATIO = 0.0875; // (282 - 240) / 480 = 0.0875 of rendered character box height

interface SampledPoint {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
}

interface ArcadeLedgeMorphProps {
  /** Ref to the full Skills section <main> container */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** Ref to the inner reveal wrapper (header + arcade frame) */
  revealContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to the arcade frame wrapper whose top border acts as the seat ledge */
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

function loadImageFromSrc(src: string, fallbackSrc?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const tryLoad = (url: string, isFallback: boolean) => {
      const img = new Image();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (!isFallback && fallbackSrc && fallbackSrc !== url) {
          tryLoad(fallbackSrc, true);
        } else {
          reject(new Error(`Failed to load image from ${url}`));
        }
      };
      img.src = url;
    };

    tryLoad(src, false);
  });
}

function createCircleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.78, 'rgba(255,255,255,0.96)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function extractCharacterColor(
  r255: number,
  g255: number,
  b255: number
): [number, number, number] {
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC > 0 ? (maxC - minC) / maxC : 0;

  // Preserve 100% natural true colors for skin, curly hair, black hoodie, pants and shoes.
  // Only enhance extreme outer rim saturation slightly for vibrant atmospheric backlight integration.
  const isCyanRim = b > r * 1.35 && g > r * 1.25 && sat > 0.45;
  const isPurpleRim = r > g * 1.35 && b > g * 1.35 && sat > 0.45;

  if (isCyanRim) {
    return [Math.max(0.08, r), Math.min(1.0, g * 1.12), Math.min(1.0, b * 1.08)];
  }
  if (isPurpleRim) {
    return [Math.min(1.0, r * 1.12), Math.max(0.06, g), Math.min(1.0, b * 1.1)];
  }

  return [r, g, b];
}

function sampleCharacterPoints(img: HTMLImageElement, maxDim: number): SampledPoint[] {
  const scale = Math.min(maxDim / img.width, maxDim / img.height);
  const w = Math.max(1, Math.floor(img.width * scale));
  const h = Math.max(1, Math.floor(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h).data;
  const pts: SampledPoint[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r255 = data[i];
      const g255 = data[i + 1];
      const b255 = data[i + 2];
      const a = data[i + 3];

      if (a < 40) continue;
      if (REMOVE_WHITE_BG && r255 > 238 && g255 > 238 && b255 > 238) continue;

      const px = x - w / 2;
      const py = -(y - h / 2);

      const lum = (0.299 * r255 + 0.587 * g255 + 0.114 * b255) / 255;
      const distFromCenter = Math.hypot(px / (w / 2), py / (h / 2));
      // Smooth subtle planar depth without random jitter for pristine facial feature clarity
      const zFactor = Math.max(0, 1 - distFromCenter * 0.5) * 0.35 + lum * 0.15;
      const pz = zFactor * 12 - 5;

      const [r, g, b] = extractCharacterColor(r255, g255, b255);
      // Double sub-pixel density yields ~70,000 micro-particles with zero gap coverage
      pts.push({ x: px - 0.22, y: py + 0.22, z: pz, r, g, b });
      pts.push({ x: px + 0.22, y: py - 0.22, z: pz, r, g, b });
    }
  }
  return pts;
}

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export const ArcadeLedgeMorph: React.FC<ArcadeLedgeMorphProps> = ({
  sectionRef,
  revealContainerRef,
  anchorRef,
}) => {
  const { isDay } = useSkyTheme();
  const isDayRef = useRef<boolean>(isDay);
  isDayRef.current = isDay;

  const hostRef = useRef<HTMLDivElement>(null);
  const isInViewport = useIsInViewport(sectionRef, '300px');
  const isActiveRef = useRef<boolean>(isInViewport);
  isActiveRef.current = isInViewport;

  const targetScrollRef = useRef<number>(0);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  useEffect(() => {
    const host = hostRef.current;
    const sectionEl = sectionRef.current;
    const revealEl = revealContainerRef.current;
    const anchorEl = anchorRef.current;
    if (!host || !sectionEl || !revealEl || !anchorEl) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();
    const maxParticles = isSoftwareGl ? 35000 : 75000;

    let width = Math.max(host.clientWidth, 1);
    let height = Math.max(host.clientHeight, 1);
    let cameraZ = height / 2 / Math.tan((CAMERA_FOV * Math.PI) / 360);

    // Dynamic target perch placement in CSS-pixel world units (at z = 0, 1 unit == 1 CSS px)
    let seatWorldX = 0;
    let charCenterWorldY = 0;
    let charUnitScale = 1;
    let currentPointSize = 3.6;

    const measureLedgePlacement = () => {
      width = Math.max(host.clientWidth, 1);
      height = Math.max(host.clientHeight, 1);
      cameraZ = height / 2 / Math.tan((CAMERA_FOV * Math.PI) / 360);

      const vw = window.innerWidth || width;
      let fracX = 0.5;
      let charBoxHeightPx = 200;

      if (vw >= 1024) {
        fracX = 0.69;
        charBoxHeightPx = 390;
      } else if (vw >= 768) {
        fracX = 0.65;
        charBoxHeightPx = 310;
      } else if (vw >= 640) {
        fracX = 0.62;
        charBoxHeightPx = 250;
      }

      // Use layout offsets (immune to CSS transform scale on revealEl)
      const frameLeftInMain = revealEl.offsetLeft + anchorEl.offsetLeft;
      const frameTopInMain = revealEl.offsetTop + anchorEl.offsetTop;
      const frameWidth = anchorEl.offsetWidth || width;

      const seatPxX = frameLeftInMain + frameWidth * fracX;
      const charCenterPxY = frameTopInMain - SEAT_CENTER_OFFSET_RATIO * charBoxHeightPx;

      seatWorldX = seatPxX - width / 2;
      charCenterWorldY = -(charCenterPxY - height / 2);
      charUnitScale = charBoxHeightPx / VIRTUAL_STAGE_HEIGHT;
      currentPointSize = vw >= 1024 ? 4.2 : vw >= 640 ? 3.6 : 3.0;
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 1, 5000);

    const updateCamera = () => {
      measureLedgePlacement();
      camera.aspect = width / Math.max(1, height);
      camera.position.set(0, 0, cameraZ);
      camera.updateProjectionMatrix();
    };
    updateCamera();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      if (revealEl) {
        revealEl.style.opacity = '1';
        revealEl.style.transform = 'none';
      }
      setWebglFailed(true);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    host.appendChild(renderer.domElement);

    const particleTexture = createCircleTexture();

    let count = 0;
    // Character local coords (centered around character center, in VIRTUAL_STAGE_HEIGHT units)
    let charLocalPos: Float32Array;
    let charCol: Float32Array;
    // Deep-space origin spreads across entire section width/height & deep negative Z
    let startPos: Float32Array;
    let startCol: Float32Array;
    let streamPhase: Float32Array;
    let streamSpeed: Float32Array;
    let swirlOffsets: Float32Array;
    let delays: Float32Array;
    let hoverOff: Float32Array;
    let accentType: Uint8Array;
    let pointsMesh: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;

    let smoothScroll = 0;
    let mouseActive = false;
    let mouseWorldX = 0;
    let mouseWorldY = 0;
    let disposed = false;
    let contextLost = false;
    let rafId = 0;

    const applySectionReveal = (scrollProgress: number) => {
      if (prefersReducedMotion || contextLost) {
        revealEl.style.opacity = '1';
        revealEl.style.transform = 'none';
        return;
      }
      // Section stays veiled while particles rush forward from deep behind (0..0.32)
      // and reveals smoothly as particles converge into the perched character (0.32..0.86)
      const revealRaw = Math.max(0, Math.min(1, (scrollProgress - 0.32) / 0.54));
      const reveal = smoothstep(revealRaw);
      revealEl.style.opacity = reveal.toFixed(3);
      const scaleVal = 0.98 + 0.02 * reveal;
      revealEl.style.transform = reveal >= 0.999 ? 'none' : `scale(${scaleVal.toFixed(4)})`;
    };

    const computeScrollProgress = () => {
      const rect = sectionEl.getBoundingClientRect();
      const vh = Math.max(window.innerHeight || 800, 1);

      // Entering Skills section (top hits 94% vh): deep-space particles rush forward
      // Scrolling into Skills section (top reaches 36% vh): particles form character & reveal section
      const startTop = vh * 0.94;
      const endTop = vh * 0.36;
      const raw = (startTop - rect.top) / Math.max(1, startTop - endTop);
      targetScrollRef.current = prefersReducedMotion ? 1 : Math.max(0, Math.min(1, raw));
    };

    const tempVec = new THREE.Vector3();
    const worldPos = new THREE.Vector3();

    const onPointerMove = (e: PointerEvent) => {
      if (!isActiveRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) {
        mouseActive = false;
        return;
      }

      mouseActive = true;
      tempVec.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
        0.5
      );
      tempVec.unproject(camera);
      tempVec.sub(camera.position).normalize();
      const dist = -camera.position.z / tempVec.z;
      worldPos.copy(camera.position).addScaledVector(tempVec, dist);
      mouseWorldX = worldPos.x;
      mouseWorldY = worldPos.y;
    };

    const onPointerOutWindow = () => {
      mouseActive = false;
    };

    const onResize = () => {
      if (disposed) return;
      updateCamera();
      renderer.setSize(width, height);
      if (pointsMesh) {
        pointsMesh.material.size = isSoftwareGl ? currentPointSize * 1.15 : currentPointSize;
      }
      computeScrollProgress();
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(host);
    resizeObserver?.observe(anchorEl);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      revealEl.style.opacity = '1';
      revealEl.style.transform = 'none';
      setWebglFailed(true);
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', onPointerOutWindow);
    window.addEventListener('scroll', computeScrollProgress, { passive: true });
    window.addEventListener('resize', onResize);

    computeScrollProgress();
    smoothScroll = targetScrollRef.current;
    applySectionReveal(smoothScroll);

    const localWebpUrl = '/assets/origin/character.webp';
    const fallbackPngUrl = '/assets/origin/character.png';

    loadImageFromSrc(localWebpUrl, fallbackPngUrl)
      .then((img) => {
        if (disposed) return;
        const cPts = sampleCharacterPoints(img, CHAR_MAX_DIM);
        if (cPts.length === 0) {
          applySectionReveal(1);
          return;
        }

        shuffleArray(cPts);

        count = Math.min(maxParticles, cPts.length);
        charLocalPos = new Float32Array(count * 3);
        charCol = new Float32Array(count * 3);
        startPos = new Float32Array(count * 3);
        startCol = new Float32Array(count * 3);
        streamPhase = new Float32Array(count);
        streamSpeed = new Float32Array(count);
        swirlOffsets = new Float32Array(count * 2);
        delays = new Float32Array(count);
        hoverOff = new Float32Array(count * 3);
        accentType = new Uint8Array(count);

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
          const cp = cPts[i];
          const i3 = i * 3;
          const i2 = i * 2;

          charLocalPos[i3] = cp.x;
          charLocalPos[i3 + 1] = cp.y;
          charLocalPos[i3 + 2] = cp.z;

          charCol[i3] = cp.r;
          charCol[i3 + 1] = cp.g;
          charCol[i3 + 2] = cp.b;

          // Deep-space origin field spread across Skills section with soft vertical bounds
          const spreadAngle = Math.random() * Math.PI * 2;
          const spreadRad = 0.08 + Math.pow(Math.random(), 0.72) * 0.92;
          startPos[i3] = Math.cos(spreadAngle) * spreadRad * (width * 0.62);
          startPos[i3 + 1] = Math.sin(spreadAngle) * spreadRad * (height * 0.44);
          startPos[i3 + 2] = -1550 + Math.random() * 1450;

          streamPhase[i] = Math.random();
          streamSpeed[i] = 0.14 + Math.random() * 0.22;

          // Mid-flight swirl vector during forward convergence
          const swirlAngle = Math.random() * Math.PI * 2;
          const swirlR = 45 + Math.random() * 145;
          swirlOffsets[i2] = Math.cos(swirlAngle) * swirlR;
          swirlOffsets[i2 + 1] = Math.sin(swirlAngle) * swirlR;

          // Vibrant deep-space neon palette: Neon Lime (#39FF14), Neon Red (#FF073A), Starlight White
          const roll = i % 10;
          if (roll < 5) {
            accentType[i] = 1; // Neon Lime
            startCol[i3] = 0.224;
            startCol[i3 + 1] = 1.0;
            startCol[i3 + 2] = 0.078;
          } else if (roll < 8) {
            accentType[i] = 2; // Neon Red
            startCol[i3] = 1.0;
            startCol[i3 + 1] = 0.027;
            startCol[i3 + 2] = 0.227;
          } else {
            accentType[i] = 0; // Crisp Starlight White
            startCol[i3] = 0.94;
            startCol[i3 + 1] = 0.97;
            startCol[i3 + 2] = 1.0;
          }

          positions[i3] = startPos[i3];
          positions[i3 + 1] = startPos[i3 + 1];
          positions[i3 + 2] = startPos[i3 + 2];

          colors[i3] = startCol[i3];
          colors[i3 + 1] = startCol[i3 + 1];
          colors[i3 + 2] = startCol[i3 + 2];

          delays[i] = Math.random() * 0.26;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          size: isSoftwareGl ? currentPointSize * 1.15 : currentPointSize,
          map: particleTexture,
          vertexColors: true,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });

        pointsMesh = new THREE.Points(geometry, material);
        pointsMesh.frustumCulled = false;
        scene.add(pointsMesh);

        computeScrollProgress();
        smoothScroll = targetScrollRef.current;
        applySectionReveal(smoothScroll);
      })
      .catch(() => {
        if (!disposed) {
          revealEl.style.opacity = '1';
          revealEl.style.transform = 'none';
          setWebglFailed(true);
        }
      });

    const startTime = performance.now();

    const animate = () => {
      if (disposed || contextLost) return;
      rafId = window.requestAnimationFrame(animate);
      if (!isActiveRef.current || !pointsMesh) return;

      const time = (performance.now() - startTime) * 0.001;
      const lerpSpeed = prefersReducedMotion ? 0.22 : 0.09;
      smoothScroll += (targetScrollRef.current - smoothScroll) * lerpSpeed;

      applySectionReveal(smoothScroll);

      const posAttr = pointsMesh.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = pointsMesh.geometry.attributes.color as THREE.BufferAttribute;
      const pos = posAttr.array as Float32Array;
      const col = colAttr.array as Float32Array;

      // Coherent whole-body subtle breathing at rest (zero relative jitter between facial pixels)
      const bodyBreatheY = prefersReducedMotion ? 0 : Math.sin(time * 1.25) * 0.42 * smoothScroll;
      const flightWiggle = prefersReducedMotion ? 0 : Math.max(0, 0.45 - smoothScroll * 0.5);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const i2 = i * 2;
        const d = delays[i];
        const rawT = Math.max(0, Math.min(1, (smoothScroll - d * 0.48) / (1 - 0.26 * 0.48)));
        const t = smoothstep(rawT);

        // Continuous forward warp stream from deep behind (-1750 -> +420) when t < 1
        const phase = prefersReducedMotion ? 0.5 : (streamPhase[i] + time * streamSpeed[i]) % 1;
        const streamZ = -1750 + phase * 2170;
        const perspectiveSpread = 0.72 + phase * 0.65;
        const originX = startPos[i3] * perspectiveSpread;
        const originY = startPos[i3 + 1] * perspectiveSpread;
        const originZ = streamZ;

        // Smoothly dim wrapped particles at tunnel loop ends and vertical canvas edges
        const edgeFade = prefersReducedMotion
          ? 1
          : Math.min(1, Math.sin(phase * Math.PI) * 1.45);
        const yNorm = Math.abs(originY) / Math.max(1, height * 0.48);
        const verticalFeather = Math.max(0, Math.min(1, 1 - (yNorm - 0.62) / 0.38));
        const combinedFade = edgeFade * verticalFeather;
        const startVisibility = combinedFade + (1 - combinedFade) * t;

        // Exact dynamic target coordinate perched on the arcade top border
        const targetX = seatWorldX + charLocalPos[i3] * charUnitScale;
        const targetY = charCenterWorldY + charLocalPos[i3 + 1] * charUnitScale + bodyBreatheY;
        const targetZ = charLocalPos[i3 + 2] * charUnitScale;

        // Helical mid-flight swirl as particles fly forward and snap into character
        const swirlAmt = prefersReducedMotion ? 0 : Math.sin(rawT * Math.PI);
        const swirlAngle = swirlAmt * 1.5;
        const sx = swirlOffsets[i2];
        const sy = swirlOffsets[i2 + 1];
        const cosA = Math.cos(swirlAngle);
        const sinA = Math.sin(swirlAngle);
        const swirlX = (sx * cosA - sy * sinA) * swirlAmt;
        const swirlY = (sx * sinA + sy * cosA) * swirlAmt;

        const baseX = originX + (targetX - originX) * t + swirlX;
        const baseY = originY + (targetY - originY) * t + swirlY;
        const baseZ = originZ + (targetZ - originZ) * t;

        const floatX = flightWiggle > 0 ? Math.sin(time * 1.2 + i * 0.01) * flightWiggle : 0;
        const floatY = flightWiggle > 0 ? Math.cos(time * 1.1 + i * 0.013) * flightWiggle : 0;

        let targetHoverX = 0;
        let targetHoverY = 0;
        let targetHoverZ = 0;
        let hoverEnergy = 0;

        if (mouseActive) {
          const dx = mouseWorldX - baseX;
          const dy = mouseWorldY - baseY;
          const dist = Math.hypot(dx, dy);

          if (dist < MAGNET_RADIUS) {
            const force = 1 - dist / MAGNET_RADIUS;
            const smoothForce = force * force;
            targetHoverX = dx * MAGNET_PULL * smoothForce;
            targetHoverY = dy * MAGNET_PULL * smoothForce;
            targetHoverZ = 22 * smoothForce;
            hoverEnergy = smoothForce * 0.55;
          }
        }

        hoverOff[i3] += (targetHoverX - hoverOff[i3]) * 0.14;
        hoverOff[i3 + 1] += (targetHoverY - hoverOff[i3 + 1]) * 0.14;
        hoverOff[i3 + 2] += (targetHoverZ - hoverOff[i3 + 2]) * 0.14;

        pos[i3] = baseX + floatX + hoverOff[i3];
        pos[i3 + 1] = baseY + floatY + hoverOff[i3 + 1];
        pos[i3 + 2] = baseZ + hoverOff[i3 + 2];

        const dayMode = isDayRef.current;
        const accent = accentType[i];
        let sr = startCol[i3];
        let sg = startCol[i3 + 1];
        let sb = startCol[i3 + 2];

        if (dayMode) {
          // Day rushing stream: Emerald #16A34A, Crimson #E11D48, Deep Slate #334155
          if (accent === 1) {
            sr = 0.086;
            sg = 0.639;
            sb = 0.29;
          } else if (accent === 2) {
            sr = 0.882;
            sg = 0.114;
            sb = 0.282;
          } else {
            sr = 0.2;
            sg = 0.255;
            sb = 0.333;
          }
        }

        const charShade = dayMode ? 1 : startVisibility;
        let r = (sr * startVisibility + (charCol[i3] - sr * startVisibility) * t) * (t > 0.99 ? 1 : 1);
        let g = (sg * startVisibility + (charCol[i3 + 1] - sg * startVisibility) * t) * (t > 0.99 ? 1 : 1);
        let b = (sb * startVisibility + (charCol[i3 + 2] - sb * startVisibility) * t) * (t > 0.99 ? 1 : 1);

        if (!dayMode) {
          r = (sr + (charCol[i3] - sr) * t) * charShade;
          g = (sg + (charCol[i3 + 1] - sg) * t) * charShade;
          b = (sb + (charCol[i3 + 2] - sb) * t) * charShade;
        } else {
          // Fade out soft deep-space specks toward horizon while keeping converged character full brightness
          const vis = 0.72 * startVisibility + 0.28 * t;
          r = sr * (1 - t) * vis + charCol[i3] * t;
          g = sg * (1 - t) * vis + charCol[i3 + 1] * t;
          b = sb * (1 - t) * vis + charCol[i3 + 2] * t;
        }

        if (hoverEnergy > 0.04) {
          if (accent === 2) {
            const hr = dayMode ? 0.882 : 1.0;
            const hg = dayMode ? 0.114 : 0.027;
            const hb = dayMode ? 0.282 : 0.227;
            r += (hr - r) * hoverEnergy;
            g += (hg - g) * hoverEnergy;
            b += (hb - b) * hoverEnergy;
          } else {
            const hr = dayMode ? 0.086 : 0.224;
            const hg = dayMode ? 0.639 : 1.0;
            const hb = dayMode ? 0.29 : 0.078;
            r += (hr - r) * hoverEnergy;
            g += (hg - g) * hoverEnergy;
            b += (hb - b) * hoverEnergy;
          }
        }

        col[i3] = r;
        col[i3 + 1] = g;
        col[i3 + 2] = b;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', onPointerOutWindow);
      window.removeEventListener('scroll', computeScrollProgress);
      window.removeEventListener('resize', onResize);
      particleTexture.dispose();
      disposeObjectSubtree(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [anchorRef, revealContainerRef, sectionRef]);

  if (webglFailed) {
    return null;
  }

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full mask-[linear-gradient(to_bottom,transparent_0%,black_11%,black_90%,transparent_100%)]"
    />
  );
};
