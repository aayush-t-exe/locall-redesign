import { router } from 'expo-router';
import { BadgeCheck, Bookmark, Clock, Navigation, Plus, Star } from '@/components/icons';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { type Deal, shopById } from '@/data/catalog';
import { endsLabel, isOpen, kmLabel, pctOff, pick, rupees, travel } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, motion, radius, space } from '@/theme/tokens';

import { EmberChip, Photo, Ticket } from './night';
import { AppText, Dot, Pressy, textStyles } from './ui';

/* ---------- Save (bookmark) ---------- */

export function SaveButton({ dealId, variant = 'float' }: { dealId: string; variant?: 'float' | 'plain' }) {
  const { state, dispatch, t, haptic, showToast } = useStore();
  const saved = state.saved.some((s) => s.id === dealId);
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  const toggle = () => {
    const index = state.saved.findIndex((x) => x.id === dealId);
    const entry = state.saved[index];
    dispatch({ type: 'toggleSave', id: dealId });
    if (!saved) {
      s.value = withSequence(withSpring(1.35, motion.pop), withSpring(1, motion.pop));
      haptic('success');
      showToast({ message: t('saved'), actionLabel: t('tabHistory'), onAction: () => router.navigate('/history') });
    } else {
      haptic('light');
      showToast({ message: t('removed'), actionLabel: t('undo'), onAction: () => dispatch({ type: 'restoreSaved', entry, index }) });
    }
  };

  return (
    <Pressy
      onPress={toggle}
      scaleTo={0.85}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={saved ? t('removeSaved') : t('saveDeal')}
      style={[styles.save, variant === 'float' ? styles.saveFloat : styles.savePlain]}>
      <Animated.View style={anim}>
        <Bookmark size={19} strokeWidth={2.2} color={saved ? color.gold : color.ink} fill={saved ? color.gold : 'transparent'} />
      </Animated.View>
    </Pressy>
  );
}

/* ---------- Pieces ---------- */

export function OffBadge({ deal, style }: { deal: Deal; style?: object }) {
  const { t } = useStore();
  return (
    <View style={[styles.off, style]}>
      <AppText variant="micro" weight="800" tone={color.onGold}>
        {pctOff(deal)}% {t('off').toUpperCase()}
      </AppText>
    </View>
  );
}

export function EndsTag({ deal, compact }: { deal: Deal; compact?: boolean }) {
  const { t, state, now } = useStore();
  const e = endsLabel(deal, t, state.lang, now);
  if (e.urgent) return <EmberChip label={e.text} />;
  return (
    <View style={[styles.ends, compact && { paddingHorizontal: 0 }]}>
      <Clock size={13} strokeWidth={2.4} color={color.muted} />
      <AppText variant="small" weight="600" tone={color.muted} numberOfLines={1}>
        {e.text}
      </AppText>
    </View>
  );
}

export function Price({ deal, size = 'l' }: { deal: Deal; size?: 'l' | 'm' }) {
  return (
    <View style={styles.priceRow}>
      <AppText variant={size === 'l' ? 'title' : 'heading'} weight="800" tone={color.gold} style={size === 'l' ? { fontSize: 26, lineHeight: 30 } : undefined}>
        {rupees(deal.price)}
      </AppText>
      <AppText variant="small" tone={color.faint} style={textStyles.strike} accessibilityLabel={`MRP ${rupees(deal.mrp)}`}>
        {rupees(deal.mrp)}
      </AppText>
    </View>
  );
}

function ShopLine({ deal }: { deal: Deal }) {
  const { state } = useStore();
  const shop = shopById[deal.shopId];
  return (
    <View style={styles.shopLine}>
      <AppText variant="small" weight="600" tone={color.muted} numberOfLines={1} style={{ flexShrink: 1 }}>
        {pick(shop, 'name', 'nameHi', state.lang)}
      </AppText>
      {shop.verified && <BadgeCheck size={14} color={color.navy} strokeWidth={2.4} />}
    </View>
  );
}

