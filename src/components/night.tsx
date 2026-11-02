/**
 * Locall Night primitives: the sky glow, photo-or-gold-art slot, notched ticket shape,
 * gold numbers, the serif accent and the eyebrow divider. Drawn with react-native-svg so
 * they look the same on Android, iOS and the web.
 */
import { Image, type ImageStyle } from 'expo-image';
import { type ReactNode, useId, useState } from 'react';
import { type LayoutChangeEvent, Platform, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { artFor, gold3d, type Gold3dKey, type ImageKey, images } from '@/data/images';
import { useStore } from '@/store/store';
import { color, radius as R, serif } from '@/theme/tokens';

import { AppText, fontFor, Pressy } from './ui';

/* ---------- Sky: the soft light at the top of every screen ---------- */

const SKIES = {
  home: [
    { cx: '50%', cy: '0%', rx: '75%', ry: '55%', c: color.violet, o: 0.55 },
    { cx: '88%', cy: '8%', rx: '40%', ry: '28%', c: color.orange, o: 0.16 },
  ],
  history: [
    { cx: '82%', cy: '0%', rx: '70%', ry: '45%', c: color.violet, o: 0.5 },
    { cx: '85%', cy: '12%', rx: '45%', ry: '30%', c: color.gold, o: 0.16 },
  ],
  profile: [
    { cx: '50%', cy: '0%', rx: '80%', ry: '50%', c: color.violet, o: 0.5 },
    { cx: '50%', cy: '32%', rx: '55%', ry: '38%', c: '#F6B446', o: 0.26 },
  ],
  claim: [
    { cx: '50%', cy: '42%', rx: '90%', ry: '55%', c: color.violet, o: 0.45 },
    { cx: '50%', cy: '52%', rx: '60%', ry: '40%', c: color.orange, o: 0.28 },
  ],
} as const;

export function Sky({ kind = 'home', height = 560 }: { kind?: keyof typeof SKIES; height?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <Svg pointerEvents="none" width="100%" height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        {SKIES[kind].map((g, i) => (
          <RadialGradient key={i} id={`${id}${i}`} cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fx={g.cx} fy={g.cy}>
            <Stop offset="0" stopColor={g.c} stopOpacity={g.o} />
            <Stop offset="0.5" stopColor={g.c} stopOpacity={g.o * 0.3} />
            <Stop offset="1" stopColor={g.c} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {SKIES[kind].map((_, i) => (
        <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#${id}${i})`} />
      ))}
    </Svg>
  );
}

/** A soft coloured halo behind one hero object. */
export function Halo({ colors = [color.orange, color.violet], style }: { colors?: [string, string]; style?: StyleProp<ViewStyle> }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={`${id}a`} cx="36%" cy="56%" rx="34%" ry="42%">
            <Stop offset="0" stopColor={colors[0]} stopOpacity={0.55} />
            <Stop offset="1" stopColor={colors[0]} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`${id}b`} cx="64%" cy="44%" rx="34%" ry="42%">
            <Stop offset="0" stopColor={colors[1]} stopOpacity={0.6} />
            <Stop offset="1" stopColor={colors[1]} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id}a)`} />
        <Rect width="100%" height="100%" fill={`url(#${id}b)`} />
      </Svg>
    </View>
  );
}

/* ---------- Photo, or gold 3D art when no photo has been supplied ---------- */

export function Photo({ k, alt, style, art = 0.62 }: { k: ImageKey; alt: string; style?: StyleProp<ImageStyle>; art?: number }) {
  const src = images[k];
  // On the web, expo-image's cross-fade adds a second <img> without the alt, so the fade is native-only.
  // expo-image on the web writes the <img> alt from accessibilityLabel, so pass both.
  if (src) return <Image alt={alt} accessibilityLabel={alt} source={src} style={style} contentFit="cover" transition={Platform.OS === 'web' ? undefined : 200} accessibilityIgnoresInvertColors />;
  return <GoldArt icon={artFor[k]} alt={alt} style={style as StyleProp<ViewStyle>} scale={art} />;
}

export function GoldArt({ icon, alt, style, scale = 0.62 }: { icon: Gold3dKey; alt?: string; style?: StyleProp<ViewStyle>; scale?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [box, setBox] = useState(0);
  return (
    <View
      style={[{ overflow: 'hidden', backgroundColor: color.cardHi }, style]}
      onLayout={(e) => setBox(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height))}
      accessible={!!alt}
      accessibilityLabel={alt}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="45%" rx="65%" ry="65%">
            <Stop offset="0" stopColor="#3A2E8F" />
            <Stop offset="0.55" stopColor="#1A1650" />
            <Stop offset="1" stopColor="#0E0D2C" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {box > 0 && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Gold3D k={icon} size={box * scale} />
        </View>
      )}
    </View>
  );
}

