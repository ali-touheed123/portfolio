import React from 'react';
import { useSkyTheme } from '../../context/ThemeContext';

/**
 * Subtle ambient lighting and delicate curved linework matching
 * Day (Soft Sky White + Emerald/Crimson) and Night (Jet Black + Neon Lime/Red) themes.
 */
export const AmbientBackdrop: React.FC = () => {
  const { isDay } = useSkyTheme();

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Canvas base */}
      <div className="absolute inset-0 bg-[#F4F8FD] dark:bg-[#000000] transition-colors duration-700" />

      {/* Top-left subtle Emerald / Neon Lime ambient aura */}
      <div
        className="absolute -top-40 -left-40 h-135 w-135 rounded-full opacity-55 transition-opacity duration-700"
        style={{
          background: isDay
            ? 'radial-gradient(circle, rgba(22, 163, 74, 0.11) 0%, rgba(22, 163, 74, 0.03) 48%, transparent 72%)'
            : 'radial-gradient(circle, rgba(57, 255, 20, 0.14) 0%, rgba(57, 255, 20, 0.04) 48%, transparent 72%)',
        }}
      />

      {/* Right-side / lower-right subtle Crimson / Neon Red ambient glow behind the strap */}
      <div
        className="absolute top-[12%] -right-32 h-180 w-180 rounded-full opacity-75 transition-opacity duration-700"
        style={{
          background: isDay
            ? 'radial-gradient(circle, rgba(225, 29, 72, 0.09) 0%, rgba(225, 29, 72, 0.03) 45%, transparent 72%)'
            : 'radial-gradient(circle, rgba(255, 7, 58, 0.16) 0%, rgba(255, 7, 58, 0.05) 45%, transparent 72%)',
        }}
      />

      {/* Soft center counterpoint */}
      <div
        className="absolute top-1/2 right-[18%] h-90 w-90 -translate-y-1/2 rounded-full opacity-45"
        style={{
          background: isDay
            ? 'radial-gradient(circle, rgba(22, 163, 74, 0.06) 0%, transparent 68%)'
            : 'radial-gradient(circle, rgba(57, 255, 20, 0.065) 0%, transparent 68%)',
        }}
      />

      {/* Minimalist decorative curves (top-left & bottom-right) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M -20 120 C 95 96, 155 48, 195 -20"
          stroke="url(#neonCurveTop)"
          strokeWidth="1.15"
        />

        <path
          d="M 1460 115 C 1340 165, 1315 265, 1370 365"
          stroke="url(#neonCurveMid)"
          strokeWidth="1"
          strokeOpacity="0.65"
        />

        <path
          d="M 1110 920 C 1170 795, 1315 760, 1465 655"
          stroke="url(#neonCurveBottom)"
          strokeWidth="1.2"
        />

        <defs>
          <linearGradient id="neonCurveTop" x1="0" y1="120" x2="195" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDay ? '#16A34A' : '#39FF14'} stopOpacity="0.45" />
            <stop offset="100%" stopColor={isDay ? '#16A34A' : '#39FF14'} stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="neonCurveMid" x1="1460" y1="115" x2="1370" y2="365" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDay ? '#E11D48' : '#FF073A'} stopOpacity="0.34" />
            <stop offset="100%" stopColor={isDay ? '#E11D48' : '#FF073A'} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="neonCurveBottom" x1="1110" y1="920" x2="1465" y2="655" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDay ? '#16A34A' : '#39FF14'} stopOpacity="0.1" />
            <stop offset="55%" stopColor={isDay ? '#E11D48' : '#FF073A'} stopOpacity="0.38" />
            <stop offset="100%" stopColor={isDay ? '#16A34A' : '#39FF14'} stopOpacity="0.14" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