function MetaLine({ deal, showOpen = true }: { deal: Deal; showOpen?: boolean }) {
  const { t } = useStore();
  const shop = shopById[deal.shopId];
  const open = isOpen(shop);
  return (
    <View style={styles.meta}>
      <Star size={13} color={color.star} fill={color.star} strokeWidth={0} />
      <AppText variant="small" weight="700">
        {shop.rating.toFixed(1)}
      </AppText>
      <AppText variant="small" tone={color.muted}>
        {t('reviews', { n: shop.reviews })}
      </AppText>
      <Dot />
      <AppText variant="small" tone={color.inkSoft} weight="600" numberOfLines={1} style={{ flexShrink: 1 }}>
        {kmLabel(shop.km).replace(' ', '\u00A0')} · {travel(shop, t)}
      </AppText>
      {showOpen && !open && (
        <>
          <Dot />
          <AppText variant="small" tone={color.danger} weight="600" numberOfLines={1}>
            {t('closed')}
          </AppText>
        </>
      )}
    </View>
  );
}

function openDeal(id: string) {
  router.push({ pathname: '/deal/[id]', params: { id } });
}

/** Dark fade at the bottom of a photo so text on it stays readable. */
export function Scrim({ from = 0.3 }: { from?: number }) {
  return (
    <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset={from} stopColor={color.paper} stopOpacity={0} />
          <Stop offset="0.95" stopColor={color.paper} stopOpacity={0.95} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#scrim)" />
    </Svg>
  );
}

/* ---------- Feed card (Home): a ticket, photo on top, notches at the seam ---------- */

const FEED_PHOTO = 184;

export function DealCard({ deal }: { deal: Deal }) {
  const { state, dispatch, t, haptic, showToast } = useStore();
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const inCart = !!state.cart[deal.id];
  const shop = shopById[deal.shopId];

  return (
    <Pressy
      onPress={() => openDeal(deal.id)}
      scaleTo={0.985}
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${shop.name}, ${rupees(deal.price)}, ${pctOff(deal)}% off, ${kmLabel(shop.km)}`}
      style={styles.feedWrap}>
      <Ticket notch={{ axis: 'y', at: FEED_PHOTO + 14 }} notchR={12} radius={radius.xl} colors={[color.cardHi, color.card]}>
        <View style={styles.feedImgWrap}>
          <Photo k={deal.image} alt={deal.title} style={styles.feedImg} />
          <OffBadge deal={deal} style={styles.offPos} />
          <View style={styles.distPos}>
            <Navigation size={12} color={color.ink} strokeWidth={2.6} />
            <AppText variant="micro" tone={color.ink}>
              {kmLabel(shop.km)}
            </AppText>
          </View>
          <View style={styles.savePos}>
            <SaveButton dealId={deal.id} />
          </View>
        </View>
        <View style={styles.feedBody}>
          <ShopLine deal={deal} />
          <AppText variant="heading" weight="800" numberOfLines={2} style={{ letterSpacing: -0.3 }}>
            {title}
          </AppText>
          <AppText variant="small" tone={color.muted} numberOfLines={1}>
            {pick(deal, 'unit', 'unitHi', state.lang)}
          </AppText>
          <MetaLine deal={deal} />
          <View style={styles.feedFoot}>
            <View style={{ flex: 1, gap: 6 }}>
              <Price deal={deal} />
              <EndsTag deal={deal} compact />
            </View>
            <Pressy
              onPress={() => {
                dispatch({ type: 'cartAdd', id: deal.id });
                haptic('success');
                showToast({ message: `${title} · ${t('added')}` });
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('addToCart')}: ${title}`}
              scaleTo={0.92}
              style={[styles.add, inCart && styles.addOn]}>
              <Plus size={18} color={inCart ? color.gold : color.onGold} strokeWidth={2.6} />
              <AppText variant="label" weight="800" tone={inCart ? color.gold : color.onGold}>
                {inCart ? `${state.cart[deal.id]} ${t('inCart')}` : t('add')}
              </AppText>
            </Pressy>
          </View>
        </View>
      </Ticket>
    </Pressy>
  );
}

/* ---------- Rail card: tall photo, text on a scrim ---------- */

