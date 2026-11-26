import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Download, Send } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { useSkyTheme } from '../context/ThemeContext';
import { downloadAliCv } from '../utils/downloadCv';

interface HandwrittenHeroProps {
  currentFrame?: number;
  isComplete?: boolean;
  revealActive?: boolean;
  onConnectClick?: () => void;
}

export const HandwrittenHero: React.FC<HandwrittenHeroProps> = ({
  revealActive = true,
  onConnectClick,
}) => {
  const { isDay } = useSkyTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [nameTyped, setNameTyped] = useState<boolean>(false);
  const [buttonsPop, setButtonsPop] = useState<boolean>(false);
  const [cvDownloaded, setCvDownloaded] = useState<boolean>(false);
  const [hoveredBtn, setHoveredBtn] = useState<'cv' | 'connect' | null>(null);
  const [fontsReady, setFontsReady] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );

  // Sync with active breakpoint so hidden mobile/desktop trees don't run duplicate timers
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Pre-wait for Google Fonts during the 980ms EntryCurtain hold (capped at 400ms safety)
  useEffect(() => {
    let active = true;
    const fallbackTimer = window.setTimeout(() => {
      if (active) setFontsReady(true);
    }, 400);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) {
          window.clearTimeout(fallbackTimer);
          setFontsReady(true);
        }
      });
    } else {
      setFontsReady(true);
    }

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  // Activate as soon as curtain begins lifting and handwritten fonts are ready
  const introActive = revealActive && fontsReady;

  // Once typing completes (~680ms), pop the action buttons into view
  useEffect(() => {
    if (!introActive) {
      setButtonsPop(false);
      setNameTyped(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setNameTyped(true);
      setButtonsPop(true);
    }, 680);
    return () => window.clearTimeout(timer);
  }, [introActive]);


  useEffect(() => {
    if (!introActive) return;
    const root = containerRef.current;
    if (!root) return;

    const timers: number[] = [];
    const svgs = root.querySelectorAll<SVGElement>('[data-svg-draw]');

    svgs.forEach((svg) => {
      const stepEl = svg.closest('[data-ui-delay]') as HTMLElement | null;
      const delayMs = stepEl ? parseFloat(stepEl.dataset.uiDelay || '200') : 200;

      svg
        .querySelectorAll<SVGGeometryElement>('path, circle, ellipse, rect, polyline, line')
        .forEach((shape, idx) => {
          if (typeof shape.getTotalLength !== 'function') return;
          let length = 0;
          try {
            length = shape.getTotalLength();
          } catch {
            return;
          }
          if (!length || !Number.isFinite(length)) return;

          shape.style.strokeDasharray = `${length}`;
          shape.style.strokeDashoffset = `${length}`;
          shape.style.transition = 'none';

          const timer = window.setTimeout(() => {
            shape.style.transition = `stroke-dashoffset 1.05s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 60}ms`;
            shape.style.strokeDashoffset = '0';
          }, delayMs);

          timers.push(timer);
        });
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [introActive]);

  const inkStroke = isDay ? '#0f172a' : '#f8fafc';
  const subtleInkStroke = isDay ? '#475569' : '#cbd5e1';
  const accentPurple = isDay ? '#7c3aed' : '#a855f7';
  const accentGreen = isDay ? '#059669' : '#22c55e';

  // Action Buttons Renderer (Shared between Desktop and Mobile with tailored sizing)
  const renderActionButtons = (isMobile = false) => (
    <div
      className={`flex items-center pointer-events-auto ${
        isMobile
          ? 'flex-row justify-center gap-2 xs:gap-3 w-full mt-2.5 min-h-12.5'
          : 'flex-wrap gap-4 sm:gap-5 mt-6 sm:mt-7 ml-1 min-h-14.5'
      }`}
    >
      {/* Button 1: Download CV */}
      <motion.button
        type="button"
        onMouseEnter={() => setHoveredBtn('cv')}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={() => {
          downloadAliCv();
          setCvDownloaded(true);
          window.setTimeout(() => setCvDownloaded(false), 2200);
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={buttonsPop ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 18,
          mass: 0.8,
          delay: 0.04,
        }}
        whileHover={{ scale: 1.05, rotate: -1 }}
        whileTap={{ scale: 0.96 }}
        className={`group relative inline-flex items-center gap-2 -rotate-2 cursor-pointer select-none whitespace-nowrap origin-center ${
          isMobile ? 'px-4 py-2 xs:px-5 xs:py-2.5' : 'px-6 sm:px-7 py-3'
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-1 rounded-full transition-all duration-300 ${
            hoveredBtn === 'cv'
              ? 'opacity-100 bg-linear-to-r from-cyan-500/25 via-emerald-400/25 to-violet-500/25 shadow-[0_0_26px_rgba(34,211,238,0.5)]'
              : 'opacity-0'
          }`}
        />
        <svg
          viewBox="0 0 185 52"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        >
          <path
            d="M 28 7 C 74 3, 134 4, 162 8 C 179 12, 182 34, 166 42 C 138 48, 66 48, 22 44 C 5 40, 4 15, 28 7 Z"
            stroke={hoveredBtn === 'cv' ? '#22d3ee' : inkStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            className="transition-colors duration-300"
            style={{
              filter: hoveredBtn === 'cv' ? 'drop-shadow(0 0 11px rgba(34,211,238,0.85))' : 'none',
            }}
          />
          <path
            d="M 18 46 C 72 49, 132 47, 168 41"
            stroke={hoveredBtn === 'cv' ? '#34d399' : accentPurple}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={hoveredBtn === 'cv' ? 0.95 : 0.68}
            className="transition-all duration-300"
          />
        </svg>

        <span className="relative z-10 flex items-center gap-2">
          {cvDownloaded ? (
            <Check className={`${isMobile ? 'w-4 h-4' : 'w-4.5 h-4.5'} text-emerald-400`} strokeWidth={2.5} />
          ) : (
            <Download
              className={`${isMobile ? 'w-4 h-4' : 'w-4.5 h-4.5'} transition-colors duration-300 ${
                hoveredBtn === 'cv' ? 'text-cyan-500 dark:text-cyan-300' : 'text-slate-900 dark:text-white'
              }`}
              strokeWidth={2.3}
            />
          )}
          <span
            className={`${isMobile ? 'text-base xs:text-lg' : 'text-xl sm:text-2xl'} font-bold leading-none transition-colors duration-300 ${
              hoveredBtn === 'cv' ? 'text-cyan-700 dark:text-cyan-200' : 'text-slate-950 dark:text-white'
            }`}
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            {cvDownloaded ? 'CV Downloaded' : 'Download CV'}
          </span>
        </span>
      </motion.button>

      {/* Button 2: Let's Connect */}
      <motion.button
        type="button"
        onMouseEnter={() => setHoveredBtn('connect')}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={onConnectClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={buttonsPop ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 18,
          mass: 0.8,
          delay: 0.14,
        }}
        whileHover={{ scale: 1.05, rotate: 1 }}
        whileTap={{ scale: 0.96 }}
        className={`group relative inline-flex items-center gap-2 -rotate-1 cursor-pointer select-none whitespace-nowrap origin-center ${
          isMobile ? 'px-4 py-2 xs:px-5 xs:py-2.5' : 'px-6 sm:px-7 py-3'
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-1 rounded-full transition-all duration-300 ${
            hoveredBtn === 'connect'
              ? 'opacity-100 bg-linear-to-r from-cyan-500/25 via-violet-500/30 to-fuchsia-500/30 shadow-[0_0_28px_rgba(217,70,239,0.6)]'
              : 'opacity-100 bg-linear-to-r from-red-500/20 via-rose-500/18 to-red-600/20 shadow-[0_0_22px_rgba(255,42,85,0.45)]'
          }`}
        />
        <svg
          viewBox="0 0 185 52"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        >
          <path
            d="M 24 8 C 70 3, 132 5, 163 9 C 179 13, 181 35, 164 42 C 134 48, 62 47, 20 43 C 4 38, 5 14, 24 8 Z"
            stroke={hoveredBtn === 'connect' ? '#22d3ee' : '#ff2a55'}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-colors duration-300"
            style={{
              filter:
                hoveredBtn === 'connect'
                  ? 'drop-shadow(0 0 12px rgba(34,211,238,0.9))'
                  : 'drop-shadow(0 0 10px rgba(255,42,85,0.85))',
            }}
          />
          <path
            d="M 16 14 C 12 24, 15 39, 32 45 M 156 8 C 174 12, 182 26, 171 39"
            stroke={hoveredBtn === 'connect' ? '#d946ef' : '#ff5c7c'}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={hoveredBtn === 'connect' ? 1 : 0.88}
            className="transition-all duration-300"
          />
        </svg>

        <span className="relative z-10 flex items-center gap-2">
          <span
            className={`${isMobile ? 'text-base xs:text-lg' : 'text-xl sm:text-2xl'} font-bold leading-none transition-colors duration-300 ${
              hoveredBtn === 'connect'
                ? 'text-cyan-700 dark:text-cyan-200'
                : 'text-red-700 dark:text-rose-200 drop-shadow-[0_0_8px_rgba(255,42,85,0.45)]'
            }`}
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            Let&apos;s Connect
          </span>
          <Send
            className={`${isMobile ? 'w-4 h-4' : 'w-4.5 h-4.5'} transition-all duration-300 ${
              hoveredBtn === 'connect'
                ? 'text-cyan-500 dark:text-cyan-300 translate-x-0.5 -translate-y-0.5'
                : 'text-red-600 dark:text-rose-400'
            }`}
            strokeWidth={2.3}
          />
        </span>
      </motion.button>
    </div>
  );

  // Collaborative Note Renderer ("Let's build something amazing together! :)")
  const renderCollabNote = (isMobile = false) => (
    <div
      className={`relative flex flex-col pointer-events-auto ${
        isMobile
          ? 'items-center -rotate-1 mb-2.5 xs:mb-3.5 -translate-y-3 xs:-translate-y-4'
          : 'items-start -rotate-2.5 origin-left mt-2 ml-1'
      }`}
    >
      <div className="relative flex items-start">
        <svg className={`${isMobile ? 'w-4 h-5' : 'w-5 h-6'} mt-0.5 mr-1 shrink-0`} viewBox="0 0 22 26" fill="none" aria-hidden="true">
          <motion.path
            d="M 10 3 L 16 11 M 5 11 L 14 15 M 7 21 L 14 19"
            stroke={inkStroke}
            strokeWidth="1.9"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={nameTyped ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          />
        </svg>

        <div
          className={`flex flex-col font-bold leading-[1.08] text-slate-900 dark:text-slate-100 transition-colors duration-500 ${
            isMobile
              ? 'text-base xs:text-lg text-center items-center'
              : 'min-h-[2.95rem] sm:min-h-[3.35rem] text-xl sm:text-2xl xl:text-[1.7rem]'
          }`}
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          <span className={isMobile ? '' : 'pl-2 min-h-[1.35rem] sm:min-h-[1.55rem]'}>
            <TypewriterText text="Let's build" delay={20} speed={20} active={introActive} />
          </span>
          <span className={isMobile ? '' : 'min-h-[1.35rem] sm:min-h-[1.55rem]'}>
            <TypewriterText text="something amazing together!" delay={70} speed={18} active={introActive} />
          </span>
        </div>
      </div>

      {/* Emerald Double Brush Underline + Cute Smiley :) */}
      <div className={`flex items-start gap-1.5 w-full mt-0.5 ${isMobile ? 'justify-center pl-2' : 'pl-7'}`}>
        <svg className={`${isMobile ? 'w-36 xs:w-40' : 'w-44 sm:w-48'} h-4 sm:h-5`} viewBox="0 0 200 22" fill="none" aria-hidden="true">
          <motion.path
            d="M 4 15 C 62 7, 134 4, 194 7"
            stroke={accentGreen}
            strokeWidth="3.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={introActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.35, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.path
            d="M 28 19 C 80 13, 136 10, 174 12"
            stroke="#4ade80"
            strokeWidth="1.9"
            strokeLinecap="round"
            opacity="0.85"
            initial={{ pathLength: 0 }}
            animate={introActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.28, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        <svg className={`${isMobile ? 'w-5 h-5 -mt-1.5' : 'w-7 h-7 -mt-1'} shrink-0`} viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <motion.line
            x1="12" y1="10" x2="12" y2="15"
            stroke={inkStroke} strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={introActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.16, delay: 0.58 }}
          />
          <motion.line
            x1="22" y1="10" x2="22" y2="15"
            stroke={inkStroke} strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={introActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.16, delay: 0.62 }}
          />
          <motion.path
            d="M 7 19 C 12 28, 22 28, 27 19"
            stroke={inkStroke} strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={introActive ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.28, delay: 0.66 }}
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-20 flex flex-col justify-between pointer-events-none select-none px-3 xs:px-4 sm:px-8 md:px-12 lg:px-14 pt-14 sm:pt-20 pb-7 xs:pb-9 sm:pb-5 transition-opacity duration-300 opacity-100 ${
        isDay ? 'text-slate-900' : 'text-slate-100'
      }`}
    >
      {/* ─── DESKTOP HERO (lg:grid) — Preserves Original 3-Column Studio Layout ─── */}
      {isDesktop && (
      <div className="hidden lg:grid grid-cols-[minmax(280px,0.94fr)_minmax(340px,1.12fr)_minmax(280px,0.94fr)] items-center gap-6 w-full flex-1 min-h-0">
        {/* LEFT COLUMN — Name, Collab Note & Primary Actions */}
        <section className="flex flex-col items-start max-w-105 xl:max-w-116.25 pointer-events-auto mt-8">
          {/* Hello Note */}
          <div className="relative flex flex-col items-start -mb-1 -ml-5" data-ui-delay="480">
            <div className="inline-flex items-center gap-1 -rotate-8 origin-left">
              <svg className="w-5 h-6" viewBox="0 0 22 24" fill="none" aria-hidden="true" data-svg-draw>
                <path d="M6 7 L12 11 M4 14 L10 15 M9 20 L13 18" stroke={subtleInkStroke} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span
                className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 transition-colors duration-500"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                <TypewriterText text="Hello, I'm" delay={10} speed={24} active={introActive} />
              </span>
              <svg className="w-5 h-6" viewBox="0 0 22 24" fill="none" aria-hidden="true" data-svg-draw>
                <path d="M14 6 L9 12 M16 14 L11 16" stroke={subtleInkStroke} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <svg className="w-9 h-11 ml-11 -mt-1" viewBox="0 0 42 54" fill="none" aria-hidden="true" data-svg-draw>
              <path d="M20 4 C10 16, 10 33, 24 46" stroke={inkStroke} strokeWidth="1.9" strokeLinecap="round" />
              <path d="M15 44 L25 47 L26 37" stroke={inkStroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Hero Name: ALI TOUHEED */}
          <div className="relative mb-2 py-1" data-ui-delay="840">
            <h1
              className="m-0 text-[3.85rem] xl:text-[4.3rem] leading-none -rotate-4 origin-left whitespace-nowrap flex items-baseline gap-3.5"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              <span className="text-slate-950 dark:text-white transition-colors duration-500 drop-shadow-[0_2px_14px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_18px_rgba(255,255,255,0.2)]">
                <TypewriterText text="ALI" delay={30} speed={30} active={introActive} />
              </span>
              <span className="text-violet-600 dark:text-[#a855f7] transition-colors duration-500 dark:drop-shadow-[0_0_26px_rgba(168,85,247,0.75)]">
                <TypewriterText
                  text="TOUHEED"
                  delay={100}
                  speed={28}
                  active={introActive}
                  onComplete={() => setNameTyped(true)}
                />
              </span>
            </h1>

            <svg
              className="block w-full max-w-116 h-7 -mt-0.5 ml-2 -rotate-3"
              viewBox="0 0 460 28"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
              data-svg-draw
            >
              <path d="M18 16 C130 8, 300 6, 444 13" stroke={accentPurple} strokeWidth="6.2" strokeLinecap="round" />
              <path d="M58 23 C175 16, 325 14, 412 19" stroke="#c084fc" strokeWidth="2.4" strokeLinecap="round" opacity="0.82" />
            </svg>
          </div>

          {/* Collab Note */}
          {renderCollabNote(false)}

          {/* Buttons */}
          {renderActionButtons(false)}
        </section>

        {/* CENTER STAGE SPACER */}
        <div className="min-h-65 pointer-events-none" aria-hidden="true" />

        {/* RIGHT COLUMN — Role & Bio */}
        <aside className="flex flex-col items-end pointer-events-auto w-full pt-8">
          <div className="flex flex-col items-start max-w-81.25 xl:max-w-91.25 -mr-4 xl:-mr-6">
            <div
              className="mb-1 text-2xl lg:text-[2.05rem] font-bold leading-tight text-slate-900 dark:text-white -rotate-2 origin-left flex items-center flex-wrap gap-x-2 transition-colors duration-500"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              <span>
                <TypewriterText text="Web & App" delay={20} speed={22} active={introActive} />
              </span>
              <span className="text-violet-600 dark:text-[#a855f7] dark:drop-shadow-[0_0_16px_rgba(168,85,247,0.55)]">
                <TypewriterText text="Developer" delay={100} speed={22} active={introActive} />
              </span>
            </div>

            <div className="relative pl-0.5 -rotate-1.5 origin-left" data-ui-delay="480">
              <p
                className="m-0 text-lg xl:text-[1.35rem] leading-[1.22] text-slate-700 dark:text-slate-200 font-semibold transition-colors duration-500 min-h-[3.8rem]"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                <TypewriterText
                  text="I build modern web experiences, automate workflows, and turn ideas into real products."
                  delay={30}
                  speed={9}
                  active={introActive}
                />
              </p>
              <svg className="block w-56 h-5 mt-1 ml-1" viewBox="0 0 240 20" fill="none" aria-hidden="true" data-svg-draw>
                <path d="M4 12 C68 6, 162 4, 234 9" stroke={accentPurple} strokeWidth="3.2" strokeLinecap="round" />
                <path d="M26 16 C86 12, 154 11, 200 14" stroke="#c084fc" strokeWidth="1.9" strokeLinecap="round" opacity="0.85" />
              </svg>
            </div>
          </div>
        </aside>
      </div>
      )}

      {/* ─── MOBILE HERO (lg:hidden) — Clean Vertical Stack With Zero Overlap ─── */}
      {!isDesktop && (
      <div className="flex lg:hidden flex-col justify-between w-full flex-1 min-h-0">
        {/* TOP: Identity & Role (Moved lower for comfortable breathing room from TopNav on mobile) */}
        <div className="flex flex-col items-start pointer-events-auto pt-14 xs:pt-18 mt-2 xs:mt-3">
          {/* Hello note */}
          <div className="inline-flex items-center gap-1 -rotate-6 origin-left -mb-1 ml-1">
            <svg className="w-4 h-5" viewBox="0 0 22 24" fill="none" aria-hidden="true" data-svg-draw>
              <path d="M6 7 L12 11 M4 14 L10 15 M9 20 L13 18" stroke={subtleInkStroke} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span
              className="text-lg xs:text-xl font-semibold text-slate-800 dark:text-slate-100 transition-colors duration-500"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              <TypewriterText text="Hello, I'm" delay={10} speed={24} active={introActive} />
            </span>
          </div>

          {/* Name: ALI TOUHEED */}
          <div className="relative">
            <h1
              className="m-0 text-[2.15rem] xs:text-[2.65rem] sm:text-5xl leading-none -rotate-3 origin-left whitespace-nowrap flex items-baseline gap-2"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              <span className="text-slate-950 dark:text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_14px_rgba(255,255,255,0.2)]">
                <TypewriterText text="ALI" delay={30} speed={30} active={introActive} />
              </span>
              <span className="text-violet-600 dark:text-[#a855f7] dark:drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]">
                <TypewriterText
                  text="TOUHEED"
                  delay={100}
                  speed={28}
                  active={introActive}
                  onComplete={() => setNameTyped(true)}
                />
              </span>
            </h1>
            <svg
              className="block w-full max-w-72 xs:max-w-84 h-5 -mt-0.5 ml-1 -rotate-2.5"
              viewBox="0 0 460 28"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
              data-svg-draw
            >
              <path d="M18 16 C130 8, 300 6, 444 13" stroke={accentPurple} strokeWidth="6.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Role subtitle immediately under name on mobile */}
          <div
            className="mt-0.5 ml-1.5 text-base xs:text-lg font-bold text-slate-700 dark:text-slate-300 -rotate-1.5 flex items-center gap-1.5"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            <span>
              <TypewriterText text="Web & App" delay={20} speed={22} active={introActive} />
            </span>
            <span className="text-violet-600 dark:text-[#a855f7] underline decoration-violet-500/50">
              <TypewriterText text="Developer" delay={100} speed={22} active={introActive} />
            </span>
          </div>
        </div>

        {/* CENTER TRANSPARENT ZONE: Leaves 3D Character & Revolving Tech Icons 100% Unobstructed! */}
        <div className="flex-1 min-h-[30vh] xs:min-h-[34vh] pointer-events-none" aria-hidden="true" />

        {/* BOTTOM: Collab Note (Shifted Upwards) + Compact Touch Buttons */}
        <div className="flex flex-col items-center pointer-events-auto w-full pb-3 xs:pb-4 mb-2">
          {renderCollabNote(true)}
          {renderActionButtons(true)}
        </div>
      </div>
      )}

      {/* BOTTOM CENTER SCROLL CUE — Slightly more compact + shorter side inward arrows */}
      <div className="relative flex flex-col items-center pointer-events-auto z-30">
        <span
          className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide select-none mb-1 transition-colors duration-500"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Scroll Down
        </span>

        <div className="relative flex items-center justify-center">
          {/* Left Compact Hand-Drawn Arrow Pointing In */}
          <div className="absolute right-full mr-2.5 flex items-center">
            <svg className="w-11 sm:w-14 h-4" viewBox="0 0 64 18" fill="none" aria-hidden="true">
              <path d="M 4 6 C 22 6, 42 8, 59 10" stroke={inkStroke} strokeWidth="1.7" strokeLinecap="round" opacity="0.88" />
              <path d="M 52 5.5 L 60 10 L 51 14" stroke={inkStroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
            </svg>
          </div>

          {/* Sleek Mouse Capsule with Glowing Purple Scroll Dot */}
          <div className="relative flex flex-col items-center justify-start w-5 h-8 sm:w-5.5 sm:h-9 border-[1.75px] border-slate-800/85 dark:border-white/90 rounded-full bg-white/60 dark:bg-slate-950/50 pt-1 transition-colors duration-500">
            <div className="w-0.5 h-2 bg-slate-800/40 dark:bg-white/45 rounded-full" />
            <motion.div
              animate={{ y: [0, 5, 0], opacity: [0.95, 0.35, 0.95] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-purple-400 mt-0.5 shadow-[0_0_8px_rgba(168,85,247,0.9)]"
            />
          </div>

          {/* Right Compact Hand-Drawn Arrow Pointing In */}
          <div className="absolute left-full ml-2.5 flex items-center">
            <svg className="w-11 sm:w-14 h-4" viewBox="0 0 64 18" fill="none" aria-hidden="true">
              <path d="M 60 6 C 42 6, 22 8, 5 10" stroke={inkStroke} strokeWidth="1.7" strokeLinecap="round" opacity="0.88" />
              <path d="M 12 5.5 L 4 10 L 13 14" stroke={inkStroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.88" />
            </svg>
          </div>
        </div>

        {/* Animated Double Downward Chevrons (vv) */}
        <motion.svg
          animate={{ y: [0, 3.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-4.5 h-4.5 mt-1"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M 6 6 L 12 12 L 18 6" stroke={inkStroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          <path d="M 6 13 L 12 19 L 18 13" stroke={accentPurple} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </div>
    </div>
  );
};
