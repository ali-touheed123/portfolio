import type { SkillDefinition, SkillModelId } from './types';

export const SKILL_REGISTRY: Record<SkillModelId, SkillDefinition> = {
  react: {
    id: 'react',
    label: 'React',
    shortLabel: 'React',
    assetStatus: 'supplied_3d',
    accentHex: '#22d3ee',
    accentRgb: [34, 211, 238],
    glowHex: '#00dcff',
    chipBorderHex: 'rgba(34, 211, 238, 0.45)',
    waveGroup: 1,
  },
  nextjs: {
    id: 'nextjs',
    label: 'Next.js',
    shortLabel: 'Next.js',
    assetStatus: 'supplied_3d',
    accentHex: '#94a3b8',
    accentRgb: [148, 163, 184],
    glowHex: '#cbd5e1',
    chipBorderHex: 'rgba(148, 163, 184, 0.42)',
    waveGroup: 1,
  },
  nodejs: {
    id: 'nodejs',
    label: 'Node.js',
    shortLabel: 'Node.js',
    assetStatus: 'supplied_3d',
    accentHex: '#4ade80',
    accentRgb: [74, 222, 128],
    glowHex: '#26ff5c',
    chipBorderHex: 'rgba(74, 222, 128, 0.45)',
    waveGroup: 1,
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    shortLabel: 'TypeScript',
    assetStatus: 'supplied_3d',
    accentHex: '#38bdf8',
    accentRgb: [56, 189, 248],
    glowHex: '#26a8ff',
    chipBorderHex: 'rgba(56, 189, 248, 0.48)',
    waveGroup: 1,
  },
  tailwindcss: {
    id: 'tailwindcss',
    label: 'Tailwind CSS',
    shortLabel: 'Tailwind',
    assetStatus: 'supplied_3d',
    accentHex: '#2dd4bf',
    accentRgb: [45, 212, 191],
    glowHex: '#38f8ff',
    chipBorderHex: 'rgba(45, 212, 191, 0.45)',
    waveGroup: 1,
  },
  supabase: {
    id: 'supabase',
    label: 'Supabase',
    shortLabel: 'Supabase',
    assetStatus: 'supplied_3d',
    accentHex: '#34d399',
    accentRgb: [52, 211, 153],
    glowHex: '#2effb2',
    chipBorderHex: 'rgba(52, 211, 153, 0.45)',
    waveGroup: 1,
  },
  python: {
    id: 'python',
    label: 'Python',
    shortLabel: 'Python',
    assetStatus: 'supplied_3d',
    accentHex: '#facc15',
    accentRgb: [250, 204, 21],
    glowHex: '#ffca3a',
    chipBorderHex: 'rgba(250, 204, 21, 0.42)',
    waveGroup: 1,
  },
  postgresql: {
    id: 'postgresql',
    label: 'PostgreSQL',
    shortLabel: 'PostgreSQL',
    assetStatus: 'supplied_3d',
    accentHex: '#60a5fa',
    accentRgb: [96, 165, 250],
    glowHex: '#3b82f6',
    chipBorderHex: 'rgba(96, 165, 250, 0.45)',
    waveGroup: 1,
  },
  aws: {
    id: 'aws',
    label: 'AWS',
    shortLabel: 'AWS',
    assetStatus: 'missing_placeholder',
    accentHex: '#a855f7',
    accentRgb: [168, 85, 247],
    glowHex: '#a855f7',
    chipBorderHex: 'rgba(168, 85, 247, 0.45)',
    waveGroup: 1,
  },
  express: {
    id: 'express',
    label: 'Express',
    shortLabel: 'Express',
    assetStatus: 'missing_placeholder',
    accentHex: '#94a3b8',
    accentRgb: [148, 163, 184],
    glowHex: '#64748b',
    chipBorderHex: 'rgba(148, 163, 184, 0.42)',
    waveGroup: 1,
  },
  docker: {
    id: 'docker',
    label: 'Docker',
    shortLabel: 'Docker',
    assetStatus: 'supplied_3d',
    accentHex: '#38bdf8',
    accentRgb: [56, 189, 248],
    glowHex: '#3b9eff',
    chipBorderHex: 'rgba(56, 189, 248, 0.52)',
    powerUp: 'docker',
    waveGroup: 1,
  },
  mysql: {
    id: 'mysql',
    label: 'MySQL',
    shortLabel: 'MySQL',
    assetStatus: 'supplied_3d',
    accentHex: '#3b9eff',
    accentRgb: [59, 158, 255],
    glowHex: '#1a75f0',
    chipBorderHex: 'rgba(59, 158, 255, 0.45)',
    waveGroup: 2,
  },
  'gsap-lenis': {
    id: 'gsap-lenis',
    label: 'GSAP & Lenis',
    shortLabel: 'GSAP & Lenis',
    assetStatus: 'supplied_3d',
    accentHex: '#62ff47',
    accentRgb: [98, 255, 71],
    glowHex: '#32e01d',
    chipBorderHex: 'rgba(98, 255, 71, 0.45)',
    waveGroup: 2,
  },
  motion: {
    id: 'motion',
    label: 'Motion',
    shortLabel: 'Motion',
    assetStatus: 'supplied_3d',
    accentHex: '#e879f9',
    accentRgb: [232, 121, 249],
    glowHex: '#c83cff',
    chipBorderHex: 'rgba(232, 121, 249, 0.45)',
    waveGroup: 2,
  },
  webgl: {
    id: 'webgl',
    label: 'WebGL',
    shortLabel: 'WebGL',
    assetStatus: 'supplied_3d',
    accentHex: '#ff5a26',
    accentRgb: [255, 90, 38],
    glowHex: '#ff3308',
    chipBorderHex: 'rgba(255, 90, 38, 0.48)',
    waveGroup: 2,
  },
  matterjs: {
    id: 'matterjs',
    label: 'Matter.js',
    shortLabel: 'Matter.js',
    assetStatus: 'supplied_3d',
    accentHex: '#52eb5c',
    accentRgb: [82, 235, 92],
    glowHex: '#34cf3e',
    chipBorderHex: 'rgba(82, 235, 92, 0.45)',
    waveGroup: 2,
  },
  vercel: {
    id: 'vercel',
    label: 'Vercel',
    shortLabel: 'Vercel',
    assetStatus: 'supplied_3d',
    accentHex: '#e2e8f0',
    accentRgb: [226, 232, 240],
    glowHex: '#f8fafc',
    chipBorderHex: 'rgba(226, 232, 240, 0.42)',
    waveGroup: 2,
  },
  'react-query': {
    id: 'react-query',
    label: 'React Query',
    shortLabel: 'React Query',
    assetStatus: 'supplied_3d',
    accentHex: '#ff6e54',
    accentRgb: [255, 110, 84],
    glowHex: '#f24a34',
    chipBorderHex: 'rgba(255, 110, 84, 0.46)',
    waveGroup: 2,
  },
  n8n: {
    id: 'n8n',
    label: 'n8n',
    shortLabel: 'n8n',
    assetStatus: 'supplied_3d',
    accentHex: '#ff5e84',
    accentRgb: [255, 94, 132],
    glowHex: '#e63968',
    chipBorderHex: 'rgba(255, 94, 132, 0.46)',
    waveGroup: 2,
  },
  zustand: {
    id: 'zustand',
    label: 'Zustand',
    shortLabel: 'Zustand',
    assetStatus: 'supplied_3d',
    accentHex: '#f4a046',
    accentRgb: [244, 160, 70],
    glowHex: '#d97518',
    chipBorderHex: 'rgba(244, 160, 70, 0.46)',
    waveGroup: 2,
  },
  playwright: {
    id: 'playwright',
    label: 'Playwright',
    shortLabel: 'Playwright',
    assetStatus: 'supplied_3d',
    accentHex: '#3bf24e',
    accentRgb: [59, 242, 78],
    glowHex: '#1fd935',
    chipBorderHex: 'rgba(59, 242, 78, 0.45)',
    waveGroup: 2,
  },
  r3f: {
    id: 'r3f',
    label: 'R3F',
    shortLabel: 'R3F',
    assetStatus: 'supplied_3d',
    accentHex: '#5be0ff',
    accentRgb: [91, 224, 255],
    glowHex: '#22bfff',
    chipBorderHex: 'rgba(91, 224, 255, 0.45)',
    waveGroup: 2,
  },
  shader: {
    id: 'shader',
    label: 'Shader',
    shortLabel: 'Shader',
    assetStatus: 'supplied_3d',
    accentHex: '#ff5a2e',
    accentRgb: [255, 90, 46],
    glowHex: '#e63c12',
    chipBorderHex: 'rgba(255, 90, 46, 0.46)',
    waveGroup: 2,
  },
  vite: {
    id: 'vite',
    label: 'Vite',
    shortLabel: 'Vite',
    assetStatus: 'supplied_3d',
    accentHex: '#a78bfa',
    accentRgb: [167, 139, 250],
    glowHex: '#ffcc29',
    chipBorderHex: 'rgba(167, 139, 250, 0.48)',
    waveGroup: 2,
  },
  github: {
    id: 'github',
    label: 'GitHub',
    shortLabel: 'GitHub',
    assetStatus: 'supplied_3d',
    accentHex: '#e66eff',
    accentRgb: [230, 110, 255],
    glowHex: '#c228ff',
    chipBorderHex: 'rgba(230, 110, 255, 0.45)',
    waveGroup: 2,
  },
  threejs: {
    id: 'threejs',
    label: 'Three.js',
    shortLabel: 'Three.js',
    assetStatus: 'supplied_3d',
    accentHex: '#24b9ff',
    accentRgb: [36, 185, 255],
    glowHex: '#008cff',
    chipBorderHex: 'rgba(36, 185, 255, 0.46)',
    waveGroup: 2,
  },
  mongodb: {
    id: 'mongodb',
    label: 'MongoDB',
    shortLabel: 'MongoDB',
    subtitle: 'NoSQL Document Store • MERN & Aggregation',
    assetStatus: 'supplied_3d',
    accentHex: '#22c55e',
    accentRgb: [34, 197, 94],
    glowHex: '#16a34a',
    chipBorderHex: 'rgba(34, 197, 94, 0.48)',
    waveGroup: 1,
  },
};

