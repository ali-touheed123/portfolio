import React, { memo, useEffect, useRef, useState } from 'react';

interface EntryCurtainProps {
  onCurtainOpenStart?: () => void;
  onCurtainComplete?: () => void;
}

// Cascade Shutter wave: each panel starts with a slight offset, moving together in a stepped wave
const DUR = 0.95;
const STAGGER = 0.16;
const DELAYS = [0, STAGGER, STAGGER * 2, STAGGER * 3]; // [0, 0.16, 0.32, 0.48]
const EASING = 'cubic-bezier(0.76, 0, 0.24, 1)';
const HOLD_MS = 980; // Allows the energetic multi-rebound pop-bounce animation to play fully before curtains open

// Total time from lift trigger until last panel is fully gone
const TOTAL_LIFT_MS = Math.round((STAGGER * 3 + DUR) * 1000); // ~1430ms

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

    // ── STEP 1: After snappy hold, directly animate panels via DOM refs ──
    const holdTimer = window.setTimeout(() => {
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transition = `transform ${DUR}s ${EASING} ${DELAYS[i]}s`;
        el.style.transform = 'translateY(-110%)';
      });

      // Brand lockup rides up with the shutters
      if (lockupRef.current) {
        lockupRef.current.style.transition = `transform ${DUR}s ${EASING} 0.15s`;
        lockupRef.current.style.transform = 'translateY(-110vh)';
      }
    }, HOLD_MS);

    // ── STEP 2: Fire hero reveal right as shutters start lifting ──
    const revealTimer = window.setTimeout(() => {
      onCurtainOpenStart?.();
    }, HOLD_MS + 60);

    // ── STEP 3: Unmount curtain cleanly when last panel finishes ──
    const unmountTimer = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        setUnmounted(true);
        onCurtainComplete?.();
      }
    }, HOLD_MS + TOTAL_LIFT_MS + 60);

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
              backgroundColor: '#000000',
              borderRight: i < 3 ? '1px solid #1A1A1A' : 'none',
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
                backgroundColor: '#39FF14',
                boxShadow: '0 0 12px rgba(57, 255, 20, 0.55)',
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
        <style>{`
          @keyframes curtainLogoBounce {
            0% {
              opacity: 0;
              transform: scale(0.1);
            }
            30% {
              opacity: 1;
              transform: scale(1.36);
            }
            50% {
              transform: scale(0.86);
            }
            70% {
              transform: scale(1.15);
            }
            85% {
              transform: scale(0.96);
            }
            94% {
              transform: scale(1.03);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes curtainNameBounce {
            0% {
              opacity: 0;
              transform: scale(0.2) translateY(28px);
            }
            32% {
              opacity: 1;
              transform: scale(1.32) translateY(-8px);
            }
            52% {
              transform: scale(0.88) translateY(4px);
            }
            72% {
              transform: scale(1.14) translateY(-2px);
            }
            86% {
              transform: scale(0.97) translateY(1px);
            }
            95% {
              transform: scale(1.02) translateY(0);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes curtainTagBounce {
            0% {
              opacity: 0;
              transform: scale(0.35) translateY(20px);
            }
            35% {
              opacity: 1;
              transform: scale(1.22) translateY(-5px);
            }
            55% {
              transform: scale(0.92) translateY(2px);
            }
            75% {
              transform: scale(1.1) translateY(-1px);
            }
            90% {
              transform: scale(0.98) translateY(0);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>

        {/* Logo */}
        <div style={{
          animation: 'curtainLogoBounce 0.72s cubic-bezier(0.25, 1, 0.5, 1) 0.05s both',
          willChange: 'transform, opacity',
        }}>
          <svg width="88" height="46" viewBox="0 0 88 46" fill="none" aria-hidden="true">
            <polygon points="4,42 26,6 39,6 17,42" fill="#1A1A1A" stroke="#39FF14" strokeWidth="1.2" strokeOpacity="0.45" />
            <polygon points="26,42 48,6 61,6 39,42" fill="#ffffff" />
            <polygon points="50,42 70,8 84,8 84,42" fill="#1A1A1A" stroke="#FF073A" strokeWidth="1.2" strokeOpacity="0.55" />
            <text
              x="67" y="33"
              textAnchor="middle"
              fill="#39FF14"
              fontSize="13"
              fontWeight="900"
              fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            >
              AT.
            </text>
          </svg>
        </div>

        {/* Name + Tagline */}
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <div style={{
            color: '#FFFFFF',
            fontSize: 'clamp(20px, 3vw, 34px)',
            letterSpacing: '0.24em',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            lineHeight: 1,
            animation: 'curtainNameBounce 0.75s cubic-bezier(0.25, 1, 0.5, 1) 0.12s both',
            willChange: 'transform, opacity',
          }}>
            ALI <span style={{ color: '#39FF14' }}>TOUHEED</span>
          </div>
          <div style={{
            marginTop: 8,
            color: '#CBD5E1',
            fontSize: 11,
            letterSpacing: '0.36em',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
            animation: 'curtainTagBounce 0.68s cubic-bezier(0.25, 1, 0.5, 1) 0.22s both',
            willChange: 'transform, opacity',
          }}>
            CREATIVE ENGINEERING
          </div>
        </div>
      </div>
    </div>
  );
});

EntryCurtain.displayName = 'EntryCurtain';
