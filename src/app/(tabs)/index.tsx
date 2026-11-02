import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ArrowUpDown,
  BadgeCheck,
  ChevronDown,
  Clock,
  LayoutGrid,
  MapPin,
  Mic,
  Quote,
  Scissors,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Sofa,
  Utensils,
  CookingPot,
  SearchX,
} from '@/components/icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DealCard, RailCard } from '@/components/deal-card';
import { RadiusSheet } from '@/components/radius-sheet';
import { AreaSheet, CartSheet } from '@/components/sheets';
import { AppText, Chip, EmptyState, IconButton, Pressy, SectionHeader } from '@/components/ui';
import { AREAS, CATEGORIES, type Category, shopById } from '@/data/catalog';
import { images } from '@/data/images';
import { pick } from '@/lib/format';
import { endingToday, filterDeals, liveDeals } from '@/lib/query';
import { useStore } from '@/store/store';
import { color, radius, shadow, space } from '@/theme/tokens';

const CAT_ICON = {
  all: LayoutGrid,
  food: Utensils,
  grocery: ShoppingBasket,
  clothes: Shirt,
  household: CookingPot,
  furniture: Sofa,
  salon: Scissors,
} as const;

const SPOTLIGHT = 'handloom-house';

/** First two words, so long shop names wrap at a word, not mid-word. */
const shortName = (name: string) => name.split(' ').slice(0, 2).join(' ').replace(/[&,]$/, '');

