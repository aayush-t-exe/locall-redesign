import { type Category, type Deal, deals, shopById } from '@/data/catalog';

import { endsAt, hoursLeft, isEnded, isOpen, pctOff } from './format';

type Filters = { radius: number; category: 'all' | Category; openNow: boolean; now?: number };

export function liveDeals(now = Date.now()) {
  return deals.filter((d) => !isEnded(d, now));
}

export function filterDeals({ radius, category, openNow, now = Date.now() }: Filters) {
  return liveDeals(now)
    .filter((d) => {
      const shop = shopById[d.shopId];
      if (radius && shop.km > radius) return false;
      if (category !== 'all' && d.category !== category) return false;
      if (openNow && !isOpen(shop)) return false;
      return true;
    })
    .sort((a, b) => shopById[a.shopId].km - shopById[b.shopId].km || pctOff(b) - pctOff(a));
}

/** Deals that end today (by the calendar, not a rolling window), soonest first. */
export function endingToday(radius: number, now = Date.now()) {
  const today = new Date(now).toDateString();
  return liveDeals(now)
    .filter((d) => new Date(endsAt(d)).toDateString() === today && (!radius || shopById[d.shopId].km <= radius))
    .sort((a, b) => hoursLeft(a, now) - hoursLeft(b, now));
}

/** People type in English, Hindi and Hinglish; map the common words onto categories. */
const SYNONYMS: Record<string, string[]> = {
  food: ['khana', 'खाना', 'food', 'snacks', 'nashta'],
  clothes: ['kapde', 'kapda', 'कपड़े', 'dress', 'clothes', 'cloths'],
  grocery: ['kirana', 'किराना', 'ration', 'grocery'],
  household: ['bartan', 'बर्तन', 'utensils', 'kitchen', 'household'],
  furniture: ['furniture', 'kursi', 'कुर्सी', 'chair', 'table'],
  salon: ['salon', 'parlour', 'parlor', 'haircut', 'baal', 'सैलून'],
};
/** Words that belong to one shop rather than a whole category. */
const SHOP_WORDS: Record<string, string[]> = {
  'sharma-sweets': ['mithai', 'मिठाई', 'sweets', 'sweet'],
  'sahu-veg': ['sabzi', 'sabji', 'सब्ज़ी', 'vegetables', 'veggies'],
};

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{M}\p{N}\s]/gu, '').trim();

export function searchDeals(q: string): Deal[] {
  const query = norm(q);
  if (!query) return [];
  const words = query.split(/\s+/).map((w) => w.replace(/s$/, ''));
  return liveDeals()
    .map((d) => {
      const shop = shopById[d.shopId];
      const hay = norm(
        [d.title, d.titleHi, d.unit, shop.name, shop.nameHi, shop.area, d.category, ...(SYNONYMS[d.category] ?? []), ...(SHOP_WORDS[shop.id] ?? [])].join(' '),
      );
      const hits = words.filter((w) => w.length > 1 && hay.includes(w)).length;
      return { d, score: hits / words.length };
    })
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score || shopById[a.d.shopId].km - shopById[b.d.shopId].km)
    .map((x) => x.d);
}

export const POPULAR_SEARCHES = ['momos', 'kurta', 'jalebi', 'haircut', 'sabzi', 'biryani'];
