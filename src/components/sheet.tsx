import { X } from '@/components/icons';
import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store/store';
import { color, motion, radius, space } from '@/theme/tokens';

import { AppText, IconButton } from './ui';

/** Bottom sheet used for radius, area and cart. Slides up with a spring; backdrop or X closes. */
export function Sheet({
  visible,
  onClose,
  title,
  sub,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useStore();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(height);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      y.value = height;
      y.value = withSpring(0, motion.sheet);
      fade.value = withTiming(1, { duration: motion.base });
    } else if (mounted) {
      fade.value = withTiming(0, { duration: motion.fast });
      y.value = withTiming(height, { duration: motion.base }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const backdrop = useAnimatedStyle(() => ({ opacity: fade.value }));

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent onRequestClose={onClose} animationType="none">
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('close')} />
        </Animated.View>
        <Animated.View
          style={[styles.panel, { maxHeight: height * 0.9, paddingBottom: Math.max(insets.bottom, space.l) }, panel]}
          accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <AppText variant="title" accessibilityRole="header">
                {title}
              </AppText>
              {sub ? (
                <AppText variant="body" tone={color.muted}>
                  {sub}
                </AppText>
              ) : null}
            </View>
            <IconButton icon={X} label={t('close')} onPress={onClose} bg={color.sunk} size={44} />
          </View>
          <View style={{ flexShrink: 1 }}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  backdrop: { backgroundColor: color.overlay },
  panel: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: color.paper,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: space.s,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.lineStrong, marginBottom: space.s },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.m, paddingHorizontal: space.xl, paddingBottom: space.l },
  footer: { paddingHorizontal: space.xl, paddingTop: space.m },
});
