import { type LucideIcon } from '@/components/icons';
import { type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useStore } from '@/store/store';
import { color, motion, radius, space, TOUCH, type TypeVariant, type } from '@/theme/tokens';

/* ---------- Text ---------- */

const LATIN: Record<string, string> = {
  '400': 'PlusJakartaSans_500Medium',
  '500': 'PlusJakartaSans_500Medium',
  '600': 'PlusJakartaSans_600SemiBold',
  '700': 'PlusJakartaSans_700Bold',
  '800': 'PlusJakartaSans_800ExtraBold',
};
const DEVANAGARI: Record<string, string> = {
  '400': 'NotoSansDevanagari_400Regular',
  '500': 'NotoSansDevanagari_500Medium',
  '600': 'NotoSansDevanagari_600SemiBold',
  '700': 'NotoSansDevanagari_700Bold',
  '800': 'NotoSansDevanagari_700Bold',
};

export function fontFor(weight: string, lang: 'en' | 'hi') {
  return (lang === 'hi' ? DEVANAGARI : LATIN)[weight] ?? LATIN['500'];
}

type AppTextProps = TextProps & {
  variant?: TypeVariant;
  tone?: string;
  weight?: '400' | '500' | '600' | '700' | '800';
  center?: boolean;
};

export function AppText({ variant = 'body', tone = color.ink, weight, center, style, ...rest }: AppTextProps) {
  const { state } = useStore();
  const v = type[variant];
  const w = weight ?? v.weight;
  // Devanagari needs extra line height for matras.
  const lineHeight = state.lang === 'hi' ? Math.round(v.line * 1.18) : v.line;
  return (
    <Text
      maxFontSizeMultiplier={2}
      {...rest}
      style={[
        { fontFamily: fontFor(w, state.lang), fontSize: v.size, lineHeight, color: tone },
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}

/* ---------- Press feedback ---------- */

type PressyProps = PressableProps & { style?: StyleProp<ViewStyle>; scaleTo?: number; children?: ReactNode };

/** Pressable that squishes slightly with a spring. Every tappable surface uses it. */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Pressy({ style, scaleTo = 0.97, children, onPressIn, onPressOut, ...rest }: PressyProps) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        s.value = withSpring(scaleTo, motion.press);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, motion.press);
        onPressOut?.(e);
      }}
      style={[style, anim]}>
      {children}
    </AnimatedPressable>
  );
}

/* ---------- Buttons ---------- */

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: LucideIcon;
  kind?: 'primary' | 'secondary' | 'ghost' | 'whatsapp';
  size?: 'm' | 'l';
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({ label, onPress, icon: Icon, kind = 'primary', size = 'm', full, style, accessibilityHint }: ButtonProps) {
  const bg = { primary: color.orangeStrong, secondary: color.card, ghost: 'transparent', whatsapp: color.whatsapp }[kind];
  const fg = { primary: '#FFFFFF', secondary: color.ink, ghost: color.orangeText, whatsapp: '#FFFFFF' }[kind];
  const border = kind === 'secondary' ? color.lineStrong : 'transparent';
  return (
    <Pressy
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border, minHeight: size === 'l' ? 56 : TOUCH },
        full && { alignSelf: 'stretch' },
        style,
      ]}>
      {Icon && <Icon size={20} color={fg} strokeWidth={2.2} />}
      <AppText variant="bodyStrong" tone={fg} numberOfLines={1}>
        {label}
      </AppText>
    </Pressy>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onPress,
  badge,
  tone = color.ink,
  bg = color.card,
  size = TOUCH,
}: {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  badge?: number;
  tone?: string;
  bg?: string;
  size?: number;
}) {
  return (
    <Pressy
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge}` : label}
      scaleTo={0.9}
      hitSlop={6}
      style={[styles.iconBtn, { width: size, height: size, backgroundColor: bg }]}>
      <Icon size={22} color={tone} strokeWidth={2} />
      {!!badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressy>
  );
}

/* ---------- Chip ---------- */

export function Chip({
  label,
  selected,
  onPress,
  icon: Icon,
  trailing: Trailing,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  trailing?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = selected ? '#FFFFFF' : color.ink;
  return (
    <Pressy
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.chip, selected ? styles.chipOn : styles.chipOff, style]}>
      {Icon && <Icon size={16} color={selected ? '#FFFFFF' : color.orangeText} strokeWidth={2.4} />}
      <AppText variant="label" tone={fg} numberOfLines={1}>
        {label}
      </AppText>
      {Trailing && <Trailing size={16} color={fg} strokeWidth={2.4} />}
    </Pressy>
  );
}

/* ---------- Section header ---------- */

export function SectionHeader({ title, action, onAction, sub }: { title: string; action?: string; onAction?: () => void; sub?: string }) {
  return (
    <View style={styles.section}>
      <View style={{ flex: 1 }}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {sub ? (
          <AppText variant="small" tone={color.muted}>
            {sub}
          </AppText>
        ) : null}
      </View>
      {action && (
        <Pressable onPress={onAction} hitSlop={12} accessibilityRole="button" style={styles.sectionAction}>
          <AppText variant="label" tone={color.orangeText}>
            {action}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<K extends string>({
  items,
  value,
  onChange,
}: {
  items: { key: K; label: string; count?: number }[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <View style={styles.seg} accessibilityRole="tablist">
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange(it.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.segItem, on && styles.segItemOn]}>
            <AppText variant="label" tone={on ? color.ink : color.muted} weight={on ? '700' : '600'} numberOfLines={1}>
              {it.label}
              {it.count != null ? ` ${it.count}` : ''}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  onAction,
  style,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.empty, style]}>
      <View style={styles.emptyIcon}>
        <Icon size={28} color={color.orangeText} strokeWidth={2} />
      </View>
      <AppText variant="heading" center>
        {title}
      </AppText>
      <AppText variant="body" tone={color.muted} center style={{ maxWidth: 300 }}>
        {body}
      </AppText>
      {action && <Button label={action} onPress={onAction} style={{ marginTop: space.s }} />}
    </View>
  );
}

/* ---------- Small pieces ---------- */

export function Dot() {
  return <View style={styles.dot} />;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export const textStyles = StyleSheet.create({
  strike: { textDecorationLine: 'line-through' } as TextStyle,
});

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: color.orangeStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.paper,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  chipOff: { backgroundColor: color.card, borderColor: color.line },
  chipOn: { backgroundColor: color.ink, borderColor: color.ink },
  section: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: space.xl, marginBottom: space.m, gap: space.m },
  sectionAction: { minHeight: 32, justifyContent: 'center' },
  seg: {
    flexDirection: 'row',
    backgroundColor: color.sunk,
    borderRadius: radius.pill,
    padding: 4,
  },
  segItem: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: space.s },
  segItemOn: {
    backgroundColor: color.card,
    shadowColor: '#0B1F4D',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  empty: { alignItems: 'center', gap: space.s, paddingVertical: space.huge, paddingHorizontal: space.xxl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.s,
  },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: color.faint, marginHorizontal: 6 },
  card: {
    backgroundColor: color.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.line,
  },
});
