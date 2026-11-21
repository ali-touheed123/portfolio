import React, { memo, useEffect, useRef, useState } from 'react';

interface EntryCurtainProps {
  onCurtainOpenStart?: () => void;
  onCurtainComplete?: () => void;
}

// Left → Right sequential: each panel waits for the previous to finish
// Duration per panel: 0.42s | Stagger: 0.42s → panel 2 starts exactly when panel 1 is gone
const PANEL_DURATION = 0.42;
const PANEL_DELAYS = [0, 0.42, 0.84, 1.26];

/**
 * 4-Column Lime Green Stepped Shutter Reveal (reference-matched).
 *
 * Layout: CSS Grid (4 equal columns) — guaranteed 4 panels regardless of flex quirks.
 * Motion: each column slides UP via translateY(-110%) with staggered delay.
 * Hold:   650ms before lift so brand is readable.
 * Easing: cubic-bezier(0.76, 0, 0.24, 1) — fast-out, smooth deceleration.
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

    // Hold 650ms → lift panels
    const liftTimer = window.setTimeout(() => setLifting(true), 650);

    // Fire hero reveal after ALL 4 panels are gone
    // last panel delay (1.26s) + duration (0.42s) = 1.68s after lift → + 650ms hold
    const revealTimer = window.setTimeout(() => onCurtainOpenStart?.(), 650 + 1260 + 420 + 50);

    // Safety unmount — same + small buffer
    const safetyTimer = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        setUnmounted(true);
        onCurtainComplete?.();
      }
    }, 650 + 1260 + 420 + 200);

    return () => {
      window.clearTimeout(liftTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [onCurtainOpenStart, onCurtainComplete]);

  const handleTransitionEnd = (panelIdx: number, e: React.TransitionEvent<HTMLDivElement>) => {
    // Last panel (index 3) triggers unmount
    if (panelIdx === 3 && e.propertyName === 'transform' && lifting) {
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
      style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', pointerEvents: 'all', userSelect: 'none' }}
    >
      {/* ── 4 Equal Grid Columns ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 25%)',
          width: '100%',
          height: '100%',
        }}
      >
        {PANEL_DELAYS.map((delay, i) => (
          <div
            key={i}
            onTransitionEnd={(e) => handleTransitionEnd(i, e)}
            style={{
              height: '100%',
              backgroundColor: '#a3e635',
              borderRight: i < 3 ? '2px solid rgba(0,0,0,0.18)' : 'none',
              transform: lifting ? 'translateY(-110%)' : 'translateY(0%)',
              transition: lifting
                ? `transform ${PANEL_DURATION}s cubic-bezier(0.76, 0, 0.24, 1) ${delay}s`
                : 'none',
              willChange: 'transform',
              position: 'relative',
            }}
          >
            {/* Bottom shutter edge line */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(0,0,0,0.18)' }} />
          </div>
        ))}
      </div>

      {/* ── Brand Lockup — rides upward with panels ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transform: lifting ? 'translateY(-110vh)' : 'translateY(0)',
          transition: lifting
            ? `transform ${PANEL_DURATION}s cubic-bezier(0.76, 0, 0.24, 1) 1.1s`
            : 'none',
          willChange: 'transform',
        }}
      >
        {/* Logo SVG */}
        <svg width="88" height="46" viewBox="0 0 88 46" fill="none" aria-hidden="true">
          <polygon points="4,42 26,6 39,6 17,42" fill="#070A11" />
          <polygon points="26,42 48,6 61,6 39,42" fill="#ffffff" />
          <polygon points="50,42 70,8 84,8 84,42" fill="#070A11" />
          <text x="67" y="33" textAnchor="middle" fill="#a3e635" fontSize="13" fontWeight="900" fontFamily="system-ui,-apple-system,sans-serif">AT.</text>
        </svg>

        {/* Name */}
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <div style={{
            color: '#070A11',
            fontSize: 'clamp(18px, 2.5vw, 30px)',
            letterSpacing: '0.24em',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1,
          }}>
            ALI TOUHEED
          </div>
          <div style={{
            marginTop: 6,
            color: 'rgba(7,10,17,0.8)',
            fontSize: 11,
            letterSpacing: '0.34em',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}>
            CREATIVE ENGINEERING
          </div>
        </div>
      </div>
    </div>
  );
});

EntryCurtain.displayName = 'EntryCurtain';
