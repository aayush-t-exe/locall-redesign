import type { Deal, Shop } from '@/data/catalog';
import type { Lang, StringKey } from '@/i18n/strings';

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

const APP_START = Date.now();
const HALF_HOUR = 30 * 60_000;

/** Deal end times are relative to app start, snapped to a half hour so they read like real shop offers. */
export function endsAt(deal: Deal) {
  return Math.round((APP_START + deal.endsInMin * 60_000) / HALF_HOUR) * HALF_HOUR;
}

export function isEnded(deal: Deal, now = Date.now()) {
  return endsAt(deal) <= now;
}

/** Hours left; used to sort and to decide when a countdown is honest to show. */
export function hoursLeft(deal: Deal, now = Date.now()) {
  return (endsAt(deal) - now) / 3_600_000;
}

function clock(ts: number, lang: Lang) {
  return new Date(ts).toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' });
}

function day(ts: number, lang: Lang) {
  return new Date(ts).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * Honest urgency: a live countdown only in the last 6 hours, otherwise a plain end time.
 * (India's 2023 dark-pattern guidelines ban false urgency.)
 */
export function endsLabel(deal: Deal, t: T, lang: Lang, now = Date.now()) {
  const end = endsAt(deal);
  const ms = end - now;
  if (ms <= 0) return { text: t('expired'), urgent: false, ended: true };
  if (ms < 6 * 3_600_000) {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return { text: h > 0 ? t('endsIn', { h, m }) : t('endsInMin', { m: Math.max(m, 1) }), urgent: true, ended: false };
  }
  const endDate = new Date(end);
  const today = new Date(now);
  const tomorrow = new Date(now + 86_400_000);
  if (endDate.toDateString() === today.toDateString()) return { text: t('endsToday', { t: clock(end, lang) }), urgent: false, ended: false };
  if (endDate.toDateString() === tomorrow.toDateString()) return { text: t('endsTomorrow', { t: clock(end, lang) }), urgent: false, ended: false };
  return { text: t('endsOn', { d: day(end, lang) }), urgent: false, ended: false };
}

/** Walking ≈ 5 km/h; beyond 1.5 km we assume a scooter in town traffic (≈ 22 km/h + parking). */
export function travel(shop: Shop, t: T) {
  if (shop.km <= 1.5) return t('minWalk', { n: Math.max(2, Math.round(shop.km * 12)) });
  return t('minRide', { n: Math.round(shop.km * 2.7 + 2) });
}

export function rideMinutes(km: number) {
  return Math.round(km * 2.7 + 2);
}

export function kmLabel(km: number) {
  return km < 1 ? `${Math.round(km * 1000 / 50) * 50} m` : `${km.toFixed(1)} km`;
}

export function rupees(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export function pctOff(deal: Deal) {
  return Math.round(((deal.mrp - deal.price) / deal.mrp) * 100);
}

export function isOpen(shop: Shop, now = new Date()) {
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= shop.opens && h < shop.closes;
}

export function timeAgo(ts: number, t: T, now = Date.now()) {
  const m = Math.floor((now - ts) / 60_000);
  if (m < 1) return t('justNow');
  if (m < 60) return t('agoMin', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('agoHour', { n: h });
  return t('agoDay', { n: Math.floor(h / 24) });
}

export function pick<T extends object, K extends keyof T>(obj: T, en: K, hi: K, lang: Lang): T[K] {
  return lang === 'hi' ? obj[hi] : obj[en];
}
