import React, { useEffect, useState } from 'react';

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
  const [displayedText, setDisplayedText] = useState<string>('');

  useEffect(() => {
    if (!active) {
      setDisplayedText('');
      return;
    }

    let timeoutId: number;
    let intervalId: number;
    let currentIndex = 0;

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));
        if (currentIndex >= text.length) {
          window.clearInterval(intervalId);
          if (onComplete) onComplete();
        }
      }, speed);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [text, speed, delay, active]);

  return (
    <span className={className} style={style}>
      {displayedText}
    </span>
  );
};
