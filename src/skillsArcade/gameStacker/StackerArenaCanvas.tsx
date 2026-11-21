import { useEffect, useImperativeHandle, useRef } from 'react';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SkillModelLoader } from '../assets3d/SkillModelLoader';
import { SKILL_REGISTRY } from '../assets3d/skillRegistry';
import type { SkillModelId } from '../assets3d/types';
import { arcadeSfx } from '../game/soundEffects';
import {
  CAPSULE_WORLD_WIDTH,
  CHAMBER_CEILING_Y,
  CHAMBER_FLOOR_Y,
  CHAMBER_HALF_D,
  CHAMBER_HALF_W,
  DISPENSER_DROP_QUEUE,
  INITIAL_TOWER_PLACEMENTS,
  MAX_STACKER_CAPSULES,
  analyzeTower,
  pickRandomCapsuleWidth,
  type BodyTelemetrySample,
} from './towerAnalyzer';
import type {
  StackerBodySnapshot,
  StackerGameState,
  StackerHudSnapshot,
  StackerInteractionMode,
  StackerSessionSnapshot,
} from './types';

export interface StackerArenaController {
  dropCapsule: () => void;
  resetStack: () => void;
  clearSelection: () => void;
  setInteractionMode: (mode: StackerInteractionMode) => void;
  rotateSelectedBy: (dx: number, dy: number, dz: number) => void;
}

interface StackerArenaCanvasProps {
  controllerRef: React.MutableRefObject<StackerArenaController | null>;
  sessionRef: React.MutableRefObject<StackerSessionSnapshot | null>;
  muted: boolean;
  onHudUpdate: (hud: StackerHudSnapshot) => void;
}

interface DynamicCapsuleEntry {
  uid: string;
  skillId: SkillModelId;
  worldWidth: number;
  body: RAPIER.RigidBody;
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  halfW: number;
  halfH: number;
  settledAwarded: boolean;
}

interface SparkItem {
  sprite: THREE.Sprite;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  maxAge: number;
  baseScale: number;
}

interface PopupItem {
  sprite: THREE.Sprite;
  tex: THREE.CanvasTexture;
  mat: THREE.SpriteMaterial;
  age: number;
  maxAge: number;
}

const _vec3A = new THREE.Vector3();
const _quatA = new THREE.Quaternion();
const _quatB = new THREE.Quaternion();
const _eulerA = new THREE.Euler();
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisY = new THREE.Vector3(0, 1, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);

function detectSoftwareWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const str = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
      if (/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(str)) {
        return true;
      }
    }
    return false;
  } catch {
    return true;
  }
}

function createSoftGlowTex(inner: string, mid: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.38, mid);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBeamGradientTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(56, 189, 248, 0.72)');
  g.addColorStop(0.35, 'rgba(34, 211, 238, 0.28)');
  g.addColorStop(0.8, 'rgba(34, 211, 238, 0.06)');
  g.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPopupTextTex(text: string, colorHex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 112;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '700 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#e0f2fe';
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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
        mat.envMapIntensity = 0.25;
        mat.emissiveIntensity = THREE.MathUtils.clamp(mat.emissiveIntensity || 0.74, 0.58, 0.82);
      } else if (isBadgeBody) {
        mat.envMapIntensity = 0.14;
        mat.emissiveIntensity = Math.min(mat.emissiveIntensity || 0, 0.08);
        mat.color.multiplyScalar(0.86);
      } else if (isTypography) {
        mat.envMapIntensity = 0.08;
        mat.emissiveIntensity = 0;
        mat.color.setHex(0xf1f5f9);
      } else {
        mat.envMapIntensity = 0.16;
        if (mat.emissiveIntensity > 0) {
          mat.emissiveIntensity = Math.min(0.22, mat.emissiveIntensity * 0.26);
        }
      }
    }
  });
}

