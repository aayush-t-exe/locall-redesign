import { MapPin } from '@/components/icons';
import { useEffect, useMemo, useState } from 'react';
import { type GestureResponderEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { RADIUS_STOPS, deals, shops } from '@/data/catalog';
import { isEnded, rideMinutes } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, motion, space } from '@/theme/tokens';

import { Sheet } from './sheet';
import { AppText, Button, Chip } from './ui';

const MAX_KM = 20;
/** sqrt scale so 1 km and 20 km both fit on one phone-sized map. */
const scale = (km: number) => Math.sqrt(Math.min(km, MAX_KM) / MAX_KM);

export function countInRadius(km: number) {
  const inShops = shops.filter((s) => km === 0 || s.km <= km);
  const ids = new Set(inShops.map((s) => s.id));
  const inDeals = deals.filter((d) => ids.has(d.shopId) && !isEnded(d));
  const farthest = inShops.reduce((m, s) => Math.max(m, s.km), 0);
  return { shops: inShops.length, deals: inDeals.length, farthest };
}

export function RadiusSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state, dispatch, t, haptic } = useStore();
  const [km, setKm] = useState(state.radius);
  const { width } = useWindowDimensions();
  const size = Math.min(Math.min(width, 520) - space.xl * 2, 340);
  const R = size / 2 - 10;

  useEffect(() => {
    if (visible) setKm(state.radius);
  }, [visible, state.radius]);

  const counts = useMemo(() => countInRadius(km), [km]);

  const pickFromTouch = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const d = Math.hypot(locationX - size / 2, locationY - size / 2) / R;
    if (d > 1.04) return;
    // nearest stop on the sqrt scale
    let best: number = RADIUS_STOPS[0];
    let bestDiff = Infinity;
    for (const stop of RADIUS_STOPS) {
      if (stop === 0) continue;
      const diff = Math.abs(scale(stop) - d);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = stop;
      }
    }
    if (best !== km) {
      setKm(best);
      haptic('select');
    }
  };

  const disc = useSharedValue(scale(km || MAX_KM));
  useEffect(() => {
    disc.value = withSpring(km === 0 ? 1 : scale(km), motion.sheet);
  }, [km, disc]);
  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: disc.value }] }));

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('radiusTitle')}
      sub={t('radiusSub')}
      footer={
        <Button
          label={t('showDeals', { n: counts.deals })}
          size="l"
          full
          onPress={() => {
            dispatch({ type: 'set', patch: { radius: km } });
            haptic('success');
            onClose();
          }}
        />
      }>
      <View style={{ alignItems: 'center', paddingHorizontal: space.xl }}>
        <View
          style={[styles.map, { width: size, height: size, borderRadius: size / 2 }]}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={pickFromTouch}
          onResponderMove={pickFromTouch}
          accessibilityRole="adjustable"
          accessibilityLabel={`${t('radiusTitle')} ${km === 0 ? t('anyDistance') : t('within', { km })}`}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => {
            const stops = RADIUS_STOPS.filter((s) => s !== 0);
            const i = stops.indexOf(km as (typeof stops)[number]);
            if (e.nativeEvent.actionName === 'increment' && i < stops.length - 1) setKm(stops[i + 1]);
            if (e.nativeEvent.actionName === 'decrement' && i > 0) setKm(stops[i - 1]);
          }}>
          {/* selected area */}
          <Animated.View
            pointerEvents="none"
            style={[styles.disc, { width: R * 2, height: R * 2, borderRadius: R, left: size / 2 - R, top: size / 2 - R }, discStyle]}
          />
          {/* rings */}
          {RADIUS_STOPS.filter((s) => s !== 0).map((stop) => {
            const r = R * scale(stop);
            const on = km === 0 || stop <= km;
            return (
              <View
                key={stop}
                pointerEvents="none"
                style={[
                  styles.ring,
                  { width: r * 2, height: r * 2, borderRadius: r, left: size / 2 - r, top: size / 2 - r },
                  on && { borderColor: 'rgba(246,207,114,0.35)' },
                ]}>
                {(stop === km || stop === MAX_KM) && (
                  <View style={[styles.ringLabel, stop === km && styles.ringLabelOn]}>
                    <AppText variant="micro" tone={stop === km ? color.onGold : color.muted}>
                      {stop} km
                    </AppText>
                  </View>
                )}
              </View>
            );
          })}
          {/* shop pins */}
          {shops.map((s) => {
            const r = R * scale(s.km);
            const a = (s.bearing * Math.PI) / 180;
            return (
              <Pin
                key={s.id}
                x={size / 2 + r * Math.sin(a)}
                y={size / 2 - r * Math.cos(a)}
                inside={km === 0 || s.km <= km}
                delay={Math.round(s.km * 25)}
              />
            );
          })}
          {/* you */}
          <View pointerEvents="none" style={[styles.me, { left: size / 2 - 18, top: size / 2 - 34 }]}>
            <MapPin size={36} color="#FFFFFF" fill={color.orange} strokeWidth={1.6} />
          </View>
        </View>

        <View style={styles.stops}>
          {RADIUS_STOPS.map((stop) => (
            <Chip
              key={stop}
              label={stop === 0 ? t('any') : `${stop} km`}
              selected={km === stop}
              onPress={() => {
                setKm(stop);
                haptic('select');
              }}
              style={{ minHeight: 44 }}
            />
          ))}
        </View>

        <View style={styles.readout} accessibilityLiveRegion="polite">
          <AppText variant="heading" center>
            {t('radiusLine', { d: counts.deals, s: counts.shops })}
          </AppText>
          {counts.farthest > 0 && (
            <AppText variant="small" tone={color.muted} center>
              {t('radiusFar', { m: rideMinutes(counts.farthest) })}
            </AppText>
          )}
        </View>
      </View>
    </Sheet>
  );
}

function Pin({ x, y, inside, delay }: { x: number; y: number; inside: boolean; delay: number }) {
  const s = useSharedValue(inside ? 1 : 0.55);
  useEffect(() => {
    s.value = withDelay(inside ? delay : 0, withSpring(inside ? 1 : 0.55, motion.pop));
  }, [inside, delay, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pin, { left: x - 7, top: y - 7 }, inside ? styles.pinOn : styles.pinOff, style]}
    />
  );
}

const styles = StyleSheet.create({
  map: { backgroundColor: '#0A0B26', overflow: 'hidden', marginBottom: space.l },
  disc: { position: 'absolute', backgroundColor: 'rgba(255,107,0,0.14)', borderWidth: 2, borderColor: color.orange },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderStyle: 'dashed', alignItems: 'center' },
  ringLabel: { position: 'absolute', top: -9, paddingHorizontal: 6, borderRadius: 8, backgroundColor: '#0A0B26' },
  ringLabelOn: { backgroundColor: color.gold },
  pin: { position: 'absolute', width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: color.paper },
  pinOn: { backgroundColor: color.gold },
  pinOff: { backgroundColor: color.faint, opacity: 0.6 },
  me: { position: 'absolute' },
  stops: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, justifyContent: 'center' },
  readout: { marginTop: space.l, gap: 2, minHeight: 56 },
});
