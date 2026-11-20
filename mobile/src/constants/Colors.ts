export const BrandColors = {
  primary: '#0891B2',
  primaryHover: '#0E7490',
  primarySoft: 'rgba(6, 182, 212, 0.12)',
  cyan: '#06B6D4',
  cyanLight: '#22D3EE',
  cyanSoft: 'rgba(6, 182, 212, 0.14)',
  blueGradientStart: '#0891B2',
  blueGradientEnd: '#06B6D4',
  darkGradientStart: '#0B0F17',
  darkGradientEnd: '#111827',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.14)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.14)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.14)',
  purple: '#A855F7',
  purpleSoft: 'rgba(168, 85, 247, 0.14)',
};

export const DesignTokens = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 24,
    screenPadding: 16,
  },
  heights: {
    input: 48,
    buttonSm: 44,
    buttonMd: 48,
    buttonLg: 50,
    tapTarget: 44,
  },
};

export const ThemePalette = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    tint: BrandColors.primary,
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    inputBg: '#FFFFFF',
    cardShadow: 'rgba(15, 23, 42, 0.05)',
  },
  dark: {
    background: '#0B0F17',
    surface: '#111827',
    surfaceElevated: '#1A2333',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#1E293B',
    borderStrong: '#334155',
    tint: BrandColors.cyanLight,
    tabBar: '#0F172A',
    tabBarBorder: '#1E293B',
    inputBg: '#111827',
    cardShadow: 'rgba(0, 0, 0, 0.35)',
  },
};

export const PublicThemePalette = Object.freeze({
  ...ThemePalette.dark,
});

export type ThemeMode = 'light' | 'dark';
