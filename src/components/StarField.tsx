import React, { useEffect, useRef } from 'react';
import { useSkyTheme } from '../context/ThemeContext';

type StarType = 'sparkle_lg' | 'sparkle_sm' | 'dot_glow' | 'micro_dot';

interface Star {
  x: number;
  y: number;
  currX: number;
  currY: number;
  vx: number;
  vy: number;
  radius: number;
  type: StarType;
  color: string;
  glowColor: string;
  glowBlur: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

const STAR_PALETTE = [
  { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.9)', weight: 45 },
  { color: '#f3e8ff', glow: 'rgba(192, 132, 252, 0.85)', weight: 25 },
  { color: '#e0f2fe', glow: 'rgba(56, 189, 248, 0.85)', weight: 20 },
  { color: '#fef9c3', glow: 'rgba(250, 204, 21, 0.75)', weight: 10 },
];

function pickColor() {
  const r = Math.random() * 100;
  let sum = 0;
  for (const item of STAR_PALETTE) {
    sum += item.weight;
    if (r <= sum) return item;
  }
  return STAR_PALETTE[0];
}

export const StarField: React.FC = () => {
  const { isNight } = useSkyTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    if (!isNight) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const totalStars = 150;
    const generated: Star[] = [];

    for (let i = 0; i < totalStars; i++) {
      const palette = pickColor();
      const roll = Math.random();
      let type: StarType;
      let radius: number;
      let glowBlur: number;

      if (roll < 0.06) {
        type = 'sparkle_lg';
        radius = 8 + Math.random() * 5;
        glowBlur = 12 + Math.random() * 6;
      } else if (roll < 0.16) {
        type = 'sparkle_sm';
        radius = 4 + Math.random() * 3.5;
        glowBlur = 8 + Math.random() * 4;
      } else if (roll < 0.48) {
        type = 'dot_glow';
        radius = 1.8 + Math.random() * 0.9;
        glowBlur = 5 + Math.random() * 2.5;
      } else {
        type = 'micro_dot';
        radius = 0.8 + Math.random() * 0.6;
        glowBlur = 0;
      }

      generated.push({
        x: Math.random(),
        y: Math.random(),
        currX: -1,
        currY: -1,
        vx: 0,
        vy: 0,
        radius,
        type,
        color: palette.color,
        glowColor: palette.glow,
        glowBlur,
        baseAlpha: 0.45 + Math.random() * 0.55,
        twinkleSpeed: 0.01 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
      });
    }

    starsRef.current = generated;

    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      starsRef.current.forEach((s) => {
        if (s.currX === -1) {
          s.currX = s.x * width;
          s.currY = s.y * height;
        }
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const drawSparkleStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.quadraticCurveTo(cx, cy, cx + R, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + R);
      ctx.quadraticCurveTo(cx, cy, cx - R, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - R);
      ctx.closePath();
      ctx.fill();
    };

    const REPEL_RADIUS = 110;
    const MAX_PUSH_FORCE = 3.2;
    const SPRING_FACTOR = 0.055;
    const DAMPING = 0.84;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const stars = starsRef.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const targetX = star.x * width;
        const targetY = star.y * height;

        if (star.currX === -1) {
          star.currX = targetX;
          star.currY = targetY;
        }

        if (mouse.active) {
          const dx = star.currX - mouse.x;
          const dy = star.currY - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < REPEL_RADIUS && dist > 1) {
            const force = (1 - dist / REPEL_RADIUS) * MAX_PUSH_FORCE;
            const angle = Math.atan2(dy, dx);
            star.vx += Math.cos(angle) * force;
            star.vy += Math.sin(angle) * force;
          }
        }

        star.vx += (targetX - star.currX) * SPRING_FACTOR;
        star.vy += (targetY - star.currY) * SPRING_FACTOR;
        star.vx *= DAMPING;
        star.vy *= DAMPING;
        star.currX += star.vx;
        star.currY += star.vy;

        star.phase += star.twinkleSpeed;
        const currentAlpha = star.baseAlpha * (0.65 + 0.35 * Math.sin(star.phase));

        const sx = star.currX;
        const sy = star.currY;

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));

        if (star.type === 'sparkle_lg' || star.type === 'sparkle_sm') {
          ctx.shadowColor = star.glowColor;
          ctx.shadowBlur = star.glowBlur;
          ctx.fillStyle = star.color;
          drawSparkleStar(ctx, sx, sy, star.radius);

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          drawSparkleStar(ctx, sx, sy, star.radius * 0.45);
        } else if (star.type === 'dot_glow') {
          ctx.shadowColor = star.glowColor;
          ctx.shadowBlur = star.glowBlur;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, star.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isNight]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none select-none transition-opacity duration-1000 ${
        isNight ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};
