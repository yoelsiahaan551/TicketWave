import { Platform, TextStyle } from 'react-native';

/**
 * Standard typography scale matching TicketWave Next.js (Geist Sans / Inter / System)
 * Provides bold, high-contrast, sharp modern typography with proper letter-spacing and line-heights.
 */
export const Typography = {
  fontFamily: Platform.select({
    ios: '-apple-system',
    android: 'sans-serif',
    default: 'system-ui',
  }),
  fontFamilyMono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),

  // Headings
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  } as TextStyle,

  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  } as TextStyle,

  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  } as TextStyle,

  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  } as TextStyle,

  // Body text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } as TextStyle,

  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,

  bodySemibold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  } as TextStyle,

  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  } as TextStyle,

  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  } as TextStyle,

  captionBold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  } as TextStyle,

  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } as TextStyle,

  code: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  } as TextStyle,

  price: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  } as TextStyle,

  brand: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  } as TextStyle,
};
