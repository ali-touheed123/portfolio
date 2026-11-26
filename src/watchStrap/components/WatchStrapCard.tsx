import React, { useState } from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';
import { Project } from '../types/project';

export interface PixelStrapGeometry {
  /** Absolute card width in px */
  cardWidthPx: number;
  /** Absolute card height in px */
  cardHeightPx: number;
  /** Absolute stage top anchor in px */
  anchorTopPx: number;
  /** Absolute stage left anchor in px */
  anchorLeftPx: number;
  /** Parent CSS perspective in px */
  perspectivePx: number;
  /** CSS perspective-origin value */
  perspectiveOrigin: string;
  /** Fixed physical gap in px between cards */
  gapPx: number;
  /** Angular arc step per slot derived via inverse sine (radians) */
  stepAngleRad: number;
  /** Cylindrical Z depth radius in px */
  radiusZPx: number;
  /** Forward Z offset for center card in px */
  centerZPx: number;
  /** Subtle horizontal wrist-wrap radius in px */
  radiusXPx: number;
  /** Left-facing watch tilt (rotateY) in degrees */
  yawDeg: number;
  /** Pre-calculated non-overlapping screen Y stops at |d| = 0,1,2,3 */
  screenYStops: [number, number, number, number];
  /** Number of simultaneously visible cards (3 on mobile, 5 on desktop) */
  visibleCardCount: 3 | 5;
}

function piecewiseLerp(value: number, inputs: number[], outputs: number[]): number {
  if (value <= inputs[0]) return outputs[0];
  const last = inputs.length - 1;
  if (value >= inputs[last]) return outputs[last];

  for (let i = 0; i < last; i++) {
    const a = inputs[i];
    const b = inputs[i + 1];
    if (value >= a && value <= b) {
      const t = (value - a) / (b - a);
      return outputs[i] + (outputs[i + 1] - outputs[i]) * t;
    }
  }
  return outputs[last];
}

/**
 * Pure trigonometric 3D arc solver for absolute pixel-based watch-strap positioning.
 * Uses `Math.sin`, `Math.cos`, and `Math.atan2` for uniform curvature (`rotateX`),
 * depth (`z`), and perspective-compensated pixel `y` separation.
 */
export function computeTrigPixelTransform(d: number, g: PixelStrapGeometry) {
  const absD = Math.abs(d);
  const sign = d === 0 ? 0 : d > 0 ? 1 : -1;

  const theta = d * g.stepAngleRad;
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);

  // Trigonometric Z-depth along cylindrical wrist radius
  const z =
    g.radiusZPx * (cosT - 1) +
    g.centerZPx * Math.max(0, 1 - absD);

  // Perspective projection factor P / (P - z)
  const proj = g.perspectivePx / (g.perspectivePx - z);

  // Target visual screen Y interpolated across non-overlapping stops, then inverse-projected to px
  const targetScreenY = piecewiseLerp(absD, [0, 1, 2, 3], g.screenYStops);
  const y = sign * (targetScreenY / proj);

  // Subtle horizontal wrist-wrap arc via (1 - cos θ)
  const x = g.radiusXPx * (1 - cosT);

  // Exact tangent pitch angle via atan2(-sin θ, cos θ) converted to degrees
  const rotateX = (Math.atan2(-sinT, cosT) * 180) / Math.PI;
  const rotateY = g.yawDeg - absD * 0.4;
  const scale = Math.max(0.56, 1 - absD * 0.14);

  return { x, y, z, rotateX, rotateY, scale };
}

/**
 * Depth-aware z-index mapping ensuring the central card is always > 50
 * and outer receding cards descend numerically toward top and bottom edges.
 */
export function computeDepthZIndex(d: number): number {
  const absD = Math.abs(d);
  if (absD < 0.5) {
    return Math.round(100 - absD * 40); // 100 -> 80 (> 50)
  }
  return Math.max(1, Math.round(60 - absD * 22)); // ±1 -> 38, ±2 -> 16, ±3 -> 1
}

interface WatchStrapCardProps {
  project: Project;
  virtualIndex: number;
  isActive: boolean;
  smoothPosition: MotionValue<number>;
  geometry: PixelStrapGeometry;
  isCenterHovered: boolean;
  reducedMotion: boolean;
  entranceDelay: number | null;
  onSelect: () => void;
  onCenterHoverChange: (hovered: boolean) => void;
}

/**
 * Individual floating 3D project card positioned using absolute pixel coordinates
 * and trigonometric watch-strap arc transforms, with a staggered entrance on load.
 */