export function StackerArenaCanvas({
  controllerRef,
  sessionRef,
  muted,
  onHudUpdate,
}: StackerArenaCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onHudUpdateRef = useRef(onHudUpdate);
  onHudUpdateRef.current = onHudUpdate;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const internalCtrlRef = useRef<StackerArenaController | null>(null);

  useImperativeHandle(controllerRef, () => ({
    dropCapsule: () => internalCtrlRef.current?.dropCapsule(),
    resetStack: () => internalCtrlRef.current?.resetStack(),
    clearSelection: () => internalCtrlRef.current?.clearSelection(),
    setInteractionMode: (mode) => internalCtrlRef.current?.setInteractionMode(mode),
    rotateSelectedBy: (dx, dy, dz) => internalCtrlRef.current?.rotateSelectedBy(dx, dy, dz),
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;
    let timerId: number | null = null;
    let world: RAPIER.World | null = null;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.72;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, 1.32, 0.1, 80);
    camera.position.set(0, 0.15, 11.45);
    camera.lookAt(0, 0.05, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.18;
    roomEnv.dispose();
    pmrem.dispose();

    const ambientLight = new THREE.AmbientLight(0xcbd5e1, 0.25);
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 0.68);
    keyLight.position.set(2.8, 5.2, 9.5);
    const cyanSpot = new THREE.PointLight(0x22d3ee, 1.35, 8.5, 1.6);
    cyanSpot.position.set(0, CHAMBER_CEILING_Y - 0.3, 0.4);
    const purpleRim = new THREE.DirectionalLight(0xa855f7, 0.28);
    purpleRim.position.set(6.5, -2.5, 4.0);
    scene.add(ambientLight, keyLight, cyanSpot, purpleRim);

    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(800, 600), 0.12, 0.28, 0.88);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    }

    const disposableGeos: THREE.BufferGeometry[] = [];
    const disposableMats: THREE.Material[] = [];
    const disposableTexs: THREE.Texture[] = [];

    const sparkTex = createSoftGlowTex('rgba(255,255,255,0.95)', 'rgba(56,189,248,0.52)');
    const beamTex = createBeamGradientTex();
    disposableTexs.push(sparkTex, beamTex);

    // =========================================================================
    // 1. 3D PERSPECTIVE GLASS PHYSICS CHAMBER (Back Wall, Floor, Side Walls)
    // =========================================================================
    const chamberGroup = new THREE.Group();
    scene.add(chamberGroup);

    const w = CHAMBER_HALF_W;
    const fY = CHAMBER_FLOOR_Y;
    const cY = CHAMBER_CEILING_Y;
    const zBack = -CHAMBER_HALF_D;
    const zFront = CHAMBER_HALF_D * 0.85;

    // Translucent dark-blue interior wall panels
    const wallGlassMat = new THREE.MeshBasicMaterial({
      color: 0x070d24,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const floorGlassMat = new THREE.MeshBasicMaterial({
      color: 0x09132e,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    disposableMats.push(wallGlassMat, floorGlassMat);

    const backPaneGeo = new THREE.PlaneGeometry(w * 2, cY - fY);
    const backPane = new THREE.Mesh(backPaneGeo, wallGlassMat);
    backPane.position.set(0, (cY + fY) / 2, zBack);
    chamberGroup.add(backPane);
    disposableGeos.push(backPaneGeo);

    const floorPaneGeo = new THREE.PlaneGeometry(w * 2, zFront - zBack);
    const floorPane = new THREE.Mesh(floorPaneGeo, floorGlassMat);
    floorPane.rotation.x = -Math.PI / 2;
    floorPane.position.set(0, fY, (zBack + zFront) / 2);
    chamberGroup.add(floorPane);
    disposableGeos.push(floorPaneGeo);

    // Build crisp 3D grid lines across Floor, Back Wall, Left Wall, Right Wall + Tick Marks
    const gridPts: number[] = [];
    const pushLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      gridPts.push(x1, y1, z1, x2, y2, z2);
    };

    const cols = 16;
    const rows = 10;
    for (let i = 1; i < cols; i++) {
      const gx = -w + (w * 2 * i) / cols;
      pushLine(gx, fY, zBack + 0.01, gx, cY, zBack + 0.01); // back wall vertical
      pushLine(gx, fY + 0.006, zBack, gx, fY + 0.006, zFront); // floor depth
    }
    for (let j = 1; j < rows; j++) {
      const gy = fY + ((cY - fY) * j) / rows;
      pushLine(-w, gy, zBack + 0.01, w, gy, zBack + 0.01); // back wall horizontal
      pushLine(-w + 0.01, gy, zBack, -w + 0.01, gy, zFront); // left wall horizontal
      pushLine(w - 0.01, gy, zBack, w - 0.01, gy, zFront); // right wall horizontal
    }
    for (let k = 1; k <= 4; k++) {
      const gz = zBack + ((zFront - zBack) * k) / 5;
      pushLine(-w, fY + 0.006, gz, w, fY + 0.006, gz); // floor cross lines
      pushLine(-w + 0.01, fY, gz, -w + 0.01, cY, gz); // left wall verticals
      pushLine(w - 0.01, fY, gz, w - 0.01, cY, gz); // right wall verticals
    }
    // Vertical measurement tick marks along front left & right edges (like reference)
    for (let t = 0; t <= 16; t++) {
      const ty = fY + 0.16 + ((cY - fY - 0.32) * t) / 16;
      pushLine(-w + 0.04, ty, zFront, -w + 0.16, ty, zFront);
      pushLine(w - 0.04, ty, zFront, w - 0.16, ty, zFront);
    }

    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x3b4d8c,
      transparent: true,
      opacity: 0.28,
    });
    chamberGroup.add(new THREE.LineSegments(gridGeo, gridMat));
    disposableGeos.push(gridGeo);
    disposableMats.push(gridMat);

    // Outer & inner glowing cyan-purple wireframe chamber outline
    const framePts: number[] = [];
    const pushBoxRect = (z: number) => {
      framePts.push(-w, fY, z, w, fY, z);
      framePts.push(w, fY, z, w, cY, z);
      framePts.push(w, cY, z, -w, cY, z);
      framePts.push(-w, cY, z, -w, fY, z);
    };
    pushBoxRect(zBack);
    pushBoxRect(zFront);
    // Perspective corner connectors
    framePts.push(-w, fY, zBack, -w, fY, zFront);
    framePts.push(w, fY, zBack, w, fY, zFront);
    framePts.push(w, cY, zBack, w, cY, zFront);
    framePts.push(-w, cY, zBack, -w, cY, zFront);

    const frameGeo = new THREE.BufferGeometry();
    frameGeo.setAttribute('position', new THREE.Float32BufferAttribute(framePts, 3));
    const frameMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
    });
    chamberGroup.add(new THREE.LineSegments(frameGeo, frameMat));
    disposableGeos.push(frameGeo);
    disposableMats.push(frameMat);

    // =========================================================================
    // 2. TOP COMPOSITE 3D CAPSULE DISPENSER + VOLUMETRIC CYAN BEAM
    // =========================================================================
    const dispenserGroup = new THREE.Group();
    dispenserGroup.position.set(0, cY + 0.18, 0);
    scene.add(dispenserGroup);

    const dispMetalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.28,
      metalness: 0.85,
      envMapIntensity: 1.15,
    });
    const dispDarkCollarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.75,
    });
    const dispCyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.25,
      roughness: 0.15,
    });
    disposableMats.push(dispMetalMat, dispDarkCollarMat, dispCyanGlowMat);

    const dispHullGeo = new THREE.CylinderGeometry(0.46, 0.5, 0.72, 24);
    const dispHull = new THREE.Mesh(dispHullGeo, dispMetalMat);
    dispHull.position.y = 0.22;
    dispenserGroup.add(dispHull);

    const dispCollarGeo = new THREE.CylinderGeometry(0.55, 0.52, 0.14, 24);
    const dispCollar = new THREE.Mesh(dispCollarGeo, dispDarkCollarMat);
    dispCollar.position.y = -0.14;
    dispenserGroup.add(dispCollar);

    const dispNozzleRingGeo = new THREE.TorusGeometry(0.42, 0.045, 12, 32);
    dispNozzleRingGeo.rotateX(Math.PI / 2);
    const dispNozzleRing = new THREE.Mesh(dispNozzleRingGeo, dispCyanGlowMat);
    dispNozzleRing.position.y = -0.22;
    dispenserGroup.add(dispNozzleRing);

    const dispLensGeo = new THREE.CircleGeometry(0.38, 24);
    dispLensGeo.rotateX(Math.PI / 2);
    const dispLens = new THREE.Mesh(dispLensGeo, dispCyanGlowMat);
    dispLens.position.y = -0.215;
    dispenserGroup.add(dispLens);

    // Three cyan indicator slits along the front face of the dispenser drum
    const slitGeo = new THREE.BoxGeometry(0.05, 0.36, 0.04);
    for (const sx of [-0.16, 0, 0.16]) {
      const slit = new THREE.Mesh(slitGeo, dispCyanGlowMat);
      slit.position.set(sx, 0.2, 0.46);
      dispenserGroup.add(slit);
    }

    const beamGeo = new THREE.CylinderGeometry(0.36, 1.38, 2.75, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      map: beamTex,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = -1.6;
    dispenserGroup.add(beamMesh);

    disposableGeos.push(dispHullGeo, dispCollarGeo, dispNozzleRingGeo, dispLensGeo, slitGeo, beamGeo);
    disposableMats.push(beamMat);

    // =========================================================================
    // 3. DYNAMIC CAPSULES, EFFECTS & RAPIER PHYSICS STATE
    // =========================================================================
    const modelLoader = new SkillModelLoader();
    const capsulesGroup = new THREE.Group();
    const effectsGroup = new THREE.Group();
    scene.add(capsulesGroup, effectsGroup);

    const hitProxyMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitProxyGeo = new THREE.BoxGeometry(1, 1, 1);
    disposableMats.push(hitProxyMat);
    disposableGeos.push(hitProxyGeo);

    const capsuleEntries: DynamicCapsuleEntry[] = [];
    const hitProxyToUid = new Map<number, string>();
    const sparkPool: SparkItem[] = [];
    const popupPool: PopupItem[] = [];

    let uidCounter = 1;
    const saved = sessionRef.current;
    let score = saved ? saved.score : 0;
    let maxTowerHeight = saved ? saved.maxTowerHeight : 3;
    const unlockedComboIds = new Set<string>(saved ? saved.unlockedComboIds : []);
    let dropQueueIndex = saved ? saved.dropQueueIndex : 0;
    let selectedUid: string | null = null;
    let selectedSkillId: SkillModelId | null = saved ? saved.selectedSkillId : 'express';
    let interactionMode: StackerInteractionMode = saved ? saved.interactionMode : 'drag';
    let gameState: StackerGameState = 'STABLE';
    let collapseNotice: string | null = null;
    let collapseTimer = 0;
    let dispenserPulse = 0;
    let settleCheckAccum = 0;
    let physicsAccum = 0;
    let prevStableHeight = maxTowerHeight;

    // Drag / Rotate controller state
    let activePointerAction: null | {
      mode: 'drag' | 'rotate';
      uid: string;
      pointerId: number;
      lastScreenX: number;
      lastScreenY: number;
      grabOffsetX: number;
      grabOffsetY: number;
      velX: number;
      velY: number;
      targetX: number;
      targetY: number;
    } = null;

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const spawnSparks = (x: number, y: number, hexColor: string, count: number) => {
      const col = new THREE.Color(hexColor);
      for (let i = 0; i < count; i++) {
        const mat = new THREE.SpriteMaterial({
          map: sparkTex,
          color: col,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(x, y, 0.26);
        const baseScale = 0.1 + Math.random() * 0.14;
        sprite.scale.set(baseScale, baseScale, 1);
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.1 + Math.random() * 2.5;
        effectsGroup.add(sprite);
        sparkPool.push({
          sprite,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd + 0.5,
          vz: (Math.random() - 0.5) * 0.8,
          age: 0,
          maxAge: 0.42 + Math.random() * 0.22,
          baseScale,
        });
      }
    };

    const spawnPopup = (x: number, y: number, text: string, colorHex: string) => {
      const tex = createPopupTextTex(text, colorHex);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(THREE.MathUtils.clamp(x, -w + 1.4, w - 1.4), Math.min(cY - 0.35, y), 0.52);
      sprite.scale.set(1.9, 0.42, 1);
      effectsGroup.add(sprite);
      popupPool.push({ sprite, tex, mat, age: 0, maxAge: 1.15 });
    };

    const spawnCapsuleBody = (
      rapierWorld: RAPIER.World,
      skillId: SkillModelId,
      opts: {
        uid?: string;
        worldWidth?: number;
        x: number;
        y: number;
        z: number;
        qx?: number;
        qy?: number;
        qz?: number;
        qw?: number;
        linvelY?: number;
        settledAwarded?: boolean;
      }
    ): DynamicCapsuleEntry => {
      const uid = opts.uid ?? `stk_${uidCounter++}`;
      const targetWidth = opts.worldWidth ?? CAPSULE_WORLD_WIDTH;
      const { group, width, height } = modelLoader.instantiate(skillId, targetWidth);
      calibrateBadgeMaterials(group);
      group.position.set(opts.x, opts.y, opts.z);

      const qx = opts.qx ?? 0;
      const qy = opts.qy ?? 0;
      const qz = opts.qz ?? 0;
      const qw = opts.qw ?? 1;
      group.quaternion.set(qx, qy, qz, qw);

      const hitMesh = new THREE.Mesh(hitProxyGeo, hitProxyMat);
      hitMesh.scale.set(
        (width / Math.max(0.001, group.scale.x)) * 1.05,
        (height / Math.max(0.001, group.scale.y)) * 1.1,
        0.52 / Math.max(0.001, group.scale.z)
      );
      hitMesh.layers.set(1);
      group.add(hitMesh);
      hitProxyToUid.set(hitMesh.id, uid);
      capsulesGroup.add(group);

      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(opts.x, opts.y, opts.z)
        .setRotation({ x: qx, y: qy, z: qz, w: qw })
        .setLinearDamping(0.55)
        .setAngularDamping(1.0)
        .setCanSleep(true)
        .setCcdEnabled(true);

      if (typeof opts.linvelY === 'number') {
        bodyDesc.setLinvel(0, opts.linvelY, 0);
      }

      const body = rapierWorld.createRigidBody(bodyDesc);
      // Lock Z drift so capsules stack cleanly in one plane inside chamber, and lock rotations unless Rotate mode is active
      body.setEnabledTranslations(true, true, false, true);
      body.setEnabledRotations(false, false, false, true);

      const hx = Math.max(0.1, width * 0.502);
      const hy = Math.max(0.08, height * 0.495);
      const hz = 0.22;
      const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy, hz)
        .setFriction(2.0)
        .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Max)
        .setRestitution(0.0)
        .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min)
        .setDensity(2.1);
      rapierWorld.createCollider(colliderDesc, body);

      const entry: DynamicCapsuleEntry = {
        uid,
        skillId,
        worldWidth: width,
        body,
        group,
        hitMesh,
        halfW: width * 0.5,
        halfH: height * 0.5,
        settledAwarded: Boolean(opts.settledAwarded),
      };
      capsuleEntries.push(entry);
      return entry;
    };

    const clearAllDynamicCapsules = (rapierWorld: RAPIER.World) => {
      for (const entry of capsuleEntries) {
        capsulesGroup.remove(entry.group);
        hitProxyToUid.delete(entry.hitMesh.id);
        rapierWorld.removeRigidBody(entry.body);
      }
      capsuleEntries.length = 0;
      selectedUid = null;
      activePointerAction = null;
    };

    const populateTowerFromPlacements = (
      rapierWorld: RAPIER.World,
      bodiesToLoad?: StackerBodySnapshot[]
    ) => {
      clearAllDynamicCapsules(rapierWorld);

      if (bodiesToLoad && bodiesToLoad.length > 0) {
        for (const b of bodiesToLoad) {
          spawnCapsuleBody(rapierWorld, b.skillId, {
            uid: b.uid,
            worldWidth: b.worldWidth ?? CAPSULE_WORLD_WIDTH,
            x: b.x,
            y: b.y,
            z: b.z,
            qx: b.qx,
            qy: b.qy,
            qz: b.qz,
            qw: b.qw,
            settledAwarded: true,
          });
        }
        const match = capsuleEntries.find((c) => c.skillId === selectedSkillId);
        selectedUid = match ? match.uid : capsuleEntries[0]?.uid ?? null;
      } else {
        // Stack the 3 straight starting capsules flush on the chamber floor with varied sizes
        const biases: ('large' | 'medium' | 'small')[] = ['large', 'medium', 'small'];
        let nextBaseY = fY;
        INITIAL_TOWER_PLACEMENTS.forEach((p, idx) => {
          const variedWidth = pickRandomCapsuleWidth(biases[idx % biases.length]);
          const entry = spawnCapsuleBody(rapierWorld, p.skillId, {
            worldWidth: variedWidth,
            x: p.x,
            y: nextBaseY + 0.35,
            z: p.z,
            qx: 0,
            qy: 0,
            qz: 0,
            qw: 1,
            settledAwarded: true,
          });
          const flushY = nextBaseY + entry.halfH + 0.004;
          entry.body.setTranslation({ x: p.x, y: flushY, z: p.z }, true);
          entry.group.position.set(p.x, flushY, p.z);
          nextBaseY = flushY + entry.halfH;

          if (idx === INITIAL_TOWER_PLACEMENTS.length - 1) {
            selectedUid = entry.uid;
            selectedSkillId = p.skillId;
          }
        });
      }
    };

    const buildChamberWalls = (rapierWorld: RAPIER.World) => {
      const addWall = (cx: number, cy: number, cz: number, hx: number, hy: number, hz: number) => {
        const rb = rapierWorld.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(cx, cy, cz));
        const col = RAPIER.ColliderDesc.cuboid(hx, hy, hz)
          .setFriction(2.2)
          .setFrictionCombineRule(RAPIER.CoefficientCombineRule.Max)
          .setRestitution(0.0)
          .setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min);
        rapierWorld.createCollider(col, rb);
      };
      // Floor & Ceiling flush with visible wireframe chamber
      addWall(0, fY - 0.35, 0, w + 0.6, 0.35, CHAMBER_HALF_D + 0.8);
      addWall(0, cY + 0.35, 0, w + 0.6, 0.35, CHAMBER_HALF_D + 0.8);
      // Left & Right Walls inset slightly so outer neon rims stay strictly inside the glowing frame
      addWall(-(w - 0.04) - 0.35, (fY + cY) / 2, 0, 0.35, (cY - fY) / 2 + 0.6, CHAMBER_HALF_D + 0.8);
      addWall((w - 0.04) + 0.35, (fY + cY) / 2, 0, 0.35, (cY - fY) / 2 + 0.6, CHAMBER_HALF_D + 0.8);
      // Front & Back Invisible Glass Tank Walls
      addWall(0, (fY + cY) / 2, zBack - 0.3, w + 0.6, (cY - fY) / 2 + 0.6, 0.3);
      addWall(0, (fY + cY) / 2, zFront + 0.3, w + 0.6, (cY - fY) / 2 + 0.6, 0.3);
    };

    const computeTelemetryAndNotify = () => {
      if (!world) return;
      const samples: BodyTelemetrySample[] = capsuleEntries.map((entry) => {
        const pos = entry.body.translation();
        const rot = entry.body.rotation();
        const linvel = entry.body.linvel();
        const angvel = entry.body.angvel();

        _quatA.set(rot.x, rot.y, rot.z, rot.w);
        _eulerA.setFromQuaternion(_quatA, 'YXZ');

        return {
          uid: entry.uid,
          skillId: entry.skillId,
          x: pos.x,
          y: pos.y,
          z: pos.z,
          tiltAngleRad: _eulerA.z,
          linearSpeed: Math.hypot(linvel.x, linvel.y, linvel.z),
          angularSpeed: Math.hypot(angvel.x, angvel.y, angvel.z),
          isDragged: activePointerAction?.uid === entry.uid,
        };
      });

      const analysis = analyzeTower(samples);

      // Detect Collapse only if a tall tower drops sharply
      if (
        prevStableHeight >= 4 &&
        analysis.towerHeight <= prevStableHeight - 3 &&
        analysis.stability < 45
      ) {
        collapseNotice = 'TOWER COLLAPSED! Rebuild or Reset Stack';
        collapseTimer = 2.8;
        if (!mutedRef.current) arcadeSfx.playOrbLost();
      }
      if (!analysis.isSettling && analysis.stability >= 65) {
        prevStableHeight = Math.max(analysis.towerHeight, 1);
      }

      // Award points for new height record
      if (analysis.towerHeight > maxTowerHeight) {
        const diff = analysis.towerHeight - maxTowerHeight;
        maxTowerHeight = analysis.towerHeight;
        score += diff * 250;
        if (!mutedRef.current) arcadeSfx.playWaveClear();
        spawnPopup(0, 1.9, `NEW HEIGHT ${maxTowerHeight}x! +${diff * 250}`, '#38bdf8');
      }

      // Award newly discovered stack combos
      for (const combo of analysis.detectedCombos) {
        if (!unlockedComboIds.has(combo.id)) {
          unlockedComboIds.add(combo.id);
          score += combo.bonusPoints;
          if (!mutedRef.current) arcadeSfx.playCapsuleCatch(true);
          spawnSparks(0, 0.2, '#22d3ee', 18);
          spawnPopup(0, 1.25, `${combo.name}! +${combo.bonusPoints}`, '#22d3ee');
        }
      }

      // Award +200 for newly dropped capsules once they settle stably
      for (const entry of capsuleEntries) {
        if (!entry.settledAwarded && activePointerAction?.uid !== entry.uid) {
          const lv = entry.body.linvel();
          if (Math.hypot(lv.x, lv.y, lv.z) < 0.14) {
            entry.settledAwarded = true;
            score += 200;
            spawnPopup(entry.group.position.x, entry.group.position.y + 0.45, '+200 STACKED', '#34d399');
          }
        }
      }

      if (activePointerAction) {
        gameState = 'DRAGGING';
      } else if (collapseTimer > 0) {
        gameState = 'COLLAPSE';
      } else if (analysis.isSettling) {
        gameState = 'SETTLING';
      } else if (analysis.stability >= 65) {
        gameState = 'STABLE';
      } else {
        gameState = 'PLAYING';
      }

      const nextDropSkillId = DISPENSER_DROP_QUEUE[dropQueueIndex % DISPENSER_DROP_QUEUE.length];

      onHudUpdateRef.current({
        gameState,
        towerHeight: analysis.towerHeight,
        maxTowerHeight,
        stability: analysis.stability,
        stabilityLabel: analysis.stabilityLabel,
        skillsInPlay: analysis.skillsInPlay,
        totalTargetSkills: MAX_STACKER_CAPSULES,
        score,
        selectedUid,
        selectedSkillId,
        detectedCombos: analysis.detectedCombos,
        nextDropSkillId,
        interactionMode,
        muted: mutedRef.current,
        collapseNotice,
      });
    };

    const persistSession = () => {
      if (!world) return;
      const bodies: StackerBodySnapshot[] = capsuleEntries.map((entry) => {
        const p = entry.body.translation();
        const r = entry.body.rotation();
        return {
          uid: entry.uid,
          skillId: entry.skillId,
          worldWidth: entry.worldWidth,
          x: p.x,
          y: p.y,
          z: p.z,
          qx: r.x,
          qy: r.y,
          qz: r.z,
          qw: r.w,
        };
      });
      sessionRef.current = {
        bodies,
        score,
        maxTowerHeight,
        unlockedComboIds: [...unlockedComboIds],
        dropQueueIndex,
        selectedSkillId,
        interactionMode,
      };
    };

    // Wire external UI actions cleanly
    internalCtrlRef.current = {
      dropCapsule: () => {
        if (!world || activePointerAction) return;
        if (capsuleEntries.length >= MAX_STACKER_CAPSULES) {
          collapseNotice = `CHAMBER FULL (${MAX_STACKER_CAPSULES} / ${MAX_STACKER_CAPSULES}) · STACK OR RESET`;
          collapseTimer = 2.0;
          if (!mutedRef.current) arcadeSfx.playWallHit();
          computeTelemetryAndNotify();
          return;
        }

        const skillId = DISPENSER_DROP_QUEUE[dropQueueIndex % DISPENSER_DROP_QUEUE.length];
        const randomWidth = pickRandomCapsuleWidth();
        const halfW = randomWidth * 0.5;
        const approxHalfH = randomWidth * 0.175;
        const maxX = w - halfW - 0.08;

        // Scan open non-overlapping spawn positions from center dispenser outward
        const candidateXOffsets = [0, -0.95, 0.95, -1.9, 1.9, -2.85, 2.85];
        const candidateYs = [cY - 0.46, cY - 1.12];
        let foundSpot: { x: number; y: number } | null = null;

        for (const candY of candidateYs) {
          for (const offsetX of candidateXOffsets) {
            const candX = THREE.MathUtils.clamp(offsetX, -maxX, maxX);
            const blocked = capsuleEntries.some((e) => {
              const p = e.body.translation();
              return (
                Math.abs(p.y - candY) < e.halfH + approxHalfH + 0.1 &&
                Math.abs(p.x - candX) < e.halfW + halfW + 0.1
              );
            });
            if (!blocked) {
              foundSpot = { x: candX, y: candY };
              break;
            }
          }
          if (foundSpot) break;
        }

        if (!foundSpot) {
          collapseNotice = 'CLEAR TOP SPACE BEFORE DROPPING NEXT CAPSULE';
          collapseTimer = 1.8;
          if (!mutedRef.current) arcadeSfx.playWallHit();
          computeTelemetryAndNotify();
          return;
        }

        dropQueueIndex += 1;

        const entry = spawnCapsuleBody(world, skillId, {
          worldWidth: randomWidth,
          x: foundSpot.x,
          y: foundSpot.y,
          z: 0,
          qx: 0,
          qy: 0,
          qz: 0,
          qw: 1,
          linvelY: -1.65,
          settledAwarded: false,
        });

        selectedUid = entry.uid;
        selectedSkillId = entry.skillId;
        score += 100;
        dispenserPulse = 1.0;

        if (!mutedRef.current) arcadeSfx.playLaunch();
        spawnSparks(foundSpot.x, cY - 0.25, SKILL_REGISTRY[skillId].accentHex, 14);
        spawnPopup(foundSpot.x, foundSpot.y - 0.15, '+100 DROPPED', '#38bdf8');
        computeTelemetryAndNotify();
      },
      resetStack: () => {
        if (!world) return;
        score = 0;
        maxTowerHeight = 3;
        prevStableHeight = 3;
        collapseNotice = null;
        collapseTimer = 0;
        unlockedComboIds.clear();
        dropQueueIndex = 0;
        selectedSkillId = 'express';
        populateTowerFromPlacements(world);
        dispenserPulse = 0.65;
        if (!mutedRef.current) arcadeSfx.playWallHit();
        spawnSparks(0, -0.4, '#38bdf8', 16);
        computeTelemetryAndNotify();
      },
      clearSelection: () => {
        selectedUid = null;
        selectedSkillId = null;
        computeTelemetryAndNotify();
      },
      setInteractionMode: (mode) => {
        interactionMode = mode;
        computeTelemetryAndNotify();
      },
      rotateSelectedBy: (dx, dy, dz) => {
        if (interactionMode !== 'rotate' || !selectedUid) return;
        const entry = capsuleEntries.find((c) => c.uid === selectedUid);
        if (!entry) return;
        const rot = entry.body.rotation();
        _quatA.set(rot.x, rot.y, rot.z, rot.w);
        if (dx !== 0) {
          _quatB.setFromAxisAngle(_axisX, dx);
          _quatA.premultiply(_quatB);
        }
        if (dy !== 0) {
          _quatB.setFromAxisAngle(_axisY, dy);
          _quatA.premultiply(_quatB);
        }
        if (dz !== 0) {
          _quatB.setFromAxisAngle(_axisZ, dz);
          _quatA.premultiply(_quatB);
        }
        _quatA.normalize();
        entry.body.setRotation({ x: _quatA.x, y: _quatA.y, z: _quatA.z, w: _quatA.w }, true);
        entry.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        entry.body.wakeUp();
      },
    };

    // Pointer interaction handlers (Drag / Throw / Right-click or Rotate-mode 360° spin)
    const updateNdc = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      return true;
    };

    const getWorldOnPlane = (zPlane: number, out: THREE.Vector3) => {
      dragPlane.constant = -zPlane;
      raycaster.setFromCamera(pointerNdc, camera);
      raycaster.ray.intersectPlane(dragPlane, out);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!world) return;
      if (!updateNdc(e)) return;

      // Rotate ONLY when top header button "ROTATE 360°" is selected
      const isRotateGesture = interactionMode === 'rotate';
      raycaster.setFromCamera(pointerNdc, camera);
      const hitMeshes = capsuleEntries.map((c) => c.hitMesh);
      const hits = raycaster.intersectObjects(hitMeshes, false);

      let targetEntry: DynamicCapsuleEntry | undefined;
      if (hits.length > 0) {
        const uid = hitProxyToUid.get(hits[0].object.id);
        targetEntry = capsuleEntries.find((c) => c.uid === uid);
      } else if (isRotateGesture && selectedUid) {
        targetEntry = capsuleEntries.find((c) => c.uid === selectedUid);
      }

      if (!targetEntry) {
        return;
      }

      e.preventDefault();
      renderer.domElement.setPointerCapture(e.pointerId);

      selectedUid = targetEntry.uid;
      selectedSkillId = targetEntry.skillId;

      const bodyPos = targetEntry.body.translation();
      getWorldOnPlane(bodyPos.z, _vec3A);

      for (const other of capsuleEntries) {
        other.body.wakeUp();
      }

      if (isRotateGesture) {
        targetEntry.body.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
      } else {
        targetEntry.body.setGravityScale(0, true);
        targetEntry.body.setLinearDamping(1.8);
      }

      activePointerAction = {
        mode: isRotateGesture ? 'rotate' : 'drag',
        uid: targetEntry.uid,
        pointerId: e.pointerId,
        lastScreenX: e.clientX,
        lastScreenY: e.clientY,
        grabOffsetX: bodyPos.x - _vec3A.x,
        grabOffsetY: bodyPos.y - _vec3A.y,
        velX: 0,
        velY: 0,
        targetX: bodyPos.x,
        targetY: bodyPos.y,
      };

      renderer.domElement.style.cursor = 'grabbing';
      computeTelemetryAndNotify();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!updateNdc(e)) return;

      if (!activePointerAction) {
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(
          capsuleEntries.map((c) => c.hitMesh),
          false
        );
        renderer.domElement.style.cursor = hits.length > 0 ? 'grab' : 'default';
        return;
      }

      if (e.pointerId !== activePointerAction.pointerId) return;
      const entry = capsuleEntries.find((c) => c.uid === activePointerAction!.uid);
      if (!entry) return;

      const dxScreen = e.clientX - activePointerAction.lastScreenX;
      const dyScreen = e.clientY - activePointerAction.lastScreenY;
      activePointerAction.lastScreenX = e.clientX;
      activePointerAction.lastScreenY = e.clientY;

      if (activePointerAction.mode === 'rotate') {
        const rot = entry.body.rotation();
        _quatA.set(rot.x, rot.y, rot.z, rot.w);
        _quatB.setFromAxisAngle(_axisY, dxScreen * 0.014);
        _quatA.premultiply(_quatB);
        _quatB.setFromAxisAngle(_axisX, dyScreen * 0.014);
        _quatA.premultiply(_quatB);
        _quatA.normalize();
        entry.body.setNextKinematicRotation({ x: _quatA.x, y: _quatA.y, z: _quatA.z, w: _quatA.w });
        return;
      }

      const pos = entry.body.translation();
      getWorldOnPlane(pos.z, _vec3A);
      const clampedX = THREE.MathUtils.clamp(
        _vec3A.x + activePointerAction.grabOffsetX,
        -(w - 0.05) + entry.halfW,
        w - 0.05 - entry.halfW
      );
      const clampedY = THREE.MathUtils.clamp(
        _vec3A.y + activePointerAction.grabOffsetY,
        fY + entry.halfH + 0.01,
        cY - entry.halfH - 0.02
      );

      const moveDx = clampedX - activePointerAction.targetX;
      const moveDy = clampedY - activePointerAction.targetY;
      activePointerAction.velX = activePointerAction.velX * 0.55 + THREE.MathUtils.clamp(moveDx * 28, -6.5, 6.5) * 0.45;
      activePointerAction.velY = activePointerAction.velY * 0.55 + THREE.MathUtils.clamp(moveDy * 28, -6.5, 6.5) * 0.45;
      activePointerAction.targetX = clampedX;
      activePointerAction.targetY = clampedY;
    };

    const releasePointerAction = (e?: PointerEvent) => {
      if (!activePointerAction) return;
      if (e && e.pointerId !== activePointerAction.pointerId) return;

      const entry = capsuleEntries.find((c) => c.uid === activePointerAction!.uid);
      if (entry) {
        if (activePointerAction.mode === 'rotate') {
          entry.body.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
          entry.body.setEnabledRotations(false, false, false, true);
          entry.body.setLinvel({ x: 0, y: -0.15, z: 0 }, true);
          entry.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        } else {
          entry.body.setGravityScale(1, true);
          entry.body.setLinearDamping(0.55);
          entry.body.setEnabledTranslations(true, true, false, true);
          entry.body.setEnabledRotations(false, false, false, true);
          const releaseVx =
            Math.abs(activePointerAction.velX) < 1.35
              ? 0
              : THREE.MathUtils.clamp(activePointerAction.velX * 0.5, -4.8, 4.8);
          const releaseVy =
            Math.abs(activePointerAction.velY) < 0.8
              ? -0.2
              : THREE.MathUtils.clamp(activePointerAction.velY * 0.5, -4.8, 4.8);
          entry.body.setLinvel({ x: releaseVx, y: releaseVy, z: 0 }, true);
          entry.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        entry.body.wakeUp();
        entry.settledAwarded = false;
      }

      if (e && renderer.domElement.hasPointerCapture(e.pointerId)) {
        renderer.domElement.releasePointerCapture(e.pointerId);
      }
      activePointerAction = null;
      renderer.domElement.style.cursor = 'grab';
      computeTelemetryAndNotify();
    };

    const handleWheel = (e: WheelEvent) => {
      if (!selectedUid || interactionMode !== 'rotate') return;
      e.preventDefault();
      internalCtrlRef.current?.rotateSelectedBy(0, 0, -Math.sign(e.deltaY) * 0.14);
    };

    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', releasePointerAction);
    renderer.domElement.addEventListener('pointercancel', releasePointerAction);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    const updateSize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw <= 0 || ch <= 0) return;
      renderer.setSize(cw, ch, false);
      const aspect = cw / ch;
      camera.aspect = aspect;
      const vFovRad = THREE.MathUtils.degToRad(camera.fov);
      const minZForWidth = (w * 1.15) / (Math.tan(vFovRad / 2) * aspect);
      const minZForHeight = 3.72 / Math.tan(vFovRad / 2);
      camera.position.z = Math.max(11.1, minZForWidth, minZForHeight);
      camera.updateProjectionMatrix();
      if (composer) {
        composer.setSize(cw, ch);
        if (bloomPass) bloomPass.resolution.set(cw, ch);
      }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // Prewarm all 27 3D skill models so capsule drops have zero frame hitch
    modelLoader.prewarm(
      (Object.keys(SKILL_REGISTRY) as SkillModelId[]).map((id) => ({ skillId: id }))
    );

    let lastTs = performance.now();
    const FIXED_DT = 1 / 120;

    const tick = () => {
      if (disposed || !world) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      physicsAccum = Math.min(physicsAccum + dt, FIXED_DT * 4);
      world.timestep = FIXED_DT;

      while (physicsAccum >= FIXED_DT) {
        if (activePointerAction && activePointerAction.mode === 'drag') {
          const dragEntry = capsuleEntries.find((c) => c.uid === activePointerAction!.uid);
          if (dragEntry) {
            const p = dragEntry.body.translation();
            const vx = THREE.MathUtils.clamp((activePointerAction.targetX - p.x) * 26, -15, 15);
            const vy = THREE.MathUtils.clamp((activePointerAction.targetY - p.y) * 26, -15, 15);
            dragEntry.body.setLinvel({ x: vx, y: vy, z: 0 }, true);
            dragEntry.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
          }
        }
        world.step();

        // Arrest tiny residual lateral slip & resting micro-jitter so stacked capsules settle solidly
        for (const entry of capsuleEntries) {
          if (activePointerAction?.uid === entry.uid || entry.body.isSleeping()) continue;
          const lv = entry.body.linvel();
          if (Math.abs(lv.y) < 0.035 && Math.abs(lv.x) < 0.035) {
            if (lv.x !== 0 || lv.y !== 0) {
              entry.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
            }
          } else if (Math.abs(lv.y) < 0.09 && Math.abs(lv.x) > 0 && Math.abs(lv.x) < 0.24) {
            const dampedX = Math.abs(lv.x) < 0.035 ? 0 : lv.x * 0.55;
            entry.body.setLinvel({ x: dampedX, y: lv.y, z: 0 }, true);
          }
        }

        physicsAccum -= FIXED_DT;
      }

      // Sync Three.js 3D capsule transforms from Rapier bodies
      for (const entry of capsuleEntries) {
        const p = entry.body.translation();
        const r = entry.body.rotation();
        entry.group.position.set(p.x, p.y, p.z);
        entry.group.quaternion.set(r.x, r.y, r.z, r.w);
      }

      // Dispenser drop beam pulse animation
      if (dispenserPulse > 0) {
        dispenserPulse = Math.max(0, dispenserPulse - dt * 1.8);
      }
      beamMat.opacity = 0.28 + dispenserPulse * 0.45 + Math.sin(now * 0.003) * 0.04;
      dispCyanGlowMat.emissiveIntensity = 1.15 + dispenserPulse * 1.1;
      dispenserGroup.position.y = cY + 0.18 - dispenserPulse * 0.06;

      if (collapseTimer > 0) {
        collapseTimer = Math.max(0, collapseTimer - dt);
        if (collapseTimer === 0) collapseNotice = null;
      }

      settleCheckAccum += dt;
      if (settleCheckAccum >= 0.14) {
        settleCheckAccum = 0;
        computeTelemetryAndNotify();
      }

      // Update particles & floating popups
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
        const left = 1 - sp.age / sp.maxAge;
        (sp.sprite.material as THREE.SpriteMaterial).opacity = left;
        const sc = sp.baseScale * (0.45 + 0.55 * left);
        sp.sprite.scale.set(sc, sc, 1);
      }

      for (let i = popupPool.length - 1; i >= 0; i--) {
        const pop = popupPool[i];
        pop.age += dt;
        if (pop.age >= pop.maxAge) {
          effectsGroup.remove(pop.sprite);
          pop.mat.dispose();
          pop.tex.dispose();
          popupPool.splice(i, 1);
          continue;
        }
        pop.sprite.position.y += dt * 0.55;
        const t = pop.age / pop.maxAge;
        pop.mat.opacity = t < 0.2 ? t / 0.2 : Math.max(0, 1 - (t - 0.2) / 0.8);
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
          gl.flush();
          if (sync) {
            const checkSync = () => {
              if (disposed) {
                gl.deleteSync(sync);
                return;
              }
              const res = gl.clientWaitSync(sync, 0, 0);
              if (res === gl.TIMEOUT_EXPIRED) {
                timerId = window.setTimeout(checkSync, 12);
              } else {
                gl.deleteSync(sync);
                timerId = window.setTimeout(tick, 45);
              }
            };
            timerId = window.setTimeout(checkSync, 12);
            return;
          }
        }
        timerId = window.setTimeout(tick, 60);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    // Async initialize Rapier WASM then populate world cleanly
    RAPIER.init().then(() => {
      if (disposed) return;
      world = new RAPIER.World({ x: 0, y: -15.5, z: 0 });
      world.integrationParameters.numSolverIterations = 10;
      world.integrationParameters.numInternalPgsIterations = 2;
      world.integrationParameters.normalizedAllowedLinearError = 0.001;
      buildChamberWalls(world);
      populateTowerFromPlacements(world, saved?.bodies);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      computeTelemetryAndNotify();

      lastTs = performance.now();
      if (isSoftwareGl) {
        timerId = window.setTimeout(tick, 16);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (timerId !== null) clearTimeout(timerId);
      resizeObserver.disconnect();

      persistSession();
      internalCtrlRef.current = null;

      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', releasePointerAction);
      renderer.domElement.removeEventListener('pointercancel', releasePointerAction);
      renderer.domElement.removeEventListener('wheel', handleWheel);

      for (const sp of sparkPool) {
        effectsGroup.remove(sp.sprite);
        (sp.sprite.material as THREE.SpriteMaterial).dispose();
      }
      for (const pop of popupPool) {
        effectsGroup.remove(pop.sprite);
        pop.mat.dispose();
        pop.tex.dispose();
      }

      if (world) {
        world.free();
        world = null;
      }

      disposableGeos.forEach((g) => g.dispose());
      disposableMats.forEach((m) => m.dispose());
      disposableTexs.forEach((t) => t.dispose());
      modelLoader.disposeAll();
      envRT.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [sessionRef]);

  return (
    <div
      ref={mountRef}
      className="relative h-full w-full select-none touch-none"
      aria-label="3D Skill Jenga and Stacker Physics Arena"
    />
  );
}
