import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, X } from 'lucide-react';
import { Project } from '../types/project';
import { TechIcon } from './TechIcon';

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
  reducedMotion: boolean;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  onClose,
  reducedMotion,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/45 dark:bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Surface */}
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{
              duration: reducedMotion ? 0 : 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 flex max-h-[92dvh] sm:max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-900/12 bg-white shadow-2xl dark:border-white/12 dark:bg-[#1A1A1A] transition-colors duration-700"
          >
            {/* Header Bar */}
            <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-900/10 dark:border-white/10 px-4 py-3.5 sm:px-8 sm:py-4">
              <div className="min-w-0">
                <p className="text-xs font-mono tracking-wider text-slate-500 dark:text-zinc-400 uppercase truncate">
                  {project.category} · {project.clientType}
                </p>
                <h2
                  id="case-study-title"
                  className="mt-0.5 font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate"
                >
                  {project.title}
                </h2>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex min-h-10 items-center gap-1.5 rounded-full border border-emerald-600 bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 dark:border-[#39FF14]/80 dark:bg-[#39FF14]/10 dark:text-white dark:hover:bg-[#39FF14] dark:hover:text-black whitespace-nowrap"
                >
                  <span>Visit Live</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close case study"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/12 bg-slate-100 text-slate-600 transition-colors hover:border-rose-600/60 hover:text-rose-600 dark:border-white/10 dark:bg-[#000000]/50 dark:text-zinc-400 dark:hover:border-[#FF073A]/60 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:focus-visible:ring-[#FF073A] cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div
              className="custom-scrollbar flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-4 py-5 sm:px-8 sm:py-7 space-y-6"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Full Screenshot Preview */}
              <div className="overflow-hidden rounded-xl border border-slate-900/10 bg-slate-100 dark:border-white/10 dark:bg-[#000000] aspect-16/10">
                {!imgError ? (
                  <img
                    src={project.image}
                    alt={project.imageAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-8 text-center">
                    <p className="font-display text-xl font-semibold text-slate-700 dark:text-zinc-300">
                      {project.title}
                    </p>
                  </div>
                )}
              </div>

              {/* Meta Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-900/10 dark:border-white/8 py-4">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    Role
                  </span>
                  <span className="mt-1 block text-sm font-medium text-slate-800 dark:text-zinc-200">
                    {project.caseStudy.role}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    Scope
                  </span>
                  <span className="mt-1 block text-sm font-medium text-slate-800 dark:text-zinc-200">
                    {project.caseStudy.timeline}
                  </span>
                </div>
              </div>

              {/* Challenge & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-rose-600 dark:text-[#FF073A]">
                    Challenge
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                    {project.caseStudy.challenge}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-700 dark:text-[#39FF14]">
                    Architecture & Solution
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                    {project.caseStudy.solution}
                  </p>
                </div>
              </div>

              {/* Deliverables & Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Key Deliverables
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {project.caseStudy.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-zinc-300"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-[#39FF14]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Outcome & Stack
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
                    {project.caseStudy.outcome}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <li
                        key={tech.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/10 bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-[#000000]/45 dark:text-zinc-200"
                      >
                        <TechIcon id={tech.id} className="h-3.5 w-3.5" />
                        <span>{tech.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mobile Live URL CTA */}
              <div className="sm:hidden pt-2">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-600 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white dark:border-[#39FF14] dark:bg-[#39FF14] dark:text-black"
                >
                  <span>View Live Project</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
