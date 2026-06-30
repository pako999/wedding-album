import { db } from "@/lib/db";
import { affiliateClicks, affiliateCommissions } from "@/lib/db/schema";
import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";

/**
 * Source classification — turn a raw HTTP Referer URL into a human label.
 * We keep this very forgiving: bots / SPAs / privacy-redirectors lose the
 * referrer entirely and end up as "Neposredno" (direct).
 */
const SOURCE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /(?:^|\.)instagram\.com/i,          label: "Instagram" },
  { pattern: /(?:^|\.)l\.instagram\.com/i,       label: "Instagram" },
  { pattern: /(?:^|\.)facebook\.com/i,           label: "Facebook" },
  { pattern: /(?:^|\.)l\.facebook\.com/i,        label: "Facebook" },
  { pattern: /(?:^|\.)m\.facebook\.com/i,        label: "Facebook" },
  { pattern: /(?:^|\.)lm\.facebook\.com/i,       label: "Facebook" },
  { pattern: /(?:^|\.)tiktok\.com/i,             label: "TikTok" },
  { pattern: /(?:^|\.)youtube\.com/i,            label: "YouTube" },
  { pattern: /(?:^|\.)youtu\.be/i,               label: "YouTube" },
  { pattern: /(?:^|\.)linkedin\.com/i,           label: "LinkedIn" },
  { pattern: /(?:^|\.)pinterest\.com/i,          label: "Pinterest" },
  { pattern: /(?:^|\.)twitter\.com/i,            label: "X (Twitter)" },
  { pattern: /(?:^|\.)x\.com/i,                  label: "X (Twitter)" },
  { pattern: /(?:^|\.)t\.co/i,                   label: "X (Twitter)" },
  { pattern: /(?:^|\.)reddit\.com/i,             label: "Reddit" },
  { pattern: /(?:^|\.)whatsapp\.com/i,           label: "WhatsApp" },
  { pattern: /(?:^|\.)wa\.me/i,                  label: "WhatsApp" },
  { pattern: /(?:^|\.)telegram\.org/i,           label: "Telegram" },
  { pattern: /(?:^|\.)t\.me/i,                   label: "Telegram" },
  { pattern: /(?:^|\.)linktr\.ee/i,              label: "Linktree" },
  { pattern: /(?:^|\.)beacons\.ai/i,             label: "Beacons" },
  { pattern: /(?:^|\.)google\./i,                label: "Google" },
  { pattern: /(?:^|\.)bing\.com/i,               label: "Bing" },
  { pattern: /(?:^|\.)duckduckgo\.com/i,         label: "DuckDuckGo" },
  { pattern: /(?:^|\.)yahoo\./i,                 label: "Yahoo" },
];

export function classifySource(referrer: string | null | undefined): string {
  if (!referrer) return "Neposredno";
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return "Neznano";
  }
  for (const { pattern, label } of SOURCE_PATTERNS) {
    if (pattern.test(host)) return label;
  }
  return host.replace(/^www\./, "");
}

export function classifyDevice(ua: string | null | undefined): "Mobile" | "Tablet" | "Desktop" {
  if (!ua) return "Desktop";
  const s = ua.toLowerCase();
  if (/ipad|tablet|kindle|playbook/.test(s)) return "Tablet";
  if (/mobi|android|iphone|ipod|blackberry|windows phone|opera mini/.test(s)) return "Mobile";
  return "Desktop";
}

export interface SourceRow {
  label: string;
  clicks: number;
}

export interface DailyRow {
  date: string; // YYYY-MM-DD
  clicks: number;
}

export interface DeviceRow {
  label: "Mobile" | "Tablet" | "Desktop";
  clicks: number;
}

export interface LandingRow {
  page: string;
  clicks: number;
}

export interface RecentClick {
  id: string;
  source: string;
  landingPage: string | null;
  device: "Mobile" | "Tablet" | "Desktop";
  converted: boolean;
  clickedAt: Date;
}

export interface AffiliateAnalytics {
  windowDays: number;
  totals: {
    clicks: number;
    conversions: number;
    conversionRatePct: number;
  };
  bySource: SourceRow[];
  byLandingPage: LandingRow[];
  byDevice: DeviceRow[];
  daily: DailyRow[];
  recentClicks: RecentClick[];
}

