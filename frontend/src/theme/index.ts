/**
 * SummitQuest design system.
 * Aesthetic: white / green / brown, minimalist, Airbnb-style with soft depth.
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  // Surfaces
  background: '#F7F5F1', // warm paper white
  surface: '#FFFFFF',
  surfaceAlt: '#F1EEE8',

  // Brand greens
  green: '#2F6B4F', // primary forest green
  greenDark: '#234F3B',
  greenSoft: '#5B9A78',
  greenTint: '#E6EFE9', // light green wash

  // Brand browns
  brown: '#7A604A', // earthy brown
  brownDark: '#3A2E26',
  brownSoft: '#A6876E',
  brownTint: '#F0E8DF',

  // Text
  text: '#2B241F',
  textMuted: '#8A7F76',
  textInverse: '#FFFFFF',

  // Utility
  border: '#E8E2D9',
  borderStrong: '#D8CFC2',
  overlay: 'rgba(35, 30, 26, 0.45)',

  // Feedback
  success: '#3B7A57',
  warning: '#C9A24B',
  danger: '#B4543C',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

type FontWeight = TextStyle['fontWeight'];

export const type = {
  display: { fontSize: 40, fontWeight: '800' as FontWeight, letterSpacing: -0.5 },
  h1: { fontSize: 30, fontWeight: '800' as FontWeight, letterSpacing: -0.4 },
  h2: { fontSize: 24, fontWeight: '700' as FontWeight, letterSpacing: -0.3 },
  h3: { fontSize: 19, fontWeight: '700' as FontWeight },
  bodyLg: { fontSize: 17, fontWeight: '500' as FontWeight },
  body: { fontSize: 15, fontWeight: '500' as FontWeight },
  label: { fontSize: 13, fontWeight: '600' as FontWeight, letterSpacing: 0.2 },
  caption: { fontSize: 12, fontWeight: '600' as FontWeight, letterSpacing: 0.3 },
} as const;

/** Soft Airbnb-like elevation. */
export const shadow = (level: 'sm' | 'md' | 'lg' = 'md'): ViewStyle => {
  const map = {
    sm: { radius: 6, y: 2, opacity: 0.08, elevation: 2 },
    md: { radius: 16, y: 6, opacity: 0.1, elevation: 5 },
    lg: { radius: 28, y: 12, opacity: 0.14, elevation: 10 },
  } as const;
  const s = map[level];
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2B241F',
      shadowOffset: { width: 0, height: s.y },
      shadowRadius: s.radius,
      shadowOpacity: s.opacity,
    },
    android: { elevation: s.elevation },
    default: {
      shadowColor: '#2B241F',
      shadowOffset: { width: 0, height: s.y },
      shadowRadius: s.radius,
      shadowOpacity: s.opacity,
    },
  }) as ViewStyle;
};
