import { router } from 'expo-router';
import { ArrowUpDown, BadgeCheck, ChevronDown, Clock, MapPin, Mic, Navigation, Search, SearchX, ShoppingBag } from '@/components/icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DealCard, OffBadge, RailCard } from '@/components/deal-card';
import { EmberChip, Eyebrow, Gold3D, GoldNumber, Halo, Lux, Photo, Sky, Ticket } from '@/components/night';
import { RadiusSheet } from '@/components/radius-sheet';
import { AreaSheet, CartSheet } from '@/components/sheets';
import { useDockSpace } from '@/components/tab-bar';
import { AppText, Chip, EmptyState, IconButton, Pressy } from '@/components/ui';
import { AREAS, CATEGORIES, type Category, type Deal, DEMO_USER, shopById } from '@/data/catalog';
import { type Gold3dKey, images } from '@/data/images';
import { endsLabel, hoursLeft, kmLabel, pctOff, pick, rupees } from '@/lib/format';
import { endingToday, filterDeals, liveDeals } from '@/lib/query';
import { type StringKey } from '@/i18n/strings';
import { useStore } from '@/store/store';
import { color, radius, space } from '@/theme/tokens';

const SPOTLIGHT = 'navneet-kirana';

type Sort = 'near' | 'big' | 'rating';
type Shortcut = { key: string; icon: Gold3dKey; label: StringKey };

const SHORTCUTS: Shortcut[] = [
  { key: 'food', icon: 'teaCup', label: 'shortFood' },
  { key: 'sweets', icon: 'candy', label: 'shortSweets' },
  { key: 'grocery', icon: 'bag', label: 'shortKirana' },
  { key: 'salon', icon: 'scissor', label: 'shortSalon' },
  { key: 'gifts', icon: 'giftBox', label: 'shortGifts' },
  { key: 'open', icon: 'fire', label: 'shortOpen' },
  { key: 'top', icon: 'star', label: 'shortTop' },
  { key: 'near', icon: 'mapPin', label: 'shortNear' },
];

/** First two words, so long shop names wrap at a word, not mid-word. */
const shortName = (name: string) => name.split(' ').slice(0, 2).join(' ').replace(/[&,]$/, '');

/** Tonight's steal: the best live deal nearby that has a photo, ending soonest. */
function pickSteal(list: Deal[]) {
  const withPhoto = list.filter((d) => images[d.image]);
  const pool = withPhoto.length ? withPhoto : list;
  const soon = pool.filter((d) => hoursLeft(d) < 12);
  return (soon.length ? soon : pool).slice().sort((a, b) => pctOff(b) - pctOff(a))[0];
}

