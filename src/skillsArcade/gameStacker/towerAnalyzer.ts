import type { SkillModelId } from '../assets3d/types';
import type { ComboDefinition, DetectedCombo, StabilityLabel } from './types';

export const CHAMBER_FLOOR_Y = -2.62;
export const CHAMBER_CEILING_Y = 2.78;
export const CHAMBER_HALF_W = 4.35;
export const CHAMBER_HALF_D = 1.15;
export const CAPSULE_WORLD_WIDTH = 1.9;
export const MAX_STACKER_CAPSULES = 20;

export const SKILL_SUBTITLES: Record<SkillModelId, string> = {
  react: 'Component Architecture • Concurrent UI State',
  nextjs: 'Full-Stack React • App Router & SSR Edge',
  nodejs: 'Event-Driven Runtime • Scalable Backend APIs',
  typescript: 'Strict Type Systems • End-to-End Safety',
  tailwindcss: 'Utility-First Design • Neon UI Engineering',
  supabase: 'Postgres BaaS • Auth, Realtime & Edge Functions',
  python: 'Backend Automation • AI & Data Pipelines',
  postgresql: 'Relational Engine • Indexed Queries & ACID',
  aws: 'Cloud Infrastructure • S3, EC2 & Serverless',
  express: 'REST API Layer • Middleware & Routing',
  docker: 'Containerization • PyntFlow ERP & DevOps',
  mongodb: 'NoSQL Document Store • MERN & Aggregation',
  mysql: 'Relational Databases • Schema Design & Tuning',
  'gsap-lenis': 'Timeline Choreography • Smooth Scroll Physics',
  motion: 'Declarative Springs • Gesture Micro-Interactions',
  webgl: 'GPU Pipeline • Real-Time Framebuffer Rendering',
  matterjs: '2D Rigid Bodies • Collision & Constraint Solvers',
  vercel: 'Global Edge Network • Instant CI/CD Deploys',
  'react-query': 'Async Server Cache • Optimistic Mutations',
  n8n: 'Workflow Orchestration • Webhooks & Integrations',
  zustand: 'Atomic State Stores • Zero-Boilerplate Stores',
  playwright: 'E2E Browser Testing • Cross-Engine Verification',
  r3f: 'Declarative Three.js • React Scene Graphs',
  shader: 'Custom GLSL • Procedural Lighting & Post-FX',
  vite: 'Instant HMR Bundler • ESM Native Tooling',
  github: 'Version Control • Actions & Automated Workflows',
  threejs: 'WebGL 3D Scenes • PBR Materials & Raycasting',
};

export const STACK_COMBOS: ComboDefinition[] = [
  {
    id: 'mern',
    name: 'MERN STACK',
    displayFormula: 'React + Express + Node + MongoDB',
    requiredSkills: ['react', 'express', 'nodejs', 'mongodb'],
    bonusPoints: 500,
  },
  {
    id: 'fullstack-js',
    name: 'FULL STACK JS',
    displayFormula: 'React + Next.js + Node.js + TypeScript',
    requiredSkills: ['react', 'nextjs', 'nodejs', 'typescript'],
    bonusPoints: 500,
  },
  {
    id: 'python-backend',
    name: 'PYTHON BACKEND',
    displayFormula: 'Python + PostgreSQL',
    requiredSkills: ['python', 'postgresql'],
    bonusPoints: 400,
  },
  {
    id: 'cloud-devops',
    name: 'CLOUD & DEVOPS',
    displayFormula: 'AWS + Docker + Node.js',
    requiredSkills: ['aws', 'docker', 'nodejs'],
    bonusPoints: 450,
  },
  {
    id: 'webgl-3d',
    name: '3D WEBGL ENGINE',
    displayFormula: 'Three.js + WebGL + Shader',
    requiredSkills: ['threejs', 'webgl', 'shader'],
    bonusPoints: 500,
  },
  {
    id: 'motion-studio',
    name: 'MOTION STUDIO',
    displayFormula: 'GSAP & Lenis + Motion + Tailwind CSS',
    requiredSkills: ['gsap-lenis', 'motion', 'tailwindcss'],
    bonusPoints: 400,
  },
];

export const CAPSULE_MIN_WIDTH = 1.42;
export const CAPSULE_MAX_WIDTH = 2.28;

export function pickRandomCapsuleWidth(bias?: 'small' | 'medium' | 'large'): number {
  if (bias === 'small') return 1.44 + Math.random() * 0.22;
  if (bias === 'medium') return 1.74 + Math.random() * 0.24;
  if (bias === 'large') return 2.04 + Math.random() * 0.24;
  const r = Math.random();
  if (r < 0.34) return 1.44 + Math.random() * 0.24;
  if (r < 0.68) return 1.74 + Math.random() * 0.24;
  return 2.02 + Math.random() * 0.26;
}

export interface InitialCapsulePlacement {
  skillId: SkillModelId;
  x: number;
  z: number;
  worldWidth: number;
}

/**
 * Clean 3-block straight starting stack (MongoDB -> Node.js -> Express)
 * with varied capsule sizes; remaining skills drop from the top dispenser.
 */
export const INITIAL_TOWER_PLACEMENTS: InitialCapsulePlacement[] = [
  { skillId: 'mongodb', x: 0.0, z: 0.0, worldWidth: 2.18 },
  { skillId: 'nodejs', x: 0.0, z: 0.0, worldWidth: 1.84 },
  { skillId: 'express', x: 0.0, z: 0.0, worldWidth: 1.54 },
];