export default function Home() {
  const { state, dispatch, t, haptic } = useStore();
  const insets = useSafeAreaInsets();
  const [sheet, setSheet] = useState<'radius' | 'area' | 'cart' | null>(null);
  const [sortBig, setSortBig] = useState(false);

  const feed = useMemo(() => {
    const list = filterDeals(state);
    return sortBig ? [...list].sort((a, b) => b.mrp - b.price - (a.mrp - a.price)) : list;
  }, [state, sortBig]);
  const ending = useMemo(() => endingToday(state.radius), [state.radius]);
  const followed = state.following.map((id) => shopById[id]).filter(Boolean);
  const cartCount = Object.values(state.cart).reduce((a, b) => a + b, 0);
  const area = AREAS[state.area];
  const nextRadius = state.radius === 0 ? 0 : ([3, 5, 10, 20, 0] as const).find((r) => r === 0 || r > state.radius) ?? 0;
  const spot = shopById[SPOTLIGHT];
  const liveByShop = useMemo(() => new Set(liveDeals().map((d) => d.shopId)), []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.s, paddingBottom: space.huge }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}>
        {/* 0. Header */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/locall-mark.png')} style={styles.mark} alt="Locall" accessibilityLabel="Locall" />
          <Pressable
            onPress={() => setSheet('area')}
            style={styles.area}
            accessibilityRole="button"
            accessibilityLabel={`${t('deliverTo')}: ${area.name}`}
            hitSlop={6}>
            <AppText variant="small" tone={color.muted}>
              {t('deliverTo')}
            </AppText>
            <View style={styles.areaLine}>
              <MapPin size={16} color={color.orangeText} strokeWidth={2.6} />
              <AppText variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                {pick(area, 'name', 'nameHi', state.lang)}
              </AppText>
              <ChevronDown size={18} color={color.ink} strokeWidth={2.4} />
            </View>
          </Pressable>
          <IconButton icon={ShoppingBag} label={t('cart')} badge={cartCount} onPress={() => setSheet('cart')} />
        </View>

        {/* 1. Search */}
        <View style={{ paddingHorizontal: space.xl, paddingTop: space.m }}>
          <Pressy
            onPress={() => router.push('/search')}
            scaleTo={0.985}
            accessibilityRole="search"
            accessibilityLabel={t('searchPlaceholder')}
            style={styles.search}>
            <Search size={20} color={color.inkSoft} strokeWidth={2.4} />
            <AppText variant="body" tone={color.muted} style={{ flex: 1 }} numberOfLines={1}>
              {t('searchPlaceholder')}
            </AppText>
            <View style={styles.mic}>
              <Mic size={18} color={color.orangeText} strokeWidth={2.4} />
            </View>
          </Pressy>
        </View>

        {/* 2. Sticky: categories + filters */}
        <View style={styles.sticky}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
            {CATEGORIES.map((c) => {
              const on = state.category === c.key;
              const Icon = CAT_ICON[c.key];
              return (
                <Pressy
                  key={c.key}
                  onPress={() => {
                    dispatch({ type: 'set', patch: { category: c.key as 'all' | Category } });
                    haptic('select');
                  }}
                  scaleTo={0.92}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={t(c.label)}
                  style={styles.cat}>
                  <View style={[styles.catIcon, on && styles.catIconOn]}>
                    <Icon size={24} color={on ? '#FFFFFF' : color.orangeText} strokeWidth={2.2} />
                  </View>
                  <AppText variant="small" weight={on ? '800' : '600'} tone={on ? color.ink : color.inkSoft} numberOfLines={1}>
                    {t(c.label)}
                  </AppText>
                </Pressy>
              );
            })}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            <Chip
              icon={MapPin}
              trailing={ChevronDown}
              label={state.radius ? t('within', { km: state.radius }) : t('anyDistance')}
              onPress={() => setSheet('radius')}
              style={styles.radiusChip}
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
            <Chip icon={ArrowUpDown} label={sortBig ? t('sortBig') : t('sort')} onPress={() => setSortBig((v) => !v)} />
          </ScrollView>
        </View>

        {/* 3. Following */}
        {followed.length > 0 && state.category === 'all' && (
          <View style={styles.block}>
            <SectionHeader title={t('following')} />
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
                    <Image alt={s.name} source={images[s.image]} style={styles.avatar} contentFit="cover" />
                  </View>
                  <AppText variant="small" weight="600" numberOfLines={2} center style={{ width: 88 }}>
                    {shortName(pick(s, 'name', 'nameHi', state.lang))}
                  </AppText>
                </Pressy>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 4. Ending today */}
        {ending.length > 0 && state.category === 'all' && (
          <View style={styles.block}>
            <SectionHeader title={t('endingToday')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {ending.map((d) => (
                <RailCard key={d.id} deal={d} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. Meet your local shop */}
        {state.category === 'all' && (
          <View style={styles.block}>
            <SectionHeader title={t('meetShop')} />
            <Pressy
              onPress={() => router.push({ pathname: '/shop/[id]', params: { id: spot.id } })}
              scaleTo={0.985}
              accessibilityRole="link"
              accessibilityLabel={`${spot.name}. ${spot.quote}`}
              style={styles.spot}>
              <Image alt={spot.owner} source={images[spot.ownerImage ?? spot.image]} style={styles.spotImg} contentFit="cover" />
              <View style={styles.spotBody}>
                <Quote size={22} color={color.orange} fill={color.orange} strokeWidth={0} />
                <AppText variant="bodyStrong" tone="#FFFFFF">
                  {pick(spot, 'quote', 'quoteHi', state.lang)}
                </AppText>
                <View style={styles.spotMeta}>
                  <AppText variant="label" tone="#FFFFFF" weight="800" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {pick(spot, 'name', 'nameHi', state.lang)}
                  </AppText>
                  {spot.verified && <BadgeCheck size={16} color="#9DB8FF" strokeWidth={2.4} />}
                </View>
                <AppText variant="small" tone="#D6DCEB">
                  {t('ownerSays', { name: pick(spot, 'owner', 'ownerHi', state.lang) })} · {t('since', { y: spot.since })}
                </AppText>
              </View>
            </Pressy>
          </View>
        )}

        {/* 6. Feed */}
        <View style={styles.block}>
          <SectionHeader
            title={t('dealsNear')}
            sub={`${feed.length === 1 ? t('dealsCountOne') : t('dealsCount', { n: feed.length })} · ${sortBig ? t('sortBig') : t('nearestFirst')}`}
          />
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
                <Animated.View key={`${state.category}-${state.radius}-${d.id}`} entering={i < 4 ? FadeInDown.delay(i * 60).springify().damping(18) : undefined}>
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

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.xl },
  mark: { width: 40, height: 40 },
  area: { flex: 1, minHeight: 48, justifyContent: 'center' },
  areaLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    minHeight: 54,
    paddingLeft: space.l,
    paddingRight: 6,
    borderRadius: radius.pill,
    backgroundColor: color.card,
    borderWidth: 1.5,
    borderColor: color.line,
    ...shadow.card,
  },
  mic: { width: 42, height: 42, borderRadius: 21, backgroundColor: color.orangeTint, alignItems: 'center', justifyContent: 'center' },
  sticky: { backgroundColor: color.paper, paddingTop: space.l, paddingBottom: space.s, borderBottomWidth: 1, borderBottomColor: color.line },
  cats: { paddingHorizontal: space.l, gap: space.xs },
  cat: { width: 74, alignItems: 'center', gap: 6, paddingVertical: 2 },
  catIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: color.orangeTint, alignItems: 'center', justifyContent: 'center' },
  catIconOn: { backgroundColor: color.ink },
  filters: { paddingHorizontal: space.xl, gap: space.s, paddingTop: space.m },
  radiusChip: { borderColor: color.orangeText, backgroundColor: color.orangeTint },
  block: { marginTop: space.xxl },
  rail: { paddingHorizontal: space.xl, gap: space.m },
  avatarItem: { alignItems: 'center', gap: 6 },
  avatarRing: { padding: 3, borderRadius: 40, borderWidth: 2.5, borderColor: color.line },
  avatarRingLive: { borderColor: color.orange },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: color.sunk },
  spot: {
    marginHorizontal: space.xl,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: color.ink,
    flexDirection: 'row',
    minHeight: 180,
  },
  spotImg: { width: '38%', backgroundColor: color.inkSoft },
  spotBody: { flex: 1, padding: space.l, gap: 6, justifyContent: 'center' },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.s },
});
