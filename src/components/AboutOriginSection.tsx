import React, { useEffect, useRef, useState } from 'react';
import { useSkyTheme } from '../context/ThemeContext';
import { useIsInViewport } from '../hooks/useIsInViewport';

interface FrictionChip {
  label: string;
  info: string;
}

const FRICTION_CHIPS: FrictionChip[] = [
  {
    label: 'Tinting Formulas',
    info: 'Manual shade & base mixing ratios slowed down every contractor order.',
  },
  {
    label: 'Multi-Can Inventory',
    info: 'Gallon, quarter & drum stock mismatches caused daily reconciliation loss.',
  },
  {
    label: 'Credit Ledgers',
    info: 'Paper udhaar books hid overdue contractor balances & margins.',
  },
  {
    label: 'Manual Billing',
    info: 'Handwritten invoices created long counter queues during peak hours.',
  },
];

interface ErpModule {
  id: string;
  tab: string;
  label: string;
  val: string;
  widthClass: string;
}

const ERP_MODULES: ErpModule[] = [
  {
    id: 'pos',
    tab: 'High-Speed POS',
    label: 'Counter POS Checkout Speed',
    val: '+60% Faster',
    widthClass: 'w-[88%]',
  },
  {
    id: 'tint',
    tab: 'Tint Calculator',
    label: 'Automated Tint Formulation Accuracy',
    val: '99.8% Match',
    widthClass: 'w-[96%]',
  },
  {
    id: 'ceo',
    tab: 'CEO Dashboard',
    label: 'Multi-Branch Live CEO Visibility',
    val: 'Real-Time Sync',
    widthClass: 'w-[92%]',
  },
];

const CHAPTER_LABELS = [
  '01. Karachi',
  '02. Tawakkal Paint',
  '03. Pyntflow ERP',
  '04. Full Stack',
];

const NODE_COORDS = [
  { x: 420, y: 220 },
  { x: 940, y: 560 },
  { x: 520, y: 1020 },
  { x: 860, y: 1440 },
];

const WINDING_PATH_D = `M -40 130
  C 160 65, 390 105, 420 220
  C 445 315, 310 390, 445 430
  C 590 465, 865 420, 940 560
  C 995 680, 1145 790, 1145 675
  C 1145 565, 1005 555, 920 675
  C 835 795, 535 850, 520 1020
  C 508 1170, 520 1245, 675 1290
  C 825 1335, 865 1370, 860 1440
  C 855 1560, 930 1720, 1135 1700
  C 1295 1685, 1395 1590, 1490 1500`;

