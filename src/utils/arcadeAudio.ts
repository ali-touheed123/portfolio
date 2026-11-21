class ArcadeAudioSynth {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  private tone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playLaunch() {
    this.tone(240, 620, 0.16, 'triangle', 0.09);
    this.tone(480, 880, 0.14, 'sine', 0.06, 0.05);
  }

  playWallBounce() {
    this.tone(220, 140, 0.06, 'sine', 0.045);
  }

  playPaddleBounce(powered = false) {
    if (powered) {
      this.tone(330, 560, 0.09, 'triangle', 0.08);
      this.tone(660, 880, 0.08, 'sine', 0.04, 0.03);
    } else {
      this.tone(280, 440, 0.08, 'triangle', 0.07);
    }
  }

  playBrickHit(combo = 1) {
    const pitch = Math.min(2.0, 1 + (combo - 1) * 0.08);
    this.tone(420 * pitch, 720 * pitch, 0.11, 'square', 0.04);
    this.tone(760 * pitch, 1080 * pitch, 0.09, 'sine', 0.05, 0.02);
  }

  playSkillCatch() {
    this.tone(523.25, 659.25, 0.1, 'triangle', 0.07);
    this.tone(659.25, 1046.5, 0.14, 'sine', 0.07, 0.06);
  }

  playDockerPower() {
    this.tone(261.63, 392.0, 0.12, 'sawtooth', 0.05);
    this.tone(392.0, 523.25, 0.12, 'triangle', 0.06, 0.08);
    this.tone(523.25, 783.99, 0.18, 'sine', 0.07, 0.16);
  }

  playLifeLost() {
    this.tone(320, 110, 0.28, 'sawtooth', 0.06);
  }

  playWaveClear() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, n * 1.04, 0.16, 'triangle', 0.065, idx * 0.075);
    });
  }

  playStackDrop() {
    this.tone(480, 260, 0.11, 'sine', 0.06);
  }

  playStackImpact(intensity = 0.5) {
    const vol = Math.min(0.06, Math.max(0.015, intensity * 0.05));
    this.tone(160, 75, 0.055, 'triangle', vol);
  }

  playComboUnlock() {
    this.tone(587.33, 880, 0.14, 'triangle', 0.07);
    this.tone(880, 1174.66, 0.18, 'sine', 0.07, 0.07);
  }
}

export const arcadeAudio = new ArcadeAudioSynth();
