import type * as THREE from 'three';

export type SkillModelId =
  | 'react'
  | 'nextjs'
  | 'nodejs'
  | 'typescript'
  | 'tailwindcss'
  | 'supabase'
  | 'python'
  | 'postgresql'
  | 'aws'
  | 'express'
  | 'docker'
  | 'mysql'
  | 'gsap-lenis'
  | 'motion'
  | 'webgl'
  | 'matterjs'
  | 'vercel'
  | 'react-query'
  | 'n8n'
  | 'zustand'
  | 'playwright'
  | 'r3f'
  | 'shader'
  | 'vite'
  | 'github'
  | 'threejs'
  | 'mongodb';

export type AssetStatus = 'supplied_3d' | 'missing_placeholder';

export interface SkillDefinition {
  id: SkillModelId;
  label: string;
  shortLabel: string;
  subtitle?: string;
  assetStatus: AssetStatus;
  accentHex: string;
  accentRgb: [number, number, number];
  glowHex: string;
  chipBorderHex: string;
  powerUp?: 'docker';
  waveGroup: 1 | 2;
}

export interface BuiltSkillBadge {
  group: THREE.Group;
  width: number;
  height: number;
  depth: number;
}
