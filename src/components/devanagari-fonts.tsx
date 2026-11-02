import * as Font from 'expo-font';
import { useEffect } from 'react';

import { useStore } from '@/store/store';

/** Loads the Devanagari faces the first time the app is in Hindi (~870 KB the English app never needs). */
export function DevanagariFonts() {
  const { state } = useStore();
  useEffect(() => {
    if (state.lang !== 'hi') return;
    import('@expo-google-fonts/noto-sans-devanagari').then((m) =>
      Font.loadAsync({
        NotoSansDevanagari_400Regular: m.NotoSansDevanagari_400Regular,
        NotoSansDevanagari_500Medium: m.NotoSansDevanagari_500Medium,
        NotoSansDevanagari_600SemiBold: m.NotoSansDevanagari_600SemiBold,
        NotoSansDevanagari_700Bold: m.NotoSansDevanagari_700Bold,
      }).catch(() => {}),
    );
  }, [state.lang]);
  return null;
}
