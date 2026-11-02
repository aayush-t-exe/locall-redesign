import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { type Category, type Order, seedOrders, dealById } from '@/data/catalog';
import { type Lang, type StringKey, strings, format } from '@/i18n/strings';

const KEY = 'locall-demo-v2';
const MIN = 60_000;

export type SearchEntry = { q: string; at: number; results: number };

type State = {
  lang: Lang;
  radius: number; // km, 0 = any
  category: 'all' | Category;
  openNow: boolean;
  area: number; // index in AREAS
  saved: { id: string; at: number }[];
  searches: SearchEntry[];
  viewed: { id: string; at: number }[];
  following: string[];
  cart: Record<string, number>;
  orders: Order[];
  newUser: boolean;
  /** Personal data parked while previewing as a new user. */
  parked?: Pick<State, 'saved' | 'searches' | 'viewed' | 'following' | 'orders'>;
};

const now = Date.now();

const initialState: State = {
  lang: 'en',
  radius: 3,
  category: 'all',
  openNow: false,
  area: 0,
  saved: [
    { id: 'd-momos', at: now - 40 * MIN },
    { id: 'd-kurta', at: now - 26 * 60 * MIN },
    { id: 'd-chair', at: now - 3 * 24 * 60 * MIN },
    { id: 'd-dryfruit', at: now - 4 * 24 * 60 * MIN },
  ],
  searches: [
    { q: 'momos', at: now - 2 * 60 * MIN, results: 1 },
    { q: 'cotton kurta', at: now - 26 * 60 * MIN, results: 1 },
    { q: 'salon', at: now - 3 * 24 * 60 * MIN, results: 1 },
    { q: 'steel bartan', at: now - 5 * 24 * 60 * MIN, results: 1 },
  ],
  viewed: [
    { id: 'd-kaju', at: now - 15 * MIN },
    { id: 'd-veg', at: now - 3 * 60 * MIN },
    { id: 'd-saree', at: now - 30 * 60 * MIN },
  ],
  following: ['sharma-sweets', 'momo-land', 'navneet-kirana', 'handloom-house'],
  cart: {},
  orders: seedOrders,
  newUser: false,
};

type Action =
  | { type: 'hydrate'; state: Partial<State> }
  | { type: 'set'; patch: Partial<State> }
  | { type: 'toggleSave'; id: string }
  | { type: 'restoreSaved'; entry: { id: string; at: number }; index: number }
  | { type: 'addSearch'; q: string; results: number }
  | { type: 'removeSearch'; q: string }
  | { type: 'restoreSearches'; searches: SearchEntry[] }
  | { type: 'view'; id: string }
  | { type: 'toggleFollow'; shopId: string }
  | { type: 'cartAdd'; id: string }
  | { type: 'cartRemove'; id: string }
  | { type: 'reserve'; code: string }
  | { type: 'claim'; id: string; code: string }
  | { type: 'setNewUser'; on: boolean }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.state };
    case 'set':
      return { ...state, ...action.patch };
    case 'toggleSave': {
      const exists = state.saved.some((s) => s.id === action.id);
      return {
        ...state,
        saved: exists ? state.saved.filter((s) => s.id !== action.id) : [{ id: action.id, at: Date.now() }, ...state.saved],
      };
    }
    case 'restoreSaved': {
      if (state.saved.some((s) => s.id === action.entry.id)) return state; // Undo tapped twice
      const next = [...state.saved];
      next.splice(action.index, 0, action.entry);
      return { ...state, saved: next };
    }
    case 'addSearch': {
      const q = action.q.trim();
      if (!q) return state;
      const rest = state.searches.filter((s) => s.q.toLowerCase() !== q.toLowerCase());
      return { ...state, searches: [{ q, at: Date.now(), results: action.results }, ...rest].slice(0, 12) };
    }
    case 'removeSearch':
      return { ...state, searches: state.searches.filter((s) => s.q !== action.q) };
    case 'restoreSearches':
      return { ...state, searches: action.searches };
    case 'view': {
      const rest = state.viewed.filter((v) => v.id !== action.id);
      return { ...state, viewed: [{ id: action.id, at: Date.now() }, ...rest].slice(0, 20) };
    }
    case 'toggleFollow': {
      const on = state.following.includes(action.shopId);
      return {
        ...state,
        following: on ? state.following.filter((f) => f !== action.shopId) : [action.shopId, ...state.following],
      };
    }
    case 'cartAdd':
      return { ...state, cart: { ...state.cart, [action.id]: (state.cart[action.id] ?? 0) + 1 } };
    case 'cartRemove': {
      const { [action.id]: _, ...rest } = state.cart;
      return { ...state, cart: rest };
    }
    case 'reserve': {
      const items = Object.entries(state.cart);
      const newOrders: Order[] = items.map(([id, qty], i) => {
        const d = dealById[id];
        return {
          id: `o-${Date.now()}-${i}`,
          dealId: id,
          dateLabel: 'Today',
          dateLabelHi: 'आज',
          saved: (d.mrp - d.price) * qty,
          paid: d.price * qty,
          status: 'reserved',
          code: action.code,
        };
      });
      return { ...state, cart: {}, orders: [...newOrders, ...state.orders] };
    }
    case 'claim': {
      // One claim per deal. Using the ticket at the counter is a completed (picked) order.
      if (state.orders.some((o) => o.dealId === action.id && o.code === action.code)) return state;
      const d = dealById[action.id];
      if (!d) return state;
      const order: Order = {
        id: `o-${Date.now()}`,
        dealId: d.id,
        dateLabel: 'Today',
        dateLabelHi: 'आज',
        saved: d.mrp - d.price,
        paid: d.price,
        status: 'picked',
        code: action.code,
      };
      return { ...state, orders: [order, ...state.orders] };
    }
    case 'setNewUser': {
      if (action.on === state.newUser) return state;
      if (action.on) {
        const { saved, searches, viewed, following, orders } = state;
        return { ...state, newUser: true, parked: { saved, searches, viewed, following, orders }, saved: [], searches: [], viewed: [], following: [], orders: [] };
      }
      return { ...state, newUser: false, ...(state.parked ?? {}), parked: undefined };
    }
    case 'reset':
      return { ...initialState, lang: state.lang };
  }
}

type Toast = { id: number; message: string; actionLabel?: string; onAction?: () => void };

type Store = {
  state: State;
  dispatch: React.Dispatch<Action>;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  toast: Toast | null;
  showToast: (t: Omit<Toast, 'id'>) => void;
  hideToast: () => void;
  haptic: (kind?: 'light' | 'success' | 'select') => void;
  /** Ticks every minute so countdowns and "ending today" stay true while the app is open. */
  now: number;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'hydrate', state: JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => format(strings[state.lang][key], vars),
    [state.lang],
  );

  const hideToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((next: Omit<Toast, 'id'>) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ ...next, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), next.onAction ? 5000 : 3200);
  }, []);

  const haptic = useCallback((kind: 'light' | 'success' | 'select' = 'light') => {
    if (Platform.OS === 'web') return;
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else if (kind === 'select') Haptics.selectionAsync().catch(() => {});
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, t, toast, showToast, hideToast, haptic, now }),
    [state, t, toast, showToast, hideToast, haptic, now],
  );

  // Render only after saved settings load: no English flash for Hindi users, no lost history.
  return <Ctx.Provider value={value}>{hydrated ? children : null}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