export const WatchStrapCard: React.FC<WatchStrapCardProps> = ({
  project,
  virtualIndex,
  isActive,
  smoothPosition,
  geometry,
  isCenterHovered,
  reducedMotion,
  entranceDelay,
  onSelect,
  onCenterHoverChange,
}) => {
  const [imageError, setImageError] = useState(false);

  const offset = useTransform(smoothPosition, (pos) => virtualIndex - pos);

  const zIndex = useTransform(offset, (d) => computeDepthZIndex(d));
  const x = useTransform(offset, (d) => computeTrigPixelTransform(d, geometry).x);
  const y = useTransform(offset, (d) => computeTrigPixelTransform(d, geometry).y);
  const z = useTransform(offset, (d) => computeTrigPixelTransform(d, geometry).z);
  const rotateX = useTransform(
    offset,
    (d) => computeTrigPixelTransform(d, geometry).rotateX
  );
  const rotateY = useTransform(
    offset,
    (d) => computeTrigPixelTransform(d, geometry).rotateY
  );
  const scale = useTransform(
    offset,
    (d) => computeTrigPixelTransform(d, geometry).scale
  );

  const isThreeCardMode = geometry.visibleCardCount === 3;
  const fadeStart = isThreeCardMode ? 1.05 : 2.05;
  const fadeEnd = isThreeCardMode ? 1.65 : 2.6;
  const fadeSpan = fadeEnd - fadeStart;

  const opacity = useTransform(offset, (d) => {
    const absD = Math.abs(d);
    if (absD <= fadeStart) return 1;
    if (absD >= fadeEnd) return 0;
    return 1 - (absD - fadeStart) / fadeSpan;
  });

  const dimOpacity = useTransform(offset, (d) => {
    const absD = Math.abs(d);
    const dimStops = isThreeCardMode
      ? [0, 0.44, 0.72, 0.85]
      : [0, 0.36, 0.58, 0.74];
    const base = piecewiseLerp(absD, [0, 1, 2, 3], dimStops);
    if (!isActive && isCenterHovered) {
      return Math.min(0.84, base + 0.18);
    }
    return base;
  });

  const pointerCutoff = isThreeCardMode ? 1.25 : 2.15;
  const pointerEvents = useTransform(offset, (d) =>
    Math.abs(d) > pointerCutoff ? 'none' : 'auto'
  );

  const isOtherWhenCenterHovered = !isActive && isCenterHovered;

  const hoverScaleClass =
    isActive && isCenterHovered && !reducedMotion ? 'scale-[1.035]' : 'scale-100';

  let filterStyle = 'brightness(1) saturate(1)';
  if (isActive) {
    filterStyle = isCenterHovered
      ? 'brightness(1.06) saturate(1.05) contrast(1.02)'
      : 'brightness(1) saturate(1)';
  } else if (isOtherWhenCenterHovered) {
    filterStyle = 'brightness(0.4) saturate(0.25)';
  } else {
    filterStyle = 'brightness(0.64) saturate(0.58)';
  }

  const shouldStagger = entranceDelay !== null && !reducedMotion;

  return (
    <motion.div
      style={{
        top: `${geometry.anchorTopPx}px`,
        left: `${geometry.anchorLeftPx}px`,
        width: `${geometry.cardWidthPx}px`,
        height: `${geometry.cardHeightPx}px`,
        x,
        y,
        z,
        rotateX,
        rotateY,
        scale,
        opacity,
        zIndex,
        pointerEvents,
        clipPath: 'inset(0px round 14px)',
      }}
      className="absolute will-change-transform select-none"
    >
      {/* Staggered entrance animation on initial page load */}
      <motion.div
        initial={shouldStagger ? { opacity: 0, y: 36, scale: 0.94 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          shouldStagger
            ? {
                duration: 0.52,
                delay: entranceDelay,
                ease: [0.16, 1, 0.3, 1],
              }
            : { duration: 0 }
        }
        className="h-full w-full"
      >
        <button
          type="button"
          onClick={onSelect}
          onMouseEnter={() => {
            if (isActive) onCenterHoverChange(true);
          }}
          onMouseLeave={() => {
            if (isActive) onCenterHoverChange(false);
          }}
          onFocus={() => {
            if (isActive) onCenterHoverChange(true);
          }}
          onBlur={() => {
            if (isActive) onCenterHoverChange(false);
          }}
          aria-label={
            isActive
              ? `Open case study for ${project.title}`
              : `Select project ${project.title}`
          }
          className={`group relative block h-full w-full rounded-[14px] overflow-hidden bg-[#09090e] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050507] transition-[transform,filter,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${hoverScaleClass}`}
          style={{
            filter: filterStyle,
            boxShadow: isActive
              ? '0 28px 60px -15px rgba(0, 0, 0, 0.95), 0 8px 24px -8px rgba(0, 0, 0, 0.8)'
              : '0 14px 32px -12px rgba(0, 0, 0, 0.92)',
            border: isActive
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Pure Project Screenshot */}
          {!imageError ? (
            <img
              src={project.image}
              alt={project.imageAlt}
              loading="eager"
              draggable={false}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover object-top bg-[#09090e] pointer-events-none"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-900 via-[#0e0e14] to-zinc-950 p-6">
              <span className="font-display text-base font-semibold text-zinc-300">
                {project.title}
              </span>
            </div>
          )}

          {/* Subtle physical screen bevel & right-edge depth lip */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[14px]"
            style={{
              boxShadow: isActive
                ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.22), inset -2px 0 0 0 rgba(255, 255, 255, 0.12)'
                : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
            }}
            aria-hidden="true"
          />

          {/* Continuous darkening veil for receding cards */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[#050507]"
            style={{ opacity: dimOpacity }}
            aria-hidden="true"
          />
        </button>
      </motion.div>
    </motion.div>
  );
};
