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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
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
            className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0b0b10] shadow-2xl"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-4 sm:px-8">
              <div className="min-w-0">
                <p className="text-xs font-mono tracking-wider text-zinc-400 uppercase truncate">
                  {project.category} · {project.clientType}
                </p>
                <h2
                  id="case-study-title"
                  className="mt-0.5 font-display text-lg sm:text-xl font-bold text-white truncate"
                >
                  {project.title}
                </h2>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#FF5A1F]/80 bg-[#FF5A1F]/10 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#FF5A1F] whitespace-nowrap"
                >
                  <span>Visit Live</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close case study"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="custom-scrollbar overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-7">
              {/* Full Screenshot Preview */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#050507] aspect-[16/10]">
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
                    <p className="font-display text-xl font-semibold text-zinc-300">
                      {project.title}
                    </p>
                  </div>
                )}
              </div>

              {/* Meta Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-white/[0.08] py-4">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
                    Role
                  </span>
                  <span className="mt-1 block text-sm font-medium text-zinc-200">
                    {project.caseStudy.role}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
                    Scope
                  </span>
                  <span className="mt-1 block text-sm font-medium text-zinc-200">
                    {project.caseStudy.timeline}
                  </span>
                </div>
              </div>

              {/* Challenge & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#A855F7]">
                    Challenge
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {project.caseStudy.challenge}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#FF5A1F]">
                    Architecture & Solution
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {project.caseStudy.solution}
                  </p>
                </div>
              </div>

              {/* Deliverables & Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Key Deliverables
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {project.caseStudy.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-zinc-300"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A1F]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Outcome & Stack
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    {project.caseStudy.outcome}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <li
                        key={tech.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-200"
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
                  className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#FF5A1F] bg-[#FF5A1F] px-5 py-2.5 text-sm font-medium text-white"
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
