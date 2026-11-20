import { useState } from 'react';
import { useParallax } from './hooks/useParallax';
import { HeroScrollCanvas } from './components/HeroScrollCanvas';
import { NeonColorShift } from './components/NeonColorShift';
import { StarField } from './components/StarField';
import { HandwrittenHero } from './components/HandwrittenHero';

export function App() {
  const parallax = useParallax();
  const [currentFrame, setCurrentFrame] = useState<number>(5);

  return (
    <div
      className="relative w-full overflow-x-hidden bg-background"
      style={{
        minHeight: 'calc(100vw * 1.49902)',
        // Slightly darkened background image for enhanced contrast and depth
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.26), rgba(0, 0, 0, 0.26)), url('/background.webp')`,
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Neon Wave Color Shift: Changes the hue of neon waves near the cursor */}
      <NeonColorShift />

      {/* Cosmic Stars & Sparkles: Over entire background, but BEHIND character frames */}
      <StarField />

      {/* HERO SECTION */}
      <section
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Character canvas with ONLY 3D tilt (no bg parallax to avoid scroll glitch) */}
        <HeroScrollCanvas
          className="w-full h-full"
          parallax={parallax}
          onFrameChange={setCurrentFrame}
        />

        {/* Handwritten Sketch UI Overlay with typing animation & frame-28 trigger for mantra */}
        <HandwrittenHero currentFrame={currentFrame} />
      </section>
    </div>
  );
}

export default App;
