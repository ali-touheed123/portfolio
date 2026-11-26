import React, { useEffect, useRef, useState } from 'react';
import { useIsInViewport } from '../hooks/useIsInViewport';

export const PortfolioFooter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const planeRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<SVGPathElement | null>(null);
  const contactBtnRef = useRef<HTMLButtonElement | null>(null);
  const isFooterActive = useIsInViewport(canvasRef, '200px');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    setShowToast(true);
    toastTimeoutRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 2400);
  };

  // 1. Starry Sky Canvas
  useEffect(() => {
    if (!isFooterActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let stars: Array<{
      x: number;
      y: number;
      r: number;
      alpha: number;
      speed: number;
      phase: number;
      isSparkle: boolean;
    }> = [];

    const initStars = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((rect.width * rect.height) / 3800);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height * 0.88,
        r: Math.random() * 1.35 + 0.35,
        alpha: Math.random() * 0.75 + 0.15,
        speed: Math.random() * 0.018 + 0.005,
        phase: Math.random() * Math.PI * 2,
        isSparkle: Math.random() > 0.94,
      }));
    };

    const drawStars = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
        const a = s.alpha * twinkle;

        if (s.isSparkle) {
          ctx.fillStyle = `rgba(145, 245, 230, ${a})`;
          ctx.beginPath();
          const len = s.r * 3.8;
          ctx.moveTo(s.x, s.y - len);
          ctx.lineTo(s.x + 1, s.y - 1);
          ctx.lineTo(s.x + len, s.y);
          ctx.lineTo(s.x + 1, s.y + 1);
          ctx.lineTo(s.x, s.y + len);
          ctx.lineTo(s.x - 1, s.y + 1);
          ctx.lineTo(s.x - len, s.y);
          ctx.lineTo(s.x - 1, s.y - 1);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(235, 240, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animId = requestAnimationFrame(drawStars);
    };

    initStars();
    animId = requestAnimationFrame(drawStars);
    window.addEventListener('resize', initStars);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initStars);
    };
  }, [isFooterActive]);

  // 2. Paper Plane flight & Sparks
  const isFlyingRef = useRef(false);

  const spawnSparks = () => {
    const plane = planeRef.current;
    const stage = stageRef.current;
    if (!plane || !stage) return;

    const planeRect = plane.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const originX = planeRect.left - stageRect.left + planeRect.width * 0.4;
    const originY = planeRect.top - stageRect.top + planeRect.height * 0.6;

    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        if (!stage) return;
        const spark = document.createElement('span');
        spark.className = 'flight-spark';
        spark.style.left = `${originX + i * 12}px`;
        spark.style.top = `${originY - i * 9}px`;
        spark.style.setProperty('--sx', `${(Math.random() - 0.8) * 50}px`);
        spark.style.setProperty('--sy', `${(Math.random() - 0.2) * 50}px`);
        stage.appendChild(spark);
        setTimeout(() => spark.remove(), 750);
      }, i * 38);
    }
  };

  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    if (isFlyingRef.current) return;
    const btn = e.currentTarget;

    isFlyingRef.current = true;
    btn.classList.add('launching');

    const plane = planeRef.current;
    const trail = trailRef.current;

    if (plane) {
      plane.classList.remove('ready-tilt', 'returning');
      plane.classList.add('flying');
    }
    if (trail) {
      trail.classList.add('active-trail');
    }

    spawnSparks();

    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 720);

    setTimeout(() => {
      btn.classList.remove('launching');
      if (plane) {
        plane.classList.remove('flying');
        plane.classList.add('returning');
      }
      if (trail) {
        trail.classList.remove('active-trail');
      }

      setTimeout(() => {
        if (plane) plane.classList.remove('returning');
        isFlyingRef.current = false;
      }, 850);
    }, 1250);
  };

  const handleSocialMouseEnter = () => {
    if (!isFlyingRef.current && planeRef.current) {
      planeRef.current.classList.add('ready-tilt');
    }
    if (trailRef.current) {
      trailRef.current.classList.add('active-trail');
    }
  };

  const handleSocialMouseLeave = () => {
    if (!isFlyingRef.current) {
      if (planeRef.current) planeRef.current.classList.remove('ready-tilt');
      if (trailRef.current) trailRef.current.classList.remove('active-trail');
    }
  };

  // 3. Contact Button Ripple & Modal
  const handleContactBtnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = contactBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'btn-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    setTimeout(() => setIsModalOpen(true), 150);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsModalOpen(false);
    (e.target as HTMLFormElement).reset();
    triggerToast('Message sent! Thanks for reaching out.');
  };

  const handleEmailCopy = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const email = 'ali.touheed.work@gmail.com';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        triggerToast(`Copied ${email} to clipboard!`);
      });
    } else {
      triggerToast(`Copied ${email} to clipboard!`);
    }
  };

  return (
    <footer className="portfolio-footer" id="portfolioFooter">
      <style>{`
        /* =========================================
           FOOTER BASE & EXACT PROPORTIONS
        ========================================= */
        .portfolio-footer {
          position: relative;
          width: 100%;
          height: 385px;
          background: radial-gradient(circle at 65% 45%, #121029 0%, #070711 52%, #030307 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          user-select: none;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .portfolio-footer::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 30% 50% at 10% 85%, rgba(255, 85, 0, 0.16), transparent 70%),
            radial-gradient(ellipse 30% 50% at 75% 45%, rgba(110, 50, 255, 0.18), transparent 70%),
            radial-gradient(ellipse 25% 40% at 62% 95%, rgba(30, 240, 190, 0.14), transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        .footer-stars {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .footer-waves {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        .footer-inner {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 1440px;
          padding: 0 clamp(120px, 9.5vw, 165px) 0 clamp(240px, 29vw, 435px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(28px, 4vw, 68px);
        }

        /* =========================================
           LEFT CTA COLUMN
        ========================================= */
        .footer-cta {
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex-shrink: 1;
        }

        .get-in-touch-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font-size: 12.5px;
          font-weight: 500;
          color: #e6e7f0;
          margin-bottom: 14px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .get-in-touch-pill svg {
          width: 13px;
          height: 13px;
          filter: drop-shadow(0 0 6px rgba(155, 110, 255, 0.8));
          animation: sparklePulse 3s ease-in-out infinite;
        }

        @keyframes sparklePulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50% { transform: scale(1.18) rotate(15deg); opacity: 1; }
        }

        .footer-heading {
          font-size: clamp(34px, 3.6vw, 48px);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
        }

        .footer-heading .white-line {
          display: block;
          color: #ffffff;
          line-height: 1.02;
        }

        .footer-heading .gradient-line {
          display: block;
          line-height: 1.18;
          padding-bottom: 0.14em;
          margin-bottom: -0.14em;
          background: linear-gradient(90deg, #f3e059 0%, #f18c4a 45%, #8d4bf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .footer-subtitle {
          font-size: 14.5px;
          line-height: 1.48;
          color: rgba(235, 237, 245, 0.84);
          font-weight: 400;
          margin-bottom: 22px;
          max-width: 370px;
        }

        /* =========================================
           CONTACT ME BUTTON
        ========================================= */
        .contact-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(95deg, #e7f64d 0%, #3ef1b4 100%);
          color: #080d10;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          overflow: hidden;
          box-shadow:
            0 8px 25px -4px rgba(72, 242, 165, 0.42),
            0 0 0 1px rgba(255, 255, 255, 0.25) inset;
          transition:
            transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.28s ease,
            filter 0.28s ease;
        }

        .contact-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 65%;
          height: 100%;
          background: linear-gradient(
            115deg,
            transparent 0%,
            rgba(255, 255, 255, 0.58) 50%,
            transparent 100%
          );
          transform: skewX(-20deg);
          transition: left 0.65s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .contact-btn:hover {
          transform: translateY(-3px) scale(1.035);
          box-shadow:
            0 14px 34px -4px rgba(72, 242, 165, 0.65),
            0 0 22px rgba(231, 246, 77, 0.45),
            0 0 0 1px rgba(255, 255, 255, 0.45) inset;
          filter: brightness(1.04);
        }

        .contact-btn:hover::before {
          left: 150%;
        }

        .contact-btn:active {
          transform: translateY(1px) scale(0.955);
          box-shadow:
            0 4px 12px rgba(72, 242, 165, 0.45),
            0 0 0 2px rgba(255, 255, 255, 0.5) inset;
          transition: transform 0.1s ease;
        }

        .contact-btn .btn-arrow {
          display: inline-flex;
          transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .contact-btn:hover .btn-arrow {
          transform: translateX(5px);
        }

        .contact-btn:active .btn-arrow {
          transform: translateX(8px);
        }

        .btn-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.65);
          transform: scale(0);
          animation: rippleAnim 0.55s ease-out forwards;
          pointer-events: none;
        }

        @keyframes rippleAnim {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        /* =========================================
           RIGHT TILTED GLASS CARD + PLANE AREA
        ========================================= */
        .card-plane-stage {
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .contact-card {
          position: relative;
          width: 308px;
          padding: 23px 23px 20px;
          border-radius: 24px;
          background: linear-gradient(
            135deg,
            rgba(22, 25, 48, 0.58) 0%,
            rgba(12, 14, 30, 0.72) 55%,
            rgba(86, 36, 175, 0.34) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transform: rotate(-5.5deg);
          box-shadow:
            0 24px 55px rgba(0, 0, 0, 0.62),
            inset 0 0 32px rgba(120, 75, 255, 0.14);
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease;
          z-index: 4;
        }

        .contact-card:hover {
          transform: rotate(-3.5deg) translateY(-4px);
          box-shadow:
            0 30px 65px rgba(0, 0, 0, 0.7),
            inset 0 0 38px rgba(120, 75, 255, 0.22);
        }

        .contact-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(
            135deg,
            rgba(215, 255, 250, 0.72) 0%,
            rgba(130, 240, 225, 0.22) 22%,
            rgba(255, 255, 255, 0.06) 50%,
            rgba(130, 240, 225, 0.42) 78%,
            rgba(170, 120, 255, 0.35) 100%
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f1f3fa;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          padding: 4px 6px;
          margin: -4px -6px;
          border-radius: 10px;
          transition: background 0.2s ease, transform 0.2s ease, color 0.2s ease;
          cursor: pointer;
        }

        .info-item:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(3px);
          color: #ffffff;
        }

        .info-icon {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .social-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding-top: 2px;
        }

        .social-btn {
          position: relative;
          width: 37px;
          height: 37px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: grid;
          place-items: center;
          color: #ffffff;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
            background 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .social-btn svg {
          width: 17px;
          height: 17px;
          transition: transform 0.25s ease;
        }

        .social-btn:hover {
          transform: translateY(-5px) scale(1.12);
          background: rgba(255, 255, 255, 0.13);
          border-color: rgba(255, 255, 255, 0.35);
        }

        .social-btn[data-brand="github"]:hover {
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.22);
        }
        .social-btn[data-brand="linkedin"]:hover {
          box-shadow: 0 8px 20px rgba(10, 102, 194, 0.55);
          border-color: rgba(88, 166, 255, 0.6);
        }
        .social-btn[data-brand="x"]:hover {
          box-shadow: 0 8px 20px rgba(200, 210, 255, 0.3);
        }
        .social-btn[data-brand="youtube"]:hover {
          box-shadow: 0 8px 20px rgba(255, 45, 45, 0.55);
          border-color: rgba(255, 90, 90, 0.6);
        }

        .social-btn:active {
          transform: translateY(-1px) scale(0.92);
        }

        .social-btn.launching {
          animation: iconLaunchPop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes iconLaunchPop {
          0% { transform: scale(0.9); }
          45% { transform: scale(1.22); box-shadow: 0 0 24px rgba(255, 215, 90, 0.85); }
          100% { transform: scale(1); }
        }

        /* =========================================
           DASHED FLIGHT PATH & SMALLER PLANE
        ========================================= */
        .plane-trajectory-svg {
          position: absolute;
          right: -95px;
          top: -20px;
          width: 145px;
          height: 215px;
          pointer-events: none;
          z-index: 3;
          overflow: visible;
        }

        .dashed-trail {
          fill: none;
          stroke: rgba(255, 255, 255, 0.26);
          stroke-width: 1.9;
          stroke-dasharray: 5 6;
          stroke-linecap: round;
          transition: stroke 0.3s ease, filter 0.3s ease;
        }

        .dashed-trail.active-trail {
          stroke: rgba(255, 224, 102, 0.88);
          filter: drop-shadow(0 0 6px rgba(255, 200, 70, 0.75));
          animation: dashFlow 0.55s linear infinite;
        }

        @keyframes dashFlow {
          from { stroke-dashoffset: 22; }
          to { stroke-dashoffset: 0; }
        }

        .paper-plane-wrap {
          position: absolute;
          right: -135px;
          top: -48px;
          width: 84px;
          height: 74px;
          pointer-events: none;
          z-index: 10;
          transform-origin: center center;
          animation: planeHover 4.2s ease-in-out infinite;
        }

        .paper-plane-wrap.ready-tilt {
          animation: none;
          transform: translate(-3px, 2px) rotate(-8deg) scale(1.06);
          transition: transform 0.25s ease;
        }

        .paper-plane-wrap.flying {
          animation: planeFlyAway 0.78s cubic-bezier(0.45, 0.02, 0.75, 0.25) forwards;
        }

        .paper-plane-wrap.returning {
          animation: planeReturn 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes planeHover {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(2px, -6px) rotate(2.5deg); }
        }

        @keyframes planeFlyAway {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          20% {
            transform: translate(-15px, 12px) rotate(-14deg) scale(0.94);
            opacity: 1;
          }
          55% {
            transform: translate(95px, -70px) rotate(12deg) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(320px, -220px) rotate(22deg) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes planeReturn {
          0% {
            transform: translate(-65px, 42px) rotate(-12deg) scale(0.3);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        .plane-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 20px rgba(255, 165, 45, 0.45));
        }

        .flight-spark {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ffe766;
          box-shadow: 0 0 10px #ffaa2b;
          pointer-events: none;
          z-index: 9;
          animation: sparkFade 0.7s ease-out forwards;
        }

        @keyframes sparkFade {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }
        }

        /* =========================================
           COPIED TOAST & QUICK CONTACT MODAL
        ========================================= */
        .mini-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: rgba(18, 22, 42, 0.92);
          border: 1px solid rgba(72, 242, 165, 0.45);
          color: #e9fff5;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 600;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease, transform 0.25s ease;
          z-index: 100;
        }

        .mini-toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .contact-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(3, 4, 12, 0.75);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: center;
          padding: 20px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
          z-index: 200;
        }

        .contact-modal-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        .contact-modal {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(145deg, rgba(22, 25, 48, 0.92), rgba(11, 13, 28, 0.96));
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 24px;
          padding: 28px;
          color: #fff;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.75);
          transform: scale(0.92) translateY(12px);
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .contact-modal-backdrop.open .contact-modal {
          transform: scale(1) translateY(0);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(90deg, #f3e059, #3ef1b4);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-form input,
        .modal-form textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .modal-form input:focus,
        .modal-form textarea:focus {
          border-color: #3ef1b4;
        }

        .modal-submit {
          margin-top: 6px;
          padding: 12px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(95deg, #e7f64d, #3ef1b4);
          color: #080d10;
          font-family: inherit;
          font-weight: 700;
          font-size: 14.5px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .modal-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(62, 241, 180, 0.4);
        }

        /* =========================================
           RESPONSIVE BREAKPOINTS
        ========================================= */
        @media (max-width: 1080px) {
          .footer-inner {
            padding: 0 95px 0 215px;
          }
          .contact-card {
            width: 285px;
            padding: 20px;
          }
          .paper-plane-wrap {
            right: -95px;
            top: -42px;
            width: 72px;
            height: 64px;
          }
          .plane-trajectory-svg {
            right: -65px;
            top: -15px;
          }
        }

        @media (max-width: 880px) {
          .portfolio-footer {
            height: auto;
            min-height: 385px;
            padding: 54px 0 68px;
          }
          .footer-inner {
            padding: 0 28px;
            flex-direction: column;
            text-align: center;
            gap: 42px;
          }
          .footer-cta {
            align-items: center;
          }
          .paper-plane-wrap {
            right: -46px;
            top: -58px;
            width: 68px;
            height: 60px;
          }
          .plane-trajectory-svg {
            display: none;
          }
        }
      `}</style>

      {/* Starry Sky Canvas */}
      <canvas ref={canvasRef} className="footer-stars" id="footerStars" />

      {/* Bottom Fluid Gradient Waves */}
      <svg className="footer-waves" viewBox="0 0 1440 385" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="wavePurpleLeft" x1="0%" y1="30%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#6b1eff" />
            <stop offset="55%" stopColor="#8b2aff" />
            <stop offset="100%" stopColor="#5308d4" />
          </linearGradient>

          <linearGradient id="waveOrangeLeft" x1="0%" y1="0%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#ffaa00" />
            <stop offset="38%" stopColor="#ff5e0a" />
            <stop offset="78%" stopColor="#ff2b00" />
            <stop offset="100%" stopColor="#d41414" />
          </linearGradient>

          <linearGradient id="waveMintRight" x1="0%" y1="80%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#19d49e" />
            <stop offset="50%" stopColor="#37f5c5" />
            <stop offset="100%" stopColor="#1598b5" />
          </linearGradient>

          <linearGradient id="wavePurpleRight" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3818d9" />
            <stop offset="55%" stopColor="#6a2bff" />
            <stop offset="100%" stopColor="#9e3dff" />
          </linearGradient>

          <filter id="waveSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="-6" stdDeviation="12" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Bottom-left deep purple base wave */}
        <path d="M -20 330 C 100 322, 230 338, 375 390 L -20 390 Z" fill="url(#wavePurpleLeft)" />

        {/* Bottom-left orange fluid wave kept strictly on the left 0–31% */}
        <path
          d="M -20 185 C 105 175, 225 225, 345 318 C 385 350, 415 375, 445 390 L 350 390 C 230 342, 105 332, -20 338 Z"
          fill="url(#waveOrangeLeft)"
          filter="url(#waveSoftShadow)"
        />

        {/* Bottom-right mint-cyan smooth wave */}
        <path d="M 740 390 C 805 345, 895 335, 995 362 C 1070 382, 1140 388, 1210 390 Z" fill="url(#waveMintRight)" />

        {/* Bottom-right purple-violet sweeping wave */}
        <path
          d="M 970 390 C 1105 380, 1255 340, 1460 225 L 1460 390 Z"
          fill="url(#wavePurpleRight)"
          filter="url(#waveSoftShadow)"
        />
      </svg>

      {/* Main Content */}
      <div className="footer-inner">
        {/* Left Column */}
        <div className="footer-cta">
          <div className="flex flex-wrap items-center gap-3.5 mb-5">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/22 bg-white/5 text-xl text-white shadow-[0_0_20px_rgba(74,222,128,0.12)]"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80] animate-pulse" />
              Get In Touch
            </span>
          </div>

          <h2 className="footer-heading">
            <span className="white-line">Let’s Work</span>
            <span className="gradient-line">Together!</span>
          </h2>

          <p className="footer-subtitle">
            Have a project in mind? Let’s turn your ideas into something extraordinary.
          </p>

          <button
            ref={contactBtnRef}
            className="contact-btn"
            id="contactBtn"
            type="button"
            onClick={handleContactBtnClick}
          >
            <span>Contact Me</span>
            <span className="btn-arrow" aria-hidden="true">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>

        {/* Right Column: Compact Tilted Card + Paper Airplane */}
        <div ref={stageRef} className="card-plane-stage" id="cardPlaneStage">
          <div className="contact-card">
            <div className="info-list">
              <a
                href="mailto:ali.touheed.work@gmail.com"
                className="info-item"
                id="emailLink"
                onClick={handleEmailCopy}
              >
                <span className="info-icon">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
                    <defs>
                      <linearGradient id="mailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c9f756" />
                        <stop offset="100%" stopColor="#3ae8b0" />
                      </linearGradient>
                    </defs>
                    <rect x="2" y="4" width="20" height="16" rx="3.5" fill="url(#mailGrad)" />
                    <path
                      d="M3.5 6.5L12 13L20.5 6.5"
                      stroke="#0c1424"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>ali.touheed.work@gmail.com</span>
              </a>

              <a href="tel:+923001234567" className="info-item">
                <span className="info-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                      fill="#5ef2a8"
                    />
                  </svg>
                </span>
                <span>+92 300 1234567</span>
              </a>

              <div className="info-item" style={{ cursor: 'default' }}>
                <span className="info-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                      fill="#5ef2a8"
                    />
                  </svg>
                </span>
                <span>Karachi, Pakistan</span>
              </div>
            </div>

            <div className="social-row">
              <a
                href="https://github.com/"
                className="social-btn"
                data-brand="github"
                aria-label="GitHub"
                onMouseEnter={handleSocialMouseEnter}
                onMouseLeave={handleSocialMouseLeave}
                onClick={(e) => handleSocialClick(e, 'https://github.com/')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              <a
                href="https://linkedin.com/"
                className="social-btn"
                data-brand="linkedin"
                aria-label="LinkedIn"
                onMouseEnter={handleSocialMouseEnter}
                onMouseLeave={handleSocialMouseLeave}
                onClick={(e) => handleSocialClick(e, 'https://linkedin.com/')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#9fb7d6" />
                  <path
                    d="M7.5 17.5h-2.4V9.8h2.4v7.7zM6.3 8.8a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zm11.2 8.7h-2.4v-4.1c0-1-.02-2.2-1.35-2.2-1.35 0-1.56 1.05-1.56 2.13v4.17H9.8V9.8h2.3v1.05h.03c.32-.6 1.1-1.25 2.27-1.25 2.43 0 2.88 1.6 2.88 3.68v4.22z"
                    fill="#0c1222"
                  />
                </svg>
              </a>

              <a
                href="https://x.com/"
                className="social-btn"
                data-brand="x"
                aria-label="X (Twitter)"
                onMouseEnter={handleSocialMouseEnter}
                onMouseLeave={handleSocialMouseLeave}
                onClick={(e) => handleSocialClick(e, 'https://x.com/')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://youtube.com/"
                className="social-btn"
                data-brand="youtube"
                aria-label="YouTube"
                onMouseEnter={handleSocialMouseEnter}
                onMouseLeave={handleSocialMouseLeave}
                onClick={(e) => handleSocialClick(e, 'https://youtube.com/')}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="4" fill="#e63e3e" />
                  <path d="M10 9l5.5 3-5.5 3V9z" fill="#ffffff" />
                </svg>
              </a>
            </div>
          </div>

          {/* Curved Dashed Flight Path aligned to smaller plane */}
          <svg className="plane-trajectory-svg" viewBox="0 0 145 215" aria-hidden="true">
            <path
              ref={trailRef}
              id="dashedTrail"
              className="dashed-trail"
              d="M 35 178 C 82 175, 102 155, 92 112 C 84 78, 86 48, 109 27"
            />
          </svg>

          {/* Smaller 3D-Shaded Paper Airplane */}
          <div ref={planeRef} className="paper-plane-wrap" id="paperPlane" aria-hidden="true">
            <svg className="plane-svg" viewBox="0 0 120 105" fill="none">
              <defs>
                <linearGradient id="wingTop" x1="0%" y1="30%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fff49c" />
                  <stop offset="55%" stopColor="#ffd55a" />
                  <stop offset="100%" stopColor="#ffb13b" />
                </linearGradient>
                <linearGradient id="wingBottom" x1="20%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe06b" />
                  <stop offset="100%" stopColor="#ff9328" />
                </linearGradient>
                <linearGradient id="wingFoldDark" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#f57c1f" />
                  <stop offset="100%" stopColor="#d44d0e" />
                </linearGradient>
                <linearGradient id="wingFoldMid" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff9c2a" />
                  <stop offset="100%" stopColor="#ffc94d" />
                </linearGradient>
              </defs>

              <path d="M 8 44 L 114 8 L 46 66 Z" fill="url(#wingTop)" />
              <path d="M 46 66 L 114 8 L 62 79 Z" fill="url(#wingFoldDark)" />
              <path d="M 46 66 L 62 79 L 52 97 Z" fill="url(#wingFoldMid)" />
              <path d="M 62 79 L 114 8 L 96 92 Z" fill="url(#wingBottom)" />
              <path d="M 8 44 L 114 8 L 52 57 Z" fill="rgba(255,255,255,0.22)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`mini-toast ${showToast ? 'show' : ''}`} id="miniToast">
        {toastMsg}
      </div>

      {/* Contact Modal */}
      <div
        className={`contact-modal-backdrop ${isModalOpen ? 'open' : ''}`}
        id="contactModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="contact-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div className="modal-header">
            <h3 id="modalTitle">Start a Project</h3>
            <button
              className="modal-close"
              id="modalClose"
              type="button"
              aria-label="Close modal"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
          </div>
          <form className="modal-form" id="modalForm" onSubmit={handleFormSubmit}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea rows={4} placeholder="Tell me about your idea..." required />
            <button type="submit" className="modal-submit">
              Send Message &rarr;
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};
