import * as THREE from 'three';
import { buildMissingAssetPlaceholderBadge } from './badgePrimitives';
import {
  buildGsapLenisBadge,
  buildMatterjsBadge,
  buildMotionBadge,
  buildR3fBadge,
  buildShaderBadge,
  buildThreejsBadge,
  buildWebglBadge,
} from './models/modelsAnimationGraphics';
import {
  buildNextjsBadge,
  buildNodejsBadge,
  buildPostgresqlBadge,
  buildPythonBadge,
  buildReactBadge,
  buildSupabaseBadge,
  buildTailwindBadge,
  buildTypescriptBadge,
} from './models/modelsCore';
import {
  buildDockerBadge,
  buildGithubBadge,
  buildMongodbBadge,
  buildMysqlBadge,
  buildN8nBadge,
  buildVercelBadge,
  buildViteBadge,
} from './models/modelsDataInfra';
import {
  buildPlaywrightBadge,
  buildReactQueryBadge,
  buildZustandBadge,
} from './models/modelsEcosystem';
import type { BuiltSkillBadge, SkillModelId } from './types';

function constructBadge(skillId: SkillModelId, overrideRimHex?: string): BuiltSkillBadge {
  switch (skillId) {
    case 'react':
      return buildReactBadge();
    case 'nextjs':
      return buildNextjsBadge(overrideRimHex);
    case 'nodejs':
      return buildNodejsBadge();
    case 'typescript':
      return buildTypescriptBadge();
    case 'tailwindcss':
      return buildTailwindBadge();
    case 'supabase':
      return buildSupabaseBadge();
    case 'python':
      return buildPythonBadge(overrideRimHex);
    case 'postgresql':
      return buildPostgresqlBadge();
    case 'docker':
      return buildDockerBadge();
    case 'mysql':
      return buildMysqlBadge();
    case 'vercel':
      return buildVercelBadge();
    case 'github':
      return buildGithubBadge();
    case 'vite':
      return buildViteBadge();
    case 'n8n':
      return buildN8nBadge();
    case 'gsap-lenis':
      return buildGsapLenisBadge();
    case 'motion':
      return buildMotionBadge();
    case 'webgl':
      return buildWebglBadge();
    case 'matterjs':
      return buildMatterjsBadge();
    case 'r3f':
      return buildR3fBadge();
    case 'shader':
      return buildShaderBadge();
    case 'threejs':
      return buildThreejsBadge();
    case 'react-query':
      return buildReactQueryBadge();
    case 'zustand':
      return buildZustandBadge();
    case 'playwright':
      return buildPlaywrightBadge();
    case 'aws':
      return buildMissingAssetPlaceholderBadge(
        'AWS',
        '#3b1866',
        '#1d0b36',
        '#c084fc',
        '#9333ea',
        'rgba(168, 85, 247, 0.42)'
      );
    case 'express':
      return buildMissingAssetPlaceholderBadge(
        'Express',
        '#2b3140',
        '#141821',
        '#94a3b8',
        '#475569',
        'rgba(148, 163, 184, 0.35)'
      );
    case 'mongodb':
      return buildMongodbBadge();
  }
}

export class SkillModelLoader {
  private cache = new Map<string, BuiltSkillBadge>();

  /**
   * Returns a cloned Three.js Group normalized so that the capsule badge width
   * matches `targetWorldWidth` while preserving exact 3D proportions.
   */
  public instantiate(
    skillId: SkillModelId,
    targetWorldWidth = 1.54,
    overrideRimHex?: string
  ): { group: THREE.Group; width: number; height: number } {
    const key = `${skillId}:${overrideRimHex ?? ''}`;
    let proto = this.cache.get(key);
    if (!proto) {
      proto = constructBadge(skillId, overrideRimHex);
      this.cache.set(key, proto);
    }

    const cloned = proto.group.clone(true);
    const scale = targetWorldWidth / proto.width;
    cloned.scale.setScalar(scale);

    return {
      group: cloned,
      width: proto.width * scale,
      height: proto.height * scale,
    };
  }

  public prewarm(specs: { skillId: SkillModelId; overrideRimHex?: string }[]): void {
    for (const s of specs) {
      const key = `${s.skillId}:${s.overrideRimHex ?? ''}`;
      if (!this.cache.has(key)) {
        this.cache.set(key, constructBadge(s.skillId, s.overrideRimHex));
      }
    }
  }

  public disposeAll(): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();

    for (const entry of this.cache.values()) {
      entry.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) geometries.add(obj.geometry);
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of mats) {
            if (!m) continue;
            materials.add(m);
            const std = m as THREE.MeshStandardMaterial;
            if (std.map) textures.add(std.map);
            if (std.bumpMap) textures.add(std.bumpMap);
            if (std.emissiveMap) textures.add(std.emissiveMap);
          }
        }
      });
    }

    geometries.forEach((g) => g.dispose());
    textures.forEach((t) => t.dispose());
    materials.forEach((m) => m.dispose());
    this.cache.clear();
  }
}
