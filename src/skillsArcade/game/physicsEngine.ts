import { SKILL_REGISTRY, getWaveSlots } from '../assets3d/skillRegistry';
import type { SkillModelId } from '../assets3d/types';
import type {
  BrickEntity,
  FallingCapsuleEntity,
  GameMode,
  HudSnapshot,
  ScorePopupEntity,
} from './types';

export const ARENA_HALF_W = 4.6;
export const ARENA_HALF_H = 3.55;
export const PADDLE_Y = -2.68;
export const PADDLE_HEIGHT = 0.44;
export const BASE_PADDLE_WIDTH = 1.92;
export const DOCKER_PADDLE_WIDTH = 2.74;
export const ORB_RADIUS = 0.165;
export const BASE_ORB_SPEED = 5.95;
export const MAX_ORB_SPEED = 11.5;
export const DOCKER_POWER_DURATION = 15.0;

export interface EngineEventCallbacks {
  onBrickHit?: (brick: BrickEntity, impactX: number, impactY: number, broken: boolean) => void;
  onCapsuleSpawned?: (capsule: FallingCapsuleEntity) => void;
  onCapsuleCaught?: (capsule: FallingCapsuleEntity, isDocker: boolean) => void;
  onCapsuleExpired?: (capsule: FallingCapsuleEntity) => void;
  onPaddleBounce?: (x: number, y: number, dockerActive: boolean) => void;
  onWallBounce?: (x: number, y: number) => void;
  onWaveChanged?: (wave: number, bricks: BrickEntity[]) => void;
  onOrbLost?: () => void;
  onScorePopup?: (popup: ScorePopupEntity) => void;
}

export class SkillBreakerEngine {
  public mode: GameMode = 'READY';
  public wave = 1;
  public score = 0;
  public multiplier = 1;
  public lives = 3;

  public paddleX = 0;
  public paddleTargetX = 0;
  public paddleVx = 0;
  public paddleWidth = BASE_PADDLE_WIDTH;
  public paddleBounceSpring = 0;
  public aimAngle = 0;

  public orbX = 0;
  public orbY = PADDLE_Y + PADDLE_HEIGHT * 0.5 + ORB_RADIUS + 0.06;
  public orbVx = 0;
  public orbVy = 0;
  public orbTrail: { x: number; y: number }[] = [];

  public bricks: BrickEntity[] = [];
  public fallingCapsules: FallingCapsuleEntity[] = [];
  public capturedIds: SkillModelId[] = [];
  public capturedBrickUids = new Set<string>();
  public brokenBrickUids = new Set<string>();

  public dockerPowerTimer = 0;
  public paddleFlash = 0;
  public screenShake = 0;
  public elapsedTime = 0;
  public muted = false;

  private trailAccum = 0;
  private uidCounter = 1;
  private callbacks: EngineEventCallbacks;

  constructor(callbacks: EngineEventCallbacks = {}) {
    this.callbacks = callbacks;
    this.loadWave(1, true);
  }

  public setCallbacks(callbacks: EngineEventCallbacks): void {
    this.callbacks = callbacks;
  }

  private nextUid(prefix: string): string {
    this.uidCounter += 1;
    return `${prefix}_${this.uidCounter}`;
  }

  public loadWave(waveNumber: number, resetScoreAndLives = false): void {
    this.wave = waveNumber;
    if (resetScoreAndLives) {
      this.score = 0;
      this.multiplier = 1;
      this.lives = 3;
      this.capturedIds = [];
      this.capturedBrickUids.clear();
      this.brokenBrickUids.clear();
      this.dockerPowerTimer = 0;
      this.paddleWidth = BASE_PADDLE_WIDTH;
    } else {
      this.capturedBrickUids.clear();
      this.brokenBrickUids.clear();
      this.multiplier = Math.max(1, this.multiplier);
    }

    this.fallingCapsules = [];
    this.mode = 'READY';
    this.paddleX = 0;
    this.paddleTargetX = 0;
    this.paddleVx = 0;
    this.paddleBounceSpring = 0;

    const slots = getWaveSlots(waveNumber);
    const brickW = 1.56;
    const brickH = 0.54;
    const colStep = 1.72;
    const rowTopY = 2.66;
    const rowStep = 0.77;

    this.bricks = slots.map((slot) => ({
      uid: this.nextUid(`b_w${waveNumber}`),
      skillId: slot.skillId,
      overrideRimHex: slot.overrideRimHex,
      row: slot.row,
      col: slot.col,
      x: (slot.col - 2) * colStep,
      y: rowTopY - slot.row * rowStep,
      width: brickW,
      height: brickH,
      hp: 1,
      maxHp: 1,
      alive: true,
      hitSpinVelocity: 0,
      hitSpinAngle: 0,
      flashTimer: 0,
      bobPhase: slot.col * 0.75 + slot.row * 1.15,
    }));

    this.parkOrbOnPaddle();
    this.callbacks.onWaveChanged?.(this.wave, this.bricks);
  }