export default function Home() {
  const { state, dispatch, t, haptic } = useStore();
  const insets = useSafeAreaInsets();
  const dock = useDockSpace();
  const [sheet, setSheet] = useState<'radius' | 'area' | 'cart' | null>(null);
  const [sort, setSort] = useState<Sort>('near');

  const nearby = useMemo(() => filterDeals(state), [state]);
  const feed = useMemo(() => {
    if (sort === 'big') return [...nearby].sort((a, b) => b.mrp - b.price - (a.mrp - a.price));
    if (sort === 'rating') return [...nearby].sort((a, b) => shopById[b.shopId].rating - shopById[a.shopId].rating);
    return nearby;
  }, [nearby, sort]);
  const steal = useMemo(() => pickSteal(filterDeals({ ...state, category: 'all', openNow: false })), [state]);
  const ending = useMemo(() => endingToday(state.radius).filter((d) => d.id !== steal?.id), [state.radius, steal]);
  const followed = state.following.map((id) => shopById[id]).filter(Boolean);
  const cartCount = Object.values(state.cart).reduce((a, b) => a + b, 0);
  const area = AREAS[state.area];
  const nextRadius = state.radius === 0 ? 0 : ([3, 5, 10, 20, 0] as const).find((r) => r === 0 || r > state.radius) ?? 0;
  const spot = shopById[SPOTLIGHT];
  const liveByShop = useMemo(() => new Set(liveDeals().map((d) => d.shopId)), []);
  const initials = DEMO_USER.name.split(' ').map((p) => p[0]).join('');
  const home = state.category === 'all';

  const setCategory = (c: 'all' | Category) => {
    dispatch({ type: 'set', patch: { category: state.category === c ? 'all' : c } });
    haptic('select');
  };

  const onShortcut = (k: string) => {
    haptic('select');
    if (k === 'food' || k === 'grocery' || k === 'salon') return setCategory(k);
    if (k === 'sweets') return router.push({ pathname: '/search', params: { q: 'sweets' } });
    if (k === 'gifts') return router.push({ pathname: '/search', params: { q: 'gift box' } });
    if (k === 'open') return dispatch({ type: 'set', patch: { openNow: !state.openNow } });
    if (k === 'top') return setSort((s) => (s === 'rating' ? 'near' : 'rating'));
    if (k === 'near') return setSheet('radius');
  };
  const shortcutOn = (k: string) =>
    k === state.category || (k === 'open' && state.openNow) || (k === 'top' && sort === 'rating');

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.s, paddingBottom: dock }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[4]}>
        <Sky kind="home" />

        {/* 1. Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setSheet('area')}
            style={styles.area}
            accessibilityRole="button"
            accessibilityLabel={`${t('deliverTo')}: ${area.name}`}
            hitSlop={6}>
            <View style={styles.areaLine}>
              <AppText variant="title" numberOfLines={1} style={{ flexShrink: 1, fontSize: 19, letterSpacing: -0.4 }}>
                {pick(area, 'name', 'nameHi', state.lang).split(',')[0]}
              </AppText>
              <ChevronDown size={18} color={color.muted} strokeWidth={2.4} />
            </View>
            <View style={styles.areaLine}>
              <MapPin size={13} color={color.gold} strokeWidth={2.6} />
              <AppText variant="small" tone={color.muted} numberOfLines={1}>
                {state.radius ? t('areaSub', { km: state.radius }) : t('areaSubAny')}
              </AppText>
            </View>
          </Pressable>
          <IconButton icon={ShoppingBag} label={t('cart')} badge={cartCount} size={42} onPress={() => setSheet('cart')} />
          <Pressy onPress={() => router.navigate('/profile')} scaleTo={0.9} accessibilityRole="button" accessibilityLabel={t('tabProfile')} style={styles.avaRing}>
            <View style={styles.ava}>
              <AppText variant="label" weight="800">
                {initials}
              </AppText>
            </View>
          </Pressy>
        </View>

        {/* 2. Search */}
        <View style={{ paddingHorizontal: space.xl, paddingTop: space.l }}>
          <Pressy onPress={() => router.push('/search')} scaleTo={0.985} accessibilityRole="search" accessibilityLabel={t('searchPlaceholder')} style={styles.search}>
            <Search size={19} color={color.muted} strokeWidth={2.4} />
            <AppText variant="body" tone={color.muted} style={{ flex: 1 }} numberOfLines={1}>
              {t('searchPlaceholder')}
            </AppText>
            <View style={styles.mic}>
              <Mic size={17} color={color.ink} strokeWidth={2.4} />
            </View>
          </Pressy>
        </View>

        {/* 3. Tonight's steal + shortcuts */}
        <View>
          {steal && <StealTicket deal={steal} />}
          <View style={styles.shortcuts}>
            {SHORTCUTS.map((s) => {
              const on = shortcutOn(s.key);
              return (
                <Pressy
                  key={s.key}
                  onPress={() => onShortcut(s.key)}
                  scaleTo={0.92}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={t(s.label)}
                  style={[styles.tile, on && styles.tileOn]}>
                  <Gold3D k={s.icon} size={58} style={styles.tileIcon} />
                  <AppText variant="small" weight="700" tone={on ? color.gold : color.inkSoft} numberOfLines={1}>
                    {t(s.label)}
                  </AppText>
                </Pressy>
              );
            })}
          </View>
        </View>

        {/* 4. Sticky filters */}
        <View style={styles.sticky}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            <Chip
              icon={MapPin}
              trailing={ChevronDown}
              label={state.radius ? t('within', { km: state.radius }) : t('anyDistance')}
              onPress={() => setSheet('radius')}
              selected
            />
            <Chip
              icon={Clock}
              label={t('openNow')}
              selected={state.openNow}
              onPress={() => {
                dispatch({ type: 'set', patch: { openNow: !state.openNow } });
                haptic('select');
              }}
            />
            <Chip
              icon={ArrowUpDown}
              label={sort === 'big' ? t('sortBig') : sort === 'rating' ? t('sortRating') : t('sort')}
              selected={sort !== 'near'}
              onPress={() => setSort((s) => (s === 'near' ? 'big' : s === 'big' ? 'rating' : 'near'))}
            />
            {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
              <Chip key={c.key} label={t(c.label)} selected={state.category === c.key} onPress={() => setCategory(c.key)} />
            ))}
          </ScrollView>
        </View>

        {/* 5. Following */}
        {followed.length > 0 && home && (
          <View style={styles.block}>
            <Eyebrow label={t('following')} style={styles.eyebrow} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {followed.map((s) => (
                <Pressy
                  key={s.id}
                  onPress={() => router.push({ pathname: '/shop/[id]', params: { id: s.id } })}
                  scaleTo={0.93}
                  accessibilityRole="link"
                  accessibilityLabel={s.name}
                  style={styles.avatarItem}>
                  <View style={[styles.avatarRing, liveByShop.has(s.id) && styles.avatarRingLive]}>
                    <Photo k={s.ownerImage ?? s.image} alt={s.name} style={styles.avatar} art={0.7} />
                  </View>
                  <AppText variant="small" weight="600" tone={color.inkSoft} numberOfLines={2} center style={{ width: 84 }}>
                    {shortName(pick(s, 'name', 'nameHi', state.lang))}
                  </AppText>
                </Pressy>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 6. Ending soon */}
        {ending.length > 0 && home && (
          <View style={styles.block}>
            <Eyebrow label={t('endingSoonNear')} style={styles.eyebrow} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {ending.map((d) => (
                <RailCard key={d.id} deal={d} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 7. Meet your local shop */}
        {home && (
          <View style={styles.block}>
            <Eyebrow label={t('meetShop')} style={styles.eyebrow} />
            <Pressy
              onPress={() => router.push({ pathname: '/shop/[id]', params: { id: spot.id } })}
              scaleTo={0.985}
              accessibilityRole="link"
              accessibilityLabel={`${spot.name}. ${spot.quote}`}
              style={styles.spot}>
              <Photo k={spot.ownerImage ?? spot.image} alt={spot.owner} style={styles.spotImg} />
              <View style={styles.spotBody}>
                <Lux size={21} tone={color.ink}>
                  “{pick(spot, 'quote', 'quoteHi', state.lang)}”
                </Lux>
                <View style={styles.spotMeta}>
                  <AppText variant="label" weight="800" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {pick(spot, 'name', 'nameHi', state.lang)}
                  </AppText>
                  {spot.verified && <BadgeCheck size={15} color={color.navy} strokeWidth={2.4} />}
                </View>
                <AppText variant="small" tone={color.muted}>
                  {t('ownerSays', { name: pick(spot, 'owner', 'ownerHi', state.lang) })} · {t('since', { y: spot.since })}
                </AppText>
              </View>
            </Pressy>
          </View>
        )}

        {/* 8. Feed */}
        <View style={styles.block}>
          <Eyebrow label={t('dealsNear')} style={styles.eyebrow} />
          <AppText variant="small" tone={color.muted} center style={{ marginTop: -6, marginBottom: space.l }}>
            {`${feed.length === 1 ? t('dealsCountOne') : t('dealsCount', { n: feed.length })} · ${sort === 'big' ? t('sortBig') : sort === 'rating' ? t('sortRating') : t('nearestFirst')}`}
          </AppText>
          {feed.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={t('noDealsTitle')}
              body={t('noDealsBody')}
              action={nextRadius ? t('widenTo', { km: nextRadius }) : t('anyDistance')}
              onAction={() => dispatch({ type: 'set', patch: { radius: nextRadius, openNow: false } })}
            />
          ) : (
            <View style={{ gap: space.l }}>
              {feed.map((d, i) => (
                <Animated.View key={`${state.category}-${state.radius}-${sort}-${d.id}`} entering={i < 4 ? FadeInDown.delay(i * 60).springify().damping(18) : undefined}>
                  <DealCard deal={d} />
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <RadiusSheet visible={sheet === 'radius'} onClose={() => setSheet(null)} />
      <AreaSheet visible={sheet === 'area'} onClose={() => setSheet(null)} />
      <CartSheet visible={sheet === 'cart'} onClose={() => setSheet(null)} />
    </View>
  );
}

/* ---------- Tonight's steal: the one glowing object on Home ---------- */

function StealTicket({ deal }: { deal: Deal }) {
  const { state, t } = useStore();
  const shop = shopById[deal.shopId];
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const e = endsLabel(deal, t, state.lang);
  return (
    <View style={styles.hero}>
      <Eyebrow label={t('tonightSteal')} style={{ paddingHorizontal: 0, marginBottom: space.l }} />
      <View>
        <Halo style={styles.halo} />
        <Pressy
          onPress={() => router.push({ pathname: '/deal/[id]', params: { id: deal.id } })}
          scaleTo={0.98}
          accessibilityRole="link"
          accessibilityLabel={`${t('tonightSteal')}: ${title}, ${shop.name}, ${rupees(deal.price)}, ${pctOff(deal)}% off`}>
          <Ticket notch={{ axis: 'x', at: 0.57 }} height={196} radius={22} colors={['#231C60', '#100E30']} border="rgba(255,255,255,0.14)">
            <View style={styles.heroLeft}>
              <EmberChip label={e.text} />
              <AppText variant="small" weight="600" tone={color.muted} numberOfLines={1} style={{ marginTop: space.m }}>
                {pick(shop, 'name', 'nameHi', state.lang)} · {t('since', { y: shop.since })}
              </AppText>
              <AppText variant="heading" weight="800" numberOfLines={2} style={{ marginTop: 4, fontSize: 19, letterSpacing: -0.4 }}>
                {title}
              </AppText>
              <View style={styles.heroPrice}>
                <GoldNumber value={rupees(deal.price)} size={40} />
                <AppText variant="label" tone={color.faint} style={{ textDecorationLine: 'line-through' }}>
                  {rupees(deal.mrp)}
                </AppText>
              </View>
            </View>
            <View style={styles.heroRight}>
              <Photo k={deal.image} alt={deal.title} style={StyleSheet.absoluteFill} />
              <OffBadge deal={deal} style={{ position: 'absolute', top: 10, right: 10 }} />
              <View style={styles.dist}>
                <Navigation size={12} color={color.ink} strokeWidth={2.6} />
                <AppText variant="micro" tone={color.ink}>
                  {kmLabel(shop.km)}
                </AppText>
              </View>
            </View>
          </Ticket>
        </Pressy>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.xl, paddingTop: space.xs },
  area: { flex: 1, minHeight: 48, justifyContent: 'center', gap: 2 },
  areaLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avaRing: { width: 42, height: 42, borderRadius: 21, padding: 2, backgroundColor: color.gold },
  ava: { flex: 1, borderRadius: 19, backgroundColor: '#14143A', alignItems: 'center', justifyContent: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    minHeight: 52,
    paddingLeft: space.l,
    paddingRight: 8,
    borderRadius: radius.l,
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderWidth: 1,
    borderColor: color.line,
  },
  mic: { width: 36, height: 36, borderRadius: 12, backgroundColor: color.sunk, alignItems: 'center', justifyContent: 'center' },
  hero: { marginTop: 26, paddingHorizontal: space.xl },
  halo: { top: 24, left: -24, right: -24, bottom: -30 },
  heroLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '57%', padding: 18, paddingRight: 14 },
  heroPrice: { marginTop: 'auto', flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  heroRight: { position: 'absolute', top: 6, right: 6, bottom: 6, left: '61%', borderRadius: 17, overflow: 'hidden' },
  dist: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(5,6,26,0.66)',
  },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 26, paddingHorizontal: space.xl, marginTop: 40 },
  tile: {
    width: '23%',
    height: 74,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: color.line,
  },
  tileOn: { backgroundColor: color.goldTint, borderColor: color.goldLine },
  tileIcon: { position: 'absolute', top: -18 },
  sticky: { backgroundColor: color.paper, paddingTop: space.xl, paddingBottom: space.m },
  filters: { paddingHorizontal: space.xl, gap: space.s },
  block: { marginTop: space.xxl },
  eyebrow: { marginBottom: space.l },
  rail: { paddingHorizontal: space.xl, gap: space.m },
  avatarItem: { alignItems: 'center', gap: 6 },
  avatarRing: { padding: 3, borderRadius: 40, borderWidth: 2, borderColor: color.lineStrong },
  avatarRingLive: { borderColor: color.gold },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  spot: { marginHorizontal: space.xl, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: color.card, borderWidth: 1, borderColor: color.line, flexDirection: 'row', minHeight: 176 },
  spotImg: { width: '38%' },
  spotBody: { flex: 1, padding: space.l, gap: 6, justifyContent: 'center' },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.s },
});
