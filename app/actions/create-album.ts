"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums, userPlanOverrides } from "@/lib/db/schema";
import { sendWelcomeEmail, sendOrganizerAgreementEmail } from "@/lib/email/notifications";
import { generateUniqueReferralCode } from "@/lib/referral/codes";
import { attributeNewAlbumFromCookie } from "@/lib/referral/attribution";
import { inferLangFromLocation } from "@/lib/i18n/infer-lang";
import { recordUserCountry } from "@/lib/user-country";
import { getAlbumCreationGate } from "@/lib/album-limits";
import { generateWallToken } from "@/lib/wall-token";
import { hashAlbumPassword } from "@/lib/album-password";
import { isValidEventTime, setAlbumHeaderSettings } from "@/lib/album-header-settings";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function createAlbum(formData: FormData) {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    redirect("/sign-in");
  }
  if (!userId) redirect("/sign-in");

  const gate = await getAlbumCreationGate(userId);
  if (!gate.allowed) {
    redirect(`/dashboard/${gate.mostRecentSlug}/upgrade`);
  }

  const eventType  = (formData.get("eventType")   as string ?? "wedding").trim();
  const coupleName = (formData.get("coupleName")  as string ?? "").trim();
  const eventDate  = (formData.get("eventDate")   as string ?? "").trim();
  const eventTimeRaw = (formData.get("eventTime") as string ?? "").trim();
  const eventTime = eventTimeRaw || null;
  const location   = (formData.get("location")    as string ?? "").trim() || null;
  const passwordRaw = (formData.get("password")   as string ?? "").trim();
  const password = passwordRaw ? await hashAlbumPassword(passwordRaw) : null;
  const planRaw    = (formData.get("plan")        as string ?? "").trim();
  const plan       = (planRaw === "basic" || planRaw === "plus" || planRaw === "premium") ? planRaw : null;

  if (!coupleName || !eventDate) {
    throw new Error("Ime in datum sta obvezni polji.");
  }

  if (coupleName.length > 40) {
    throw new Error("Ime dogodka je predolgo — največ 40 znakov.");
  }
  if (eventTime && !isValidEventTime(eventTime)) {
    throw new Error("Čas začetka mora biti v obliki UU:MM.");
  }
  if (passwordRaw.length > 128) {
    throw new Error("Geslo je predolgo — največ 128 znakov.");
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  const slug   = `${slugify(coupleName)}-${suffix}`;

  let inheritedPlan: "free" | "basic" | "plus" | "premium" = "free";
  let inheritedMax = 20;
  let inheritedFilm: "free" | "pro" | "premium" = "free";
  let inheritedExpiry: Date | null = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  let inheritedSessionId: string | undefined;

  try {
    const override = await db.query.userPlanOverrides.findFirst({
      where: eq(userPlanOverrides.clerkId, userId),
    });
    if (override) {
      inheritedPlan      = override.plan;
      inheritedMax       = override.maxPhotos;
      inheritedFilm      = override.filmTier;
      inheritedExpiry    = override.daysAccess
        ? new Date(Date.now() + override.daysAccess * 24 * 60 * 60 * 1000)
        : null;
      inheritedSessionId = override.compTag ?? `admin-override:${userId}`;
      await db.delete(userPlanOverrides).where(eq(userPlanOverrides.clerkId, userId));
    }
  } catch (err) {
    console.warn("[create-album] user_plan_overrides lookup failed:", err);
  }

  let referralCode: string | null = null;
  try {
    referralCode = await generateUniqueReferralCode(coupleName);
  } catch (err) {
    console.warn("[create-album] referral code generation failed:", err);
  }

  let ownerEmail: string | null = null;
  try {
    const creator = await currentUser();
    ownerEmail = creator?.emailAddresses?.[0]?.emailAddress ?? null;
  } catch { /* ignore — column stays null */ }

  const inserted = await db.insert(albums).values({
    slug,
    ownerClerkId:      userId,
    ownerEmail,
    eventType,
    coupleName,
    weddingDate:       eventDate,
    location,
    defaultLang:       inferLangFromLocation(location),
    password,
    isPublished:       true,
    plan:              inheritedPlan,
    maxPhotos:         inheritedMax,
    filmTier:          inheritedFilm,
    moderationEnabled: false,
    expiresAt:         inheritedExpiry,
    stripeSessionId:   inheritedSessionId,
    referralCode,
    wallToken:         generateWallToken(),
  }).returning({ id: albums.id });

  const newAlbumId = inserted[0]?.id;
  if (newAlbumId) {
    if (eventTime && !(await setAlbumHeaderSettings(newAlbumId, { eventTime }))) {
      console.error("[create-album] event start time could not be saved", { albumId: newAlbumId });
    }
    await attributeNewAlbumFromCookie(newAlbumId, userId).catch(() => {});
  }

  await recordUserCountry(userId);

  try {
    const userAlbums = await db.query.albums.findMany({
      where: eq(albums.ownerClerkId, userId),
      limit: 2,
    });
    if (userAlbums.length === 1) {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress;
      if (email) {
        await sendWelcomeEmail({
          to: email,
          ownerName: user?.firstName ?? undefined,
          coupleName,
          weddingDate: eventDate,
          albumSlug: slug,
        });
      }
    }
  } catch (err) {
    console.error("[create-album] welcome email error:", err);
  }

  try {
    const agreementUser = await currentUser();
    const agreementEmail = agreementUser?.emailAddresses?.[0]?.emailAddress;
    if (agreementEmail) {
      await sendOrganizerAgreementEmail({
        to: agreementEmail,
        ownerName: agreementUser?.firstName ?? undefined,
        coupleName,
        albumSlug: slug,
      });
    }
  } catch (err) {
    console.error("[create-album] agreement email error:", err);
  }

  const redirectUrl = plan
    ? `/dashboard/${slug}?new=1&plan=${plan}`
    : `/dashboard/${slug}?new=1`;
  redirect(redirectUrl);
}
