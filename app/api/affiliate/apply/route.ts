import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateReferralCode } from "@/lib/affiliate/codes";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  sendAffiliateApplicationReceivedEmail,
  sendAdminAffiliateApplicationEmail,
} from "@/lib/email/notifications";

export const runtime = "nodejs";

type Locale = "sl" | "hr" | "sr" | "en" | "de" | "es";
const LOCALES: Locale[] = ["sl", "hr", "sr", "en", "de", "es"];

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PROMOTION_PLAN = 5_000;
const MAX_URL = 500;

interface Body {
  name?: string;
  email?: string;
  website?: string;
  promotionPlan?: string;
  bankIban?: string;
  preferredLocale?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  xUrl?: string;
  tiktokUrl?: string;
}

function cleanUrl(value: string | undefined): string | null | false {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  if (raw.length > MAX_URL) return false;
  try {
    const url = new URL(raw);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || !url.hostname) return false;
    return url.toString();
  } catch {
    return false;
  }
}

/** ISO 13616 checksum validation. No IBAN leaves this route in logs/responses. */
function validIban(value: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value) || value.length < 15 || value.length > 34) {
    return false;
  }
  const rearranged = value.slice(4) + value.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const encoded = char >= "A" && char <= "Z"
      ? String(char.charCodeAt(0) - 55)
      : char;
    for (const digit of encoded) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

function isUniqueViolation(err: unknown): boolean {
  let current: unknown = err;
  for (let i = 0; current && i < 6; i++) {
    if (typeof current !== "object") break;
    const value = current as { code?: unknown; cause?: unknown; sourceError?: unknown };
    if (value.code === "23505") return true;
    current = value.cause ?? value.sourceError;
  }
  return false;
}

export async function POST(req: NextRequest) {
  // Applications create DB rows + send two emails, so protect the endpoint even
  // when an attacker distributes requests across Vercel instances. The shared
  // limiter is used automatically when Redis/KV REST envs are configured.
  const rl = await checkRateLimit("affiliate-apply", 3, 60 * 60_000);
  if (!rl.ok) return rl.response;

  const body = (await req.json().catch(() => ({}))) as Body;

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const promotionPlan = (body.promotionPlan ?? "").trim();
  const bankIban = (body.bankIban ?? "").replace(/\s+/g, "").toUpperCase() || null;
  const preferredLocale: Locale = LOCALES.includes(body.preferredLocale as Locale)
    ? (body.preferredLocale as Locale)
    : "sl";

  const website = cleanUrl(body.website);
  const instagramUrl = cleanUrl(body.instagramUrl);
  const facebookUrl = cleanUrl(body.facebookUrl);
  const xUrl = cleanUrl(body.xUrl);
  const tiktokUrl = cleanUrl(body.tiktokUrl);

  if (name.length < 2 || name.length > MAX_NAME) {
    return NextResponse.json({ error: "Vnesite veljavno ime." }, { status: 400 });
  }
  if (email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Vnesite veljaven e-poštni naslov." }, { status: 400 });
  }
  if (promotionPlan.length < 20 || promotionPlan.length > MAX_PROMOTION_PLAN) {
    return NextResponse.json(
      { error: "Opis promocije mora vsebovati med 20 in 5000 znakov." },
      { status: 400 },
    );
  }
  if ([website, instagramUrl, facebookUrl, xUrl, tiktokUrl].some((value) => value === false)) {
    return NextResponse.json({ error: "Eden od vnesenih spletnih naslovov ni veljaven." }, { status: 400 });
  }
  if (bankIban && !validIban(bankIban)) {
    return NextResponse.json({ error: "Vnesite veljaven IBAN." }, { status: 400 });
  }

  const existing = await db.query.affiliates.findFirst({
    where: eq(affiliates.email, email),
  });
  if (existing) {
    return NextResponse.json(
      { error: "Prijava s tem e-poštnim naslovom že obstaja." },
      { status: 409 },
    );
  }

  const referralCode = await generateReferralCode(name);

  let row: typeof affiliates.$inferSelect;
  try {
    const inserted = await db
      .insert(affiliates)
      .values({
        email,
        name,
        website: website || null,
        bankIban,
        promotionPlan,
        referralCode,
        preferredLocale,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        xUrl: xUrl || null,
        tiktokUrl: tiktokUrl || null,
        status: "pending",
      })
      .returning();
    row = inserted[0];
    if (!row) throw new Error("Affiliate insert returned no row");
  } catch (err) {
    // Two simultaneous submissions can both pass the read-before-insert check.
    // Let the DB unique constraint be the final arbiter and return a clean 409.
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: "Prijava s tem e-poštnim naslovom že obstaja." },
        { status: 409 },
      );
    }
    console.error("[affiliate apply] DB insert failed");
    return NextResponse.json({ error: "Prijave trenutno ni mogoče shraniti." }, { status: 503 });
  }

  await Promise.all([
    sendAffiliateApplicationReceivedEmail({ to: email, name, locale: preferredLocale }).catch(
      (e) => console.error("[affiliate apply] applicant email failed:", e),
    ),
    sendAdminAffiliateApplicationEmail({
      affiliateId: row.id,
      name,
      email,
      website: website || null,
      promotionPlan,
    }).catch((e) => console.error("[affiliate apply] admin email failed:", e)),
  ]);

  return NextResponse.json({ success: true, id: row.id });
}
