import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ThreeArenaCanvas } from '../game/ThreeArenaCanvas';
import type { SkillBreakerEngine } from '../game/physicsEngine';
import type { HudSnapshot } from '../game/types';

interface ArenaViewportFrameProps {
  engineRef: React.MutableRefObject<SkillBreakerEngine | null>;
  hud: HudSnapshot;
  onHudSync: () => void;
  onLaunchOrb: () => void;
  onResetArcade: () => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onSelectWave: (wave: number) => void;
}

export function ArenaViewportFrame({
  engineRef,
  hud,
  onHudSync,
  onLaunchOrb,
  onResetArcade,
  onTogglePause,
  onToggleMute,
  onSelectWave,
}: ArenaViewportFrameProps) {
  return (
    <section className="arena-frame-shell relative z-10 flex h-full min-h-[480px] flex-col overflow-hidden rounded-2xl transition-colors duration-700">
      {/* Top Arena Header Bar — Crisp Light in Day, Deep Obsidian in Night */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900/10 bg-white/95 px-3.5 py-2.5 sm:px-4 backdrop-blur-xs dark:border-white/12 dark:bg-[#0d0d0d]/90 transition-colors duration-700">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono-tech text-[10.5px] font-semibold tracking-[0.14em] text-slate-700 uppercase sm:text-[11px] dark:text-slate-300/95">
            3D SKILL BREAKER &amp; CATCHER
          </p>

          <div className="flex items-center gap-2 font-mono-tech text-[10px]">
            <span className="rounded border border-slate-900/10 bg-slate-100 px-2 py-0.5 text-slate-600 tabular-nums dark:border-white/10 dark:bg-[#1A1A1A] dark:text-slate-300">
              SCORE <strong className="text-slate-900 dark:text-white">{hud.score.toLocaleString()}</strong>
            </span>
            <div className="flex items-center gap-1" title={`${hud.lives} orbs remaining`}>
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`h-2 w-2 rounded-full transition-all ${
                    idx < hud.lives
                      ? 'bg-emerald-600 shadow-[0_0_8px_rgba(22,163,74,0.65)] dark:bg-[#39FF14] dark:shadow-[0_0_8px_rgba(57,255,20,0.85)]'
                      : 'border border-slate-900/15 bg-slate-200 dark:border-white/15 dark:bg-[#1A1A1A]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Wave Selector */}
          <div className="mr-0.5 inline-flex rounded-md border border-slate-900/10 bg-slate-100 p-0.5 font-mono-tech text-[10px] dark:border-white/12 dark:bg-[#1A1A1A]">
            <button
              type="button"
              onClick={() => onSelectWave(1)}
              className={`cursor-pointer rounded px-2 py-0.5 transition-colors ${
                hud.wave === 1
                  ? 'bg-emerald-600/15 font-semibold text-emerald-700 dark:bg-[#39FF14]/20 dark:text-[#39FF14]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Wave 1: Core Stack"
            >
              W1
            </button>
            <button
              type="button"
              onClick={() => onSelectWave(2)}
              className={`cursor-pointer rounded px-2 py-0.5 transition-colors ${
                hud.wave === 2
                  ? 'bg-rose-600/15 font-semibold text-rose-600 dark:bg-[#FF073A]/25 dark:text-[#FF073A]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Wave 2: Extended 3D Stack"
            >
              W2
            </button>
            {hud.wave >= 3 && (
              <span className="rounded bg-emerald-600/15 px-2 py-0.5 text-emerald-700 dark:bg-[#39FF14]/20 dark:text-[#39FF14]">
                W{hud.wave}
              </span>
            )}
          </div>

          {hud.mode === 'READY' && (
            <button
              type="button"
              onClick={onLaunchOrb}
              className="btn-launch-orb inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 font-mono-tech text-[10px] font-bold tracking-wider"
            >
              LAUNCH
            </button>
          )}

          {(hud.mode === 'PLAYING' || hud.mode === 'PAUSED') && (
            <button
              type="button"
              onClick={onTogglePause}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-900/12 bg-slate-100 px-2 py-1 font-mono-tech text-[10px] text-slate-700 transition-colors hover:border-emerald-600/50 hover:text-slate-900 dark:border-white/12 dark:bg-[#1A1A1A] dark:text-slate-300 dark:hover:border-[#39FF14]/50 dark:hover:text-white"
              title={hud.mode === 'PAUSED' ? 'Resume (P)' : 'Pause (P)'}
            >
              {hud.mode === 'PAUSED' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              <span className="hidden sm:inline">{hud.mode === 'PAUSED' ? 'RESUME' : 'PAUSE'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetArcade}
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-900/12 bg-slate-100 p-1.5 text-slate-600 transition-colors hover:border-rose-600/60 hover:text-rose-600 dark:border-white/12 dark:bg-[#1A1A1A] dark:text-slate-300 dark:hover:border-[#FF073A]/60 dark:hover:text-[#FF073A]"
            title="Reset Arcade (R)"
            aria-label="Reset Arcade"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-900/12 bg-slate-100 p-1.5 text-slate-600 transition-colors hover:border-emerald-600/50 hover:text-slate-900 dark:border-white/12 dark:bg-[#1A1A1A] dark:text-slate-300 dark:hover:border-[#39FF14]/50 dark:hover:text-white"
            title={hud.muted ? 'Unmute Arcade SFX (M)' : 'Mute Arcade SFX (M)'}
            aria-label={hud.muted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {hud.muted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-600 dark:text-[#FF073A]" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#39FF14]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Unified Three.js WebGL Stage (keeps dark #090D16 playfield for 3D icon clarity) */}
      <div className="relative flex-1 overflow-hidden bg-[#090D16]">
        <ThreeArenaCanvas engineRef={engineRef} onHudSync={onHudSync} />

        {/* Bottom Control Hint */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3.5 flex justify-center">
          <span className="font-mono-tech text-[10px] sm:text-[10.5px] font-medium tracking-[0.16em] text-slate-400/85 uppercase text-center px-3">
            {hud.mode === 'READY'
              ? 'AIM & CLICK ARENA TO LAUNCH · ← MOUSE / TOUCH TO SLIDE →'
              : '← MOUSE / TOUCH TO SLIDE →'}
          </span>
        </div>

        {/* Non-intrusive State Overlays */}
        {hud.mode === 'PAUSED' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs dark:bg-[#000000]/80">
            <div className="rounded-xl border border-emerald-600/40 bg-white/95 px-7 py-5 text-center shadow-2xl dark:border-[#39FF14]/45 dark:bg-[#1A1A1A]/95 dark:shadow-[0_0_40px_rgba(57,255,20,0.2)]">
              <div className="font-mono-tech text-xs font-semibold tracking-[0.2em] text-emerald-700 dark:text-[#39FF14]">
                ARCADE PAUSED
              </div>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                Press Space or click Resume to continue
              </p>
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
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs dark:bg-[#000000]/80">
            <div className="max-w-sm rounded-xl border border-emerald-600/40 bg-white/95 px-7 py-6 text-center shadow-2xl dark:border-[#39FF14]/45 dark:bg-[#1A1A1A]/95 dark:shadow-[0_0_42px_rgba(57,255,20,0.22)]">
              <div className="font-mono-tech text-xs font-semibold tracking-[0.2em] text-emerald-700 dark:text-[#39FF14]">
                WAVE {hud.wave} CLEARED!
              </div>
              <h2 className="mt-1 font-display-sans text-2xl font-bold text-slate-900 dark:text-white">
                {hud.wave === 1 ? 'Unlock 15 New 3D Skills' : `Ready for Wave ${hud.wave + 1}`}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
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
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs dark:bg-[#000000]/85">
            <div className="rounded-xl border border-rose-600/40 bg-white/95 px-7 py-6 text-center shadow-2xl dark:border-[#FF073A]/45 dark:bg-[#1A1A1A]/95 dark:shadow-[0_0_40px_rgba(255,7,58,0.22)]">
              <div className="font-mono-tech text-xs font-semibold tracking-[0.2em] text-rose-600 dark:text-[#FF073A]">
                ORB DEPLETED
              </div>
              <div className="mt-1 font-display-sans text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {hud.score.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
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