export interface WaveSlotSpec {
  row: number;
  col: number;
  skillId: SkillModelId;
  overrideRimHex?: string;
}

/**
 * Wave 1 faithfully matches the reference screenshot 14-brick layout:
 * Row 0 (5): React | Next.js | Node.js | TypeScript | Tailwind CSS
 * Row 1 (5): Supabase | Python | PostgreSQL | AWS | Express
 * Row 2 (4): Python (purple rim glow as in screenshot) | Next.js | (center shatter/combo corridor) | Node.js (right)
 * Wait: look closely at the screenshot!
 * In the screenshot:
 * Row 0: React (col 0), Next.js (col 1), Node.js (col 2), TypeScript (col 3), Tailwind CSS (col 4)
 * Row 1: Supabase (col 0), Python (col 1), PostgreSQL (col 2), AWS (col 3), Express (col 4)
 * Row 2: Python (col 0), Next.js (col 1), [col 2 empty/broken corridor], [col 3 empty or Docker], Node.js (col 4)
 * And Docker is the falling 3D skill capsule in the middle-right!
 * Wait: there are 14 skills in Wave 1:
 * Notice Row 2 has Python (col 0), Next.js (col 1), Docker (col 3), Node.js (col 4) — OR Docker sits at col 3 (leaving col 2 as the center break lane, or col 2 has Docker)!
 * Wait let's count bricks in the screenshot:
 * Row 0: 5 bricks (React, Next.js, Node.js, TypeScript, Tailwind CSS)
 * Row 1: 5 bricks (Supabase, Python, PostgreSQL, AWS, Express)
 * Row 2: 3 intact bricks visible (Python @ col 0, Next.js @ col 1, Node.js @ col 4) + 1 shattered capsule in col 2/3 & Docker falling! That makes 14 total bricks in Wave 1!
 * Placing Docker at Row 2, Col 3 keeps all 14 bricks intact in READY state with a super clean visual rhythm matching the screenshot (col 2 open target lane or col 3 Docker ready to drop). Actually let's check: putting Python(0), Next.js(1), Docker(2), Node.js(4) or Python(0), Next.js(1), Docker(3), Node.js(4) — putting Docker at col 3 mirrors the screenshot where col 2 is the shattered target and Docker drops right below col 3!
 */
