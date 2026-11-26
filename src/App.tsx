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

// ── Lazy-loaded below-fold sections ──────────────────────────────────────────
// These are NOT in the main JS chunk. Each is pre-fetched via IntersectionObserver
// with a large rootMargin so the chunk is downloaded well before the user scrolls to it.
const HeroCelestialOrbRobo = lazy(() =>
  import('./components/HeroCelestialOrbRobo').then((m) => ({ default: m.HeroCelestialOrbRobo }))
);
const loadSkillsArcadeChunk = () => import('./skillsArcade/App');
const SkillsSectionApp      = lazy(loadSkillsArcadeChunk);
const AboutOriginSection    = lazy(() =>
  import('./components/AboutOriginSection').then((m) => ({ default: m.AboutOriginSection }))
);
const ProjectsSection       = lazy(() =>
  import('./components/ProjectsSection').then((m) => ({ default: m.ProjectsSection }))
);
const PortfolioFooter       = lazy(() =>
  import('./components/PortfolioFooter').then((m) => ({ default: m.PortfolioFooter }))
);
const AllProjectsPage       = lazy(() =>
  import('./pages/AllProjectsPage').then((m) => ({ default: m.AllProjectsPage }))
);

// ── Cyberpunk / Retro Arcade Skeleton Loader Fallback ─────────────────────────
function ArcadeSkeletonLoader() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[1280px] h-[520px] sm:h-[580px] lg:h-[640px] rounded-3xl border border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-slate-950/50 backdrop-blur-md p-6 flex flex-col justify-between overflow-hidden my-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#39FF14]" />
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
          INITIALIZING 3D SKILLS ARCADE SUBSYSTEM...
        </span>
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/25 border-t-emerald-500 dark:border-t-[#39FF14] animate-spin" />
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tracking-wider">
          PRE-WARMING VECTOR ARENA
        </span>
      </div>
      <div className="h-10 w-full rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-900/5 dark:border-white/5 animate-pulse" />
    </div>
  );
}

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
  const workSectionRef = useRef<HTMLElement>(null);
  const contactSectionRef = useRef<HTMLElement>(null);
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

  // ── Below-fold pre-fetch gates ─────────────────────────────────────────────
  // Each section's JS chunk is downloaded BEFORE the user reaches it, so there
  // is zero loading flash when scrolling. aboutReady fires immediately after the
  // curtain so the chunk is ready long before the user finishes the 260vh hero scroll.
  const [aboutReady, setAboutReady] = useState<boolean>(false);
  const [skillsNearViewport, setSkillsNearViewport] = useState<boolean>(false);
  const [projectsReady, setProjectsReady] = useState<boolean>(false);
  const [footerReady, setFooterReady] = useState<boolean>(false);

  // AboutOriginSection: pre-fetch immediately when curtain completes.
  // The hero is 260vh so user takes several seconds to scroll past — plenty of time.
  useEffect(() => {
    if (!curtainDone || aboutReady) return;
    // Small delay so the curtain unmount itself settles first
    const id = window.setTimeout(() => setAboutReady(true), 150);
    return () => window.clearTimeout(id);
  }, [curtainDone, aboutReady]);

  // Stage 1 (Silent Network-Only Prefetch):
  // When user is in AboutOriginSection (aboutReady is true), the Hero section has
  // already finished and exited the viewport. We trigger background chunk download
  // during idle time with zero CPU/WebGL initialization and zero Hero interference!
  useEffect(() => {
    if (!curtainDone || !aboutReady) return;
    const idleId = (typeof window !== 'undefined' && 'requestIdleCallback' in window)
      ? window.requestIdleCallback(() => { loadSkillsArcadeChunk(); }, { timeout: 2500 })
      : window.setTimeout(() => { loadSkillsArcadeChunk(); }, 1200);

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId as number);
      } else {
        window.clearTimeout(idleId as number);
      }
    };
  }, [curtainDone, aboutReady]);

  // Stage 2 (Mount on Proximity):
  // Mount the interactive game when user is within 500px of #stack
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
      { rootMargin: '500px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [curtainDone, skillsNearViewport]);

  // ProjectsSection: pre-fetch when user is 1000px above #work (i.e. still in AboutOrigin)
  useEffect(() => {
    if (!curtainDone || projectsReady) return;
    const el = workSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setProjectsReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProjectsReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1000px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [curtainDone, projectsReady]);

  // PortfolioFooter: pre-fetch when user is 1000px above #contact (i.e. still in ProjectsSection)
  useEffect(() => {
    if (!curtainDone || footerReady) return;
    const el = contactSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setFooterReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFooterReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1000px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [curtainDone, footerReady]);

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

        {/* AboutOriginSection — lazy, pre-fetched 150ms after curtain completes */}
        <Suspense fallback={<div className="min-h-screen w-full" />}>
          {aboutReady && <AboutOriginSection />}
        </Suspense>

        {/* SkillsArcade — Two-stage prefetch & proximity mount with Arcade Skeleton fallback */}
        <section id="stack" ref={stackSectionRef} className="relative w-full z-10">
          {curtainDone && skillsNearViewport ? (
            <Suspense fallback={<ArcadeSkeletonLoader />}>
              <SkillsSectionApp />
            </Suspense>
          ) : (
            <div className="min-h-100 w-full" />
          )}
        </section>

        {/* ProjectsSection — lazy, pre-fetched 1000px before #work enters viewport */}
        <section id="work" ref={workSectionRef} className="relative w-full z-10">
          <Suspense fallback={<div className="min-h-[600px] w-full" />}>
            {projectsReady && <ProjectsSection onOpenAllProjects={onOpenAllProjects} />}
          </Suspense>
        </section>

        {/* PortfolioFooter — lazy, pre-fetched 1000px before #contact enters viewport */}
        <section id="contact" ref={contactSectionRef} className="relative w-full z-10">
          <Suspense fallback={<div className="min-h-[400px] w-full" />}>
            {footerReady && <PortfolioFooter />}
          </Suspense>
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
        <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
          <AllProjectsPage onBack={goToHome} />
        </Suspense>
      )}
    </ThemeProvider>
  );
}

export default App;
