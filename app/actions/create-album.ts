"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";

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

  if (!coupleName || !eventDate) {
    throw new Error("Ime in datum sta obvezni polji.");
  }

  // Unique slug: event-name-XXXX
  const suffix = Math.random().toString(36).slice(2, 6);
  const slug   = `${slugify(coupleName)}-${suffix}`;

  await db.insert(albums).values({
    slug,
    ownerClerkId:      userId,
    eventType,
    coupleName,
    weddingDate:       eventDate,
    location,
    password,
    isPublished:       true,
    plan:              "free",
    maxPhotos:         200,
    moderationEnabled: false,
  });

  redirect(`/dashboard/${slug}`);
}