export const WAVE_1_SLOTS: WaveSlotSpec[] = [
  { row: 0, col: 0, skillId: 'react' },
  { row: 0, col: 1, skillId: 'nextjs' },
  { row: 0, col: 2, skillId: 'nodejs' },
  { row: 0, col: 3, skillId: 'typescript' },
  { row: 0, col: 4, skillId: 'tailwindcss' },

  { row: 1, col: 0, skillId: 'supabase' },
  { row: 1, col: 1, skillId: 'python' },
  { row: 1, col: 2, skillId: 'postgresql' },
  { row: 1, col: 3, skillId: 'aws' },
  { row: 1, col: 4, skillId: 'express' },

  { row: 2, col: 0, skillId: 'python', overrideRimHex: '#a855f7' },
  { row: 2, col: 1, skillId: 'nextjs', overrideRimHex: '#22d3ee' },
  { row: 2, col: 3, skillId: 'docker' },
  { row: 2, col: 4, skillId: 'nodejs' },
];

/**
 * Wave 2 unlocks the remaining 15 supplied 3D models in a full 5x3 grid!
 */
export const WAVE_2_SLOTS: WaveSlotSpec[] = [
  { row: 0, col: 0, skillId: 'threejs' },
  { row: 0, col: 1, skillId: 'r3f' },
  { row: 0, col: 2, skillId: 'webgl' },
  { row: 0, col: 3, skillId: 'shader' },
  { row: 0, col: 4, skillId: 'vite' },

  { row: 1, col: 0, skillId: 'gsap-lenis' },
  { row: 1, col: 1, skillId: 'motion' },
  { row: 1, col: 2, skillId: 'matterjs' },
  { row: 1, col: 3, skillId: 'react-query' },
  { row: 1, col: 4, skillId: 'zustand' },

  { row: 2, col: 0, skillId: 'mysql' },
  { row: 2, col: 1, skillId: 'vercel' },
  { row: 2, col: 2, skillId: 'n8n' },
  { row: 2, col: 3, skillId: 'playwright' },
  { row: 2, col: 4, skillId: 'github' },
];

export const ALL_SUPPLIED_3D_SKILL_IDS: SkillModelId[] = (
  Object.values(SKILL_REGISTRY)
    .filter((s) => s.assetStatus === 'supplied_3d' && s.id !== 'mongodb')
    .map((s) => s.id)
);

export function getWaveSlots(wave: number): WaveSlotSpec[] {
  if (wave === 1) return WAVE_1_SLOTS;
  if (wave === 2) return WAVE_2_SLOTS;

  // Wave 3+: 15 bricks rotating through all 24 supplied 3D models + docker guarantee
  const pool = [...ALL_SUPPLIED_3D_SKILL_IDS];
  const offset = ((wave - 3) * 7) % pool.length;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  const selected = rotated.slice(0, 15);
  if (!selected.includes('docker')) {
    selected[12] = 'docker';
  }
  const slots: WaveSlotSpec[] = [];
  for (let i = 0; i < 15; i++) {
    slots.push({
      row: Math.floor(i / 5),
      col: i % 5,
      skillId: selected[i],
    });
  }
  return slots;
}
