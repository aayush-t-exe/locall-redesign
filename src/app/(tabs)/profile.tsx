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
  Check,
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

import { Gold3D, GoldFill, GoldNumber, GlowEllipse, Lux, Photo, Sky } from '@/components/night';
import { useDockSpace } from '@/components/tab-bar';
import { AppText, Button, EmptyState, IconButton, Pressy, SectionHeader, Segmented } from '@/components/ui';
import { AREAS, DEMO_USER, dealById, seedReviews, shopById } from '@/data/catalog';
import { pick, rupees } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, motion, radius, space, TOUCH } from '@/theme/tokens';

const MILESTONES = [100, 250, 500, 1000, 2500, 5000];

export default function Profile() {
  const { state, dispatch, t, haptic, showToast } = useStore();
  const insets = useSafeAreaInsets();
  const dock = useDockSpace();
  const [alerts, setAlerts] = useState(true);

  const orders = state.orders.filter((o) => dealById[o.dealId]);
  const picked = orders.filter((o) => o.status === 'picked');
  const savedTotal = picked.reduce((s, o) => s + o.saved, 0);
  const shopCount = new Set(picked.map((o) => dealById[o.dealId].shopId)).size;
  const notInPrototype = () => showToast({ message: t('prototypeOnly') });
  const goal = MILESTONES.find((m) => m > savedTotal) ?? MILESTONES[MILESTONES.length - 1];
  const reviews = state.newUser ? [] : seedReviews;
  const followed = state.following.map((id) => shopById[id]).filter(Boolean);
  const name = pick(DEMO_USER, 'name', 'nameHi', state.lang);
  const initials = DEMO_USER.name.split(' ').map((p) => p[0]).join('');

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.m, paddingBottom: dock }} showsVerticalScrollIndicator={false}>
      <Sky kind="profile" height={640} />
      {/* Identity */}
      <View style={styles.identity}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <AppText variant="title" style={{ fontSize: 19 }}>
              {initials}
            </AppText>
          </View>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={styles.verified}>
            <AppText variant="title" numberOfLines={1} style={{ flexShrink: 1, fontSize: 20, letterSpacing: -0.4 }}>
              {name}
            </AppText>
            <View style={styles.tick} accessibilityLabel={t('verified')}>
              <Check size={11} color="#04130C" strokeWidth={3.4} />
            </View>
          </View>
          <AppText variant="small" tone={color.muted} numberOfLines={1}>
            {pick(AREAS[state.area], 'name', 'nameHi', state.lang)} · {DEMO_USER.phone}
          </AppText>
        </View>
        <IconButton icon={Pencil} label={t('edit')} size={44} onPress={notInPrototype} />
      </View>

      {/* Savings hero */}
      <SavingsCard total={savedTotal} shops={shopCount} goal={goal} />

      {/* Stats */}
      <View style={styles.stats}>
        <Stat value={orders.length} label={t('orders')} />
        <Stat value={state.following.length} label={t('followingStat')} />
        <Stat value={reviews.length} label={t('reviewsStat')} />
      </View>
      {savedTotal > 0 && (
        <View style={styles.stats}>
          <Medal icon="medal" title={t('medalFirst')} sub={pick(picked[picked.length - 1], 'dateLabel', 'dateLabelHi', state.lang)} />
          <Medal icon="teaCup" title={t('medalChai')} sub={t('visits', { n: 5 })} />
          <Medal icon="crown" title={t('medalInsider')} sub={t('toGo', { n: rupees(Math.max(goal - savedTotal, 0)) })} locked />
        </View>
      )}

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
                <Photo k={s.ownerImage ?? s.image} alt={s.name} style={styles.followImg} art={0.7} />
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
        {orders.length === 0 ? (
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
            {orders.slice(0, 4).map((o, i) => {
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
                    <Photo k={d.image} alt={d.title} style={styles.orderImg} art={0.7} />
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
                      <AppText variant="small" weight="800" tone={color.gold}>
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
          <Row icon={HomeIcon} title={t('addresses')} sub={t('addressesSub')} chevron onPress={notInPrototype} />
          <View style={styles.sep} />
          <Row icon={CircleHelp} title={t('help')} chevron onPress={notInPrototype} />
          <View style={styles.sep} />
          <Row icon={LogOut} title={t('signOut')} danger onPress={notInPrototype} />
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
    </View>
  );
}

function SavingsCard({ total, shops, goal }: { total: number; shops: number; goal: number }) {
  const { t } = useStore();
  const shown = useCountUp(total);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(350, withSpring(Math.min(total / goal, 1), motion.sheet));
  }, [total, goal, progress]);
  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const pct = Math.round(Math.min(total / goal, 1) * 100);

  if (total === 0) {
    return (
      <View style={[styles.hero, { gap: space.m }]}>
        <Gold3D k="moneyBag" size={120} />
        <AppText variant="heading" center>
          {t('startSaving')}
        </AppText>
        <Button label={t('browseDeals')} onPress={() => router.navigate('/')} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.hero} accessible accessibilityLabel={`${t('youSaved')} ${rupees(total)} ${t('thisMonthAt', { n: shops })}`}>
        <GlowEllipse w={320} h={190} o={0.1} style={[styles.ring, { top: 0 }]} />
        <GlowEllipse w={250} h={150} o={0.2} style={[styles.ring, { top: 22 }]} />
        <Gold3D k="rupee" size={176} style={styles.coin} />
        <Lux size={25}>{t('youSavedLux')}</Lux>
        <GoldNumber value={rupees(shown)} size={60} style={{ marginTop: 4 }} />
        <AppText variant="label" tone={color.muted} center style={{ marginTop: 4 }}>
          {t('thisMonthAt', { n: shops })}
        </AppText>
      </View>
      <View style={styles.goal}>
        <View style={styles.goalTop}>
          <AppText variant="label" weight="700" style={{ flex: 1 }}>
            {t('insiderGoal', { n: rupees(Math.max(goal - total, 0)) })}
          </AppText>
          <AppText variant="small" weight="700" tone={color.muted}>
            {pct}%
          </AppText>
        </View>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, bar]}>
            <GoldFill radius={6} />
          </Animated.View>
        </View>
        <View style={styles.goalTop}>
          <AppText variant="micro" tone={color.faint} style={{ flex: 1 }}>
            ₹0
          </AppText>
          <AppText variant="micro" tone={color.faint}>
            {rupees(goal)}
          </AppText>
        </View>
      </View>
    </>
  );
}

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
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
      <AppText variant="title" style={{ fontSize: 24, lineHeight: 28, letterSpacing: -0.6 }}>
        {value}
      </AppText>
      <AppText variant="small" weight="600" tone={color.muted} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

