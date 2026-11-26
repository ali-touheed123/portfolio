import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { useScroll, useSpring, useTransform } from 'motion/react';
import { ThemeProvider, useSkyTheme } from './context/ThemeContext';
import { HomeVisibilityProvider } from './context/VisibilityContext';
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
import { PortfolioFooter } from './components/PortfolioFooter';
import { AllProjectsPage } from './pages/AllProjectsPage';

const HeroCelestialOrbRobo = lazy(() =>
  import('./components/HeroCelestialOrbRobo').then((m) => ({ default: m.HeroCelestialOrbRobo }))
);
const SkillsSectionApp = lazy(() => import('./skillsArcade/App'));

interface PortfolioShellProps {
  onOpenAllProjects: () => void;
  isVisible: boolean;
  restoreScrollY?: number;
}

function PortfolioShell({ onOpenAllProjects, isVisible, restoreScrollY }: PortfolioShellProps) {
  const { isDay } = useSkyTheme();
  const parallaxRef = useParallax();
  const heroTrackRef = useRef<HTMLElement>(null);
  const stackSectionRef = useRef<HTMLElement>(null);
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
  // Defer downloading & mounting the heavy 5MB Three.js/Rapier3D SkillsArcade until user scrolls near #stack
  const [skillsNearViewport, setSkillsNearViewport] = useState<boolean>(false);

  useEffect(() => {
    if (!curtainDone || skillsNearViewport) return;
    const el = stackSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSkillsNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSkillsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [curtainDone, skillsNearViewport]);

  const handleCurtainOpenStart = useCallback(() => {
    setHeroRevealed(true);
  }, []);

  const handleCurtainComplete = useCallback(() => {
    setCurtainDone(true);
  }, []);

  // Lock body scroll while curtain is showing on home route, unlock when gone or on projects route
  useEffect(() => {
    if (isVisible && !curtainDone) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isVisible, curtainDone]);

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

  // Handle Lenis & scroll restoration when returning from projects route
  useEffect(() => {
    if (isVisible) {
      if (curtainDone && lenisRef.current) {
        lenisRef.current.start();
      }
      if (typeof restoreScrollY === 'number' && restoreScrollY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: restoreScrollY, behavior: 'instant' });
          lenisRef.current?.scrollTo(restoreScrollY, { immediate: true });
        });
      }
    } else {
      lenisRef.current?.stop();
    }
  }, [isVisible, curtainDone, restoreScrollY]);

  useEffect(() => {
    const sections = ['story', 'stack', 'work', 'contact'];
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
    <HomeVisibilityProvider value={isVisible}>
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
          <HeroSkyAtmosphere parallaxRef={parallaxRef} />
          <HeroOrbitalIcons visible={showOrbitalOverlay} parallaxRef={parallaxRef} />
          <HeroScrollCanvas
            className="w-full h-full z-10"
            scrollProgress={heroFrameProgress}
            parallaxRef={parallaxRef}
            onFrameChange={setCurrentFrame}
            onAnimationComplete={setIsHeroComplete}
          />
          <HandwrittenHero
            currentFrame={currentFrame}
            isComplete={isHeroComplete}
            revealActive={heroRevealed}
            onConnectClick={() => handleNavigate('contact')}
          />
          {curtainDone && (
            <Suspense fallback={null}>
              <HeroCelestialOrbRobo className="absolute top-14 right-2 sm:top-2.5 sm:right-5 lg:top-3 lg:right-8 z-30" />
            </Suspense>
          )}
        </div>
      </section>

      {/* BELOW-HERO PORTFOLIO EXPERIENCE */}
      <main className="relative z-10">
        <CrossedRibbonBridge />
        <AboutOriginSection />
        <section id="stack" ref={stackSectionRef} className="relative w-full z-10">
          {curtainDone && skillsNearViewport ? (
            <Suspense fallback={<div className="min-h-100 w-full" />}>
              <SkillsSectionApp />
            </Suspense>
          ) : (
            <div className="min-h-100 w-full" />
          )}
        </section>
        <section id="work" className="relative w-full z-10">
          <ProjectsSection onOpenAllProjects={onOpenAllProjects} />
        </section>
        <section id="contact" className="relative w-full z-10">
          <PortfolioFooter />
        </section>
      </main>
    </div>
    </HomeVisibilityProvider>
  );
}

export function App() {
  const [route, setRoute] = useState<'home' | 'projects'>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path === '/projects' || path === '/projects/' || hash === '#projects' ? 'projects' : 'home';
  });

  const savedHomeScrollYRef = useRef<number>(0);
  const [restoreY, setRestoreY] = useState<number>(0);

  const goToProjects = useCallback(() => {
    savedHomeScrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    window.history.pushState({}, '', '/projects');
    setRoute('projects');
  }, []);

  const goToHome = useCallback(() => {
    window.history.pushState({}, '', '/');
    let targetY = savedHomeScrollYRef.current;
    if (!targetY) {
      const workEl = document.getElementById('work');
      if (workEl) targetY = workEl.offsetTop;
    }
    setRestoreY(targetY);
    setRoute('home');
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const nextRoute = path === '/projects' || path === '/projects/' || hash === '#projects' ? 'projects' : 'home';
      setRoute(nextRoute);
      if (nextRoute === 'home') {
        let targetY = savedHomeScrollYRef.current;
        if (!targetY) {
          const workEl = document.getElementById('work');
          if (workEl) targetY = workEl.offsetTop;
        }
        setRestoreY(targetY);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <ThemeProvider>
      <div style={{ display: route === 'home' ? 'block' : 'none' }}>
        <PortfolioShell
          onOpenAllProjects={goToProjects}
          isVisible={route === 'home'}
          restoreScrollY={restoreY}
        />
      </div>

      {route === 'projects' && (
        <AllProjectsPage onBack={goToHome} />
      )}
    </ThemeProvider>
  );
}

export default App;
