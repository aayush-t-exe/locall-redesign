import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  CircleHelp,
  Home as HomeIcon,
  Languages,
  LogOut,
  Package,
  Pencil,
  PiggyBank,
  RotateCcw,
  Sparkles,
  Star,
  UserRound,
} from '@/components/icons';
import { type LucideIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, EmptyState, IconButton, Pressy, SectionHeader, Segmented } from '@/components/ui';
import { DEMO_USER, dealById, seedReviews, shopById } from '@/data/catalog';
import { images } from '@/data/images';
import { pick, rupees } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, motion, radius, space, TOUCH } from '@/theme/tokens';

const MILESTONES = [100, 250, 500, 1000, 2500, 5000];

export default function Profile() {
  const { state, dispatch, t, haptic, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState(true);

  const savedTotal = state.orders.reduce((s, o) => s + o.saved, 0);
  const shopCount = new Set(state.orders.map((o) => dealById[o.dealId]?.shopId)).size;
  const goal = MILESTONES.find((m) => m > savedTotal) ?? MILESTONES[MILESTONES.length - 1];
  const reviews = state.newUser ? [] : seedReviews;
  const followed = state.following.map((id) => shopById[id]).filter(Boolean);
  const name = pick(DEMO_USER, 'name', 'nameHi', state.lang);
  const initials = DEMO_USER.name.split(' ').map((p) => p[0]).join('');

  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.l, paddingBottom: space.huge }} showsVerticalScrollIndicator={false}>
      {/* Identity */}
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <AppText variant="title" tone={color.navy}>
            {initials}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="title" numberOfLines={1}>
            {name}
          </AppText>
          <View style={styles.verified}>
            <BadgeCheck size={16} color={color.success} strokeWidth={2.4} />
            <AppText variant="small" weight="700" tone={color.success}>
              {t('verified')}
            </AppText>
            <AppText variant="small" tone={color.muted}>
              · {DEMO_USER.phone}
            </AppText>
          </View>
        </View>
        <IconButton icon={Pencil} label={t('edit')} bg={color.sunk} />
      </View>

      {/* Savings hero */}
      <SavingsCard total={savedTotal} shops={shopCount} goal={goal} />

      {/* Stats */}
      <View style={styles.stats}>
        <Stat value={state.orders.length} label={t('orders')} />
        <Stat value={state.following.length} label={t('followingStat')} />
        <Stat value={reviews.length} label={t('reviewsStat')} />
      </View>

      {/* Following */}
      {followed.length > 0 && (
        <View style={styles.block}>
          <SectionHeader title={t('shopsYouFollow')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.s }}>
            {followed.map((s) => (
              <Pressy
                key={s.id}
                onPress={() => router.push({ pathname: '/shop/[id]', params: { id: s.id } })}
                accessibilityRole="link"
                accessibilityLabel={s.name}
                style={styles.followChip}>
                <Image alt={s.name} source={images[s.image]} style={styles.followImg} contentFit="cover" />
                <View style={{ maxWidth: 150 }}>
                  <AppText variant="label" weight="700" numberOfLines={1}>
                    {pick(s, 'name', 'nameHi', state.lang)}
                  </AppText>
                  <AppText variant="small" tone={color.muted} numberOfLines={1}>
                    {pick(s, 'area', 'areaHi', state.lang)}
                  </AppText>
                </View>
              </Pressy>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Orders */}
      <View style={styles.block}>
        <SectionHeader title={t('myOrders')} />
        {state.orders.length === 0 ? (
          <View style={[styles.panel, { marginHorizontal: space.xl }]}>
            <EmptyState
              icon={Package}
              title={t('noOrdersTitle')}
              body={t('noOrdersBody')}
              action={t('browseDeals')}
              onAction={() => router.navigate('/')}
              style={{ paddingVertical: space.xxl }}
            />
          </View>
        ) : (
          <View style={[styles.panel, { marginHorizontal: space.xl }]}>
            {state.orders.slice(0, 4).map((o, i) => {
              const d = dealById[o.dealId];
              const shop = shopById[d.shopId];
              const ready = o.status === 'reserved';
              return (
                <View key={o.id}>
                  {i > 0 && <View style={styles.sep} />}
                  <Pressable
                    style={styles.orderRow}
                    accessibilityRole="link"
                    onPress={() => router.push({ pathname: '/deal/[id]', params: { id: d.id } })}>
                    <Image alt={d.title} source={images[d.image]} style={styles.orderImg} contentFit="cover" />
                    <View style={{ flex: 1, gap: 1 }}>
                      <AppText variant="bodyStrong" numberOfLines={1}>
                        {pick(d, 'title', 'titleHi', state.lang)}
                      </AppText>
                      <AppText variant="small" tone={color.inkSoft} numberOfLines={1}>
                        {pick(shop, 'name', 'nameHi', state.lang)} · {pick(o, 'dateLabel', 'dateLabelHi', state.lang)}
                      </AppText>
                      <View style={[styles.status, ready ? styles.statusReady : styles.statusDone]}>
                        <AppText variant="micro" tone={ready ? color.orangeDeep : color.success}>
                          {ready ? `${t('reserved')} · ${t('pickupCode', { c: o.code ?? '' })}` : t('pickedUp')}
                        </AppText>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <AppText variant="bodyStrong">{rupees(o.paid)}</AppText>
                      <AppText variant="small" weight="700" tone={color.success}>
                        −{rupees(o.saved)}
                      </AppText>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Reviews */}
      {reviews.length > 0 && (
        <View style={styles.block}>
          <SectionHeader title={t('myReviews')} />
          <View style={{ paddingHorizontal: space.xl, gap: space.s }}>
            {reviews.map((r) => {
              const shop = shopById[r.shopId];
              return (
                <View key={r.id} style={[styles.panel, { padding: space.l, gap: 6 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} strokeWidth={0} color={color.star} fill={n <= r.stars ? color.star : color.line} />
                    ))}
                    <AppText variant="small" tone={color.muted} style={{ marginLeft: space.s }}>
                      {pick(r, 'when', 'whenHi', state.lang)}
                    </AppText>
                  </View>
                  <AppText variant="body">“{pick(r, 'text', 'textHi', state.lang)}”</AppText>
                  <AppText variant="small" weight="700" tone={color.inkSoft}>
                    {pick(shop, 'name', 'nameHi', state.lang)}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Settings */}
      <View style={styles.block}>
        <SectionHeader title={t('settings')} />
        <View style={[styles.panel, { marginHorizontal: space.xl }]}>
          <View style={styles.langRow}>
            <View style={styles.rowIcon}>
              <Languages size={20} color={color.navy} strokeWidth={2.2} />
            </View>
            <AppText variant="bodyStrong" style={{ flex: 1 }}>
              {t('language')}
            </AppText>
            <View style={{ width: 170 }}>
              <Segmented
                value={state.lang}
                onChange={(lang) => {
                  dispatch({ type: 'set', patch: { lang } });
                  haptic('select');
                }}
                items={[
                  { key: 'en', label: 'English' },
                  { key: 'hi', label: 'हिन्दी' },
                ]}
              />
            </View>
          </View>
          <View style={styles.sep} />
          <Row icon={Bell} title={t('notifications')} sub={t('notificationsSub')}>
            <Switch
              value={alerts}
              onValueChange={setAlerts}
              trackColor={{ true: color.orangeStrong, false: color.lineStrong }}
              thumbColor="#FFFFFF"
              accessibilityLabel={t('notifications')}
            />
          </Row>
          <View style={styles.sep} />
          <Row icon={HomeIcon} title={t('addresses')} sub={t('addressesSub')} chevron />
          <View style={styles.sep} />
          <Row icon={CircleHelp} title={t('help')} chevron />
          <View style={styles.sep} />
          <Row icon={LogOut} title={t('signOut')} danger />
        </View>
      </View>

      {/* Prototype controls */}
      <View style={styles.block}>
        <SectionHeader title={t('prototype')} sub={t('sampleData')} />
        <View style={[styles.panel, styles.protoPanel, { marginHorizontal: space.xl }]}>
          <Row icon={UserRound} title={t('newUser')} sub={t('newUserSub')}>
            <Switch
              value={state.newUser}
              onValueChange={(on) => {
                dispatch({ type: 'setNewUser', on });
                haptic('select');
              }}
              trackColor={{ true: color.navy, false: color.lineStrong }}
              thumbColor="#FFFFFF"
              accessibilityLabel={t('newUser')}
            />
          </Row>
          <View style={styles.sep} />
          <Row
            icon={RotateCcw}
            title={t('resetDemo')}
            onPress={() => {
              dispatch({ type: 'reset' });
              showToast({ message: t('resetDemo') });
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function SavingsCard({ total, shops, goal }: { total: number; shops: number; goal: number }) {
  const { t } = useStore();
  const shown = useCountUp(total);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(250, withSpring(Math.min(total / goal, 1), motion.sheet));
  }, [total, goal, progress]);
  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  if (total === 0) {
    return (
      <View style={[styles.hero, { gap: space.m }]}>
        <View style={styles.heroIcon}>
          <PiggyBank size={26} color={color.orange} strokeWidth={2.2} />
        </View>
        <AppText variant="heading" tone="#FFFFFF">
          {t('startSaving')}
        </AppText>
        <Button label={t('browseDeals')} onPress={() => router.navigate('/')} style={{ alignSelf: 'flex-start' }} />
      </View>
    );
  }

  return (
    <View style={styles.hero} accessible accessibilityLabel={`${t('youSaved')} ${rupees(total)} ${t('thisMonth', { n: shops })}`}>
      <View style={styles.heroTop}>
        <AppText variant="label" tone="#C9D3EA">
          {t('youSaved')}
        </AppText>
        <Sparkles size={20} color={color.orange} strokeWidth={2.2} />
      </View>
      <AppText style={styles.heroAmount} tone="#FFFFFF" variant="display">
        {rupees(shown)}
      </AppText>
      <AppText variant="body" tone="#E3E8F4">
        {t('thisMonth', { n: shops })}
      </AppText>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, bar]} />
      </View>
      <AppText variant="small" tone="#C9D3EA">
        {t('nextMilestone', { n: Math.max(goal - total, 0).toLocaleString('en-IN'), goal: goal.toLocaleString('en-IN') })}
      </AppText>
    </View>
  );
}

function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) return setValue(target);
      const start = performance.now();
      const from = 0;
      const tick = (now: number) => {
        const p = Math.min((now - start) / 900, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(from + (target - from) * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [target]);
  return value;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="small" tone={color.muted} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function Row({
  icon: Icon,
  title,
  sub,
  chevron,
  danger,
  onPress,
  children,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
  chevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <View style={[styles.rowIcon, danger && { backgroundColor: color.dangerTint }]}>
        <Icon size={20} color={danger ? color.danger : color.navy} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" tone={danger ? color.danger : color.ink}>
          {title}
        </AppText>
        {sub ? (
          <AppText variant="small" tone={color.muted}>
            {sub}
          </AppText>
        ) : null}
      </View>
      {children}
      {chevron && <ChevronRight size={20} color={color.muted} />}
    </>
  );
  if (children) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable style={styles.row} accessibilityRole="button" onPress={onPress}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.xl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.navyTint, alignItems: 'center', justifyContent: 'center' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hero: {
    marginHorizontal: space.xl,
    marginTop: space.xl,
    padding: space.xl,
    borderRadius: radius.xxl,
    backgroundColor: color.ink,
    gap: 4,
    overflow: 'hidden',
  },
  heroIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,107,0,0.16)', alignItems: 'center', justifyContent: 'center' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroAmount: { fontSize: 44, lineHeight: 52 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.14)', marginTop: space.m, marginBottom: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5, backgroundColor: color.orange },
  stats: { flexDirection: 'row', gap: space.s, paddingHorizontal: space.xl, marginTop: space.m },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.m,
    backgroundColor: color.card,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: color.line,
  },
  block: { marginTop: space.xxl },
  followChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    padding: 6,
    paddingRight: space.l,
    borderRadius: radius.pill,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
  },
  followImg: { width: 40, height: 40, borderRadius: 20 },
  panel: { backgroundColor: color.card, borderRadius: radius.xl, borderWidth: 1, borderColor: color.line, overflow: 'hidden' },
  protoPanel: { borderStyle: 'dashed', borderColor: color.lineStrong, backgroundColor: '#FFFDF9' },
  sep: { height: 1, backgroundColor: color.line, marginLeft: 68 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, paddingLeft: space.l },
  orderImg: { width: 52, height: 52, borderRadius: radius.m },
  status: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, marginTop: 4 },
  statusDone: { backgroundColor: color.successTint },
  statusReady: { backgroundColor: color.orangeTint },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: TOUCH + 16, paddingHorizontal: space.l, paddingVertical: space.s },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: TOUCH + 16, paddingHorizontal: space.l, paddingVertical: space.s },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.navyTint, alignItems: 'center', justifyContent: 'center' },
});
