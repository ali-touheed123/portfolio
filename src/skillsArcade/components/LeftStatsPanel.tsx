import { Box, ShieldCheck } from 'lucide-react';
import { SKILL_REGISTRY } from '../assets3d/skillRegistry';
import type { SkillModelId } from '../assets3d/types';
import type { HudSnapshot } from '../game/types';

interface LeftStatsPanelProps {
  hud: HudSnapshot;
  onLaunchOrb: () => void;
  onResetArcade: () => void;
  onPlayNextGame?: () => void;
}

export function LeftStatsPanel({ hud, onLaunchOrb, onResetArcade, onPlayNextGame }: LeftStatsPanelProps) {
  const isPlaying = hud.mode === 'PLAYING';
  const modeLabel =
    hud.mode === 'PLAYING'
      ? 'ACTIVE'
      : hud.mode === 'PAUSED'
        ? 'PAUSED'
        : hud.mode === 'WAVE_CLEAR'
          ? 'WAVE CLEAR'
          : hud.mode === 'GAME_OVER'
            ? 'RETRY'
            : 'READY';

  const capturedCount = hud.waveCapturedCount;
  const targetCount = Math.max(1, hud.totalWaveBricks);
  const capturePct = Math.min(100, Math.round((capturedCount / targetCount) * 100));

  // Build deduplicated target skill list for the current wave while preserving order
  const uniqueWaveSkills: SkillModelId[] = [];
  for (const id of hud.waveSkillIds) {
    if (!uniqueWaveSkills.includes(id)) uniqueWaveSkills.push(id);
  }
  const capturedSet = new Set(hud.capturedIds);
  const dockerPct =
    hud.dockerPowerDuration > 0
      ? Math.min(100, Math.max(0, (hud.dockerPowerTimer / hud.dockerPowerDuration) * 100))
      : 0;

  return (
    <aside className="relative z-10 flex flex-col justify-between gap-4 py-1 lg:py-2">
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

      {/* Upgraded Cyber-Arcade Statistics Card */}
      <div className="stats-glass-card overflow-hidden rounded-2xl p-4 sm:p-5">
        {/* Top luminous accent hairline */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
          style={{
            background:
              'linear-gradient(90deg, transparent 5%, rgba(34,211,238,0.65) 35%, rgba(168,85,247,0.65) 68%, transparent 95%)',
          }}
        />

        {/* Status header row */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2 font-mono-tech text-[11px] font-semibold tracking-[0.11em]">
            <span
              className={`h-2 w-2 rounded-full ${
                hud.mode === 'GAME_OVER'
                  ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]'
                  : hud.mode === 'PAUSED'
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
              }`}
            />
            <span className="text-slate-300">ARCADE MODE:</span>
            <span
              className={
                hud.mode === 'GAME_OVER'
                  ? 'text-rose-400'
                  : hud.mode === 'PAUSED'
                    ? 'text-amber-300'
                    : 'text-emerald-400'
              }
            >
              {modeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Energy Orb Lives */}
            <div className="flex items-center gap-1" title={`${hud.lives} orbs remaining`}>
              {[0, 1, 2].map((idx) => {
                const active = idx < hud.lives;
                return (
                  <span
                    key={idx}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      active
                        ? 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.85)]'
                        : 'border border-slate-600/70 bg-slate-900/80'
                    }`}
                  />
                );
              })}
            </div>

            <span className="rounded-md border border-cyan-400/30 bg-cyan-950/50 px-2 py-0.5 font-mono-tech text-[10px] font-semibold tracking-wider text-cyan-200">
              WAVE {hud.wave}
            </span>
          </div>
        </div>

        {/* Score + Multiplier Sub-cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="stats-metric-tile rounded-xl px-3.5 py-2.5">
            <div className="font-mono-tech text-[10px] font-medium tracking-[0.13em] text-slate-400">
              SCORE
            </div>
            <div className="mt-0.5 font-display-sans text-2xl font-extrabold tracking-tight text-white tabular-nums sm:text-[30px]">
              {hud.score.toLocaleString()}
            </div>
          </div>

          <div className="stats-metric-tile rounded-xl px-3.5 py-2.5">
            <div className="font-mono-tech text-[10px] font-medium tracking-[0.13em] text-slate-400">
              MULTIPLIER
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-1">
              <span
                className={`font-display-sans text-2xl font-extrabold tabular-nums sm:text-[28px] ${
                  hud.multiplier >= 4
                    ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]'
                    : 'text-white'
                }`}
              >
                {hud.multiplier}x
              </span>
              <svg className="h-6 w-14 text-cyan-400" viewBox="0 0 72 24" fill="none">
                <path
                  d="M2 12 L14 12 L20 4 L27 20 L34 6 L40 16 L46 11 L54 13 L70 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.92"
                />
                <path
                  d="M8 14 L22 9 L31 15 L44 8 L58 14"
                  stroke="#a855f7"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  opacity="0.68"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Captured Skills Progress & Target Skill Matrix */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between font-mono-tech text-[10.5px] tracking-widest">
            <span className="text-slate-400">
              CAPTURED:{' '}
              <strong className="font-bold text-white tabular-nums">
                {capturedCount} / {targetCount}
              </strong>
            </span>
            <span className="font-semibold text-cyan-300/90 tabular-nums">{capturePct}%</span>
          </div>

          {/* Sleek progress bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/90 ring-1 ring-slate-700/40">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${capturePct}%`,
                background: 'linear-gradient(90deg, #22d3ee 0%, #818cf8 55%, #c084fc 100%)',
                boxShadow: capturePct > 0 ? '0 0 10px rgba(34,211,238,0.55)' : 'none',
              }}
            />
          </div>

          {/* Wave Skill Matrix (ghosted until caught, glowing neon when captured) */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {uniqueWaveSkills.map((skillId) => {
              const def = SKILL_REGISTRY[skillId];
              const isCaptured = capturedSet.has(skillId);
              return (
                <span
                  key={skillId}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                    isCaptured
                      ? 'skill-chip-badge text-slate-100'
                      : 'skill-chip-locked text-slate-400/80'
                  }`}
                  style={
                    isCaptured
                      ? {
                          borderColor: def.chipBorderHex,
                          boxShadow: `0 0 10px ${def.chipBorderHex.replace('0.45', '0.18')}`,
                        }
                      : undefined
                  }
                  title={
                    def.assetStatus === 'missing_placeholder'
                      ? `${def.label} (neutral placeholder — external 3D asset unavailable)`
                      : `${def.label}${isCaptured ? ' (Captured!)' : ' (Target in Arena)'}`
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor: isCaptured ? def.accentHex : '#475569',
                      boxShadow: isCaptured ? `0 0 7px ${def.glowHex}` : 'none',
                    }}
                  />
                  <span>{def.shortLabel}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onLaunchOrb}
            className="btn-launch-orb inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-2.5 font-mono-tech text-[11.5px] font-bold tracking-[0.08em] transition-all active:scale-[0.98]"
          >
            {isPlaying
              ? '[ ORB ACTIVE ]'
              : hud.mode === 'WAVE_CLEAR'
                ? '[ NEXT WAVE ]'
                : hud.mode === 'GAME_OVER'
                  ? '[ RETRY ORB ]'
                  : '[ LAUNCH ORB ]'}
          </button>

          <button
            type="button"
            onClick={onResetArcade}
            className="btn-reset-arcade inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-2.5 font-mono-tech text-[11.5px] font-semibold tracking-[0.08em] transition-all active:scale-[0.98]"
          >
            [ RESET ARCADE ]
          </button>
        </div>

        {onPlayNextGame && (
          <button
            type="button"
            onClick={onPlayNextGame}
            className="btn-switch-game mt-2.5 inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 font-mono-tech text-[11.5px] font-bold tracking-[0.12em] transition-all active:scale-[0.985]"
          >
            <span>[ PLAY NEXT GAME → ]</span>
          </button>
        )}

        {/* Paddle Power Module */}
        <div className="mt-3.5 rounded-xl border border-indigo-400/15 bg-slate-950/55 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                hud.dockerActive
                  ? 'border-sky-400/60 bg-sky-500/20 text-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.35)]'
                  : 'border-slate-700/70 bg-slate-900/80 text-slate-400'
              }`}
            >
              {hud.dockerActive ? <ShieldCheck className="h-4 w-4" /> : <Box className="h-4 w-4" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between font-mono-tech text-[10px] tracking-[0.12em] text-slate-400 uppercase">
                <span>PADDLE POWER:</span>
                {hud.dockerActive && (
                  <span className="font-semibold text-sky-300 tabular-nums">
                    {hud.dockerPowerTimer.toFixed(1)}s
                  </span>
                )}
              </div>
              <div
                className={`truncate text-[11.5px] font-medium ${
                  hud.dockerActive ? 'text-sky-200' : 'text-slate-300'
                }`}
              >
                {hud.dockerActive
                  ? 'Docker (3D Capsule) • Expanded Width • Extra Bounce'
                  : 'Standard Capsule • Catch Docker for Expanded Width'}
              </div>
            </div>
          </div>

          {hud.dockerActive && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-900">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-150"
                style={{ width: `${dockerPct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
