import React, { useEffect, useRef, useState, type RefObject } from 'react';
import { useSkyTheme } from '../context/ThemeContext';
import type { ParallaxState } from '../hooks/useParallax';
import { useIsInViewport } from '../hooks/useIsInViewport';

interface HeroOrbitalIconsProps {
  visible: boolean;
  parallaxRef?: RefObject<ParallaxState | null>;
}

interface OrbitItemSpec {
  id: string;
  label: string;
  src: string;
  glow: string;
  sizeClass: string;
}

const ORBIT_ITEMS: OrbitItemSpec[] = [
  {
    id: 'react',
    label: 'React.js',
    src: '/assets/tech-icons/reactjs.webp',
    glow: 'rgba(57, 255, 20, 0.45)',
    sizeClass: 'w-11 h-11 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]',
  },
  {
    id: 'nextjs',
    label: 'Next.js',
    src: '/assets/tech-icons/nextjs-square.webp',
    glow: 'rgba(226, 232, 240, 0.36)',
    sizeClass: 'w-11 h-11 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]',
  },
  {
    id: 'nodejs',
    label: 'Node.js',
    src: '/assets/tech-icons/js.webp',
    glow: 'rgba(57, 255, 20, 0.48)',
    sizeClass: 'w-11 h-11 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]',
  },
  {
    id: 'supabase',
    label: 'Supabase',
    src: '/assets/tech-icons/supabase.webp',
    glow: 'rgba(57, 255, 20, 0.45)',
    sizeClass: 'w-11 h-11 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]',
  },
  {
    id: 'github',
    label: 'GitHub',
    src: '/assets/tech-icons/github.webp',
    glow: 'rgba(255, 7, 58, 0.48)',
    sizeClass: 'w-11 h-11 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]',
  },
];

/**
 * True 3D depth-interleaved revolving tech icons + luminous split orbital rings.
 * Does NOT create a trapping z-index wrapper so back half passes behind HeroScrollCanvas (z-10)
 * and front lower arc sweeps in front of the mossy island (z-15), never crossing the character's face.
 * Hovering smoothly accelerates the orbital revolution speed.
 */
