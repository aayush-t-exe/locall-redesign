import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpRight, Bookmark, Clock, Eye, Search, X } from '@/components/icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RowCard, SaveButton } from '@/components/deal-card';
import { Eyebrow, Gold3D, Lux, Sky } from '@/components/night';
import { useDockSpace } from '@/components/tab-bar';
import { AppText, EmptyState, IconButton, Segmented } from '@/components/ui';
import { type Deal, dealById } from '@/data/catalog';
import { hoursLeft, isEnded, rupees, timeAgo } from '@/lib/format';
import { useStore } from '@/store/store';
import { color, radius, space } from '@/theme/tokens';

type TabKey = 'saved' | 'searches' | 'viewed';

export default function History() {
  const { state, dispatch, t, showToast, haptic, now } = useStore();
  const insets = useSafeAreaInsets();
  const dock = useDockSpace();
  const { width } = useWindowDimensions();
  const narrow = width < 360;
  const params = useLocalSearchParams<{ tab?: TabKey }>();
  const [tab, setTab] = useState<TabKey>(params.tab ?? 'saved');

  useEffect(() => {
    if (params.tab) setTab(params.tab);
  }, [params.tab]);

  const saved = state.saved.map((s) => dealById[s.id]).filter(Boolean);
  const ended = saved.filter((d) => isEnded(d, now));
  const live = saved.filter((d) => !isEnded(d, now)).sort((a, b) => hoursLeft(a, now) - hoursLeft(b, now));
  const soon = live.filter((d) => hoursLeft(d, now) < 24);
  const later = live.filter((d) => hoursLeft(d, now) >= 24);
  const toSave = live.reduce((s, d) => s + (d.mrp - d.price), 0);
  const viewed = state.viewed.map((v) => ({ deal: dealById[v.id], at: v.at })).filter((v) => v.deal);

  const goHome = () => router.navigate('/');

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.l, paddingBottom: dock }} showsVerticalScrollIndicator={false}>
        <Sky kind="history" />
        <View style={[styles.head, narrow && { paddingRight: 112 }]}>
          <Gold3D k="bookmark" size={narrow ? 104 : 150} style={[styles.obj, narrow && { top: -4, right: 0 }]} />
          <AppText variant="display" accessibilityRole="header" style={{ fontSize: 34, lineHeight: 38, letterSpacing: -1 }}>
            {t('historyTitle')}
          </AppText>
          <Lux size={22} tone={color.muted} style={{ marginTop: 4 }}>
            {t('savedSteals')}
          </Lux>
          {live.length > 0 && (
            <AppText variant="label" tone={color.muted} style={{ marginTop: space.m }}>
              {t('savedN', { n: live.length })} ·{' '}
              <AppText variant="label" weight="800" tone={color.gold}>
                {rupees(toSave)}
              </AppText>{' '}
              {t('toSaveTail')}
            </AppText>
          )}
        </View>

        <View style={{ paddingHorizontal: space.xl, marginTop: space.xl }}>
          <Segmented<TabKey>
            value={tab}
            onChange={(k) => {
              setTab(k);
              haptic('select');
            }}
            items={[
              { key: 'saved', label: t('tabSaved'), count: saved.length },
              { key: 'searches', label: t('tabSearches'), count: narrow ? undefined : state.searches.length },
              { key: 'viewed', label: t('tabViewed') },
            ]}
          />
        </View>

        <Animated.View key={tab} entering={FadeIn.duration(180)} style={{ marginTop: space.xl }}>
          {tab === 'saved' &&
            (saved.length === 0 ? (
              <EmptyState icon={Bookmark} title={t('emptySavedTitle')} body={t('emptySavedBody')} action={t('browseDeals')} onAction={goHome} />
            ) : (
              <View style={{ gap: space.xxl }}>
                <Group title={t('endingSoon')} deals={soon} urgent />
                <Group title={t('active')} deals={later} />
                <Group title={t('ended')} deals={ended} ended />
              </View>
            ))}

          {tab === 'searches' &&
            (state.searches.length === 0 ? (
              <EmptyState icon={Search} title={t('emptySearchTitle')} body={t('emptySearchBody')} action={t('searchTitle')} onAction={() => router.push('/search')} />
            ) : (
              <View style={{ paddingHorizontal: space.xl }}>
                <View style={styles.groupHead}>
                  <Eyebrow label={t('recentSearches')} align="left" style={{ flex: 1, paddingHorizontal: 0 }} />
                  <Pressable
                    hitSlop={12}
                    accessibilityRole="button"
                    style={styles.clearAll}
                    onPress={() => {
                      const before = state.searches;
                      dispatch({ type: 'restoreSearches', searches: [] });
                      showToast({ message: t('removed'), actionLabel: t('undo'), onAction: () => dispatch({ type: 'restoreSearches', searches: before }) });
                    }}>
                    <AppText variant="label" weight="700" tone={color.gold}>
                      {t('clearAll')}
                    </AppText>
                  </Pressable>
                </View>
                <View style={styles.list}>
                  {state.searches.map((s, i) => (
                    <Animated.View key={s.q} layout={LinearTransition} exiting={FadeOut.duration(150)}>
                      {i > 0 && <View style={styles.sep} />}
                      <View style={styles.searchRow}>
                        <Pressable
                          style={styles.searchMain}
                          accessibilityRole="button"
                          accessibilityLabel={`${t('searchAgain')}: ${s.q}`}
                          onPress={() => router.push({ pathname: '/search', params: { q: s.q } })}>
                          <View style={styles.searchIcon}>
                            <Clock size={18} color={color.gold} strokeWidth={2.2} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <AppText variant="bodyStrong" numberOfLines={1}>
                              {s.q}
                            </AppText>
                            <AppText variant="small" tone={color.muted}>
                              {timeAgo(s.at, t)}
                            </AppText>
                          </View>
                          <ArrowUpRight size={20} color={color.gold} strokeWidth={2.4} />
                        </Pressable>
                        <IconButton
                          icon={X}
                          label={`${t('remove')}: ${s.q}`}
                          size={44}
                          bg="transparent"
                          tone={color.muted}
                          onPress={() => {
                            const before = state.searches;
                            dispatch({ type: 'removeSearch', q: s.q });
                            showToast({ message: t('removed'), actionLabel: t('undo'), onAction: () => dispatch({ type: 'restoreSearches', searches: before }) });
                          }}
                        />
                      </View>
                    </Animated.View>
                  ))}
                </View>
              </View>
            ))}

          {tab === 'viewed' &&
            (viewed.length === 0 ? (
              <EmptyState icon={Eye} title={t('emptyViewedTitle')} body={t('emptyViewedBody')} action={t('browseDeals')} onAction={goHome} />
            ) : (
              <View style={{ paddingHorizontal: space.xl, gap: space.m }}>
                {viewed.map(({ deal, at }) => (
                  <View key={deal.id}>
                    <AppText variant="small" tone={color.muted} style={{ marginBottom: 6, marginLeft: 4 }}>
                      {timeAgo(at, t)}
                    </AppText>
                    <RowCard deal={deal} dim={isEnded(deal, now)} trailing={<SaveButton dealId={deal.id} variant="plain" />} />
                  </View>
                ))}
              </View>
            ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Group({ title, deals, urgent, ended }: { title: string; deals: Deal[]; urgent?: boolean; ended?: boolean }) {
  const { t } = useStore();
  if (!deals.length) return null;
  return (
    <View style={{ paddingHorizontal: space.xl }}>
      <Eyebrow label={`${title} · ${deals.length}`} align="left" dot={urgent} tone={urgent ? color.orangeText : color.muted} style={{ paddingHorizontal: 0, marginBottom: space.m }} />
      <View style={{ gap: space.m }}>
        {deals.map((d, i) => (
          <Animated.View key={d.id} layout={LinearTransition} exiting={FadeOut.duration(150)}>
            <RowCard
              deal={d}
              dim={ended}
              glow={urgent && i === 0}
              ends={!ended}
              trailing={
                ended ? (
                  <Pressable accessibilityRole="button" style={styles.similar} onPress={() => router.push({ pathname: '/search', params: { q: d.category } })}>
                    <AppText variant="small" weight="800" tone={color.gold}>
                      {t('seeSimilar')}
                    </AppText>
                  </Pressable>
                ) : (
                  <SaveButton dealId={d.id} variant="plain" />
                )
              }
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: space.xl, minHeight: 140 },
  obj: { position: 'absolute', right: 4, top: -12, transform: [{ rotate: '12deg' }] },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: space.s, marginBottom: space.m },
  list: { backgroundColor: color.card, borderRadius: radius.xl, borderWidth: 1, borderColor: color.line, overflow: 'hidden' },
  sep: { height: 1, backgroundColor: color.line, marginLeft: 68 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingRight: space.xs },
  searchMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, paddingLeft: space.l },
  searchIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.goldTint, alignItems: 'center', justifyContent: 'center' },
  similar: { minHeight: 44, justifyContent: 'center' },
  clearAll: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end' },
});
