import * as THREE from 'three';
import {
  buildDockerBadge,
  buildMysqlBadge,
  buildNextjsBadge,
  buildNodejsBadge,
  buildPostgresBadge,
  buildPythonBadge,
  buildR3fBadge,
  buildReactBadge,
  buildShaderBadge,
  buildSupabaseBadge,
  buildTailwindBadge,
  buildThreejsBadge,
  buildTypescriptBadge,
  buildVercelBadge,
  buildWebglBadge,
} from './emblemsCore';
import {
  buildGithubBadge,
  buildGsapLenisBadge,
  buildMatterjsBadge,
  buildMotionBadge,
  buildN8nBadge,
  buildNeutralPlaceholderBadge,
  buildPlaywrightBadge,
  buildReactQueryBadge,
  buildViteBadge,
  buildZustandBadge,
} from './emblemsSecondary';
import { detectSoftwareWebGL, ResourceTracker } from './sharedPill';

export { detectSoftwareWebGL };

const badgeTemplateCache = new Map<string, THREE.Group>();
let sharedTracker: ResourceTracker | null = null;

function buildTemplateById(
  skillId: string,
  maxAniso: number,
  tracker: ResourceTracker
): THREE.Group {
  switch (skillId) {
    case 'react':
      return buildReactBadge(maxAniso, tracker);
    case 'nextjs':
      return buildNextjsBadge(maxAniso, tracker);
    case 'nodejs':
      return buildNodejsBadge(maxAniso, tracker);
    case 'typescript':
      return buildTypescriptBadge(maxAniso, tracker);
    case 'tailwindcss':
      return buildTailwindBadge(maxAniso, tracker);
    case 'supabase':
      return buildSupabaseBadge(maxAniso, tracker);
    case 'python':
      return buildPythonBadge(maxAniso, tracker);
    case 'postgresql':
      return buildPostgresBadge(maxAniso, tracker);
    case 'mysql':
      return buildMysqlBadge(maxAniso, tracker);
    case 'docker':
      return buildDockerBadge(maxAniso, tracker);
    case 'threejs':
      return buildThreejsBadge(maxAniso, tracker);
    case 'r3f':
      return buildR3fBadge(maxAniso, tracker);
    case 'webgl':
      return buildWebglBadge(maxAniso, tracker);
    case 'shader':
      return buildShaderBadge(maxAniso, tracker);
    case 'vercel':
      return buildVercelBadge(maxAniso, tracker);
    case 'gsap_lenis':
      return buildGsapLenisBadge(maxAniso, tracker);
    case 'motion':
      return buildMotionBadge(maxAniso, tracker);
    case 'matterjs':
      return buildMatterjsBadge(maxAniso, tracker);
    case 'react_query':
      return buildReactQueryBadge(maxAniso, tracker);
    case 'zustand':
      return buildZustandBadge(maxAniso, tracker);
    case 'n8n':
      return buildN8nBadge(maxAniso, tracker);
    case 'playwright':
      return buildPlaywrightBadge(maxAniso, tracker);
    case 'vite':
      return buildViteBadge(maxAniso, tracker);
    case 'github':
      return buildGithubBadge(maxAniso, tracker);
    case 'aws':
      return buildNeutralPlaceholderBadge(
        {
          label: 'AWS',
          rimHex: 0xf59e0b,
          emissiveHex: 0xd97706,
          glowRgba: 'rgba(245, 158, 11, 0.72)',
          bgStops: ['#2a1a0c', '#22140a', '#170d06', '#26170b'],
          accentRgb: '245, 158, 11',
          seed: 3101,
        },
        maxAniso,
        tracker
      );
    case 'express':
      return buildNeutralPlaceholderBadge(
        {
          label: 'Express',
          rimHex: 0xa78bfa,
          emissiveHex: 0x7c3aed,
          glowRgba: 'rgba(167, 139, 250, 0.72)',
          bgStops: ['#1c1833', '#151226', '#0f0c1c', '#18142b'],
          accentRgb: '167, 139, 250',
          seed: 3102,
        },
        maxAniso,
        tracker
      );
    case 'mongodb':
    default:
      return buildNeutralPlaceholderBadge(
        {
          label: skillId === 'mongodb' ? 'MongoDB' : skillId,
          rimHex: 0x22c55e,
          emissiveHex: 0x16a34a,
          glowRgba: 'rgba(34, 197, 94, 0.72)',
          bgStops: ['#0d2e1b', '#0a2315', '#06170d', '#0b2918'],
          accentRgb: '34, 197, 94',
          seed: 3103,
        },
        maxAniso,
        tracker
      );
  }
}

export function instantiateSkillBadge(skillId: string, maxAniso: number): THREE.Group {
  if (!sharedTracker) {
    sharedTracker = new ResourceTracker();
  }
  let template = badgeTemplateCache.get(skillId);
  if (!template) {
    template = buildTemplateById(skillId, maxAniso, sharedTracker);
    badgeTemplateCache.set(skillId, template);
  }
  const clone = template.clone(true);
  clone.userData.skillId = skillId;
  return clone;
}

export function disposeBadgeCache() {
  badgeTemplateCache.clear();
  if (sharedTracker) {
    sharedTracker.disposeAll();
    sharedTracker = null;
  }
}