export const HeroOrbitalIcons: React.FC<HeroOrbitalIconsProps> = ({ visible, parallaxRef }) => {
  const { isDay } = useSkyTheme();
  const [hovered, setHovered] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const backRingRef = useRef<HTMLDivElement>(null);
  const frontRingRef = useRef<HTMLDivElement>(null);
  const isActive = useIsInViewport(stageRef, '200px');
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoveredRef = useRef(false);
  const visibleRef = useRef(visible);
  const angleRef = useRef(0.35);
  const speedRef = useRef(0.34);
  const revealBlendRef = useRef(0);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (!isActive) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Smooth fade-in/out & radial expansion upon hitting the final hero frame
      const targetReveal = visibleRef.current ? 1 : 0;
      revealBlendRef.current += (targetReveal - revealBlendRef.current) * Math.min(1, dt * 6.5);

      // Hover accelerates revolution speed cleanly, nothing else
      const targetSpeed = hoveredRef.current ? 1.45 : 0.34;
      speedRef.current += (targetSpeed - speedRef.current) * Math.min(1, dt * 4.5);

      if (!prefersReduced) {
        angleRef.current += dt * speedRef.current;
      }

      const stage = stageRef.current;
      const w = stage ? stage.clientWidth : window.innerWidth;
      const h = stage ? stage.clientHeight : window.innerHeight;

      const rx = w < 640 ? w * 0.36 : w < 1024 ? Math.min(w * 0.34, 270) : Math.min(w * 0.23, 305);
      const ry = w < 640 ? 64 : 88;
      const centerOffsetY = w < 640 ? -6 : 42;
      const tiltRad = -0.16; // -9.2 deg natural diagonal orbit
      const cosT = Math.cos(tiltRad);
      const sinT = Math.sin(tiltRad);

      const p = parallaxRef?.current;
      const pRawX = p?.x ?? 0;
      const pRawY = p?.y ?? 0;
      const px = pRawX * 16;
      const py = pRawY * 10;
      const reveal = revealBlendRef.current;

      const ringTransform = `translate3d(${pRawX * 10}px, ${pRawY * 6 + 42}px, 0) scale(${
        visibleRef.current ? 1 : 0.78
      })`;
      if (backRingRef.current) backRingRef.current.style.transform = ringTransform;
      if (frontRingRef.current) frontRingRef.current.style.transform = ringTransform;

      ORBIT_ITEMS.forEach((_, idx) => {
        const el = itemRefs.current[idx];
        if (!el) return;

        const theta = angleRef.current + idx * ((Math.PI * 2) / ORBIT_ITEMS.length);
        const ex = Math.cos(theta) * rx * (0.45 + 0.55 * reveal);
        const ey = Math.sin(theta) * ry * (0.45 + 0.55 * reveal);

        const rotX = ex * cosT - ey * sinT + px * 0.6;
        const rotY = ex * sinT + ey * cosT + centerOffsetY + py * 0.6;

        // zDepth in [-1..1]: negative = behind character's head/body, positive = in front around base
        const zDepth = Math.sin(theta);
        const normDepth = (zDepth + 1) * 0.5;
        const perspScale = (0.76 + normDepth * 0.28) * (0.35 + 0.65 * reveal);
        const depthOpacity = reveal * (0.76 + normDepth * 0.24);
        const swayDeg = Math.cos(theta) * 6;

        // Layer behind character (z=6 < canvas z=10) across the entire upper arc,
        // and cleanly in front (z=16 > canvas z=10) only along the lower front arc!
        el.style.zIndex = zDepth < 0.12 ? '6' : '16';
        el.style.opacity = depthOpacity.toFixed(3);
        el.style.pointerEvents = reveal > 0.7 ? 'auto' : 'none';
        el.style.transform = `translate3d(calc(-50% + ${rotX.toFixed(1)}px), calc(-50% + ${rotY.toFixed(
          1
        )}px), 0) scale(${perspScale.toFixed(3)}) rotate(${swayDeg.toFixed(1)}deg)`;
      });

      // Keep stage height in sync even if unused directly
      void h;
      animId = window.requestAnimationFrame(tick);
    };

    animId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animId);
  }, [isActive]);

  const ringOpacityBack = visible ? (isDay ? 0.55 : 0.85) : 0;
  const ringOpacityFront = visible ? (isDay ? 0.48 : 0.75) : 0;

  return (
    <div
      ref={stageRef}
      aria-hidden={!visible}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* BACK LUMINOUS ORBITAL ARCS (z-5 — strictly BEHIND HeroScrollCanvas z-10) */}
      <div
        ref={backRingRef}
        className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center transition-all duration-700 -translate-y-8 xs:-translate-y-10 sm:translate-y-0"
        style={{
          opacity: ringOpacityBack,
        }}
      >
        <svg viewBox="0 0 820 340" fill="none" className="w-[min(92vw,700px)] h-auto overflow-visible">
          <defs>
            <linearGradient id="orbitBackA" x1="0%" y1="40%" x2="100%" y2="60%">
              <stop offset="0%" stopColor={isDay ? '#16a34a' : '#39FF14'} stopOpacity="0.92" />
              <stop offset="50%" stopColor={isDay ? '#0f172a' : '#ffffff'} stopOpacity="0.82" />
              <stop offset="100%" stopColor={isDay ? '#e11d48' : '#FF073A'} stopOpacity="0.92" />
            </linearGradient>
            <linearGradient id="orbitBackB" x1="100%" y1="30%" x2="0%" y2="70%">
              <stop offset="0%" stopColor={isDay ? '#e11d48' : '#FF073A'} stopOpacity="0.75" />
              <stop offset="50%" stopColor={isDay ? '#475569' : '#a1a1aa'} stopOpacity="0.75" />
              <stop offset="100%" stopColor={isDay ? '#16a34a' : '#39FF14'} stopOpacity="0.75" />
            </linearGradient>
            <filter id="ringSoftGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Soft Wide Halo Track */}
          <ellipse
            cx="410"
            cy="170"
            rx="320"
            ry="94"
            transform="rotate(-9.2 410 170)"
            stroke="url(#orbitBackA)"
            strokeWidth="7"
            strokeOpacity="0.2"
            filter="url(#ringSoftGlow)"
          />
          {/* Crisp Upper/Full Primary Ellipse behind avatar */}
          <ellipse
            cx="410"
            cy="170"
            rx="320"
            ry="94"
            transform="rotate(-9.2 410 170)"
            stroke="url(#orbitBackA)"
            strokeWidth="2.2"
            filter="url(#ringSoftGlow)"
          />
          {/* Secondary Tilted Constellation Arc */}
          <ellipse
            cx="410"
            cy="174"
            rx="276"
            ry="76"
            transform="rotate(6.5 410 174)"
            stroke="url(#orbitBackB)"
            strokeWidth="1.6"
            strokeDasharray="8 10"
          />
        </svg>
      </div>

      {/* FRONT LOWER FOREGROUND RIM (z-15 — sweeps gently ONLY under lower half around mossy rock) */}
      <div
        ref={frontRingRef}
        className="pointer-events-none absolute inset-0 z-15 flex items-center justify-center transition-all duration-700 -translate-y-8 xs:-translate-y-10 sm:translate-y-0"
        style={{
          opacity: ringOpacityFront,
        }}
      >
        <svg viewBox="0 0 820 340" fill="none" className="w-[min(92vw,700px)] h-auto overflow-visible">
          {/* Foreground lower arc from left edge sweeping across front bottom to right edge */}
          <path
            d="M 94 222 C 210 292, 600 264, 725 118"
            stroke="url(#orbitBackA)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#ringSoftGlow)"
          />
        </svg>
      </div>

      {/* 6 REVOLVING TRANSPARENT TECH ICONS (Dynamic zIndex 6 back / 16 front; hover boosts revolution speed) */}
      {ORBIT_ITEMS.map((item, idx) => (
        <div
          key={item.id}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="absolute top-1/2 left-1/2 select-none will-change-transform cursor-pointer"
          style={{ opacity: 0 }}
        >
          <div className="relative flex items-center justify-center p-1">
            {/* Soft Ambient Neon Aura Behind Icon */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full blur-lg opacity-65 transition-opacity duration-300"
              style={{ backgroundColor: item.glow }}
            />
            <img
              src={item.src}
              alt={item.label}
              loading="eager"
              draggable={false}
              className={`relative ${item.sizeClass} object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.42)]`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
