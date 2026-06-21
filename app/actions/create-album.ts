"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, desc, eq, gt, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { sendWelcomeEmail, sendOrganizerAgreementEmail } from "@/lib/email/notifications";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
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

  const eventType  = (formData.get("eventType")   as string ?? "wedding").trim();
  const coupleName = (formData.get("coupleName")   as string ?? "").trim();
  const eventDate  = (formData.get("eventDate")    as string ?? "").trim();
  const location   = (formData.get("location")     as string ?? "").trim() || null;
  const password   = (formData.get("password")     as string ?? "").trim() || null;
  // Optional: when the owner came from a pricing card (homepage → wizard),
  // remember which paid plan they picked so we can route them straight to
  // the Paddle checkout step after the onboarding wizard.
  const planRaw    = (formData.get("plan")         as string ?? "").trim();
  const plan       = (planRaw === "basic" || planRaw === "plus" || planRaw === "premium") ? planRaw : null;

  if (!coupleName || !eventDate) {
    throw new Error("Ime in datum sta obvezni polji.");
  }

  // Unique slug: event-name-XXXX
  const suffix = Math.random().toString(36).slice(2, 6);
  const slug   = `${slugify(coupleName)}-${suffix}`;

  // Inherit the active paid plan from any existing album owned by this user.
  // If the user already paid for basic/plus/premium, every new gallery they
  // create gets the same plan, limits, and expiry — no extra payment needed.
  const activePaidAlbum = await db.query.albums.findFirst({
    where: and(
      eq(albums.ownerClerkId, userId),
      ne(albums.plan, "free"),
      gt(albums.expiresAt, new Date()),
    ),
    orderBy: [desc(albums.expiresAt)],
  });

  const inheritedPlan  = activePaidAlbum?.plan      ?? "free";
  const inheritedMax   = activePaidAlbum?.maxPhotos  ?? 20;
  const inheritedFilm  = activePaidAlbum?.filmTier   ?? "free";
  const inheritedExpiry = activePaidAlbum
    ? activePaidAlbum.expiresAt
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // free = 30 days

  await db.insert(albums).values({
    slug,
    ownerClerkId:      userId,
    eventType,
    coupleName,
    weddingDate:       eventDate,
    location,
    password,
    isPublished:       true,
    plan:              inheritedPlan,
    maxPhotos:         inheritedMax,
    filmTier:          inheritedFilm,
    moderationEnabled: false,
    expiresAt:         inheritedExpiry,
    // Mark that this plan was inherited (not a direct payment) so the
    // Paddle idempotency check in applyPlanToAlbum doesn't confuse it.
    stripeSessionId: activePaidAlbum
      ? `inherit:${activePaidAlbum.slug}`
      : undefined,
  });

  // Send a welcome email on the owner's *first* album. Best-effort — if
  // anything goes wrong (Resend down, no email on file) we still redirect.
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

  // Send privacy agreement confirmation on every gallery creation. Best-effort.
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
