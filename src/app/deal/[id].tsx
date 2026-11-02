import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BadgeCheck, Info, ShoppingBag, Star } from '@/components/icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EndsTag, OffBadge, Price, RailCard, SaveButton } from '@/components/deal-card';
import { ContactRow, FollowButton } from '@/components/shop-bits';
import { CartSheet } from '@/components/sheets';
import { Toast } from '@/components/toast';
import { AppText, Button, IconButton, Pressy, SectionHeader } from '@/components/ui';
import { dealById, shopById } from '@/data/catalog';
import { images } from '@/data/images';
import { isEnded, isOpen, kmLabel, pick, rupees, travel } from '@/lib/format';
import { liveDeals } from '@/lib/query';
import { useStore } from '@/store/store';
import { color, radius, shadow, space } from '@/theme/tokens';

export default function DealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deal = dealById[id ?? ''];
  const { state, dispatch, t, haptic, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (deal) dispatch({ type: 'view', id: deal.id });
  }, [deal, dispatch]);

  if (!deal) return null;
  const shop = shopById[deal.shopId];
  const ended = isEnded(deal);
  const title = pick(deal, 'title', 'titleHi', state.lang);
  const inCart = state.cart[deal.id] ?? 0;
  const fromShop = liveDeals().filter((d) => d.shopId === shop.id && d.id !== deal.id);
  const similar = liveDeals()
    .filter((d) => d.category === deal.category && d.shopId !== shop.id)
    .sort((a, b) => shopById[a.shopId].km - shopById[b.shopId].km)
    .slice(0, 6);
  const open = isOpen(shop);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image alt={deal.title} source={images[deal.image]} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
          <View style={[styles.heroBar, { top: insets.top + space.s }]}>
            <IconButton icon={ArrowLeft} label={t('back')} onPress={back} bg="rgba(255,255,255,0.94)" />
            <SaveButton dealId={deal.id} />
          </View>
        </View>

        <Animated.View entering={FadeInUp.springify().damping(20)} style={styles.sheet}>
          <View style={styles.tags}>
            <OffBadge deal={deal} />
            <EndsTag deal={deal} />
          </View>
          <AppText variant="display" style={{ marginTop: space.m }}>
            {title}
          </AppText>
          <AppText variant="body" tone={color.muted}>
            {pick(deal, 'unit', 'unitHi', state.lang)}
          </AppText>

          <View style={styles.priceBlock}>
            <Price deal={deal} />
            <View style={styles.savePill}>
              <AppText variant="label" weight="800" tone={color.success}>
                {t('save', { n: (deal.mrp - deal.price).toLocaleString('en-IN') })}
              </AppText>
            </View>
          </View>

          {/* Shop */}
          <Pressy
            onPress={() => router.push({ pathname: '/shop/[id]', params: { id: shop.id } })}
            scaleTo={0.985}
            accessibilityRole="link"
            accessibilityLabel={`${t('visitShop')}: ${shop.name}`}
            style={styles.shop}>
            <View style={styles.shopTop}>
              <Image alt={shop.owner} source={images[shop.ownerImage ?? shop.image]} style={styles.shopImg} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <View style={styles.inline}>
                  <AppText variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {pick(shop, 'name', 'nameHi', state.lang)}
                  </AppText>
                  {shop.verified && <BadgeCheck size={16} color={color.navy} strokeWidth={2.4} />}
                </View>
                <View style={styles.inline}>
                  <Star size={14} color={color.star} fill={color.star} strokeWidth={0} />
                  <AppText variant="small" weight="700">
                    {shop.rating.toFixed(1)}
                  </AppText>
                  <AppText variant="small" tone={color.muted}>
                    {t('reviews', { n: shop.reviews })} · {t('since', { y: shop.since })}
                  </AppText>
                </View>
                <AppText variant="small" tone={color.inkSoft}>
                  {kmLabel(shop.km)} · {travel(shop, t)} ·{' '}
                  <AppText variant="small" weight="700" tone={open ? color.success : color.danger}>
                    {open ? t('openNow') : t('closed')}
                  </AppText>
                </AppText>
              </View>
            </View>
            <View style={styles.followRow}>
              <AppText variant="small" tone={color.muted} style={{ flex: 1 }}>
                {t('followHint')}
              </AppText>
              <FollowButton shop={shop} compact />
            </View>
          </Pressy>

          <View style={{ marginTop: space.l }}>
            <ContactRow shop={shop} />
          </View>

          <View style={{ marginTop: space.xxl, gap: space.s }}>
            <AppText variant="heading">{t('aboutDeal')}</AppText>
            <AppText variant="body" tone={color.inkSoft}>
              {pick(deal, 'note', 'noteHi', state.lang)}
            </AppText>
            <View style={styles.info}>
              <Info size={18} color={color.navy} strokeWidth={2.4} />
              <AppText variant="small" tone={color.navy} style={{ flex: 1 }}>
                {t('howItWorks')}
              </AppText>
            </View>
          </View>
        </Animated.View>

        {fromShop.length > 0 && (
          <View style={{ marginTop: space.xl }}>
            <SectionHeader title={t('moreFromShop', { shop: pick(shop, 'name', 'nameHi', state.lang) })} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {fromShop.map((d) => (
                <RailCard key={d.id} deal={d} />
              ))}
            </ScrollView>
          </View>
        )}
        {similar.length > 0 && (
          <View style={{ marginTop: space.xl }}>
            <SectionHeader title={t('similarDeals')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {similar.map((d) => (
                <RailCard key={d.id} deal={d} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.m) }]}>
        <View style={{ flex: 1 }}>
          <AppText variant="small" tone={color.muted}>
            {t('total')}
          </AppText>
          <AppText variant="title">{rupees(deal.price)}</AppText>
        </View>
        {ended ? (
          <Button label={t('seeSimilar')} kind="secondary" onPress={() => router.push({ pathname: '/search', params: { q: deal.category } })} />
        ) : inCart ? (
          <Button label={`${inCart} ${t('inCart')} · ${t('cart')}`} kind="secondary" icon={ShoppingBag} onPress={() => setCartOpen(true)} />
        ) : (
          <Button
            label={t('addToCart')}
            icon={ShoppingBag}
            size="l"
            onPress={() => {
              dispatch({ type: 'cartAdd', id: deal.id });
              haptic('success');
              showToast({ message: `${title} · ${t('added')}`, actionLabel: t('cart'), onAction: () => setCartOpen(true) });
            }}
          />
        )}
      </View>
      <Toast bottom={110 + insets.bottom} />
      <CartSheet visible={cartOpen} onClose={() => setCartOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', aspectRatio: 1.1, backgroundColor: color.sunk },
  heroBar: { position: 'absolute', left: space.l, right: space.l, flexDirection: 'row', justifyContent: 'space-between' },
  sheet: {
    marginTop: -28,
    backgroundColor: color.paper,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  tags: { flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' },
  priceBlock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.l },
  savePill: { backgroundColor: color.successTint, paddingHorizontal: space.m, paddingVertical: 6, borderRadius: radius.pill },
  shop: {
    marginTop: space.xl,
    padding: space.l,
    backgroundColor: color.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.line,
    gap: space.m,
    ...shadow.card,
  },
  shopTop: { flexDirection: 'row', gap: space.m, alignItems: 'center' },
  shopImg: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.sunk },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  followRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingTop: space.m, borderTopWidth: 1, borderTopColor: color.line },
  info: { flexDirection: 'row', gap: space.s, padding: space.m, borderRadius: radius.m, backgroundColor: color.navyTint, marginTop: space.s },
  rail: { paddingHorizontal: space.xl, gap: space.m },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingHorizontal: space.xl,
    paddingTop: space.m,
    backgroundColor: color.card,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
});
