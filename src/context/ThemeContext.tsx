import React, { createContext, useContext, useEffect, useState } from 'react';

export type SkyTheme = 'night' | 'day';

const THEME_STORAGE_KEY = 'portfolio-sky-theme';

interface ThemeContextValue {
  theme: SkyTheme;
  isDay: boolean;
  isNight: boolean;
  toggleTheme: () => void;
  setTheme: (next: SkyTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): SkyTheme {
  if (typeof window === 'undefined') return 'night';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'day' || saved === 'night') return saved;
  } catch {
    // Ignore storage access restrictions
  }
  return 'night';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<SkyTheme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    body.classList.add('transition-colors', 'duration-700');

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage access restrictions
    }

    if (theme === 'night') {
      root.classList.add('dark');
      body.classList.remove('bg-[#F4F8FD]', 'text-slate-900');
      body.classList.add('bg-[#000000]', 'text-slate-100');
      if (themeMeta) themeMeta.setAttribute('content', '#000000');
    } else {
      root.classList.remove('dark');
      body.classList.remove('bg-[#000000]', 'text-slate-100');
      body.classList.add('bg-[#F4F8FD]', 'text-slate-900');
      if (themeMeta) themeMeta.setAttribute('content', '#EEF5FC');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'night' ? 'day' : 'night'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDay: theme === 'day',
        isNight: theme === 'night',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useSkyTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useSkyTheme must be used within a ThemeProvider');
  }
  return ctx;
}
