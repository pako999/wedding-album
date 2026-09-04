/**
 * First-touch signup attribution — EDGE-SAFE module.
 *
 * IMPORTANT: this file is imported by `middleware.ts`, which runs on the
 * Edge runtime. It must NOT import `@/lib/db`, `next/headers`, or anything
 * Node-only. Keep it to pure functions + constants. The DB write lives in
 * `lib/attribution/record.ts` (Node), read at the first authenticated
 * request.
 *
 * Flow:
 *   1. Middleware captures utm_*, gclid/fbclid and the external referrer
 *      into the `gc_attr` cookie the FIRST time it sees a browser
 *      (first-touch wins — never overwritten).
 *   2. On the user's first authenticated dashboard visit we read that
 *      cookie (plus the existing affiliate `gc_ref` / guest-referral
 *      `gc_gref` cookies), derive an acquisition channel, and store it on
 *      a `user_attribution` row keyed by Clerk id.
 *   3. /admin/users shows the channel + details per user.
 */

export const SIGNUP_ATTR_COOKIE = "gc_attr";
export const SIGNUP_SOURCE_PARAM = "gc_source";
export const ATTR_COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days

export interface SignupAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  referrerUrl?: string;
  landingPage?: string;
}

/** Coarse acquisition channel we derive for the admin view. */
export type Channel =
  | "google_ads"
  | "meta_ads"
  | "affiliate"
  | "referral"
  | "organic_search"
  | "social"
  | "referral_web"
  | "campaign"
  | "direct";

/**
 * Small, non-sensitive attribution snapshot passed to Clerk at sign-up so
 * the user.created webhook can include the source in its Telegram alert.
 * Never use these browser-controlled values for authorization or billing.
 */
export interface SignupSourceSnapshot {
  channel: Channel;
  siteHost?: string;
  utmSource?: string;
  utmCampaign?: string;
  affiliateRef?: string;
  referralCode?: string;
  referrerHost?: string;
  landingPage?: string;
}

const CHANNELS: readonly Channel[] = [
  "google_ads",
  "meta_ads",
  "affiliate",
  "referral",
  "organic_search",
  "social",
  "referral_web",
  "campaign",
  "direct",
];

const CHANNEL_LABELS: Record<Channel, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  affiliate: "Partnerska povezava",
  referral: "Priporočilo gosta",
  organic_search: "Organsko iskanje",
  social: "Družbena omrežja",
  referral_web: "Zunanja povezava",
  campaign: "UTM kampanja",
  direct: "Direktni obisk",
};

const MAX_FIELD = 300; // clamp each stored field so a crafted URL can't bloat the cookie/row

function clamp(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  const s = v.trim();
  if (!s) return undefined;
  return s.length > MAX_FIELD ? s.slice(0, MAX_FIELD) : s;
}

/**
 * Build first-touch attribution from a request's query params + referer.
 * Returns null when there's no acquisition signal at all (no utm, no click
 * id, no referrer) — a bare direct visit doesn't need a cookie; it'll be
 * classified "direct" at signup by the absence of one.
 */
export function collectAttribution(
  params: URLSearchParams,
  referer: string | null,
  landingPath: string,
): SignupAttribution | null {
  const attr: SignupAttribution = {
    utmSource: clamp(params.get("utm_source")),
    utmMedium: clamp(params.get("utm_medium")),
    utmCampaign: clamp(params.get("utm_campaign")),
    utmTerm: clamp(params.get("utm_term")),
    utmContent: clamp(params.get("utm_content")),
    gclid: clamp(params.get("gclid")),
    fbclid: clamp(params.get("fbclid")),
    referrerUrl: clamp(referer),
    landingPage: clamp(landingPath),
  };

  const hasSignal =
    attr.utmSource || attr.utmMedium || attr.utmCampaign ||
    attr.gclid || attr.fbclid || attr.referrerUrl;
  if (!hasSignal) return null;

  // Drop empty keys so the serialized cookie stays small.
  for (const k of Object.keys(attr) as (keyof SignupAttribution)[]) {
    if (!attr[k]) delete attr[k];
  }
  return attr;
}

/** Serialize for a cookie value (URL-encoded JSON). */
export function serializeAttr(a: SignupAttribution): string {
  return encodeURIComponent(JSON.stringify(a));
}

