import React from 'react';
import { TechId } from '../types/project';

interface TechIconProps {
  id: TechId;
  className?: string;
}

export const TechIcon: React.FC<TechIconProps> = ({ id, className = 'w-3.5 h-3.5' }) => {
  switch (id) {
    case 'react':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="2.2" fill="#61DAFB" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            transform="rotate(60 12 12)"
            stroke="#61DAFB"
            strokeWidth="1.5"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            transform="rotate(120 12 12)"
            stroke="#61DAFB"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'typescript':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="#3178C6" />
          <path
            d="M13.5 11.2H10.7V18H8.9V11.2H6.1V9.7H13.5V11.2ZM14.6 17.6V15.9C15.2 16.3 15.9 16.6 16.6 16.6C17.4 16.6 17.8 16.3 17.8 15.8C17.8 15.4 17.5 15.1 16.5 14.7C15.1 14.1 14.5 13.4 14.5 12.2C14.5 10.7 15.6 9.6 17.4 9.6C18.2 9.6 18.8 9.8 19.3 10V11.6C18.8 11.3 18.1 11.1 17.5 11.1C16.8 11.1 16.3 11.4 16.3 11.9C16.3 12.3 16.7 12.6 17.6 13C19.1 13.6 19.7 14.3 19.7 15.6C19.7 17.2 18.5 18.2 16.6 18.2C15.7 18.2 15 17.9 14.6 17.6Z"
            fill="white"
          />
        </svg>
      );

    case 'tailwind':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 6C9.33 6 7.67 7.33 7 10C8 8.67 9.17 8.17 10.5 8.5C11.26 8.69 11.8 9.24 12.4 9.85C13.38 10.84 14.52 12 17 12C19.67 12 21.33 10.67 22 8C21 9.33 19.83 9.83 18.5 9.5C17.74 9.31 17.2 8.76 16.6 8.15C15.62 7.16 14.48 6 12 6ZM7 12C4.33 12 2.67 13.33 2 16C3 14.67 4.17 14.17 5.5 14.5C6.26 14.69 6.8 15.24 7.4 15.85C8.38 16.84 9.52 18 12 18C14.67 18 16.33 16.67 17 14C16 15.33 14.83 15.83 13.5 15.5C12.74 15.31 12.2 14.76 11.6 14.15C10.62 13.16 9.48 12 7 12Z"
            fill="#38BDF8"
          />
        </svg>
      );

    case 'supabase':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M13.3 20.6C12.8 21.2 11.8 20.9 11.8 20.1V13.4H19.1C20 13.4 20.5 14.5 19.9 15.2L13.3 20.6Z"
            fill="#3ECF8E"
          />
          <path
            d="M10.7 3.4C11.2 2.8 12.2 3.1 12.2 3.9V10.6H4.9C4 10.6 3.5 9.5 4.1 8.8L10.7 3.4Z"
            fill="#3ECF8E"
            fillOpacity="0.72"
          />
        </svg>
      );

    case 'nextjs':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="#E4E4E7" strokeWidth="1.5" />
          <path d="M9 15.5V8.5L16.5 18" stroke="#E4E4E7" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15 8.5V13" stroke="#E4E4E7" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'postgres':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <ellipse cx="12" cy="7" rx="7" ry="3" stroke="#60A5FA" strokeWidth="1.5" />
          <path d="M5 7V17C5 18.66 8.13 20 12 20C15.87 20 19 18.66 19 17V7" stroke="#60A5FA" strokeWidth="1.5" />
          <path d="M5 12C5 13.66 8.13 15 12 15C15.87 15 19 13.66 19 12" stroke="#60A5FA" strokeWidth="1.5" />
        </svg>
      );

    case 'motion':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M4 6L10 12L4 18V6Z" fill="#F59E0B" />
          <path d="M11 6L17 12L11 18V6Z" fill="#FBBF24" fillOpacity="0.8" />
          <path d="M18 6V18" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'nodejs':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 2.8L20 7.4V16.6L12 21.2L4 16.6V7.4L12 2.8Z"
            stroke="#4ADE80"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.5" fill="#4ADE80" />
        </svg>
      );

    case 'vite':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M13.5 3L5.5 13.5H11.5L10.5 21L18.5 10.5H12.5L13.5 3Z"
            fill="#FACC15"
          />
        </svg>
      );
  }
};
