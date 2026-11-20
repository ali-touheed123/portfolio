import { useEffect, useRef, useState } from 'react';

// Option 2: Invisible Cursor Wave Surge
// 1. Zero shape or circle attached to the cursor.
// 2. The cursor acts as an invisible exciter:
//    - Moving toward the left edge surges the native Neon Magenta wave along that height.
//    - Moving toward the right edge surges the native Electric Lime wave along that height.
//    - Moving toward the lower-middle surges the horizontal sweeping Cyan/Blue wave.
// 3. Smooth, organic, breathing physics that feels 100% part of the artwork.
export const InteractiveHeroGlow: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [leftIntensity, setLeftIntensity] = useState<number>(0);
  const [rightIntensity, setRightIntensity] = useState<number>(0);
  const [centerIntensity, setCenterIntensity] = useState<number>(0);

  const idleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const width = window.innerWidth;
      const height = window.innerHeight;

      setMousePos({ x: clientX, y: clientY });

      const normX = clientX / width;
      const normY = clientY / height;

      // 1. Left Wave proximity (active in left 45% of screen, max at x=0)
      const leftProx = normX <= 0.45 ? Math.pow((0.45 - normX) / 0.45, 1.2) : 0;

      // 2. Right Wave proximity (active in right 45% of screen, max at x=1.0)
      const rightProx = normX >= 0.55 ? Math.pow((normX - 0.55) / 0.45, 1.2) : 0;

      // 3. Center Wave proximity (active in center 50% horizontally, and lower 60% vertically)
      const distFromCenterX = Math.abs(normX - 0.5) / 0.35;
      const centerHorizFactor = Math.max(0, 1 - distFromCenterX);
      const centerVertFactor = normY >= 0.25 ? Math.min(1, (normY - 0.25) / 0.55) : 0;
      const centerProx = centerHorizFactor * centerVertFactor;

      setLeftIntensity(leftProx);
      setRightIntensity(rightProx);
      setCenterIntensity(centerProx);

      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setLeftIntensity(0);
        setRightIntensity(0);
        setCenterIntensity(0);
      }, 2500);
    };

    const handleMouseLeave = () => {
      setLeftIntensity(0);
      setRightIntensity(0);
      setCenterIntensity(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Base Atmospheric Darkness (Clean, uniform dark veil, no holes or cutouts) */}
      <div className="absolute inset-0 bg-[#070A11]/65" />

      {/* 1. Left Neon Magenta / Purple Wave Surge (Tracks cursor Y along the left wave contour) */}
      <div
        className="absolute left-[-120px] w-[460px] lg:w-[600px] h-[550px] rounded-full blur-[110px] transition-all duration-700 ease-out will-change-transform"
        style={{
          top: `calc(${mousePos.y}px - 275px)`,
          opacity: leftIntensity * 0.9,
          transform: `translateX(${leftIntensity * 80}px) scale(${0.85 + leftIntensity * 0.3})`,
          background: 'radial-gradient(ellipse at 15% 50%, rgba(255, 66, 255, 0.75) 0%, rgba(217, 70, 239, 0.4) 45%, transparent 75%)',
        }}
      />

      {/* 2. Right Electric Lime / Cyan Wave Surge (Tracks cursor Y along the right wave contour) */}
      <div
        className="absolute right-[-120px] w-[460px] lg:w-[600px] h-[550px] rounded-full blur-[110px] transition-all duration-700 ease-out will-change-transform"
        style={{
          top: `calc(${mousePos.y}px - 275px)`,
          opacity: rightIntensity * 0.85,
          transform: `translateX(${-rightIntensity * 80}px) scale(${0.85 + rightIntensity * 0.3})`,
          background: 'radial-gradient(ellipse at 85% 50%, rgba(236, 255, 134, 0.65) 0%, rgba(56, 189, 248, 0.35) 45%, transparent 75%)',
        }}
      />

      {/* 3. Center Sweeping Cyan / Blue Wave Surge (Surges across the horizontal wave curve) */}
      <div
        className="absolute bottom-[-60px] left-[15%] right-[15%] h-[260px] rounded-full blur-[90px] transition-all duration-700 ease-out will-change-transform"
        style={{
          opacity: centerIntensity * 0.75,
          transform: `translateY(${-centerIntensity * 30}px) scaleX(${0.9 + centerIntensity * 0.2})`,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(56, 189, 248, 0.6) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 80%)',
        }}
      />
    </div>
  );
};