/**
 * Full dispenser queue starting with React (completes MERN STACK on first drop),
 * followed by all remaining supplied 3D models.
 */
export const DISPENSER_DROP_QUEUE: SkillModelId[] = [
  'react',
  'docker',
  'typescript',
  'threejs',
  'python',
  'postgresql',
  'tailwindcss',
  'nextjs',
  'supabase',
  'aws',
  'vite',
  'webgl',
  'r3f',
  'mysql',
  'gsap-lenis',
  'motion',
  'shader',
  'vercel',
  'react-query',
  'zustand',
  'playwright',
  'n8n',
  'matterjs',
  'github',
  'mongodb',
  'nodejs',
  'express',
];

export interface BodyTelemetrySample {
  uid: string;
  skillId: SkillModelId;
  x: number;
  y: number;
  z: number;
  tiltAngleRad: number;
  linearSpeed: number;
  angularSpeed: number;
  isDragged: boolean;
}

export interface TowerAnalysisResult {
  towerHeight: number;
  stability: number;
  stabilityLabel: StabilityLabel;
  skillsInPlay: number;
  detectedCombos: DetectedCombo[];
  isSettling: boolean;
}

export function analyzeTower(samples: BodyTelemetrySample[]): TowerAnalysisResult {
  const active = samples.filter((s) => !s.isDragged && s.y >= CHAMBER_FLOOR_Y - 0.1);
  if (active.length === 0) {
    return {
      towerHeight: 0,
      stability: 100,
      stabilityLabel: 'STABLE',
      skillsInPlay: 0,
      detectedCombos: [],
      isSettling: false,
    };
  }

  // Group capsules into stacked vertical layers anchored from the lowest resting body
  const sortedByY = [...active].sort((a, b) => a.y - b.y);
  const floorTierY = sortedByY[0].y;
  const layerBuckets: number[] = [];
  for (const item of sortedByY) {
    const lastLayerY = layerBuckets[layerBuckets.length - 1];
    if (lastLayerY === undefined || item.y - lastLayerY >= 0.44) {
      layerBuckets.push(item.y);
    }
  }

  // Also compute physical vertical span in capsule-thickness units (~0.58 each)
  const highestY = sortedByY[sortedByY.length - 1].y;
  const spanLayers = Math.max(1, Math.round((highestY - floorTierY) / 0.57) + 1);
  const towerHeight = Math.max(layerBuckets.length, Math.min(layerBuckets.length + 1, spanLayers));

  // Center of mass horizontal alignment relative to base support footprint
  const baseSupport = sortedByY.filter((s) => s.y - floorTierY < 0.72);
  const baseMinX = Math.min(...baseSupport.map((b) => b.x)) - 0.9;
  const baseMaxX = Math.max(...baseSupport.map((b) => b.x)) + 0.9;
  const baseCenterX = (baseMinX + baseMaxX) * 0.5;
  const baseHalfSpan = Math.max(0.95, (baseMaxX - baseMinX) * 0.5);

  const avgX = active.reduce((acc, s) => acc + s.x, 0) / active.length;
  const comOffsetRatio = Math.abs(avgX - baseCenterX) / (baseHalfSpan * 1.45);

  // Average tilt & kinetic energy
  const avgTilt = active.reduce((acc, s) => acc + Math.min(1.5, Math.abs(s.tiltAngleRad)), 0) / active.length;
  const avgLinSpeed = active.reduce((acc, s) => acc + s.linearSpeed, 0) / active.length;
  const avgAngSpeed = active.reduce((acc, s) => acc + s.angularSpeed, 0) / active.length;

  const isSettling = avgLinSpeed > 0.18 || avgAngSpeed > 0.35;

  const penalty =
    Math.min(28, comOffsetRatio * 24) +
    Math.min(36, (avgTilt / 0.75) * 28) +
    Math.min(40, avgLinSpeed * 9.5 + avgAngSpeed * 4.5);

  const stability = Math.max(5, Math.min(99, Math.round(98 - penalty)));

  let stabilityLabel: StabilityLabel = 'STABLE';
  if (stability < 35) stabilityLabel = 'CRITICAL';
  else if (stability < 65) stabilityLabel = 'UNSTABLE';
  else if (stability < 88) stabilityLabel = 'BALANCED';

  // Identify capsules actively clustered inside the tower (exclude lone distant floor outliers)
  const stackedSkills = new Set<SkillModelId>();
  for (const s of active) {
    const hasSupportOrNeighbor =
      active.length <= 2 ||
      active.some(
        (other) =>
          other.uid !== s.uid &&
          Math.abs(other.x - s.x) < 2.25 &&
          Math.abs(other.y - s.y) < 1.1
      );
    if (hasSupportOrNeighbor) {
      stackedSkills.add(s.skillId);
    }
  }

  const detectedCombos: DetectedCombo[] = [];
  for (const combo of STACK_COMBOS) {
    if (combo.requiredSkills.every((req) => stackedSkills.has(req))) {
      detectedCombos.push({
        id: combo.id,
        name: combo.name,
        displayFormula: combo.displayFormula,
        bonusPoints: combo.bonusPoints,
        participatingSkills: [...combo.requiredSkills],
      });
    }
  }

  return {
    towerHeight,
    stability,
    stabilityLabel,
    skillsInPlay: active.length,
    detectedCombos,
    isSettling,
  };
}
