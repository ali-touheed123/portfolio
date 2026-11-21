import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { ThreeArenaCanvas } from '../game/ThreeArenaCanvas';
import type { SkillBreakerEngine } from '../game/physicsEngine';
import type { HudSnapshot } from '../game/types';

interface ArenaViewportFrameProps {
  engineRef: React.MutableRefObject<SkillBreakerEngine | null>;
  hud: HudSnapshot;
  onHudSync: () => void;
  onLaunchOrb: () => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onSelectWave: (wave: number) => void;
}

export function ArenaViewportFrame({
  engineRef,
  hud,
  onHudSync,
  onLaunchOrb,
  onTogglePause,
  onToggleMute,
  onSelectWave,
}: ArenaViewportFrameProps) {
  return (
    <section className="arena-frame-shell relative z-10 flex h-full min-h-[540px] flex-col overflow-hidden rounded-2xl">
      {/* Top Arena Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-500/20 bg-[#0a0d1e]/65 px-4 py-2.5 backdrop-blur-xs">
        <p className="font-mono-tech text-[10.5px] font-semibold tracking-[0.14em] text-slate-300/95 uppercase sm:text-[11px]">
          3D SKILL BREAKER &amp; CATCHER <span className="mx-1 text-slate-500">·</span>{' '}
          <span className="font-normal text-slate-400">MOVE PADDLE TO BOUNCE &amp; COLLECT</span>
        </p>

        <div className="flex items-center gap-1.5">
          {/* Wave Selector: Wave 1 (14 screenshot bricks) vs Wave 2 (15 extra 3D models) */}
          <div className="mr-1 inline-flex rounded-md border border-slate-700/60 bg-slate-900/80 p-0.5 font-mono-tech text-[10px]">
            <button
              type="button"
              onClick={() => onSelectWave(1)}
              className={`cursor-pointer rounded px-2 py-0.5 transition-colors ${
                hud.wave === 1 ? 'bg-cyan-500/25 text-cyan-200' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Wave 1: Original 14-Brick Composition"
            >
              W1
            </button>
            <button
              type="button"
              onClick={() => onSelectWave(2)}
              className={`cursor-pointer rounded px-2 py-0.5 transition-colors ${
                hud.wave === 2 ? 'bg-purple-500/30 text-purple-200' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Wave 2: All Additional 15 Supplied 3D Models"
            >
              W2
            </button>
            {hud.wave >= 3 && (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-200">
                W{hud.wave}
              </span>
            )}
          </div>

          {(hud.mode === 'PLAYING' || hud.mode === 'PAUSED') && (
            <button
              type="button"
              onClick={onTogglePause}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-700/60 bg-slate-900/75 px-2 py-1 font-mono-tech text-[10px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
              title={hud.mode === 'PAUSED' ? 'Resume (P)' : 'Pause (P)'}
            >
              {hud.mode === 'PAUSED' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              {hud.mode === 'PAUSED' ? 'RESUME' : 'PAUSE'}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-700/60 bg-slate-900/75 p-1.5 text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
            title={hud.muted ? 'Unmute Arcade SFX (M)' : 'Mute Arcade SFX (M)'}
            aria-label={hud.muted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {hud.muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-300" />}
          </button>
        </div>
      </header>

      {/* Main Unified Three.js WebGL Stage */}
      <div className="relative flex-1 overflow-hidden">
        <ThreeArenaCanvas engineRef={engineRef} onHudSync={onHudSync} />

        {/* Bottom Control Hint */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3.5 flex justify-center">
          <span className="font-mono-tech text-[10.5px] font-medium tracking-[0.18em] text-slate-400/85 uppercase">
            ← MOUSE / TOUCH TO SLIDE →
          </span>
        </div>

        {/* Non-intrusive State Overlays */}
        {hud.mode === 'PAUSED' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#060814]/75">
            <div className="rounded-xl border border-cyan-400/40 bg-[#0b1024]/95 px-7 py-5 text-center shadow-[0_0_40px_rgba(34,211,238,0.2)]">
              <div className="font-mono-tech text-xs tracking-[0.2em] text-cyan-300">ARCADE PAUSED</div>
              <p className="mt-1.5 text-sm text-slate-300">Press Space or click Resume to continue</p>
              <button
                type="button"
                onClick={onTogglePause}
                className="btn-launch-orb mt-4 cursor-pointer rounded-lg px-5 py-2 font-mono-tech text-xs font-bold tracking-wider"
              >
                [ RESUME GAME ]
              </button>
            </div>
          </div>
        )}

        {hud.mode === 'WAVE_CLEAR' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#060814]/75">
            <div className="max-w-sm rounded-xl border border-emerald-400/45 bg-[#0b1024]/95 px-7 py-6 text-center shadow-[0_0_42px_rgba(52,211,153,0.22)]">
              <div className="font-mono-tech text-xs font-semibold tracking-[0.2em] text-emerald-400">
                WAVE {hud.wave} CLEARED!
              </div>
              <h2 className="mt-1 font-display-sans text-2xl font-bold text-white">
                {hud.wave === 1 ? 'Unlock 15 New 3D Skills' : `Ready for Wave ${hud.wave + 1}`}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {hud.wave === 1
                  ? 'Wave 2 introduces MySQL, Three.js, R3F, WebGL, Shader, Vite, GSAP & Lenis, Motion, Matter.js, React Query, Zustand, Vercel, n8n, Playwright, and GitHub.'
                  : 'All 24 supplied 3D skill models rotate in high-speed arcade formation.'}
              </p>
              <button
                type="button"
                onClick={onLaunchOrb}
                className="btn-launch-orb mt-4 cursor-pointer rounded-lg px-5 py-2.5 font-mono-tech text-xs font-bold tracking-wider"
              >
                [ LAUNCH WAVE {hud.wave + 1} ]
              </button>
            </div>
          </div>
        )}

        {hud.mode === 'GAME_OVER' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#060814]/80">
            <div className="rounded-xl border border-rose-400/45 bg-[#0b1024]/95 px-7 py-6 text-center shadow-[0_0_40px_rgba(244,63,94,0.2)]">
              <div className="font-mono-tech text-xs font-semibold tracking-[0.2em] text-rose-400">
                ORB DEPLETED
              </div>
              <div className="mt-1 font-display-sans text-3xl font-extrabold text-white tabular-nums">
                {hud.score.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Captured {hud.capturedIds.length} unique 3D skill capsules
              </p>
              <button
                type="button"
                onClick={onLaunchOrb}
                className="btn-launch-orb mt-4 cursor-pointer rounded-lg px-5 py-2.5 font-mono-tech text-xs font-bold tracking-wider"
              >
                [ PLAY AGAIN ]
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
