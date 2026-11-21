const STAR_SPECKS = [
  { top: '12%', left: '34%', size: 2, color: 'rgba(103, 232, 249, 0.38)' },
  { top: '24%', left: '6%', size: 2.5, color: 'rgba(167, 139, 250, 0.35)' },
  { top: '42%', left: '32%', size: 2, color: 'rgba(56, 189, 248, 0.32)' },
  { top: '58%', left: '4%', size: 2, color: 'rgba(192, 132, 252, 0.34)' },
  { top: '76%', left: '35%', size: 2.5, color: 'rgba(34, 211, 238, 0.3)' },
  { top: '89%', left: '11%', size: 2, color: 'rgba(168, 85, 247, 0.36)' },
  { top: '9%', left: '94%', size: 2, color: 'rgba(56, 189, 248, 0.34)' },
  { top: '64%', left: '96%', size: 2.5, color: 'rgba(192, 132, 252, 0.32)' },
];

export function BackgroundDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Subtle atmospheric particles */}
      {STAR_SPECKS.map((sp, idx) => (
        <span
          key={idx}
          className="absolute rounded-full"
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
