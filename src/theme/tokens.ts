/**
 * Locall Night design tokens.
 * Deep navy night (the logo's navy taken to its darkest), brand orange as warm light,
 * gold for money. One glowing object per screen. Contrast ratios are against `paper`.
 * Key names are kept from v1 so every screen picks up the palette.
 */
export const color = {
  // Brand light
  orange: '#FF7A1A', // ember: dots, glows, the % OFF badge fill (dark text on it: 7.9:1)
  orangeStrong: '#FF7A1A',
  orangePressed: '#E0640D',
  orangeText: '#FFB27A', // ember text on night: 10.6:1
  orangeDeep: '#FFB27A',
  orangeTint: 'rgba(255,122,26,0.14)',
  navy: '#A9B6FF', // links and selected states on night: 9.4:1
  navyTint: 'rgba(91,75,255,0.16)',

  // Gold: money, active states, the one glowing object
  gold: '#F6CF72', // 13.1:1
  goldLight: '#FFF3CF',
  goldDeep: '#D99A33',
  goldTint: 'rgba(246,207,114,0.14)',
  goldLine: 'rgba(246,207,114,0.32)',
  onGold: '#1C1200', // text on gold fills

  // Night
  violet: '#5B4BFF',
  blue: '#2F55FF',

  // Neutrals
  ink: '#F6F3EC', // primary text: 18.2:1
  inkSoft: '#D3D1E3', // secondary text: 13.4:1
  muted: '#A3A3BE', // tertiary text: 7.9:1
  faint: '#6E6E8C', // decorative / disabled only
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',
  paper: '#05061A', // app background
  card: '#0F1030', // raised surfaces
  cardHi: '#171746', // ticket tops, highlighted surfaces
  sunk: 'rgba(255,255,255,0.06)', // inputs, chips at rest, glass

  // Status
  success: '#5BE3A8',
  successTint: 'rgba(91,227,168,0.12)',
  danger: '#FF8A8A',
  dangerTint: 'rgba(255,90,90,0.12)',
  star: '#F6CF72',
  whatsapp: '#1F9D57',
  overlay: 'rgba(2,3,12,0.72)',
} as const;

export const space = { xxs: 2, xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;

export const radius = { s: 8, m: 12, l: 16, xl: 20, xxl: 28, pill: 999 } as const;

/** Type scale (sp). Body never below 14; primary body 16. */
export const type = {
  display: { size: 30, line: 36, weight: '800' },
  title: { size: 22, line: 28, weight: '800' },
  heading: { size: 18, line: 24, weight: '700' },
  body: { size: 16, line: 24, weight: '500' },
  bodyStrong: { size: 16, line: 22, weight: '700' },
  label: { size: 14, line: 20, weight: '600' },
  small: { size: 13, line: 18, weight: '500' },
  micro: { size: 12, line: 16, weight: '700' },
} as const;

export type TypeVariant = keyof typeof type;

/** Serif accent for the luxe words ("your saved steals", "you saved"). Latin only. */
export const serif = { regular: 'InstrumentSerif_400Regular', italic: 'InstrumentSerif_400Regular_Italic' } as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  glowGold: {
    shadowColor: '#F6CF72',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
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
