import React, { useEffect, useRef, useState } from 'react';

export const NeonColorShift: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -999, y: -999 });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hue, setHue] = useState<number>(0);
  const clientPosRef = useRef<{ x: number; y: number }>({ x: -999, y: -999 });
  const idleTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Slowly auto-rotate hue
    let angle = 0;
    const animateHue = () => {
      angle = (angle + 0.3) % 360;
      setHue(angle);
      rafRef.current = requestAnimationFrame(animateHue);
    };
    rafRef.current = requestAnimationFrame(animateHue);

    const updatePosition = (clientX: number, clientY: number) => {
      clientPosRef.current = { x: clientX, y: clientY };
      // Document coordinates (pageX / pageY):
      // Element absolute top:0 par hai, toh clientY + scrollY exact mask position dega
      // chahe user hero section mein ho ya scroll karke neeche chala jaye!
      setMousePos({
        x: clientX + window.scrollX,
        y: clientY + window.scrollY,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
      setIsActive(true);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => setIsActive(false), 2500);
    };

    // Scroll hone par bhi mask cursor ke sath update ho
    const handleScroll = () => {
      if (clientPosRef.current.x !== -999) {
        updatePosition(clientPosRef.current.x, clientPosRef.current.y);
      }
    };

    const handleMouseLeave = () => setIsActive(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    /*
      zIndex: 0 — Hero section zIndex: 1 par hai, isliye character frames hamesha
      is layer ke UPAR rahenge. Frames par hover karne se BLACK overlay KABHI NAHI AAYEGA!
      
      Size and Position:
      height: calc(100vw * 1.49902)
      backgroundSize: 100% auto
      backgroundPosition: top center
      backgroundRepeat: no-repeat
      Bilkul App.tsx ke main background image ke saath 1:1 pixel perfect match.
    */
    <div
      className="absolute inset-x-0 top-0 pointer-events-none select-none"
      style={{ zIndex: 0, height: 'calc(100vw * 1.49902)' }}
    >
      <div
        className="w-full h-full transition-opacity duration-500 ease-out"
        style={{
          opacity: isActive ? 1 : 0,
          backgroundImage: `url('/background-layer.webp')`,
          backgroundSize: '100% auto',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          filter: `hue-rotate(${hue}deg) saturate(1.4) brightness(0.85)`,
          // Document coordinates mask:
          // Hero section ho ya page ke neeche scroll ho, mask exact cursor ke neeche reveal hoga
          WebkitMaskImage: `radial-gradient(ellipse 220px 160px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)`,
          maskImage: `radial-gradient(ellipse 220px 160px at ${mousePos.x}px ${mousePos.y}px, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)`,
        }}
      />
    </div>
  );
};
