import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Note: Auth is handled at middleware level (x-api-key header)

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.event) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { event, data } = body;

  switch (event) {
    case "plan.upgraded": {
      // WedFlow notifies us that a couple upgraded their plan
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
      await db.delete(albums).where(eq(albums.slug, slug));
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ ok: true, warning: "Unknown event" });
  }
}
