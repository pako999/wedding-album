import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Note: Auth is handled at middleware level (x-api-key header)

const bodySchema = z.object({
  ownerClerkId: z.string().min(1),
  coupleName: z.string().min(1),
  weddingDate: z.string().min(1), // "2025-06-14"
  location: z.string().optional(),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/),
  plan: z.enum(["free", "pro", "premium"]).default("free"),
  notifyEmail: z.string().email().optional(),
  password: z.string().optional(),
  moderationEnabled: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  // Check slug uniqueness
  const existing = await db.query.albums.findFirst({
    where: eq(albums.slug, data.slug),
  });

  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  // Set plan limits
  const maxPhotos = data.plan === "free" ? 50 : data.plan === "pro" ? 500 : 2000;

  const [album] = await db
    .insert(albums)
    .values({
      slug: data.slug,
      ownerClerkId: data.ownerClerkId,
      coupleName: data.coupleName,
      weddingDate: data.weddingDate,
      location: data.location,
      plan: data.plan,
      maxPhotos,
      notifyEmail: data.notifyEmail,
      password: data.password,
      moderationEnabled: data.moderationEnabled,
      isPublished: true,
    })
    .returning();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://photos.wedflow.app";

  return NextResponse.json({
    albumId: album.id,
    slug: album.slug,
    url: `${appUrl}/${album.slug}`,
    qrUrl: `${appUrl}/api/albums/${album.slug}/qr`,
  });
}
