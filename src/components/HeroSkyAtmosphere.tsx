import React, { useEffect, useRef, type RefObject } from 'react';
import { useSkyTheme } from '../context/ThemeContext';
import type { ParallaxState } from '../hooks/useParallax';
import { useIsInViewport } from '../hooks/useIsInViewport';

interface HeroSkyAtmosphereProps {
  parallaxRef?: RefObject<ParallaxState | null>;
}

interface DustParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  radius: number;
  hue: 'violet' | 'cyan' | 'amber';
}

/**
 * Pure procedural WebGL-style atmospheric stage replacing background.webp & background-layer.webp.
 * Renders depth-sorted atmospheric particles and horizon aura synced cleanly with Moon (Night) / Sun (Day).
 */
export const HeroSkyAtmosphere: React.FC<HeroSkyAtmosphereProps> = ({ parallaxRef }) => {
  const { isDay, isNight } = useSkyTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isActive = useIsInViewport(canvasRef, '200px');
  const isActiveRef = useRef<boolean>(true); // Hero starts in-view immediately on page load
  const isDayRef = useRef<boolean>(isDay);
  const animIdRef = useRef<number | null>(null);
  const drawRef = useRef<((time: number) => void) | null>(null);
  const particlesRef = useRef<DustParticle[]>([]);

  useEffect(() => {
    isDayRef.current = isDay;
  }, [isDay]);

  useEffect(() => {
    isActiveRef.current = isActive;
    if (isActive && animIdRef.current === null && drawRef.current) {
      animIdRef.current = window.requestAnimationFrame(drawRef.current);
    }
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const hues: Array<'violet' | 'cyan' | 'amber'> = ['violet', 'cyan', 'amber'];
      const count = width < 768 ? 28 : 48;
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: count }, (_, i) => ({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0.35 + Math.random() * 0.9,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -0.06 - Math.random() * 0.18,
          radius: 1 + Math.random() * 2.2,
          hue: hues[i % hues.length],
        }));
      } else {
        particlesRef.current.forEach((p) => {
          if (p.x > width) p.x = Math.random() * width;
          if (p.y > height) p.y = Math.random() * height;
        });
      }
    };

    const draw = (time: number) => {
      if (!isActiveRef.current) {
        animIdRef.current = null;
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const day = isDayRef.current;
      const p = parallaxRef?.current;
      const px = (p?.x ?? 0) * 26;
      const py = (p?.y ?? 0) * 18;

      // Subtle atmospheric aura centered around hero figure stage
      const cx = width * 0.5 + px * 0.45;
      const cy = height * 0.48 + py * 0.45;
      const auraR = Math.max(width, height) * 0.46;

      const coreGrad = ctx.createRadialGradient(cx, cy, auraR * 0.04, cx, cy, auraR);
      if (day) {
        coreGrad.addColorStop(0, 'rgba(186, 226, 255, 0.36)');
        coreGrad.addColorStop(0.45, 'rgba(22, 163, 74, 0.08)');
        coreGrad.addColorStop(1, 'rgba(238, 245, 252, 0)');
      } else {
        coreGrad.addColorStop(0, 'rgba(57, 255, 20, 0.14)');
        coreGrad.addColorStop(0.45, 'rgba(255, 7, 58, 0.08)');
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle perspective orbital arcs behind subject (lightweight vector polish)
      ctx.save();
      ctx.translate(cx, cy + height * 0.04);
      ctx.rotate(Math.sin(time * 0.00025) * 0.04);
      ctx.strokeStyle = day ? 'rgba(15, 23, 42, 0.045)' : 'rgba(57, 255, 20, 0.08)';
      ctx.lineWidth = 1;
      const ringW = Math.min(width * 0.42, 360);
      const ringH = ringW * 0.34;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringW, ringH, -0.14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = day ? 'rgba(22, 163, 74, 0.06)' : 'rgba(255, 7, 58, 0.075)';
      ctx.beginPath();
      ctx.ellipse(0, 0, ringW * 1.24, ringH * 1.18, 0.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Floating atmospheric motes
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        const sx = p.x + px * p.z;
        const sy = p.y + py * p.z;
        const pulse = 0.45 + 0.35 * Math.sin(time * 0.0018 + i * 1.3);

        let fill = '';
        if (day) {
          fill =
            p.hue === 'amber'
              ? `rgba(225, 29, 72, ${pulse * 0.22})`
              : p.hue === 'violet'
                ? `rgba(22, 163, 74, ${pulse * 0.24})`
                : `rgba(15, 23, 42, ${pulse * 0.18})`;
        } else {
          fill =
            p.hue === 'cyan'
              ? `rgba(57, 255, 20, ${pulse * 0.55})`
              : p.hue === 'amber'
                ? `rgba(255, 7, 58, ${pulse * 0.45})`
                : `rgba(226, 232, 240, ${pulse * 0.42})`;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, p.radius * p.z, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      }

      if (!prefersReduced) {
        animIdRef.current = window.requestAnimationFrame(draw);
      }
    };

    drawRef.current = draw;
    init();
    animIdRef.current = window.requestAnimationFrame(draw);
    window.addEventListener('resize', init);

    return () => {
      drawRef.current = null;
      window.removeEventListener('resize', init);
      if (animIdRef.current !== null) {
        window.cancelAnimationFrame(animIdRef.current);
        animIdRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Night deep cosmic horizon wash */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(57, 255, 20, 0.08) 0%, rgba(15, 23, 42, 0.28) 48%, rgba(0, 0, 0, 0.45) 100%)',
        }}
      />

      {/* Day bright atmospheric radiance */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDay ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle at 82% 18%, rgba(255, 224, 142, 0.52) 0%, rgba(182, 220, 255, 0.36) 36%, rgba(238, 245, 252, 0.94) 100%)',
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />

      {/* Bottom horizon feather so sticky Hero melts smoothly into the Origin Story transition */}
      <div
        className={`absolute inset-x-0 bottom-0 h-32 transition-opacity duration-700 ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)',
        }}
      />
    </div>
  );
};
