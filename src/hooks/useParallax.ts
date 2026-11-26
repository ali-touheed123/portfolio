import { useEffect, useRef, type RefObject } from 'react';

export interface ParallaxState {
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
}

/**
 * Zero-rerender smooth parallax hook.
 * Stores lerped coordinates in a stable ref and automatically pauses the rAF
 * loop when the cursor settles, waking up only on mouse movement.
 */
export function useParallax(): RefObject<ParallaxState> {
  const mouseRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const currentRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      const dx = mouseRef.current.x - currentRef.current.x;
      const dy = mouseRef.current.y - currentRef.current.y;

      if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) {
        currentRef.current.x = mouseRef.current.x;
        currentRef.current.y = mouseRef.current.y;
        rafRef.current = null;
        return;
      }

      currentRef.current.x += dx * 0.055;
      currentRef.current.y += dy * 0.055;
      rafRef.current = window.requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      mouseRef.current = {
        x: (e.clientX / width - 0.5) * 2,
        y: (e.clientY / height - 0.5) * 2,
      };
      startLoop();
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: 0, y: 0 };
      startLoop();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return currentRef;
}
