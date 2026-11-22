import React, { useEffect, useRef, useState } from 'react';

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  stackLine: string;
  badge: string;
  desc: string;
  tags: string[];
  accent: string;
  glow: string;
  url: string;
  artType: 'erp' | 'paint' | 'workflow' | 'telemetry' | 'ledger' | 'arcade';
}

const PROJECTS: ProjectItem[] = [
  {
    id: '01',
    title: 'Pyntflow Cloud ERP & POS',
    category: 'Cloud ERP & POS',
    stackLine: 'Next.js, Supabase & PostgreSQL',
    badge: '+60% Faster POS',
    desc: 'End-to-end multi-branch cloud ERP, tinting formula calculator & high-speed counter checkout for paint wholesalers.',
    tags: ['Next.js', 'Supabase', 'Cloud POS'],
    accent: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.48)',
    url: 'https://portfolio-eosin-seven-15.vercel.app/',
    artType: 'erp',
  },
  {
    id: '02',
    title: 'Tawakkal Paint Portal',
    category: 'B2B E-Commerce',
    stackLine: 'React, Node.js & Express',
    badge: '1st Client',
    desc: 'Transformed paper shade catalogs into a searchable contractor ordering portal with multi-can inventory & ledgers.',
    tags: ['React', 'Node.js', 'Express'],
    accent: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.48)',
    url: 'https://github.com/',
    artType: 'paint',
  },
  {
    id: '03',
    title: 'FlowForge Automator',
    category: 'Workflow Automation',
    stackLine: 'Python, Node.js & Webhooks',
    badge: 'AI Pipelines',
    desc: 'Visual node-based automation engine syncing WhatsApp alerts, CRM leads & cloud databases with zero manual work.',
    tags: ['Python', 'Webhooks', 'Automation'],
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    url: 'https://github.com/',
    artType: 'workflow',
  },
  {
    id: '04',
    title: 'DevPulse Cloud Monitor',
    category: 'DevOps Telemetry',
    stackLine: 'TypeScript, Docker & AWS',
    badge: '99.9% Uptime',
    desc: 'Real-time microservice health dashboard tracking container latency, API throughput & instant Discord alerts.',
    tags: ['TypeScript', 'Docker', 'AWS'],
    accent: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.48)',
    url: 'https://github.com/',
    artType: 'telemetry',
  },
  {
    id: '05',
    title: 'KhaataSync Smart Ledger',
    category: 'FinTech SaaS',
    stackLine: 'Next.js, PostgreSQL & PDFKit',
    badge: 'Auto Billing',
    desc: 'Automated retail credit ledger that generates digital invoices and schedules WhatsApp payment reminders.',
    tags: ['Next.js', 'PostgreSQL', 'FinTech'],
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.48)',
    url: 'https://github.com/',
    artType: 'ledger',
  },
  {
    id: '06',
    title: 'Arcade Skill Breaker',
    category: 'Interactive Web UI',
    stackLine: 'React, Canvas 60FPS & WebAudio',
    badge: '60 FPS Physics',
    desc: 'Gamified interactive web engine with paddle physics, power-ups & responsive particle collisions inside the browser.',
    tags: ['React', 'Canvas', 'Physics'],
    accent: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.5)',
    url: 'https://portfolio-eosin-seven-15.vercel.app/',
    artType: 'arcade',
  },
];

