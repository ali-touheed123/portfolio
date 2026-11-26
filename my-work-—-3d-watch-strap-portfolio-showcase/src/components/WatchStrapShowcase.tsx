import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  PanInfo,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from 'motion/react';
import { Project } from '../types/project';
import { PixelStrapGeometry, WatchStrapCard } from './WatchStrapCard';

export interface StageSize {
  widthPx: number;
  heightPx: number;
}

interface WatchStrapShowcaseProps {
  projects: Project[];
  targetStep: number;
  buildPixelGeometry: (stage: StageSize) => PixelStrapGeometry;
  onStepChange: (nextStep: number) => void;
  onActiveProjectChange: (projectIndex: number) => void;
  onOpenCaseStudy: (project: Project) => void;
  reducedMotion: boolean;
}

// Ordered back-to-front so DOM paint order matches descending depth z-index
const DOM_ORDERED_SLOT_OFFSETS_5 = [-3, 3, -2, 2, -1, 1, 0];
const DOM_ORDERED_SLOT_OFFSETS_3 = [-2, 2, -1, 1, 0];

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

/**
 * Interactive 5-card 3D watch-strap showcase using absolute pixel positioning
 * and trigonometric arc geometry supplied by MyWorkPage.
 */
export const WatchStrapShowcase: React.FC<WatchStrapShowcaseProps> = ({
  projects,
  targetStep,
  buildPixelGeometry,
  onStepChange,
  onActiveProjectChange,
  onOpenCaseStudy,
  reducedMotion,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rawPosition = useMotionValue<number>(targetStep);
  const smoothPosition = useSpring(rawPosition, {
    stiffness: reducedMotion ? 1000 : 210,
    damping: reducedMotion ? 100 : 28,
    mass: 0.85,
  });

  const [centerSlot, setCenterSlot] = useState<number>(Math.round(targetStep));
  const [isCenterHovered, setIsCenterHovered] = useState<boolean>(false);
  const [initialStaggerDone, setInitialStaggerDone] = useState<boolean>(false);
  const [stageSize, setStageSize] = useState<StageSize>({
    widthPx: 680,
    heightPx: 760,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setInitialStaggerDone(true), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    rawPosition.set(targetStep);
    if (reducedMotion) {
      smoothPosition.jump(targetStep);
    }
    if (Math.abs(targetStep) > 0.05) {
      setInitialStaggerDone(true);
    }
  }, [targetStep, reducedMotion, rawPosition, smoothPosition]);

  useMotionValueEvent(smoothPosition, 'change', (latest) => {
    const nearest = Math.round(latest);
    if (nearest !== centerSlot) {
      setCenterSlot(nearest);
      setIsCenterHovered(false);
      onActiveProjectChange(wrapIndex(nearest, projects.length));
    }
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({
          widthPx: Math.round(rect.width),
          heightPx: Math.round(rect.height),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(
    () => buildPixelGeometry(stageSize),
    [buildPixelGeometry, stageSize]
  );

  // Framer Motion drag gesture state for mobile touch swipe & vertical scrubbing
  const dragStartStepRef = useRef<number>(0);
  const wasDraggedRef = useRef<boolean>(false);
  const dragResetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (dragResetTimerRef.current !== null) {
        window.clearTimeout(dragResetTimerRef.current);
      }
    };
  }, []);

  const getPixelsPerCard = () => (stageSize.widthPx < 520 ? 90 : 125);

  const handleDragStart = () => {
    if (dragResetTimerRef.current !== null) {
      window.clearTimeout(dragResetTimerRef.current);
      dragResetTimerRef.current = null;
    }
    setInitialStaggerDone(true);
    dragStartStepRef.current = rawPosition.get();
    wasDraggedRef.current = false;
  };

  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (Math.abs(info.offset.y) > 8) {
      wasDraggedRef.current = true;
    }
    if (reducedMotion) return;

    const pixelsPerCard = getPixelsPerCard();
    rawPosition.set(dragStartStepRef.current - info.offset.y / pixelsPerCard);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const pixelsPerCard = getPixelsPerCard();
    const baseStep = Math.round(dragStartStepRef.current);
    const hasSignificantSwipe =
      wasDraggedRef.current ||
      Math.abs(info.offset.y) > 8 ||
      Math.abs(info.velocity.y) > 220;

    if (hasSignificantSwipe) {
      wasDraggedRef.current = true;
      const projectedOffsetY = info.offset.y + info.velocity.y * 0.14;
      const clampedDelta = Math.max(
        -2.4,
        Math.min(2.4, -projectedOffsetY / pixelsPerCard)
      );
      let snapped = Math.round(dragStartStepRef.current + clampedDelta);

      // Ensure quick short flicks always advance cleanly in the swipe direction
      if (snapped === baseStep && Math.abs(info.velocity.y) > 260) {
        snapped = baseStep + (info.velocity.y < 0 ? 1 : -1);
      }

      rawPosition.set(snapped);
      onStepChange(snapped);
    } else {
      rawPosition.set(baseStep);
    }

    dragResetTimerRef.current = window.setTimeout(() => {
      wasDraggedRef.current = false;
      dragResetTimerRef.current = null;
    }, 60);
  };

  return (
    <motion.div
      ref={stageRef}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={reducedMotion ? 0 : 0.06}
      dragMomentum={false}
      dragSnapToOrigin
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="relative h-full w-full touch-none select-none overflow-visible cursor-grab active:cursor-grabbing"
      style={{
        perspective: `${geometry.perspectivePx}px`,
        perspectiveOrigin: geometry.perspectiveOrigin,
      }}
      aria-roledescription="carousel"
      aria-label="3D Watch-Strap Project Showcase"
    >
      {/* Subtle ambient glow behind the strap */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[74%] w-[68%] rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(88, 28, 135, 0.24) 0%, rgba(10, 10, 14, 0) 70%)',
        }}
        aria-hidden="true"
      />

      {(geometry.visibleCardCount === 3
        ? DOM_ORDERED_SLOT_OFFSETS_3
        : DOM_ORDERED_SLOT_OFFSETS_5
      ).map((offset) => {
        const virtualIndex = centerSlot + offset;
        const projectIndex = wrapIndex(virtualIndex, projects.length);
        const project = projects[projectIndex];
        const isActive = offset === 0;

        const maxStaggerSlot = geometry.visibleCardCount === 3 ? 1 : 2;
        const isInitialVisibleSlot =
          !initialStaggerDone &&
          virtualIndex >= -maxStaggerSlot &&
          virtualIndex <= maxStaggerSlot;
        const entranceDelay = isInitialVisibleSlot
          ? (virtualIndex + maxStaggerSlot) * 0.08
          : null;

        return (
          <WatchStrapCard
            key={virtualIndex}
            project={project}
            virtualIndex={virtualIndex}
            isActive={isActive}
            smoothPosition={smoothPosition}
            geometry={geometry}
            isCenterHovered={isCenterHovered}
            reducedMotion={reducedMotion}
            entranceDelay={entranceDelay}
            onCenterHoverChange={setIsCenterHovered}
            onSelect={() => {
              if (wasDraggedRef.current) {
                wasDraggedRef.current = false;
                return;
              }
              if (isActive) {
                onOpenCaseStudy(project);
              } else {
                onStepChange(virtualIndex);
              }
            }}
          />
        );
      })}
    </motion.div>
  );
};
