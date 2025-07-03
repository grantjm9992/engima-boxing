import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('enigma-theme');
    return (saved as ThemeMode) || 'auto';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Detect time-based theme (6 AM - 6 PM = light, 6 PM - 6 AM = dark)
  const getTimeBasedTheme = (): 'light' | 'dark' => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  };

  // Calculate actual theme based on mode
  const calculateActualTheme = (mode: ThemeMode): 'light' | 'dark' => {
    switch (mode) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'auto':
        // Prefer system theme, fallback to time-based
        const systemTheme = getSystemTheme();
        return systemTheme || getTimeBasedTheme();
      default:
        return 'light';
    }
  };

  // Update actual theme when theme mode changes
  useEffect(() => {
    const newActualTheme = calculateActualTheme(theme);
    setActualTheme(newActualTheme);
    
    // Apply theme to document
    const root = document.documentElement;
    if (newActualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newActualTheme = calculateActualTheme('auto');
        setActualTheme(newActualTheme);
        
        const root = document.documentElement;
        if (newActualTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Listen for time changes when in auto mode (check every minute)
  useEffect(() => {
    if (theme === 'auto') {
      const interval = setInterval(() => {
        const newActualTheme = calculateActualTheme('auto');
        if (newActualTheme !== actualTheme) {
          setActualTheme(newActualTheme);
          
          const root = document.documentElement;
          if (newActualTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [theme, actualTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('enigma-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};