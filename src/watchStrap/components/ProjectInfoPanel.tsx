import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from '../types/project';
import { TechIcon } from './TechIcon';

interface ProjectInfoPanelProps {
  project: Project;
  activeIndex: number;
  totalProjects: number;
  onPrev: () => void;
  onNext: () => void;
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
  reducedMotion: boolean;
}

export const MobileWorkTopBar: React.FC<MobileWorkTopBarProps> = ({
  activeIndex,
  totalProjects,
  onPrev,
  onNext,
  reducedMotion,
}) => {
  const progressRatio = totalProjects > 0 ? (activeIndex + 1) / totalProjects : 1;

  return (
    <header className="flex md:hidden items-center justify-between gap-3 shrink-0 pb-1">
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-base text-white shadow-[0_0_16px_rgba(74,222,128,0.12)]"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80] animate-pulse" />
        My Work
      </div>

      <div className="flex items-center gap-3">
        <div
          className="font-mono text-xs tabular-nums tracking-tight whitespace-nowrap shrink-0"
          aria-live="polite"
          aria-label={`Project ${activeIndex + 1} of ${totalProjects}`}
        >
          <span className="font-semibold text-white">
            {formatCounter(activeIndex + 1)}
          </span>
          <span className="mx-1 text-zinc-600">/</span>
          <span className="text-zinc-500">{formatCounter(totalProjects)}</span>
        </div>

        <div
          className="relative h-[2px] w-14 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={activeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalProjects}
          aria-label="Project showcase progress"
        >
          <motion.div
            className="h-full w-full origin-left rounded-full bg-[#FF5A1F]"
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-zinc-300 transition-colors hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] cursor-pointer"
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next project"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-zinc-300 transition-colors hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] cursor-pointer"
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
  onOpenCaseStudy,
  reducedMotion,
}) => {
  const progressRatio = totalProjects > 0 ? (activeIndex + 1) / totalProjects : 1;

  return (
    <div className="relative z-10 flex flex-col justify-center w-full max-w-xl">
      {/* Section Eyebrow Label (Desktop/Tablet) */}
      <div className="hidden md:flex mb-5 items-center gap-3">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/22 bg-white/5 text-xl text-white shadow-[0_0_20px_rgba(74,222,128,0.15)]"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80] animate-pulse" />
          My Work
        </span>
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
          {/* MOBILE BOTTOM INFO DOCK */}
          <div className="md:hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/85 backdrop-blur-md px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="font-display text-[1.375rem] sm:text-[1.6rem] font-bold tracking-tight text-white leading-[1.12] truncate">
                <span>{project.titleLead}</span>
                <span className="text-[#FF5A1F]">{project.titleAccent}</span>
              </h1>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400 truncate">
              <span className="text-zinc-300 font-medium">{project.category}</span>
              <span className="text-zinc-600" aria-hidden="true">
                ·
              </span>
              <span className="truncate">{project.clientType}</span>
            </div>

            <p className="mt-2 text-[13px] leading-snug text-zinc-400 line-clamp-2">
              {project.description}
            </p>

            <ul
              className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
              aria-label="Technologies used"
            >
              {project.techStack.map((tech) => (
                <li
                  key={tech.id}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/[0.09] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-200 whitespace-nowrap"
                >
                  <TechIcon id={tech.id} className="h-3 w-3 shrink-0" />
                  <span>{tech.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-3">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex flex-1 min-h-[40px] items-center justify-center gap-2 rounded-full border border-[#FF5A1F]/85 bg-[#FF5A1F]/[0.1] px-4 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-[#FF5A1F] hover:border-[#FF5A1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] whitespace-nowrap"
              >
                <span>View Live Project</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onOpenCaseStudy}
                className="group inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] cursor-pointer whitespace-nowrap"
              >
                <span>Case Study</span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#FF5A1F]"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* DESKTOP / TABLET FULL PANEL */}
          <div className="hidden md:block">
            {/* Project Title */}
            <h1
              className="font-display font-bold tracking-tight text-white leading-[1.06] text-balance"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
            >
              <span>{project.titleLead}</span>
              <span className="text-[#FF5A1F]">{project.titleAccent}</span>
            </h1>

            {/* Category & Client Type Subtitle */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-zinc-400">
              <span className="text-zinc-300 font-medium">{project.category}</span>
              <span className="text-zinc-600" aria-hidden="true">
                ·
              </span>
              <span>{project.clientType}</span>
            </div>

            {/* Description */}
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-zinc-400">
              {project.description}
            </p>

            {/* Minimal Hairline Divider */}
            <div className="my-6 h-px w-12 bg-white/15" aria-hidden="true" />

            {/* Technology Stack */}
            <ul
              className="flex flex-wrap items-center gap-2.5"
              aria-label="Technologies used"
            >
              {project.techStack.map((tech) => (
                <li
                  key={tech.id}
                  className="inline-flex items-center gap-2 rounded-md border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-200 whitespace-nowrap"
                >
                  <TechIcon id={tech.id} className="h-3.5 w-3.5 shrink-0" />
                  <span>{tech.label}</span>
                </li>
              ))}
            </ul>

            {/* Action Row */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[44px] items-center gap-3 rounded-full border border-[#FF5A1F]/80 bg-[#FF5A1F]/[0.06] px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#FF5A1F] hover:border-[#FF5A1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050507] whitespace-nowrap shrink-0"
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
                className="group inline-flex min-h-[44px] items-center gap-2.5 border-b border-white/35 pb-1 text-sm font-medium text-zinc-200 transition-colors duration-200 hover:border-[#FF5A1F] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-4 focus-visible:ring-offset-[#050507] cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Case Study</span>
                <ArrowRight
                  className="h-4 w-4 text-zinc-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#FF5A1F]"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Counter, Progress Indicator & Stepper (Desktop/Tablet) */}
      <div className="hidden md:flex mt-11 items-center gap-5">
        <div
          className="font-mono text-sm tabular-nums tracking-tight whitespace-nowrap shrink-0"
          aria-live="polite"
          aria-label={`Project ${activeIndex + 1} of ${totalProjects}`}
        >
          <span className="font-semibold text-white">
            {formatCounter(activeIndex + 1)}
          </span>
          <span className="mx-1.5 text-zinc-600">/</span>
          <span className="text-zinc-500">{formatCounter(totalProjects)}</span>
        </div>

        {/* Compositor-only Animated Progress Indicator */}
        <div
          className="relative h-[2px] w-36 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={activeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalProjects}
          aria-label="Project showcase progress"
        >
          <motion.div
            className="h-full w-full origin-left rounded-full bg-[#FF5A1F]"
            initial={false}
            animate={{ scaleX: progressRatio }}
            transition={{
              duration: reducedMotion ? 0 : 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        {/* Accessible Stepper Controls */}
        <div className="flex items-center gap-1.5 ml-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous project"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] cursor-pointer"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next project"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] cursor-pointer"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
