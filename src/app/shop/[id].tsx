import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BadgeCheck, Clock, Quote, Star } from '@/components/icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DealCard } from '@/components/deal-card';
import { ContactRow, FollowButton } from '@/components/shop-bits';
import { Toast } from '@/components/toast';
import { AppText, IconButton, SectionHeader } from '@/components/ui';
import { shopById } from '@/data/catalog';
import { images } from '@/data/images';
import { isOpen, kmLabel, pick, travel } from '@/lib/format';
import { liveDeals } from '@/lib/query';
import { useStore } from '@/store/store';
import { color, radius, space } from '@/theme/tokens';

export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shop = shopById[id ?? ''];
  const { state, t } = useStore();
  const insets = useSafeAreaInsets();
  if (!shop) return null;
  const shopDeals = liveDeals().filter((d) => d.shopId === shop.id);
  const open = isOpen(shop);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.huge }} showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          <Image alt={shop.name} source={images[shop.image]} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.scrim} />
          <View style={[styles.bar, { top: insets.top + space.s }]}>
            <IconButton icon={ArrowLeft} label={t('back')} onPress={back} bg="rgba(255,255,255,0.94)" />
          </View>
        </View>

        <View style={styles.body}>
          <Image alt={shop.owner} source={images[shop.ownerImage ?? shop.image]} style={styles.owner} contentFit="cover" />
          <AppText variant="display">
            {pick(shop, 'name', 'nameHi', state.lang)}
            {shop.verified ? '  ' : ''}
            {shop.verified && <BadgeCheck size={22} color={color.navy} strokeWidth={2.4} />}
          </AppText>
          <View style={[styles.inline, { marginTop: 4 }]}>
            <Star size={16} color={color.star} fill={color.star} strokeWidth={0} />
            <AppText variant="label" weight="700">
              {shop.rating.toFixed(1)}
            </AppText>
            <AppText variant="label" tone={color.muted}>
              {t('reviews', { n: shop.reviews })} · {pick(shop, 'area', 'areaHi', state.lang)} · {kmLabel(shop.km)}
            </AppText>
          </View>
          <View style={[styles.inline, { marginTop: 2 }]}>
            <Clock size={14} color={open ? color.success : color.danger} strokeWidth={2.4} />
            <AppText variant="small" weight="700" tone={open ? color.success : color.danger}>
              {open ? t('openNow') : t('closed')}
            </AppText>
            <AppText variant="small" tone={color.muted}>
              · {shop.opens}:00–{shop.closes}:00 · {travel(shop, t)}
            </AppText>
          </View>

          <View style={styles.quote}>
            <Quote size={20} color={color.orange} fill={color.orange} strokeWidth={0} />
            <AppText variant="body" weight="600">
              {pick(shop, 'quote', 'quoteHi', state.lang)}
            </AppText>
            <AppText variant="small" tone={color.muted}>
              {t('ownerSays', { name: pick(shop, 'owner', 'ownerHi', state.lang) })} · {t('since', { y: shop.since })}
            </AppText>
          </View>

          <View style={styles.followRow}>
            <AppText variant="small" tone={color.muted} style={{ flex: 1 }}>
              {t('followHint')}
            </AppText>
            <FollowButton shop={shop} />
          </View>
          <ContactRow shop={shop} />
        </View>

        <View style={{ marginTop: space.xxl }}>
          <SectionHeader title={shopDeals.length === 1 ? t('dealsCountOne') : t('dealsCount', { n: shopDeals.length })} />
          <View style={{ gap: space.l }}>
            {shopDeals.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </View>
        </View>
      </ScrollView>
      <Toast bottom={insets.bottom + space.xl} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 200, backgroundColor: color.sunk },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,31,77,0.25)' },
  bar: { position: 'absolute', left: space.l },
  body: { paddingHorizontal: space.xl, marginTop: -44, gap: 2 },
  owner: { width: 88, height: 88, borderRadius: 44, borderWidth: 4, borderColor: color.paper, marginBottom: space.m, backgroundColor: color.sunk },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  quote: { marginTop: space.l, padding: space.l, borderRadius: radius.xl, backgroundColor: color.orangeTint, gap: 6 },
  followRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, marginVertical: space.l },
});