/** Parse the cookie value back. Null on any malformed input. */
export function parseAttr(value: string | undefined | null): SignupAttribution | null {
  if (!value) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(value));
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return obj as SignupAttribution;
    }
  } catch {
    /* malformed cookie — ignore */
  }
  return null;
}

function hostOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function safeSnapshotText(value: unknown, maxLength = 120): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

/**
 * Derive the acquisition channel from the captured attribution plus the
 * two existing referral cookies. Order matters: an explicit ad click id or
 * paid-medium utm wins over a generic referrer.
 *
 * `appHost` is the app's own bare host (e.g. "guestcam.si") so an internal
 * referrer collapses to "direct" instead of masquerading as an external
 * link.
 */
export function deriveChannel(
  a: SignupAttribution | null,
  opts: { affiliateRef?: string | null; referralCode?: string | null; appHost?: string },
): Channel {
  const src = (a?.utmSource ?? "").toLowerCase();
  const med = (a?.utmMedium ?? "").toLowerCase();
  const paidMedium = /cpc|ppc|paid|display|(^|[^a-z])ads?([^a-z]|$)/.test(med);

  if (a?.gclid || (/(google|youtube|gdn)/.test(src) && paidMedium)) return "google_ads";
  if (
    a?.fbclid ||
    (/(facebook|instagram|meta|^fb$|^ig$)/.test(src) &&
      (paidMedium || med === "social" || med === "paid_social" || med === "paidsocial"))
  ) {
    return "meta_ads";
  }
  if (opts.affiliateRef) return "affiliate";
  if (opts.referralCode) return "referral";
  if (src) return "campaign"; // utm-tagged but not clearly google/meta paid

  const host = hostOf(a?.referrerUrl);
  if (host) {
    const app = (opts.appHost ?? "").toLowerCase();
    if (app && (host === app || host === `www.${app}`)) return "direct";
    if (/google|bing|yahoo|duckduckgo|ecosia|yandex|baidu|search\./.test(host)) return "organic_search";
    if (/facebook|instagram|twitter|(^|\.)x\.com|t\.co|tiktok|linkedin|pinterest|reddit|snapchat|youtube/.test(host)) return "social";
    return "referral_web";
  }
  return "direct";
}

export function channelLabel(channel: Channel): string {
  return CHANNEL_LABELS[channel];
}

/** Build the allow-listed snapshot used only for operational attribution. */
export function buildSignupSourceSnapshot(
  attr: SignupAttribution | null,
  opts: {
    affiliateRef?: string | null;
    referralCode?: string | null;
    appHost?: string;
    siteHost?: string;
  },
): SignupSourceSnapshot {
  return {
    channel: deriveChannel(attr, opts),
    siteHost: safeSnapshotText(opts.siteHost, 100),
    utmSource: safeSnapshotText(attr?.utmSource),
    utmCampaign: safeSnapshotText(attr?.utmCampaign),
    affiliateRef: safeSnapshotText(opts.affiliateRef, 40),
    referralCode: safeSnapshotText(opts.referralCode, 80),
    referrerHost: safeSnapshotText(hostOf(attr?.referrerUrl), 100),
    landingPage: safeSnapshotText(attr?.landingPage, 200),
  };
}

/** Strictly validate browser/Clerk metadata before displaying it. */
export function parseSignupSourceSnapshot(value: unknown): SignupSourceSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.channel !== "string" || !CHANNELS.includes(raw.channel as Channel)) {
    return null;
  }
  return {
    channel: raw.channel as Channel,
    siteHost: safeSnapshotText(raw.siteHost, 100),
    utmSource: safeSnapshotText(raw.utmSource),
    utmCampaign: safeSnapshotText(raw.utmCampaign),
    affiliateRef: safeSnapshotText(raw.affiliateRef, 40),
    referralCode: safeSnapshotText(raw.referralCode, 80),
    referrerHost: safeSnapshotText(raw.referrerHost, 100),
    landingPage: safeSnapshotText(raw.landingPage, 200),
  };
}

/** URL-safe bridge for country-domain → primary-domain sign-up redirects. */
export function serializeSignupSourceSnapshot(source: SignupSourceSnapshot): string {
  return encodeURIComponent(JSON.stringify(source));
}

export function parseSignupSourceParam(value: string | null | undefined): SignupSourceSnapshot | null {
  if (!value || value.length > 2_000) return null;
  try {
    return parseSignupSourceSnapshot(JSON.parse(decodeURIComponent(value)));
  } catch {
    return null;
  }
}
