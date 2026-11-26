import React, { useEffect, useRef } from 'react';
import { useSkyTheme } from '../context/ThemeContext';
import { useHomeVisible } from '../context/VisibilityContext';

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
  paletteIdx: number;
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

function pickPaletteIdx(): number {
  const r = Math.random() * 100;
  let sum = 0;
  for (let i = 0; i < STAR_PALETTE.length; i++) {
    sum += STAR_PALETTE[i].weight;
    if (r <= sum) return i;
  }
  return 0;
}

function drawSparkleStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - R);
  ctx.quadraticCurveTo(cx, cy, cx + R, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + R);
  ctx.quadraticCurveTo(cx, cy, cx - R, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - R);
  ctx.closePath();
  ctx.fill();
}

function createStarSprite(type: StarType, paletteIdx: number): HTMLCanvasElement {
  const palette = STAR_PALETTE[paletteIdx];
  const baseRadius =
    type === 'sparkle_lg' ? 11 : type === 'sparkle_sm' ? 6 : type === 'dot_glow' ? 2.4 : 1.2;
  const blur =
    type === 'sparkle_lg' ? 14 : type === 'sparkle_sm' ? 10 : type === 'dot_glow' ? 6 : 0;
  const pad = blur + 4;
  const size = Math.ceil((baseRadius + pad) * 2);
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (!octx) return off;

  const c = size / 2;
  if (type === 'sparkle_lg' || type === 'sparkle_sm') {
    octx.shadowColor = palette.glow;
    octx.shadowBlur = blur;
    octx.fillStyle = palette.color;
    drawSparkleStar(octx, c, c, baseRadius);
    octx.shadowBlur = 0;
    octx.fillStyle = '#ffffff';
    drawSparkleStar(octx, c, c, baseRadius * 0.45);
  } else if (type === 'dot_glow') {
    octx.shadowColor = palette.glow;
    octx.shadowBlur = blur;
    octx.fillStyle = palette.color;
    octx.beginPath();
    octx.arc(c, c, baseRadius, 0, Math.PI * 2);
    octx.fill();
    octx.shadowBlur = 0;
    octx.fillStyle = '#ffffff';
    octx.beginPath();
    octx.arc(c, c, baseRadius * 0.5, 0, Math.PI * 2);
    octx.fill();
  } else {
    octx.fillStyle = palette.color;
    octx.beginPath();
    octx.arc(c, c, baseRadius, 0, Math.PI * 2);
    octx.fill();
  }
  return off;
}

export const StarField: React.FC = () => {
  const { isNight } = useSkyTheme();
  const homeVisible = useHomeVisible();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    if (!isNight || !homeVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pre-render 16 tiny offscreen sprites once (eliminates ~4,320 shadowBlur calls/sec)
    const types: StarType[] = ['sparkle_lg', 'sparkle_sm', 'dot_glow', 'micro_dot'];
    const sprites: Record<string, HTMLCanvasElement> = {};
    for (const t of types) {
      for (let p = 0; p < STAR_PALETTE.length; p++) {
        sprites[`${t}_${p}`] = createStarSprite(t, p);
      }
    }

    const totalStars = 150;
    const generated: Star[] = [];

    for (let i = 0; i < totalStars; i++) {
      const paletteIdx = pickPaletteIdx();
      const roll = Math.random();
      let type: StarType;
      let radius: number;

      if (roll < 0.06) {
        type = 'sparkle_lg';
        radius = 8 + Math.random() * 5;
      } else if (roll < 0.16) {
        type = 'sparkle_sm';
        radius = 4 + Math.random() * 3.5;
      } else if (roll < 0.48) {
        type = 'dot_glow';
        radius = 1.8 + Math.random() * 0.9;
      } else {
        type = 'micro_dot';
        radius = 0.8 + Math.random() * 0.6;
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
        paletteIdx,
        baseAlpha: 0.45 + Math.random() * 0.55,
        twinkleSpeed: 0.01 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
      });
    }

    starsRef.current = generated;

    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    const REPEL_RADIUS = 110;
    const MAX_PUSH_FORCE = 3.2;
    const SPRING_FACTOR = 0.055;
    const DAMPING = 0.84;

    const render = () => {
      if (document.hidden) {
        animFrameRef.current = null;
        return;
      }
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

        const sprite = sprites[`${star.type}_${star.paletteIdx}`];
        const baseR =
          star.type === 'sparkle_lg' ? 11 : star.type === 'sparkle_sm' ? 6 : star.type === 'dot_glow' ? 2.4 : 1.2;
        const scale = star.radius / baseR;
        const drawSize = sprite.width * scale;

        ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
        ctx.drawImage(sprite, star.currX - drawSize * 0.5, star.currY - drawSize * 0.5, drawSize, drawSize);
      }
      ctx.globalAlpha = 1;

      animFrameRef.current = requestAnimationFrame(render);
    };

    const onVisibilityChange = () => {
      if (!document.hidden && animFrameRef.current === null) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isNight, homeVisible]);

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
