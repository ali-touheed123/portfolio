import React, { memo, useEffect, useRef, useState } from 'react';

interface EntryCurtainProps {
  onCurtainOpenStart?: () => void;
  onCurtainComplete?: () => void;
}

const CURTAIN_PANELS = [
  { id: 'col-1', delay: 0.0 },
  { id: 'col-2', delay: 0.09 },
  { id: 'col-3', delay: 0.18 },
  { id: 'col-4', delay: 0.27 },
];

/**
 * 4-Column Lime Green Stepped Shutter Reveal.
 *
 * 1. Exactly 4 equal 25% columns (w-1/4) with distinct vertical seams.
 * 2. High-energy Lime Green (#a3e635) with deep contrast typography.
 * 3. Instant system-font rendering: zero font-loading delay so name is visible immediately.
 * 4. 650ms reading hold time so "ALI TOUHEED" registers clearly before lift begins.
 * 5. Smooth 1.05s cubic-bezier(0.65, 0, 0.25, 1) cascade wave (0ms, 90ms, 180ms, 270ms).
 * 6. Brand lockup rides smoothly upward in lockstep with the shutters.
 */
export const EntryCurtain: React.FC<EntryCurtainProps> = memo(({
  onCurtainOpenStart,
  onCurtainComplete,
}) => {
  const [lifting, setLifting] = useState(false);
  const [unmounted, setUnmounted] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      onCurtainOpenStart?.();
      onCurtainComplete?.();
      setUnmounted(true);
      return;
    }

    // 1. Hold for 650ms so user can comfortably see and read the name & branding
    const liftTimer = window.setTimeout(() => {
      setLifting(true);
    }, 650);

    // 2. Trigger hero reveal as shutters clear halfway
    const revealTimer = window.setTimeout(() => {
      onCurtainOpenStart?.();
    }, 950);

    // 3. Safety fallback unmount
    const safetyTimer = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        setUnmounted(true);
        onCurtainComplete?.();
      }
    }, 2500);

    return () => {
      window.clearTimeout(liftTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [onCurtainOpenStart, onCurtainComplete]);

  // Clean unmount once the 4th (last) trailing shutter panel completes its transition
  const handleTransitionEnd = (panelId: string, e: React.TransitionEvent<HTMLDivElement>) => {
    if (panelId === 'col-4' && e.propertyName === 'transform' && lifting) {
      if (!completedRef.current) {
        completedRef.current = true;
        setUnmounted(true);
        onCurtainComplete?.();
      }
    }
  };

  if (unmounted) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex w-full h-full pointer-events-none select-none overflow-hidden"
    >
      {/* Exactly 4 Equal-Width (w-1/4) Lime Green Shutters with Distinct Seams */}
      {CURTAIN_PANELS.map((panel) => (
        <div
          key={panel.id}
          onTransitionEnd={(e) => handleTransitionEnd(panel.id, e)}
          style={{
            transform: lifting ? 'translate3d(0, -102%, 0)' : 'translate3d(0, 0%, 0)',
            transition: `transform 1.05s cubic-bezier(0.65, 0, 0.25, 1) ${lifting ? panel.delay : 0}s`,
            willChange: 'transform',
          }}
          className="relative h-full w-1/4 bg-[#a3e635] border-r-2 border-black/25 last:border-r-0"
        >
          {/* Subtle bottom edge shadow giving crisp shutter depth */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/25" />
        </div>
      ))}

      {/* Centered Geometric Brand Lockup — Rides Smoothly Upward With Shutters */}
      <div
        style={{
          transform: lifting
            ? 'translate3d(0, -102vh, 0)'
            : 'translate3d(0, 0, 0)',
          transition: lifting
            ? 'transform 1.05s cubic-bezier(0.65, 0, 0.25, 1) 0.14s'
            : 'none',
          willChange: 'transform',
        }}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none"
      >
        <div className="flex items-center gap-3.5">
          <svg className="w-16 h-10 sm:w-20 sm:h-12" viewBox="0 0 88 46" fill="none" aria-hidden="true">
            {/* Dark parallelogram */}
            <polygon points="4,42 26,6 39,6 17,42" fill="#070A11" />
            {/* White contrast parallelogram */}
            <polygon points="26,42 48,6 61,6 39,42" fill="#ffffff" />
            {/* Dark card container */}
            <polygon points="50,42 70,8 84,8 84,42" fill="#070A11" />
            <text
              x="67"
              y="33"
              textAnchor="middle"
              fill="#a3e635"
              fontSize="13"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              AT.
            </text>
          </svg>
        </div>

        <div className="mt-3 flex flex-col items-center">
          <span
            className="text-[#070A11] text-2xl sm:text-3xl tracking-[0.24em] font-black uppercase font-sans"
          >
            ALI TOUHEED
          </span>
          <span className="mt-1 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.34em] text-[#070A11]/85">
            CREATIVE ENGINEERING
          </span>
        </div>
      </div>
    </div>
  );
});

EntryCurtain.displayName = 'EntryCurtain';
