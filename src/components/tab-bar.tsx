import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Clock, House, User } from '@/components/icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useStore } from '@/store/store';
import { color, radius } from '@/theme/tokens';

import { GoldFill } from './night';
import { Toast } from './toast';
import { AppText } from './ui';

const ICONS = { index: House, history: Clock, profile: User } as const;
const LABELS = { index: 'tabHome', history: 'tabHistory', profile: 'tabProfile' } as const;

const DOCK_H = 60;
const DOCK_GAP = 14;

/** Space a tab screen leaves at the bottom so the floating dock never covers content. */
export function useDockSpace() {
  const insets = useSafeAreaInsets();
  return DOCK_H + DOCK_GAP + Math.max(insets.bottom, 8) + 24;
}

/**
 * Slim floating dock: icons only, the active tab grows into a gold capsule with its label.
 * It floats over the content on a soft fade, so screens add useDockSpace() at the bottom.
 */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const { t, haptic, state: app } = useStore();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8) + DOCK_GAP;
  const savedCount = app.saved.length;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Svg pointerEvents="none" width="100%" height={bottom + DOCK_H + 56} style={styles.fade}>
        <Defs>
          <LinearGradient id="dockfade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color.paper} stopOpacity={0} />
            <Stop offset="0.65" stopColor={color.paper} stopOpacity={0.92} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dockfade)" />
      </Svg>
      <Toast bottom={bottom + DOCK_H + 12} />
      <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
        <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.dock} accessibilityRole="tablist">
          {state.routes.map((route, i) => {
            const focused = state.index === i;
            const name = route.name as keyof typeof ICONS;
            const Icon = ICONS[name] ?? House;
            const label = t(LABELS[name] ?? 'tabHome');
            return (
              <Animated.View key={route.key} layout={LinearTransition.springify().damping(20)}>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={name === 'history' && savedCount ? `${label}, ${savedCount}` : label}
                  onPress={() => {
                    if (focused) return;
                    haptic('select');
                    navigateToTab(route.key);
                  }}
                  style={[styles.item, focused && styles.itemOn]}>
                  {focused && <GoldFill radius={radius.pill} />}
                  <View>
                    <Icon size={22} color={focused ? color.onGold : color.muted} strokeWidth={focused ? 2.4 : 2} />
                  </View>
                  {focused && (
                    <Animated.View entering={FadeIn.duration(180)}>
                      <AppText variant="label" weight="800" tone={color.onGold} numberOfLines={1}>
                        {label}
                      </AppText>
                    </Animated.View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: DOCK_H,
    paddingHorizontal: 8,
    borderRadius: DOCK_H / 2,
    backgroundColor: 'rgba(16,16,46,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    minWidth: 56,
    borderRadius: 22,
    overflow: 'hidden',
  },
  itemOn: {
    paddingHorizontal: 18,
    shadowColor: '#F6B446',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
