import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronRight, Sparkles, X } from '@/components/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, type LayoutChangeEvent, PanResponder, Platform, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OffBadge } from '@/components/deal-card';
import { GoldButton, GoldFill, GoldNumber, Halo, Lux, Photo, Sky, Ticket } from '@/components/night';
import { AppText, IconButton } from '@/components/ui';
import { type Deal, dealById, shopById } from '@/data/catalog';
import { endsAt, kmLabel, pick, rupees } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, motion, radius, space } from '@/theme/tokens';

const KNOB = 52;
const PHOTO_H = 196;

/** Short counter code: shop initials, price and two check characters, e.g. "ML·69K4". */
export function counterCode(deal: Deal) {
  const shop = shopById[deal.shopId];
  const initials = shop.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  let h = 0;
  for (const c of deal.id) h = (h * 31 + c.charCodeAt(0)) % 1296;
  return `${initials}·${deal.price}${h.toString(36).toUpperCase().padStart(2, '0')}`;
}

export default function ClaimScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deal = dealById[id ?? ''];
  const { state, dispatch, t, haptic } = useStore();
  const insets = useSafeAreaInsets();
  const already = state.orders.some((o) => o.dealId === deal?.id && o.status === 'reserved');
  const [claimed, setClaimed] = useState(already);
  // Done appears a beat after the claim, so the finger lifting off the slider can't tap it.
  const [doneReady, setDoneReady] = useState(already);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    // Web: a sideways swipe on the slider must not become the browser's "swipe back".
    if (Platform.OS !== 'web') return;
    const root = document.documentElement;
    const before = root.style.overscrollBehaviorX;
    root.style.overscrollBehaviorX = 'none';
    document.body.style.overscrollBehaviorX = 'none';
    return () => {
      root.style.overscrollBehaviorX = before;
      document.body.style.overscrollBehaviorX = before;
    };
  }, []);

  // The ticket floats gently; it settles flat once claimed.
  const float = useSharedValue(0);
  useEffect(() => {
    if (reduced || claimed) {
      cancelAnimation(float);
      float.value = withTiming(0, { duration: 300 });
      return;
    }
    float.value = withRepeat(withSequence(withTiming(1, { duration: 1800 }), withTiming(0, { duration: 1800 })), -1);
  }, [reduced, claimed, float]);
  const pop = useSharedValue(1);
  const ticketStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * float.value }, { rotate: claimed ? '0deg' : '-4deg' }, { scale: pop.value }],
  }));

  if (!deal) return null;
  const shop = shopById[deal.shopId];
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const code = counterCode(deal);
  const saved = deal.mrp - deal.price;
  // Before the claim, show what the month total becomes; after it, the order is already counted.
  const monthTotal = state.orders.reduce((s, o) => s + o.saved, 0) + (claimed ? 0 : saved);
  const until = new Date(endsAt(deal)).toLocaleTimeString(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' });
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const complete = () => {
    if (claimed) return;
    setClaimed(true);
    haptic('success');
    dispatch({ type: 'claim', id: deal.id, code });
    setTimeout(() => setDoneReady(true), 700);
    pop.value = withSequence(withSpring(1.06, motion.pop), withSpring(1, motion.pop));
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.s }]}>
      <Sky kind="claim" height={900} />
      <View style={styles.bar}>
        <IconButton icon={X} label={t('close')} size={42} onPress={close} />
        <AppText variant="label" weight="700" tone={color.muted} numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {pick(shop, 'name', 'nameHi', state.lang)} · {kmLabel(shop.km)}
        </AppText>
        <View style={{ width: 42 }} />
      </View>

      <View style={styles.titleRow}>
        <Lux size={44} tone="#D9CFB8">
          {claimed ? t('claimedTitle') : `${t('claimYour')} `}
        </Lux>
        {!claimed && (
          <Lux size={44} tone={color.gold}>
            {t('claimSteal')}
          </Lux>
        )}
      </View>
      <AppText variant="label" tone={color.muted} center style={{ marginTop: 6, paddingHorizontal: space.xxl }}>
        {claimed ? t('claimedBody', { shop: pick(shop, 'name', 'nameHi', state.lang) }) : t('showTicket')}
      </AppText>

      <View style={styles.stage}>
        <Halo colors={[color.orange, color.violet]} style={styles.halo} />
        <Animated.View style={[styles.ticketWrap, ticketStyle]}>
          <Ticket notch={{ axis: 'y', at: PHOTO_H + 18 }} notchR={14} radius={26} colors={['#241C61', '#0F0D30']} border="rgba(246,207,114,0.35)" style={{ flex: 1 }}>
            <View style={styles.photo}>
              <Photo k={deal.image} alt={deal.title} style={StyleSheet.absoluteFill} />
              <OffBadge deal={deal} style={{ position: 'absolute', top: 12, left: 12 }} />
            </View>
            <View style={styles.bottom}>
              <AppText variant="heading" weight="800" numberOfLines={2} style={{ letterSpacing: -0.3 }}>
                {title}
              </AppText>
              <View style={styles.price}>
                <GoldNumber value={rupees(deal.price)} size={30} />
                <AppText variant="label" tone={color.faint} style={{ textDecorationLine: 'line-through' }}>
                  {rupees(deal.mrp)}
                </AppText>
              </View>
              <View style={[styles.code, claimed && styles.codeOn]} accessible accessibilityLabel={`Code ${code.split('').join(' ')}`}>
                <AppText variant="title" weight="800" tone={color.goldLight} style={{ letterSpacing: 5, fontSize: 22 }}>
                  {code}
                </AppText>
              </View>
              <AppText variant="small" tone={color.muted} center style={{ marginTop: 8 }}>
                {t('validTill', { t: until })}
              </AppText>
            </View>
          </Ticket>
        </Animated.View>
        <Spark style={{ left: 30, top: 60 }} size={22} />
        <Spark style={{ right: 28, top: 140 }} size={16} />
        <Spark style={{ left: 40, top: 330 }} size={12} />
        <Spark style={{ right: 44, top: 24 }} size={12} />
      </View>

      <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, space.l) }]}>
        {claimed && !doneReady ? (
          <View style={styles.claimedBar}>
            <Check size={22} color={color.gold} strokeWidth={2.8} />
            <AppText variant="bodyStrong" weight="800" tone={color.gold}>
              {t('claimedTitle')}
            </AppText>
          </View>
        ) : claimed ? (
          <Animated.View entering={FadeIn.duration(220)}>
            <GoldButton label={t('done')} icon={<Check size={20} color={color.onGold} strokeWidth={2.8} />} onPress={close} style={{ minHeight: 60 }} />
          </Animated.View>
        ) : (
          <SlideToClaim label={t('slideToUse')} onComplete={complete} />
        )}
        <AppText variant="small" tone={color.muted} center style={{ marginTop: space.m }}>
          {t('savesAdds', { n: rupees(saved), total: rupees(monthTotal) })}
        </AppText>
      </View>
    </View>
  );
}

