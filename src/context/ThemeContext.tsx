import React, { createContext, useContext, useEffect, useState } from 'react';

export type SkyTheme = 'night' | 'day';

interface ThemeContextValue {
  theme: SkyTheme;
  isDay: boolean;
  isNight: boolean;
  toggleTheme: () => void;
  setTheme: (next: SkyTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<SkyTheme>('night');

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    if (theme === 'night') {
      root.classList.add('dark');
      body.classList.remove('bg-[#EEF5FC]', 'text-slate-900');
      body.classList.add('bg-[#070A11]', 'text-slate-100');
      if (themeMeta) themeMeta.setAttribute('content', '#070A11');
    } else {
      root.classList.remove('dark');
      body.classList.remove('bg-[#070A11]', 'text-slate-100');
      body.classList.add('bg-[#EEF5FC]', 'text-slate-900');
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