/** Decorative gold 3D object. Hidden from screen readers: the label next to it says what it is. */
export function Gold3D({ k, size, style }: { k: Gold3dKey; size: number; style?: StyleProp<ImageStyle> }) {
  return (
    <View aria-hidden style={style as StyleProp<ViewStyle>} pointerEvents="none">
      <Image source={gold3d[k]} style={{ width: size, height: size }} contentFit="contain" alt="" accessible={false} />
    </View>
  );
}

/* ---------- Ticket: a rounded card with real notches and a perforation ---------- */

type Notch = { axis: 'x' | 'y'; at: number };

function ticketPath(w: number, h: number, r: number, n: number, notch: Notch) {
  const { axis, at } = notch;
  if (axis === 'x') {
    return [
      `M${r},0`, `H${at - n}`, `A${n},${n} 0 0 0 ${at + n},0`, `H${w - r}`, `A${r},${r} 0 0 1 ${w},${r}`,
      `V${h - r}`, `A${r},${r} 0 0 1 ${w - r},${h}`, `H${at + n}`, `A${n},${n} 0 0 0 ${at - n},${h}`,
      `H${r}`, `A${r},${r} 0 0 1 0,${h - r}`, `V${r}`, `A${r},${r} 0 0 1 ${r},0`, 'Z',
    ].join(' ');
  }
  return [
    `M${r},0`, `H${w - r}`, `A${r},${r} 0 0 1 ${w},${r}`, `V${at - n}`, `A${n},${n} 0 0 0 ${w},${at + n}`,
    `V${h - r}`, `A${r},${r} 0 0 1 ${w - r},${h}`, `H${r}`, `A${r},${r} 0 0 1 0,${h - r}`,
    `V${at + n}`, `A${n},${n} 0 0 0 0,${at - n}`, `V${r}`, `A${r},${r} 0 0 1 ${r},0`, 'Z',
  ].join(' ');
}

export function Ticket({
  notch,
  height,
  radius = R.xl,
  notchR = 11,
  colors = ['#211A5A', '#100E30'],
  border = 'rgba(255,255,255,0.12)',
  perforation = true,
  dim,
  style,
  children,
}: {
  notch: Notch;
  height?: number;
  radius?: number;
  notchR?: number;
  colors?: [string, string];
  border?: string;
  perforation?: boolean;
  dim?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    if (!size || size.w !== width || size.h !== h) setSize({ w: width, h });
  };
  const span = size ? (notch.axis === 'x' ? size.w : size.h) : 0;
  // `at` in px from the start, negative = from the end, 0..1 = a fraction of the length.
  const at = notch.at < 0 ? span + notch.at : notch.at <= 1 ? span * notch.at : notch.at;
  return (
    <View onLayout={onLayout} style={[{ height }, style]}>
      {size && (
        <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={dim ? '#141432' : colors[0]} />
              <Stop offset="1" stopColor={dim ? '#0C0C24' : colors[1]} />
            </LinearGradient>
          </Defs>
          <Path d={ticketPath(size.w, size.h, radius, notchR, { axis: notch.axis, at: at ?? 0 })} fill={`url(#${id})`} stroke={border} strokeWidth={1} />
          {perforation &&
            (notch.axis === 'x' ? (
              <Line x1={at} y1={notchR + 6} x2={at} y2={size.h - notchR - 6} stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeDasharray="5 5" />
            ) : (
              <Line x1={notchR + 6} y1={at} x2={size.w - notchR - 6} y2={at} stroke="rgba(255,255,255,0.22)" strokeWidth={2} strokeDasharray="5 5" />
            ))}
        </Svg>
      )}
      {children}
    </View>
  );
}

/* ---------- Gold number: money is always gold ---------- */

