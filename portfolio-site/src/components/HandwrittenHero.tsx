import React, { useEffect, useRef, useState } from 'react';
import { TypewriterText } from './TypewriterText';

interface HandwrittenHeroProps {
  currentFrame?: number;
}

export const HandwrittenHero: React.FC<HandwrittenHeroProps> = ({ currentFrame = 5 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontsReady, setFontsReady] = useState<boolean>(false);

  // Mantra ("Code. Create. Innovate.") reveals ONLY when animation reaches frame_0028 or beyond!
  const showMantra = currentFrame >= 28;

  // 1. Wait for custom handwriting fonts to fully load into browser cache before rendering text
  // This completely eliminates FOUT (Flash of Unstyled Text) and any font glitch on page load/refresh!
  useEffect(() => {
    let mounted = true;
    if (typeof document !== 'undefined' && 'fonts' in document) {
      Promise.all([
        document.fonts.load("600 24px 'Caveat'"),
        document.fonts.load("400 48px 'Permanent Marker'"),
        document.fonts.ready,
      ])
        .then(() => {
          if (mounted) setFontsReady(true);
        })
        .catch(() => {
          if (mounted) setFontsReady(true);
        });
    } else {
      setFontsReady(true);
    }

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Animate SVG sketch drawing as soon as fonts are verified ready
  useEffect(() => {
    if (!fontsReady) return;
    const root = containerRef.current;
    if (!root) return;

    const svgs = root.querySelectorAll<SVGElement>('[data-svg-draw]');
    svgs.forEach((svg) => {
      const stepEl = svg.closest('[data-ui-delay]') as HTMLElement | null;
      const delayMs = stepEl ? parseFloat(stepEl.dataset.uiDelay || '200') : 200;

      svg.querySelectorAll<SVGGeometryElement>('path, circle, ellipse, rect, polyline, line').forEach((shape, idx) => {
        if (typeof shape.getTotalLength !== 'function') return;
        let length = 0;
        try {
          length = shape.getTotalLength();
        } catch {
          return;
        }
        if (!length || !Number.isFinite(length)) return;

        // Set initial stroke dasharray
        shape.style.strokeDasharray = `${length}`;
        shape.style.strokeDashoffset = `${length}`;
        shape.style.transition = 'none';

        // Staggered draw-on transition
        const timer = setTimeout(() => {
          shape.style.transition = `stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 60}ms`;
          shape.style.strokeDashoffset = '0';
        }, delayMs);

        return () => clearTimeout(timer);
      });
    });
  }, [fontsReady]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-20 flex flex-col justify-between pointer-events-none text-slate-100 select-none p-4 sm:p-8 md:p-12 lg:px-14 lg:py-8 transition-opacity duration-300 ${
        fontsReady ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 3-COLUMN HERO GRID (Left text, Center empty for 3D character, Right Collab) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,1fr)_1fr] items-center gap-6 lg:gap-8 w-full flex-1 min-h-0 pt-4 lg:pt-0">
        
        {/* LEFT COLUMN: Hello note, Name, Role, Bio */}
        <section className="flex flex-col items-start max-w-145 pointer-events-auto">
          
          {/* Hello Note */}
          <div
            className="relative flex flex-col items-start -mb-2 pl-2"
            data-ui-delay="100"
          >
            <div className="inline-flex items-center gap-1 -rotate-8 origin-left">
              <svg className="w-5 h-6" viewBox="0 0 22 24" fill="none" aria-hidden="true" data-svg-draw>
                <path d="M6 7 L12 11 M4 14 L10 15 M9 20 L13 18" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span
                className="text-2xl sm:text-3xl font-semibold text-slate-100"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                <TypewriterText text="Hello, I'm" delay={150} speed={35} active={fontsReady} />
              </span>
              <svg className="w-5 h-6" viewBox="0 0 22 24" fill="none" aria-hidden="true" data-svg-draw>
                <path d="M14 6 L9 12 M16 14 L11 16" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Hand-drawn Arrow pointing to Name */}
            <svg className="w-9 h-11 ml-6 -mt-1" viewBox="0 0 42 54" fill="none" aria-hidden="true" data-svg-draw>
              <path d="M20 4 C10 16, 10 33, 24 46" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M15 44 L25 47 L26 37" stroke="#f8fafc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Hero Name: ALI TOUHEED — Always on one single line side-by-side */}
          <div
            className="relative mb-2 w-full"
            data-ui-delay="250"
          >
            <h1
              className="m-0 text-4xl sm:text-5xl md:text-[3.6rem] lg:text-[4.2rem] xl:text-[4.6rem] leading-none -rotate-3.5 origin-left whitespace-nowrap flex items-baseline gap-2.5 sm:gap-3.5"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              <span className="text-slate-100 drop-shadow-[0_2px_18px_rgba(255,255,255,0.18)]">
                <TypewriterText text="Ali" delay={400} speed={45} active={fontsReady} />
              </span>
              <span className="text-purple-400 drop-shadow-[0_0_26px_rgba(168,85,247,0.6)]">
                <TypewriterText text="Touheed" delay={580} speed={40} active={fontsReady} />
              </span>
            </h1>
            {/* Double Sketch Underline spanning Ali Touheed on the same line */}
            <svg
              className="block w-full max-w-110 h-7 -mt-1 ml-1 -rotate-2.5 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
              viewBox="0 0 440 28"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
              data-svg-draw
            >
              <path d="M8 17 C110 8, 290 6, 430 14" stroke="#a855f7" strokeWidth="5" strokeLinecap="round" />
              <path d="M50 23 C160 16, 310 15, 395 20" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            </svg>
          </div>

          {/* Role Title */}
          <p
            className="my-2.5 text-2xl sm:text-3xl font-bold leading-tight text-slate-100 -rotate-1.5 origin-left"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            <TypewriterText text="Web & App Developer | AI Automation" delay={850} speed={25} active={fontsReady} />
          </p>

          {/* Handwritten Bio Text: Enlarged and clearly readable as requested */}
          <div
            className="relative max-w-[46ch] mb-4"
            data-ui-delay="1100"
          >
            <p
              className="m-0 text-xl sm:text-2xl lg:text-[1.55rem] font-bold leading-relaxed text-slate-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] -rotate-1 origin-left"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              <TypewriterText
                text="I build modern web experiences, automate workflows, and turn ideas into real products."
                delay={1150}
                speed={20}
                active={fontsReady}
              />
            </p>
            {/* Bio Underline Doodle */}
            <svg
              className="block w-64 h-4.5 mt-1 ml-4"
              viewBox="0 0 240 16"
              fill="none"
              aria-hidden="true"
              data-svg-draw
            >
              <path d="M4 10 C68 5, 162 4, 232 9" stroke="#a855f7" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M22 14 C82 10, 152 10, 206 12" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
            </svg>
          </div>
        </section>

        {/* CENTER STAGE: Empty spacer reserved for 3D Floating Character */}
        <div className="min-h-40 lg:min-h-65 pointer-events-none" aria-hidden="true" />

        {/* RIGHT COLUMN: Collab in bottom-right */}
        <aside className="flex flex-col justify-end items-start lg:items-end h-full max-h-115 pointer-events-auto w-full">
          {/* Collab Block: Tilted at -10deg with top-left sparkle burst, "Let's build" directly above "something amazing...", double neon green underline, and smiley */}
          <div
            className="relative flex flex-col items-start self-start lg:self-end text-left -rotate-10 origin-bottom-right mt-auto mb-6 sm:mb-10"
            data-ui-delay="600"
          >
            {/* Top-left burst accent: \ | / */}
            <svg
              className="w-6 h-6 mb-1 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              data-svg-draw
            >
              <path d="M 14 3 L 14 11 M 5 7 L 11 13 M 23 7 L 17 13" stroke="#f8fafc" strokeWidth="2.2" strokeLinecap="round" />
            </svg>

            {/* Handwritten 2-line title: Let's build stacked directly above something amazing... */}
            <div
              className="m-0 text-xl sm:text-2xl lg:text-[1.85rem] font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)] flex flex-col items-start text-left"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              <div className="pl-4 sm:pl-6">
                <TypewriterText text="Let's build" delay={1300} speed={30} active={fontsReady} />
              </div>
              <div>
                <TypewriterText text="something amazing together!" delay={1600} speed={25} active={fontsReady} />
              </div>
            </div>

            {/* Double Neon Green Underline & Smiley Face */}
            <div className="flex items-center gap-2.5 mt-1.5 w-full justify-start">
              <svg
                className="w-48 sm:w-56 h-5 filter drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]"
                viewBox="0 0 240 24"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
                data-svg-draw
              >
                {/* Primary bright green stroke */}
                <path d="M 6 12 C 70 5, 160 4, 234 10" stroke="#4ade80" strokeWidth="3.2" strokeLinecap="round" />
                {/* Secondary cyan/green underline */}
                <path d="M 28 18 C 90 13, 170 12, 218 16" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>

              {/* Hand-drawn cheerful Smiley Face :) */}
              <svg
                className="w-7 h-7 shrink-0 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                viewBox="0 0 34 34"
                fill="none"
                aria-hidden="true"
                data-svg-draw
              >
                <line x1="12" y1="10" x2="12" y2="15" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
                <line x1="22" y1="10" x2="22" y2="15" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M 8 19 C 12 28, 22 28, 26 19" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </aside>
      </div>

      {/* 
        MANTRA BLOCK: ("Code. Create. Innovate.")
        Positioned right beside the character's laptop, with arrow emerging from laptop.
        APPEARS ONLY WHEN frame_0028 IS REACHED (currentFrame >= 28)!
      */}
      <div
        className={`absolute top-[44%] sm:top-[46%] md:top-[48%] left-[50%] ml-10 sm:ml-14 md:ml-20 lg:ml-24 pointer-events-auto transition-all duration-700 ease-out z-20 ${
          showMantra ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative flex flex-col items-start -rotate-2 origin-left">
          {/* Hand-drawn Arrow emerging directly from the character's laptop */}
          <svg
            className="absolute -left-14 sm:-left-18 -top-1 w-14 sm:w-18 h-9 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]"
            viewBox="0 0 75 38"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 4 28 C 24 30, 48 20, 68 10"
              stroke="#f8fafc"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Arrowhead pointing to Code */}
            <path
              d="M 58 9 L 69 9 L 66 18"
              stroke="#f8fafc"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div
            className="flex flex-col text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-none text-slate-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            <span>
              <TypewriterText text="Code." delay={100} speed={40} active={showMantra} />
            </span>
            <span>
              <TypewriterText text="Create." delay={300} speed={40} active={showMantra} />
            </span>
            <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]">
              <TypewriterText text="Innovate." delay={550} speed={35} active={showMantra} />
            </span>
          </div>

          <svg
            className="w-40 sm:w-48 h-6 mt-1 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            viewBox="0 0 165 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 15 C52 7, 114 4, 158 9" stroke="#a855f7" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M22 20 C68 14, 116 12, 148 15" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* 
        BOTTOM CENTER SCROLL CUE:
        Anchored at 100% mathematical center with left: 50% and -translate-x-1/2 on the mouse.
        The mouse body is the exact dead-center reference point, perfectly matching the user's red center line!
      */}
      <div
        className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-30"
      >
        <span
          className="text-xs sm:text-sm font-semibold text-white/95 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)] italic tracking-wider select-none mb-1.5"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Scroll Down
        </span>

        {/* Visual: Mouse is DEAD CENTER, with symmetrical arrows pinned to left and right */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow: Anchored directly to left side of mouse */}
          <div className="absolute right-full mr-2.5 flex items-center">
            <svg
              className="w-10 sm:w-14 h-3.5 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              viewBox="0 0 60 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M 4 2 C 22 4, 40 7, 56 10"
                stroke="#f1f5f9"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M 48 6 L 57 10 L 49 13"
                stroke="#f1f5f9"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Mouse Body: EXACT DEAD-CENTER (Width 20px, Height 32px) */}
          <div className="relative flex flex-col items-center justify-start w-5 h-8 border-[1.6px] border-white/90 rounded-[10px] bg-slate-950/60 shadow-[0_0_10px_rgba(255,255,255,0.3)] p-0.5">
            <div className="w-0.5 h-2.5 bg-white/20 rounded-full flex justify-center mt-0.5">
              <div
                className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-bounce"
                style={{ animationDuration: '1.8s' }}
              />
            </div>
          </div>

          {/* Right Arrow: Anchored directly to right side of mouse (100% IDENTICAL SYMMETRICAL DISTANCE & SIZE) */}
          <div className="absolute left-full ml-2.5 flex items-center">
            <svg
              className="w-10 sm:w-14 h-3.5 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
              viewBox="0 0 60 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M 56 2 C 38 4, 20 7, 4 10"
                stroke="#f1f5f9"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M 12 6 L 3 10 L 11 13"
                stroke="#f1f5f9"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Small Downward Stacked Chevrons directly centered under mouse */}
        <svg
          className="w-3.5 h-4 mt-1 text-white/90 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] animate-pulse"
          viewBox="0 0 16 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 3 3 L 8 8 L 13 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 3 9 L 8 14 L 13 9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
