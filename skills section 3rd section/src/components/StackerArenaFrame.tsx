import { Move, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { SKILL_REGISTRY } from '../assets3d/skillRegistry';
import { StackerArenaCanvas, type StackerArenaController } from '../gameStacker/StackerArenaCanvas';
import type {
  StackerHudSnapshot,
  StackerInteractionMode,
  StackerSessionSnapshot,
} from '../gameStacker/types';

interface StackerArenaFrameProps {
  controllerRef: React.MutableRefObject<StackerArenaController | null>;
  sessionRef: React.MutableRefObject<StackerSessionSnapshot | null>;
  hud: StackerHudSnapshot;
  onHudUpdate: (hud: StackerHudSnapshot) => void;
  onDropCapsule: () => void;
  onResetStack: () => void;
  onSetInteractionMode: (mode: StackerInteractionMode) => void;
  onToggleMute: () => void;
}

export function StackerArenaFrame({
  controllerRef,
  sessionRef,
  hud,
  onHudUpdate,
  onDropCapsule,
  onResetStack,
  onSetInteractionMode,
  onToggleMute,
}: StackerArenaFrameProps) {
  const nextSkillDef = SKILL_REGISTRY[hud.nextDropSkillId];
  const isAtLimit = hud.skillsInPlay >= hud.totalTargetSkills;

  return (
    <section className="arena-frame-shell relative z-10 flex h-full min-h-[540px] flex-col overflow-hidden rounded-2xl">
      {/* Top Arena Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-500/20 bg-[#0a0d1e]/80 px-4 py-2.5">
        <p className="font-mono-tech text-[10.5px] font-semibold tracking-[0.14em] text-slate-300/95 uppercase sm:text-[11px]">
          3D SKILL JENGA &amp; STACKER <span className="mx-1 text-slate-500">·</span>{' '}
          <span className="font-normal text-slate-400">DRAG &amp; STACK THE PILLS</span>
        </p>

        <div className="flex items-center gap-1.5">
          {/* Next Dispenser Capsule Badge */}
          <div
            className="hidden items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-900/80 px-2.5 py-1 font-mono-tech text-[10px] text-slate-300 sm:inline-flex"
            title={
              isAtLimit
                ? `Chamber limit (${hud.totalTargetSkills}/${hud.totalTargetSkills}) reached`
                : 'Next 3D skill capsule queued in the top dispenser'
            }
          >
            <span className="text-slate-400">{isAtLimit ? 'FULL:' : 'NEXT:'}</span>
            {!isAtLimit && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: nextSkillDef.accentHex }}
              />
            )}
            <span className="font-semibold text-white">
              {isAtLimit ? `${hud.skillsInPlay}/${hud.totalTargetSkills}` : nextSkillDef.shortLabel}
            </span>
          </div>

          {/* Drag vs 360° Rotate Mode Switcher */}
          <div className="inline-flex rounded-md border border-slate-700/60 bg-slate-900/80 p-0.5 font-mono-tech text-[10px]">
            <button
              type="button"
              onClick={() => onSetInteractionMode('drag')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 transition-colors ${
                hud.interactionMode === 'drag'
                  ? 'bg-cyan-500/25 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Left-click / Touch to Drag & Stack"
            >
              <Move className="h-3 w-3" />
              DRAG
            </button>
            <button
              type="button"
              onClick={() => onSetInteractionMode('rotate')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 transition-colors ${
                hud.interactionMode === 'rotate'
                  ? 'bg-purple-500/30 text-purple-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Rotate selected 3D capsule 360° in place"
            >
              <RotateCw className="h-3 w-3" />
              ROTATE 360°
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-700/60 bg-slate-900/75 p-1.5 text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
            title={hud.muted ? 'Unmute Arcade SFX (M)' : 'Mute Arcade SFX (M)'}
            aria-label={hud.muted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {hud.muted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-cyan-300" />
            )}
          </button>
        </div>
      </header>

      {/* Main 3D Rapier Physics Stage */}
      <div className="relative flex-1 overflow-hidden">
        <StackerArenaCanvas
          controllerRef={controllerRef}
          sessionRef={sessionRef}
          muted={hud.muted}
          onHudUpdate={onHudUpdate}
        />

        {/* Tower Collapse / Chamber Notice Toast */}
        {hud.collapseNotice && (
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-lg border border-rose-400/50 bg-[#1a0b1e]/90 px-4 py-1.5 font-mono-tech text-[11px] font-semibold tracking-wider text-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.28)]">
            {hud.collapseNotice}
          </div>
        )}
      </div>

      {/* Bottom Controls Hint + Drop Capsule & Reset Stack Buttons */}
      <footer className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-500/20 bg-[#0a0d1e]/85 px-4 py-2.5">
        <span className="font-mono-tech text-[10px] font-medium tracking-[0.13em] text-slate-400/90 uppercase">
          {hud.interactionMode === 'rotate'
            ? 'ROTATE MODE ACTIVE · DRAG CAPSULE OR SCROLL / Q·E TO ROTATE 360°'
            : 'DRAG TO MOVE & STACK · SELECT ROTATE 360° ABOVE TO ROTATE'}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDropCapsule}
            disabled={isAtLimit}
            className={`inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 font-mono-tech text-[11px] font-bold tracking-[0.07em] transition-all ${
              isAtLimit
                ? 'cursor-not-allowed border border-slate-700/70 bg-slate-900/70 text-slate-500'
                : 'btn-launch-orb cursor-pointer active:scale-[0.98]'
            }`}
          >
            {isAtLimit ? `[ MAX ${hud.totalTargetSkills} / ${hud.totalTargetSkills} ]` : '[ DROP CAPSULE ]'}
          </button>

          <button
            type="button"
            onClick={onResetStack}
            className="btn-reset-arcade inline-flex cursor-pointer items-center justify-center rounded-lg px-3.5 py-1.5 font-mono-tech text-[11px] font-semibold tracking-[0.07em] transition-all active:scale-[0.98]"
          >
            [ RESET STACK ]
          </button>
        </div>
      </footer>
    </section>
  );
}
