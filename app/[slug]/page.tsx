import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withSchemaHealing } from "@/lib/db/bootstrap";
import { AlbumGuestView } from "@/components/album/AlbumGuestView";
import { type Lang } from "@/lib/i18n/translations";
import { hashAlbumPassword, needsRehash, verifyAlbumPassword } from "@/lib/album-password";
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
  // withSchemaHealing: if the schema is stale (new column deployed but
  // migration not yet run on this DB), run migrations + retry instead of
  // 500ing every gallery until someone opens /admin.
  const album = await withSchemaHealing(() =>
    db.query.albums.findFirst({ where: eq(albums.slug, slug) }),
  );
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

  const album = await withSchemaHealing(() =>
    db.query.albums.findFirst({ where: eq(albums.slug, slug) }),
  );

  if (!album || !album.isPublished) {
    notFound();
  }

  // Album language: explicit ?lang= wins; otherwise the album's own
  // default (inferred from the event location at creation — a Croatian
  // wedding opens in Croatian, not Slovenian). Guests can still switch
  // via the in-gallery language picker.
  const VALID_LANGS: readonly Lang[] = ["sl", "hr", "sr", "de", "en", "es"];
  const isValidLang = (v: string | undefined | null): v is Lang =>
    !!v && (VALID_LANGS as readonly string[]).includes(v);
  const lang: Lang = isValidLang(langParam)
    ? langParam
    : isValidLang(album.defaultLang)
      ? album.defaultLang
      : "sl";

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

  // Password gate (server-side check). Owners always bypass. Verifies
  // against scrypt-hashed OR legacy plaintext (see lib/album-password.ts)
  // and silently upgrades legacy rows on the first correct entry.
  const passwordRequired = !!album.password && !isOwner;
  let passwordCorrect = isOwner || !album.password;
  if (!passwordCorrect && album.password) {
    passwordCorrect = await verifyAlbumPassword(pw ?? "", album.password);
    if (passwordCorrect && needsRehash(album.password)) {
      const upgraded = await hashAlbumPassword(pw ?? "");
      await db
        .update(albums)
        .set({ password: upgraded })
        .where(eq(albums.id, album.id))
        .catch(() => {});
    }
  }

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
    <>
      {/* Hide Cookiebot's persistent floating widget (the round "CO"
          badge, bottom-left) on guest galleries — it sits on top of the
          couple's photos and confuses guests. Only the WIDGET is hidden:
          the initial consent dialog still appears (required — GA + Meta
          Pixel load site-wide), and consent can be managed any time via
          the cookie link on the marketing pages. The <style> tag only
          exists while a gallery route is mounted. */}
      <style>{`#CookiebotWidget { display: none !important; }`}</style>
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
    </>
  );
}
