import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { GENESIS_STORY, PERSONAL_INFO } from '../data/portfolioData';

const CHAPTERS = [
  {
    index: '01',
    place: 'Karachi · Brick & Mortar',
    headline: 'Pitching a neighborhood paint store face-to-face.',
    body: GENESIS_STORY.content[1],
    highlight: 'First Commercial Client',
  },
  {
    index: '02',
    place: 'Tawakkal Paint House',
    headline: 'Turning paper catalogs into searchable contractor ordering.',
    body: GENESIS_STORY.content[2],
    highlight: 'Real Retail Friction Discovered',
  },
  {
    index: '03',
    place: 'Pyntflow Cloud ERP & POS',
    headline: 'Architecting multi-branch billing, tint recipes & CEO visibility.',
    body: GENESIS_STORY.content[3],
    highlight: '60% Faster Counter Checkout',
  },
];

function AnimatedCounter({ target }: { target: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(target);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const match = target.match(/^(\d+)(.*)$/);
    if (!match) return;

    const endNum = parseInt(match[1], 10);
    const suffix = match[2];

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          const start = performance.now();
          const duration = 1100;
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // Smooth cubic-out curve
            const eased = 1 - Math.pow(1 - t, 3);
            const current = Math.round(eased * endNum);
            setDisplay(`${current}${suffix}`);
            if (t < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}

export const GenesisChapter: React.FC<{ onJumpToStudio: () => void }> = ({ onJumpToStudio }) => {
  const [activeChapter, setActiveChapter] = useState(0);

  return (
    <section id="story" className="relative z-10 border-t border-slate-900/10 dark:border-white/10">
      {/* Editorial Asymmetric Split Story + Eased Proof Numbers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          {/* Sticky Editorial Lead (RisenSocial pin cadence) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-violet-700 dark:text-purple-400">
              {GENESIS_STORY.kicker} · {PERSONAL_INFO.location}
            </div>

            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.06] text-slate-950 dark:text-white">
              {GENESIS_STORY.title}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {GENESIS_STORY.content[0]}
            </p>

            <blockquote className="pt-4 border-t border-slate-900/10 dark:border-white/10 text-sm sm:text-base italic text-slate-800 dark:text-slate-200 leading-relaxed">
              &ldquo;{GENESIS_STORY.quote}&rdquo;
            </blockquote>

            <div className="pt-2">
              <button
                type="button"
                onClick={onJumpToStudio}
                className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-purple-300 hover:gap-3 transition-all cursor-pointer"
              >
                <span>Inspect Interactive 3D Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Interactive Scrubber Timeline + Eased Metrics */}
          <div className="lg:col-span-7 space-y-8">
            <div className="rounded-3xl border border-slate-900/10 dark:border-white/10 bg-white/75 dark:bg-[#0D1322]/75 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
              {/* Chapter Tabs */}
              <div className="grid grid-cols-3 gap-2 pb-6 border-b border-slate-900/10 dark:border-white/10">
                {CHAPTERS.map((chap, idx) => {
                  const active = activeChapter === idx;
                  return (
                    <button
                      key={chap.index}
                      type="button"
                      onClick={() => setActiveChapter(idx)}
                      className={`text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-md'
                          : 'bg-transparent border-transparent hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-mono opacity-75">{chap.index}</div>
                      <div className="text-xs sm:text-sm font-semibold mt-0.5 truncate">
                        {chap.place.split('·')[0].trim()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Chapter Narrative */}
              <motion.div
                key={activeChapter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="pt-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>{CHAPTERS[activeChapter].place}</span>
                  <span className="text-violet-700 dark:text-purple-400 font-semibold">
                    {CHAPTERS[activeChapter].highlight}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white leading-snug">
                  {CHAPTERS[activeChapter].headline}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {CHAPTERS[activeChapter].body}
                </p>
              </motion.div>
            </div>

            {/* Clean Typographic Metric Grid (no bordered box spam, editorial rule dividers) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-900/10 dark:border-white/10">
              {PERSONAL_INFO.stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {stat.context}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
