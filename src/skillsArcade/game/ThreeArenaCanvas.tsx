import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SkillModelLoader } from '../assets3d/SkillModelLoader';
import { SKILL_REGISTRY } from '../assets3d/skillRegistry';
import {
  ARENA_HALF_H,
  ARENA_HALF_W,
  BASE_PADDLE_WIDTH,
  PADDLE_Y,
  SkillBreakerEngine,
} from './physicsEngine';
import { arcadeSfx } from './soundEffects';
import type { BrickEntity, FallingCapsuleEntity, ScorePopupEntity } from './types';

interface ThreeArenaCanvasProps {
  engineRef: React.MutableRefObject<SkillBreakerEngine | null>;
  onHudSync: () => void;
}

interface DebrisChunk {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  age: number;
  maxAge: number;
}

interface SparkParticle {
  sprite: THREE.Sprite;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  maxAge: number;
  baseScale: number;
}

interface ActivePopupVisual {
  sprite: THREE.Sprite;
  texture: THREE.CanvasTexture;
  material: THREE.SpriteMaterial;
  age: number;
  maxAge: number;
  vy: number;
}

function detectSoftwareWebGL(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const rendererStr = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
      if (/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr)) {
        return true;
      }
    }
    return false;
  } catch {
    return true;
  }
}

function createSoftGlowTexture(innerRgba: string, midRgba: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  grad.addColorStop(0, innerRgba);
  grad.addColorStop(0.35, midRgba);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPopupTexture(text: string, colorHex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 384;
  c.height = 112;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '700 42px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#e0f2fe';
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPaddleDualTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#0c354c');
  grad.addColorStop(0.2, '#0f2744');
  grad.addColorStop(0.5, '#0b162d');
  grad.addColorStop(0.8, '#171a3b');
  grad.addColorStop(1, '#261742');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  // Subtle brushed metal micro-rib banding for realistic inner core depth
  const vGrad = ctx.createLinearGradient(0, 0, 0, 128);
  vGrad.addColorStop(0, 'rgba(255,255,255,0.16)');
  vGrad.addColorStop(0.28, 'rgba(148,163,184,0.06)');
  vGrad.addColorStop(0.55, 'rgba(2,6,23,0.34)');
  vGrad.addColorStop(1, 'rgba(2,6,23,0.72)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, 512, 128);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPaddleTrackTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1280;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);

  const padX = 14;
  const padY = 20;
  const w = c.width - padX * 2;
  const h = c.height - padY * 2;
  const r = h / 2;

  ctx.beginPath();
  ctx.roundRect(padX, padY, w, h, r);
  ctx.fillStyle = 'rgba(7, 10, 25, 0.56)';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
  ctx.stroke();

  // Left dashed arrow: < - - - - - - - - -
  const midY = c.height / 2;
  const arrowStroke = 'rgba(148, 163, 184, 0.52)';
  ctx.strokeStyle = arrowStroke;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(88, midY);
  ctx.lineTo(392, midY);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(100, midY - 9);
  ctx.lineTo(84, midY);
  ctx.lineTo(100, midY + 9);
  ctx.stroke();

  // Right dashed arrow: - - - - - - - - - >
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(c.width - 392, midY);
  ctx.lineTo(c.width - 88, midY);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(c.width - 100, midY - 9);
  ctx.lineTo(c.width - 84, midY);
  ctx.lineTo(c.width - 100, midY + 9);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Calibrates material emissive & environment intensity on cloned 3D badges:
 * keeps the perimeter neon outlines crisp while toning down inner icon & face light
 * so the badges look deeply integrated and comfortable on the eyes.
 */
function calibrateBadgeMaterials(group: THREE.Group): void {
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const isNeonRim = Boolean(obj.userData.isNeonRim);
    const isBadgeBody = Boolean(obj.userData.isBadgeBody);
    const isTypography = Boolean(obj.userData.isTypography);
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];

    for (const mat of mats) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;

      if (isNeonRim) {
        // Keep neon outlines vibrant and defined
        mat.envMapIntensity = 0.25;
        mat.emissiveIntensity = THREE.MathUtils.clamp(mat.emissiveIntensity || 0.72, 0.56, 0.78);
      } else if (isBadgeBody) {
        // Deep, calm capsule face so outlines frame the surface cleanly
        mat.envMapIntensity = 0.12;
        mat.emissiveIntensity = Math.min(mat.emissiveIntensity || 0, 0.08);
        mat.color.multiplyScalar(0.84);
      } else if (isTypography) {
        // Clean, glare-free typography
        mat.envMapIntensity = 0.08;
        mat.emissiveIntensity = 0;
        mat.color.setHex(0xe2e8f0);
      } else {
        // Inner 3D icon emblems: dramatically reduced inner emissive glare
        mat.envMapIntensity = 0.14;
        if (mat.emissiveIntensity > 0) {
          mat.emissiveIntensity = Math.min(0.18, mat.emissiveIntensity * 0.22);
        }
      }
    }
  });
}

