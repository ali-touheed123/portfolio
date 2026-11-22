import { Check, Sparkles, X } from 'lucide-react';
import { SKILL_REGISTRY } from '../assets3d/skillRegistry';
import { SKILL_SUBTITLES } from '../gameStacker/towerAnalyzer';
import type { StackerHudSnapshot } from '../gameStacker/types';

interface StackerLeftPanelProps {
  hud: StackerHudSnapshot;
  onClearSelection: () => void;
  onPreviousGame: () => void;
}

export function StackerLeftPanel({
  hud,
  onClearSelection,
  onPreviousGame,
}: StackerLeftPanelProps) {
  const selectedDef = hud.selectedSkillId ? SKILL_REGISTRY[hud.selectedSkillId] : null;
  const selectedSubtitle = hud.selectedSkillId
    ? SKILL_SUBTITLES[hud.selectedSkillId] ?? selectedDef?.subtitle ?? '3D Interactive Skill Capsule'
    : null;

  const stabilityColorClass =
    hud.stabilityLabel === 'STABLE'
      ? 'text-emerald-300'
      : hud.stabilityLabel === 'BALANCED'
        ? 'text-cyan-300'
        : hud.stabilityLabel === 'UNSTABLE'
          ? 'text-amber-300'
          : 'text-rose-400';

  const statusDotClass =
    hud.gameState === 'COLLAPSE'
      ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]'
      : hud.gameState === 'DRAGGING'
        ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
        : hud.gameState === 'SETTLING'
          ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
          : 'bg-emerald-400 shadow-[0_0_10px_#34d399]';

  return (
    <aside className="relative z-10 flex flex-col justify-between gap-3.5 py-1 lg:py-2">
      {/* Header & Typography */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/45 bg-purple-950/55 px-3 py-1 font-mono-tech text-[11px] font-semibold tracking-wider text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.22)]">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            03. SKILLS
          </span>
        </div>

        <div className="pt-0.5">
          <h1 className="font-display-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl xl:text-[42px] xl:leading-[1.06]">
            Skills I Have Developed
          </h1>
          <p className="font-script-neon neon-script-heading -mt-0.5 text-4xl leading-[1.08] sm:text-[44px] xl:text-[48px]">
            in Recent Years
          </p>
        </div>
      </div>

      {/* Stack Builder Statistics Card */}
      <div className="stats-glass-card overflow-hidden rounded-2xl p-4 sm:p-4.5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
          style={{
            background:
              'linear-gradient(90deg, transparent 5%, rgba(34,211,238,0.65) 35%, rgba(168,85,247,0.65) 68%, transparent 95%)',
          }}
        />

        {/* Status Header Row */}
        <div className="flex items-center justify-between border-b border-slate-700/45 pb-2.5">
          <div className="flex items-center gap-2 font-mono-tech text-[11px] font-semibold tracking-[0.11em]">
            <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />
            <span className="text-slate-300">GAME:</span>
            <span className="text-emerald-400">STACK BUILDER</span>
          </div>

          <div className="flex items-center gap-2 font-mono-tech text-[10px]">
            <span className="rounded border border-slate-700/70 bg-slate-900/80 px-2 py-0.5 text-slate-300 tabular-nums">
              SCORE: <strong className="text-cyan-300">{hud.score.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Tower Height / Stability / Skills in Play */}
        <div className="mt-3 space-y-1.5">
          <div>
            <div className="font-mono-tech text-[10px] font-medium tracking-[0.13em] text-slate-400">
              TOWER HEIGHT:
            </div>
            <div className="font-display-sans text-2xl font-extrabold tracking-tight text-white tabular-nums sm:text-[26px]">
              {hud.towerHeight}x STACK
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5 font-mono-tech text-[11px]">
            <span className="tracking-widest text-slate-400">STABILITY:</span>
            <span className={`font-semibold tabular-nums ${stabilityColorClass}`}>
              {hud.stability}%{' '}
              <span className="text-slate-300">
                [ <span className={stabilityColorClass}>{hud.stabilityLabel}</span> ]
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between font-mono-tech text-[11px]">
            <span className="tracking-widest text-slate-400">SKILLS IN PLAY:</span>
            <span className="font-bold text-white tabular-nums">
              {hud.skillsInPlay} / {hud.totalTargetSkills}
            </span>
          </div>
        </div>

        {/* Combo Detection Panel */}
        <div className="mt-3 rounded-xl border border-cyan-400/35 bg-[#061829]/65 px-3.5 py-2.5 shadow-[inset_0_0_20px_rgba(34,211,238,0.06)]">
          <div className="flex items-center justify-between font-mono-tech text-[10px] font-semibold tracking-[0.12em] text-cyan-300">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              COMBO DETECTED
            </span>
            {hud.detectedCombos.length > 0 && (
              <span className="text-emerald-300 tabular-nums">+{hud.detectedCombos.length} ACTIVE</span>
            )}
          </div>

          {hud.detectedCombos.length > 0 ? (
            <div className="mt-1.5 space-y-1">
              {hud.detectedCombos.slice(0, 2).map((combo) => (
                <div key={combo.id} className="flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">
                    <strong className="font-semibold text-white">{combo.name}</strong>{' '}
                    <span className="text-slate-300">({combo.displayFormula})</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">
              Stack related skills together (e.g. React + Express + Node.js + MongoDB) to trigger combos!
            </p>
          )}
        </div>

        {/* Navigation Back to Game 01 */}
        <button
          type="button"
          onClick={onPreviousGame}
          className="btn-switch-game mt-2.5 inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 font-mono-tech text-[11.5px] font-bold tracking-[0.12em] transition-all active:scale-[0.985]"
        >
          <span>[ ← PREVIOUS GAME ]</span>
        </button>
      </div>

      {/* Selected Capsule Detail Card */}
      <div className="stats-glass-card rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            SELECTED:
          </span>
          {selectedDef && (
            <button
              type="button"
              onClick={onClearSelection}
              className="cursor-pointer rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-white"
              title="Clear selection"
              aria-label="Clear selected capsule"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {selectedDef ? (
          <div className="mt-1">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: selectedDef.accentHex,
                  boxShadow: `0 0 8px ${selectedDef.glowHex}`,
                }}
              />
              <span className="font-display-sans text-[15px] font-bold text-white">
                {selectedDef.label} (3D Capsule)
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-slate-400">{selectedSubtitle}</p>
          </div>
        ) : (
          <p className="mt-1 text-[12px] text-slate-400">
            Click or drag any 3D capsule in the chamber to inspect, toss, or rotate 360°.
          </p>
        )}
      </div>
    </aside>
  );
}
