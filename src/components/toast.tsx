import { CheckCircle2 } from '@/components/icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOutDown, LinearTransition, SlideInDown } from 'react-native-reanimated';

import { useStore } from '@/store/store';
import { color, radius, shadow, space } from '@/theme/tokens';

import { AppText } from './ui';

/** One toast at a time, above the tab bar. Undo instead of "Are you sure?" dialogs. */
export function Toast({ bottom }: { bottom: number }) {
  const { toast, hideToast } = useStore();
  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <Animated.View
        key={toast.id}
        entering={SlideInDown.springify().damping(20)}
        exiting={FadeOutDown.duration(160)}
        layout={LinearTransition}
        style={styles.toast}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert">
        <CheckCircle2 size={20} color={color.success} strokeWidth={2.4} />
        <AppText variant="label" tone={color.ink} style={{ flex: 1 }} numberOfLines={2}>
          {toast.message}
        </AppText>
        {toast.actionLabel && toast.onAction && (
          <Pressable
            onPress={() => {
              toast.onAction?.();
              hideToast();
            }}
            hitSlop={10}
            accessibilityRole="button"
            style={styles.action}>
            <AppText variant="label" weight="800" tone={color.gold}>
              {toast.actionLabel}
            </AppText>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.l, right: space.l, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    backgroundColor: color.cardHi,
    borderWidth: 1,
    borderColor: color.goldLine,
    borderRadius: radius.l,
    paddingVertical: space.m,
    paddingLeft: space.l,
    paddingRight: space.s,
    ...shadow.raised,
  },
  action: { minHeight: 44, paddingHorizontal: space.m, justifyContent: 'center' },
});