export function ThreeArenaCanvas({ engineRef, onHudSync }: ThreeArenaCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onHudSyncRef = useRef(onHudSync);
  onHudSyncRef.current = onHudSync;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.68;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, 1.3, 0.1, 80);
    camera.position.set(0, -0.1, 11.4);
    camera.lookAt(0, 0, 0);

    // Subtle PMREM studio reflections scaled low so upper 3D capsules stay deep and sharp
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.16;
    roomEnv.dispose();
    pmrem.dispose();

    // Restrained dark-studio lighting
    const ambientLight = new THREE.AmbientLight(0xcbd5e1, 0.21);
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 0.62);
    keyLight.position.set(2.5, 3.8, 9.5);
    const rimLightCyan = new THREE.DirectionalLight(0x22d3ee, 0.26);
    rimLightCyan.position.set(-7.0, 2.0, 4.5);
    const rimLightPurple = new THREE.DirectionalLight(0xa855f7, 0.22);
    rimLightPurple.position.set(7.0, -3.0, 4.5);
    const orbPointLight = new THREE.PointLight(0x38bdf8, 1.0, 3.8, 2.0);
    scene.add(ambientLight, keyLight, rimLightCyan, rimLightPurple, orbPointLight);

    // Minimal UnrealBloomPass so only intense orb/edge accents softly glow
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(800, 600), 0.1, 0.28, 0.9);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    }

    const cyanGlowTex = createSoftGlowTexture('rgba(224,242,254,0.85)', 'rgba(34,211,238,0.34)');
    const sparkTex = createSoftGlowTexture('rgba(255,255,255,0.95)', 'rgba(56,189,248,0.5)');

    const bricksGroup = new THREE.Group();
    const capsulesGroup = new THREE.Group();
    const effectsGroup = new THREE.Group();
    scene.add(bricksGroup, capsulesGroup, effectsGroup);

    const modelLoader = new SkillModelLoader();
    const brickVisuals = new Map<string, THREE.Group>();
    const capsuleVisuals = new Map<string, THREE.Group>();
    const debrisPool: DebrisChunk[] = [];
    const sparkPool: SparkParticle[] = [];
    const popupPool: ActivePopupVisual[] = [];

    // Subtle wall bounce flash strips for responsive physical feedback
    const createWallStrip = (w: number, h: number, x: number, y: number) => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(x, y, 0.05);
      scene.add(mesh);
      return { mesh, mat, flash: 0 };
    };
    const wallLeft = createWallStrip(0.06, ARENA_HALF_H * 1.9, -ARENA_HALF_W + 0.04, 0);
    const wallRight = createWallStrip(0.06, ARENA_HALF_H * 1.9, ARENA_HALF_W - 0.04, 0);
    const wallTop = createWallStrip(ARENA_HALF_W * 1.94, 0.06, 0, ARENA_HALF_H - 0.04);

    // Realistic Multi-Layer 3D Capsule Paddle (No side lighting spillover, no text callout)
    const paddleGroup = new THREE.Group();
    paddleGroup.position.set(0, PADDLE_Y, 0.05);
    scene.add(paddleGroup);

    const paddleDualTex = createPaddleDualTexture();
    const paddleCoreMat = new THREE.MeshStandardMaterial({
      map: paddleDualTex,
      emissive: new THREE.Color('#0c4a6e'),
      emissiveIntensity: 0.14,
      roughness: 0.26,
      metalness: 0.78,
      envMapIntensity: 0.95,
    });
    const paddleBodyGeo = new THREE.CapsuleGeometry(0.168, BASE_PADDLE_WIDTH - 0.42, 16, 32);
    paddleBodyGeo.rotateZ(Math.PI / 2);
    const paddleBodyMesh = new THREE.Mesh(paddleBodyGeo, paddleCoreMat);
    paddleGroup.add(paddleBodyMesh);

    // Subtle internal titanium spine bar visible through the optical glass shell
    const paddleSpineGeo = new THREE.CapsuleGeometry(0.036, BASE_PADDLE_WIDTH - 0.68, 8, 16);
    paddleSpineGeo.rotateZ(Math.PI / 2);
    const paddleSpineMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.22,
      roughness: 0.2,
      metalness: 0.85,
      envMapIntensity: 1.1,
    });
    const paddleSpineMesh = new THREE.Mesh(paddleSpineGeo, paddleSpineMat);
    paddleSpineMesh.position.set(0, 0.015, 0.05);
    paddleGroup.add(paddleSpineMesh);

    // Outer optical clearcoat acrylic/glass capsule shell for realistic curved specular reflections
    const paddleShellGeo = new THREE.CapsuleGeometry(0.205, BASE_PADDLE_WIDTH - 0.42, 16, 36);
    paddleShellGeo.rotateZ(Math.PI / 2);
    const paddleShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f2744,
      transparent: true,
      opacity: 0.36,
      roughness: 0.06,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.95,
      envMapIntensity: 1.35,
      depthWrite: false,
    });
    const paddleShellMesh = new THREE.Mesh(paddleShellGeo, paddleShellMat);
    paddleGroup.add(paddleShellMesh);

    // Brushed metallic shoulder bezels + subtle recessed neon accent seams
    const paddleBezelMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.22,
      metalness: 0.9,
      envMapIntensity: 1.2,
    });
    const paddleBezelGeo = new THREE.TorusGeometry(0.205, 0.012, 12, 32);
    paddleBezelGeo.rotateY(Math.PI / 2);
    const paddleBezelL = new THREE.Mesh(paddleBezelGeo, paddleBezelMat);
    paddleBezelL.position.x = -0.51;
    const paddleBezelR = new THREE.Mesh(paddleBezelGeo, paddleBezelMat);
    paddleBezelR.position.x = 0.51;
    paddleGroup.add(paddleBezelL, paddleBezelR);

    const paddleRingMatL = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.4,
    });
    const paddleRingMatR = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.4,
    });
    const paddleRingGeo = new THREE.TorusGeometry(0.196, 0.008, 10, 32);
    paddleRingGeo.rotateY(Math.PI / 2);
    const paddleRingL = new THREE.Mesh(paddleRingGeo, paddleRingMatL);
    paddleRingL.position.x = -0.535;
    const paddleRingR = new THREE.Mesh(paddleRingGeo, paddleRingMatR);
    paddleRingR.position.x = 0.535;
    paddleGroup.add(paddleRingL, paddleRingR);

    // Soft local under-cushion glow centered strictly under the capsule (zero horizontal spillover)
    const paddleGlowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: cyanGlowTex,
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    paddleGlowSprite.scale.set(1.85, 0.58, 1);
    paddleGlowSprite.position.set(0, -0.02, -0.1);
    paddleGroup.add(paddleGlowSprite);

    // Rounded capsule-pill track with <---- and ----> arrows aligned dead-center behind paddle
    const trackTex = createPaddleTrackTexture();
    const trackGeo = new THREE.PlaneGeometry(ARENA_HALF_W * 1.56, 0.52);
    const trackMat = new THREE.MeshBasicMaterial({
      map: trackTex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.position.set(0, PADDLE_Y, -0.16);
    scene.add(trackMesh);

    // Interactive launch aim guide dots in READY state (extends clearly toward target bricks)
    const aimDotsGroup = new THREE.Group();
    const aimDotMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.62,
    });
    const aimDots: THREE.Mesh[] = [];
    for (let i = 0; i < 9; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.042 * (1 - i * 0.065), 8, 8), aimDotMat);
      aimDotsGroup.add(dot);
      aimDots.push(dot);
    }
    scene.add(aimDotsGroup);

    // Refined Glowing Neon Energy Orb + Sleek Tapered Ribbon Trail
    const orbGroup = new THREE.Group();
    const orbCoreMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.2,
      roughness: 0.15,
    });
    const orbCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.125, 20, 20), orbCoreMat);
    const orbHaloSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: cyanGlowTex,
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.58,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    orbHaloSprite.scale.set(0.68, 0.68, 1);
    orbGroup.add(orbCoreMesh, orbHaloSprite);
    scene.add(orbGroup);

    // Dynamic Dual-Layer Neon Beam Trail (Soft Outer Aura + Sharp Ice-Cyan Core Filament)
    const MAX_TRAIL_PTS = 26;
    const trailPositions = new Float32Array(MAX_TRAIL_PTS * 2 * 3);
    const trailColors = new Float32Array(MAX_TRAIL_PTS * 2 * 3);
    const trailCorePositions = new Float32Array(MAX_TRAIL_PTS * 2 * 3);
    const trailCoreColors = new Float32Array(MAX_TRAIL_PTS * 2 * 3);
    const trailIndices: number[] = [];
    for (let i = 0; i < MAX_TRAIL_PTS - 1; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      trailIndices.push(a, b, c, b, d, c);
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
    trailGeo.setIndex(trailIndices);
    const trailMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const trailMesh = new THREE.Mesh(trailGeo, trailMat);
    trailMesh.frustumCulled = false;

    const trailCoreGeo = new THREE.BufferGeometry();
    trailCoreGeo.setAttribute('position', new THREE.BufferAttribute(trailCorePositions, 3));
    trailCoreGeo.setAttribute('color', new THREE.BufferAttribute(trailCoreColors, 3));
    trailCoreGeo.setIndex(trailIndices);
    const trailCoreMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const trailCoreMesh = new THREE.Mesh(trailCoreGeo, trailCoreMat);
    trailCoreMesh.frustumCulled = false;

    scene.add(trailMesh, trailCoreMesh);

    const clearGroupChildren = (grp: THREE.Group) => {
      while (grp.children.length > 0) {
        grp.remove(grp.children[0]);
      }
    };

    // Curved translucent capsule-shell arc shards matching reference shatter visuals
    const sharedShardGeo = new THREE.SphereGeometry(0.175, 10, 8, 0, Math.PI * 0.85, 0.35, Math.PI * 0.65);
    const debrisMatCache = new Map<string, THREE.MeshPhysicalMaterial>();

    const clearActiveEffects = () => {
      for (const d of debrisPool) {
        effectsGroup.remove(d.mesh);
      }
      debrisPool.length = 0;
      for (const sp of sparkPool) {
        effectsGroup.remove(sp.sprite);
        (sp.sprite.material as THREE.SpriteMaterial).dispose();
      }
      sparkPool.length = 0;
      for (const pop of popupPool) {
        effectsGroup.remove(pop.sprite);
        pop.material.dispose();
        pop.texture.dispose();
      }
      popupPool.length = 0;
    };

    const syncBricksToScene = (bricks: BrickEntity[]) => {
      clearGroupChildren(bricksGroup);
      clearGroupChildren(capsulesGroup);
      clearActiveEffects();
      brickVisuals.clear();
      capsuleVisuals.clear();

      modelLoader.prewarm(bricks.map((b) => ({ skillId: b.skillId, overrideRimHex: b.overrideRimHex })));

      for (const b of bricks) {
        if (!b.alive) continue;
        const { group } = modelLoader.instantiate(b.skillId, b.width, b.overrideRimHex);
        calibrateBadgeMaterials(group);
        group.position.set(b.x, b.y, 0);
        bricksGroup.add(group);
        brickVisuals.set(b.uid, group);
      }
    };

    const spawnDebrisBurst = (x: number, y: number, hexColor: string, count: number) => {
      let mat = debrisMatCache.get(hexColor);
      if (!mat) {
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(hexColor),
          emissive: new THREE.Color(hexColor),
          emissiveIntensity: 0.42,
          transparent: true,
          opacity: 0.72,
          roughness: 0.18,
          metalness: 0.2,
          side: THREE.DoubleSide,
        });
        debrisMatCache.set(hexColor, mat);
      }

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(sharedShardGeo, mat);
        mesh.scale.set(0.6 + Math.random() * 0.7, 0.4 + Math.random() * 0.6, 0.4);
        mesh.position.set(x + (Math.random() - 0.5) * 0.36, y + (Math.random() - 0.5) * 0.22, 0.1);
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const spd = 1.4 + Math.random() * 2.4;
        effectsGroup.add(mesh);
        debrisPool.push({
          mesh,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd + 0.7,
          vz: (Math.random() - 0.2) * 1.5,
          rx: (Math.random() - 0.5) * 9,
          ry: (Math.random() - 0.5) * 9,
          rz: (Math.random() - 0.5) * 9,
          age: 0,
          maxAge: 0.68 + Math.random() * 0.22,
        });
      }
    };

    const spawnSparks = (x: number, y: number, hexColor: string, count: number) => {
      const col = new THREE.Color(hexColor);
      for (let i = 0; i < count; i++) {
        const spMat = new THREE.SpriteMaterial({
          map: sparkTex,
          color: col,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(spMat);
        sprite.position.set(x, y, 0.18);
        const baseScale = 0.11 + Math.random() * 0.14;
        sprite.scale.set(baseScale, baseScale, 1);
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.4 + Math.random() * 3.1;
        effectsGroup.add(sprite);
        sparkPool.push({
          sprite,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          vz: (Math.random() - 0.5) * 1.0,
          age: 0,
          maxAge: 0.38 + Math.random() * 0.2,
          baseScale,
        });
      }
    };

    const spawnCapsuleVisual = (cap: FallingCapsuleEntity) => {
      // Pure clean 3D skill capsule rotating smoothly — zero rings or arrows around it
      const holder = new THREE.Group();
      const { group } = modelLoader.instantiate(cap.skillId, cap.width, cap.overrideRimHex);
      calibrateBadgeMaterials(group);
      holder.add(group);
      holder.position.set(cap.x, cap.y, 0.22);
      capsulesGroup.add(holder);
      capsuleVisuals.set(cap.uid, holder);
    };

    const spawnPopupVisual = (pop: ScorePopupEntity) => {
      const tex = createPopupTexture(pop.text, pop.colorHex);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(pop.x, pop.y, 0.45);
      sprite.scale.set(1.38, 0.4, 1);
      effectsGroup.add(sprite);
      popupPool.push({
        sprite,
        texture: tex,
        material: mat,
        age: 0,
        maxAge: pop.maxAge,
        vy: 0.72,
      });
    };

    // Wire physics engine callbacks
    const engine = engineRef.current;
    if (engine) {
      engine.setCallbacks({
        onWaveChanged: (_wave, bricks) => {
          syncBricksToScene(bricks);
          onHudSyncRef.current();
        },
        onBrickHit: (brick, impactX, impactY, broken) => {
          const def = SKILL_REGISTRY[brick.skillId];
          const colorHex = brick.overrideRimHex ?? def.accentHex;
          arcadeSfx.playBrickBreak(engine.multiplier);
          spawnSparks(impactX, impactY, colorHex, broken ? 11 : 5);
          if (broken) {
            spawnDebrisBurst(brick.x, brick.y, colorHex, 6);
            const visual = brickVisuals.get(brick.uid);
            if (visual) {
              bricksGroup.remove(visual);
              brickVisuals.delete(brick.uid);
            }
          }
          onHudSyncRef.current();
        },
        onCapsuleSpawned: (cap) => {
          spawnCapsuleVisual(cap);
        },
        onCapsuleCaught: (cap, isDocker) => {
          const def = SKILL_REGISTRY[cap.skillId];
          arcadeSfx.playCapsuleCatch(isDocker);
          spawnSparks(cap.x, PADDLE_Y + 0.22, isDocker ? '#38bdf8' : def.accentHex, isDocker ? 16 : 9);
          const vis = capsuleVisuals.get(cap.uid);
          if (vis) {
            capsulesGroup.remove(vis);
            capsuleVisuals.delete(cap.uid);
          }
          onHudSyncRef.current();
        },
        onCapsuleExpired: (cap) => {
          const vis = capsuleVisuals.get(cap.uid);
          if (vis) {
            capsulesGroup.remove(vis);
            capsuleVisuals.delete(cap.uid);
          }
        },
        onPaddleBounce: (x, y, dockerActive) => {
          arcadeSfx.playPaddleHit(dockerActive);
          spawnSparks(x, y, dockerActive ? '#38bdf8' : '#22d3ee', dockerActive ? 10 : 6);
        },
        onWallBounce: (x, y) => {
          arcadeSfx.playWallHit();
          spawnSparks(x, y, '#67e8f9', 4);
          if (x < -ARENA_HALF_W + 0.35) wallLeft.flash = 0.65;
          else if (x > ARENA_HALF_W - 0.35) wallRight.flash = 0.65;
          if (y > ARENA_HALF_H - 0.35) wallTop.flash = 0.65;
        },
        onOrbLost: () => {
          arcadeSfx.playOrbLost();
          onHudSyncRef.current();
        },
        onScorePopup: (popup) => {
          spawnPopupVisual(popup);
        },
      });

      syncBricksToScene(engine.bricks);
    }

    renderer.compile(scene, camera);

    const updateSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      const vFovRad = THREE.MathUtils.degToRad(camera.fov);
      const minZForWidth = (ARENA_HALF_W * 1.07) / (Math.tan(vFovRad / 2) * aspect);
      const minZForHeight = (ARENA_HALF_H * 1.09) / Math.tan(vFovRad / 2);
      camera.position.z = Math.max(10.8, minZForWidth, minZForHeight);
      camera.updateProjectionMatrix();

      if (composer) {
        composer.setSize(w, h);
        if (bloomPass) bloomPass.resolution.set(w, h);
      }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // Interactive pointer tracking for both paddle slide & 3D brick hover parallax + click-to-aim launch
    const pointerState = { active: false, worldX: 0, worldY: 0 };

    const updatePointerWorld = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerState.active = true;
      pointerState.worldX = nx * ARENA_HALF_W;
      pointerState.worldY = ny * ARENA_HALF_H;
      const eng = engineRef.current;
      if (!eng) return;

      if (eng.mode === 'READY') {
        // Before launch: bottom capsule stays still and only the aim moves
        eng.setAimTarget(pointerState.worldX, pointerState.worldY);
      } else if (eng.mode === 'PLAYING') {
        // Once launched: bottom capsule slides horizontally
        eng.setPaddleTarget(pointerState.worldX);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointerWorld(e);
    };

    const handlePointerLeave = () => {
      pointerState.active = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      updatePointerWorld(e);
      const eng = engineRef.current;
      if (eng && eng.mode === 'READY') {
        if (eng.launchOrb(pointerState.worldX, pointerState.worldY)) {
          arcadeSfx.playLaunch();
          onHudSyncRef.current();
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let disposed = false;
    let rafId = 0;
    let timerId: number | null = null;
    let lastTs = performance.now();
    let hudSyncAccum = 0;
    const prevModeRef = { current: engineRef.current?.mode ?? 'READY' };

    const updateTrailGeometry = (trail: { x: number; y: number }[]) => {
      const count = Math.min(trail.length, MAX_TRAIL_PTS);
      if (count < 2) {
        trailMesh.visible = false;
        trailCoreMesh.visible = false;
        return;
      }
      trailMesh.visible = true;
      trailCoreMesh.visible = true;

      for (let i = 0; i < MAX_TRAIL_PTS; i++) {
        const pt = trail[Math.min(i, count - 1)];
        const prev = trail[Math.max(0, Math.min(i - 1, count - 1))];
        const next = trail[Math.min(i + 1, count - 1)];
        let dx = next.x - prev.x;
        let dy = next.y - prev.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const px = -dy;
        const py = dx;

        const frac = i / (MAX_TRAIL_PTS - 1);
        const halfThick = i < count ? (1 - frac) * 0.135 : 0;
        const halfCore = i < count ? (1 - frac) * 0.032 : 0;

        const vIdx = i * 6;
        trailPositions[vIdx] = pt.x + px * halfThick;
        trailPositions[vIdx + 1] = pt.y + py * halfThick;
        trailPositions[vIdx + 2] = 0.08;
        trailPositions[vIdx + 3] = pt.x - px * halfThick;
        trailPositions[vIdx + 4] = pt.y - py * halfThick;
        trailPositions[vIdx + 5] = 0.08;

        trailCorePositions[vIdx] = pt.x + px * halfCore;
        trailCorePositions[vIdx + 1] = pt.y + py * halfCore;
        trailCorePositions[vIdx + 2] = 0.095;
        trailCorePositions[vIdx + 3] = pt.x - px * halfCore;
        trailCorePositions[vIdx + 4] = pt.y - py * halfCore;
        trailCorePositions[vIdx + 5] = 0.095;

        // Smooth cyan-to-violet outer beam gradient
        const fade = Math.pow(1 - frac, 1.35);
        const r = THREE.MathUtils.lerp(0.26, 0.62, frac) * fade;
        const g = THREE.MathUtils.lerp(0.86, 0.34, frac) * fade;
        const b = THREE.MathUtils.lerp(0.98, 0.94, frac) * fade;
        trailColors[vIdx] = r;
        trailColors[vIdx + 1] = g;
        trailColors[vIdx + 2] = b;
        trailColors[vIdx + 3] = r;
        trailColors[vIdx + 4] = g;
        trailColors[vIdx + 5] = b;

        // Crisp ice-white-cyan inner beam filament
        const coreFade = Math.pow(1 - frac, 1.05);
        const cr = THREE.MathUtils.lerp(0.85, 0.3, frac) * coreFade;
        const cg = THREE.MathUtils.lerp(0.98, 0.78, frac) * coreFade;
        const cb = 1.0 * coreFade;
        trailCoreColors[vIdx] = cr;
        trailCoreColors[vIdx + 1] = cg;
        trailCoreColors[vIdx + 2] = cb;
        trailCoreColors[vIdx + 3] = cr;
        trailCoreColors[vIdx + 4] = cg;
        trailCoreColors[vIdx + 5] = cb;
      }

      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.attributes.color.needsUpdate = true;
      trailCoreGeo.attributes.position.needsUpdate = true;
      trailCoreGeo.attributes.color.needsUpdate = true;
    };

    const tick = () => {
      if (disposed || contextLost) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      const eng = engineRef.current;
      if (eng) {
        eng.step(dt);

        if (prevModeRef.current !== eng.mode) {
          if (eng.mode === 'WAVE_CLEAR') {
            arcadeSfx.playWaveClear();
          }
          prevModeRef.current = eng.mode;
          onHudSyncRef.current();
        }

        hudSyncAccum += dt;
        if (hudSyncAccum >= 0.12) {
          hudSyncAccum = 0;
          if (eng.mode === 'PLAYING') {
            onHudSyncRef.current();
          }
        }

        // Unhit 3D bricks stay strictly at rest (zero float/bob/hover sway); spin only on orb impact
        for (const brick of eng.bricks) {
          const meshGrp = brickVisuals.get(brick.uid);
          if (!meshGrp) continue;

          meshGrp.position.set(brick.x, brick.y, 0);
          meshGrp.rotation.x = 0;
          meshGrp.rotation.y += (brick.hitSpinAngle - meshGrp.rotation.y) * Math.min(1, dt * 16);
        }

        // Falling 3D capsules rotating cleanly in 360° (without any orbiting rings)
        for (const cap of eng.fallingCapsules) {
          const holder = capsuleVisuals.get(cap.uid);
          if (!holder) continue;
          holder.position.set(cap.x, cap.y, 0.24);
          const modelChild = holder.children[0];
          if (modelChild) {
            modelChild.rotation.y = cap.spinY;
            modelChild.rotation.x = 0.2 + Math.sin(eng.elapsedTime * 3.0) * 0.1;
            modelChild.rotation.z = cap.tiltZ;
          }
        }

        // Paddle: smooth horizontal motion + bounce spring, strictly level (no horizontal tilt)
        paddleGroup.position.x = eng.paddleX;
        paddleGroup.position.y = PADDLE_Y - eng.paddleBounceSpring * 0.095;
        paddleGroup.rotation.z = 0;

        const widthRatio = eng.paddleWidth / BASE_PADDLE_WIDTH;
        paddleBodyMesh.scale.set(widthRatio, 1, 1);
        paddleSpineMesh.scale.set(widthRatio, 1, 1);
        paddleShellMesh.scale.set(widthRatio, 1, 1);
        paddleBezelL.position.x = -0.51 * widthRatio;
        paddleBezelR.position.x = 0.51 * widthRatio;
        paddleRingL.position.x = -0.535 * widthRatio;
        paddleRingR.position.x = 0.535 * widthRatio;
        paddleGlowSprite.scale.set(1.85 * widthRatio, 0.58, 1);

        const dockerActive = eng.dockerPowerTimer > 0;
        paddleCoreMat.emissiveIntensity = (dockerActive ? 0.26 : 0.12) + eng.paddleFlash * 0.28;
        paddleSpineMat.emissiveIntensity = (dockerActive ? 0.38 : 0.18) + eng.paddleFlash * 0.32;

        // Aim guide dots driven by eng.aimAngle in READY state
        if (eng.mode === 'READY') {
          aimDotsGroup.visible = true;
          for (let i = 0; i < aimDots.length; i++) {
            const dist = 0.36 + i * 0.34;
            aimDots[i].position.set(
              eng.orbX + Math.sin(eng.aimAngle) * dist,
              eng.orbY + Math.cos(eng.aimAngle) * dist,
              0.12
            );
          }
        } else {
          aimDotsGroup.visible = false;
        }

        // Neon energy orb & point light
        orbGroup.position.set(eng.orbX, eng.orbY, 0.16);
        orbPointLight.position.set(eng.orbX, eng.orbY, 1.4);
        const pulse = 1 + Math.sin(eng.elapsedTime * 8.0) * 0.06;
        orbHaloSprite.scale.set(0.68 * pulse, 0.68 * pulse, 1);
        updateTrailGeometry(eng.orbTrail);

        // Wall flash decay
        for (const w of [wallLeft, wallRight, wallTop]) {
          if (w.flash > 0.005) {
            w.flash = Math.max(0, w.flash - dt * 3.2);
            w.mat.opacity = w.flash;
          } else {
            w.mat.opacity = 0;
          }
        }

        // Subtle camera breathing + micro-shake on hit
        const camTiltX = pointerState.active ? THREE.MathUtils.clamp(pointerState.worldX * 0.03, -0.14, 0.14) : 0;
        camera.position.x += (camTiltX + (Math.random() - 0.5) * eng.screenShake * 0.045 - camera.position.x) * Math.min(1, dt * 8);
        camera.position.y = -0.1 + (Math.random() - 0.5) * eng.screenShake * 0.045;
        camera.lookAt(0, 0, 0);
      }

      // Step debris chunks
      for (let i = debrisPool.length - 1; i >= 0; i--) {
        const d = debrisPool[i];
        d.age += dt;
        if (d.age >= d.maxAge) {
          effectsGroup.remove(d.mesh);
          debrisPool.splice(i, 1);
          continue;
        }
        d.vy -= 4.8 * dt;
        d.mesh.position.x += d.vx * dt;
        d.mesh.position.y += d.vy * dt;
        d.mesh.position.z += d.vz * dt;
        d.mesh.rotation.x += d.rx * dt;
        d.mesh.rotation.y += d.ry * dt;
        d.mesh.rotation.z += d.rz * dt;
        const s = 1 - d.age / d.maxAge;
        d.mesh.scale.multiplyScalar(0.97 + 0.03 * s);
      }

      // Step sparks
      for (let i = sparkPool.length - 1; i >= 0; i--) {
        const sp = sparkPool[i];
        sp.age += dt;
        if (sp.age >= sp.maxAge) {
          effectsGroup.remove(sp.sprite);
          (sp.sprite.material as THREE.SpriteMaterial).dispose();
          sparkPool.splice(i, 1);
          continue;
        }
        sp.sprite.position.x += sp.vx * dt;
        sp.sprite.position.y += sp.vy * dt;
        sp.sprite.position.z += sp.vz * dt;
        const lifeLeft = 1 - sp.age / sp.maxAge;
        (sp.sprite.material as THREE.SpriteMaterial).opacity = lifeLeft;
        const sc = sp.baseScale * (0.4 + 0.6 * lifeLeft);
        sp.sprite.scale.set(sc, sc, 1);
      }

      // Step +500 floating popups
      for (let i = popupPool.length - 1; i >= 0; i--) {
        const pop = popupPool[i];
        pop.age += dt;
        if (pop.age >= pop.maxAge) {
          effectsGroup.remove(pop.sprite);
          pop.material.dispose();
          pop.texture.dispose();
          popupPool.splice(i, 1);
          continue;
        }
        pop.sprite.position.y += pop.vy * dt;
        const t = pop.age / pop.maxAge;
        pop.material.opacity = t < 0.2 ? t / 0.2 : Math.max(0, 1 - (t - 0.2) / 0.8);
      }

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          if (sync) {
            const checkSync = () => {
              if (disposed) {
                gl.deleteSync(sync);
                return;
              }
              const res = gl.clientWaitSync(sync, 0, 0);
              if (res === gl.TIMEOUT_EXPIRED) {
                timerId = window.setTimeout(checkSync, 16);
              } else {
                gl.deleteSync(sync);
                timerId = window.setTimeout(tick, 45);
              }
            };
            timerId = window.setTimeout(checkSync, 16);
            return;
          }
        }
        timerId = window.setTimeout(tick, 60);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      timerId = window.setTimeout(tick, 16);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (timerId !== null) clearTimeout(timerId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      clearActiveEffects();
      sharedShardGeo.dispose();
      paddleBodyGeo.dispose();
      paddleSpineGeo.dispose();
      paddleShellGeo.dispose();
      paddleBezelGeo.dispose();
      paddleRingGeo.dispose();
      paddleCoreMat.dispose();
      paddleSpineMat.dispose();
      paddleShellMat.dispose();
      paddleBezelMat.dispose();
      paddleRingMatL.dispose();
      paddleRingMatR.dispose();
      trackGeo.dispose();
      trackMat.dispose();
      trackTex.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      trailCoreGeo.dispose();
      trailCoreMat.dispose();
      debrisMatCache.forEach((m) => m.dispose());
      debrisMatCache.clear();
      modelLoader.disposeAll();
      cyanGlowTex.dispose();
      sparkTex.dispose();
      paddleDualTex.dispose();
      envRT.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [engineRef]);

  return (
    <div
      ref={mountRef}
      className="relative h-full w-full cursor-crosshair select-none touch-none"
      aria-label="3D Skill Breaker and Catcher WebGL Arena"
    />
  );
}
