import React, { useEffect, useRef } from 'react';
import { useSkyTheme } from '../context/ThemeContext';
import { FEATURED_CAROUSEL_PROJECTS, type ProjectDetail } from '../data/allProjectsData';

const PROJECTS: ProjectDetail[] = FEATURED_CAROUSEL_PROJECTS;

function getCardArtworkSVG(type: string): string {
  const artworks: Record<string, string> = {
    erp: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-erp" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1A1A1A"/>
            <stop offset="55%" stop-color="#0d0d0d"/>
            <stop offset="100%" stop-color="#000000"/>
          </linearGradient>
          <linearGradient id="wave-erp" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#FF073A"/>
            <stop offset="100%" stop-color="#39FF14"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-erp)"/>
        <circle cx="250" cy="85" r="70" fill="#39FF14" opacity="0.14"/>
        <circle cx="65" cy="190" r="85" fill="#FF073A" opacity="0.1"/>
        <rect x="34" y="74" width="252" height="170" rx="16" fill="#1A1A1A" stroke="rgba(57,255,20,0.45)" stroke-width="1.5"/>
        <circle cx="54" cy="94" r="4" fill="#FF073A"/><circle cx="68" cy="94" r="4" fill="#a1a1aa"/><circle cx="82" cy="94" r="4" fill="#39FF14"/>
        <rect x="52" y="114" width="110" height="12" rx="6" fill="rgba(255,255,255,0.14)"/>
        <rect x="52" y="136" width="76" height="8" rx="4" fill="rgba(57,255,20,0.45)"/>
        <path d="M46 216 Q 96 180, 140 192 T 215 148 T 272 126" fill="none" stroke="url(#wave-erp)" stroke-width="4" stroke-linecap="round"/>
        <circle cx="272" cy="126" r="6" fill="#39FF14"/>
        <rect x="52" y="264" width="66" height="32" rx="8" fill="rgba(57,255,20,0.14)" stroke="rgba(57,255,20,0.45)"/>
        <rect x="127" y="264" width="66" height="32" rx="8" fill="rgba(255,7,58,0.14)" stroke="rgba(255,7,58,0.4)"/>
        <rect x="202" y="264" width="66" height="32" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)"/>
      </svg>`,
    paint: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-paint" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1A1A1A"/>
            <stop offset="60%" stop-color="#0d0d0d"/>
            <stop offset="100%" stop-color="#000000"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-paint)"/>
        <circle cx="160" cy="145" r="95" fill="#39FF14" opacity="0.12"/>
        <rect x="55" y="95" width="90" height="145" rx="14" transform="rotate(-12 100 165)" fill="#1A1A1A" stroke="rgba(255,255,255,0.2)"/>
        <rect x="115" y="82" width="90" height="145" rx="14" fill="#39FF14" stroke="rgba(255,255,255,0.35)"/>
        <rect x="175" y="95" width="90" height="145" rx="14" transform="rotate(12 220 165)" fill="#FF073A" stroke="rgba(255,255,255,0.2)"/>
        <rect x="128" y="185" width="64" height="24" rx="6" fill="rgba(0,0,0,0.75)"/>
        <circle cx="62" cy="272" r="14" fill="rgba(57,255,20,0.2)" stroke="#39FF14" stroke-width="1.5"/>
        <line x1="76" y1="272" x2="245" y2="272" stroke="rgba(57,255,20,0.4)" stroke-dasharray="5 5" stroke-width="2"/>
        <circle cx="258" cy="272" r="14" fill="rgba(255,7,58,0.25)" stroke="#FF073A" stroke-width="1.5"/>
      </svg>`,
    workflow: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-wf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1A1A1A"/>
            <stop offset="55%" stop-color="#0d0d0d"/>
            <stop offset="100%" stop-color="#000000"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-wf)"/>
        <circle cx="160" cy="160" r="105" fill="#FF073A" opacity="0.14"/>
        <path d="M85 110 C 160 110, 110 185, 160 185 S 220 250, 235 250" fill="none" stroke="#FF073A" stroke-width="3" stroke-dasharray="6 4"/>
        <path d="M235 115 C 180 115, 195 185, 160 185 S 110 250, 85 250" fill="none" stroke="#39FF14" stroke-width="2.5"/>
        <rect x="44" y="88" width="84" height="44" rx="12" fill="#1A1A1A" stroke="#FF073A" stroke-width="1.8"/>
        <rect x="192" y="92" width="84" height="44" rx="12" fill="#1A1A1A" stroke="#39FF14" stroke-width="1.8"/>
        <circle cx="160" cy="185" r="28" fill="#1A1A1A" stroke="#39FF14" stroke-width="2.2"/>
        <path d="M153 185 L160 174 L160 183 L168 183 L159 196 L159 186 Z" fill="#ffffff"/>
        <rect x="44" y="228" width="84" height="44" rx="12" fill="#1A1A1A" stroke="#39FF14" stroke-width="1.8"/>
        <rect x="192" y="228" width="84" height="44" rx="12" fill="#1A1A1A" stroke="#FF073A" stroke-width="1.8"/>
      </svg>`,
    telemetry: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-tel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1A1A1A"/>
            <stop offset="55%" stop-color="#0d0d0d"/>
            <stop offset="100%" stop-color="#000000"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-tel)"/>
        <circle cx="160" cy="155" r="95" fill="#FF073A" opacity="0.16"/>
        <circle cx="160" cy="155" r="82" fill="none" stroke="rgba(255,7,58,0.28)" stroke-width="1.2"/>
        <circle cx="160" cy="155" r="54" fill="none" stroke="rgba(255,7,58,0.45)" stroke-width="1.4" stroke-dasharray="4 4"/>
        <circle cx="160" cy="155" r="24" fill="rgba(255,7,58,0.25)" stroke="#FF073A" stroke-width="2"/>
        <path d="M35 235 L95 235 L118 195 L142 268 L168 175 L192 250 L215 225 L285 225" fill="none" stroke="#FF073A" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="215" cy="105" r="5" fill="#39FF14"/>
        <circle cx="105" cy="122" r="4" fill="#ffffff"/>
      </svg>`,
    ledger: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-led" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1A1A1A"/>
            <stop offset="55%" stop-color="#0d0d0d"/>
            <stop offset="100%" stop-color="#000000"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-led)"/>
        <circle cx="210" cy="120" r="85" fill="#39FF14" opacity="0.12"/>
        <rect x="52" y="76" width="216" height="190" rx="16" fill="#1A1A1A" stroke="rgba(57,255,20,0.45)" stroke-width="1.6"/>
        <rect x="74" y="100" width="90" height="12" rx="6" fill="#39FF14"/>
        <rect x="74" y="124" width="172" height="1" fill="rgba(255,255,255,0.12)"/>
        <rect x="74" y="142" width="120" height="10" rx="5" fill="rgba(255,255,255,0.18)"/>
        <rect x="210" y="142" width="36" height="10" rx="5" fill="#39FF14"/>
        <rect x="74" y="168" width="105" height="10" rx="5" fill="rgba(255,255,255,0.14)"/>
        <rect x="210" y="168" width="36" height="10" rx="5" fill="#FF073A"/>
        <rect x="74" y="194" width="130" height="10" rx="5" fill="rgba(255,255,255,0.14)"/>
        <rect x="210" y="194" width="36" height="10" rx="5" fill="#39FF14"/>
        <rect x="74" y="226" width="172" height="22" rx="8" fill="rgba(57,255,20,0.16)" stroke="#39FF14"/>
      </svg>`,
    arcade: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1A1A1A"/>
            <stop offset="55%" stop-color="#0d0d0d"/>
            <stop offset="100%" stop-color="#000000"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-arc)"/>
        <circle cx="160" cy="180" r="100" fill="#39FF14" opacity="0.12"/>
        <rect x="42" y="76" width="72" height="28" rx="9" fill="#1A1A1A" stroke="#39FF14" stroke-width="1.8"/>
        <rect x="124" y="76" width="72" height="28" rx="9" fill="#1A1A1A" stroke="#e2e8f0" stroke-width="1.8"/>
        <rect x="206" y="76" width="72" height="28" rx="9" fill="#1A1A1A" stroke="#FF073A" stroke-width="1.8"/>
        <rect x="42" y="114" width="72" height="28" rx="9" fill="#1A1A1A" stroke="#FF073A" stroke-width="1.8"/>
        <rect x="124" y="114" width="72" height="28" rx="9" fill="#1A1A1A" stroke="#39FF14" stroke-width="1.8"/>
        <rect x="206" y="114" width="72" height="28" rx="9" fill="#1A1A1A" stroke="#e2e8f0" stroke-width="1.8"/>
        <circle cx="160" cy="172" r="3" fill="#39FF14" opacity="0.45"/>
        <circle cx="160" cy="192" r="3.5" fill="#39FF14" opacity="0.65"/>
        <circle cx="160" cy="212" r="4" fill="#39FF14" opacity="0.85"/>
        <circle cx="160" cy="236" r="10" fill="#ffffff" stroke="#39FF14" stroke-width="4"/>
        <rect x="108" y="256" width="104" height="18" rx="9" fill="#1A1A1A" stroke="#39FF14" stroke-width="2"/>
      </svg>`,
  };
  return artworks[type] || artworks.erp;
}

