import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BadgeCheck, Bookmark, Clock, Plus, Star, Timer } from '@/components/icons';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { type Deal, shopById } from '@/data/catalog';
import { images } from '@/data/images';
import { endsLabel, isOpen, kmLabel, pctOff, pick, rupees, travel } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, motion, radius, shadow, space } from '@/theme/tokens';

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
        <Bookmark
          size={20}
          strokeWidth={2.2}
          color={saved ? color.orangeStrong : color.ink}
          fill={saved ? color.orangeStrong : 'transparent'}
        />
      </Animated.View>
    </Pressy>
  );
}

/* ---------- Pieces ---------- */

export function OffBadge({ deal, style }: { deal: Deal; style?: object }) {
  const { t } = useStore();
  return (
    <View style={[styles.off, style]}>
      <AppText variant="micro" tone="#FFFFFF">
        {pctOff(deal)}% {t('off')}
      </AppText>
    </View>
  );
}

export function EndsTag({ deal, compact }: { deal: Deal; compact?: boolean }) {
  const { t, state } = useStore();
  const e = endsLabel(deal, t, state.lang);
  const Icon = e.urgent ? Timer : Clock;
  return (
    <View style={[styles.ends, e.urgent && styles.endsUrgent, compact && { paddingHorizontal: 0, backgroundColor: 'transparent' }]}>
      <Icon size={14} strokeWidth={2.4} color={e.urgent ? color.orangeDeep : color.muted} />
      <AppText variant="small" weight="600" tone={e.urgent ? color.orangeDeep : color.muted} numberOfLines={1}>
        {e.text}
      </AppText>
    </View>
  );
}

export function Price({ deal, size = 'l' }: { deal: Deal; size?: 'l' | 'm' }) {
  return (
    <View style={styles.priceRow}>
      <AppText variant={size === 'l' ? 'title' : 'heading'} weight="800">
        {rupees(deal.price)}
      </AppText>
      <AppText variant="small" tone={color.muted} style={textStyles.strike} accessibilityLabel={`MRP ${rupees(deal.mrp)}`}>
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
      <AppText variant="label" tone={color.inkSoft} numberOfLines={1} style={{ flexShrink: 1 }}>
        {pick(shop, 'name', 'nameHi', state.lang)}
      </AppText>
      {shop.verified && <BadgeCheck size={16} color={color.navy} strokeWidth={2.4} />}
    </View>
  );
}

