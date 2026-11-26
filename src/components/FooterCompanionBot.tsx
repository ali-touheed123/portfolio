import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useIsInViewport } from '../hooks/useIsInViewport';
import { detectSoftwareWebGL, disposeObjectSubtree } from '../utils/webgl';

export type BotExpression = 'happy' | 'wink' | 'curious' | 'love' | 'angry';

function createRoundedRectPlane(width: number, height: number, radius: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geo = new THREE.ShapeGeometry(shape, 28);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + width / 2) / width, (pos.getY(i) + height / 2) / height);
  }
  return geo;
}

function normalizeLatheV(geo: THREE.LatheGeometry, yMin: number, yMax: number): void {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const span = yMax - yMin;
  for (let i = 0; i < pos.count; i++) {
    const v = THREE.MathUtils.clamp((pos.getY(i) - yMin) / span, 0, 1);
    uv.setY(i, v);
  }
  uv.needsUpdate = true;
}

interface FooterCompanionBotProps {
  className?: string;
}

export const FooterCompanionBot: React.FC<FooterCompanionBotProps> = ({ className = '' }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const isInViewport = useIsInViewport(rootRef, '200px');
  const isActiveRef = useRef<boolean>(isInViewport);
  isActiveRef.current = isInViewport;

  const baseExpressionRef = useRef<BotExpression>('happy');
  const [reaction, setReaction] = useState<'idle' | 'hover' | 'angry'>('idle');
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();

    let width = Math.max(host.clientWidth, 1);
    let height = Math.max(host.clientHeight, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, width / height, 0.1, 100);
    const updateCameraDistance = (w: number, h: number) => {
      const aspect = w / Math.max(1, h);
      camera.aspect = aspect;
      const zDist = aspect < 0.88 ? 6.2 / Math.max(0.68, aspect) : 6.1;
      camera.position.set(0.25, 0.78, zDist);
      camera.updateProjectionMatrix();
    };
    updateCameraDistance(width, height);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    host.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.78;
    roomEnv.dispose();

    // Lighting — White Key + Neon Lime/Red Rim + Ground Bounce
    const keyLight = new THREE.DirectionalLight(0xfffaf5, 1.5);
    keyLight.position.set(3.5, 5.5, 4.8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(512, 512);
      keyLight.shadow.radius = 5;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x39ff14, 1.35);
    rimLight.position.set(-4.2, 2.5, -3.5);
    scene.add(rimLight);

    const bounceLight = new THREE.HemisphereLight(0xeef5ff, 0x1a1a1a, 0.55);
    scene.add(bounceLight);

    // Floating radial shadow disc under bot
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const sGrad = sCtx.createRadialGradient(128, 128, 8, 128, 128, 120);
      sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.58)');
      sGrad.addColorStop(0.55, 'rgba(57, 255, 20, 0.14)');
      sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = sGrad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.58;
    scene.add(shadowPlane);

    // OrbitControls — Drag to rotate, zero zoom/pan scroll hijacking
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.set(0, 0.25, 0);
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.68;

    // Materials — Pearl Satin + Matte Carbon (#1A1A1A) + Neon Lime (#39FF14) / Neon Red (#FF073A)
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2f4f8,
      roughness: 0.22,
      metalness: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    });

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      roughness: 0.28,
      metalness: 0.25,
      clearcoat: 0.8,
      clearcoatRoughness: 0.14,
    });

    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x262930,
      roughness: 0.36,
      metalness: 0.42,
    });

    const visorFrameMat = new THREE.MeshPhysicalMaterial({
      color: 0x070a0d,
      roughness: 0.1,
      metalness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const visorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      roughness: 0.04,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      depthWrite: false,
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xbfffb0,
      emissive: 0x39ff14,
      emissiveIntensity: 1.8,
      roughness: 0.15,
    });

    // Dynamic OLED Face Texture
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 384;
    const fCtx = faceCanvas.getContext('2d');
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;

    let lastDrawnKey = '';
    const drawFace = (expr: BotExpression, isBlinking: boolean, isHoverCheek: boolean) => {
      if (!fCtx) return;
      const drawKey = `${expr}_${isBlinking}_${isHoverCheek}`;
      if (drawKey === lastDrawnKey) return;
      lastDrawnKey = drawKey;

      const w = faceCanvas.width;
      const h = faceCanvas.height;
      const isAngry = expr === 'angry';
      const primaryColor = isAngry ? '#FF073A' : '#39FF14';
      const glowColor = isAngry ? '#ff073a' : '#27d80b';

      const bgGrad = fCtx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.65);
      bgGrad.addColorStop(0, isAngry ? '#22050b' : '#081a08');
      bgGrad.addColorStop(1, isAngry ? '#0a0204' : '#030804');
      fCtx.fillStyle = bgGrad;
      fCtx.fillRect(0, 0, w, h);

      fCtx.save();
      fCtx.strokeStyle = primaryColor;
      fCtx.fillStyle = primaryColor;
      fCtx.lineCap = 'round';
      fCtx.lineJoin = 'round';
      fCtx.shadowColor = glowColor;
      fCtx.shadowBlur = 24;

      const drawHappyEye = (cx: number, cy: number, scale = 1.0) => {
        fCtx.beginPath();
        fCtx.arc(cx, cy + 16, 46 * scale, Math.PI * 1.08, Math.PI * 1.92, false);
        fCtx.arc(cx, cy + 28, 22 * scale, Math.PI * 1.85, Math.PI * 1.15, true);
        fCtx.closePath();
        fCtx.fill();
      };

      const drawBlinkEye = (cx: number, cy: number) => {
        fCtx.lineWidth = 10;
        fCtx.beginPath();
        fCtx.moveTo(cx - 40, cy + 8);
        fCtx.quadraticCurveTo(cx, cy + 16, cx + 40, cy + 8);
        fCtx.stroke();
      };

      if (isBlinking && !isAngry) {
        drawBlinkEye(155, 165);
        drawBlinkEye(357, 165);
      } else if (expr === 'angry') {
        const drawAngryEye = (cx: number, cy: number, dir: number) => {
          fCtx.save();
          fCtx.translate(cx, cy);
          fCtx.rotate(dir * 0.28);
          fCtx.beginPath();
          fCtx.moveTo(-44, -8);
          fCtx.quadraticCurveTo(0, -14, 44, -8);
          fCtx.lineTo(38, 20);
          fCtx.quadraticCurveTo(0, 34, -38, 20);
          fCtx.closePath();
          fCtx.fill();
          fCtx.restore();

          fCtx.lineWidth = 12;
          fCtx.beginPath();
          fCtx.moveTo(cx - 46, cy - (dir > 0 ? 34 : 14));
          fCtx.lineTo(cx + 46, cy - (dir > 0 ? 14 : 34));
          fCtx.stroke();
        };
        drawAngryEye(155, 168, 1);
        drawAngryEye(357, 168, -1);
      } else if (expr === 'happy') {
        const s = isHoverCheek ? 1.07 : 1.0;
        drawHappyEye(155, 165, s);
        drawHappyEye(357, 165, s);
      } else if (expr === 'wink') {
        drawHappyEye(155, 165);
        fCtx.lineWidth = 12;
        fCtx.beginPath();
        fCtx.moveTo(318, 154);
        fCtx.lineTo(355, 174);
        fCtx.lineTo(318, 194);
        fCtx.stroke();
      } else if (expr === 'curious') {
        fCtx.beginPath();
        fCtx.ellipse(155, 165, 34, 42, 0, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.beginPath();
        fCtx.ellipse(357, 165, 28, 34, 0, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.fillStyle = '#040a05';
        fCtx.shadowBlur = 0;
        fCtx.beginPath();
        fCtx.arc(166, 152, 10, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.beginPath();
        fCtx.arc(365, 154, 8, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.fillStyle = primaryColor;
        fCtx.shadowBlur = 24;
      } else if (expr === 'love') {
        const drawHeart = (cx: number, cy: number, size: number) => {
          fCtx.beginPath();
          fCtx.moveTo(cx, cy + size * 0.7);
          fCtx.bezierCurveTo(
            cx - size * 1.4,
            cy - size * 0.2,
            cx - size * 0.7,
            cy - size * 1.2,
            cx,
            cy - size * 0.35
          );
          fCtx.bezierCurveTo(
            cx + size * 0.7,
            cy - size * 1.2,
            cx + size * 1.4,
            cy - size * 0.2,
            cx,
            cy + size * 0.7
          );
          fCtx.fill();
        };
        drawHeart(155, 172, 42);
        drawHeart(357, 172, 42);
      }

      if (isHoverCheek && !isAngry) {
        fCtx.save();
        fCtx.fillStyle = 'rgba(255, 7, 58, 0.45)';
        fCtx.shadowColor = '#FF073A';
        fCtx.shadowBlur = 18;
        fCtx.beginPath();
        fCtx.ellipse(104, 218, 22, 11, 0, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.beginPath();
        fCtx.ellipse(408, 218, 22, 11, 0, 0, Math.PI * 2);
        fCtx.fill();
        fCtx.restore();
      }

      fCtx.lineWidth = 14;
      if (isAngry) {
        fCtx.beginPath();
        fCtx.moveTo(212, 260);
        fCtx.lineTo(234, 244);
        fCtx.lineTo(256, 260);
        fCtx.lineTo(278, 244);
        fCtx.lineTo(300, 260);
        fCtx.stroke();
      } else if (expr === 'curious') {
        fCtx.beginPath();
        fCtx.arc(256, 248, 14, 0, Math.PI * 2);
        fCtx.stroke();
      } else if (isHoverCheek) {
        fCtx.beginPath();
        fCtx.arc(256, 218, 42, Math.PI * 0.16, Math.PI * 0.84);
        fCtx.stroke();
      } else {
        fCtx.beginPath();
        fCtx.arc(256, 224, 34, Math.PI * 0.22, Math.PI * 0.78);
        fCtx.stroke();
      }
      fCtx.restore();

      fCtx.fillStyle = 'rgba(0, 8, 4, 0.42)';
      for (let y = 0; y < h; y += 6) {
        fCtx.fillRect(0, y, w, 2.4);
      }
      faceTex.needsUpdate = true;
    };
    drawFace('happy', false, false);

    // Torso Texture — Pearl body + Dark Carbon yoke + crisp Neon Lime collar trim
    const torsoCanvas = document.createElement('canvas');
    torsoCanvas.width = 1024;
    torsoCanvas.height = 512;
    const tCtx = torsoCanvas.getContext('2d');
    if (tCtx) {
      tCtx.fillStyle = '#f2f4f8';
      tCtx.fillRect(0, 0, 1024, 512);

      tCtx.fillStyle = '#1A1A1A';
      tCtx.beginPath();
      tCtx.moveTo(0, 0);
      tCtx.lineTo(1024, 0);
      tCtx.lineTo(1024, 200);
      tCtx.bezierCurveTo(790, 200, 735, 325, 512, 325);
      tCtx.bezierCurveTo(289, 325, 234, 200, 0, 200);
      tCtx.closePath();
      tCtx.fill();

      tCtx.strokeStyle = 'rgba(57, 255, 20, 0.55)';
      tCtx.lineWidth = 5;
      tCtx.stroke();

      tCtx.fillStyle = '#d4dae3';
      tCtx.fillRect(0, 456, 1024, 56);
      tCtx.strokeStyle = 'rgba(26, 26, 26, 0.22)';
      tCtx.lineWidth = 3;
      tCtx.beginPath();
      tCtx.moveTo(0, 456);
      tCtx.lineTo(1024, 456);
      tCtx.stroke();
    }
    const torsoTex = new THREE.CanvasTexture(torsoCanvas);
    torsoTex.colorSpace = THREE.SRGBColorSpace;

    // Arm Texture — Pearl lower cuff + Dark Carbon upper sleeve
    const armCanvas = document.createElement('canvas');
    armCanvas.width = 256;
    armCanvas.height = 256;
    const aCtx = armCanvas.getContext('2d');
    if (aCtx) {
      aCtx.fillStyle = '#f2f4f8';
      aCtx.fillRect(0, 0, 256, 256);
      aCtx.fillStyle = '#1A1A1A';
      aCtx.fillRect(0, 0, 256, 98);
      aCtx.fillStyle = 'rgba(57, 255, 20, 0.55)';
      aCtx.fillRect(0, 96, 256, 4);
    }
    const armTex = new THREE.CanvasTexture(armCanvas);
    armTex.colorSpace = THREE.SRGBColorSpace;

    // --- Robot Assembly ---
    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    const torsoGroup = new THREE.Group();
    robotGroup.add(torsoGroup);

    const torsoPoints: THREE.Vector2[] = [];
    const torsoSegs = 40;
    const yBottom = -0.78;
    const yTop = 0.56;
    for (let i = 0; i <= torsoSegs; i++) {
      const t = i / torsoSegs;
      const angle = -Math.PI / 2 + t * Math.PI;
      const y = THREE.MathUtils.lerp(yBottom, yTop, (Math.sin(angle) + 1) / 2);
      const baseR = Math.cos(angle);
      const bulge = 0.44 + 0.21 * Math.pow(t, 0.75);
      torsoPoints.push(new THREE.Vector2(Math.max(0, baseR * bulge), y));
    }
    const torsoGeo = new THREE.LatheGeometry(torsoPoints, 64, Math.PI, Math.PI * 2);
    normalizeLatheV(torsoGeo, yBottom, yTop);

    const torsoMat = new THREE.MeshPhysicalMaterial({
      map: torsoTex,
      roughness: 0.22,
      metalness: 0.04,
      clearcoat: 0.88,
      clearcoatRoughness: 0.12,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    const chestRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.024, 18, 48), carbonMat);
    chestRing.position.set(0, 0.13, 0.595);
    chestRing.rotation.x = -0.08;
    torsoGroup.add(chestRing);

    const chestCore = new THREE.Mesh(new THREE.SphereGeometry(0.145, 32, 24), glowMat);
    chestCore.scale.set(1, 1, 0.35);
    chestCore.position.set(0, 0.13, 0.59);
    torsoGroup.add(chestCore);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.21, 0.24, 36), darkJointMat);
    neck.position.set(0, 0.6, 0);
    torsoGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.32, 0);
    robotGroup.add(headGroup);

    const headMesh = new THREE.Mesh(new RoundedBoxGeometry(2.05, 1.5, 1.32, 10, 0.46), pearlMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headGroup.add(headMesh);

    const visorBezel = new THREE.Mesh(
      new RoundedBoxGeometry(1.62, 1.12, 0.14, 8, 0.26),
      visorFrameMat
    );
    visorBezel.position.set(0, 0, 0.59);
    headGroup.add(visorBezel);

    const screenMesh = new THREE.Mesh(
      createRoundedRectPlane(1.48, 0.98, 0.2),
      new THREE.MeshBasicMaterial({ map: faceTex })
    );
    screenMesh.position.set(0, 0, 0.665);
    headGroup.add(screenMesh);

    const visorGlass = new THREE.Mesh(
      new RoundedBoxGeometry(1.56, 1.06, 0.04, 8, 0.24),
      visorGlassMat
    );
    visorGlass.position.set(0, 0, 0.675);
    headGroup.add(visorGlass);

    const createEar = (side: -1 | 1) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 1.03, -0.02, 0);

      const cupPoints: THREE.Vector2[] = [];
      const cupSegs = 20;
      const cupR = 0.31;
      const cupHalfH = 0.095;
      for (let i = 0; i <= cupSegs; i++) {
        const a = -Math.PI / 2 + (i / cupSegs) * Math.PI;
        const y = Math.sin(a) * cupHalfH;
        const r = Math.max(0, cupR - 0.065 + Math.cos(a) * 0.065);
        cupPoints.push(new THREE.Vector2(r, y));
      }
      cupPoints.unshift(new THREE.Vector2(0, -cupHalfH));
      cupPoints.push(new THREE.Vector2(0, cupHalfH));

      const cup = new THREE.Mesh(new THREE.LatheGeometry(cupPoints, 40), carbonMat);
      cup.rotation.z = Math.PI / 2;
      cup.castShadow = true;
      earGroup.add(cup);

      const earGlow = new THREE.Mesh(new THREE.SphereGeometry(0.185, 28, 20), glowMat);
      earGlow.scale.set(0.18, 1, 1);
      earGlow.position.x = side * 0.088;
      earGroup.add(earGlow);

      const antGroup = new THREE.Group();
      antGroup.position.set(side * 0.03, 0.22, 0);
      antGroup.rotation.z = side * -0.32;

      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.076, 0.64, 24), carbonMat);
      stalk.position.y = 0.3;
      stalk.castShadow = true;
      antGroup.add(stalk);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.042, 18, 18), glowMat);
      tip.position.y = 0.62;
      antGroup.add(tip);

      earGroup.add(antGroup);
      return { earGroup, antGroup };
    };

    const leftEarObj = createEar(-1);
    const rightEarObj = createEar(1);
    headGroup.add(leftEarObj.earGroup);
    headGroup.add(rightEarObj.earGroup);

    const createArm = (side: -1 | 1) => {
      const shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(side * 0.63, 0.33, 0.02);

      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.105, 22, 22), darkJointMat);
      shoulderPivot.add(joint);

      const armPoints: THREE.Vector2[] = [];
      const armSegs = 36;
      const armMinY = -0.72;
      const armMaxY = 0.0;
      for (let i = 0; i <= armSegs; i++) {
        const t = i / armSegs;
        const angle = -Math.PI / 2 + t * Math.PI;
        const y = THREE.MathUtils.lerp(armMinY, armMaxY, (Math.sin(angle) + 1) / 2);
        const widthProfile = 0.155 + 0.032 * Math.sin(t * Math.PI);
        const r = Math.max(0, Math.cos(angle) * widthProfile);
        armPoints.push(new THREE.Vector2(r, y));
      }

      const armGeo = new THREE.LatheGeometry(armPoints, 44);
      normalizeLatheV(armGeo, armMinY, armMaxY);

      const armMat = new THREE.MeshPhysicalMaterial({
        map: armTex,
        roughness: 0.21,
        metalness: 0.04,
        clearcoat: 0.88,
        clearcoatRoughness: 0.12,
      });

      const armMesh = new THREE.Mesh(armGeo, armMat);
      armMesh.position.y = -0.04;
      armMesh.castShadow = true;
      armMesh.receiveShadow = true;
      shoulderPivot.add(armMesh);

      return shoulderPivot;
    };

    const rightArm = createArm(-1);
    const leftArm = createArm(1);
    torsoGroup.add(rightArm);
    torsoGroup.add(leftArm);

    // Interactivity State
    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    let isHovering = false;
    let angryTimer = 0;
    let waveTimer = 1.4;
    let joltImpulse = 0;
    let lastUiState: 'idle' | 'hover' | 'angry' = 'idle';

    const syncReaction = (next: 'idle' | 'hover' | 'angry') => {
      if (next !== lastUiState) {
        lastUiState = next;
        setReaction(next);
      }
    };

    const setContainerPointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      return true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!setContainerPointer(e)) return;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(robotGroup, true);
      const nowHovering = hits.length > 0;

      if (nowHovering !== isHovering) {
        isHovering = nowHovering;
        renderer.domElement.style.cursor = isHovering ? 'pointer' : 'grab';
        if (angryTimer <= 0) {
          syncReaction(isHovering ? 'hover' : 'idle');
        }
      }
    };

    const onPointerLeave = () => {
      isHovering = false;
      renderer.domElement.style.cursor = 'grab';
      if (angryTimer <= 0) syncReaction('idle');
    };

    let downX = 0;
    let downY = 0;
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 7) return;
      if (!setContainerPointer(e)) return;
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.intersectObject(robotGroup, true).length > 0) {
        angryTimer = 2.8;
        joltImpulse = 1.0;
        syncReaction('angry');
      }
    };

    const onResize = () => {
      width = Math.max(host.clientWidth, 1);
      height = Math.max(host.clientHeight, 1);
      updateCameraDistance(width, height);
      renderer.setSize(width, height);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(host);

    let disposed = false;
    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      setWebglFailed(true);
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
    renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
    renderer.domElement.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('resize', onResize);

    // Blink scheduler & Palette colors
    let nextBlink = 2.5;
    let blinkDuration = 0;
    const limeColor = new THREE.Color(0x39ff14);
    const angryColor = new THREE.Color(0xff073a);
    const limeRim = new THREE.Color(0x39ff14);
    const angryRim = new THREE.Color(0xff073a);

    const clock = new THREE.Clock();
    let rafId = 0;

    const animate = () => {
      if (disposed || contextLost) return;
      rafId = window.requestAnimationFrame(animate);
      if (!isActiveRef.current) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      if (angryTimer > 0) {
        angryTimer -= dt;
        if (angryTimer <= 0) {
          angryTimer = 0;
          syncReaction(isHovering ? 'hover' : 'idle');
        }
      }

      const isAngryNow = angryTimer > 0 || baseExpressionRef.current === 'angry';
      const isHoverHappy = isHovering && !isAngryNow;

      joltImpulse *= Math.pow(0.03, dt);

      const targetEmissive = isAngryNow ? angryColor : limeColor;
      glowMat.emissive.lerp(targetEmissive, 0.12);
      glowMat.emissiveIntensity = isAngryNow
        ? 2.1 + Math.sin(t * 16) * 0.45
        : isHoverHappy
          ? 2.1 + Math.sin(t * 6) * 0.25
          : 1.7 + Math.sin(t * 2.5) * 0.15;
      rimLight.color.lerp(isAngryNow ? angryRim : limeRim, 0.1);

      nextBlink -= dt;
      if (nextBlink <= 0) {
        blinkDuration = 0.13;
        nextBlink = 2.4 + Math.random() * 3.2;
      } else if (blinkDuration > 0) {
        blinkDuration -= dt;
      }
      const blinkingNow = blinkDuration > 0 && !isAngryNow;

      const activeExpr: BotExpression = isAngryNow
        ? 'angry'
        : isHoverHappy
          ? 'happy'
          : baseExpressionRef.current;
      drawFace(activeExpr, blinkingNow, isHoverHappy);

      const floatSpeed = isHoverHappy ? 3.2 : 2.0;
      const floatAmp = prefersReducedMotion ? 0.03 : isHoverHappy ? 0.13 : 0.095;
      const floatY = Math.sin(t * floatSpeed) * floatAmp + joltImpulse * 0.12;
      robotGroup.position.y = floatY;
      robotGroup.position.z = -joltImpulse * 0.18;

      const squash = 1 + joltImpulse * 0.08 * Math.sin(t * 25);
      robotGroup.scale.set(squash, 2 - squash, squash);
      shadowPlane.scale.setScalar(1 - floatY * 0.35);

      torsoGroup.rotation.z = isAngryNow
        ? Math.sin(t * 24) * 0.06
        : Math.sin(t * 1.4) * (isHoverHappy ? 0.06 : 0.035);
      torsoGroup.rotation.x = Math.cos(t * 1.2) * 0.025 + joltImpulse * -0.18;

      const targetHeadY =
        THREE.MathUtils.clamp(pointer.x, -1, 1) * 0.28 +
        (isAngryNow ? Math.sin(t * 28) * 0.14 : 0);
      const targetHeadX =
        -THREE.MathUtils.clamp(pointer.y, -1, 1) * 0.18 +
        (isAngryNow ? 0.12 : isHoverHappy ? -0.06 : 0);
      headGroup.rotation.y += (targetHeadY - headGroup.rotation.y) * 0.1;
      headGroup.rotation.x += (targetHeadX - headGroup.rotation.x) * 0.1;
      headGroup.rotation.z = isHoverHappy ? Math.sin(t * 4.2) * 0.08 : Math.sin(t * 1.5) * 0.04;

      const antWiggle = isAngryNow
        ? Math.sin(t * 30) * 0.12
        : isHoverHappy
          ? Math.sin(t * 8) * 0.08
          : Math.sin(t * 2.5) * 0.025;
      leftEarObj.antGroup.rotation.z = 0.32 + antWiggle;
      rightEarObj.antGroup.rotation.z = -0.32 - antWiggle;

      if (isAngryNow) {
        const shake = Math.sin(t * 26) * 0.06;
        rightArm.rotation.z += (-0.32 + shake - rightArm.rotation.z) * 0.22;
        rightArm.rotation.x += (-0.55 - rightArm.rotation.x) * 0.22;
        leftArm.rotation.z += (0.32 - shake - leftArm.rotation.z) * 0.22;
        leftArm.rotation.x += (-0.55 - leftArm.rotation.x) * 0.22;
      } else if (isHoverHappy || waveTimer > 0) {
        if (waveTimer > 0) waveTimer -= dt;
        const wave = Math.sin(t * 10.5) * 0.28;
        rightArm.rotation.z += (-1.92 + wave - rightArm.rotation.z) * 0.16;
        rightArm.rotation.x += (-0.18 - rightArm.rotation.x) * 0.14;
        leftArm.rotation.z += (0.28 + Math.sin(t * 4) * 0.06 - leftArm.rotation.z) * 0.12;
        leftArm.rotation.x += (0.04 - leftArm.rotation.x) * 0.12;
      } else {
        const idleRaise = -1.72 + Math.sin(t * 2.1) * 0.06;
        rightArm.rotation.z += (idleRaise - rightArm.rotation.z) * 0.06;
        rightArm.rotation.x += (-0.14 - rightArm.rotation.x) * 0.06;
        leftArm.rotation.z += (0.24 + Math.sin(t * 2.0 + 1) * 0.04 - leftArm.rotation.z) * 0.08;
        leftArm.rotation.x += (Math.cos(t * 1.4) * 0.04 - leftArm.rotation.x) * 0.08;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      faceTex.dispose();
      torsoTex.dispose();
      armTex.dispose();
      shadowTex.dispose();
      envTarget.dispose();
      pmremGenerator.dispose();
      disposeObjectSubtree(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglFailed) {
    return null;
  }

  return (
    <div ref={rootRef} className={`relative select-none ${className}`}>
      {/* Transient Hover / Poke Reaction Caption */}
      {reaction !== 'idle' && (
        <div
          className={`pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow-lg border ${
            reaction === 'angry'
              ? 'bg-[#1A1A1A] text-[#FF073A] border-[#FF073A]/70'
              : 'bg-[#1A1A1A] text-[#39FF14] border-[#39FF14]/70'
          }`}
        >
          {reaction === 'angry' ? "Hey! Don't poke me!" : "Hehe, that's nice!"}
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div
        ref={canvasHostRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Footer Companion Bot — drag to orbit, tap to poke"
      />
    </div>
  );
};
