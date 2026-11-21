import React, { useEffect, useRef, useState } from 'react';
import { type MotionValue, useMotionValueEvent } from 'motion/react';
import type { ParallaxState } from '../hooks/useParallax';

interface HeroScrollCanvasProps {
  className?: string;
  scrollProgress: MotionValue<number>;
  onAnimationComplete?: (isComplete: boolean) => void;
  onFrameChange?: (frameNum: number) => void;
  parallax?: ParallaxState;
}

const ACTIVE_FRAMES: number[] = Array.from({ length: 36 }, (_, i) => i + 5);
const TOTAL_ACTIVE_FRAMES = ACTIVE_FRAMES.length;

export const HeroScrollCanvas: React.FC<HeroScrollCanvasProps> = ({
  className = '',
  scrollProgress,
  onAnimationComplete,
  onFrameChange,
  parallax,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_ACTIVE_FRAMES).fill(null));
  const currentFrameIndexRef = useRef<number>(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [mountedEntrance, setMountedEntrance] = useState<boolean>(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMountedEntrance(true);
    }, 60);
    return () => window.clearTimeout(timer);
  }, []);

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete) {
      for (let offset = 1; offset < TOTAL_ACTIVE_FRAMES; offset++) {
        if (frameIndex - offset >= 0 && imagesRef.current[frameIndex - offset]?.complete) {
          img = imagesRef.current[frameIndex - offset];
          break;
        }
        if (frameIndex + offset < TOTAL_ACTIVE_FRAMES && imagesRef.current[frameIndex + offset]?.complete) {
          img = imagesRef.current[frameIndex + offset];
          break;
        }
      }
    }
    if (!img || !img.complete) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (!displayWidth || !displayHeight) return;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = displayWidth / displayHeight;
    let drawW = displayWidth;
    let drawH = displayHeight;
    let drawX = 0;
    let drawY = 0;

    const charCenterCompensation = drawW * 0.00984;

    if (canvasAspect > imgAspect) {
      drawH = displayHeight;
      drawW = drawH * imgAspect;
      drawX = (displayWidth - drawW) / 2 - charCenterCompensation;
    } else {
      drawW = displayWidth;
      drawH = drawW / imgAspect;
      drawY = (displayHeight - drawH) / 2;
      drawX = -charCenterCompensation;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    currentFrameIndexRef.current = frameIndex;
    setActiveFrameIndex(frameIndex);

    const frameNum = ACTIVE_FRAMES[frameIndex];
    onFrameChange?.(frameNum);
    onAnimationComplete?.(frameIndex >= TOTAL_ACTIVE_FRAMES - 1);
  };

  // Preload active frames (load initial frame immediately, defer remainder for silky curtain reveal)
  useEffect(() => {
    let mounted = true;

    const loadSingleFrame = (frameNum: number, idx: number) => {
      const img = new Image();
      const numStr = frameNum.toString().padStart(4, '0');
      img.src = `/assets/animation/frames/frame_${numStr}.webp`;
      img.onload = () => {
        if (!mounted) return;
        imagesRef.current[idx] = img;
        if (idx === currentFrameIndexRef.current || (idx === 0 && currentFrameIndexRef.current === 0)) {
          drawFrame(currentFrameIndexRef.current);
        }
      };
    };

    // 1. Immediately load frame 0 so initial canvas is ready
    loadSingleFrame(ACTIVE_FRAMES[0], 0);

    // 2. Defer remaining frames until after initial curtain lift to preserve 60fps GPU smoothness
    const deferTimer = window.setTimeout(() => {
      if (!mounted) return;
      for (let idx = 1; idx < ACTIVE_FRAMES.length; idx++) {
        loadSingleFrame(ACTIVE_FRAMES[idx], idx);
      }
    }, 650);

    const handleResize = () => drawFrame(currentFrameIndexRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      mounted = false;
      window.clearTimeout(deferTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Native smooth scroll-scrubbed frame mapping (0 -> 1 maps cleanly across 36 frames)
  useMotionValueEvent(scrollProgress, 'change', (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    const targetIdx = Math.min(
      TOTAL_ACTIVE_FRAMES - 1,
      Math.round(clamped * (TOTAL_ACTIVE_FRAMES - 1))
    );
    if (targetIdx !== currentFrameIndexRef.current) {
      drawFrame(targetIdx);
    }
  });

  const getDropOffsetY = (): number => {
    if (!mountedEntrance) return -240;
    const frameNum = ACTIVE_FRAMES[activeFrameIndex];
    if (frameNum === 5) return -120;
    if (frameNum === 6) return -55;
    return 0;
  };

  const currentDropY = getDropOffsetY();
  const isEntranceActive = activeFrameIndex <= 2 || !mountedEntrance;

  const progressRatio = activeFrameIndex / (TOTAL_ACTIVE_FRAMES - 1);
  const scaleDepth = 1 + progressRatio * 0.06;

  const px = parallax ? parallax.x * 20 : 0;
  const py = parallax ? parallax.y * 16 : 0;
  const rotY = parallax ? parallax.x * 5 : 0;
  const rotX = parallax ? -parallax.y * 5 : 0;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="relative w-64 sm:w-96 md:w-112 lg:w-124 max-h-[78vh] aspect-375/666 flex items-center justify-center translate-y-[-4%] lg:translate-y-[-8%] pointer-events-auto will-change-transform"
        style={{
          transform: `perspective(1100px) translate3d(${px}px, ${py + currentDropY}px, 0) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scaleDepth})`,
          transition: isEntranceActive ? 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain filter drop-shadow-[0_24px_44px_rgba(0,0,0,0.45)]"
        />
      </div>
    </div>
  );
};
