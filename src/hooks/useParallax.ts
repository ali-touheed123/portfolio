import { useEffect, useRef, useState } from 'react';

export interface ParallaxState {
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
}

// Award-winning smooth parallax hook:
// Uses requestAnimationFrame and linear interpolation (lerp)
// to produce silky, organic physical inertia (damped spring feel).
export function useParallax(): ParallaxState {
  const [smooth, setSmooth] = useState<ParallaxState>({ x: 0, y: 0 });
  const mouseRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const currentRef = useRef<ParallaxState>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Calculate normalized position (-1 to 1, with dead center at 0)
      mouseRef.current = {
        x: (e.clientX / width - 0.5) * 2,
        y: (e.clientY / height - 0.5) * 2,
      };
    };

    const handleMouseLeave = () => {
      // Gently drift back to center when cursor leaves the window
      mouseRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      // 0.055 lerp factor provides heavy, luxurious, fluid inertia
      const dx = mouseRef.current.x - currentRef.current.x;
      const dy = mouseRef.current.y - currentRef.current.y;

      currentRef.current.x += dx * 0.055;
      currentRef.current.y += dy * 0.055;

      setSmooth({
        x: Number(currentRef.current.x.toFixed(4)),
        y: Number(currentRef.current.y.toFixed(4)),
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return smooth;
}
