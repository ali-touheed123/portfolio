import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Tilt3DStageProps {
  children: React.ReactNode;
  className?: string;
  showFigmaHandles?: boolean;
}

export const Tilt3DStage: React.FC<Tilt3DStageProps> = ({
  children,
  className = '',
  showFigmaHandles = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 24, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 24, mass: 0.6 });

  const rotateY = useTransform(smoothX, [0, 1], [-6, 6]);
  const rotateX = useTransform(smoothY, [0, 1], [5, -5]);

  const sheenX = useTransform(smoothX, [0, 1], [0, 100]);
  const sheenY = useTransform(smoothY, [0, 1], [0, 100]);
  const specular = useMotionTemplate`radial-gradient(420px circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.14), transparent 65%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className={`group/tilt relative ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full will-change-transform"
      >
        {/* Subtle Figma selection frame corners that appear on hover */}
        {showFigmaHandles && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-[22px] border border-violet-500/0 group-hover/tilt:border-violet-500/45 dark:group-hover/tilt:border-purple-400/45 transition-colors duration-200 z-20"
          >
            <span className="absolute -top-1 -left-1 w-2 h-2 bg-white dark:bg-slate-900 border border-violet-500 dark:border-purple-400 opacity-0 group-hover/tilt:opacity-100 transition-opacity" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-white dark:bg-slate-900 border border-violet-500 dark:border-purple-400 opacity-0 group-hover/tilt:opacity-100 transition-opacity" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white dark:bg-slate-900 border border-violet-500 dark:border-purple-400 opacity-0 group-hover/tilt:opacity-100 transition-opacity" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-white dark:bg-slate-900 border border-violet-500 dark:border-purple-400 opacity-0 group-hover/tilt:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Specular Light Reflection Layer */}
        <motion.div
          aria-hidden="true"
          style={{ background: specular }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-300 z-10"
        />

        {children}
      </motion.div>
    </div>
  );
};