function Medal({ icon, title, sub, locked }: { icon: 'medal' | 'teaCup' | 'crown'; title: string; sub: string; locked?: boolean }) {
  return (
    <View style={[styles.stat, styles.medal, locked && { opacity: 0.5 }]}>
      <Gold3D k={icon} size={44} />
      <AppText variant="small" weight="700" center numberOfLines={1}>
        {title}
      </AppText>
      <AppText variant="micro" tone={color.muted} center numberOfLines={1}>
        {sub}
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
  avatarRing: { width: 56, height: 56, borderRadius: 28, padding: 2, backgroundColor: color.gold },
  avatar: { flex: 1, borderRadius: 26, backgroundColor: '#14143A', alignItems: 'center', justifyContent: 'center' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tick: { width: 18, height: 18, borderRadius: 9, backgroundColor: color.success, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', marginTop: space.s, paddingHorizontal: space.xl },
  ring: { position: 'absolute', alignSelf: 'center', transform: [{ rotate: '-8deg' }] },
  coin: { transform: [{ rotate: '-10deg' }], marginBottom: -2 },
  goal: { marginHorizontal: space.xl, marginTop: space.xl, padding: space.l, gap: 10, borderRadius: radius.xl, backgroundColor: color.sunk, borderWidth: 1, borderColor: color.line },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  track: { height: 10, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)' },
  fill: { height: '100%', borderRadius: 6, overflow: 'hidden', shadowColor: color.gold, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  stats: { flexDirection: 'row', gap: space.s, paddingHorizontal: space.xl, marginTop: space.m },
  medal: { alignItems: 'center', gap: 4 },
  stat: {
    flex: 1,
    alignItems: 'flex-start',
    padding: space.m,
    backgroundColor: color.sunk,
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
  protoPanel: { borderStyle: 'dashed', borderColor: color.lineStrong, backgroundColor: color.card },
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
