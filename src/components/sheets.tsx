import { Image } from 'expo-image';
import { Check, LocateFixed, MapPin, ShoppingBag, Trash2 } from '@/components/icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AREAS, dealById, shopById } from '@/data/catalog';
import { images } from '@/data/images';
import { pick, rupees } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, radius, space, TOUCH } from '@/theme/tokens';

import { Sheet } from './sheet';
import { AppText, Button, EmptyState, IconButton } from './ui';

export function AreaSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, dispatch, t, haptic } = useStore();
  return (
    <Sheet visible={visible} onClose={onClose} title={t('areaTitle')}>
      <View style={{ paddingHorizontal: space.xl, gap: space.s }}>
        <Pressable style={styles.areaRow} accessibilityRole="button" onPress={onClose}>
          <LocateFixed size={22} color={color.navy} />
          <AppText variant="bodyStrong" tone={color.navy}>
            {t('areaUseGps')}
          </AppText>
        </Pressable>
        {AREAS.map((a, i) => {
          const on = state.area === i;
          return (
            <Pressable
              key={a.name}
              style={[styles.areaRow, on && styles.areaOn]}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => {
                dispatch({ type: 'set', patch: { area: i } });
                haptic('select');
                onClose();
              }}>
              <MapPin size={22} color={on ? color.orangeText : color.muted} />
              <AppText variant="body" weight={on ? '700' : '500'} style={{ flex: 1 }}>
                {pick(a, 'name', 'nameHi', state.lang)}
              </AppText>
              {on && <Check size={20} color={color.orangeText} strokeWidth={2.6} />}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

export function CartSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, dispatch, t, haptic, showToast } = useStore();
  const items = Object.entries(state.cart).map(([id, qty]) => ({ deal: dealById[id], qty }));
  const total = items.reduce((s, i) => s + i.deal.price * i.qty, 0);
  const saving = items.reduce((s, i) => s + (i.deal.mrp - i.deal.price) * i.qty, 0);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('cart')}
      footer={
        items.length ? (
          <View style={{ gap: space.m }}>
            <View style={styles.totalRow}>
              <View>
                <AppText variant="small" tone={color.muted}>
                  {t('total')}
                </AppText>
                <AppText variant="title">{rupees(total)}</AppText>
              </View>
              <View style={styles.savePill}>
                <AppText variant="label" weight="700" tone={color.success}>
                  {t('youSave', { n: saving.toLocaleString('en-IN') })}
                </AppText>
              </View>
            </View>
            <Button
              label={t('reserve')}
              size="l"
              full
              onPress={() => {
                const code = `LC-${Math.floor(1000 + Math.random() * 9000)}`;
                dispatch({ type: 'reserve', code });
                haptic('success');
                onClose();
                showToast({ message: t('reservedToast', { c: code }) });
              }}
            />
            <AppText variant="small" tone={color.muted} center>
              {t('howItWorks')}
            </AppText>
          </View>
        ) : null
      }>
      {items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title={t('cartEmpty')} body={t('noOrdersBody')} style={{ paddingVertical: space.xxl }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.s }}>
          {items.map(({ deal, qty }) => {
            const shop = shopById[deal.shopId];
            return (
              <View key={deal.id} style={styles.item}>
                <Image alt={deal.title} source={images[deal.image]} style={styles.thumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {pick(deal, 'title', 'titleHi', state.lang)}
                  </AppText>
                  <AppText variant="small" tone={color.inkSoft} numberOfLines={1}>
                    {pick(shop, 'name', 'nameHi', state.lang)}
                  </AppText>
                  <AppText variant="label" weight="800">
                    {qty} × {rupees(deal.price)}
                  </AppText>
                </View>
                <IconButton
                  icon={Trash2}
                  label={t('remove')}
                  tone={color.danger}
                  bg={color.dangerTint}
                  size={44}
                  onPress={() => dispatch({ type: 'cartRemove', id: deal.id })}
                />
              </View>
            );
          })}
        </ScrollView>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    minHeight: TOUCH + 8,
    paddingHorizontal: space.l,
    borderRadius: radius.l,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
  },
  areaOn: { borderColor: color.orangeText, backgroundColor: color.orangeTint },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    padding: space.m,
    backgroundColor: color.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: color.line,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.m },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  savePill: { backgroundColor: color.successTint, paddingHorizontal: space.m, paddingVertical: 6, borderRadius: radius.pill },
});
