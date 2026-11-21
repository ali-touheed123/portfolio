import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { useScroll, useSpring, useTransform } from 'motion/react';
import { ThemeProvider, useSkyTheme } from './context/ThemeContext';
import { useParallax } from './hooks/useParallax';
import { HeroScrollCanvas } from './components/HeroScrollCanvas';
import { HeroSkyAtmosphere } from './components/HeroSkyAtmosphere';
import { HeroOrbitalIcons } from './components/HeroOrbitalIcons';
import { EntryCurtain } from './components/EntryCurtain';
import { ArchitecturalGrid } from './components/ArchitecturalGrid';
import { StarField } from './components/StarField';
import { CloudField } from './components/CloudField';
import { HandwrittenHero } from './components/HandwrittenHero';
import { TopNav } from './components/TopNav';
import { CrossedRibbonBridge } from './components/CrossedRibbonBridge';
import { AboutOriginSection } from './components/AboutOriginSection';
import { ProjectsSection } from './components/ProjectsSection';

const SkillsSectionApp = lazy(() => import('./skillsArcade/App'));

function PortfolioShell() {
  const { isDay } = useSkyTheme();
  const parallax = useParallax();
  const heroTrackRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroTrackRef,
    offset: ['start start', 'end end'],
  });
  const smoothHeroProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001,
  });
  const heroFrameProgress = useTransform(smoothHeroProgress, [0, 0.64], [0, 1]);

  const [currentFrame, setCurrentFrame] = useState<number>(5);
  const [isHeroComplete, setIsHeroComplete] = useState<boolean>(false);
  const [heroRevealed, setHeroRevealed] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('top');
  // Track whether curtain is still covering the screen
  const [curtainDone, setCurtainDone] = useState<boolean>(false);

  const handleCurtainOpenStart = useCallback(() => {
    setHeroRevealed(true);
  }, []);

  const handleCurtainComplete = useCallback(() => {
    setCurtainDone(true);
  }, []);

  // Lock body scroll while curtain is showing, unlock when it's gone
  useEffect(() => {
    if (!curtainDone) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [curtainDone]);

  const showOrbitalOverlay = isHeroComplete || currentFrame >= 28;

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Keep Lenis stopped until curtain is fully gone
    if (!curtainDone) {
      lenis.stop();
    }

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Start Lenis smooth scroll only after curtain is fully gone
  useEffect(() => {
    if (curtainDone && lenisRef.current) {
      lenisRef.current.start();
    }
  }, [curtainDone]);

  useEffect(() => {
    const sections = ['story', 'stack', 'work'];
    const onScroll = () => {
      const triggerLine = window.innerHeight * 0.42;
      let current = 'top';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= triggerLine) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'top') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { duration: 1.1 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { duration: 1.1 });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div
      id="top"
      className={`relative min-h-screen w-full overflow-x-clip transition-colors duration-700 ${
        isDay
          ? 'bg-linear-to-b from-[#D5E9FF] via-[#EAF3FC] to-[#F7FAFE] text-slate-900'
          : 'bg-background text-slate-100'
      }`}
    >
      {/* 4-Column Staggered Upward Entry Curtain */}
      <EntryCurtain onCurtainOpenStart={handleCurtainOpenStart} onCurtainComplete={handleCurtainComplete} />

      {/* Persistent Atmospheric Sky & Architectural Grid */}
      <StarField />
      <CloudField />
      <ArchitecturalGrid />

      {/* Top Nav */}
      <TopNav onNavigate={handleNavigate} activeSection={activeSection} />

      {/* 260vh STICKY 3D SCROLL STAGE HERO */}
      <section ref={heroTrackRef} className="relative w-full h-[260vh] z-10">
        <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
          <HeroSkyAtmosphere parallax={parallax} />
          <HeroOrbitalIcons visible={showOrbitalOverlay} parallax={parallax} />
          <HeroScrollCanvas
            className="w-full h-full z-10"
            scrollProgress={heroFrameProgress}
            parallax={parallax}
            onFrameChange={setCurrentFrame}
            onAnimationComplete={setIsHeroComplete}
          />
          <HandwrittenHero
            currentFrame={currentFrame}
            isComplete={isHeroComplete}
            revealActive={heroRevealed}
            onConnectClick={() => handleNavigate('contact')}
          />
        </div>
      </section>

      {/* BELOW-HERO PORTFOLIO EXPERIENCE */}
      <main className="relative z-10">
        <CrossedRibbonBridge />
        <AboutOriginSection />
        <section id="stack" className="relative w-full z-10">
          <Suspense fallback={<div className="min-h-100 w-full" />}>
            <SkillsSectionApp />
          </Suspense>
        </section>
        <section id="work" className="relative w-full z-10">
          <ProjectsSection />
        </section>
      </main>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <PortfolioShell />
    </ThemeProvider>
  );
}

export default App;
