import { Linking, Platform, StyleSheet, View } from 'react-native';
import { MessageCircle, Navigation, Phone, Plus, Check } from '@/components/icons';

import { type Shop } from '@/data/catalog';
import { useStore } from '@/store/store';
import { color, radius, space } from '@/theme/tokens';

import { AppText, Pressy } from './ui';

/** Follow = Locall's old "Subscribe", renamed and explained. */
export function FollowButton({ shop, compact }: { shop: Shop; compact?: boolean }) {
  const { state, dispatch, t, haptic, showToast } = useStore();
  const on = state.following.includes(shop.id);
  return (
    <Pressy
      onPress={() => {
        dispatch({ type: 'toggleFollow', shopId: shop.id });
        haptic(on ? 'light' : 'success');
        if (!on) showToast({ message: `${t('followingBtn')} ${shop.name}. ${t('followHint')}.` });
      }}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${on ? t('followingBtn') : t('follow')} ${shop.name}`}
      style={[styles.follow, on ? styles.followOn : styles.followOff, compact && { paddingHorizontal: space.m }]}>
      {on ? <Check size={18} color={color.navy} strokeWidth={2.6} /> : <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />}
      <AppText variant="label" weight="800" tone={on ? color.navy : '#FFFFFF'}>
        {on ? t('followingBtn') : t('follow')}
      </AppText>
    </Pressy>
  );
}

/** Call · WhatsApp · Directions. Sample numbers go to Locall's public contact for the demo. */
export function ContactRow({ shop }: { shop: Shop }) {
  const { t } = useStore();
  const items = [
    { key: 'call', icon: Phone, label: t('call'), bg: color.navyTint, fg: color.navy, url: 'tel:+917587315025' },
    { key: 'wa', icon: MessageCircle, label: t('whatsapp'), bg: '#E3F4EA', fg: color.whatsapp, url: 'https://wa.me/917587315025' },
    {
      key: 'dir',
      icon: Navigation,
      label: t('directions'),
      bg: color.orangeTint,
      fg: color.orangeDeep,
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.area + ', Durg, Chhattisgarh')}`,
    },
  ];
  return (
    <View style={styles.contact}>
      {items.map(({ key, icon: Icon, label, bg, fg, url }) => (
        <Pressy
          key={key}
          onPress={() => (Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url))}
          accessibilityRole="button"
          accessibilityLabel={`${label} ${shop.name}`}
          style={[styles.contactBtn, { backgroundColor: bg }]}>
          <Icon size={22} color={fg} strokeWidth={2.3} />
          <AppText variant="label" weight="700" tone={fg}>
            {label}
          </AppText>
        </Pressy>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  follow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: space.l,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  followOff: { backgroundColor: color.orangeStrong, borderColor: color.orangeStrong },
  followOn: { backgroundColor: color.navyTint, borderColor: color.navyTint },
  contact: { flexDirection: 'row', gap: space.s },
  contactBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 68, borderRadius: radius.l },
});
