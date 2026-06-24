import { useUserStore } from '../store/useUserStore';

export const THEMES = {
  DARK: {
    background: '#0F111A',
    surface: '#1E2130',
    surfaceLighter: '#2A2D3E',
    primary: '#00F0FF',
    secondary: '#FF0055',
    accent: '#A020F0',
    text: '#FFFFFF',
    textSecondary: '#A0A0B0',
    success: '#00FF41',
    error: '#FF003C',
    warning: '#FFCC00',
    info: '#00C2FF',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassBackground: 'rgba(255, 255, 255, 0.05)',
    mana: '#00D1FF',
    xp: '#FFD700',
    glitch: '#FF0055',
  },
  LIGHT: {
    background: '#F0F2F5',
    surface: '#FFFFFF',
    surfaceLighter: '#E4E6EB',
    primary: '#0072FF',
    secondary: '#D00036',
    accent: '#6200EE',
    text: '#1C1E21',
    textSecondary: '#65676B',
    success: '#28A745',
    error: '#DC3545',
    warning: '#F7B500',
    info: '#17A2B8',
    glassBorder: 'rgba(0, 0, 0, 0.05)',
    glassBackground: 'rgba(255, 255, 255, 0.8)',
  },
  NATURAL: {
    background: '#FDF6E3',
    surface: '#EEE8D5',
    surfaceLighter: '#E5DFCD',
    primary: '#859900',
    secondary: '#CB4B16',
    accent: '#268BD2',
    text: '#586E75',
    textSecondary: '#93A1A1',
    success: '#2AA198',
    error: '#D33682',
    warning: '#B58900',
    info: '#268BD2',
    glassBorder: 'rgba(88, 110, 117, 0.1)',
    glassBackground: 'rgba(253, 246, 227, 0.7)',
  }
};

export const useAppTheme = () => {
  const themeMode = useUserStore((state) => state.systemSettings.themeMode);
  return THEMES[themeMode] || THEMES.DARK;
};

// Fallback for static components or initial render
export const COLORS = THEMES.DARK;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 999,
};

export const FONTS = {
  bold: 'System',
  medium: 'System',
  regular: 'System',
  light: 'System',
};

export const SHADOWS = {
  neonPrimary: {
    shadowColor: THEMES.DARK.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  neonSecondary: {
    shadowColor: THEMES.DARK.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};
