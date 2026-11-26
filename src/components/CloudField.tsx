import React, { useEffect, useRef } from 'react';
import { useSkyTheme } from '../context/ThemeContext';
import { useHomeVisible } from '../context/VisibilityContext';

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

function createCloudSprite(): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = 280;
  off.height = 170;
  const octx = off.getContext('2d');
  if (!octx) return off;

  octx.save();
  octx.translate(140, 85);

  const grad = octx.createLinearGradient(0, -60, 0, 45);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
  grad.addColorStop(0.65, 'rgba(244, 249, 255, 0.92)');
  grad.addColorStop(1, 'rgba(216, 232, 248, 0.72)');

  octx.fillStyle = grad;
  octx.shadowColor = 'rgba(148, 184, 224, 0.28)';
  octx.shadowBlur = 24;
  octx.shadowOffsetY = 10;

  octx.beginPath();
  octx.arc(-62, 10, 34, 0, Math.PI * 2);
  octx.arc(-20, -14, 46, 0, Math.PI * 2);
  octx.arc(32, -8, 40, 0, Math.PI * 2);
  octx.arc(72, 12, 30, 0, Math.PI * 2);
  octx.roundRect(-86, 4, 178, 36, 18);
  octx.fill();
  octx.restore();
  return off;
}

export const CloudField: React.FC = () => {
  const { isDay } = useSkyTheme();
  const homeVisible = useHomeVisible();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    if (!isDay || !homeVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cloudSprite = createCloudSprite();

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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    let rafId = 0;
    const render = () => {
      if (document.hidden) {
        rafId = 0;
        return;
      }
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

        const drawW = cloudSprite.width * c.scale;
        const drawH = cloudSprite.height * c.scale;
        ctx.globalAlpha = c.opacity;
        ctx.drawImage(
          cloudSprite,
          baseX + c.currOffsetX - drawW * 0.5,
          baseY + c.currOffsetY - drawH * 0.5,
          drawW,
          drawH
        );
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(render);
    };

    const onVisibilityChange = () => {
      if (!document.hidden && rafId === 0) {
        rafId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isDay, homeVisible]);

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
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#EEF5FC] via-[#EEF5FC]/70 to-transparent" />
    </div>
  );
};
