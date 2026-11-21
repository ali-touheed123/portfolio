import type { SkillModelId } from '../assets3d/types';

export type StackerGameState = 'READY' | 'PLAYING' | 'DRAGGING' | 'SETTLING' | 'STABLE' | 'COLLAPSE';

export type StabilityLabel = 'STABLE' | 'BALANCED' | 'UNSTABLE' | 'CRITICAL';

export type StackerInteractionMode = 'drag' | 'rotate';

export interface ComboDefinition {
  id: string;
  name: string;
  displayFormula: string;
  requiredSkills: SkillModelId[];
  bonusPoints: number;
}

export interface DetectedCombo {
  id: string;
  name: string;
  displayFormula: string;
  bonusPoints: number;
  participatingSkills: SkillModelId[];
}

export interface StackerBodySnapshot {
  uid: string;
  skillId: SkillModelId;
  worldWidth?: number;
  x: number;
  y: number;
  z: number;
  qx: number;
  qy: number;
  qz: number;
  qw: number;
}

export interface StackerHudSnapshot {
  gameState: StackerGameState;
  towerHeight: number;
  maxTowerHeight: number;
  stability: number;
  stabilityLabel: StabilityLabel;
  skillsInPlay: number;
  totalTargetSkills: number;
  score: number;
  selectedUid: string | null;
  selectedSkillId: SkillModelId | null;
  detectedCombos: DetectedCombo[];
  nextDropSkillId: SkillModelId;
  interactionMode: StackerInteractionMode;
  muted: boolean;
  collapseNotice: string | null;
}

export interface StackerSessionSnapshot {
  bodies: StackerBodySnapshot[];
  score: number;
  maxTowerHeight: number;
  unlockedComboIds: string[];
  dropQueueIndex: number;
  selectedSkillId: SkillModelId | null;
  interactionMode: StackerInteractionMode;
}
