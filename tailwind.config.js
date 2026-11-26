/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#1A1A1A',
        'surface-elevated': '#242424',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-hover': 'rgba(57, 255, 20, 0.35)',
        primary: {
          50: '#F0FFE8',
          100: '#D6FFC4',
          400: '#39FF14',
          500: '#39FF14',
          600: '#28D60E',
        },
        cyan: {
          400: '#39FF14',
          500: '#28D60E',
        },
        accent: '#FF073A',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(57, 255, 20, 0.25)',
        'glow-cyan': '0 0 40px -10px rgba(57, 255, 20, 0.25)',
        'glow-amber': '0 0 40px -10px rgba(255, 7, 58, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