export const AboutOriginSection: React.FC = () => {
  const { isDay } = useSkyTheme();
  const isDayRef = useRef<boolean>(isDay);
  isDayRef.current = isDay;

  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mobileTimelineRef = useRef<HTMLDivElement>(null);
  const activePathRef = useRef<SVGPathElement>(null);
  const orbHaloRef = useRef<SVGCircleElement>(null);
  const orbCoreRef = useRef<SVGCircleElement>(null);
  const ribbonText1Ref = useRef<SVGTextPathElement>(null);
  const ribbonText2Ref = useRef<SVGTextPathElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isSectionActive = useIsInViewport(starCanvasRef, '300px');
  const isSectionActiveRef = useRef<boolean>(isSectionActive);
  isSectionActiveRef.current = isSectionActive;

  const [reachedSteps, setReachedSteps] = useState<boolean[]>([false, false, false, false]);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [mobileProgress, setMobileProgress] = useState<number>(0);

  // Interactive widget states
  const [pitchToggled, setPitchToggled] = useState<boolean>(false);
  const [activeChipIdx, setActiveChipIdx] = useState<number>(0);
  const [activeErpIdx, setActiveErpIdx] = useState<number>(0);

  // 1. Subtle Cosmic Starfield Canvas Backdrop
  useEffect(() => {
    if (!isSectionActive) return;
    const canvas = starCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface Star {
      x: number;
      y: number;
      r: number;
      alpha: number;
      speed: number;
      phase: number;
    }

    let stars: Star[] = [];
    let rafId = 0;

    const initStars = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const count = Math.min(95, Math.floor((canvas.width * canvas.height) / 22000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.6 + 0.15,
        speed: Math.random() * 0.015 + 0.004,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const drawStars = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dayMode = isDayRef.current;
      stars.forEach((s, idx) => {
        const a = s.alpha + Math.sin(t * s.speed + s.phase) * 0.2;
        if (dayMode) {
          const dayTone =
            idx % 5 === 0
              ? `rgba(22, 163, 74, ${Math.max(0.08, a * 0.45)})`
              : idx % 5 === 1
                ? `rgba(225, 29, 72, ${Math.max(0.06, a * 0.35)})`
                : `rgba(15, 23, 42, ${Math.max(0.05, a * 0.22)})`;
          ctx.fillStyle = dayTone;
        } else {
          ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0.05, a)})`;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, dayMode ? s.r * 1.15 : s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafId = window.requestAnimationFrame(drawStars);
    };

    initStars();
    window.addEventListener('resize', initStars);
    rafId = window.requestAnimationFrame(drawStars);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', initStars);
    };
  }, [isSectionActive]);

  // 2. Scroll-Drawn Winding Path + Leading Comet Orb + Side Ribbons (Desktop + Mobile)
  useEffect(() => {
    const stage = stageRef.current;
    const mobileStage = mobileTimelineRef.current;
    const activePath = activePathRef.current;

    let totalLength = 1000;
    if (activePath) {
      try {
        totalLength = activePath.getTotalLength();
        activePath.style.strokeDasharray = `${totalLength}`;
        activePath.style.strokeDashoffset = `${totalLength}`;
      } catch {
        // Fallback if SVG not yet rendered
      }
    }

    const findClosestLengthFraction = (target: { x: number; y: number }) => {
      if (!activePath) return 0;
      const samples = 500;
      let bestLen = 0;
      let bestDist = Infinity;
      for (let i = 0; i <= samples; i++) {
        const len = (i / samples) * totalLength;
        const pt = activePath.getPointAtLength(len);
        const dist = Math.hypot(pt.x - target.x, pt.y - target.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestLen = len;
        }
      }
      return bestLen / totalLength;
    };

    const desktopThresholds = activePath ? NODE_COORDS.map(findClosestLengthFraction) : [0.12, 0.35, 0.58, 0.82];
    const mobileThresholds = [0.08, 0.32, 0.58, 0.84];

    let currentProgress = 0;
    let targetProgress = 0;
    let lastMask = '';
    let lastActive = -1;
    let rafId = 0;

    const computeTargetProgress = () => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      const container = isDesktop ? stage : mobileStage;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const startY = vh * (isDesktop ? 0.68 : 0.78);
      const endY = vh * (isDesktop ? 0.42 : 0.28);
      const totalScrollSpan = rect.height - (startY - endY);
      if (totalScrollSpan <= 0) return;
      const raw = (startY - rect.top) / totalScrollSpan;
      targetProgress = Math.max(0, Math.min(1, raw));
    };

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.1;

      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      if (!isDesktop) {
        setMobileProgress(currentProgress);
      }

      if (activePath) {
        const drawnLen = totalLength * currentProgress;
        activePath.style.strokeDashoffset = `${totalLength - drawnLen}`;

        if (orbHaloRef.current && orbCoreRef.current) {
          const tip = activePath.getPointAtLength(drawnLen);
          const orbOpacity = currentProgress > 0.008 && currentProgress < 0.992 ? '1' : '0';
          orbHaloRef.current.setAttribute('cx', `${tip.x}`);
          orbHaloRef.current.setAttribute('cy', `${tip.y}`);
          orbHaloRef.current.setAttribute('opacity', orbOpacity);
          orbCoreRef.current.setAttribute('cx', `${tip.x}`);
          orbCoreRef.current.setAttribute('cy', `${tip.y}`);
          orbCoreRef.current.setAttribute('opacity', orbOpacity);
        }
      }

      if (ribbonText1Ref.current) {
        ribbonText1Ref.current.setAttribute('startOffset', `${4 + currentProgress * 14}%`);
      }
      if (ribbonText2Ref.current) {
        ribbonText2Ref.current.setAttribute('startOffset', `${6 + currentProgress * 12}%`);
      }

      const activeThresholds = isDesktop ? desktopThresholds : mobileThresholds;
      const nextReached = activeThresholds.map((threshold) => currentProgress >= threshold - 0.02);
      const mask = nextReached.map((r) => (r ? '1' : '0')).join('');
      let activeIdx = 0;
      nextReached.forEach((r, idx) => {
        if (r) activeIdx = idx;
      });

      if (mask !== lastMask) {
        lastMask = mask;
        setReachedSteps(nextReached);
      }
      if (activeIdx !== lastActive) {
        lastActive = activeIdx;
        setActiveChapterIdx(activeIdx);
      }

      rafId = isSectionActiveRef.current ? window.requestAnimationFrame(tick) : 0;
    };

    const resumeTick = () => {
      if (isSectionActiveRef.current && rafId === 0) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', computeTargetProgress, { passive: true });
    window.addEventListener('scroll', resumeTick, { passive: true });
    window.addEventListener('resize', computeTargetProgress);
    computeTargetProgress();
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', computeTargetProgress);
      window.removeEventListener('scroll', resumeTick);
      window.removeEventListener('resize', computeTargetProgress);
    };
  }, []);

  const scrollToStep = (idx: number) => {
    const targetNode = nodeRefs.current[idx];
    if (!targetNode) return;
    const rect = targetNode.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - window.innerHeight * 0.45;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const activeErp = ERP_MODULES[activeErpIdx];

  return (
    <section
      id="story"
      aria-label="About Me and Origin Story"
      className="relative w-full pt-12 pb-4 lg:pt-16 lg:pb-6 bg-[#F4F8FD] text-slate-900 dark:bg-[#000000] dark:text-[#f8fafc] overflow-hidden transition-colors duration-700"
    >
      {/* Subtle Hero-matched Grid & Atmospheric Backdrop — masked cleanly at top and bottom */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 bg-size-[160px_160px] mask-[linear-gradient(to_bottom,transparent_0%,black_18%,black_84%,transparent_100%)] ${
          isDay
            ? 'bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]'
        }`}
      />
      <canvas
        ref={starCanvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 w-full h-full opacity-72 mask-[linear-gradient(to_bottom,transparent_0%,black_16%,black_86%,transparent_100%)]"
      />

      {/* Soft Cosmic Nebulae / Sky Blooms */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute z-0 rounded-full blur-[130px] w-140 h-140 top-[4%] -left-35 ${
          isDay
            ? 'opacity-14 bg-[radial-gradient(circle,#E11D48,transparent_70%)]'
            : 'opacity-20 bg-[radial-gradient(circle,#FF073A,transparent_70%)]'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute z-0 rounded-full blur-[130px] w-130 h-130 top-[44%] -right-30 ${
          isDay
            ? 'opacity-14 bg-[radial-gradient(circle,#16A34A,transparent_70%)]'
            : 'opacity-20 bg-[radial-gradient(circle,#39FF14,transparent_70%)]'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute z-0 rounded-full blur-[130px] w-120 h-120 bottom-[6%] left-[18%] ${
          isDay
            ? 'opacity-30 bg-[radial-gradient(circle,#DBEAFE,transparent_70%)]'
            : 'opacity-25 bg-[radial-gradient(circle,#1A1A1A,transparent_70%)]'
        }`}
      />

      {/* Header stays neatly centered in .container */}
      <div className="relative z-2 max-w-310 mx-auto px-4.5 sm:px-8">
        <header className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-6 lg:gap-12 items-end mb-10 lg:mb-9">
          <div>
            <div className="flex flex-wrap items-center gap-3.5 mb-5">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-900/12 bg-white/90 text-xl text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.08)] dark:border-white/22 dark:bg-[#1A1A1A]/70 dark:text-white dark:shadow-[0_0_20px_rgba(57,255,20,0.14)] transition-colors duration-700"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(22,163,74,0.55)] dark:bg-[#39FF14] dark:shadow-[0_0_10px_#39FF14] animate-[pulseDot_2s_ease-in-out_infinite]" />
                About Me
              </span>
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-rose-600 dark:text-[#FF073A] transition-colors duration-700">
                Origin Story &bull; Karachi, Pakistan
              </span>
            </div>

            <h2 className="text-[clamp(2.35rem,4.4vw,3.85rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-slate-900 dark:text-white transition-colors duration-700">
              From Karachi Streets to
              <br />
              Industrial{' '}
              <span
                className="relative inline-block font-bold text-[1.18em] text-emerald-600 dark:text-[#39FF14] dark:[text-shadow:0_0_28px_rgba(57,255,20,0.45)]"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                Cloud ERP
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 bottom-0.5 h-1 rounded-full bg-linear-to-r from-[#E11D48] to-[#16A34A] dark:from-[#FF073A] dark:to-[#39FF14] rotate-[-1.2deg]"
                />
              </span>
            </h2>

            <div
              className="hidden lg:inline-flex items-center gap-2 mt-5.5 p-1.5 rounded-full bg-white/90 border border-slate-900/10 shadow-[0_6px_18px_rgba(15,23,42,0.06)] dark:bg-[#1A1A1A]/80 dark:border-white/10 dark:shadow-none transition-colors duration-700"
              aria-label="Journey Milestones"
            >
              {CHAPTER_LABELS.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => scrollToStep(idx)}
                  className={`font-mono text-[0.74rem] px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-250 border ${
                    activeChapterIdx === idx
                      ? 'text-slate-900 bg-linear-to-br from-rose-500/15 to-emerald-500/20 border-emerald-600/45 shadow-sm dark:text-white dark:from-[#FF073A]/30 dark:to-[#39FF14]/25 dark:border-[#39FF14]/50 dark:shadow-[0_0_16px_rgba(57,255,20,0.22)]'
                      : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-100 dark:text-[#94a3b8] dark:hover:text-white dark:hover:bg-white/6'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pb-1.5">
            <p className="text-[1.03rem] leading-[1.68] text-slate-600 dark:text-[#94a3b8] mb-4 transition-colors duration-700">
              I’m a passionate full stack developer turning ideas into reality.{' '}
              <strong className="text-slate-900 dark:text-[#e2e8f0] font-semibold">
                Most developers start by cloning tutorials on YouTube
              </strong>
              —my journey started by walking directly into a neighborhood shop in Karachi.
            </p>
            <p className="text-[0.92rem] leading-[1.6] italic text-slate-700 dark:text-[#cbd5e1] pl-3.5 border-l-2 border-rose-600 dark:border-[#FF073A] transition-colors duration-700">
              “It wasn’t my finest code yet, but it was my first real client. That grit taught me
              how real businesses buy, operate, and scale.”
            </p>
          </div>
        </header>
      </div>

      {/* Full-Bleed Path Stage (Desktop Edge-to-Edge) */}
      <div ref={stageRef} className="relative hidden lg:block w-full aspect-1440/1800 z-2">
        {/* Decorative Flowing Side Ribbons (Anchored off exact left & right screen edges) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-2"
          viewBox="0 0 1440 1800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDay ? '#F8FBFF' : '#0d0d0d'} />
              <stop offset="50%" stopColor={isDay ? '#FFFFFF' : '#1A1A1A'} />
              <stop offset="100%" stopColor={isDay ? '#F8FBFF' : '#0d0d0d'} />
            </linearGradient>
            <path
              id="ribbon-right-path"
              d="M 1480 200 C 1270 245, 1215 390, 1310 430 C 1390 465, 1365 335, 1275 365 C 1175 400, 1215 590, 1480 665"
            />
            <path
              id="ribbon-left-path"
              d="M -40 965 C 145 940, 175 1090, 105 1195 C 45 1285, 180 1345, 130 1445 C 95 1515, 10 1535, -40 1545"
            />
          </defs>

          {/* Right Ribbon */}
          <g opacity={isDay ? 0.96 : 0.9}>
            <use
              href="#ribbon-right-path"
              fill="none"
              stroke={isDay ? 'rgba(225,29,72,0.38)' : 'rgba(255,7,58,0.42)'}
              strokeWidth="34"
              strokeLinecap="round"
            />
            <use
              href="#ribbon-right-path"
              fill="none"
              stroke="url(#ribbonGrad)"
              strokeWidth="30"
              strokeLinecap="round"
            />
            <text
              dy="4"
              className={`font-mono text-[12px] font-semibold tracking-[0.2em] uppercase ${
                isDay ? 'fill-[#0F172A]' : 'fill-[#cbd5e1]'
              }`}
            >
              <textPath ref={ribbonText1Ref} href="#ribbon-right-path" startOffset="4%">
                FULL STACK DEV &bull; NEXT.JS &bull; NODE &bull; AUTOMATION &bull; KARACHI TO CLOUD &bull;
              </textPath>
            </text>
          </g>

          {/* Left Ribbon */}
          <g opacity={isDay ? 0.96 : 0.9}>
            <use
              href="#ribbon-left-path"
              fill="none"
              stroke={isDay ? 'rgba(22,163,74,0.36)' : 'rgba(57,255,20,0.36)'}
              strokeWidth="34"
              strokeLinecap="round"
            />
            <use
              href="#ribbon-left-path"
              fill="none"
              stroke="url(#ribbonGrad)"
              strokeWidth="30"
              strokeLinecap="round"
            />
            <text
              dy="4"
              className={`font-mono text-[12px] font-semibold tracking-[0.2em] uppercase ${
                isDay ? 'fill-[#0F172A]' : 'fill-[#cbd5e1]'
              }`}
            >
              <textPath ref={ribbonText2Ref} href="#ribbon-left-path" startOffset="6%">
                PYNTFLOW ERP &bull; TAWAKKAL PAINT &bull; REAL BUSINESS SYSTEMS &bull;
              </textPath>
            </text>
          </g>
        </svg>

        {/* Main Edge-to-Edge Scroll-Drawn Winding Path */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-1"
          viewBox="0 0 1440 1800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="activeStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDay ? '#E11D48' : '#FF073A'} />
              <stop offset="50%" stopColor={isDay ? '#16A34A' : '#39FF14'} />
              <stop offset="100%" stopColor={isDay ? '#16A34A' : '#39FF14'} />
            </linearGradient>
            <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation={isDay ? '5' : '8'} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="orbGrad">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor={isDay ? '#16A34A' : '#39FF14'} />
              <stop offset="100%" stopColor={isDay ? 'rgba(22,163,74,0)' : 'rgba(57,255,20,0)'} />
            </radialGradient>
          </defs>

          {/* Background Idle Track */}
          <path
            d={WINDING_PATH_D}
            fill="none"
            stroke={isDay ? '#DDE7F4' : '#1A1A1A'}
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Soft Inner Guide Hairline */}
          <path
            d={WINDING_PATH_D}
            fill="none"
            stroke={isDay ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.06)'}
            strokeWidth="2"
            strokeDasharray="8 10"
          />

          {/* Active Scroll-Drawn Stroke */}
          <path
            ref={activePathRef}
            d={WINDING_PATH_D}
            fill="none"
            stroke="url(#activeStrokeGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />

          {/* Glowing Leading Comet Orb */}
          <circle ref={orbHaloRef} cx="-40" cy="130" r="30" fill="url(#orbGrad)" opacity="0" />
          <circle ref={orbCoreRef} cx="-40" cy="130" r="8" fill="#ffffff" opacity="0" />
        </svg>

        {/* NODE 01 */}
        <button
          ref={(el) => {
            nodeRefs.current[0] = el;
          }}
          type="button"
          onClick={() => scrollToStep(0)}
          aria-label="Step 1"
          className={`absolute left-[29.17%] top-[12.22%] -translate-x-1/2 -translate-y-1/2 w-14.5 h-14.5 rounded-full flex items-center justify-center font-mono text-[1.02rem] font-bold border-2 cursor-pointer z-6 transition-all duration-450 ${
            reachedSteps[0]
              ? 'bg-white text-slate-900 border-emerald-600 scale-114 shadow-[0_8px_24px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_24px_rgba(57,255,20,0.55),0_0_46px_rgba(255,7,58,0.28)]'
              : 'bg-white text-slate-500 border-slate-300 hover:border-emerald-600 hover:text-slate-900 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15 dark:hover:border-[#39FF14] dark:hover:text-white hover:scale-110'
          }`}
        >
          01
          {reachedSteps[0] && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
            />
          )}
        </button>

        <article
          className={`absolute left-[35.5%] top-[5.5%] w-[34%] max-w-120 z-5 transition-all duration-650 ${
            reachedSteps[0]
              ? 'opacity-100 translate-y-0 blur-none pointer-events-auto'
              : 'opacity-0 translate-y-6.5 blur-xs pointer-events-none'
          }`}
        >
          <div className="flex items-center flex-wrap gap-3 mb-3">
            <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.08em] uppercase text-rose-700 bg-rose-500/12 border border-rose-500/30 dark:text-[#ffb3c1] dark:bg-[#FF073A]/15 dark:border-[#FF073A]/35 px-2.75 py-1 rounded-full">
              First Commercial Client
            </span>
            <span className="font-mono text-[0.72rem] text-slate-500 dark:text-[#64748b]">
              Karachi &bull; Brick &amp; Mortar
            </span>
          </div>
          <h3 className="text-[clamp(1.45rem,2.25vw,2.05rem)] font-extrabold leading-[1.18] tracking-[-0.02em] text-slate-900 dark:text-white mb-2.5">
            Pitching{' '}
            <span
              className="font-bold text-[1.22em] text-emerald-600 dark:text-[#39FF14] mx-1 dark:[text-shadow:0_0_18px_rgba(57,255,20,0.35)]"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Karachi
            </span>{' '}
            Brick &amp; Mortar
          </h3>
          <p className="text-[0.96rem] leading-[1.66] text-slate-600 dark:text-[#94a3b8] mb-4">
            I stepped into Tawakkal Paint House, introduced myself to the owner face-to-face, and
            landed my very first commercial web client without a single YouTube tutorial clone.
          </p>
          <button
            type="button"
            onClick={() => setPitchToggled((prev) => !prev)}
            title="Click to toggle insight"
            className="w-full text-left px-3.5 py-3 rounded-xl bg-white/95 border border-dashed border-rose-500/45 text-[0.87rem] text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-rose-50 dark:bg-[#1A1A1A]/90 dark:border-[#FF073A]/45 dark:text-[#ffe4ea] dark:shadow-none cursor-pointer transition-all duration-250 dark:hover:bg-[#FF073A]/15 hover:translate-x-0.75"
          >
            <span className="block font-mono text-[0.68rem] uppercase tracking-[0.08em] text-rose-600 dark:text-[#FF073A] mb-1">
              The Face-to-Face Pitch (Click)
            </span>
            <span>
              {pitchToggled
                ? 'Result: Built their first digital catalog & discovered real retail ERP gaps.'
                : '“Do you want a modern digital presence for your shop?” — He said yes.'}
            </span>
          </button>
        </article>

        {/* NODE 02 */}
        <button
          ref={(el) => {
            nodeRefs.current[1] = el;
          }}
          type="button"
          onClick={() => scrollToStep(1)}
          aria-label="Step 2"
          className={`absolute left-[65.28%] top-[31.11%] -translate-x-1/2 -translate-y-1/2 w-14.5 h-14.5 rounded-full flex items-center justify-center font-mono text-[1.02rem] font-bold border-2 cursor-pointer z-6 transition-all duration-450 ${
            reachedSteps[1]
              ? 'bg-white text-slate-900 border-emerald-600 scale-114 shadow-[0_8px_24px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_24px_rgba(57,255,20,0.55),0_0_46px_rgba(255,7,58,0.28)]'
              : 'bg-white text-slate-500 border-slate-300 hover:border-emerald-600 hover:text-slate-900 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15 dark:hover:border-[#39FF14] dark:hover:text-white hover:scale-110'
          }`}
        >
          02
          {reachedSteps[1] && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
            />
          )}
        </button>

        <article
          className={`absolute right-[49%] top-[27%] w-[37%] max-w-113.75 text-right z-5 transition-all duration-650 ${
            reachedSteps[1]
              ? 'opacity-100 translate-y-0 blur-none pointer-events-auto'
              : 'opacity-0 translate-y-6.5 blur-xs pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-end flex-wrap gap-3 mb-3">
            <span className="font-mono text-[0.72rem] text-slate-500 dark:text-[#64748b]">Paper &rarr; Digital</span>
            <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.08em] uppercase text-emerald-700 bg-emerald-500/12 border border-emerald-600/30 dark:text-[#39FF14] dark:bg-[#39FF14]/10 dark:border-[#39FF14]/30 px-2.75 py-1 rounded-full">
              Real Retail Friction Discovered
            </span>
          </div>
          <h3 className="text-[clamp(1.45rem,2.25vw,2.05rem)] font-extrabold leading-[1.18] tracking-[-0.02em] text-slate-900 dark:text-white mb-2.5">
            Tawakkal Paint House
          </h3>
          <p className="text-[0.96rem] leading-[1.66] text-slate-600 dark:text-[#94a3b8] mb-4">
            Turning paper catalogs into searchable contractor ordering uncovered deeper daily
            bottlenecks across the shop floor. Click a bottleneck to inspect:
          </p>
          <div className="flex flex-wrap justify-end gap-2 mb-2.5">
            {FRICTION_CHIPS.map((chip, idx) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setActiveChipIdx(idx)}
                className={`font-mono text-[0.72rem] px-2.75 py-1.5 rounded-lg border cursor-pointer transition-all duration-220 ${
                  activeChipIdx === idx
                    ? 'bg-emerald-600/12 border-emerald-600 text-emerald-800 shadow-xs dark:bg-[#39FF14]/15 dark:border-[#39FF14] dark:text-white dark:shadow-[0_0_14px_rgba(57,255,20,0.22)]'
                    : 'bg-white border-slate-900/12 text-slate-600 hover:border-emerald-600 hover:text-slate-900 dark:bg-[#1A1A1A] dark:border-white/12 dark:text-[#cbd5e1] dark:hover:bg-[#39FF14]/14 dark:hover:border-[#39FF14] dark:hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <p className="text-[0.84rem] text-emerald-700 dark:text-[#39FF14] min-h-5">
            &rarr; {FRICTION_CHIPS[activeChipIdx].info}
          </p>
        </article>

        {/* NODE 03 */}
        <button
          ref={(el) => {
            nodeRefs.current[2] = el;
          }}
          type="button"
          onClick={() => scrollToStep(2)}
          aria-label="Step 3"
          className={`absolute left-[36.11%] top-[56.67%] -translate-x-1/2 -translate-y-1/2 w-14.5 h-14.5 rounded-full flex items-center justify-center font-mono text-[1.02rem] font-bold border-2 cursor-pointer z-6 transition-all duration-450 ${
            reachedSteps[2]
              ? 'bg-white text-slate-900 border-emerald-600 scale-114 shadow-[0_8px_24px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_24px_rgba(57,255,20,0.55),0_0_46px_rgba(255,7,58,0.28)]'
              : 'bg-white text-slate-500 border-slate-300 hover:border-emerald-600 hover:text-slate-900 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15 dark:hover:border-[#39FF14] dark:hover:text-white hover:scale-110'
          }`}
        >
          03
          {reachedSteps[2] && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
            />
          )}
        </button>

        <article
          className={`absolute left-[44.5%] top-[50%] w-[34%] max-w-120 z-5 transition-all duration-650 ${
            reachedSteps[2]
              ? 'opacity-100 translate-y-0 blur-none pointer-events-auto'
              : 'opacity-0 translate-y-6.5 blur-xs pointer-events-none'
          }`}
        >
          <div className="flex items-center flex-wrap gap-3 mb-3">
            <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.08em] uppercase text-emerald-700 bg-emerald-500/12 border border-emerald-600/30 dark:text-[#39FF14] dark:bg-[#39FF14]/10 dark:border-[#39FF14]/30 px-2.75 py-1 rounded-full">
              60% Faster Counter Checkout
            </span>
            <span className="font-mono text-[0.72rem] text-slate-500 dark:text-[#64748b]">Cloud ERP &amp; POS</span>
          </div>
          <h3 className="text-[clamp(1.45rem,2.25vw,2.05rem)] font-extrabold leading-[1.18] tracking-[-0.02em] text-slate-900 dark:text-white mb-2.5">
            <span
              className="font-bold text-[1.22em] text-emerald-600 dark:text-[#39FF14] mr-1 dark:[text-shadow:0_0_18px_rgba(57,255,20,0.35)]"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Pyntflow
            </span>{' '}
            Cloud ERP &amp; POS
          </h3>
          <p className="text-[0.96rem] leading-[1.66] text-slate-600 dark:text-[#94a3b8] mb-4">
            That real-world insight sparked Pyntflow: an end-to-end cloud platform built
            specifically for paint wholesalers and multi-branch retailers.
          </p>
          <div className="flex gap-2 flex-wrap mb-3">
            {ERP_MODULES.map((mod, idx) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveErpIdx(idx)}
                className={`font-mono text-[0.72rem] px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-220 ${
                  activeErpIdx === idx
                    ? 'bg-emerald-600/12 border-emerald-600 text-emerald-800 shadow-xs dark:bg-[#39FF14]/15 dark:border-[#39FF14] dark:text-white dark:shadow-[0_0_12px_rgba(57,255,20,0.25)]'
                    : 'bg-white border-slate-900/12 text-slate-600 hover:border-emerald-600 hover:text-slate-900 dark:bg-[#1A1A1A] dark:border-white/12 dark:text-[#94a3b8] dark:hover:bg-[#39FF14]/14 dark:hover:border-[#39FF14] dark:hover:text-white'
                }`}
              >
                {mod.tab}
              </button>
            ))}
          </div>
          <div className="px-3.5 py-3 rounded-xl bg-white border border-slate-900/10 shadow-[0_8px_22px_rgba(15,23,42,0.06)] dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none">
            <div className="flex justify-between font-mono text-[0.76rem] text-slate-800 dark:text-[#e2e8f0] mb-2">
              <span>{activeErp.label}</span>
              <span className="text-emerald-700 font-semibold dark:text-[#39FF14]">{activeErp.val}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/8 overflow-hidden">
              <div
                className={`h-full rounded-full bg-linear-to-r from-[#E11D48] to-[#16A34A] dark:from-[#FF073A] dark:to-[#39FF14] transition-all duration-450 ${activeErp.widthClass}`}
              />
            </div>
          </div>
        </article>

        {/* NODE 04 */}
        <button
          ref={(el) => {
            nodeRefs.current[3] = el;
          }}
          type="button"
          onClick={() => scrollToStep(3)}
          aria-label="Step 4"
          className={`absolute left-[59.72%] top-[80%] -translate-x-1/2 -translate-y-1/2 w-14.5 h-14.5 rounded-full flex items-center justify-center font-mono text-[1.02rem] font-bold border-2 cursor-pointer z-6 transition-all duration-450 ${
            reachedSteps[3]
              ? 'bg-white text-slate-900 border-emerald-600 scale-114 shadow-[0_8px_24px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_24px_rgba(57,255,20,0.55),0_0_46px_rgba(255,7,58,0.28)]'
              : 'bg-white text-slate-500 border-slate-300 hover:border-emerald-600 hover:text-slate-900 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15 dark:hover:border-[#39FF14] dark:hover:text-white hover:scale-110'
          }`}
        >
          04
          {reachedSteps[3] && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
            />
          )}
        </button>

        <article
          className={`absolute right-[49%] top-[74.5%] w-[34%] max-w-120 text-right z-5 transition-all duration-650 ${
            reachedSteps[3]
              ? 'opacity-100 translate-y-0 blur-none pointer-events-auto'
              : 'opacity-0 translate-y-6.5 blur-xs pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-end flex-wrap gap-3 mb-3">
            <span className="font-mono text-[0.72rem] text-slate-500 dark:text-[#64748b]">Today &amp; Beyond</span>
            <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.08em] uppercase text-rose-700 bg-rose-500/12 border border-rose-500/30 dark:text-[#ffb3c1] dark:bg-[#FF073A]/15 dark:border-[#FF073A]/35 px-2.75 py-1 rounded-full">
              Full Stack &amp; Automation
            </span>
          </div>
          <h3 className="text-[clamp(1.45rem,2.25vw,2.05rem)] font-extrabold leading-[1.18] tracking-[-0.02em] text-slate-900 dark:text-white mb-2.5">
            Turning Ideas Into{' '}
            <span
              className="font-bold text-[1.22em] text-emerald-600 dark:text-[#39FF14] mx-1 dark:[text-shadow:0_0_18px_rgba(57,255,20,0.35)]"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Reality
            </span>
          </h3>
          <p className="text-[0.96rem] leading-[1.66] text-slate-600 dark:text-[#94a3b8] mb-4">
            I build modern web experiences, automate workflows, and ship scalable production
            software designed for real users and real business growth.
          </p>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <div className="px-3 py-2.5 rounded-xl bg-white border border-slate-900/10 shadow-[0_8px_20px_rgba(15,23,42,0.05)] text-center transition-all duration-250 hover:border-emerald-600/50 dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none dark:hover:border-[#39FF14]/50 hover:-translate-y-0.5">
              <strong className="block text-[1.15rem] font-extrabold text-slate-900 dark:text-white">2+</strong>
              <span className="font-mono text-[0.64rem] uppercase text-slate-500 dark:text-[#94a3b8] tracking-wider">
                Years Learning
              </span>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-white border border-slate-900/10 shadow-[0_8px_20px_rgba(15,23,42,0.05)] text-center transition-all duration-250 hover:border-emerald-600/50 dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none dark:hover:border-[#39FF14]/50 hover:-translate-y-0.5">
              <strong className="block text-[1.15rem] font-extrabold text-slate-900 dark:text-white">10+</strong>
              <span className="font-mono text-[0.64rem] uppercase text-slate-500 dark:text-[#94a3b8] tracking-wider">
                Projects Built
              </span>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-white border border-slate-900/10 shadow-[0_8px_20px_rgba(15,23,42,0.05)] text-center transition-all duration-250 hover:border-emerald-600/50 dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none dark:hover:border-[#39FF14]/50 hover:-translate-y-0.5">
              <strong className="block text-[1.15rem] font-extrabold text-slate-900 dark:text-white">100%</strong>
              <span className="font-mono text-[0.64rem] uppercase text-slate-500 dark:text-[#94a3b8] tracking-wider">
                Dedication
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-1.75">
            {['Next.js', 'React', 'Node.js', 'Supabase', 'Workflow Automation'].map((pill) => (
              <span
                key={pill}
                className="font-mono text-[0.7rem] px-2.5 py-1 rounded-full bg-white border border-emerald-600/35 text-emerald-800 shadow-2xs dark:bg-[#1A1A1A] dark:border-[#39FF14]/35 dark:text-[#e2ffe0] dark:shadow-none"
              >
                {pill}
              </span>
            ))}
          </div>
        </article>
      </div>

      {/* Mobile Animated Winding Timeline (< lg) */}
      <div ref={mobileTimelineRef} className="relative z-2 max-w-310 mx-auto px-4 sm:px-8 lg:hidden">
        <div className="relative pl-10 sm:pl-12 py-2">
          {/* Shared unified track container */}
          <div className="absolute left-3.5 sm:left-4 top-4 bottom-4 w-1 pointer-events-none">
            <div className="w-full h-full bg-slate-200 dark:bg-[#1A1A1A] rounded-full transition-colors duration-700" />
            <div
              className="absolute top-0 left-0 w-full rounded-full bg-linear-to-b from-[#E11D48] to-[#16A34A] dark:from-[#FF073A] dark:to-[#39FF14] shadow-[0_0_12px_rgba(22,163,74,0.45)] dark:shadow-[0_0_14px_rgba(57,255,20,0.85)]"
              style={{ height: `${Math.min(100, Math.max(0, mobileProgress * 100))}%` }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(22,163,74,0.7),0_0_16px_rgba(225,29,72,0.45)] dark:shadow-[0_0_12px_#ffffff,0_0_20px_#39FF14,0_0_32px_#FF073A]"
              style={{
                top: `${Math.min(100, Math.max(0, mobileProgress * 100))}%`,
                opacity: mobileProgress > 0.01 && mobileProgress < 0.99 ? 1 : 0,
              }}
            />
          </div>

          <div className="flex flex-col gap-10">
            {/* ── STEP 01 ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => scrollToStep(0)}
                aria-label="Step 1"
                className={`absolute -left-10.75 sm:-left-11.75 top-0 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 cursor-pointer transition-all duration-400 ${
                  reachedSteps[0]
                    ? 'bg-white text-slate-900 border-emerald-600 scale-110 shadow-[0_6px_18px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_20px_rgba(57,255,20,0.55),0_0_36px_rgba(255,7,58,0.3)]'
                    : 'bg-white text-slate-500 border-slate-300 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15'
                }`}
              >
                01
                {reachedSteps[0] && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
                  />
                )}
              </button>

              <article
                className={`transition-all duration-500 ${
                  reachedSteps[0] ? 'opacity-100 translate-y-0 blur-none' : 'opacity-40 translate-y-2 blur-[1px]'
                }`}
              >
                <span className="inline-flex items-center font-mono text-[0.72rem] tracking-[0.08em] uppercase text-rose-700 bg-rose-500/12 border border-rose-500/30 dark:text-[#ffb3c1] dark:bg-[#FF073A]/15 dark:border-[#FF073A]/35 px-2.5 py-0.5 rounded-full mb-2">
                  First Commercial Client
                </span>
                <h3 className="text-xl xs:text-2xl font-extrabold leading-tight text-slate-900 dark:text-white mb-2">
                  Pitching{' '}
                  <span
                    className="font-bold text-[1.22em] text-emerald-600 dark:text-[#39FF14] mx-1"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    Karachi
                  </span>{' '}
                  Brick &amp; Mortar
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8] mb-3">
                  Stepped into Tawakkal Paint House face-to-face and landed my first commercial web
                  client by solving a real local shop&apos;s digital needs.
                </p>
                <button
                  type="button"
                  onClick={() => setPitchToggled((prev) => !prev)}
                  title="Click to toggle insight"
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/95 border border-dashed border-rose-500/45 text-xs text-slate-800 shadow-sm hover:bg-rose-50 dark:bg-[#1A1A1A]/90 dark:border-[#FF073A]/45 dark:text-[#ffe4ea] dark:shadow-none cursor-pointer transition-all duration-250 dark:hover:bg-[#FF073A]/15"
                >
                  <span className="block font-mono text-[0.68rem] uppercase tracking-wider text-rose-600 dark:text-[#FF073A] mb-1">
                    The Face-to-Face Pitch (Tap)
                  </span>
                  <span>
                    {pitchToggled
                      ? 'Result: Built their first digital catalog & discovered real retail ERP gaps.'
                      : '“Do you want a modern digital presence for your shop?” — He said yes.'}
                  </span>
                </button>
              </article>
            </div>

            {/* ── STEP 02 ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => scrollToStep(1)}
                aria-label="Step 2"
                className={`absolute -left-10.75 sm:-left-11.75 top-0 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 cursor-pointer transition-all duration-400 ${
                  reachedSteps[1]
                    ? 'bg-white text-slate-900 border-emerald-600 scale-110 shadow-[0_6px_18px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_20px_rgba(57,255,20,0.55),0_0_36px_rgba(255,7,58,0.3)]'
                    : 'bg-white text-slate-500 border-slate-300 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15'
                }`}
              >
                02
                {reachedSteps[1] && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
                  />
                )}
              </button>

              <article
                className={`transition-all duration-500 ${
                  reachedSteps[1] ? 'opacity-100 translate-y-0 blur-none' : 'opacity-40 translate-y-2 blur-[1px]'
                }`}
              >
                <span className="inline-flex items-center font-mono text-[0.72rem] tracking-[0.08em] uppercase text-emerald-700 bg-emerald-500/12 border border-emerald-600/30 dark:text-[#39FF14] dark:bg-[#39FF14]/10 dark:border-[#39FF14]/30 px-2.5 py-0.5 rounded-full mb-2">
                  Real Retail Friction Discovered
                </span>
                <h3 className="text-xl xs:text-2xl font-extrabold leading-tight text-slate-900 dark:text-white mb-2">
                  Tawakkal Paint House
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8] mb-3">
                  Turned paper catalogs into searchable contractor ordering while uncovering daily retail
                  bottlenecks. Tap a bottleneck to inspect:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {FRICTION_CHIPS.map((chip, idx) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setActiveChipIdx(idx)}
                      className={`font-mono text-[0.7rem] px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-200 ${
                        activeChipIdx === idx
                          ? 'bg-emerald-600/12 border-emerald-600 text-emerald-800 dark:bg-[#39FF14]/15 dark:border-[#39FF14] dark:text-white dark:shadow-[0_0_12px_rgba(57,255,20,0.25)]'
                          : 'bg-white border-slate-900/12 text-slate-600 dark:bg-[#1A1A1A] dark:border-white/12 dark:text-[#cbd5e1]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-emerald-700 dark:text-[#39FF14] min-h-4">
                  &rarr; {FRICTION_CHIPS[activeChipIdx].info}
                </p>
              </article>
            </div>

            {/* ── STEP 03 ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => scrollToStep(2)}
                aria-label="Step 3"
                className={`absolute -left-10.75 sm:-left-11.75 top-0 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 cursor-pointer transition-all duration-400 ${
                  reachedSteps[2]
                    ? 'bg-white text-slate-900 border-emerald-600 scale-110 shadow-[0_6px_18px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_20px_rgba(57,255,20,0.55),0_0_36px_rgba(255,7,58,0.3)]'
                    : 'bg-white text-slate-500 border-slate-300 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15'
                }`}
              >
                03
                {reachedSteps[2] && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
                  />
                )}
              </button>

              <article
                className={`transition-all duration-500 ${
                  reachedSteps[2] ? 'opacity-100 translate-y-0 blur-none' : 'opacity-40 translate-y-2 blur-[1px]'
                }`}
              >
                <span className="inline-flex items-center font-mono text-[0.72rem] tracking-[0.08em] uppercase text-emerald-700 bg-emerald-500/12 border border-emerald-600/30 dark:text-[#39FF14] dark:bg-[#39FF14]/10 dark:border-[#39FF14]/30 px-2.5 py-0.5 rounded-full mb-2">
                  60% Faster Counter Checkout
                </span>
                <h3 className="text-xl xs:text-2xl font-extrabold leading-tight text-slate-900 dark:text-white mb-2">
                  <span
                    className="font-bold text-[1.22em] text-emerald-600 dark:text-[#39FF14] mr-1"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    Pyntflow
                  </span>{' '}
                  Cloud ERP &amp; POS
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8] mb-3">
                  Sparked Pyntflow: an end-to-end cloud ERP, tint recipe calculator, and high-speed POS
                  built for multi-branch paint retailers and wholesalers.
                </p>
                <div className="flex gap-1.5 flex-wrap mb-2.5">
                  {ERP_MODULES.map((mod, idx) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setActiveErpIdx(idx)}
                      className={`font-mono text-[0.7rem] px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-200 ${
                        activeErpIdx === idx
                          ? 'bg-emerald-600/12 border-emerald-600 text-emerald-800 dark:bg-[#39FF14]/15 dark:border-[#39FF14] dark:text-white dark:shadow-[0_0_12px_rgba(57,255,20,0.25)]'
                          : 'bg-white border-slate-900/12 text-slate-600 dark:bg-[#1A1A1A] dark:border-white/12 dark:text-[#94a3b8]'
                      }`}
                    >
                      {mod.tab}
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2.5 rounded-xl bg-white border border-slate-900/10 shadow-sm dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none">
                  <div className="flex justify-between font-mono text-xs text-slate-800 dark:text-[#e2e8f0] mb-1.5">
                    <span>{activeErp.label}</span>
                    <span className="text-emerald-700 font-semibold dark:text-[#39FF14]">{activeErp.val}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/8 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-linear-to-r from-[#E11D48] to-[#16A34A] dark:from-[#FF073A] dark:to-[#39FF14] transition-all duration-450 ${activeErp.widthClass}`}
                    />
                  </div>
                </div>
              </article>
            </div>

            {/* ── STEP 04 ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => scrollToStep(3)}
                aria-label="Step 4"
                className={`absolute -left-10.75 sm:-left-11.75 top-0 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 cursor-pointer transition-all duration-400 ${
                  reachedSteps[3]
                    ? 'bg-white text-slate-900 border-emerald-600 scale-110 shadow-[0_6px_18px_rgba(22,163,74,0.28)] dark:bg-[#000000] dark:text-white dark:border-[#39FF14] dark:shadow-[0_0_20px_rgba(57,255,20,0.55),0_0_36px_rgba(255,7,58,0.3)]'
                    : 'bg-white text-slate-500 border-slate-300 dark:bg-[#1A1A1A] dark:text-[#64748b] dark:border-white/15'
                }`}
              >
                04
                {reachedSteps[3] && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-emerald-600/50 dark:border-[#39FF14]/50 animate-[spinSlow_14s_linear_infinite]"
                  />
                )}
              </button>

              <article
                className={`transition-all duration-500 ${
                  reachedSteps[3] ? 'opacity-100 translate-y-0 blur-none' : 'opacity-40 translate-y-2 blur-[1px]'
                }`}
              >
                <span className="inline-flex items-center font-mono text-[0.72rem] tracking-[0.08em] uppercase text-rose-700 bg-rose-500/12 border border-rose-500/30 dark:text-[#ffb3c1] dark:bg-[#FF073A]/15 dark:border-[#FF073A]/35 px-2.5 py-0.5 rounded-full mb-2">
                  Full Stack &amp; Automation
                </span>
                <h3 className="text-xl xs:text-2xl font-extrabold leading-tight text-slate-900 dark:text-white mb-2">
                  Turning Ideas Into{' '}
                  <span
                    className="font-bold text-[1.22em] text-emerald-600 dark:text-[#39FF14] mx-1"
                    style={{ fontFamily: "'Caveat', cursive" }}
                  >
                    Reality
                  </span>
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-[#94a3b8] mb-3">
                  2+ years learning, 10+ projects, and 100% dedication—building modern web experiences,
                  automating workflows, and turning ideas into real products.
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="px-2.5 py-2 rounded-xl bg-white border border-slate-900/10 shadow-2xs text-center dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none">
                    <strong className="block text-base font-extrabold text-slate-900 dark:text-white">2+</strong>
                    <span className="font-mono text-[0.62rem] uppercase text-slate-500 dark:text-[#94a3b8] tracking-wider">Years</span>
                  </div>
                  <div className="px-2.5 py-2 rounded-xl bg-white border border-slate-900/10 shadow-2xs text-center dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none">
                    <strong className="block text-base font-extrabold text-slate-900 dark:text-white">10+</strong>
                    <span className="font-mono text-[0.62rem] uppercase text-slate-500 dark:text-[#94a3b8] tracking-wider">Projects</span>
                  </div>
                  <div className="px-2.5 py-2 rounded-xl bg-white border border-slate-900/10 shadow-2xs text-center dark:bg-[#1A1A1A] dark:border-white/10 dark:shadow-none">
                    <strong className="block text-base font-extrabold text-slate-900 dark:text-white">100%</strong>
                    <span className="font-mono text-[0.62rem] uppercase text-slate-500 dark:text-[#94a3b8] tracking-wider">Grit</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Next.js', 'React', 'Node.js', 'Supabase', 'Automation'].map((pill) => (
                    <span
                      key={pill}
                      className="font-mono text-[0.68rem] px-2 py-0.5 rounded-full bg-white border border-emerald-600/35 text-emerald-800 dark:bg-[#1A1A1A] dark:border-[#39FF14]/35 dark:text-[#e2ffe0]"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