/**
 * Fetch the full analytics breakdown for one affiliate over the last `days`.
 * Caller decides what to do with empty results (no clicks yet).
 */
export async function getAffiliateAnalytics(
  affiliateId: string,
  days = 30,
): Promise<AffiliateAnalytics> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      id: affiliateClicks.id,
      referrerUrl: affiliateClicks.referrerUrl,
      landingPage: affiliateClicks.landingPage,
      userAgent: affiliateClicks.userAgent,
      convertedAt: affiliateClicks.convertedAt,
      clickedAt: affiliateClicks.clickedAt,
    })
    .from(affiliateClicks)
    .where(and(eq(affiliateClicks.affiliateId, affiliateId), gte(affiliateClicks.clickedAt, since)))
    .orderBy(desc(affiliateClicks.clickedAt));

  // Commission count for conversion rate. We count converted clicks
  // (clicks with a convertedAt timestamp) as the numerator.
  const conversions = rows.filter((r) => r.convertedAt !== null).length;

  // Bucket by source
  const srcMap = new Map<string, number>();
  for (const r of rows) {
    const label = classifySource(r.referrerUrl);
    srcMap.set(label, (srcMap.get(label) ?? 0) + 1);
  }
  const bySource = Array.from(srcMap.entries())
    .map(([label, clicks]) => ({ label, clicks }))
    .sort((a, b) => b.clicks - a.clicks);

  // Bucket by landing page (strip query string for grouping)
  const lpMap = new Map<string, number>();
  for (const r of rows) {
    const page = (r.landingPage ?? "/").split("?")[0] || "/";
    lpMap.set(page, (lpMap.get(page) ?? 0) + 1);
  }
  const byLandingPage = Array.from(lpMap.entries())
    .map(([page, clicks]) => ({ page, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Bucket by device
  const devMap = new Map<DeviceRow["label"], number>();
  for (const r of rows) {
    const label = classifyDevice(r.userAgent);
    devMap.set(label, (devMap.get(label) ?? 0) + 1);
  }
  const byDevice: DeviceRow[] = (["Mobile", "Desktop", "Tablet"] as const).map((label) => ({
    label,
    clicks: devMap.get(label) ?? 0,
  }));

  // Daily series (fill missing days with 0 so the chart isn't gappy).
  const dailyMap = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.clickedAt).toISOString().slice(0, 10);
    dailyMap.set(d, (dailyMap.get(d) ?? 0) + 1);
  }
  const daily: DailyRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    daily.push({ date: d, clicks: dailyMap.get(d) ?? 0 });
  }

  // Most recent 30 clicks (already ordered desc by clickedAt above).
  const recentClicks: RecentClick[] = rows.slice(0, 30).map((r) => ({
    id: r.id,
    source: classifySource(r.referrerUrl),
    landingPage: r.landingPage,
    device: classifyDevice(r.userAgent),
    converted: r.convertedAt !== null,
    clickedAt: new Date(r.clickedAt),
  }));

  const conversionRatePct = rows.length > 0 ? (conversions / rows.length) * 100 : 0;

  return {
    windowDays: days,
    totals: {
      clicks: rows.length,
      conversions,
      conversionRatePct,
    },
    bySource,
    byLandingPage,
    byDevice,
    daily,
    recentClicks,
  };
}

/** Total earnings + commission count over the window, used for the
 *  "revenue" column in the funnel summary. */
export async function getAffiliateRevenueWindow(
  affiliateId: string,
  days = 30,
): Promise<{ commissionCents: number; commissionCount: number }> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${affiliateCommissions.commissionAmountCents}), 0)`,
      n: sql<number>`COUNT(*)`,
    })
    .from(affiliateCommissions)
    .where(
      and(
        eq(affiliateCommissions.affiliateId, affiliateId),
        gte(affiliateCommissions.createdAt, since),
        isNotNull(affiliateCommissions.id),
      ),
    );
  return {
    commissionCents: Number(row?.total ?? 0),
    commissionCount: Number(row?.n ?? 0),
  };
}
