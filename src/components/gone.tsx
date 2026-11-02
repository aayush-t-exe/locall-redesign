import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Gold3dKey } from '@/data/images';
import { useStore } from '@/store/store';
import { color, space } from '@/theme/tokens';

import { Gold3D, GoldButton, Sky } from './night';
import { AppText } from './ui';

/** Full-screen "nothing here" state for ended deals, unknown shops and bad links. */
export function Gone({ title, body, icon = 'bookmark' }: { title: string; body: string; icon?: Gold3dKey }) {
  const { t } = useStore();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + space.xl }]}>
      <Sky kind="history" />
      <Gold3D k={icon} size={140} style={{ transform: [{ rotate: '-10deg' }] }} />
      <AppText variant="display" center accessibilityRole="header" style={{ marginTop: space.l }}>
        {title}
      </AppText>
      <AppText variant="body" tone={color.muted} center style={{ maxWidth: 300 }}>
        {body}
      </AppText>
      <GoldButton label={t('backHome')} onPress={() => router.replace('/')} style={{ marginTop: space.xl, alignSelf: 'center' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.paper, alignItems: 'center', justifyContent: 'center', gap: space.s, paddingHorizontal: space.xxl },
});
