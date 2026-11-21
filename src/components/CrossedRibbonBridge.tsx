import React, { useEffect, useRef } from 'react';
import { useSkyTheme } from '../context/ThemeContext';

const RIBBON_BACK_PATH =
  'M -140 118 C 180 124, 340 44, 620 82 C 880 116, 1080 42, 1580 58';
const RIBBON_FRONT_PATH =
  'M -140 54 C 190 48, 365 124, 645 86 C 915 48, 1110 122, 1580 106';

// Complete full names for all languages (no short abbreviations)
const LANGUAGES_UNIT =
  '◆ JAVASCRIPT ◆ TYPESCRIPT ◆ TYPESCRIPT XML ◆ JAVASCRIPT XML ◆ HYPERTEXT MARKUP LANGUAGE ◆ CASCADING STYLE SHEETS ◆ PYTHON ◆ STRUCTURED QUERY LANGUAGE ◆ OPENGL SHADING LANGUAGE ';

// Frameworks, runtimes, cloud platforms & automation tools
const TOOLS_UNIT =
  '✦ NEXT.JS ✦ REACT.JS ✦ NODE.JS ✦ EXPRESS.JS ✦ TAILWIND CSS ✦ THREE.JS ✦ FRAMER MOTION ✦ GSAP ✦ LENIS ✦ MATTER.JS ✦ SUPABASE ✦ POSTGRESQL ✦ FIREBASE ✦ CLOUDFLARE ✦ VERCEL ✦ GITHUB ✦ N8N AUTOMATION ✦ DOCKER ✦ VITE ';

/**
 * Full-bleed dual crossed kinetic ribbons bridging the blended Hero-to-Origin Story seam:
 * - Ribbon 1: Complete programming, markup & query language names
 * - Ribbon 2: Full-stack frameworks, cloud platforms, databases & automation tools
 */
export const CrossedRibbonBridge: React.FC = () => {
  const { isDay } = useSkyTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const backPathRef = useRef<SVGPathElement>(null);
  const frontPathRef = useRef<SVGPathElement>(null);
  const backTextRef = useRef<SVGTextPathElement>(null);
  const frontTextRef = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let backPeriodPct = 85;
    let frontPeriodPct = 95;

    const measurePeriods = () => {
      try {
        if (backPathRef.current && backTextRef.current) {
          const pathLen = backPathRef.current.getTotalLength();
          const unitLen = backTextRef.current.getSubStringLength(0, LANGUAGES_UNIT.length);
          if (pathLen > 0 && unitLen > 0) {
            backPeriodPct = (unitLen / pathLen) * 100;
          }
        }
        if (frontPathRef.current && frontTextRef.current) {
          const pathLen = frontPathRef.current.getTotalLength();
          const unitLen = frontTextRef.current.getSubStringLength(0, TOOLS_UNIT.length);
          if (pathLen > 0 && unitLen > 0) {
            frontPeriodPct = (unitLen / pathLen) * 100;
          }
        }
      } catch {
        // Fallback percentage periods remain active if text metrics aren't ready
      }
    };

    measurePeriods();
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(measurePeriods).catch(() => {});
    }

    let rafId = 0;
    let timeDrift = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      timeDrift += dt * 1.45;

      const el = containerRef.current;
      let scrollRatio = 0;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        scrollRatio = Math.max(-0.5, Math.min(1.5, (vh - rect.top) / (vh + rect.height)));
      }

      const backShift = (timeDrift * 1.15 + scrollRatio * 14) % backPeriodPct;
      const frontShift = (timeDrift * 1.3 + scrollRatio * 16) % frontPeriodPct;

      const backOffset = -backPeriodPct + backShift;
      const frontOffset = -frontShift;

      if (backTextRef.current) {
        backTextRef.current.setAttribute('startOffset', `${backOffset.toFixed(2)}%`);
      }
      if (frontTextRef.current) {
        frontTextRef.current.setAttribute('startOffset', `${frontOffset.toFixed(2)}%`);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative z-30 w-full h-32.5 sm:h-40 -mt-10 sm:-mt-14 -mb-4 sm:-mb-6 overflow-hidden pointer-events-none select-none"
    >
      {/* Seamless vertical transition veil fusing Hero bottom into #05070e Origin Story */}
      <div
        className={`absolute inset-0 ${
          isDay
            ? 'bg-linear-to-b from-transparent via-[#05070e]/75 to-[#05070e]'
            : 'bg-linear-to-b from-transparent via-[#05070e]/85 to-[#05070e]'
        }`}
      />

      {/* Full-bleed Crossed Double Ribbons */}
      <svg
        viewBox="0 0 1440 164"
        preserveAspectRatio="xMidYMid slice"
        className="relative z-10 w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="crossBackFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#081322" />
            <stop offset="50%" stopColor="#0f2336" />
            <stop offset="100%" stopColor="#091526" />
          </linearGradient>

          <linearGradient id="crossBackBorder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#4ade80" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.45" />
          </linearGradient>

          <linearGradient id="crossFrontFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#140c24" />
            <stop offset="50%" stopColor="#231242" />
            <stop offset="100%" stopColor="#140c24" />
          </linearGradient>

          <linearGradient id="crossFrontBorder" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#e879f9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.65" />
          </linearGradient>

          <filter id="ribbonShadow" x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.72" />
          </filter>

          <path ref={backPathRef} id="cross-ribbon-back" d={RIBBON_BACK_PATH} />
          <path ref={frontPathRef} id="cross-ribbon-front" d={RIBBON_FRONT_PATH} />
        </defs>

        {/* BACK RIBBON: All Languages in Complete Unabbreviated Form */}
        <g filter="url(#ribbonShadow)">
          <use
            href="#cross-ribbon-back"
            fill="none"
            stroke="url(#crossBackBorder)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <use
            href="#cross-ribbon-back"
            fill="none"
            stroke="url(#crossBackFill)"
            strokeWidth="32"
            strokeLinecap="round"
          />
          <use
            href="#cross-ribbon-back"
            fill="none"
            stroke="rgba(34,211,238,0.18)"
            strokeWidth="1.2"
            strokeDasharray="6 14"
          />
          <text
            dy="4"
            className="font-mono text-[10.8px] font-semibold tracking-[0.16em] uppercase fill-[#cffafe]"
          >
            <textPath ref={backTextRef} href="#cross-ribbon-back" startOffset="-40%">
              {LANGUAGES_UNIT.repeat(4)}
            </textPath>
          </text>
        </g>

        {/* FRONT CROSSING RIBBON: Frameworks, Cloud Platforms & Tools */}
        <g filter="url(#ribbonShadow)">
          <use
            href="#cross-ribbon-front"
            fill="none"
            stroke="url(#crossFrontBorder)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <use
            href="#cross-ribbon-front"
            fill="none"
            stroke="url(#crossFrontFill)"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <use
            href="#cross-ribbon-front"
            fill="none"
            stroke="rgba(232,121,249,0.16)"
            strokeWidth="22"
            strokeDasharray="2 18"
          />
          <text
            dy="4"
            className="font-mono text-[11px] font-bold tracking-[0.17em] uppercase fill-white"
          >
            <textPath ref={frontTextRef} href="#cross-ribbon-front" startOffset="-15%">
              {TOOLS_UNIT.repeat(4)}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
};
