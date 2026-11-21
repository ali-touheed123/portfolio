import React, { useEffect, useRef } from 'react';
import { useSkyTheme } from '../context/ThemeContext';

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
  layer: number; // 0 = distant horizon, 1 = mid, 2 = foreground soft puff
  offsetY: number;
  currOffsetX: number;
  currOffsetY: number;
}

export const CloudField: React.FC = () => {
  const { isDay } = useSkyTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    if (!isDay) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Seed gentle clouds across the upper sky and lower horizon
    const clouds: Cloud[] = Array.from({ length: 14 }, (_, idx) => {
      const isHorizon = idx >= 7;
      return {
        x: Math.random(),
        y: isHorizon ? 0.62 + Math.random() * 0.34 : 0.08 + Math.random() * 0.42,
        scale: isHorizon ? 0.95 + Math.random() * 0.85 : 0.55 + Math.random() * 0.65,
        speed: (0.000018 + Math.random() * 0.000032) * (idx % 2 === 0 ? 1 : 0.75),
        opacity: isHorizon ? 0.68 + Math.random() * 0.25 : 0.45 + Math.random() * 0.35,
        layer: idx % 3,
        offsetY: 0,
        currOffsetX: 0,
        currOffsetY: 0,
      };
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    const drawCloud = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(s, s);
      ctx.globalAlpha = alpha;

      // Soft atmospheric cloud silhouette built from layered sunlit puffs
      const grad = ctx.createLinearGradient(0, -60, 0, 45);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      grad.addColorStop(0.65, 'rgba(244, 249, 255, 0.92)');
      grad.addColorStop(1, 'rgba(216, 232, 248, 0.72)');

      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(148, 184, 224, 0.28)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;

      ctx.beginPath();
      ctx.arc(-62, 10, 34, 0, Math.PI * 2);
      ctx.arc(-20, -14, 46, 0, Math.PI * 2);
      ctx.arc(32, -8, 40, 0, Math.PI * 2);
      ctx.arc(72, 12, 30, 0, Math.PI * 2);
      ctx.roundRect(-86, 4, 178, 36, 18);
      ctx.fill();
      ctx.restore();
    };

    let rafId = 0;
    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (const c of clouds) {
        c.x += c.speed;
        if (c.x > 1.2) c.x = -0.2;

        const baseX = c.x * width;
        const baseY = c.y * height;

        // Gentle cursor parting breeze
        let targetOX = 0;
        let targetOY = 0;
        if (mouse.active) {
          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 220 && dist > 1) {
            const push = (1 - dist / 220) * 26;
            targetOX = (dx / dist) * push;
            targetOY = (dy / dist) * push * 0.45;
          }
        }

        c.currOffsetX += (targetOX - c.currOffsetX) * 0.06;
        c.currOffsetY += (targetOY - c.currOffsetY) * 0.06;

        drawCloud(ctx, baseX + c.currOffsetX, baseY + c.currOffsetY, c.scale, c.opacity);
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [isDay]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none transition-opacity duration-1000 ${
        isDay ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Soft horizon mist grounding the clouds into the daylight sections below */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#EEF5FC] via-[#EEF5FC]/70 to-transparent" />
    </div>
  );
};
