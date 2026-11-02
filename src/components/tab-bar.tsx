import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Clock, House, User } from '@/components/icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store/store';
import { color, motion, space } from '@/theme/tokens';

import { Toast } from './toast';
import { AppText } from './ui';

const ICONS = { index: House, history: Clock, profile: User } as const;
const LABELS = { index: 'tabHome', history: 'tabHistory', profile: 'tabProfile' } as const;

export const TAB_BAR_HEIGHT = 64;

/** Docked, always-labelled bar. It sits below content, never floating over it. */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const { t, haptic, state: app } = useStore();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  const savedCount = app.saved.length;

  return (
    <View>
      <Toast bottom={TAB_BAR_HEIGHT + bottomPad + space.m} />
      <View style={[styles.bar, { paddingBottom: bottomPad }]} accessibilityRole="tablist">
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const name = route.name as keyof typeof ICONS;
          const Icon = ICONS[name] ?? House;
          const label = t(LABELS[name] ?? 'tabHome');
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={name === 'history' && savedCount ? `${label}, ${savedCount}` : label}
              onPress={() => {
                if (focused) return;
                haptic('select');
                navigateToTab(route.key);
              }}
              style={styles.item}>
              <Pill focused={focused} />
              <View style={{ height: 28, justifyContent: 'center' }}>
                <Icon size={24} color={focused ? color.orangeText : color.muted} strokeWidth={focused ? 2.5 : 2} />
              </View>
              <AppText variant="small" weight={focused ? '800' : '600'} tone={focused ? color.ink : color.muted}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Pill({ focused }: { focused: boolean }) {
  const style = useAnimatedStyle(() => ({
    opacity: withSpring(focused ? 1 : 0, motion.press),
    transform: [{ scaleX: withSpring(focused ? 1 : 0.4, motion.pop) }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.pill, style]} />;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: color.card,
    borderTopWidth: 1,
    borderTopColor: color.line,
    paddingTop: 6,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: TAB_BAR_HEIGHT - 6, gap: 2 },
  pill: {
    position: 'absolute',
    top: 2,
    width: 64,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.orangeTint,
  },
});
