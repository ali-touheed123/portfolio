class ArcadeSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playLaunch(): void {
    this.playTone(260, 740, 0.16, 'triangle', 0.12);
    this.playTone(520, 1040, 0.14, 'sine', 0.08, 0.05);
  }

  public playPaddleHit(dockerPowered: boolean): void {
    this.playTone(dockerPowered ? 340 : 280, dockerPowered ? 620 : 480, 0.09, 'triangle', 0.13);
  }

  public playWallHit(): void {
    this.playTone(220, 170, 0.05, 'sine', 0.07);
  }

  public playBrickBreak(multiplier: number): void {
    const base = 420 + Math.min(multiplier, 8) * 55;
    this.playTone(base, base * 1.45, 0.11, 'sawtooth', 0.08);
    this.playTone(base * 1.5, base * 2.0, 0.12, 'sine', 0.09, 0.03);
  }

  public playCapsuleCatch(isDocker: boolean): void {
    if (isDocker) {
      this.playTone(440, 880, 0.14, 'triangle', 0.14);
      this.playTone(660, 1320, 0.22, 'sine', 0.12, 0.07);
      this.playTone(880, 1760, 0.24, 'triangle', 0.1, 0.14);
    } else {
      this.playTone(587, 880, 0.1, 'sine', 0.11);
      this.playTone(880, 1175, 0.14, 'triangle', 0.1, 0.06);
    }
  }

  public playWaveClear(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      this.playTone(f, f * 1.04, 0.18, 'triangle', 0.11, idx * 0.08);
    });
  }

  public playOrbLost(): void {
    this.playTone(300, 110, 0.28, 'sawtooth', 0.1);
  }
}

export const arcadeSfx = new ArcadeSoundEngine();
