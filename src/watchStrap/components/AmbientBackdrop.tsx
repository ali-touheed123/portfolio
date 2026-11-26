import React from 'react';

/**
 * Subtle ambient purple lighting and delicate curved linework matching the
 * dark obsidian portfolio aesthetic without distracting from project cards.
 */
export const AmbientBackdrop: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Deep obsidian base */}
      <div className="absolute inset-0 bg-[#050507]" />

      {/* Top-left subtle purple ambient aura */}
      <div
        className="absolute -top-40 -left-40 h-[540px] w-[540px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(126, 34, 206, 0.16) 0%, rgba(88, 28, 135, 0.05) 48%, transparent 72%)',
        }}
      />

      {/* Right-side / lower-right subtle purple ambient glow behind the strap */}
      <div
        className="absolute top-[12%] -right-32 h-[720px] w-[720px] rounded-full opacity-80"
        style={{
          background:
            'radial-gradient(circle, rgba(109, 40, 217, 0.18) 0%, rgba(76, 29, 149, 0.06) 45%, transparent 72%)',
        }}
      />

      {/* Soft warm counterpoint behind the center focal zone (ultra-subtle) */}
      <div
        className="absolute top-1/2 right-[18%] h-[360px] w-[360px] -translate-y-1/2 rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 90, 31, 0.055) 0%, transparent 68%)',
        }}
      />

      {/* Minimalist decorative purple curves (top-left & bottom-right) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Top-left delicate sweep */}
        <path
          d="M -20 120 C 95 96, 155 48, 195 -20"
          stroke="url(#purpleCurveTop)"
          strokeWidth="1.15"
        />

        {/* Right-edge gentle arc */}
        <path
          d="M 1460 115 C 1340 165, 1315 265, 1370 365"
          stroke="url(#purpleCurveMid)"
          strokeWidth="1"
          strokeOpacity="0.65"
        />

        {/* Bottom-right sweeping arc */}
        <path
          d="M 1110 920 C 1170 795, 1315 760, 1465 655"
          stroke="url(#purpleCurveBottom)"
          strokeWidth="1.2"
        />

        <defs>
          <linearGradient id="purpleCurveTop" x1="0" y1="120" x2="195" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333EA" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="purpleCurveMid" x1="1460" y1="115" x2="1370" y2="365" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333EA" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#7E22CE" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="purpleCurveBottom" x1="1110" y1="920" x2="1465" y2="655" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7E22CE" stopOpacity="0.08" />
            <stop offset="55%" stopColor="#9333EA" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.12" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
