import React, { useEffect, useRef } from 'react';

type StarType = 'sparkle_lg' | 'sparkle_sm' | 'dot_glow' | 'micro_dot';

interface CosmicStar {
  x: number; // percentage 0 to 1
  y: number; // percentage 0 to 1
  currX: number; // current pixel position
  currY: number;
  vx: number; // velocity for elastic spring return
  vy: number;
  radius: number; // Size/radius
  type: StarType;
  color: string;
  glowColor: string;
  glowBlur: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

export const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<CosmicStar[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const clientPosRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Palette: Crisp white core with subtle cosmic glow tints (white, cyan, sky, soft violet)
    const palettes = [
      { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.85)' },
      { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.75)' },
      { color: '#f0fdf4', glow: 'rgba(165, 243, 252, 0.8)' },
      { color: '#fdf4ff', glow: 'rgba(232, 200, 255, 0.75)' },
    ];

    const STAR_COUNT = 210;
    const generated: CosmicStar[] = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      const rand = Math.random();

      let type: StarType = 'micro_dot';
      let radius = 1.0;
      let glowBlur = 0;

      if (rand > 0.89) {
        // ~11% 4-pointed diamond sparkle stars (Image 2 style)
        type = 'sparkle_lg';
        radius = 6.0 + Math.random() * 3.0;
        glowBlur = 6 + Math.random() * 3;
      } else if (rand > 0.76) {
        // ~13% Mini diamond sparkle stars
        type = 'sparkle_sm';
        radius = 3.6 + Math.random() * 2.0;
        glowBlur = 4 + Math.random() * 2.5;
      } else if (rand > 0.52) {
        // ~24% Circular stars with soft halo
        type = 'dot_glow';
        radius = 1.8 + Math.random() * 0.9;
        glowBlur = 5 + Math.random() * 2.5;
      } else {
        // ~52% Micro pinpoint stars
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
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerWidth * 1.49902;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // Initialize pixel positions on first resize
      starsRef.current.forEach((s) => {
        if (s.currX === -1) {
          s.currX = s.x * width;
          s.currY = s.y * height;
        }
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking with document coordinates
    const handleMouseMove = (e: MouseEvent) => {
      clientPosRef.current = { x: e.clientX, y: e.clientY };
      mouseRef.current = {
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
        active: true,
      };
    };

    const handleScroll = () => {
      if (clientPosRef.current.x !== -9999) {
        mouseRef.current = {
          x: clientPosRef.current.x + window.scrollX,
          y: clientPosRef.current.y + window.scrollY,
          active: true,
        };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      clientPosRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    /**
     * Draws the filled 4-pointed curved star (astroid sparkle ✦) as in Image 2.
     */
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

    // Physics parameters for subtle, controlled repulsion
    const REPEL_RADIUS = 110; // Influence circle around cursor (tight, not huge)
    const MAX_PUSH_FORCE = 3.2; // Gentle nudge away
    const SPRING_FACTOR = 0.055; // Elastic return strength
    const DAMPING = 0.84; // Smooth deceleration

    // Render loop
    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerWidth * 1.49902;

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

        // Repulsion physics: stars gently part away from cursor
        if (mouse.active) {
          const dx = star.currX - mouse.x;
          const dy = star.currY - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < REPEL_RADIUS && dist > 1) {
            // Strongest close to cursor, falls off to 0 at edge
            const force = (1 - dist / REPEL_RADIUS) * MAX_PUSH_FORCE;
            const angle = Math.atan2(dy, dx);
            star.vx += Math.cos(angle) * force;
            star.vy += Math.sin(angle) * force;
          }
        }

        // Spring force returning star back to original home spot
        star.vx += (targetX - star.currX) * SPRING_FACTOR;
        star.vy += (targetY - star.currY) * SPRING_FACTOR;

        // Friction / damping
        star.vx *= DAMPING;
        star.vy *= DAMPING;

        // Update position
        star.currX += star.vx;
        star.currY += star.vy;

        // Organic twinkling
        star.phase += star.twinkleSpeed;
        const currentAlpha = star.baseAlpha * (0.65 + 0.35 * Math.sin(star.phase));

        const sx = star.currX;
        const sy = star.currY;

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));

        if (star.type === 'sparkle_lg' || star.type === 'sparkle_sm') {
          // Filled 4-pointed curved diamond star with soft bloom
          ctx.shadowColor = star.glowColor;
          ctx.shadowBlur = star.glowBlur;
          ctx.fillStyle = star.color;
          drawSparkleStar(ctx, sx, sy, star.radius);

          // Extra bright inner core
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          drawSparkleStar(ctx, sx, sy, star.radius * 0.45);
        } else if (star.type === 'dot_glow') {
          // Round star with glowing halo
          ctx.shadowColor = star.glowColor;
          ctx.shadowBlur = star.glowBlur;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
          ctx.fill();

          // Bright pinpoint center
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, star.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sharp micro pinpoint dot
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
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-x-0 top-0 pointer-events-none select-none"
      style={{
        zIndex: 0,
        height: 'calc(100vw * 1.49902)',
      }}
    />
  );
};
