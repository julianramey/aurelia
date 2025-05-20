import React, { createContext, useContext, ReactNode } from 'react';
import type { TemplateTheme } from '@/lib/types';

// Define a default theme to be used if no provider is found or if needed for initial state.
// This should match the structure of TemplateTheme and provide sensible fallbacks.
const defaultEditorTheme: TemplateTheme = {
  background: '#FFFFFF',
  foreground: '#333333',
  primary: '#007AFF',
  primaryLight: '#5EAEFF',
  secondary: '#8E8E93',
  accent: '#007AFF',
  neutral: '#E5E5EA',
  border: '#D1D1D6',
  font: 'Inter, sans-serif',
};

const ThemeContext = createContext<TemplateTheme>(defaultEditorTheme); // Provide default value here

interface ThemeProviderProps {
  theme: TemplateTheme;
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useEditorTheme = () => {
  const ctx = useContext(ThemeContext);
  // No need to check for !ctx if a default value is provided to createContext
  // However, if you want to ensure it's *only* used within a specific provider,
  // you might still keep a check or ensure the default isn't accidentally used.
  // For simplicity with a default, direct return is fine.
  return ctx;
}; 