import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../data/projects';
import { Project } from '../types/project';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { AmbientBackdrop } from '../components/AmbientBackdrop';
import { ProjectInfoPanel, MobileWorkTopBar } from '../components/ProjectInfoPanel';
import { StageSize, WatchStrapShowcase } from '../components/WatchStrapShowcase';
import { PixelStrapGeometry } from '../components/WatchStrapCard';
import { CaseStudyModal } from '../components/CaseStudyModal';

const STAGE_PERSPECTIVE_PX = 1150;
const STAGE_PERSPECTIVE_ORIGIN = '47% 50%';
const CARD_GAP_PX = 6;
const CARD_ASPECT_RATIO = 16 / 6.4;

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

/**
 * Solves absolute pixel-based 3D watch-strap geometry using trigonometric
 * arc functions (`Math.asin`, `Math.sin`, `Math.cos`) so all five cards form
 * a uniform, non-overlapping curvature with subtle, balanced tilt on large screens.
 */
export function buildWatchStrapPixelGeometry(
  stage: StageSize,
  isMobile = false
): PixelStrapGeometry {
  if (isMobile) {
    const perspectivePx = 1050;
    const gapPx = 8;
    const maxWidthByStage = Math.floor(stage.widthPx * 0.9);
    const baseCardWidth = Math.max(250, Math.min(390, maxWidthByStage));
    const baseCardHeight = baseCardWidth / (16 / 7.5);

    const wristCylinderRadius = 380;
    const stepChord = baseCardHeight * 0.92 + gapPx;
    const stepAngleRad =
      2 * Math.asin(Math.min(0.42, stepChord / (2 * wristCylinderRadius)));

    const centerZ = 24;
    const radiusZ = 310;
    const yawDeg = -2;
    const yawMargin = 1.02;

    const halfH = baseCardHeight * 0.5;
    const z0 = centerZ;
    const z1 = radiusZ * (Math.cos(stepAngleRad) - 1);
    const z2 = radiusZ * (Math.cos(stepAngleRad * 2) - 1);
    const z3 = radiusZ * (Math.cos(stepAngleRad * 3) - 1);

    const proj0 = perspectivePx / (perspectivePx - z0);
    const proj1 = perspectivePx / (perspectivePx - z1);
    const proj2 = perspectivePx / (perspectivePx - z2);
    const proj3 = perspectivePx / (perspectivePx - z3);

    const sHalf0 = halfH * 1.0 * proj0 * yawMargin;
    const sHalf1 = halfH * 0.82 * Math.cos(stepAngleRad) * proj1 * yawMargin;
    const sHalf2 = halfH * 0.68 * Math.cos(stepAngleRad * 2) * proj2 * yawMargin;
    const sHalf3 = halfH * 0.52 * Math.cos(stepAngleRad * 3) * proj3 * yawMargin;

    const unscaledY1 = sHalf0 + gapPx + sHalf1;
    const unscaledY2 = unscaledY1 + sHalf1 + gapPx + sHalf2;
    const unscaledY3 = unscaledY2 + sHalf2 + gapPx * 1.5 + sHalf3;

    // Fit 3-card vertical watch-strap cleanly inside middle mobile stage
    const totalBaseHeight = (unscaledY1 + sHalf1) * 2;
    const fitScale = Math.min(1, Math.max(0.55, (stage.heightPx - 14) / totalBaseHeight));

    const cardWidthPx = Math.round(baseCardWidth * fitScale);
    const cardHeightPx = Math.round(baseCardHeight * fitScale);

    return {
      cardWidthPx,
      cardHeightPx,
      anchorTopPx: Math.round((stage.heightPx - cardHeightPx) / 2),
      anchorLeftPx: Math.round((stage.widthPx - cardWidthPx) / 2),
      perspectivePx,
      perspectiveOrigin: '49% 50%',
      gapPx: Math.round(gapPx * fitScale),
      stepAngleRad,
      radiusZPx: radiusZ * fitScale,
      centerZPx: centerZ * fitScale,
      radiusXPx: 6 * fitScale,
      yawDeg,
      screenYStops: [
        0,
        unscaledY1 * fitScale,
        unscaledY2 * fitScale,
        unscaledY3 * fitScale,
      ],
      visibleCardCount: 3,
    };
  }

  const isCompact = stage.widthPx < 480;
  const isLargeDesktop = stage.widthPx >= 640;

  // Base card width constrained cleanly to stage width in absolute pixels
  const maxWidthByStage = Math.floor(stage.widthPx * (isCompact ? 0.86 : 0.78));
  const targetWidth = isCompact ? 290 : Math.min(465, maxWidthByStage);
  const baseCardWidth = Math.max(240, targetWidth);
  const baseCardHeight = baseCardWidth / CARD_ASPECT_RATIO;

  const wristCylinderRadius = 460;
  const stepChord = baseCardHeight * 0.9 + CARD_GAP_PX;
  const stepAngleRad = 2 * Math.asin(Math.min(0.38, stepChord / (2 * wristCylinderRadius)));

  const centerZ = 32;
  const radiusZ = 360;
  // Lower horizontal tilt on laptop & large displays for clean, balanced framing
  const yawDeg = isCompact ? -5 : isLargeDesktop ? -4.5 : -5.5;
  const yawMargin = 1.03;

  // Compute trigonometric screen-space heights at |d| = 0, 1, 2, 3
  const halfH = baseCardHeight * 0.5;
  const z0 = centerZ;
  const z1 = radiusZ * (Math.cos(stepAngleRad) - 1);
  const z2 = radiusZ * (Math.cos(stepAngleRad * 2) - 1);
  const z3 = radiusZ * (Math.cos(stepAngleRad * 3) - 1);

  const proj0 = STAGE_PERSPECTIVE_PX / (STAGE_PERSPECTIVE_PX - z0);
  const proj1 = STAGE_PERSPECTIVE_PX / (STAGE_PERSPECTIVE_PX - z1);
  const proj2 = STAGE_PERSPECTIVE_PX / (STAGE_PERSPECTIVE_PX - z2);
  const proj3 = STAGE_PERSPECTIVE_PX / (STAGE_PERSPECTIVE_PX - z3);

  const sHalf0 = halfH * 1.0 * proj0 * yawMargin;
  const sHalf1 = halfH * 0.86 * Math.cos(stepAngleRad) * proj1 * yawMargin;
  const sHalf2 = halfH * 0.72 * Math.cos(stepAngleRad * 2) * proj2 * yawMargin;
  const sHalf3 = halfH * 0.56 * Math.cos(stepAngleRad * 3) * proj3 * yawMargin;

  const unscaledY1 = sHalf0 + CARD_GAP_PX + sHalf1;
  const unscaledY2 = unscaledY1 + sHalf1 + CARD_GAP_PX + sHalf2;
  const unscaledY3 = unscaledY2 + sHalf2 + CARD_GAP_PX * 1.5 + sHalf3;

  // Fit total 5-card arc inside measured pixel stage height without clipping
  const totalBaseHeight = (unscaledY2 + sHalf2) * 2;
  const fitScale = Math.min(1, Math.max(0.55, (stage.heightPx - 24) / totalBaseHeight));

  const cardWidthPx = Math.round(baseCardWidth * fitScale);
  const cardHeightPx = Math.round(baseCardHeight * fitScale);

  // Absolute pixel anchor centering the card inside the stage box
  const anchorTopPx = Math.round((stage.heightPx - cardHeightPx) / 2);
  const anchorLeftPx = Math.round((stage.widthPx - cardWidthPx) / 2);

  return {
    cardWidthPx,
    cardHeightPx,
    anchorTopPx,
    anchorLeftPx,
    perspectivePx: STAGE_PERSPECTIVE_PX,
    perspectiveOrigin: STAGE_PERSPECTIVE_ORIGIN,
    gapPx: Math.round(CARD_GAP_PX * fitScale),
    stepAngleRad,
    radiusZPx: radiusZ * fitScale,
    centerZPx: centerZ * fitScale,
    radiusXPx: (isCompact ? 14 : 22) * fitScale,
    yawDeg,
    screenYStops: [
      0,
      unscaledY1 * fitScale,
      unscaledY2 * fitScale,
      unscaledY3 * fitScale,
    ],
    visibleCardCount: 5,
  };
}