function MetaLine({ deal, showOpen = true }: { deal: Deal; showOpen?: boolean }) {
  const { t } = useStore();
  const shop = shopById[deal.shopId];
  const open = isOpen(shop);
  return (
    <View style={styles.meta}>
      <Star size={14} color={color.star} fill={color.star} strokeWidth={0} />
      <AppText variant="small" weight="700">
        {shop.rating.toFixed(1)}
      </AppText>
      <AppText variant="small" tone={color.muted}>
        {t('reviews', { n: shop.reviews })}
      </AppText>
      <Dot />
      <AppText variant="small" tone={color.inkSoft} weight="600">
        {kmLabel(shop.km)}
      </AppText>
      <Dot />
      <AppText variant="small" tone={color.muted} numberOfLines={1} style={{ flexShrink: 1 }}>
        {travel(shop, t)}
      </AppText>
      {showOpen && !open && (
        <>
          <Dot />
          <AppText variant="small" tone={color.danger} weight="600">
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

/* ---------- Feed card (Home) ---------- */

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
      style={styles.feed}>
      <View style={styles.feedImgWrap}>
        <Image alt={deal.title} source={images[deal.image]} style={styles.feedImg} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
        <OffBadge deal={deal} style={styles.offPos} />
        <View style={styles.savePos}>
          <SaveButton dealId={deal.id} />
        </View>
      </View>
      <View style={styles.feedBody}>
        <ShopLine deal={deal} />
        <AppText variant="heading" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="small" tone={color.muted} numberOfLines={1}>
          {pick(deal, 'unit', 'unitHi', state.lang)}
        </AppText>
        <MetaLine deal={deal} />
        <View style={styles.feedFoot}>
          <View style={{ flex: 1, gap: 2 }}>
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
            <Plus size={18} color={inCart ? color.orangeDeep : '#FFFFFF'} strokeWidth={2.6} />
            <AppText variant="label" weight="700" tone={inCart ? color.orangeDeep : '#FFFFFF'}>
              {inCart ? `${state.cart[deal.id]} ${t('inCart')}` : t('add')}
            </AppText>
          </Pressy>
        </View>
      </View>
    </Pressy>
  );
}

/* ---------- Rail card (horizontal lists) ---------- */

export function RailCard({ deal, width = 212 }: { deal: Deal; width?: number }) {
  const { state } = useStore();
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const shop = shopById[deal.shopId];
  return (
    <Pressy
      onPress={() => openDeal(deal.id)}
      scaleTo={0.97}
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${shop.name}, ${rupees(deal.price)}`}
      style={[styles.rail, { width }]}>
      <View>
        <Image alt={deal.title} source={images[deal.image]} style={styles.railImg} contentFit="cover" transition={200} />
        <OffBadge deal={deal} style={styles.offPosSmall} />
        <View style={styles.savePosSmall}>
          <SaveButton dealId={deal.id} />
        </View>
      </View>
      <View style={{ padding: space.m, gap: 2 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="small" tone={color.inkSoft} numberOfLines={1}>
          {pick(shop, 'name', 'nameHi', state.lang)} · {kmLabel(shop.km)}
        </AppText>
        <View style={[styles.priceRow, { marginTop: 4 }]}>
          <AppText variant="heading" weight="800">
            {rupees(deal.price)}
          </AppText>
          <AppText variant="small" tone={color.muted} style={textStyles.strike}>
            {rupees(deal.mrp)}
          </AppText>
        </View>
        <EndsTag deal={deal} compact />
      </View>
    </Pressy>
  );
}

/* ---------- Row card (History) ---------- */

export function RowCard({ deal, trailing, dim }: { deal: Deal; trailing?: React.ReactNode; dim?: boolean }) {
  const { state } = useStore();
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const shop = shopById[deal.shopId];
  return (
    <Pressy
      onPress={() => openDeal(deal.id)}
      scaleTo={0.985}
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${shop.name}, ${rupees(deal.price)}`}
      style={[styles.row, dim && { opacity: 0.6 }]}>
      <Image alt={deal.title} source={images[deal.image]} style={styles.rowImg} contentFit="cover" transition={200} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong" numberOfLines={2}>
          {title}
        </AppText>
        <AppText variant="small" tone={color.inkSoft} numberOfLines={1}>
          {pick(shop, 'name', 'nameHi', state.lang)} · {kmLabel(shop.km)}
        </AppText>
        <View style={[styles.priceRow, { marginTop: 2 }]}>
          <AppText variant="bodyStrong" weight="800">
            {rupees(deal.price)}
          </AppText>
          <AppText variant="small" tone={color.muted} style={textStyles.strike}>
            {rupees(deal.mrp)}
          </AppText>
          <View style={styles.pctPill}>
            <AppText variant="micro" tone={color.orangeDeep}>
              {pctOff(deal)}%
            </AppText>
          </View>
        </View>
        <EndsTag deal={deal} compact />
      </View>
      {trailing}
    </Pressy>
  );
}

const styles = StyleSheet.create({
  save: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  saveFloat: { backgroundColor: 'rgba(255,255,255,0.94)', ...shadow.card },
  savePlain: { backgroundColor: color.sunk },
  off: {
    backgroundColor: color.orangeStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.s,
  },
  offPos: { position: 'absolute', top: space.m, left: space.m },
  offPosSmall: { position: 'absolute', top: space.s, left: space.s },
  savePos: { position: 'absolute', top: space.s, right: space.s },
  savePosSmall: { position: 'absolute', top: 4, right: 4, transform: [{ scale: 0.9 }] },
  ends: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: color.sunk,
  },
  endsUrgent: { backgroundColor: color.orangeTint },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.s },
  shopLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'nowrap' },
  feed: {
    backgroundColor: color.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
    marginHorizontal: space.xl,
    ...shadow.card,
  },
  feedImgWrap: { aspectRatio: 16 / 9, backgroundColor: color.sunk },
  feedImg: { width: '100%', height: '100%' },
  feedBody: { padding: space.l, gap: 2 },
  feedFoot: { flexDirection: 'row', alignItems: 'flex-end', marginTop: space.m, gap: space.m },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: space.l,
    borderRadius: radius.pill,
    backgroundColor: color.orangeStrong,
  },
  addOn: { backgroundColor: color.orangeTint },
  rail: {
    backgroundColor: color.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
  },
  railImg: { width: '100%', aspectRatio: 4 / 3, backgroundColor: color.sunk },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    padding: space.m,
    backgroundColor: color.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: color.line,
  },
  rowImg: { width: 76, height: 76, borderRadius: radius.m, backgroundColor: color.sunk },
  pctPill: { backgroundColor: color.orangeTint, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.s },
});
