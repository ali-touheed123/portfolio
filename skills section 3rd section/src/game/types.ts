import type { SkillModelId } from '../assets3d/types';

export type GameMode = 'READY' | 'PLAYING' | 'PAUSED' | 'WAVE_CLEAR' | 'GAME_OVER' | 'VICTORY';

export interface BrickEntity {
  uid: string;
  skillId: SkillModelId;
  overrideRimHex?: string;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  hitSpinVelocity: number;
  hitSpinAngle: number;
  flashTimer: number;
  bobPhase: number;
}

export interface FallingCapsuleEntity {
  uid: string;
  brickUid: string;
  skillId: SkillModelId;
  overrideRimHex?: string;
  x: number;
  y: number;
  vy: number;
  vx: number;
  spinY: number;
  spinSpeed: number;
  tiltZ: number;
  width: number;
  height: number;
  active: boolean;
}

export interface ScorePopupEntity {
  uid: string;
  x: number;
  y: number;
  text: string;
  colorHex: string;
  age: number;
  maxAge: number;
}

export interface HudSnapshot {
  mode: GameMode;
  wave: number;
  score: number;
  multiplier: number;
  lives: number;
  capturedIds: SkillModelId[];
  waveSkillIds: SkillModelId[];
  waveCapturedCount: number;
  totalWaveBricks: number;
  waveBricksCleared: number;
  dockerPowerTimer: number;
  dockerPowerDuration: number;
  dockerActive: boolean;
  muted: boolean;
}
