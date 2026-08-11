import { db } from "@/lib/db";
import { wallSponsors } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export interface SponsorSlide {
  id: string;
  imageUrl: string;
  caption: string | null;
}

/**
 * Sponsor slides for an album, ordered.
 *
 * NEVER throws. If the `wall_sponsors` table doesn't exist yet (a deploy
 * that landed ahead of its migration — the exact failure mode that took
 * the dashboard down when `albums.wall_token` shipped), this returns an
 * empty list so the wall and dashboard carry on as if the event simply
 * has no sponsors. Sponsors are a decorative extra; they must never be
 * able to take a live event's screen down.
 */
export async function getSponsors(albumId: string): Promise<SponsorSlide[]> {
  try {
    const rows = await db.query.wallSponsors.findMany({
      where: eq(wallSponsors.albumId, albumId),
      orderBy: [asc(wallSponsors.sortOrder), asc(wallSponsors.createdAt)],
    });
    return rows.map((r) => ({ id: r.id, imageUrl: r.imageUrl, caption: r.caption }));
  } catch (err) {
    console.warn("[wall-sponsors] lookup failed (table missing?):", err);
    return [];
  }
}
