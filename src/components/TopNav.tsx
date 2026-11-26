import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useSkyTheme } from '../context/ThemeContext';

interface TopNavProps {
  onNavigate: (sectionId: string) => void;
  activeSection?: string;
}

const NAV_LINKS = [
  { label: 'Home', id: 'top' },
  { label: 'About', id: 'story' },
  { label: 'Skills', id: 'stack' },
  { label: 'Projects', id: 'work' },
  { label: 'Contact', id: 'contact' },
];

/**
 * Hand-sketched oval loop + corner burst sparks + slanted underline
 * matching the natural ink highlight style.
 */
const HandDrawnHighlight: React.FC<{ isDay: boolean }> = ({ isDay }) => {
  const stroke = isDay ? '#16a34a' : '#39FF14';
  const sparkStroke = isDay ? '#e11d48' : '#FF073A';

  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      viewBox="0 0 132 56"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-3.5 -inset-y-2 w-[calc(100%+28px)] h-[calc(100%+16px)] overflow-visible"
    >
      {/* Top-left spark ticks */}
      <motion.path
        d="M 10 13 L 3 7 M 18 9 L 15 2"
        stroke={sparkStroke}
        strokeWidth="2.1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 0.25, delay: 0.08 }}
      />
      {/* Top-right spark ticks */}
      <motion.path
        d="M 114 9 L 118 2 M 122 14 L 129 8"
        stroke={sparkStroke}
        strokeWidth="2.1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 0.25, delay: 0.12 }}
      />
      {/* Hand-drawn imperfect oval ring around label */}
      <motion.path
        d="M 22 14 C 54 4, 108 6, 117 24 C 124 38, 92 48, 52 47 C 19 46, 8 34, 16 20 C 22 11, 52 8, 88 10"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{
          filter: isDay ? 'none' : 'drop-shadow(0 0 8px rgba(57, 255, 20, 0.72))',
        }}
      />
      {/* Crisp brush underline accent below oval */}
      <motion.path
        d="M 16 52 C 46 49, 86 48, 115 51"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
};

export const TopNav: React.FC<TopNavProps> = ({ onNavigate, activeSection = 'top' }) => {
  const { isDay, toggleTheme } = useSkyTheme();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string>(activeSection);

  useEffect(() => {
    setClickedId(activeSection);
  }, [activeSection]);

  const highlightedId = hoveredId ?? clickedId;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-transparent border-b border-transparent pointer-events-none">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-8 flex items-center justify-center gap-2 sm:gap-4">
        {/* Centered Handwritten Nav Links with | Dividers & Natural Hand-Drawn Loop Highlight */}
        <nav
          aria-label="Primary Navigation"
          onMouseLeave={() => setHoveredId(null)}
          className="pointer-events-auto flex items-center justify-center gap-0.5 xs:gap-1.5 sm:gap-3 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden py-1.5 sm:py-2 px-1.5 sm:px-3"
        >
          {NAV_LINKS.map((item, idx) => {
            const isHighlighted = highlightedId === item.id;
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onFocus={() => setHoveredId(item.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => {
                    setClickedId(item.id);
                    onNavigate(item.id);
                  }}
                  style={{ fontFamily: "'Caveat', cursive" }}
                  className={`relative px-1.5 xs:px-2.5 sm:px-4 py-0.5 text-[1.12rem] xs:text-[1.25rem] sm:text-[1.6rem] font-bold tracking-wide transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer select-none ${
                    isHighlighted
                      ? 'text-slate-950 dark:text-white'
                      : 'text-slate-700/85 dark:text-slate-300/85 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isHighlighted && <HandDrawnHighlight key={item.id} isDay={isDay} />}
                </button>

                {idx < NAV_LINKS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="text-slate-400/70 dark:text-slate-500/75 text-xs sm:text-base font-light select-none"
                  >
                    |
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Subtle Mid-Page Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
          aria-pressed={isDay}
          title={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
          className={`pointer-events-auto inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 ${
            isDay
              ? 'bg-white/90 border-slate-900/12 text-slate-800 shadow-[0_6px_16px_rgba(15,23,42,0.08)] hover:border-emerald-600/50 hover:text-emerald-700 focus-visible:ring-emerald-600'
              : 'bg-[#1A1A1A]/90 border-white/15 text-slate-200 shadow-[0_6px_18px_rgba(0,0,0,0.45)] hover:border-[#39FF14]/60 hover:text-[#39FF14] focus-visible:ring-[#39FF14]'
          }`}
        >
          {isDay ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4 text-[#39FF14]" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
};
