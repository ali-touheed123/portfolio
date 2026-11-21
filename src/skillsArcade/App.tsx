import { useCallback, useEffect, useRef, useState } from 'react';
import { ArenaViewportFrame } from './components/ArenaViewportFrame';
import { BackgroundDecor } from './components/BackgroundDecor';
import { LeftStatsPanel } from './components/LeftStatsPanel';
import { StackerArenaFrame } from './components/StackerArenaFrame';
import { StackerLeftPanel } from './components/StackerLeftPanel';
import { SkillBreakerEngine } from './game/physicsEngine';
import { arcadeSfx } from './game/soundEffects';
import type { HudSnapshot } from './game/types';
import type { StackerArenaController } from './gameStacker/StackerArenaCanvas';
import type {
  StackerHudSnapshot,
  StackerInteractionMode,
  StackerSessionSnapshot,
} from './gameStacker/types';

type ActiveGameId = 'breaker' | 'stacker';

const INITIAL_STACKER_HUD: StackerHudSnapshot = {
  gameState: 'STABLE',
  towerHeight: 3,
  maxTowerHeight: 3,
  stability: 98,
  stabilityLabel: 'STABLE',
  skillsInPlay: 3,
  totalTargetSkills: 20,
  score: 0,
  selectedUid: null,
  selectedSkillId: 'express',
  detectedCombos: [],
  nextDropSkillId: 'react',
  interactionMode: 'drag',
  muted: false,
  collapseNotice: null,
};

export default function App() {
  const [activeGame, setActiveGame] = useState<ActiveGameId>('breaker');

  // Game 01: Brick Breaker & Catcher persistent engine ref
  const engineRef = useRef<SkillBreakerEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SkillBreakerEngine();
  }
  const [hud, setHud] = useState<HudSnapshot>(() => engineRef.current!.getHudSnapshot());

  // Game 02: 3D Skill Jenga & Stacker controller & session persistence ref
  const stackerCtrlRef = useRef<StackerArenaController | null>(null);
  const stackerSessionRef = useRef<StackerSessionSnapshot | null>(null);
  const [stackerHud, setStackerHud] = useState<StackerHudSnapshot>(INITIAL_STACKER_HUD);

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
    setStackerHud((prev) => ({ ...prev, muted }));
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

  // Seamless game switching preserving both games cleanly
  const handleSwitchToStacker = useCallback(() => {
    const eng = engineRef.current;
    if (eng && eng.mode === 'PLAYING') {
      eng.togglePause();
      syncHud();
    }
    setStackerHud((prev) => ({ ...prev, muted: eng?.muted ?? prev.muted }));
    setActiveGame('stacker');
  }, [syncHud]);

  const handleSwitchToBreaker = useCallback(() => {
    setActiveGame('breaker');
    syncHud();
  }, [syncHud]);

  // Game 02 callbacks
  const handleDropCapsule = useCallback(() => {
    stackerCtrlRef.current?.dropCapsule();
  }, []);

  const handleResetStack = useCallback(() => {
    stackerCtrlRef.current?.resetStack();
  }, []);

  const handleClearStackerSelection = useCallback(() => {
    stackerCtrlRef.current?.clearSelection();
  }, []);

  const handleSetStackerMode = useCallback((mode: StackerInteractionMode) => {
    stackerCtrlRef.current?.setInteractionMode(mode);
  }, []);

  // Keyboard routing isolated strictly to the currently active game
  useEffect(() => {
    const keysHeld = new Set<string>();
    let rafKey = 0;

    const stepKeys = () => {
      if (activeGame === 'breaker') {
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
      } else if (stackerHud.interactionMode === 'rotate') {
        const rotLeft = keysHeld.has('KeyQ');
        const rotRight = keysHeld.has('KeyE');
        if (rotLeft) stackerCtrlRef.current?.rotateSelectedBy(0, 0, 0.055);
        if (rotRight) stackerCtrlRef.current?.rotateSelectedBy(0, 0, -0.055);
      }

      if (keysHeld.size > 0) {
        rafKey = requestAnimationFrame(stepKeys);
      } else {
        rafKey = 0;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (activeGame === 'breaker') {
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'KeyA' || e.code === 'KeyD') {
          keysHeld.add(e.code);
          if (!rafKey) rafKey = requestAnimationFrame(stepKeys);
        } else if (e.code === 'Space') {
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
      } else {
        if ((e.code === 'KeyQ' || e.code === 'KeyE') && stackerHud.interactionMode === 'rotate') {
          keysHeld.add(e.code);
          if (!rafKey) rafKey = requestAnimationFrame(stepKeys);
        } else if (e.code === 'Space') {
          e.preventDefault();
          handleDropCapsule();
        } else if (e.code === 'KeyR') {
          handleResetStack();
        } else if (e.code === 'KeyM') {
          handleToggleMute();
        }
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
  }, [
    activeGame,
    stackerHud.interactionMode,
    handleDropCapsule,
    handleLaunchOrb,
    handleResetArcade,
    handleResetStack,
    handleToggleMute,
    handleTogglePause,
  ]);

  return (
    <main className="arcade-grid-bg relative min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-6 lg:h-screen lg:overflow-hidden lg:px-10 lg:py-6">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto grid h-full max-w-[1440px] grid-cols-1 items-stretch gap-6 lg:grid-cols-[34%_1fr] lg:gap-8">
        {activeGame === 'breaker' ? (
          <>
            <LeftStatsPanel
              hud={hud}
              onLaunchOrb={handleLaunchOrb}
              onResetArcade={handleResetArcade}
              onPlayNextGame={handleSwitchToStacker}
            />

            <ArenaViewportFrame
              engineRef={engineRef}
              hud={hud}
              onHudSync={syncHud}
              onLaunchOrb={handleLaunchOrb}
              onTogglePause={handleTogglePause}
              onToggleMute={handleToggleMute}
              onSelectWave={handleSelectWave}
            />
          </>
        ) : (
          <>
            <StackerLeftPanel
              hud={stackerHud}
              onClearSelection={handleClearStackerSelection}
              onPreviousGame={handleSwitchToBreaker}
            />

            <StackerArenaFrame
              controllerRef={stackerCtrlRef}
              sessionRef={stackerSessionRef}
              hud={stackerHud}
              onHudUpdate={setStackerHud}
              onDropCapsule={handleDropCapsule}
              onResetStack={handleResetStack}
              onSetInteractionMode={handleSetStackerMode}
              onToggleMute={handleToggleMute}
            />
          </>
        )}
      </div>
    </main>
  );
}
