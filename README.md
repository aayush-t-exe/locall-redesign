# Locall redesign: Home, History, Profile

A redesign of the [Locall](https://locall.co.in) app's three main screens, built as a working Expo (React Native) app.

- **Case study** (audit, design system, components, guidelines, suggestions): `/case-study/` on the live site
- **Prototype** (web build of the app): `/` on the live site
- **Run it on a phone:** see [Run it](#run-it)

> All shops, prices, ratings and people in the app are sample data for Durg and Bhilai. "Momo Land" and "Navneet Kirana Stores" come from Locall's own demo screenshots.

## What was asked, and where it is

| Asked | Where |
|---|---|
| a) Redesigned UI screens | `src/app/(tabs)/index.tsx` (Home), `history.tsx`, `profile.tsx`, plus deal, shop and search screens that the journeys need |
| b) Colour palette and typography | `src/theme/tokens.ts` (contrast ratios next to each colour) and the case study's "Design system" section |
| c) Reusable components and guidelines | `src/components/*` and the case study's "Components" and "Guidelines" sections |
| d) Interactive prototype | The app itself. The case study embeds it in a phone frame with 5 playable journeys |
| e) UX suggestions | The case study's "Audit" (17 numbered issues on the real screens) and "Suggestions" (10 ranked ideas) |

## The main changes

- **Home:** deals start on the first screen. Six km chips became one "Within 3 km" chip that opens a radius map. Every deal card shows item, shop, rating, distance with walk/ride time, price vs MRP and end time, and nothing floats over it.
- **History:** holds what the brief asked for, past searches and bookmarks: Saved (grouped by ending soon / still on / ended) · Searches (re-run in one tap) · Viewed. Removals have Undo.
- **Profile:** "You saved ₹X at N local shops" with a milestone bar, orders with pickup codes, followed shops, reviews, and a live English ⇄ हिन्दी switch. No coordinates on screen.
- **Accessibility:** every text colour is at least 4.5:1, touch targets are 44–56 dp, icons have labels, layouts handle 2× font size, and reduce motion turns animations off.

## Run it

```bash
npm install
npx expo start          # press w for web, or scan the QR with Expo Go on Android
```

Web build (what's deployed):

```bash
npx expo export -p web  # outputs dist/, including dist/case-study/
```

## Structure

```
src/
  theme/tokens.ts     colours (+ contrast ratios), type scale, spacing, radius, motion springs
  i18n/strings.ts     English + Hindi strings
  data/catalog.ts     sample shops, deals, orders, reviews (Durg / Bhilai)
  store/store.tsx     saved deals, searches, viewed, follows, cart, orders, language (persisted)
  lib/format.ts       ₹ formatting, distance + travel time, honest end-time labels
  lib/query.ts        filters, "ending today", Hinglish-aware search
  components/         deal-card, radius-sheet, sheet, sheets, tab-bar, toast, shop-bits, ui
  app/                (tabs)/index · history · profile, deal/[id], shop/[id], search
public/case-study/    the case study page (static HTML)
```

Stack: Expo SDK 58, React Native 0.88, Expo Router, Reanimated 4, expo-image, expo-haptics, lucide-react-native, AsyncStorage, TypeScript.

## Credits

Food and shop photos are from Pexels (Pexels licence). The list is in `assets/images/deals/CREDITS.md`. The Locall logo belongs to Localstack Market Pvt Ltd and is used here only to show the redesign in context.
