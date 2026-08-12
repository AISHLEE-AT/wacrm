/**
 * Centralized design tokens for SuprO Mobile App.
 * All new components should import from here instead of hardcoding colors.
 */

export const colors = {
  // Backgrounds
  background: '#0a0f1e',
  card: '#111827',
  cardBorder: 'rgba(52, 211, 153, 0.2)',
  inputBg: '#0f172a',

  // Primary
  primary: '#10b981',
  primaryLight: 'rgba(16, 185, 129, 0.1)',
  primaryBorder: 'rgba(16, 185, 129, 0.3)',

  // Accent
  accent: '#3b82f6',
  accentLight: 'rgba(59, 130, 246, 0.1)',

  // Status
  destructive: '#ef4444',
  destructiveLight: 'rgba(239, 68, 68, 0.1)',
  destructiveBorder: 'rgba(239, 68, 68, 0.3)',
  amber: '#eab308',
  amberLight: 'rgba(234, 179, 8, 0.1)',
  amberBorder: 'rgba(234, 179, 8, 0.3)',
  purple: '#8b5cf6',
  purpleLight: 'rgba(139, 92, 246, 0.1)',
  emerald: '#10b981',
  emeraldLight: 'rgba(16, 185, 129, 0.1)',
  emeraldBorder: 'rgba(16, 185, 129, 0.3)',

  // Rose/gradient
  rose: '#f43f5e',
  roseLight: 'rgba(244, 63, 94, 0.1)',

  // WhatsApp
  whatsapp: '#25D366',
  whatsappDark: '#20bd5a',

  // Text
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#475569',

  // Borders
  border: '#334155',
  borderLight: 'rgba(51, 65, 85, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  hero: 28,
};

/**
 * Available accent themes — mirrors web app's THEMES array.
 * Each theme provides a primary swatch color.
 */
export const ACCENT_THEMES = [
  { id: 'emerald', name: 'Emerald', swatch: '#10b981', tagline: 'Fresh & natural' },
  { id: 'blue', name: 'Ocean Blue', swatch: '#3b82f6', tagline: 'Clean & professional' },
  { id: 'violet', name: 'Violet', swatch: '#8b5cf6', tagline: 'Creative & bold' },
  { id: 'rose', name: 'Rose', swatch: '#f43f5e', tagline: 'Warm & energetic' },
  { id: 'amber', name: 'Amber', swatch: '#f59e0b', tagline: 'Optimistic & sunny' },
  { id: 'cyan', name: 'Cyan', swatch: '#06b6d4', tagline: 'Cool & modern' },
  { id: 'pink', name: 'Pink', swatch: '#ec4899', tagline: 'Playful & lively' },
  { id: 'teal', name: 'Teal', swatch: '#14b8a6', tagline: 'Balanced & calm' },
] as const;

export type AccentThemeId = typeof ACCENT_THEMES[number]['id'];
export type ThemeMode = 'light' | 'dark';

export const applyThemeToGlobalColors = (accentId: string) => {
  const theme = ACCENT_THEMES.find((t) => t.id === accentId) || ACCENT_THEMES[0];
  
  colors.primary = theme.swatch;
  colors.accent = theme.swatch;
  
  const hex = theme.swatch.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  colors.primaryLight = `rgba(${r}, ${g}, ${b}, 0.1)`;
  colors.primaryBorder = `rgba(${r}, ${g}, ${b}, 0.3)`;
  colors.accentLight = `rgba(${r}, ${g}, ${b}, 0.1)`;
};
