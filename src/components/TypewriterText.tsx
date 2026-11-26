import React, { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per char (default: 28ms)
  delay?: number; // initial delay ms (default: 0)
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 28,
  delay = 0,
  active = true,
  className = '',
  style,
  onComplete,
}) => {
  const [charCount, setCharCount] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setCharCount(0);
      return;
    }

    let rafId = 0;
    let startTime: number | null = null;
    let completed = false;
    let lastCount = 0;

    const tick = (now: number) => {
      if (startTime === null) {
        startTime = now;
      }
      const elapsed = now - startTime - delay;
      if (elapsed >= 0) {
        const nextCount = Math.min(text.length, Math.floor(elapsed / speed) + 1);
        if (nextCount !== lastCount) {
          lastCount = nextCount;
          setCharCount(nextCount);
        }
        if (nextCount >= text.length) {
          if (!completed) {
            completed = true;
            onCompleteRef.current?.();
          }
          return;
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [text, speed, delay, active]);

  return (
    <span className={`relative inline-block ${className}`} style={style}>
      {/* Reserve final text dimensions from frame 0 to prevent layout shift */}
      <span aria-hidden="true" className="opacity-0 select-none pointer-events-none">
        {text}
      </span>
      <span className="absolute inset-0">
        {text.slice(0, charCount)}
      </span>
    </span>
  );
};
