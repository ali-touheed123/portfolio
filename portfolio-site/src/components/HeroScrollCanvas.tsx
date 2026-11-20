import { useEffect, useRef, useState } from 'react';
import type { ParallaxState } from '../hooks/useParallax';

interface HeroScrollCanvasProps {
  className?: string;
  onAnimationComplete?: (isComplete: boolean) => void;
  onFrameChange?: (frameNum: number) => void;
  parallax?: ParallaxState;
}

// Active frames: frame_0001 and frame_0004 are excluded.
// Sequence starts from frame_0005 through frame_0040 (36 active frames).
const ACTIVE_FRAMES: number[] = Array.from({ length: 36 }, (_, i) => i + 5);
const TOTAL_ACTIVE_FRAMES = ACTIVE_FRAMES.length; // 36 frames
const PX_PER_FRAME = 35; // Sensitivity for smooth scrub

export const HeroScrollCanvas: React.FC<HeroScrollCanvasProps> = ({ 
  className = '',
  onAnimationComplete,
  onFrameChange,
  parallax
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_ACTIVE_FRAMES).fill(null));
  const currentFrameIndexRef = useRef<number>(0); // 0 corresponds to ACTIVE_FRAMES[0] (frame_0005)
  const accumulatedDeltaRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [mountedEntrance, setMountedEntrance] = useState<boolean>(false);

  // Initial mount trigger for entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedEntrance(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Preload only active frames (5 to 40)
  useEffect(() => {
    let mounted = true;

    ACTIVE_FRAMES.forEach((frameNum, idx) => {
      const img = new Image();
      const numStr = frameNum.toString().padStart(4, '0');
      img.src = `/assets/animation/frames/frame_${numStr}.webp`;

      img.onload = () => {
        if (!mounted) return;
        imagesRef.current[idx] = img;
        setLoadedCount((prev) => prev + 1);

        // Draw initial frame (Frame 5) as soon as it's ready
        if (idx === 0 && currentFrameIndexRef.current === 0) {
          drawFrame(0);
        }
      };
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Draw frame with aspect ratio preservation
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pick requested or closest available loaded frame
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

    // Retina DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Contain fit
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = displayWidth / displayHeight;

    let drawW = displayWidth;
    let drawH = displayHeight;
    let drawX = 0;
    let drawY = 0;

    // Character optical center compensation: 
    // In raw frames (375x666), the character's torso/face is centered at x=191.2px (187.5 is 50%).
    // We apply this ~0.98% correction so the character aligns with sub-pixel precision on the exact 50.0% axis.
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
    if (onFrameChange) {
      onFrameChange(frameNum);
    }

    if (onAnimationComplete) {
      onAnimationComplete(frameIndex === TOTAL_ACTIVE_FRAMES - 1);
    }
  };

  // Scroll-lock engine: Hero is locked until Frame 40 (last active frame) completes
  useEffect(() => {
    // 1. Wheel Event Listener (Non-passive to intercept scroll until Frame 40)
    const handleWheel = (e: WheelEvent) => {
      const isAtTop = window.scrollY <= 5;
      const maxIndex = TOTAL_ACTIVE_FRAMES - 1;

      // Scrolling DOWN while animation is NOT complete -> Lock page, advance frames
      if (isAtTop && e.deltaY > 0 && currentFrameIndexRef.current < maxIndex) {
        e.preventDefault();
        accumulatedDeltaRef.current += e.deltaY;

        // Entrance frames (Frame 5 and Frame 6) are clamped to 1 step and given a slightly higher threshold for a gentle, deliberate drop
        const isEntrance = currentFrameIndexRef.current < 2;
        const threshold = isEntrance ? 65 : PX_PER_FRAME;

        if (accumulatedDeltaRef.current >= threshold) {
          accumulatedDeltaRef.current = 0;
          const step = isEntrance ? 1 : Math.max(1, Math.floor(Math.abs(e.deltaY) / PX_PER_FRAME));
          const nextIndex = Math.min(maxIndex, currentFrameIndexRef.current + step);
          drawFrame(nextIndex);
        }
        return;
      }

      // Scrolling UP while at top and frameIndex > 0 -> Lock page, reverse frames
      if (isAtTop && e.deltaY < 0 && currentFrameIndexRef.current > 0) {
        e.preventDefault();
        accumulatedDeltaRef.current += e.deltaY;

        const isEntrance = currentFrameIndexRef.current <= 2;
        const threshold = isEntrance ? 65 : PX_PER_FRAME;

        if (accumulatedDeltaRef.current <= -threshold) {
          accumulatedDeltaRef.current = 0;
          const step = isEntrance ? 1 : Math.max(1, Math.floor(Math.abs(e.deltaY) / PX_PER_FRAME));
          const prevIndex = Math.max(0, currentFrameIndexRef.current - step);
          drawFrame(prevIndex);
        }
        return;
      }
    };

    // 2. Touch Events for Mobile / Tablet gestures
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchY;
      const isAtTop = window.scrollY <= 5;
      const maxIndex = TOTAL_ACTIVE_FRAMES - 1;

      // Swipe UP (scroll down) at top while frameIndex < maxIndex -> Lock page, advance frame
      if (isAtTop && deltaY > 0 && currentFrameIndexRef.current < maxIndex) {
        if (e.cancelable) e.preventDefault();
        accumulatedDeltaRef.current += deltaY;

        const isEntrance = currentFrameIndexRef.current < 2;
        const threshold = isEntrance ? 45 : 20;

        if (accumulatedDeltaRef.current >= threshold) {
          accumulatedDeltaRef.current = 0;
          drawFrame(Math.min(maxIndex, currentFrameIndexRef.current + 1));
        }
        touchStartYRef.current = touchY;
        return;
      }

      // Swipe DOWN (scroll up) at top while frameIndex > 0 -> Lock page, reverse frame
      if (isAtTop && deltaY < 0 && currentFrameIndexRef.current > 0) {
        if (e.cancelable) e.preventDefault();
        accumulatedDeltaRef.current += deltaY;

        const isEntrance = currentFrameIndexRef.current <= 2;
        const threshold = isEntrance ? 45 : 20;

        if (accumulatedDeltaRef.current <= -threshold) {
          accumulatedDeltaRef.current = 0;
          drawFrame(Math.max(0, currentFrameIndexRef.current - 1));
        }
        touchStartYRef.current = touchY;
        return;
      }

      touchStartYRef.current = touchY;
    };

    // 3. Prevent dragging scrollbar down before animation completes
    const handleScroll = () => {
      const maxIndex = TOTAL_ACTIVE_FRAMES - 1;
      if (currentFrameIndexRef.current < maxIndex && window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    };

    // 4. Resize listener
    const handleResize = () => {
      drawFrame(currentFrameIndexRef.current);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [loadedCount]);

  // Point 1: Smooth noticeable top-to-bottom entrance
  // Frame 5 starts from high up (-150px)
  // Frame 6 drops to midway (-75px)
  // Frame 7 settles into natural baseline (0px)
  // Frames 8-40 remain at exact baseline (0px)
  const getDropOffsetY = (): number => {
    if (!mountedEntrance) return -260; // Initial entrance swoop on page load
    const frameNum = ACTIVE_FRAMES[activeFrameIndex];
    if (frameNum === 5) return -150;
    if (frameNum === 6) return -75;
    return 0;
  };

  const currentDropY = getDropOffsetY();
  const isEntranceActive = activeFrameIndex <= 2 || !mountedEntrance;

  // 3D Parallax offset and tilt for the floating character island
  const px = parallax ? parallax.x * 20 : 0;
  const py = parallax ? parallax.y * 16 : 0;
  const rotY = parallax ? parallax.x * 4.5 : 0;
  const rotX = parallax ? -parallax.y * 4.5 : 0;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Canvas container with 3D perspective depth, tilt, and smooth entrance drop */}
      {/* Perfectly centered horizontally and aligns dead center with the scroll cue */}
      <div 
        className="relative w-80 sm:w-100 md:w-115 lg:w-125 max-h-[82vh] aspect-375/666 flex items-center justify-center translate-y-[-6%] lg:translate-y-[-10%] pointer-events-auto will-change-transform"
        style={{
          transform: `perspective(1000px) translate3d(${px}px, ${py + currentDropY}px, 0) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transition: isEntranceActive ? 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        />
      </div>
    </div>
  );
};
