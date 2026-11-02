import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, SearchX, TrendingUp, X } from '@/components/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RowCard, SaveButton } from '@/components/deal-card';
import { Toast } from '@/components/toast';
import { AppText, Chip, EmptyState, IconButton, fontFor } from '@/components/ui';
import { POPULAR_SEARCHES, searchDeals } from '@/lib/query';
import { useStore } from '@/store/store';
import { color, radius, space } from '@/theme/tokens';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { state, dispatch, t } = useStore();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState(params.q ?? '');
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const results = useMemo(() => searchDeals(q), [q]);

  // Re-running a search from History moves it to the top with a fresh time.
  useEffect(() => {
    if (params.q) dispatch({ type: 'addSearch', q: params.q, results: searchDeals(params.q).length });
  }, [params.q, dispatch]);

  const commit = (value = q) => {
    if (value.trim()) dispatch({ type: 'addSearch', q: value.trim(), results: searchDeals(value).length });
  };

  // Typing then pausing on a query with results counts as a search (like most shopping apps).
  useEffect(() => {
    const query = q.trim();
    if (query.length < 3 || query === params.q || searchDeals(query).length === 0) return;
    const timer = setTimeout(() => dispatch({ type: 'addSearch', q: query, results: searchDeals(query).length }), 1500);
    return () => clearTimeout(timer);
  }, [q, params.q, dispatch]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={{ flex: 1, backgroundColor: color.paper, paddingTop: insets.top + space.s }}>
      <View style={styles.top}>
        <IconButton icon={ArrowLeft} label={t('back')} onPress={back} bg={color.sunk} />
        <View style={styles.field}>
          <TextInput
            ref={input}
            value={q}
            onChangeText={setQ}
            autoFocus={!params.q}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={color.muted}
            returnKeyType="search"
            onSubmitEditing={() => commit()}
            accessibilityLabel={t('searchTitle')}
            style={[styles.input, { fontFamily: fontFor('600', state.lang) }]}
          />
          {q.length > 0 && (
            <IconButton
              icon={X}
              label={t('close')}
              size={44}
              bg="transparent"
              tone={color.muted}
              onPress={() => {
                setQ('');
                input.current?.focus();
              }}
            />
          )}
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: space.huge }}>
        {q.trim().length === 0 ? (
          <Animated.View entering={FadeIn.duration(160)} style={{ padding: space.xl, gap: space.xxl }}>
            {state.searches.length > 0 && (
              <View style={{ gap: space.m }}>
                <AppText variant="heading">{t('recentSearches')}</AppText>
                <View style={styles.chips}>
                  {state.searches.slice(0, 6).map((s) => (
                    <Chip key={s.q} icon={Clock} label={s.q} onPress={() => { setQ(s.q); commit(s.q); }} />
                  ))}
                </View>
              </View>
            )}
            <View style={{ gap: space.m }}>
              <AppText variant="heading">{t('popularNear')}</AppText>
              <View style={styles.chips}>
                {POPULAR_SEARCHES.map((p) => (
                  <Chip key={p} icon={TrendingUp} label={p} onPress={() => { setQ(p); commit(p); }} />
                ))}
              </View>
            </View>
          </Animated.View>
        ) : results.length === 0 ? (
          <EmptyState icon={SearchX} title={t('noResults', { q })} body={t('noResultsBody')} />
        ) : (
          <View style={{ padding: space.xl, gap: space.s }}>
            <AppText variant="label" tone={color.muted}>
              {results.length === 1 ? t('resultsCountOne') : t('resultsCount', { n: results.length })}
            </AppText>
            {results.map((d) => (
              <RowCard key={d.id} deal={d} trailing={<SaveButton dealId={d.id} variant="plain" />} />
            ))}
          </View>
        )}
      </ScrollView>
      <Toast bottom={insets.bottom + space.xl} />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.l },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: color.card,
    borderWidth: 1.5,
    borderColor: color.orangeText,
    paddingLeft: space.l,
  },
  input: { flex: 1, fontSize: 16, color: color.ink, paddingVertical: 12, outlineStyle: 'none' } as object,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
});