export function GoldNumber({ value, size = 40, style, accessibilityLabel }: { value: string; size?: number; style?: StyleProp<ViewStyle>; accessibilityLabel?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const w = Math.ceil(value.length * size * 0.64 + size * 0.1);
  const h = Math.ceil(size * 1.12);
  return (
    <View style={style} accessible accessibilityLabel={accessibilityLabel ?? value}>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF3CF" />
            <Stop offset="0.4" stopColor="#F6CF72" />
            <Stop offset="0.75" stopColor="#D99A33" />
            <Stop offset="1" stopColor="#A8681A" />
          </LinearGradient>
        </Defs>
        <SvgText x={0} y={size * 0.93} fontSize={size} fontFamily="PlusJakartaSans_800ExtraBold" letterSpacing={-size * 0.04} fill={`url(#${id})`}>
          {value}
        </SvgText>
      </Svg>
    </View>
  );
}

/* ---------- Serif accent ---------- */

export function Lux({ children, size = 22, tone = '#D9CFB8', style }: { children: ReactNode; size?: number; tone?: string; style?: object }) {
  const { state } = useStore();
  // Instrument Serif has no Devanagari; Hindi keeps the Noto face.
  const fontFamily = state.lang === 'hi' ? fontFor('500', 'hi') : serif.italic;
  return <Text style={[{ fontFamily, fontSize: size, lineHeight: Math.round(size * 1.2), color: tone }, style]}>{children}</Text>;
}

/* ---------- Eyebrow divider: ——— TONIGHT'S STEAL ——— ---------- */

export function Eyebrow({ label, align = 'center', tone = color.muted, dot, style }: { label: string; align?: 'center' | 'left'; tone?: string; dot?: boolean; style?: StyleProp<ViewStyle> }) {
  const { state } = useStore();
  // Wide tracking splits Devanagari conjuncts and matras, so Hindi keeps normal spacing.
  const hi = state.lang === 'hi';
  return (
    <View style={[styles.eyebrow, style]} accessibilityRole="header">
      {align === 'center' && <View style={[styles.hair, { opacity: 0.6 }]} />}
      {dot && <View style={styles.dot} />}
      <AppText variant={hi ? 'small' : 'micro'} weight="700" tone={tone} style={!hi && styles.eyebrowText}>
        {hi ? label : label.toUpperCase()}
      </AppText>
      <View style={[styles.hair, { opacity: 0.6 }]} />
    </View>
  );
}

/* ---------- Pills and buttons ---------- */

export function EmberChip({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.ember, style]}>
      <View style={styles.dot} />
      <AppText variant="micro" tone={color.orangeText} style={{ letterSpacing: 0.4 }} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

export function GoldButton({ label, onPress, icon, style, accessibilityHint }: { label: string; onPress?: () => void; icon?: ReactNode; style?: StyleProp<ViewStyle>; accessibilityHint?: string }) {
  return (
    <Pressy onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={accessibilityHint} style={[styles.goldBtn, style]}>
      <GoldFill radius={R.pill} />
      {icon ? <View>{icon}</View> : null}
      <AppText variant="bodyStrong" weight="800" tone={color.onGold} numberOfLines={1}>
        {label}
      </AppText>
    </Pressy>
  );
}

/** Gold gradient fill for any rounded surface (absolute, behind content). */
export function GoldFill({ radius = R.l }: { radius?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF3CF" />
            <Stop offset="0.45" stopColor="#F6CF72" />
            <Stop offset="1" stopColor="#D99A33" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

export function GlowEllipse({ w, h, c = color.gold, o = 0.18, style }: { w: number; h: number; c?: string; o?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={w} height={h} style={style} pointerEvents="none">
      <Ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 1} ry={h / 2 - 1} stroke={c} strokeOpacity={o} strokeWidth={1} fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  hair: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.16)' },
  eyebrowText: { letterSpacing: 2.6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.orange, shadowColor: color.orange, shadowOpacity: 0.9, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  ember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    height: 26,
    paddingHorizontal: 10,
    borderRadius: R.pill,
    backgroundColor: color.orangeTint,
    borderWidth: 1,
    borderColor: 'rgba(255,122,26,0.3)',
  },
  goldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: R.pill,
    overflow: 'hidden',
    shadowColor: '#F6B446',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
