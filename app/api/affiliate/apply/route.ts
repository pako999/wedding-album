import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateReferralCode } from "@/lib/affiliate/codes";
import {
  sendAffiliateApplicationReceivedEmail,
  sendAdminAffiliateApplicationEmail,
} from "@/lib/email/notifications";

export const runtime = "nodejs";

type Locale = "sl" | "hr" | "sr" | "en" | "de" | "es";
const LOCALES: Locale[] = ["sl", "hr", "sr", "en", "de", "es"];

interface Body {
  name?: string;
  email?: string;
  website?: string;
  promotionPlan?: string;
  paypalEmail?: string;
  preferredLocale?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const website = (body.website ?? "").trim() || null;
  const promotionPlan = (body.promotionPlan ?? "").trim();
  const paypalEmail = (body.paypalEmail ?? "").trim().toLowerCase() || null;
  const preferredLocale: Locale = LOCALES.includes(body.preferredLocale as Locale)
    ? (body.preferredLocale as Locale)
    : "sl";

  if (name.length < 2) {
    return NextResponse.json({ error: "Vnesite vaše ime." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Vnesite veljaven e-poštni naslov." }, { status: 400 });
  }
  if (promotionPlan.length < 20) {
    return NextResponse.json(
      { error: "Prosimo opišite, kako boste promovirali GuestCam (vsaj 20 znakov)." },
      { status: 400 },
    );
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

  const [row] = await db
    .insert(affiliates)
    .values({
      email,
      name,
      website,
      paypalEmail,
      promotionPlan,
      referralCode,
      preferredLocale,
      status: "pending",
    })
    .returning();

  // Fire-and-forget notifications. Failure here must not break the user's flow.
  await Promise.all([
    sendAffiliateApplicationReceivedEmail({ to: email, name, locale: preferredLocale }).catch(
      (e) => console.error("[affiliate apply] applicant email failed:", e),
    ),
    sendAdminAffiliateApplicationEmail({
      affiliateId: row.id,
      name,
      email,
      website,
      promotionPlan,
    }).catch((e) => console.error("[affiliate apply] admin email failed:", e)),
  ]);

  return NextResponse.json({ success: true, id: row.id });
}