function Spark({ style, size }: { style: object; size: number }) {
  return (
    <View pointerEvents="none" style={[styles.spark, style]}>
      <Sparkles size={size} color={color.gold} fill={color.gold} strokeWidth={0} />
    </View>
  );
}

/** Gold slider: drag the knob to the end to use the deal. Tapping the track also works (accessibility). */
function SlideToClaim({ label, onComplete }: { label: string; onComplete: () => void }) {
  const x = useSharedValue(0);
  const [track, setTrack] = useState(0);
  const max = Math.max(track - KNOB - 12, 1);
  const maxRef = useRef(max);
  maxRef.current = max;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4,
        onPanResponderMove: (_, g) => {
          x.value = Math.min(Math.max(g.dx, 0), maxRef.current);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > maxRef.current * 0.82) {
            x.value = withSpring(maxRef.current, motion.press);
            onComplete();
          } else {
            x.value = withSpring(0, motion.sheet);
          }
        },
        onPanResponderTerminate: () => {
          x.value = withSpring(0, motion.sheet);
        },
      }),
    [x, onComplete],
  );

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const text = useAnimatedStyle(() => ({ opacity: 1 - Math.min(x.value / (maxRef.current * 0.7), 1) }));

  return (
    <View
      style={styles.slide}
      onLayout={(e: LayoutChangeEvent) => setTrack(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={onComplete}>
      <GoldFill radius={22} />
      <Animated.View style={[styles.slideText, text]} pointerEvents="none">
        <AppText variant="bodyStrong" weight="800" tone={color.onGold}>
          {label}
        </AppText>
      </Animated.View>
      <Animated.View style={[styles.knob, knob]} {...pan.panHandlers}>
        <ChevronRight size={24} color={color.gold} strokeWidth={2.8} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.paper },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.xl },
  titleRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: space.xl, paddingHorizontal: space.xl },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 440 },
  halo: { top: '6%', bottom: '2%', left: '8%', right: '8%' },
  ticketWrap: { width: 286, height: 418 },
  photo: { height: PHOTO_H, margin: 9, borderRadius: radius.xl, overflow: 'hidden' },
  bottom: { paddingHorizontal: 20, paddingTop: 20 },
  price: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  code: {
    marginTop: 14,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(246,207,114,0.45)',
    backgroundColor: 'rgba(246,207,114,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeOn: { borderStyle: 'solid', borderColor: color.gold, backgroundColor: 'rgba(246,207,114,0.14)' },
  spark: { position: 'absolute' },
  claimedBar: { height: 64, borderRadius: 22, borderWidth: 1.5, borderColor: color.goldLine, backgroundColor: color.goldTint, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  foot: { paddingHorizontal: space.xl },
  slide: {
    touchAction: 'none', // web: the slider owns horizontal touches
    height: 64,
    borderRadius: 22,
    padding: 6,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#F6B446',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  slideText: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingLeft: KNOB },
  knob: { width: KNOB, height: KNOB, borderRadius: 17, backgroundColor: '#1A1200', alignItems: 'center', justifyContent: 'center' },
});