  public parkOrbOnPaddle(): void {
    this.orbX = this.paddleX;
    this.orbY = PADDLE_Y + PADDLE_HEIGHT * 0.5 + ORB_RADIUS + 0.06;
    this.orbVx = 0;
    this.orbVy = 0;
    this.aimAngle = 0;
    this.orbTrail = [{ x: this.orbX, y: this.orbY }];
  }

  public setAimTarget(worldX: number, worldY: number): void {
    const dx = worldX - this.orbX;
    const dy = Math.max(0.65, worldY - this.orbY);
    this.aimAngle = Math.max(-0.95, Math.min(0.95, Math.atan2(dx, dy)));
  }

  public adjustAimBy(deltaAngle: number): void {
    this.aimAngle = Math.max(-0.95, Math.min(0.95, this.aimAngle + deltaAngle));
  }

  public launchOrb(aimWorldX?: number, aimWorldY?: number): boolean {
    if (this.mode === 'PLAYING') return false;
    if (this.mode === 'GAME_OVER' || this.mode === 'VICTORY') {
      this.loadWave(1, true);
    } else if (this.mode === 'WAVE_CLEAR') {
      this.loadWave(this.wave + 1, false);
    }

    if (typeof aimWorldX === 'number') {
      this.setAimTarget(aimWorldX, typeof aimWorldY === 'number' ? aimWorldY : this.orbY + 2.4);
    }

    this.mode = 'PLAYING';
    const speed = BASE_ORB_SPEED + (this.wave - 1) * 0.65;
    this.orbVx = Math.sin(this.aimAngle) * speed;
    this.orbVy = Math.cos(this.aimAngle) * speed;
    this.orbTrail = [{ x: this.orbX, y: this.orbY }];
    this.paddleBounceSpring = 0.5;
    return true;
  }

  public resetArcade(waveNumber = 1): void {
    this.loadWave(waveNumber, true);
  }

  public togglePause(): void {
    if (this.mode === 'PLAYING') {
      this.mode = 'PAUSED';
    } else if (this.mode === 'PAUSED') {
      this.mode = 'PLAYING';
    }
  }

  public setPaddleTarget(normalizedX: number): void {
    if (this.mode !== 'PLAYING') return;
    const half = this.paddleWidth * 0.5;
    const limit = ARENA_HALF_W - half - 0.14;
    this.paddleTargetX = Math.max(-limit, Math.min(limit, normalizedX));
  }

  public movePaddleBy(deltaX: number): void {
    if (this.mode !== 'PLAYING') return;
    this.setPaddleTarget(this.paddleTargetX + deltaX);
  }

  public getHudSnapshot(): HudSnapshot {
    const cleared = this.bricks.filter((b) => !b.alive).length;
    return {
      mode: this.mode,
      wave: this.wave,
      score: this.score,
      multiplier: this.multiplier,
      lives: this.lives,
      capturedIds: [...this.capturedIds],
      waveSkillIds: this.bricks.map((b) => b.skillId),
      waveCapturedCount: this.capturedBrickUids.size,
      totalWaveBricks: this.bricks.length,
      waveBricksCleared: cleared,
      dockerPowerTimer: this.dockerPowerTimer,
      dockerPowerDuration: DOCKER_POWER_DURATION,
      dockerActive: this.dockerPowerTimer > 0,
      muted: this.muted,
    };
  }