export interface MyWorkPageProps {
  /** Optional custom project array so this standalone page can be reused directly */
  projects?: Project[];
}

/**
 * Standalone "My Work" 3D Watch-Strap Project Showcase Page.
 * Uses absolute pixel-based card positioning with CSS `perspective-origin` and
 * trigonometric arc calculations for uniform, non-overlapping curvature.
 */
export const MyWorkPage: React.FC<MyWorkPageProps> = ({ projects = PROJECTS }) => {
  const reducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [targetStep, setTargetStep] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [caseStudyProject, setCaseStudyProject] = useState<Project | null>(null);

  const continuousStepRef = useRef<number>(0);
  const snapTimeoutRef = useRef<number | null>(null);
  const wheelDeltaAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const commitStep = useCallback((nextStep: number) => {
    if (snapTimeoutRef.current !== null) {
      window.clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
    continuousStepRef.current = nextStep;
    setTargetStep(nextStep);
  }, []);

  const handlePrev = useCallback(() => {
    commitStep(Math.round(continuousStepRef.current) - 1);
  }, [commitStep]);

  const handleNext = useCallback(() => {
    commitStep(Math.round(continuousStepRef.current) + 1);
  }, [commitStep]);

  const buildPixelGeometry = useCallback(
    (stage: StageSize) => buildWatchStrapPixelGeometry(stage, isMobile),
    [isMobile]
  );

  // Continuous scroll-driven watch-strap transition with magnetic detent snap
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (caseStudyProject) return;

      e.preventDefault();

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 32;
      if (e.deltaMode === 2) delta *= 400;

      const clampedDelta = Math.max(-130, Math.min(130, delta));

      if (reducedMotion) {
        wheelDeltaAccumulatorRef.current += clampedDelta;
        if (Math.abs(wheelDeltaAccumulatorRef.current) >= 60) {
          const dir = wheelDeltaAccumulatorRef.current > 0 ? 1 : -1;
          wheelDeltaAccumulatorRef.current = 0;
          commitStep(Math.round(continuousStepRef.current) + dir);
        }
        return;
      }

      const nextContinuous = continuousStepRef.current + clampedDelta / 175;
      continuousStepRef.current = nextContinuous;
      setTargetStep(nextContinuous);

      if (snapTimeoutRef.current !== null) {
        window.clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = window.setTimeout(() => {
        const snapped = Math.round(continuousStepRef.current);
        continuousStepRef.current = snapped;
        setTargetStep(snapped);
        snapTimeoutRef.current = null;
      }, 130);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (snapTimeoutRef.current !== null) {
        window.clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [caseStudyProject, commitStep, reducedMotion]);

  // Keyboard navigation (Up/Down/Left/Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (caseStudyProject) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [caseStudyProject, handleNext, handlePrev]);

  const activeProject = projects[wrapIndex(activeIndex, projects.length)];

  return (
    <main className="relative h-[100dvh] md:h-screen w-full overflow-hidden bg-[#050507] text-zinc-100">
      {/* Ambient Purple Lighting & Minimal Curved Background Lines */}
      <AmbientBackdrop />

      {/* Main Responsive Showcase Container (Single-screen stack on mobile, 2-column grid on desktop) */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col md:grid md:grid-cols-12 md:items-center gap-2 md:gap-6 px-4 pt-3.5 pb-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* MOBILE TOP BAR: Label, Counter, Progress & Stepper */}
        <MobileWorkTopBar
          activeIndex={activeIndex}
          totalProjects={projects.length}
          onPrev={handlePrev}
          onNext={handleNext}
          reducedMotion={reducedMotion}
        />

        {/* LEFT COLUMN (Desktop) / BOTTOM DOCK (Mobile): Active Project Details */}
        <section
          aria-label="Active project details"
          className="order-2 md:order-1 shrink-0 md:col-span-6 lg:col-span-5 flex items-center"
        >
          <ProjectInfoPanel
            project={activeProject}
            activeIndex={activeIndex}
            totalProjects={projects.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onOpenCaseStudy={() => setCaseStudyProject(activeProject)}
            reducedMotion={reducedMotion}
          />
        </section>

        {/* RIGHT COLUMN (Desktop) / MIDDLE STAGE (Mobile): Watch-Strap Showcase */}
        <section
          aria-label="Interactive 3D project cards"
          className="order-1 md:order-2 flex-1 min-h-0 md:flex-none md:col-span-6 lg:col-span-7 relative md:h-[88vh] md:max-h-[840px] w-full flex items-center justify-center"
        >
          <WatchStrapShowcase
            projects={projects}
            targetStep={targetStep}
            buildPixelGeometry={buildPixelGeometry}
            onStepChange={commitStep}
            onActiveProjectChange={setActiveIndex}
            onOpenCaseStudy={setCaseStudyProject}
            reducedMotion={reducedMotion}
          />
        </section>
      </div>

      {/* Case Study Drawer / Modal */}
      <CaseStudyModal
        project={caseStudyProject}
        onClose={() => setCaseStudyProject(null)}
        reducedMotion={reducedMotion}
      />
    </main>
  );
};