function getCardArtworkSVG(type: string): string {
  const artworks: Record<string, string> = {
    erp: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-erp" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#052e16"/>
            <stop offset="55%" stop-color="#071923"/>
            <stop offset="100%" stop-color="#05070e"/>
          </linearGradient>
          <linearGradient id="wave-erp" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#22c55e"/>
            <stop offset="100%" stop-color="#22d3ee"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-erp)"/>
        <circle cx="250" cy="85" r="70" fill="#22c55e" opacity="0.16"/>
        <circle cx="65" cy="190" r="85" fill="#22d3ee" opacity="0.12"/>
        <rect x="34" y="74" width="252" height="170" rx="16" fill="#0b1324" stroke="rgba(34,197,94,0.45)" stroke-width="1.5"/>
        <circle cx="54" cy="94" r="4" fill="#fb7185"/><circle cx="68" cy="94" r="4" fill="#facc15"/><circle cx="82" cy="94" r="4" fill="#22c55e"/>
        <rect x="52" y="114" width="110" height="12" rx="6" fill="rgba(255,255,255,0.14)"/>
        <rect x="52" y="136" width="76" height="8" rx="4" fill="rgba(34,211,238,0.45)"/>
        <path d="M46 216 Q 96 180, 140 192 T 215 148 T 272 126" fill="none" stroke="url(#wave-erp)" stroke-width="4" stroke-linecap="round"/>
        <circle cx="272" cy="126" r="6" fill="#22c55e"/>
        <rect x="52" y="264" width="66" height="32" rx="8" fill="rgba(34,197,94,0.16)" stroke="rgba(34,197,94,0.4)"/>
        <rect x="127" y="264" width="66" height="32" rx="8" fill="rgba(34,211,238,0.14)" stroke="rgba(34,211,238,0.35)"/>
        <rect x="202" y="264" width="66" height="32" rx="8" fill="rgba(168,85,247,0.14)" stroke="rgba(168,85,247,0.35)"/>
      </svg>`,
    paint: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-paint" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#083344"/>
            <stop offset="60%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#05070e"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-paint)"/>
        <circle cx="160" cy="145" r="95" fill="#22d3ee" opacity="0.14"/>
        <rect x="55" y="95" width="90" height="145" rx="14" transform="rotate(-12 100 165)" fill="#0e7490" stroke="rgba(255,255,255,0.2)"/>
        <rect x="115" y="82" width="90" height="145" rx="14" fill="#22d3ee" stroke="rgba(255,255,255,0.35)"/>
        <rect x="175" y="95" width="90" height="145" rx="14" transform="rotate(12 220 165)" fill="#6366f1" stroke="rgba(255,255,255,0.2)"/>
        <rect x="128" y="185" width="64" height="24" rx="6" fill="rgba(5,7,14,0.65)"/>
        <circle cx="62" cy="272" r="14" fill="rgba(34,211,238,0.2)" stroke="#22d3ee" stroke-width="1.5"/>
        <line x1="76" y1="272" x2="245" y2="272" stroke="rgba(34,211,238,0.4)" stroke-dasharray="5 5" stroke-width="2"/>
        <circle cx="258" cy="272" r="14" fill="rgba(168,85,247,0.25)" stroke="#a855f7" stroke-width="1.5"/>
      </svg>`,
    workflow: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-wf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#3b0764"/>
            <stop offset="55%" stop-color="#111029"/>
            <stop offset="100%" stop-color="#05070e"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-wf)"/>
        <circle cx="160" cy="160" r="105" fill="#a855f7" opacity="0.18"/>
        <path d="M85 110 C 160 110, 110 185, 160 185 S 220 250, 235 250" fill="none" stroke="#c084fc" stroke-width="3" stroke-dasharray="6 4"/>
        <path d="M235 115 C 180 115, 195 185, 160 185 S 110 250, 85 250" fill="none" stroke="#22d3ee" stroke-width="2.5"/>
        <rect x="44" y="88" width="84" height="44" rx="12" fill="#171230" stroke="#c084fc" stroke-width="1.8"/>
        <rect x="192" y="92" width="84" height="44" rx="12" fill="#171230" stroke="#22d3ee" stroke-width="1.8"/>
        <circle cx="160" cy="185" r="28" fill="#581c87" stroke="#f0abfc" stroke-width="2.2"/>
        <path d="M153 185 L160 174 L160 183 L168 183 L159 196 L159 186 Z" fill="#ffffff"/>
        <rect x="44" y="228" width="84" height="44" rx="12" fill="#171230" stroke="#22d3ee" stroke-width="1.8"/>
        <rect x="192" y="228" width="84" height="44" rx="12" fill="#171230" stroke="#22c55e" stroke-width="1.8"/>
      </svg>`,
    telemetry: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-tel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4c0519"/>
            <stop offset="55%" stop-color="#180d1e"/>
            <stop offset="100%" stop-color="#05070e"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-tel)"/>
        <circle cx="160" cy="155" r="95" fill="#fb7185" opacity="0.16"/>
        <circle cx="160" cy="155" r="82" fill="none" stroke="rgba(251,113,133,0.28)" stroke-width="1.2"/>
        <circle cx="160" cy="155" r="54" fill="none" stroke="rgba(251,113,133,0.45)" stroke-width="1.4" stroke-dasharray="4 4"/>
        <circle cx="160" cy="155" r="24" fill="rgba(251,113,133,0.25)" stroke="#fb7185" stroke-width="2"/>
        <path d="M35 235 L95 235 L118 195 L142 268 L168 175 L192 250 L215 225 L285 225" fill="none" stroke="#fb7185" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="215" cy="105" r="5" fill="#22d3ee"/>
        <circle cx="105" cy="122" r="4" fill="#facc15"/>
      </svg>`,
    ledger: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-led" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0c4a6e"/>
            <stop offset="55%" stop-color="#111827"/>
            <stop offset="100%" stop-color="#05070e"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-led)"/>
        <circle cx="210" cy="120" r="85" fill="#38bdf8" opacity="0.15"/>
        <rect x="52" y="76" width="216" height="190" rx="16" fill="#0f172a" stroke="rgba(56,189,248,0.45)" stroke-width="1.6"/>
        <rect x="74" y="100" width="90" height="12" rx="6" fill="#38bdf8"/>
        <rect x="74" y="124" width="172" height="1" fill="rgba(255,255,255,0.12)"/>
        <rect x="74" y="142" width="120" height="10" rx="5" fill="rgba(255,255,255,0.18)"/>
        <rect x="210" y="142" width="36" height="10" rx="5" fill="#22c55e"/>
        <rect x="74" y="168" width="105" height="10" rx="5" fill="rgba(255,255,255,0.14)"/>
        <rect x="210" y="168" width="36" height="10" rx="5" fill="#22c55e"/>
        <rect x="74" y="194" width="130" height="10" rx="5" fill="rgba(255,255,255,0.14)"/>
        <rect x="210" y="194" width="36" height="10" rx="5" fill="#38bdf8"/>
        <rect x="74" y="226" width="172" height="22" rx="8" fill="rgba(34,197,94,0.18)" stroke="#22c55e"/>
      </svg>`,
    arcade: `
      <svg viewBox="0 0 320 440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2e1065"/>
            <stop offset="55%" stop-color="#0b1120"/>
            <stop offset="100%" stop-color="#05070e"/>
          </linearGradient>
        </defs>
        <rect width="320" height="440" fill="url(#bg-arc)"/>
        <circle cx="160" cy="180" r="100" fill="#a855f7" opacity="0.16"/>
        <rect x="42" y="76" width="72" height="28" rx="9" fill="#0f172a" stroke="#22d3ee" stroke-width="1.8"/>
        <rect x="124" y="76" width="72" height="28" rx="9" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.8"/>
        <rect x="206" y="76" width="72" height="28" rx="9" fill="#0f172a" stroke="#22c55e" stroke-width="1.8"/>
        <rect x="42" y="114" width="72" height="28" rx="9" fill="#0f172a" stroke="#facc15" stroke-width="1.8"/>
        <rect x="124" y="114" width="72" height="28" rx="9" fill="#0f172a" stroke="#a855f7" stroke-width="1.8"/>
        <rect x="206" y="114" width="72" height="28" rx="9" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
        <circle cx="160" cy="172" r="3" fill="#22d3ee" opacity="0.4"/>
        <circle cx="160" cy="192" r="3.5" fill="#22d3ee" opacity="0.6"/>
        <circle cx="160" cy="212" r="4" fill="#22d3ee" opacity="0.8"/>
        <circle cx="160" cy="236" r="10" fill="#ffffff" stroke="#22d3ee" stroke-width="4"/>
        <rect x="108" y="256" width="104" height="18" rx="9" fill="#0f172a" stroke="#22d3ee" stroke-width="2"/>
      </svg>`,
  };
  return artworks[type] || artworks.erp;
}

export const ProjectsSection: React.FC = () => {
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

    function triggerButtonLaunch(btn: HTMLElement, project: ProjectItem) {
      if (btn.classList.contains('is-launching')) return;

      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);

      const colors = [project.accent, '#a855f7', '#22d3ee', '#ffffff', '#fb7185'];
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
          ${getCardArtworkSVG(proj.artType)}
        </div>
        <div class="card-top-bar">
          <span class="card-status-chip">${proj.badge}</span>
        </div>
        <div class="card-content">
          <p class="card-desc">${proj.desc}</p>
          <div class="card-tags">
            ${proj.tags.map((t) => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
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
        const palette = ['#ffffff', '#a855f7', '#22d3ee', '#22c55e', '#fb7185'];
        const stars = Array.from({ length: count }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.6 + 0.5,
          vy: -(Math.random() * 0.22 + 0.06),
          alpha: Math.random() * 0.6 + 0.2,
          color: palette[Math.floor(Math.random() * palette.length)],
        }));

        const animateStars = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (const s of stars) {
            s.y += s.vy;
            if (s.y < -5) {
              s.y = canvas.height + 5;
              s.x = Math.random() * canvas.width;
            }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          animFrameId = requestAnimationFrame(animateStars);
        };
        animateStars();
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
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="projects-section-container"
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: '#05070e',
        color: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        #projects-section-container {
          --bg-deep: #05070e;
          --bg-card: #0b0f1d;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --purple: #a855f7;
          --purple-glow: rgba(168, 85, 247, 0.45);
          --cyan: #22d3ee;
          --cyan-glow: rgba(34, 211, 238, 0.4);
          --green: #22c55e;
          --coral: #fb7185;
        }

        #projects-section-container .cosmic-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 22% 25%, rgba(168, 85, 247, 0.11), transparent 44%),
            radial-gradient(circle at 78% 72%, rgba(34, 211, 238, 0.09), transparent 46%),
            radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.5), #05070e 82%);
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
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.35);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #d8b4fe;
          text-transform: uppercase;
          margin-bottom: 8px;
          box-shadow: 0 0 18px rgba(168, 85, 247, 0.15);
        }

        #projects-section-container .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 8px #22d3ee;
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
          color: #a855f7;
          text-shadow: 0 0 24px rgba(168, 85, 247, 0.55);
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
          color: #22d3ee;
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
          background: #0b0f1d;
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
          background: rgba(5, 7, 14, 0.24);
          pointer-events: none;
          transition: opacity 0.45s ease;
          z-index: 2;
        }

        #projects-section-container .project-card[data-pos="0"]::after {
          opacity: 0;
        }

        #projects-section-container .project-card[data-pos="0"] {
          cursor: default;
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow:
            0 30px 65px -15px rgba(0, 0, 0, 0.92),
            0 0 42px -8px var(--card-accent-glow, rgba(168, 85, 247, 0.45));
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

        #projects-section-container .card-artwork svg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

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
          background: rgba(5, 7, 14, 0.68);
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
          background: rgba(5, 7, 14, 0.68);
          backdrop-filter: blur(8px);
          border: 1px solid var(--card-accent, #22d3ee);
          color: var(--card-accent, #22d3ee);
        }

        #projects-section-container .card-content {
          position: relative;
          z-index: 4;
          padding: 22px 18px 18px;
          background: linear-gradient(
            to top,
            rgba(5, 7, 14, 0.97) 0%,
            rgba(5, 7, 14, 0.88) 65%,
            rgba(5, 7, 14, 0) 100%
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
          border: 1.5px solid var(--card-accent, #a855f7);
          border-radius: 13px;
          background: rgba(11, 15, 29, 0.88);
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
            border-color 0.35s ease;
          box-shadow: 0 0 18px -4px var(--card-accent-glow, rgba(168, 85, 247, 0.35));
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
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.24), rgba(34, 211, 238, 0.22));
          box-shadow:
            0 10px 28px -6px var(--card-accent-glow, rgba(168, 85, 247, 0.65)),
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
          background: linear-gradient(90deg, #a855f7, #22d3ee, #22c55e);
          z-index: 0;
          opacity: 0.92;
          transition: width 0.62s cubic-bezier(0.22, 1, 0.36, 1);
        }

        #projects-section-container .redirect-btn.is-launching {
          pointer-events: none;
          border-color: #ffffff;
          box-shadow: 0 0 36px rgba(34, 211, 238, 0.4);
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
          background: #22d3ee;
          box-shadow: 0 0 12px #22d3ee;
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
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #projects-section-container .ctrl-prev:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #22d3ee;
          color: #ffffff;
          transform: translateX(-3px);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.25);
        }

        #projects-section-container .ctrl-prev:active {
          transform: scale(0.9);
        }

        #projects-section-container .ctrl-next {
          width: 78px;
          height: 46px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #a855f7 0%, #fb7185 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 26px -4px rgba(251, 113, 133, 0.55);
          transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #projects-section-container .ctrl-next:hover {
          width: 90px;
          transform: translateX(3px);
          box-shadow: 0 12px 32px -4px rgba(168, 85, 247, 0.75);
        }

        #projects-section-container .ctrl-next:active {
          transform: scale(0.92);
        }

        #projects-section-container .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 100;
          padding: 13px 18px;
          border-radius: 14px;
          background: rgba(11, 15, 29, 0.92);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(34, 211, 238, 0.45);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(34, 211, 238, 0.2);
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
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
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
      `}</style>

      <div className="cosmic-bg" />
      <div className="grid-overlay" />
      <canvas ref={canvasRef} id="particles-canvas" />

      {/* 04. PROJECTS SECTION */}
      <main className="projects-section" id="projects">
        <header className="section-header">
          <div className="section-pill">
            <span className="pill-dot" />
            04. PROJECTS
          </div>
          <h2 className="section-title">
            Our Featured{' '}
            <span className="script-accent">
              Projects
              <svg className="script-underline" viewBox="0 0 180 14" fill="none">
                <path d="M3 9 C45 3, 120 2, 177 8" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                <path d="M16 12 C62 8, 115 8, 162 11" stroke="#22d3ee" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
              </svg>
            </span>
          </h2>
        </header>

        <div className="carousel-viewport" ref={viewportRef} id="carousel-viewport">
          <div className="carousel-scaler" ref={scalerRef} id="carousel-scaler">
            <div className="active-meta-stage" ref={metaStageRef} id="active-meta">
              <h3 className="active-project-title" ref={metaTitleRef} id="meta-title">
                Pyntflow Cloud ERP &amp; POS
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