export interface ProjectsSectionProps {
  onOpenAllProjects?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onOpenAllProjects }) => {
  const { isDay } = useSkyTheme();
  const isDayRef = useRef<boolean>(isDay);
  isDayRef.current = isDay;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dotsRowRef = useRef<HTMLDivElement>(null);
  const metaStageRef = useRef<HTMLDivElement>(null);
  const metaTitleRef = useRef<HTMLHeadingElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastMsgRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeIndexRef = useRef<number>(2);

  useEffect(() => {
    const total = PROJECTS.length;
    const viewportEl = viewportRef.current;
    const scalerEl = scalerRef.current;
    const stageEl = stageRef.current;
    const dotsRow = dotsRowRef.current;
    const metaStage = metaStageRef.current;
    const metaTitle = metaTitleRef.current;
    const toastEl = toastRef.current;
    const toastMsg = toastMsgRef.current;

    if (!viewportEl || !scalerEl || !stageEl || !dotsRow || !metaStage || !metaTitle || !toastEl || !toastMsg) {
      return;
    }

    stageEl.innerHTML = '';
    dotsRow.innerHTML = '';

    let dragStartX = 0;
    let isDragging = false;
    let didDrag = false;

    function triggerButtonLaunch(btn: HTMLElement, project: ProjectDetail) {
      if (btn.classList.contains('is-launching')) return;

      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);

      const colors = isDayRef.current
        ? [project.accent, '#16A34A', '#E11D48', '#0F172A']
        : [project.accent, '#39FF14', '#FF073A', '#ffffff'];
      const wrap = btn.parentElement;
      if (wrap) {
        for (let i = 0; i < 12; i++) {
          const spark = document.createElement('span');
          spark.className = 'click-spark';
          const angle = (Math.PI * 2 * i) / 12 + (Math.random() * 0.35 - 0.17);
          const distance = 45 + Math.random() * 48;
          spark.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
          spark.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
          spark.style.background = colors[i % colors.length];
          spark.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;
          wrap.appendChild(spark);
          setTimeout(() => spark.remove(), 750);
        }
      }

      btn.classList.add('is-launching');
      const primarySpan = btn.querySelector('.btn-text-primary') as HTMLElement | null;
      const hoverSpan = btn.querySelector('.btn-text-hover') as HTMLElement | null;
      const prevPrimary = primarySpan ? primarySpan.textContent : '';
      const prevHover = hoverSpan ? hoverSpan.textContent : '';
      if (primarySpan) primarySpan.textContent = 'Opening Portal...';
      if (hoverSpan) hoverSpan.textContent = 'Opening Portal...';

      if (toastMsg) toastMsg.innerHTML = `Redirecting to <strong>${project.title}</strong>...`;
      if (toastEl) toastEl.classList.add('show');

      setTimeout(() => {
        window.open(project.url, '_blank', 'noopener,noreferrer');
        btn.classList.remove('is-launching');
        if (primarySpan && prevPrimary) primarySpan.textContent = prevPrimary;
        if (hoverSpan && prevHover) hoverSpan.textContent = prevHover;
      }, 650);

      setTimeout(() => {
        if (toastEl) toastEl.classList.remove('show');
      }, 2800);
    }

    const cardEls = PROJECTS.map((proj, idx) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.style.setProperty('--card-accent', proj.accent);
      card.style.setProperty('--card-accent-glow', proj.glow);

      card.innerHTML = `
        <div class="card-artwork">
          ${
            proj.desktopImg
              ? `
            <picture class="card-mockup-picture">
              ${proj.mobileImg ? `<source media="(max-width: 639px)" srcset="${proj.mobileImg}">` : ''}
              <img src="${proj.desktopImg}" alt="${proj.title}" class="card-mockup-img" loading="lazy" onerror="this.parentElement.style.display='none'" />
            </picture>
          `
              : `<div class="card-fallback-glow" style="background: radial-gradient(circle at 50% 30%, ${proj.accent}33, transparent 70%);"></div>`
          }
        </div>
        <div class="card-content">
          <div class="redirect-btn-wrap">
            <button class="redirect-btn" type="button" data-url="${proj.url}" data-title="${proj.title}">
              <span class="btn-launch-fill"></span>
              <span class="btn-text-viewport">
                <span class="btn-text-primary">Visit Project</span>
                <span class="btn-text-hover">Launch Live App</span>
              </span>
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17L17 7M7 7h10v10"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (didDrag) return;
        if ((e.target as HTMLElement).closest('.redirect-btn')) return;
        if (idx !== activeIndexRef.current) {
          goToIndex(idx);
        }
      });

      const btn = card.querySelector('.redirect-btn') as HTMLElement;
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (idx !== activeIndexRef.current) {
            goToIndex(idx);
            return;
          }
          triggerButtonLaunch(btn, proj);
        });
      }

      stageEl.appendChild(card);
      return card;
    });

    const dotEls = PROJECTS.map((_, idx) => {
      const dot = document.createElement('button');
      dot.className = 'dot-btn';
      dot.setAttribute('aria-label', `Go to project ${idx + 1}`);
      dot.addEventListener('click', () => goToIndex(idx));
      dotsRow.appendChild(dot);
      return dot;
    });

    function fitStageToViewport() {
      if (!scalerEl || !viewportEl) return;
      const winW = window.innerWidth || document.documentElement.clientWidth || 1280;
      if (winW < 640) {
        // On mobile: no scale transform — CSS handles everything
        scalerEl.style.transform = 'none';
        // viewport height controlled by CSS; just ensure scaler height is correct
        scalerEl.style.height = '440px';
        return;
      }
      const availableW = Math.min(winW - 28, 1280);
      const scale = Math.max(0.28, Math.min(1, availableW / 1250));
      scalerEl.style.transform = `scale(${scale})`;
      viewportEl.style.height = `${Math.round(540 * scale)}px`;
    }

    function updateCarousel(animateMeta = true) {
      const activeIdx = activeIndexRef.current;
      const isMobile = window.innerWidth < 640;
      cardEls.forEach((card, i) => {
        let diff = (i - activeIdx + total) % total;
        if (diff > total / 2) diff -= total;

        card.setAttribute('data-pos', String(diff));

        let tx = 0,
          ty = 0,
          ry = 0,
          sc = 1,
          op = 1,
          z = 10,
          pe = 'auto';

        if (isMobile) {
          // Apple Books stacked peekaboo — side cards peek from TOP-CORNERS behind center
          if (diff === 0) {
            tx = 0; ty = 0; ry = 0; sc = 1; op = 1; z = 30;
          } else if (diff === -1) {
            // LEFT card: pushed UP + slightly left + rotated — only its top-left corner shows above center
            tx = -22; ty = -52; ry = -13; sc = 0.87; op = 1; z = 20;
          } else if (diff === 1) {
            // RIGHT card: pushed UP + slightly right + rotated — only its top-right corner shows above center
            tx = 22; ty = -52; ry = 13; sc = 0.87; op = 1; z = 19;
          } else {
            tx = 0; ty = -55; ry = 0; sc = 0.84; op = 0; z = 1; pe = 'none';
          }
        } else {
          if (diff === 0) {
            tx = 0;
            ty = 42;
            ry = 0;
            sc = 1;
            op = 1;
            z = 30;
          } else if (diff === -1) {
            tx = -286;
            ty = -18;
            ry = 22;
            sc = 0.92;
            op = 0.95;
            z = 20;
          } else if (diff === 1) {
            tx = 286;
            ty = -18;
            ry = -22;
            sc = 0.92;
            op = 0.95;
            z = 20;
          } else if (diff === -2) {
            tx = -526;
            ty = -34;
            ry = 25;
            sc = 0.8;
            op = 0.88;
            z = 10;
          } else if (diff === 2) {
            tx = 526;
            ty = -34;
            ry = -25;
            sc = 0.8;
            op = 0.88;
            z = 10;
          } else {
            tx = 0;
            ty = 42;
            ry = 0;
            sc = 0.55;
            op = 0;
            z = 1;
            pe = 'none';
          }
        }

        card.style.transform = `translateX(${tx}px) translateY(${ty}px) rotateY(${ry}deg) scale(${sc})`;
        card.style.opacity = String(op);
        card.style.zIndex = String(z);
        card.style.pointerEvents = pe;
      });

      dotEls.forEach((d, i) => d.classList.toggle('active', i === activeIdx));

      const activeProj = PROJECTS[activeIdx];
      if (metaStage && metaTitle) {
        if (animateMeta) {
          metaStage.classList.add('switching');
          setTimeout(() => {
            metaTitle.textContent = activeProj.title;
            metaStage.classList.remove('switching');
          }, 160);
        } else {
          metaTitle.textContent = activeProj.title;
        }
      }
    }

    function goToIndex(idx: number) {
      activeIndexRef.current = (idx + total) % total;
      updateCarousel(true);
    }

    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const onPrev = () => goToIndex(activeIndexRef.current - 1);
    const onNext = () => goToIndex(activeIndexRef.current + 1);

    if (prevBtn) prevBtn.addEventListener('click', onPrev);
    if (nextBtn) nextBtn.addEventListener('click', onNext);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToIndex(activeIndexRef.current - 1);
      if (e.key === 'ArrowRight') goToIndex(activeIndexRef.current + 1);
    };
    window.addEventListener('keydown', onKeyDown);

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.redirect-btn')) return;
      dragStartX = e.clientX;
      isDragging = true;
      didDrag = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      if (Math.abs(e.clientX - dragStartX) > 15) {
        didDrag = true;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const delta = e.clientX - dragStartX;
      if (delta > 50) goToIndex(activeIndexRef.current - 1);
      else if (delta < -50) goToIndex(activeIndexRef.current + 1);
      setTimeout(() => {
        didDrag = false;
      }, 40);
    };

    const onResize = () => { fitStageToViewport(); updateCarousel(false); };
    viewportEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    fitStageToViewport();
    updateCarousel(false);

    // Particle Stars Canvas
    const canvas = canvasRef.current;
    let animFrameId = 0;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const resizeCanvas = () => {
          canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
          canvas.height = canvas.parentElement?.clientHeight || 800;
        };
        resizeCanvas();

        const count = Math.min(65, Math.floor((canvas.width || 800) / 22));
        const nightPalette = ['#ffffff', '#39FF14', '#FF073A', '#71717a'];
        const dayPalette = ['#334155', '#16A34A', '#E11D48', '#64748B'];
        const stars = Array.from({ length: count }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.6 + 0.5,
          vy: -(Math.random() * 0.22 + 0.06),
          alpha: Math.random() * 0.6 + 0.2,
          colorIdx: Math.floor(Math.random() * nightPalette.length),
        }));

        let isCanvasVisible = true;
        const animateStars = () => {
          if (!isCanvasVisible || document.hidden) {
            animFrameId = 0;
            return;
          }
          const activePalette = isDayRef.current ? dayPalette : nightPalette;
          const alphaFactor = isDayRef.current ? 0.52 : 1;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (const s of stars) {
            s.y += s.vy;
            if (s.y < -5) {
              s.y = canvas.height + 5;
              s.x = Math.random() * canvas.width;
            }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = activePalette[s.colorIdx];
            ctx.globalAlpha = s.alpha * alphaFactor;
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          animFrameId = requestAnimationFrame(animateStars);
        };

        const observer = typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(([entry]) => {
              isCanvasVisible = entry.isIntersecting;
              if (isCanvasVisible && !document.hidden && animFrameId === 0) {
                animateStars();
              }
            }, { rootMargin: '200px' })
          : null;
        observer?.observe(canvas);

        const onVis = () => {
          if (!document.hidden && isCanvasVisible && animFrameId === 0) {
            animateStars();
          }
        };
        document.addEventListener('visibilitychange', onVis);
        animateStars();

        // Store cleanup on canvas element for return
        (canvas as HTMLCanvasElement & { _cleanupObs?: () => void })._cleanupObs = () => {
          observer?.disconnect();
          document.removeEventListener('visibilitychange', onVis);
        };
      }
    }

    return () => {
      if (prevBtn) prevBtn.removeEventListener('click', onPrev);
      if (nextBtn) nextBtn.removeEventListener('click', onNext);
      window.removeEventListener('keydown', onKeyDown);
      viewportEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      (canvas as (HTMLCanvasElement & { _cleanupObs?: () => void }) | null)?._cleanupObs?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="projects-section-container"
      data-theme={isDay ? 'day' : 'night'}
      className="relative w-full overflow-hidden transition-colors duration-700"
      style={{
        backgroundColor: isDay ? '#F4F8FD' : '#000000',
        color: isDay ? '#0F172A' : '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        #projects-section-container {
          --bg-deep: #000000;
          --bg-card: #1A1A1A;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --purple: #FF073A;
          --purple-glow: rgba(255, 7, 58, 0.45);
          --cyan: #39FF14;
          --cyan-glow: rgba(57, 255, 20, 0.4);
          --green: #39FF14;
          --coral: #FF073A;
        }

        #projects-section-container .cosmic-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 22% 25%, rgba(255, 7, 58, 0.1), transparent 44%),
            radial-gradient(circle at 78% 72%, rgba(57, 255, 20, 0.09), transparent 46%),
            radial-gradient(circle at 50% 50%, rgba(26, 26, 26, 0.45), #000000 82%);
        }

        #projects-section-container .grid-overlay {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.026) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.026) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at center, black 45%, transparent 95%);
        }

        #projects-section-container #particles-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        #projects-section-container .projects-section {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          padding: 60px 16px 72px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        #projects-section-container .section-header {
          width: 100%;
          max-width: 1240px;
          text-align: left;
          margin-bottom: 22px;
          padding: 0 18px;
        }

        @media (min-width: 640px) {
          #projects-section-container .section-header {
            padding: 0 32px;
          }
        }

        #projects-section-container .section-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 13px;
          border-radius: 999px;
          background: rgba(57, 255, 20, 0.08);
          border: 1px solid rgba(57, 255, 20, 0.35);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #39FF14;
          text-transform: uppercase;
          margin-bottom: 8px;
          box-shadow: 0 0 18px rgba(57, 255, 20, 0.15);
        }

        #projects-section-container .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #39FF14;
          box-shadow: 0 0 8px #39FF14;
          animation: pulseDotProj 2s infinite;
        }

        @keyframes pulseDotProj {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }

        #projects-section-container .section-title {
          font-size: clamp(1.75rem, 3.2vw, 2.55rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: #ffffff;
        }

        #projects-section-container .section-title .script-accent {
          font-family: 'Caveat', cursive;
          font-size: 1.25em;
          font-weight: 700;
          color: #39FF14;
          text-shadow: 0 0 24px rgba(57, 255, 20, 0.5);
          position: relative;
          display: inline-block;
          margin-left: 4px;
        }

        #projects-section-container .script-underline {
          position: absolute;
          left: -4%;
          bottom: -4px;
          width: 108%;
          height: 12px;
          pointer-events: none;
        }

        #projects-section-container .carousel-viewport {
          position: relative;
          width: 100%;
          height: 540px;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          touch-action: pan-y;
        }

        #projects-section-container .carousel-scaler {
          position: relative;
          width: 1250px;
          height: 540px;
          flex-shrink: 0;
          transform-origin: center center;
        }

        #projects-section-container .active-meta-stage {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 310px;
          text-align: center;
          z-index: 40;
          pointer-events: none;
          transition: opacity 0.24s ease, transform 0.24s ease;
        }

        #projects-section-container .active-meta-stage.switching {
          opacity: 0;
          transform: translateX(-50%) translateY(-6px);
        }

        #projects-section-container .active-project-title {
          font-size: 1.55rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        #projects-section-container .active-project-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          color: #94a3b8;
          letter-spacing: 0.03em;
        }

        #projects-section-container .active-project-subtitle span {
          color: #39FF14;
        }

        #projects-section-container .carousel-stage {
          position: relative;
          width: 100%;
          height: 100%;
          perspective: 1250px;
          perspective-origin: 50% 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #projects-section-container .project-card {
          position: absolute;
          width: 286px;
          height: 428px;
          border-radius: 26px;
          background: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          overflow: hidden;
          cursor: pointer;
          pointer-events: auto;
          transition:
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.55s ease,
            box-shadow 0.55s ease,
            border-color 0.45s ease,
            filter 0.55s ease;
          box-shadow: 0 24px 50px -12px rgba(0, 0, 0, 0.78);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          will-change: transform, opacity;
        }

        #projects-section-container .project-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.32);
          pointer-events: none;
          transition: opacity 0.45s ease;
          z-index: 2;
        }

        #projects-section-container .project-card[data-pos="0"]::after {
          opacity: 0;
        }

        #projects-section-container .project-card[data-pos="0"] {
          cursor: default;
          border-color: rgba(255, 255, 255, 0.24);
          box-shadow:
            0 30px 65px -15px rgba(0, 0, 0, 0.92),
            0 0 42px -8px var(--card-accent-glow, rgba(57, 255, 20, 0.45));
        }

        #projects-section-container .project-card:not([data-pos="0"]):hover {
          filter: brightness(1.12);
          border-color: rgba(255, 255, 255, 0.34);
        }

        #projects-section-container .card-artwork {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        #projects-section-container .card-artwork picture,
        #projects-section-container .card-artwork img,
        #projects-section-container .card-artwork svg {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        #projects-section-container .project-card[data-pos="0"]:hover .card-artwork img,
        #projects-section-container .project-card[data-pos="0"]:hover .card-artwork svg {
          transform: scale(1.05);
        }

        #projects-section-container .card-top-bar {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          z-index: 3;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
        }

        #projects-section-container .card-index-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e2e8f0;
        }

        #projects-section-container .card-status-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.66rem;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
          border: 1px solid var(--card-accent, #39FF14);
          color: var(--card-accent, #39FF14);
        }

        #projects-section-container .card-content {
          position: relative;
          z-index: 4;
          padding: 22px 18px 18px;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.97) 0%,
            rgba(0, 0, 0, 0.88) 65%,
            rgba(0, 0, 0, 0) 100%
          );
          transition: opacity 0.4s ease;
        }

        #projects-section-container .project-card:not([data-pos="0"]) .card-content {
          opacity: 0.78;
        }

        #projects-section-container .card-desc {
          font-size: 0.81rem;
          line-height: 1.48;
          color: #cbd5e1;
          margin-bottom: 11px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        #projects-section-container .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
        }

        #projects-section-container .tech-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.66rem;
          padding: 3.5px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
        }

        #projects-section-container .redirect-btn-wrap {
          position: relative;
          width: 100%;
        }

        #projects-section-container .project-card:not([data-pos="0"]) .redirect-btn {
          pointer-events: none;
          opacity: 0.55;
        }

        #projects-section-container .redirect-btn {
          position: relative;
          width: 100%;
          height: 44px;
          border: 1.5px solid var(--card-accent, #39FF14);
          border-radius: 13px;
          background: rgba(26, 26, 26, 0.92);
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition:
            transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease,
            background 0.35s ease,
            border-color 0.35s ease,
            color 0.25s ease;
          box-shadow: 0 0 18px -4px var(--card-accent-glow, rgba(57, 255, 20, 0.35));
        }

        #projects-section-container .redirect-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -130%;
          width: 85%;
          height: 100%;
          background: linear-gradient(
            115deg,
            transparent 0%,
            rgba(255, 255, 255, 0.28) 50%,
            transparent 100%
          );
          transform: skewX(-20deg);
          transition: left 0.65s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 1;
        }

        #projects-section-container .redirect-btn:hover::before {
          left: 145%;
        }

        #projects-section-container .redirect-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, rgba(57, 255, 20, 0.22), rgba(255, 7, 58, 0.18));
          box-shadow:
            0 10px 28px -6px var(--card-accent-glow, rgba(57, 255, 20, 0.55)),
            inset 0 0 14px rgba(255, 255, 255, 0.12);
        }

        #projects-section-container .btn-text-viewport {
          position: relative;
          height: 20px;
          overflow: hidden;
          z-index: 2;
          display: flex;
          flex-direction: column;
        }

        #projects-section-container .btn-text-primary,
        #projects-section-container .btn-text-hover {
          height: 20px;
          line-height: 20px;
          display: block;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        #projects-section-container .redirect-btn:hover .btn-text-primary,
        #projects-section-container .redirect-btn:hover .btn-text-hover {
          transform: translateY(-100%);
        }

        #projects-section-container .btn-icon {
          position: relative;
          z-index: 2;
          width: 16px;
          height: 16px;
          transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #projects-section-container .redirect-btn:hover .btn-icon {
          transform: translate(4px, -4px) scale(1.16);
        }

        #projects-section-container .redirect-btn:active {
          transform: scale(0.94);
        }

        #projects-section-container .btn-launch-fill {
          position: absolute;
          inset: 0;
          width: 0%;
          background: #39FF14;
          z-index: 0;
          opacity: 0.96;
          transition: width 0.62s cubic-bezier(0.22, 1, 0.36, 1);
        }

        #projects-section-container .redirect-btn.is-launching {
          pointer-events: none;
          color: #000000;
          border-color: #39FF14;
          box-shadow: 0 0 36px rgba(57, 255, 20, 0.5);
          transform: scale(0.97);
        }

        #projects-section-container .redirect-btn.is-launching .btn-launch-fill {
          width: 100%;
        }

        #projects-section-container .redirect-btn.is-launching .btn-icon {
          animation: spinPortalProj 0.6s linear infinite;
        }

        @keyframes spinPortalProj {
          0% { transform: rotate(0deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1.1); }
        }

        #projects-section-container .click-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          transform: translate(-50%, -50%) scale(0);
          pointer-events: none;
          z-index: 10;
          animation: rippleBurstProj 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes rippleBurstProj {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(11); opacity: 0; }
        }

        #projects-section-container .click-spark {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 15;
          animation: sparkFlyProj 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes sparkFlyProj {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }

        #projects-section-container .dots-row {
          margin-top: 14px;
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          z-index: 15;
        }

        #projects-section-container .dot-btn {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.22);
          border: none;
          cursor: pointer;
          transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }

        #projects-section-container .dot-btn:hover {
          background: rgba(255, 255, 255, 0.45);
        }

        #projects-section-container .dot-btn.active {
          width: 24px;
          background: #39FF14;
          box-shadow: 0 0 12px #39FF14;
        }

        #projects-section-container .carousel-controls {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          z-index: 15;
        }

        #projects-section-container .ctrl-prev {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(26, 26, 26, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #projects-section-container .ctrl-prev:hover {
          background: rgba(57, 255, 20, 0.14);
          border-color: #39FF14;
          color: #ffffff;
          transform: translateX(-3px);
          box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
        }

        #projects-section-container .ctrl-prev:active {
          transform: scale(0.9);
        }

        #projects-section-container .ctrl-next {
          width: 78px;
          height: 46px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #FF073A 0%, #c80028 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 26px -4px rgba(255, 7, 58, 0.55);
          transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #projects-section-container .ctrl-next:hover {
          width: 90px;
          transform: translateX(3px);
          box-shadow: 0 12px 32px -4px rgba(255, 7, 58, 0.75);
        }

        #projects-section-container .ctrl-next:active {
          transform: scale(0.92);
        }

        #projects-section-container .view-more-wrap {
          margin-top: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 15;
          position: relative;
        }

        #projects-section-container .view-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 13px 30px;
          border-radius: 999px;
          background: rgba(26, 26, 26, 0.92);
          border: 1px solid rgba(57, 255, 20, 0.45);
          color: #f1f5f9;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(14px);
          box-shadow: 0 0 24px rgba(57, 255, 20, 0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #projects-section-container .view-more-btn:hover {
          background: rgba(57, 255, 20, 0.16);
          border-color: #39FF14;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(57, 255, 20, 0.35);
        }

        #projects-section-container .view-more-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #39FF14;
          box-shadow: 0 0 10px #39FF14;
          animation: pulseDotProj 2s infinite;
        }

        #projects-section-container .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100;
          padding: 13px 18px;
          border-radius: 14px;
          background: rgba(26, 26, 26, 0.94);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(57, 255, 20, 0.45);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(57, 255, 20, 0.2);
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.84rem;
          color: #f8fafc;
          transform: translateY(120px);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        #projects-section-container .toast.show {
          transform: translateY(0);
          opacity: 1;
        }

        #projects-section-container .toast-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #39FF14;
          box-shadow: 0 0 10px #39FF14;
        }

        /* ───── MOBILE: Stacked peekaboo layout ───── */
        @media (max-width: 639px) {
          #projects-section-container .carousel-viewport {
            height: 520px !important;
            padding-top: 75px;
            overflow: visible;
          }

          /* scaler: full width, no scale transform, overflow visible for top-peeking */
          #projects-section-container .carousel-scaler {
            width: 100%;
            height: 440px;
            transform: none !important;
            overflow: visible;
          }

          #projects-section-container .carousel-stage {
            perspective: 700px;
            overflow: visible;
          }

          /* meta title placed neatly right above cards */
          #projects-section-container .active-meta-stage {
            top: -68px;
            width: min(90vw, 320px);
            pointer-events: none;
          }

          #projects-section-container .active-project-title {
            font-size: 1.18rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          #projects-section-container .active-project-subtitle {
            font-size: 0.7rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* center card: width controlled, centered */
          #projects-section-container .project-card {
            width: min(80vw, 300px);
            height: 400px;
            left: 50%;
            margin-left: calc(-1 * min(40vw, 150px));
          }

          /* hide cards |diff| >= 2 */
          #projects-section-container .project-card[data-pos="2"],
          #projects-section-container .project-card[data-pos="-2"],
          #projects-section-container .project-card[data-pos="3"],
          #projects-section-container .project-card[data-pos="-3"] {
            display: none;
          }
        }

        /* ───── DAY MODE THEME OVERRIDES ───── */
        #projects-section-container[data-theme="day"] .cosmic-bg {
          background:
            radial-gradient(circle at 22% 25%, rgba(225, 29, 72, 0.06), transparent 44%),
            radial-gradient(circle at 78% 72%, rgba(22, 163, 74, 0.07), transparent 46%),
            radial-gradient(circle at 50% 50%, rgba(226, 236, 248, 0.55), #F4F8FD 82%);
        }

        #projects-section-container[data-theme="day"] .grid-overlay {
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.038) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.038) 1px, transparent 1px);
        }

        #projects-section-container[data-theme="day"] .section-title {
          color: #0F172A;
        }

        #projects-section-container[data-theme="day"] .section-title .script-accent {
          color: #16A34A;
          text-shadow: none;
        }

        #projects-section-container[data-theme="day"] .active-project-title {
          color: #0F172A;
        }

        #projects-section-container[data-theme="day"] .active-project-subtitle {
          color: #475569;
        }

        #projects-section-container[data-theme="day"] .active-project-subtitle span {
          color: #16A34A;
        }

        #projects-section-container[data-theme="day"] .project-card {
          background: #FFFFFF;
          border-color: rgba(15, 23, 42, 0.1);
          box-shadow: 0 22px 46px -14px rgba(15, 23, 42, 0.14);
        }

        #projects-section-container[data-theme="day"] .project-card::after {
          background: rgba(244, 248, 253, 0.42);
        }

        #projects-section-container[data-theme="day"] .project-card[data-pos="0"] {
          border-color: rgba(15, 23, 42, 0.16);
          box-shadow:
            0 28px 56px -14px rgba(15, 23, 42, 0.2),
            0 0 28px -10px rgba(22, 163, 74, 0.28);
        }

        #projects-section-container[data-theme="day"] .project-card:not([data-pos="0"]):hover {
          filter: brightness(0.98);
          border-color: rgba(22, 163, 74, 0.4);
        }

        #projects-section-container[data-theme="day"] .card-content {
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.92) 72%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        #projects-section-container[data-theme="day"] .redirect-btn {
          background: #FFFFFF;
          border-color: #16A34A;
          color: #0F172A;
          box-shadow: 0 6px 18px -4px rgba(22, 163, 74, 0.24);
        }

        #projects-section-container[data-theme="day"] .redirect-btn:hover {
          background: linear-gradient(135deg, #16A34A, #15803D);
          color: #FFFFFF;
          box-shadow: 0 10px 24px -4px rgba(22, 163, 74, 0.42);
        }

        #projects-section-container[data-theme="day"] .btn-launch-fill {
          background: #16A34A;
        }

        #projects-section-container[data-theme="day"] .redirect-btn.is-launching {
          color: #FFFFFF;
          border-color: #16A34A;
        }

        #projects-section-container[data-theme="day"] .dot-btn {
          background: rgba(15, 23, 42, 0.18);
        }

        #projects-section-container[data-theme="day"] .dot-btn:hover {
          background: rgba(15, 23, 42, 0.36);
        }

        #projects-section-container[data-theme="day"] .dot-btn.active {
          background: #16A34A;
          box-shadow: 0 0 10px rgba(22, 163, 74, 0.45);
        }

        #projects-section-container[data-theme="day"] .ctrl-prev {
          background: #FFFFFF;
          border-color: rgba(15, 23, 42, 0.14);
          color: #334155;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        }

        #projects-section-container[data-theme="day"] .ctrl-prev:hover {
          background: rgba(22, 163, 74, 0.1);
          border-color: #16A34A;
          color: #0F172A;
          box-shadow: 0 6px 18px rgba(22, 163, 74, 0.22);
        }

        #projects-section-container[data-theme="day"] .ctrl-next {
          background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%);
          box-shadow: 0 8px 22px -4px rgba(225, 29, 72, 0.42);
        }

        #projects-section-container[data-theme="day"] .view-more-btn {
          background: #FFFFFF;
          border-color: rgba(22, 163, 74, 0.45);
          color: #0F172A;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.09);
        }

        #projects-section-container[data-theme="day"] .view-more-btn:hover {
          background: #16A34A;
          border-color: #16A34A;
          color: #FFFFFF;
          box-shadow: 0 12px 28px rgba(22, 163, 74, 0.32);
        }

        #projects-section-container[data-theme="day"] .view-more-dot {
          background: #16A34A;
          box-shadow: 0 0 8px rgba(22, 163, 74, 0.55);
        }

        #projects-section-container[data-theme="day"] .view-more-btn:hover .view-more-dot {
          background: #FFFFFF;
        }

        #projects-section-container[data-theme="day"] .toast {
          background: rgba(255, 255, 255, 0.96);
          border-color: rgba(22, 163, 74, 0.45);
          color: #0F172A;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
        }

        #projects-section-container[data-theme="day"] .toast-dot {
          background: #16A34A;
          box-shadow: 0 0 8px rgba(22, 163, 74, 0.55);
        }
      `}</style>

      <div className="cosmic-bg" />
      <div className="grid-overlay" />
      <canvas ref={canvasRef} id="particles-canvas" />

      {/* 04. PROJECTS SECTION */}
      <main className="projects-section" id="projects">
        <header className="section-header">
          <div className="flex flex-wrap items-center gap-3.5 mb-3">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-900/12 bg-white/90 text-xl text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.08)] dark:border-white/22 dark:bg-[#1A1A1A]/75 dark:text-white dark:shadow-[0_0_20px_rgba(57,255,20,0.14)] transition-colors duration-700"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(22,163,74,0.55)] dark:bg-[#39FF14] dark:shadow-[0_0_10px_#39FF14] animate-pulse" />
              My Projects
            </span>
            <span className="font-mono text-xs tracking-[0.14em] uppercase text-rose-600 dark:text-[#FF073A] transition-colors duration-700">
              04. Featured Projects
            </span>
          </div>
          <h2 className="section-title">
            Our Featured{' '}
            <span className="script-accent">
              Projects
              <svg className="script-underline" viewBox="0 0 180 14" fill="none">
                <path d="M3 9 C45 3, 120 2, 177 8" stroke={isDay ? '#16A34A' : '#39FF14'} strokeWidth="3" strokeLinecap="round" />
                <path d="M16 12 C62 8, 115 8, 162 11" stroke={isDay ? '#E11D48' : '#FF073A'} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
              </svg>
            </span>
          </h2>
        </header>

        <div className="carousel-viewport" ref={viewportRef} id="carousel-viewport">
          <div className="carousel-scaler" ref={scalerRef} id="carousel-scaler">
            <div className="active-meta-stage" ref={metaStageRef} id="active-meta">
              <h3 className="active-project-title" ref={metaTitleRef} id="meta-title">
                Pyntflow
              </h3>
            </div>

            <div className="carousel-stage" ref={stageRef} id="carousel-stage">
              {/* Cards injected by JS */}
            </div>
          </div>
        </div>

        {/* Dots ABOVE arrow buttons */}
        <div className="dots-row" ref={dotsRowRef} id="dots-row" />

        {/* Arrow Buttons BELOW dots */}
        <div className="carousel-controls">
          <button className="ctrl-prev" id="btn-prev" aria-label="Previous Project">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="ctrl-next" id="btn-next" aria-label="Next Project">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* View More Projects Button */}
        <div className="view-more-wrap">
          <button
            type="button"
            onClick={onOpenAllProjects}
            className="view-more-btn"
          >
            <span className="view-more-dot" />
            <span>View More Projects (17+ Live)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      <div className="toast" ref={toastRef} id="redirect-toast">
        <span className="toast-dot" />
        <span ref={toastMsgRef} id="toast-msg">
          Launching project portal...
        </span>
      </div>
    </div>
  );
};
