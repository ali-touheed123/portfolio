import React, { memo, useEffect, useRef, useState } from 'react';

interface EntryCurtainProps {
  onCurtainOpenStart?: () => void;
  onCurtainComplete?: () => void;
}

// Duration per panel (s) + stagger (s) — sequential: panel n+1 starts when panel n finishes
const DUR = 0.45;
const STAGGER = 0.45; // equal to DUR → pure one-by-one
const DELAYS = [0, STAGGER, STAGGER * 2, STAGGER * 3]; // [0, 0.45, 0.90, 1.35]
const EASING = 'cubic-bezier(0.76, 0, 0.24, 1)';

// Total time from lift trigger until last panel is fully gone
const TOTAL_LIFT_MS = (STAGGER * 3 + DUR) * 1000; // 1800ms

export const EntryCurtain: React.FC<EntryCurtainProps> = memo(({
  onCurtainOpenStart,
  onCurtainComplete,
}) => {
  const [unmounted, setUnmounted] = useState(false);

  // Direct refs to each panel DOM element + the brand lockup
  const panelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const lockupRef = useRef<HTMLDivElement | null>(null);
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

    // ── STEP 1: After 650ms hold, directly animate panels via DOM refs ──
    // Using direct DOM style lets the browser register the starting translateY(0)
    // before we apply the transition — no React re-render timing issues.
    const holdTimer = window.setTimeout(() => {
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transition = `transform ${DUR}s ${EASING} ${DELAYS[i]}s`;
        el.style.transform = 'translateY(-110%)';
      });

      // Brand lockup rides up with the last panel
      if (lockupRef.current) {
        lockupRef.current.style.transition = `transform ${DUR}s ${EASING} ${DELAYS[3]}s`;
        lockupRef.current.style.transform = 'translateY(-110vh)';
      }
    }, 650);

    // ── STEP 2: Fire hero reveal right as last panel finishes ──
    const revealTimer = window.setTimeout(() => {
      onCurtainOpenStart?.();
    }, 650 + TOTAL_LIFT_MS + 30);

    // ── STEP 3: Unmount curtain cleanly ──
    const unmountTimer = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        setUnmounted(true);
        onCurtainComplete?.();
      }
    }, 650 + TOTAL_LIFT_MS + 150);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [onCurtainOpenStart, onCurtainComplete]);

  // Also hook transitionend on last panel as a reliable unmount trigger
  const handleTransitionEnd = (i: number, e: React.TransitionEvent<HTMLDivElement>) => {
    if (i === 3 && e.propertyName === 'transform') {
      if (!completedRef.current) {
        completedRef.current = true;
        // small delay so hero is already visible before curtain unmounts
        window.setTimeout(() => {
          setUnmounted(true);
          onCurtainComplete?.();
        }, 80);
      }
    }
  };

  if (unmounted) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        overflow: 'hidden',
        pointerEvents: 'all',  // blocks all scroll/clicks while visible
        userSelect: 'none',
      }}
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
        {DELAYS.map((_, i) => (
          <div
            key={i}
            ref={(el) => { panelRefs.current[i] = el; }}
            onTransitionEnd={(e) => handleTransitionEnd(i, e)}
            style={{
              height: '100%',
              backgroundColor: '#a3e635',
              borderRight: i < 3 ? '2px solid rgba(0,0,0,0.20)' : 'none',
              transform: 'translateY(0%)',   // explicit start — browser paints this first
              willChange: 'transform',
              position: 'relative',
            }}
          >
            {/* Bottom shutter edge line */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: 'rgba(0,0,0,0.18)',
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Brand Lockup — rides up with last panel ── */}
      <div
        ref={lockupRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transform: 'translateY(0)',   // explicit start
          willChange: 'transform',
        }}
      >
        {/* Logo */}
        <svg width="88" height="46" viewBox="0 0 88 46" fill="none" aria-hidden="true">
          <polygon points="4,42 26,6 39,6 17,42"  fill="#070A11" />
          <polygon points="26,42 48,6 61,6 39,42" fill="#ffffff" />
          <polygon points="50,42 70,8 84,8 84,42"  fill="#070A11" />
          <text
            x="67" y="33"
            textAnchor="middle"
            fill="#a3e635"
            fontSize="13"
            fontWeight="900"
            fontFamily="system-ui,-apple-system,sans-serif"
          >
            AT.
          </text>
        </svg>

        {/* Name + Tagline */}
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