export function RailCard({ deal, width = 156 }: { deal: Deal; width?: number }) {
  const { state, t, now } = useStore();
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const shop = shopById[deal.shopId];
  const e = endsLabel(deal, t, state.lang, now);
  return (
    <Pressy
      onPress={() => openDeal(deal.id)}
      scaleTo={0.97}
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${shop.name}, ${rupees(deal.price)}`}
      style={[styles.rail, { width }]}>
      <Photo k={deal.image} alt={deal.title} style={StyleSheet.absoluteFill} art={0.5} />
      <Scrim />
      {e.urgent && <EmberChip label={e.text} style={styles.railChip} />}
      <View style={styles.railText}>
        <AppText variant="title" weight="800" tone={color.gold} style={{ fontSize: 22, lineHeight: 26, letterSpacing: -0.6 }}>
          {rupees(deal.price)}
        </AppText>
        <AppText variant="label" weight="700" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="small" tone={color.muted} numberOfLines={1}>
          {pick(shop, 'name', 'nameHi', state.lang)} · {kmLabel(shop.km)}
        </AppText>
      </View>
    </Pressy>
  );
}

/* ---------- Row card (History): a ticket stub, photo | perforation | details ---------- */

const STUB = 96;

export function RowCard({ deal, trailing, dim, glow, ends }: { deal: Deal; trailing?: React.ReactNode; dim?: boolean; glow?: boolean; ends?: boolean }) {
  const { state } = useStore();
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const shop = shopById[deal.shopId];
  return (
    <Pressy
      onPress={() => openDeal(deal.id)}
      scaleTo={0.985}
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${shop.name}, ${rupees(deal.price)}`}
      style={glow ? styles.rowGlow : undefined}>
      <Ticket
        notch={{ axis: 'x', at: STUB }}
        notchR={9}
        radius={radius.l + 2}
        dim={dim}
        border={glow ? 'rgba(255,122,26,0.45)' : 'rgba(255,255,255,0.1)'}
        colors={['#1B1650', '#121037']}
        style={styles.row}>
        <Photo k={deal.image} alt={deal.title} style={[styles.rowImg, dim && { opacity: 0.45 }]} art={0.7} />
        <View style={[styles.rowBody, dim && { opacity: 0.55 }]}>
          <AppText variant="small" weight="600" tone={color.muted} numberOfLines={1}>
            {pick(shop, 'name', 'nameHi', state.lang)} · {kmLabel(shop.km)}
          </AppText>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {title}
          </AppText>
          <View style={[styles.priceRow, { marginTop: 4 }]}>
            <AppText variant="title" weight="800" tone={dim ? color.inkSoft : color.gold} style={{ fontSize: 21, lineHeight: 24, letterSpacing: -0.5 }}>
              {rupees(deal.price)}
            </AppText>
            <AppText variant="small" tone={color.faint} style={textStyles.strike}>
              {rupees(deal.mrp)}
            </AppText>
          </View>
          {ends && (
            <View style={{ marginTop: 6 }}>
              <EndsTag deal={deal} compact />
            </View>
          )}
        </View>
        <View style={styles.rowSide}>{trailing}</View>
      </Ticket>
    </Pressy>
  );
}

const styles = StyleSheet.create({
  save: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  saveFloat: { backgroundColor: 'rgba(5,6,26,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  savePlain: { backgroundColor: 'transparent' },
  off: {
    backgroundColor: color.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  offPos: { position: 'absolute', top: space.m, left: space.m },
  distPos: {
    position: 'absolute',
    left: space.m,
    bottom: space.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(5,6,26,0.66)',
  },
  savePos: { position: 'absolute', top: space.s, right: space.s },
  savePosSmall: { position: 'absolute', top: 6, right: 6, transform: [{ scale: 0.88 }] },
  ends: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.s },
  shopLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'nowrap' },
  feedWrap: { marginHorizontal: space.xl },
  feedImgWrap: { height: FEED_PHOTO, margin: 8, marginBottom: 0, borderRadius: radius.l, overflow: 'hidden', backgroundColor: color.sunk },
  feedImg: { width: '100%', height: '100%' },
  feedBody: { paddingHorizontal: space.l, paddingTop: 26, paddingBottom: space.l, gap: 2 },
  feedFoot: { flexDirection: 'row', alignItems: 'flex-end', marginTop: space.m, gap: space.m },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: space.l,
    borderRadius: radius.pill,
    backgroundColor: color.gold,
  },
  addOn: { backgroundColor: color.goldTint, borderWidth: 1, borderColor: color.goldLine },
  rail: { height: 200, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: color.line, backgroundColor: color.card },
  railChip: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(5,6,26,0.66)' },
  railText: { position: 'absolute', left: 12, right: 12, bottom: 12, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 112 },
  rowGlow: { shadowColor: color.orange, shadowOpacity: 0.55, shadowRadius: 18, shadowOffset: { width: 0, height: 4 }, elevation: 0 },
  rowImg: { width: STUB - 12, height: 100, margin: 6, marginRight: 0, borderRadius: radius.m + 2 },
  rowBody: { flex: 1, paddingLeft: 18, paddingRight: 4, gap: 2, minWidth: 0 },
  rowSide: { paddingRight: 12, alignItems: 'flex-end', gap: 8 },
});
