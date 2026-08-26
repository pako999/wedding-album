import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteStoredMedia } from "@/lib/storage/delete-media";

// Note: Auth is handled at middleware level (x-api-key header)

export const runtime = "nodejs";
export const maxDuration = 300;

async function cleanupAlbumMedia(albumId: string, coverImageUrl: string | null) {
  const rows = await db
    .select({
      id: photos.id,
      blobUrl: photos.blobUrl,
      streamVideoId: photos.cfStreamVideoId,
    })
    .from(photos)
    .where(eq(photos.albumId, albumId));

  const refs = [
    ...rows.map((row) => ({
      label: `photo:${row.id}`,
      blobUrl: row.blobUrl,
      streamVideoId: row.streamVideoId,
    })),
    ...(coverImageUrl
      ? [{ label: "cover", blobUrl: coverImageUrl, streamVideoId: null }]
      : []),
  ];

  const failures: string[] = [];
  for (let i = 0; i < refs.length; i += 10) {
    const batch = refs.slice(i, i + 10);
    const results = await Promise.allSettled(batch.map((ref) => deleteStoredMedia(ref)));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const label = batch[index]?.label ?? "unknown";
        failures.push(label);
        console.error(`[wedflow] Media cleanup failed for ${label}:`, result.reason);
      }
    });
  }

  return { total: refs.length, failures };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.event) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { event, data } = body;

  switch (event) {
    case "plan.upgraded": {
      const { ownerClerkId, newPlan } = data as { ownerClerkId: string; newPlan: "free" | "basic" | "plus" | "premium" };
      const maxPhotos = newPlan === "free" ? 50 : newPlan === "premium" ? 2000 : 500;

      await db
        .update(albums)
        .set({ plan: newPlan, maxPhotos, updatedAt: new Date() })
        .where(eq(albums.ownerClerkId, ownerClerkId));

      return NextResponse.json({ ok: true });
    }

    case "album.publish": {
      const { slug, isPublished } = data as { slug: string; isPublished: boolean };
      await db
        .update(albums)
        .set({ isPublished, updatedAt: new Date() })
        .where(eq(albums.slug, slug));
      return NextResponse.json({ ok: true });
    }

    case "album.delete": {
      const { slug } = data as { slug: string };
      const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
      if (!album) return NextResponse.json({ ok: true, alreadyDeleted: true });

      const cleanup = await cleanupAlbumMedia(album.id, album.coverImageUrl);
      if (cleanup.failures.length > 0) {
        return NextResponse.json(
          {
            error: "Media cleanup failed; album was not deleted",
            code: "media_cleanup_failed",
            failed: cleanup.failures.length,
            total: cleanup.total,
          },
          { status: 502 },
        );
      }

      await db.delete(albums).where(eq(albums.slug, slug));
      return NextResponse.json({ ok: true, mediaDeleted: cleanup.total });
    }

    default:
      return NextResponse.json({ ok: true, warning: "Unknown event" });
  }
}
