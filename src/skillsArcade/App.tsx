import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcadeLedgeMorph } from './components/ArcadeLedgeMorph';
import { ArenaViewportFrame } from './components/ArenaViewportFrame';
import { BackgroundDecor } from './components/BackgroundDecor';
import { SkillBreakerEngine } from './game/physicsEngine';
import { arcadeSfx } from './game/soundEffects';
import type { HudSnapshot } from './game/types';

export default function App() {
  const mainRef = useRef<HTMLElement>(null);
  const revealContainerRef = useRef<HTMLDivElement>(null);
  const arcadeFrameRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SkillBreakerEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SkillBreakerEngine();
  }
  const [hud, setHud] = useState<HudSnapshot>(() => engineRef.current!.getHudSnapshot());

  const syncHud = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    setHud(eng.getHudSnapshot());
  }, []);

  const handleLaunchOrb = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    if (eng.mode === 'PAUSED') {
      eng.togglePause();
    } else if (eng.launchOrb()) {
      arcadeSfx.playLaunch();
    }
    syncHud();
  }, [syncHud]);

  const handleResetArcade = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.resetArcade(1);
    syncHud();
  }, [syncHud]);

  const handleTogglePause = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.togglePause();
    syncHud();
  }, [syncHud]);

  const handleToggleMute = useCallback(() => {
    const muted = arcadeSfx.toggleMute();
    if (engineRef.current) {
      engineRef.current.muted = muted;
      syncHud();
    }
  }, [syncHud]);

  const handleSelectWave = useCallback(
    (wave: number) => {
      const eng = engineRef.current;
      if (!eng) return;
      eng.loadWave(wave, false);
      syncHud();
    },
    [syncHud]
  );

  useEffect(() => {
    const keysHeld = new Set<string>();
    let rafKey = 0;

    const stepKeys = () => {
      const eng = engineRef.current;
      if (eng) {
        const left = keysHeld.has('ArrowLeft') || keysHeld.has('KeyA');
        const right = keysHeld.has('ArrowRight') || keysHeld.has('KeyD');
        if (eng.mode === 'READY') {
          if (left) eng.adjustAimBy(-0.032);
          if (right) eng.adjustAimBy(0.032);
        } else if (eng.mode === 'PLAYING') {
          if (left) eng.movePaddleBy(-0.16);
          if (right) eng.movePaddleBy(0.16);
        }
      }

      if (keysHeld.size > 0) {
        rafKey = requestAnimationFrame(stepKeys);
      } else {
        rafKey = 0;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'KeyA' || e.code === 'KeyD') {
        keysHeld.add(e.code);
        if (!rafKey) rafKey = requestAnimationFrame(stepKeys);
      } else if (e.code === 'Space') {
        const stackEl = document.getElementById('stack');
        if (!stackEl) return;
        const rect = stackEl.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
        if (!inView) return;
        e.preventDefault();
        const eng = engineRef.current;
        if (!eng) return;
        if (eng.mode === 'PLAYING' || eng.mode === 'PAUSED') {
          handleTogglePause();
        } else {
          handleLaunchOrb();
        }
      } else if (e.code === 'KeyP') {
        handleTogglePause();
      } else if (e.code === 'KeyR') {
        handleResetArcade();
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.delete(e.code);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (rafKey) cancelAnimationFrame(rafKey);
    };
  }, [handleLaunchOrb, handleResetArcade, handleToggleMute, handleTogglePause]);

  return (
    <main
      ref={mainRef}
      className="relative w-full overflow-hidden bg-transparent -mt-14 sm:-mt-16 lg:-mt-24 pt-24 pb-10 sm:px-6 sm:pt-28 lg:px-10 lg:pt-36 lg:pb-14 px-4"
    >
      {/* Feathered Grid & Ambient Neon Glows (fades seamlessly from transparent at top & bottom) */}
      <div
        aria-hidden="true"
        className="arcade-grid-bg pointer-events-none absolute inset-0 z-0 mask-[linear-gradient(to_bottom,transparent_0%,black_14%,black_88%,transparent_100%)]"
      />
      <BackgroundDecor />
      <ArcadeLedgeMorph
        sectionRef={mainRef}
        revealContainerRef={revealContainerRef}
        anchorRef={arcadeFrameRef}
      />

      <div
        ref={revealContainerRef}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 will-change-[opacity,transform]"
      >
        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:pr-70 md:pr-82.5 lg:pr-97.5 xl:pr-107.5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-900/12 bg-white/90 text-xl text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.08)] dark:border-white/22 dark:bg-[#1A1A1A]/75 dark:text-white dark:shadow-[0_0_20px_rgba(57,255,20,0.14)] transition-colors duration-700"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(22,163,74,0.5)] dark:bg-[#39FF14] dark:shadow-[0_0_10px_#39FF14] animate-pulse" />
                My Skills
              </span>
            </div>

            <div>
              <h2 className="font-display-sans text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl xl:text-[42px] xl:leading-[1.06] transition-colors duration-700">
                Skills I Have Developed{' '}
                <span className="font-script-neon neon-script-heading font-normal">
                  in Recent Years
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Full-Width 3D Skill Breaker & Catcher Game with Perched Character Morph */}
        <div
          ref={arcadeFrameRef}
          className="relative mt-20 sm:mt-4 lg:mt-0 h-130 sm:h-145 lg:h-160 w-full"
        >
          <ArenaViewportFrame
            engineRef={engineRef}
            hud={hud}
            onHudSync={syncHud}
            onLaunchOrb={handleLaunchOrb}
            onResetArcade={handleResetArcade}
            onTogglePause={handleTogglePause}
            onToggleMute={handleToggleMute}
            onSelectWave={handleSelectWave}
          />
        </div>
      </div>
    </main>
  );
}