  public step(dtRaw: number): void {
    const dt = Math.min(dtRaw, 0.033);
    this.elapsedTime += dt;

    // Paddle width smooth transition (Docker power-up expansion)
    const desiredWidth = this.dockerPowerTimer > 0 ? DOCKER_PADDLE_WIDTH : BASE_PADDLE_WIDTH;
    this.paddleWidth += (desiredWidth - this.paddleWidth) * Math.min(1, dt * 8.5);

    // Smooth paddle tracking with velocity computation for banking tilt
    const halfW = this.paddleWidth * 0.5;
    const maxPaddleX = ARENA_HALF_W - halfW - 0.14;
    const clampedTarget = Math.max(-maxPaddleX, Math.min(maxPaddleX, this.paddleTargetX));
    const prevPaddleX = this.paddleX;
    this.paddleX += (clampedTarget - this.paddleX) * Math.min(1, dt * 19);
    const instantVx = dt > 0 ? (this.paddleX - prevPaddleX) / dt : 0;
    this.paddleVx += (instantVx - this.paddleVx) * Math.min(1, dt * 14);

    this.paddleFlash = Math.max(0, this.paddleFlash - dt * 3.5);
    this.paddleBounceSpring *= Math.pow(0.008, dt);
    this.screenShake = Math.max(0, this.screenShake - dt * 5.0);

    // Animate intact bricks gently even in READY state
    for (const brick of this.bricks) {
      if (brick.flashTimer > 0) brick.flashTimer = Math.max(0, brick.flashTimer - dt * 4);
      if (Math.abs(brick.hitSpinVelocity) > 0.01) {
        brick.hitSpinAngle += brick.hitSpinVelocity * dt;
        brick.hitSpinVelocity *= Math.pow(0.08, dt);
      } else {
        brick.hitSpinVelocity = 0;
        brick.hitSpinAngle *= Math.pow(0.04, dt);
      }
    }

    if (this.mode === 'READY') {
      this.orbX = this.paddleX;
      this.orbY = PADDLE_Y + PADDLE_HEIGHT * 0.5 + ORB_RADIUS + 0.06;
      this.orbTrail = [{ x: this.orbX, y: this.orbY }];
      return;
    }

    if (this.mode !== 'PLAYING') {
      return;
    }

    if (this.dockerPowerTimer > 0) {
      this.dockerPowerTimer = Math.max(0, this.dockerPowerTimer - dt);
    }

    // Sub-step orb physics for crisp collision accuracy
    const subSteps = 3;
    const subDt = dt / subSteps;
    for (let s = 0; s < subSteps; s++) {
      this.stepOrb(subDt);
      if (this.mode !== 'PLAYING') break;
    }

    // Record orb ribbon trail
    this.trailAccum += dt;
    if (this.trailAccum >= 0.011) {
      this.trailAccum = 0;
      this.orbTrail.unshift({ x: this.orbX, y: this.orbY });
      if (this.orbTrail.length > 26) {
        this.orbTrail.pop();
      }
    }

    // Update falling 3D rotating skill capsules with organic flutter & subtle magnetic catch assist
    for (let i = this.fallingCapsules.length - 1; i >= 0; i--) {
      const cap = this.fallingCapsules[i];
      if (!cap.active) continue;
      cap.y += cap.vy * dt;
      cap.x += cap.vx * dt;
      cap.vx *= Math.pow(0.22, dt);
      cap.spinY += cap.spinSpeed * dt;
      cap.tiltZ = Math.sin(this.elapsedTime * 2.8 + i) * 0.14;

      // Subtle natural magnetic pull when capsule enters paddle capture zone
      const dyAbovePaddle = cap.y - PADDLE_Y;
      const dxToPaddle = this.paddleX - cap.x;
      if (dyAbovePaddle > 0 && dyAbovePaddle < 1.05 && Math.abs(dxToPaddle) < this.paddleWidth * 0.72) {
        cap.x += dxToPaddle * Math.min(1, dt * 4.5);
      }

      // Keep inside walls gently
      const wallMargin = cap.width * 0.5 + 0.16;
      if (cap.x < -ARENA_HALF_W + wallMargin) {
        cap.x = -ARENA_HALF_W + wallMargin;
        cap.vx = Math.abs(cap.vx);
      } else if (cap.x > ARENA_HALF_W - wallMargin) {
        cap.x = ARENA_HALF_W - wallMargin;
        cap.vx = -Math.abs(cap.vx);
      }

      // Paddle catch check
      const catchHalfW = this.paddleWidth * 0.5 + cap.width * 0.34;
      const catchTop = PADDLE_Y + PADDLE_HEIGHT * 0.5 + cap.height * 0.42;
      const catchBot = PADDLE_Y - PADDLE_HEIGHT * 0.7;

      if (cap.y <= catchTop && cap.y >= catchBot && Math.abs(cap.x - this.paddleX) <= catchHalfW) {
        cap.active = false;
        this.paddleBounceSpring = 0.75;
        this.handleCapsuleCaught(cap);
        this.fallingCapsules.splice(i, 1);
        continue;
      }

      if (cap.y < -ARENA_HALF_H - 0.5) {
        cap.active = false;
        this.callbacks.onCapsuleExpired?.(cap);
        this.fallingCapsules.splice(i, 1);
      }
    }

    // Check wave completion (when all bricks cleared and no active falling capsules left)
    const remainingBricks = this.bricks.some((b) => b.alive);
    if (!remainingBricks && this.fallingCapsules.length === 0) {
      this.mode = 'WAVE_CLEAR';
    }
  }

