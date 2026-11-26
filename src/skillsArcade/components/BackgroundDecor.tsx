import { useSkyTheme } from '../../context/ThemeContext';

const NIGHT_SPECKS = [
  { top: '12%', left: '34%', size: 2, color: 'rgba(57, 255, 20, 0.38)' },
  { top: '24%', left: '6%', size: 2.5, color: 'rgba(255, 7, 58, 0.35)' },
  { top: '42%', left: '32%', size: 2, color: 'rgba(255, 255, 255, 0.28)' },
  { top: '58%', left: '4%', size: 2, color: 'rgba(57, 255, 20, 0.32)' },
  { top: '76%', left: '35%', size: 2.5, color: 'rgba(255, 7, 58, 0.3)' },
  { top: '89%', left: '11%', size: 2, color: 'rgba(57, 255, 20, 0.34)' },
  { top: '9%', left: '94%', size: 2, color: 'rgba(255, 255, 255, 0.28)' },
  { top: '64%', left: '96%', size: 2.5, color: 'rgba(255, 7, 58, 0.32)' },
];

const DAY_SPECKS = [
  { top: '12%', left: '34%', size: 2.5, color: 'rgba(22, 163, 74, 0.35)' },
  { top: '24%', left: '6%', size: 2.5, color: 'rgba(225, 29, 72, 0.3)' },
  { top: '42%', left: '32%', size: 2, color: 'rgba(51, 65, 85, 0.28)' },
  { top: '58%', left: '4%', size: 2.5, color: 'rgba(22, 163, 74, 0.3)' },
  { top: '76%', left: '35%', size: 2.5, color: 'rgba(225, 29, 72, 0.28)' },
  { top: '89%', left: '11%', size: 2, color: 'rgba(22, 163, 74, 0.32)' },
  { top: '9%', left: '94%', size: 2, color: 'rgba(51, 65, 85, 0.26)' },
  { top: '64%', left: '96%', size: 2.5, color: 'rgba(225, 29, 72, 0.28)' },
];

export function BackgroundDecor() {
  const { isDay } = useSkyTheme();
  const specks = isDay ? DAY_SPECKS : NIGHT_SPECKS;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden mask-[linear-gradient(to_bottom,transparent_0%,black_16%,black_88%,transparent_100%)]"
      aria-hidden="true"
    >
      {/* Subtle atmospheric particles */}
      {specks.map((sp, idx) => (
        <span
          key={idx}
          className="absolute rounded-full transition-colors duration-700"
          style={{
            top: sp.top,
            left: sp.left,
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            backgroundColor: sp.color,
            boxShadow: `0 0 6px ${sp.color}`,
          }}
        />
      ))}
    </div>
  );
}
