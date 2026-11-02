/**
 * Locall design tokens.
 * Colours are sampled from the Locall logo (navy ribbon + orange pin) and website.
 * Contrast ratios are against `paper` / `card` unless noted.
 */
export const color = {
  // Brand
  orange: '#FF6B00', // logo orange: pins, indicators, decoration. White on it is 2.86:1, so no text on it
  orangeStrong: '#CF4A0C', // buttons + discount badges with white text: 4.53:1
  orangePressed: '#B23F0A',
  orangeText: '#C2410C', // orange for text and icons on white: 5.18:1 (4.99 on paper)
  orangeDeep: '#9A3412', // text on orangeTint: 6.75:1
  orangeTint: '#FFF1E5',
  navy: '#0A2F8F', // brand navy, links and selected states: 11.2:1
  navyTint: '#EAF0FC',

  // Neutrals
  ink: '#0B1F4D', // primary text: 15.4:1
  inkSoft: '#3A4767', // secondary text: 8.9:1
  muted: '#5A6378', // tertiary text: 5.8:1
  faint: '#8A92A6', // decorative / disabled only (3.1:1, never text)
  line: '#EDE3D8',
  lineStrong: '#DCCFC0',
  paper: '#FFFAF5', // app background, warm
  card: '#FFFFFF',
  sunk: '#F6EEE5', // inputs, chips at rest

  // Status
  success: '#15803D', // "Open now", verified: 5.0:1 (4.5 on successTint)
  successTint: '#E8F6EC',
  danger: '#B91C1C',
  dangerTint: '#FDECEC',
  star: '#F5A524',
  whatsapp: '#0E7A41', // darker than WhatsApp green so white text passes: 5.4:1
  overlay: 'rgba(11,31,77,0.45)',
} as const;

export const space = { xxs: 2, xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;

export const radius = { s: 8, m: 12, l: 16, xl: 20, xxl: 28, pill: 999 } as const;

/** Type scale (sp). Body never below 14; primary body 16. */
export const type = {
  display: { size: 28, line: 34, weight: '800' },
  title: { size: 22, line: 28, weight: '800' },
  heading: { size: 18, line: 24, weight: '700' },
  body: { size: 16, line: 24, weight: '500' },
  bodyStrong: { size: 16, line: 22, weight: '700' },
  label: { size: 14, line: 20, weight: '600' },
  small: { size: 13, line: 18, weight: '500' },
  micro: { size: 12, line: 16, weight: '700' },
} as const;

export type TypeVariant = keyof typeof type;

export const shadow = {
  card: {
    shadowColor: '#0B1F4D',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B1F4D',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

export const motion = {
  /** Press feedback: quick, slightly springy. */
  press: { damping: 18, stiffness: 420, mass: 0.6 },
  /** Things that pop in (save, pins). */
  pop: { damping: 11, stiffness: 260, mass: 0.7 },
  /** Sheets and large surfaces. */
  sheet: { damping: 26, stiffness: 260, mass: 0.9 },
  fast: 160,
  base: 240,
} as const;

/** Minimum touch target (Material / WCAG 2.5.8). */
export const TOUCH = 48;
