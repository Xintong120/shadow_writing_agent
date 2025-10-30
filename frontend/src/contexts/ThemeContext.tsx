// Global theme context for Mantine-style runtime theme switching
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sizing, MantineSizingSystem } from '@/styles/sizing';

interface ThemeContextType {
  // Global scale factor for Mantine-style scaling
  scale: number;
  setScale: (scale: number) => void;

  // Complete theme object with dynamic scale applied
  theme: MantineSizingSystem;

  // Utility functions
  getScaledValue: (value: string, customScale?: number) => string;
  updateScaleFromBrowser: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default scale detection based on browser font size
const getBrowserScale = (): number => {
  if (typeof window === 'undefined') return 1;

  try {
    const rootFontSize = getComputedStyle(document.documentElement).fontSize;
    const baseSize = parseFloat(rootFontSize);
    return baseSize / 16; // Based on 16px default
  } catch {
    return 1;
  }
};

// Theme provider component
export function ThemeProvider({
  children,
  defaultScale = 1,
  autoDetectBrowserScale = false
}: {
  children: React.ReactNode;
  defaultScale?: number;
  autoDetectBrowserScale?: boolean;
}) {
  // Initialize scale with browser detection or default
  const initialScale = autoDetectBrowserScale ? getBrowserScale() : defaultScale;

  const [scale, setScaleState] = useState(initialScale);

  // Apply scale to CSS custom property for global scaling
  useEffect(() => {
    document.documentElement.style.setProperty('--mantine-scale', scale.toString());
  }, [scale]);

  // Update scale state with validation
  const setScale = (newScale: number) => {
    // Clamp scale between 0.8 and 1.4 for reasonable bounds
    const clampedScale = Math.max(0.8, Math.min(1.4, newScale));
    setScaleState(clampedScale);
  };

  // Update scale based on current browser font size
  const updateScaleFromBrowser = () => {
    const browserScale = getBrowserScale();
    setScale(browserScale);
  };

  // Get scaled value utility
  const getScaledValue = (value: string, customScale?: number): string => {
    const targetScale = customScale ?? scale;
    const numericValue = parseFloat(value);
    const unit = value.replace(/[0-9.-]/g, '');

    if (isNaN(numericValue)) return value;

    const scaledValue = numericValue * targetScale;
    return `${scaledValue}${unit}`;
  };

  // Complete theme object with current scale applied
  const theme: MantineSizingSystem = {
    ...sizing,
    scale,
  };

  const value: ThemeContextType = {
    scale,
    setScale,
    theme,
    getScaledValue,
    updateScaleFromBrowser,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for scale-only usage (convenience)
export function useScale() {
  const { scale, setScale } = useTheme();
  return { scale, setScale };
}

// HOC for components that need theme access
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ThemeComponent(props: P) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}