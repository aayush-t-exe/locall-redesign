# Locall redesign: Home, History, Profile

A redesign of the [Locall](https://locall.co.in) app's three main screens, built as a working Expo (React Native) app. The design direction is **Locall Night**: a deep navy night, one glowing object per screen, and gold for money.

- **Prototype** (web build of the app): https://locall-redesign.vercel.app/
- **Case study:** https://locall-redesign.vercel.app/case-study/
- **Run it on a phone:** see [Run it](#run-it)

> All shops, prices, ratings and people in the app are sample data for Durg and Bhilai. "Momo Land" and "Navneet Kirana Stores" come from Locall's own demo screenshots. Call and WhatsApp buttons open Locall's real public contact number, so don't spam it while testing.

## What was asked, and where it is

| Asked | Where |
|---|---|
| a) Redesigned UI screens | `src/app/(tabs)/index.tsx` (Home), `history.tsx`, `profile.tsx`, plus deal, shop, search and claim screens that the journeys need |
| b) Colour palette and typography | `src/theme/tokens.ts`, with the contrast ratio next to each colour |
| c) Reusable components and guidelines | `src/components/*`, with `night.tsx` holding the ticket, gold number, sky glow and photo slot |
| d) Interactive prototype | The app itself |
| e) UX suggestions | The case study |

## The main changes

- **Home:** "Tonight's steal" leads, a ticket for the best deal nearby that ends soonest. Below it are eight shortcuts, one "Within 3 km" chip that opens a radius map, shops you follow, deals ending today, a local shop spotlight and the full feed.
- **History:** holds what the brief asked for, past searches and bookmarks. Saved deals are grouped by ending soon, still on and ended. Searches re-run in one tap, and Viewed lists what you opened. Removing anything shows Undo.
- **Profile:** "You saved ₹X" counts only completed orders, with a goal bar, medals, followed shops, orders and reviews. Language switches between English and हिन्दी live. No coordinates on screen.
- **Use at counter:** slide a gold knob to use a deal. The ticket shows a short code for the shopkeeper and the saving is added to Profile.
- **Accessibility:** text colours are at least 4.5:1 on the night background. Touch targets are at least 44 px, main buttons 48 to 60. Icon buttons have labels. The claim ticket's float and the savings count-up respect reduce motion.
- **Demo clock:** shop open/closed status uses a fixed 6 PM so the prototype makes sense at any hour. Deal end times use the real clock and update every minute.

## Run it

```bash
npm install
npx expo start          # press w for web, or scan the QR with Expo Go on Android
```

Web build (what's deployed):

```bash
npx expo export -p web  # outputs dist/, including dist/case-study/
```

To test the web build locally, serve `dist/` with a server that falls back to `index.html` for app routes (the `serve` package breaks `/case-study/`).

## Structure

```
src/
  theme/tokens.ts     colours (+ contrast ratios), type scale, spacing, radius, motion springs
  i18n/strings.ts     English + Hindi strings
  data/catalog.ts     sample shops, deals, orders, reviews (Durg / Bhilai)
  data/images.ts      photo and 3D icon map
  store/store.tsx     saved deals, searches, viewed, follows, cart, orders, language (persisted), a ticking clock
  lib/format.ts       ₹ formatting, distance + travel time, honest end-time labels, demo shop hours
  lib/query.ts        filters, "ending today", Hindi and Hinglish search
  components/         night (ticket, glow, gold number), deal-card, tab-bar (floating dock), radius-sheet, sheets, toast, ui
  app/                (tabs)/index · history · profile, deal/[id], shop/[id], claim/[id], search, +not-found
public/case-study/    the case study page (static HTML)
```

Stack: Expo SDK 58, React Native 0.88, Expo Router, Reanimated 4, react-native-svg, expo-image, expo-haptics, lucide-react-native, AsyncStorage, TypeScript.

## Credits

Food and shop photos in `assets/images/photos` are placeholders picked for this prototype and belong to their owners. The gold 3D icons are from [3dicons](https://3dicons.co) (CC0). Type is Plus Jakarta Sans, Instrument Serif and Noto Sans Devanagari (OFL). The Locall logo belongs to Localstack Market Pvt Ltd and is used here only to show the redesign in context.