  private stepOrb(dt: number): void {
    this.orbX += this.orbVx * dt;
    this.orbY += this.orbVy * dt;

    // Left/Right wall bounces
    if (this.orbX - ORB_RADIUS < -ARENA_HALF_W) {
      this.orbX = -ARENA_HALF_W + ORB_RADIUS;
      this.orbVx = Math.abs(this.orbVx);
      this.callbacks.onWallBounce?.(this.orbX, this.orbY);
    } else if (this.orbX + ORB_RADIUS > ARENA_HALF_W) {
      this.orbX = ARENA_HALF_W - ORB_RADIUS;
      this.orbVx = -Math.abs(this.orbVx);
      this.callbacks.onWallBounce?.(this.orbX, this.orbY);
    }

    // Ceiling bounce
    if (this.orbY + ORB_RADIUS > ARENA_HALF_H) {
      this.orbY = ARENA_HALF_H - ORB_RADIUS;
      this.orbVy = -Math.abs(this.orbVy);
      this.callbacks.onWallBounce?.(this.orbX, this.orbY);
    }

    // Bottom miss
    if (this.orbY - ORB_RADIUS < -ARENA_HALF_H - 0.25) {
      this.lives -= 1;
      this.multiplier = 1;
      this.callbacks.onOrbLost?.();
      if (this.lives <= 0) {
        this.mode = 'GAME_OVER';
      } else {
        this.mode = 'READY';
        this.parkOrbOnPaddle();
      }
      return;
    }

    // Paddle bounce
    const paddleTop = PADDLE_Y + PADDLE_HEIGHT * 0.5;
    const paddleBottom = PADDLE_Y - PADDLE_HEIGHT * 0.35;
    const paddleHalf = this.paddleWidth * 0.5 + ORB_RADIUS * 0.45;
    if (
      this.orbVy < 0 &&
      this.orbY - ORB_RADIUS <= paddleTop &&
      this.orbY >= paddleBottom &&
      Math.abs(this.orbX - this.paddleX) <= paddleHalf
    ) {
      const hitOffset = Math.max(-1, Math.min(1, (this.orbX - this.paddleX) / (this.paddleWidth * 0.5)));
      const maxBounceAngle = 1.08; // ~62 deg max off-vertical
      const bounceAngle = hitOffset * maxBounceAngle;

      const dockerActive = this.dockerPowerTimer > 0;
      const currentSpeed = Math.hypot(this.orbVx, this.orbVy);
      const waveBaseSpeed = BASE_ORB_SPEED + (this.wave - 1) * 0.65;
      const nextSpeed = Math.min(
        MAX_ORB_SPEED,
        Math.max(waveBaseSpeed, currentSpeed * (dockerActive ? 1.04 : 1.015))
      );

      this.orbVx = Math.sin(bounceAngle) * nextSpeed;
      this.orbVy = Math.cos(bounceAngle) * nextSpeed;
      this.orbY = paddleTop + ORB_RADIUS + 0.01;
      this.paddleFlash = 1.0;
      this.paddleBounceSpring = 0.85;
      this.callbacks.onPaddleBounce?.(this.orbX, paddleTop, dockerActive);
      return;
    }

    // Brick collision
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      const hw = brick.width * 0.5;
      const hh = brick.height * 0.5;
      const closestX = Math.max(brick.x - hw, Math.min(brick.x + hw, this.orbX));
      const closestY = Math.max(brick.y - hh, Math.min(brick.y + hh, this.orbY));
      const dx = this.orbX - closestX;
      const dy = this.orbY - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= ORB_RADIUS * ORB_RADIUS) {
        // Resolve reflection normal
        const overlapX = hw + ORB_RADIUS - Math.abs(this.orbX - brick.x);
        const overlapY = hh + ORB_RADIUS - Math.abs(this.orbY - brick.y);

        if (overlapX < overlapY) {
          this.orbVx = this.orbX < brick.x ? -Math.abs(this.orbVx) : Math.abs(this.orbVx);
          this.orbX += this.orbX < brick.x ? -overlapX : overlapX;
        } else {
          this.orbVy = this.orbY < brick.y ? -Math.abs(this.orbVy) : Math.abs(this.orbVy);
          this.orbY += this.orbY < brick.y ? -overlapY : overlapY;
        }

        // Prevent flat horizontal loops
        if (Math.abs(this.orbVy) < 2.2) {
          this.orbVy = (this.orbVy >= 0 ? 1 : -1) * 2.5;
        }

        this.handleBrickImpact(brick, closestX, closestY);
        break;
      }
    }
  }

  private handleBrickImpact(brick: BrickEntity, impactX: number, impactY: number): void {
    brick.hp -= 1;
    brick.flashTimer = 1.0;
    brick.hitSpinVelocity = 16.0;
    this.screenShake = Math.min(1, this.screenShake + 0.35);

    const broken = brick.hp <= 0;
    const pts = 500 * this.multiplier;
    this.score += pts;
    this.multiplier = Math.min(8, this.multiplier + 1);

    const def = SKILL_REGISTRY[brick.skillId];
    this.callbacks.onScorePopup?.({
      uid: this.nextUid('pop'),
      x: brick.x,
      y: brick.y + 0.18,
      text: `+${pts.toLocaleString()}`,
      colorHex: brick.overrideRimHex ?? def.accentHex,
      age: 0,
      maxAge: 0.95,
    });

    if (broken) {
      brick.alive = false;
      this.brokenBrickUids.add(brick.uid);

      const capsule: FallingCapsuleEntity = {
        uid: this.nextUid('cap'),
        brickUid: brick.uid,
        skillId: brick.skillId,
        overrideRimHex: brick.overrideRimHex,
        x: brick.x,
        y: brick.y,
        vy: -2.0 - (this.wave - 1) * 0.45,
        vx: (Math.random() - 0.5) * 0.55,
        spinY: 0,
        spinSpeed: 4.4 + (this.wave - 1) * 0.8,
        tiltZ: 0.14,
        width: 1.26,
        height: 0.44,
        active: true,
      };
      this.fallingCapsules.push(capsule);
      this.callbacks.onCapsuleSpawned?.(capsule);
    }

    this.callbacks.onBrickHit?.(brick, impactX, impactY, broken);
  }

  private handleCapsuleCaught(capsule: FallingCapsuleEntity): void {
    const def = SKILL_REGISTRY[capsule.skillId];
    const isDocker = def.powerUp === 'docker';

    this.capturedBrickUids.add(capsule.brickUid);
    if (!this.capturedIds.includes(capsule.skillId)) {
      this.capturedIds.push(capsule.skillId);
    }

    const bonus = (isDocker ? 1000 : 500) * this.multiplier;
    this.score += bonus;

    if (isDocker) {
      this.dockerPowerTimer = DOCKER_POWER_DURATION;
      this.paddleFlash = 1.25;
    }

    this.callbacks.onScorePopup?.({
      uid: this.nextUid('pop'),
      x: capsule.x,
      y: PADDLE_Y + 0.55,
      text: isDocker ? `DOCKER POWER! +${bonus}` : `+${bonus}`,
      colorHex: isDocker ? '#39FF14' : def.accentHex,
      age: 0,
      maxAge: 1.1,
    });

    this.callbacks.onCapsuleCaught?.(capsule, isDocker);
  }
}
