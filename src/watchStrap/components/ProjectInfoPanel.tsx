import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react';
import { useSkyTheme } from '../../context/ThemeContext';
import { Project } from '../types/project';
import { TechIcon } from './TechIcon';

interface ProjectInfoPanelProps {
  project: Project;
  activeIndex: number;
  totalProjects: number;
  onPrev: () => void;
  onNext: () => void;
  onBack?: () => void;
  onOpenCaseStudy: () => void;
  reducedMotion: boolean;
}

function formatCounter(num: number): string {
  return String(num).padStart(2, '0');
}

export interface MobileWorkTopBarProps {
  activeIndex: number;
  totalProjects: number;
  onPrev: () => void;
  onNext: () => void;
  onBack?: () => void;
  reducedMotion: boolean;
}

export const MobileWorkTopBar: React.FC<MobileWorkTopBarProps> = ({
  activeIndex,
  totalProjects,
  onPrev,
  onNext,
  onBack,
  reducedMotion,
}) => {
  const { isDay, toggleTheme } = useSkyTheme();
  const progressRatio = totalProjects > 0 ? (activeIndex + 1) / totalProjects : 1;

  return (
    <header className="sticky top-0 z-30 -mx-4 sm:-mx-8 px-4 sm:px-8 py-2.5 flex lg:hidden items-center justify-between gap-2 shrink-0 bg-[#F4F8FD]/90 dark:bg-[#000000]/85 backdrop-blur-md border-b border-slate-900/10 dark:border-white/8 transition-colors duration-700">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            type="button"
            aria-label="Back to portfolio"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-600/40 bg-white px-3 py-1.5 text-[11px] font-mono font-semibold tracking-wider text-slate-800 shadow-2xs hover:border-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-[#39FF14]/40 dark:bg-[#1A1A1A] dark:text-zinc-200 dark:shadow-none dark:hover:border-[#39FF14] dark:hover:bg-[#39FF14] dark:hover:text-black transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-[#39FF14] group-hover:-translate-x-0.5 group-hover:text-white dark:group-hover:text-black transition-all" />
            <span>BACK</span>
          </button>
        )}

        <div
          className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-600/30 bg-white text-sm sm:text-base text-slate-900 shadow-2xs dark:border-[#39FF14]/30 dark:bg-[#1A1A1A] dark:text-white dark:shadow-[0_0_14px_rgba(57,255,20,0.12)]"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_6px_rgba(22,163,74,0.5)] dark:bg-[#39FF14] dark:shadow-[0_0_8px_#39FF14] animate-pulse" />
          <span className="whitespace-nowrap">My Work</span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
          title={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-900/12 bg-white text-amber-500 shadow-2xs hover:border-emerald-600/40 dark:border-white/12 dark:bg-[#1A1A1A] dark:text-[#39FF14] cursor-pointer transition-colors"
        >
          {isDay ? <Moon className="h-3.5 w-3.5 text-slate-700" /> : <Sun className="h-3.5 w-3.5 text-amber-300" />}
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          className="font-mono text-xs tabular-nums tracking-tight whitespace-nowrap shrink-0"
          aria-live="polite"
          aria-label={`Project ${activeIndex + 1} of ${totalProjects}`}
        >
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatCounter(activeIndex + 1)}
          </span>
          <span className="mx-1 text-slate-400 dark:text-zinc-600">/</span>
          <span className="text-slate-500 dark:text-zinc-500">{formatCounter(totalProjects)}</span>
        </div>

        <div
          className="hidden xs:block sm:block relative h-0.5 w-12 sm:w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
          role="progressbar"
          aria-valuenow={activeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalProjects}
          aria-label="Project showcase progress"
        >
          <motion.div
            className="h-full w-full origin-left rounded-full bg-emerald-600 dark:bg-[#39FF14]"
            initial={false}
            animate={{ scaleX: progressRatio }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous project"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-900/12 bg-white text-slate-600 shadow-2xs transition-colors hover:border-emerald-600/50 hover:text-slate-900 dark:border-white/12 dark:bg-[#1A1A1A] dark:text-zinc-300 dark:shadow-none dark:hover:border-[#39FF14]/50 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-[#39FF14] cursor-pointer"
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next project"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-900/12 bg-white text-slate-600 shadow-2xs transition-colors hover:border-rose-600/50 hover:text-slate-900 dark:border-white/12 dark:bg-[#1A1A1A] dark:text-zinc-300 dark:shadow-none dark:hover:border-[#FF073A]/50 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:focus-visible:ring-[#FF073A] cursor-pointer"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

export const ProjectInfoPanel: React.FC<ProjectInfoPanelProps> = ({
  project,
  activeIndex,
  totalProjects,
  onPrev,
  onNext,
  onBack,
  onOpenCaseStudy,
  reducedMotion,
}) => {
  const { isDay, toggleTheme } = useSkyTheme();
  const progressRatio = totalProjects > 0 ? (activeIndex + 1) / totalProjects : 1;

  return (
    <div className="relative z-10 flex flex-col justify-center w-full lg:max-w-xl lg:max-h-[calc(100dvh-2.5rem)] lg:overflow-y-auto custom-scrollbar lg:pr-1">
      {/* Section Header Row (Laptop/Desktop): Back + My Work + Theme toggle */}
      <div className="hidden lg:flex mb-4 items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            type="button"
            aria-label="Back to portfolio"
            className="group inline-flex items-center gap-2 rounded-full border border-emerald-600/40 bg-white px-3.5 py-1.5 text-xs font-mono font-semibold tracking-wider text-slate-800 shadow-sm hover:border-emerald-600 hover:bg-emerald-600 hover:text-white dark:border-[#39FF14]/40 dark:bg-[#1A1A1A] dark:text-zinc-200 dark:shadow-none dark:hover:border-[#39FF14] dark:hover:bg-[#39FF14] dark:hover:text-black transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-[#39FF14] group-hover:-translate-x-0.5 group-hover:text-white dark:group-hover:text-black transition-all" />
            <span>BACK</span>
          </button>
        )}

        <span
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-emerald-600/30 bg-white text-xl text-slate-900 shadow-sm dark:border-[#39FF14]/30 dark:bg-[#1A1A1A] dark:text-white dark:shadow-[0_0_20px_rgba(57,255,20,0.16)] transition-colors duration-700"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(22,163,74,0.5)] dark:bg-[#39FF14] dark:shadow-[0_0_10px_#39FF14] animate-pulse" />
          My Work
        </span>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
          title={isDay ? 'Switch to Night mode' : 'Switch to Day mode'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-900/12 bg-white text-slate-700 shadow-sm hover:border-emerald-600/40 hover:scale-105 dark:border-white/15 dark:bg-[#1A1A1A] dark:text-amber-300 dark:hover:border-[#39FF14]/50 transition-all cursor-pointer"
        >
          {isDay ? <Moon className="h-4 w-4 text-slate-700" /> : <Sun className="h-4 w-4 text-amber-300" />}
        </button>
      </div>

      {/* Animated Project Details */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={project.id}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{
            duration: reducedMotion ? 0 : 0.24,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* MOBILE & TABLET INFO PANEL (< lg) */}
          <div className="lg:hidden rounded-2xl border border-slate-900/10 bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#1A1A1A]/90 dark:shadow-none backdrop-blur-md p-4 sm:p-5 transition-colors duration-700">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
                <span>{project.titleLead}</span>
                <span className="text-emerald-600 dark:text-[#39FF14]">{project.titleAccent}</span>
              </h1>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">{project.category}</span>
              <span className="text-slate-300 dark:text-zinc-600" aria-hidden="true">
                ·
              </span>
              <span>{project.clientType}</span>
            </div>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-zinc-300/90">
              {project.description}
            </p>

            <ul
              className="mt-3 flex flex-wrap items-center gap-1.5"
              aria-label="Technologies used"
            >
              {project.techStack.map((tech) => (
                <li
                  key={tech.id}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-900/10 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:border-white/10 dark:bg-black/45 dark:text-zinc-200 whitespace-nowrap"
                >
                  <TechIcon id={tech.id} className="h-3 w-3 shrink-0" />
                  <span>{tech.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex flex-1 min-w-[160px] min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 dark:border-[#39FF14]/85 dark:bg-[#39FF14]/10 dark:text-white dark:hover:bg-[#39FF14] dark:hover:border-[#39FF14] dark:hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-[#39FF14] whitespace-nowrap"
              >
                <span>View Live Project</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onOpenCaseStudy}
                className="group inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-slate-900/15 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:border-rose-600/60 hover:text-slate-900 dark:border-white/15 dark:bg-[#0d0d0d] dark:text-zinc-200 dark:hover:border-[#FF073A]/60 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:focus-visible:ring-[#FF073A] cursor-pointer whitespace-nowrap"
              >
                <span>Case Study</span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600 dark:text-zinc-400 dark:group-hover:text-[#FF073A]"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* LAPTOP / DESKTOP FULL PANEL (lg+) */}
          <div className="hidden lg:block">
            <h1
              className="font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.06] text-balance transition-colors duration-700"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3.45rem)' }}
            >
              <span>{project.titleLead}</span>
              <span className="text-emerald-600 dark:text-[#39FF14]">{project.titleAccent}</span>
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-500 dark:text-zinc-400">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">{project.category}</span>
              <span className="text-slate-300 dark:text-zinc-600" aria-hidden="true">
                ·
              </span>
              <span>{project.clientType}</span>
            </div>

            <p className="mt-4 max-w-[46ch] text-sm xl:text-base leading-relaxed text-slate-600 dark:text-zinc-400">
              {project.description}
            </p>

            <div className="my-5 h-px w-12 bg-emerald-600/45 dark:bg-[#39FF14]/40" aria-hidden="true" />

            <ul
              className="flex flex-wrap items-center gap-2"
              aria-label="Technologies used"
            >
              {project.techStack.map((tech) => (
                <li
                  key={tech.id}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-900/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs dark:border-white/10 dark:bg-[#1A1A1A] dark:text-zinc-200 dark:shadow-none whitespace-nowrap"
                >
                  <TechIcon id={tech.id} className="h-3.5 w-3.5 shrink-0" />
                  <span>{tech.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-6">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-3 rounded-full border border-emerald-600 bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(22,163,74,0.28)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 dark:border-[#39FF14]/80 dark:bg-[#39FF14]/10 dark:text-white dark:shadow-none dark:hover:bg-[#39FF14] dark:hover:border-[#39FF14] dark:hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-[#39FF14] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F8FD] dark:focus-visible:ring-offset-[#000000] whitespace-nowrap shrink-0"
              >
                <span>View Live Project</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>

              <button
                type="button"
                onClick={onOpenCaseStudy}
                className="group inline-flex min-h-11 items-center gap-2.5 border-b border-slate-400 pb-1 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-rose-600 hover:text-slate-900 dark:border-white/35 dark:text-zinc-200 dark:hover:border-[#FF073A] dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:focus-visible:ring-[#FF073A] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F4F8FD] dark:focus-visible:ring-offset-[#000000] cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Case Study</span>
                <ArrowRight
                  className="h-4 w-4 text-slate-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-rose-600 dark:text-zinc-400 dark:group-hover:text-[#FF073A]"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Counter, Progress Indicator & Stepper (Laptop/Desktop) */}
      <div className="hidden lg:flex mt-8 items-center gap-5">
        <div
          className="font-mono text-sm tabular-nums tracking-tight whitespace-nowrap shrink-0"
          aria-live="polite"
          aria-label={`Project ${activeIndex + 1} of ${totalProjects}`}
        >
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatCounter(activeIndex + 1)}
          </span>
          <span className="mx-1.5 text-slate-400 dark:text-zinc-600">/</span>
          <span className="text-slate-500 dark:text-zinc-500">{formatCounter(totalProjects)}</span>
        </div>

        <div
          className="relative h-0.5 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
          role="progressbar"
          aria-valuenow={activeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalProjects}
          aria-label="Project showcase progress"
        >
          <motion.div
            className="h-full w-full origin-left rounded-full bg-emerald-600 dark:bg-[#39FF14]"
            initial={false}
            animate={{ scaleX: progressRatio }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous project"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/12 bg-white text-slate-600 shadow-sm transition-colors duration-150 hover:border-emerald-600/50 hover:text-emerald-600 dark:border-white/10 dark:bg-[#1A1A1A] dark:text-zinc-400 dark:shadow-none dark:hover:border-[#39FF14]/50 dark:hover:bg-[#1A1A1A] dark:hover:text-[#39FF14] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-[#39FF14] cursor-pointer"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next project"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/12 bg-white text-slate-600 shadow-sm transition-colors duration-150 hover:border-rose-600/50 hover:text-rose-600 dark:border-white/10 dark:bg-[#1A1A1A] dark:text-zinc-400 dark:shadow-none dark:hover:border-[#FF073A]/50 dark:hover:bg-[#1A1A1A] dark:hover:text-[#FF073A] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:focus-visible:ring-[#FF073A] cursor-pointer"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
