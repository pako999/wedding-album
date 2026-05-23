import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { AlbumGuestView } from "@/components/album/AlbumGuestView";
import { type Lang } from "@/lib/i18n/translations";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pw?: string; lang?: string }>;
}

// Per-event-type share copy. We render this in the share preview when
// a guest pastes the album link in WhatsApp / iMessage / Slack.
// Previously every album defaulted to "Poročni album za …" regardless
// of event type — a baby shower link said "Wedding album for Kim's
// Baby shower", which is wrong and confusing.
//
// Keys MUST match the eventType values the server actually persists
// (see ALLOWED_EVENT_TYPES in app/api/albums/[slug]/settings/route.ts):
// wedding / birthday / anniversary / party / baptism / graduation /
// baby_shower / business / other. Earlier this map used `babyshower`
// without the underscore — that key never matched and every baby
// shower fell through to the generic fallback.
const EVENT_LABEL_SL: Record<string, string> = {
  wedding:     "Poročni album za",
  birthday:    "Album rojstnega dne za",
  anniversary: "Album obletnice za",
  party:       "Album zabave za",
  baptism:     "Album krsta za",
  graduation:  "Maturantski album za",
  baby_shower: "Baby shower album za",
  business:    "Poslovni album za",
  other:       "Album dogodka za",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });
  if (!album) return { title: "Album not found" };

  const eventLabel = EVENT_LABEL_SL[album.eventType ?? "other"] ?? EVENT_LABEL_SL.other;
  const description = `${eventLabel} ${album.coupleName}, ${album.weddingDate}`;

  return {
    title: `${album.coupleName} — Guestcam`,
    description,
    // Every album guest page is private (link-only). Maximum-strength
    // robots directives so search engines, image search, AI scrapers,
    // and archive bots all stay out — even if some choose to ignore
    // one signal we cover the others. Middleware also sets the
    // X-Robots-Tag HTTP header for an additional layer that crawlers
    // honour before they ever parse the HTML.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-image-preview": "none",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      // Belt-and-braces: emit a consolidated robots meta with archive
      // + snippet + image-index + AI-training opt-outs that the typed
      // Metadata.robots shape doesn't expose as top-level keys.
      robots:
        "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai",
    },
    openGraph: {
      title: `${album.coupleName} — Guestcam`,
      description,
      images: album.coverImageUrl ? [album.coverImageUrl] : [],
    },
    twitter: {
      card: album.coverImageUrl ? "summary_large_image" : "summary",
      title: `${album.coupleName} — Guestcam`,
      description,
    },
  };
}

export default async function AlbumPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { pw, lang: langParam } = await searchParams;

  // Album language: explicit ?lang= param, otherwise default to Slovenian.
  const lang: Lang = (langParam as Lang) ?? "sl";

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  if (!album || !album.isPublished) {
    notFound();
  }

  // Is the signed-in viewer the album owner? Two checks:
  //   1. Clerk userId matches `ownerClerkId` (normal case).
  //   2. Email matches `ownerEmail` (cross-Clerk WedFlow integration case).
  let isOwner = false;
  try {
    const session = await auth();
    if (session.userId) {
      if (session.userId === album.ownerClerkId) {
        isOwner = true;
      } else if (album.ownerEmail) {
        const user = await currentUser();
        const email = user?.emailAddresses?.[0]?.emailAddress;
        if (email && email.toLowerCase() === album.ownerEmail.toLowerCase()) {
          isOwner = true;
        }
      }
    }
  } catch { /* viewer is anonymous — that's fine */ }

  // Password gate (server-side check). Owners always bypass.
  const passwordRequired = !!album.password && !isOwner;
  const passwordCorrect = isOwner || !album.password || pw === album.password;

  // Fetch published photos
  const albumPhotos = passwordCorrect
    ? await db.query.photos.findMany({
        where: and(
          eq(photos.albumId, album.id),
          eq(photos.status, "published")
        ),
        orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
      })
    : [];

  // Fetch the album's moments (named sub-galleries)
  const albumMoments = await db.query.moments.findMany({
    where: eq(moments.albumId, album.id),
    orderBy: (m, { asc }) => [asc(m.sortOrder), asc(m.createdAt)],
  });

  return (
    <AlbumGuestView
      album={album}
      photos={albumPhotos}
      moments={albumMoments}
      passwordRequired={passwordRequired}
      passwordCorrect={passwordCorrect}
      providedPassword={pw}
      initialLang={lang}
      isOwner={isOwner}
    />
  );
}
