import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withSchemaHealing } from "@/lib/db/bootstrap";
import { AlbumGuestView } from "@/components/album/AlbumGuestView";
import { type Lang } from "@/lib/i18n/translations";
import {
  hashAlbumPassword,
  needsRehash,
  verifyAlbumPassword,
} from "@/lib/album-password";
import { verifiedEmails } from "@/lib/album-ownership";
import { toPublicAlbum } from "@/lib/album-view";
import { getAlbumFlags } from "@/lib/album-flags";
import { getAlbumHeaderSettings } from "@/lib/album-header-settings";
import {
  getAlbumAppearance,
  WELCOME_FONT_STACKS,
  type WelcomeFont,
} from "@/lib/album-appearance";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// generateMetadata and AlbumPage both need the same album row. React cache
// deduplicates that ORM call within one server render without making gallery
// data stale across requests.
const getAlbumBySlug = cache((slug: string) =>
  withSchemaHealing(() =>
    db.query.albums.findFirst({ where: eq(albums.slug, slug) }),
  ),
);

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; event?: string }>;
}

const EVENT_LABEL_SL: Record<string, string> = {
  wedding: "Poročni album za",
  birthday: "Album rojstnega dne za",
  anniversary: "Album obletnice za",
  party: "Album zabave za",
  baptism: "Album krsta za",
  graduation: "Maturantski album za",
  baby_shower: "Baby shower album za",
  business: "Poslovni album za",
  other: "Album dogodka za",
};

/** Legacy Bunny iframe fallback if signed same-origin playback is unavailable. */
function compatibleBunnyPlayerUrl(url: string): string {
  return url.replace(
    "https://player.mediadelivery.net/embed/",
    "https://iframe.mediadelivery.net/embed/",
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Album not found" };

  const eventLabel =
    EVENT_LABEL_SL[album.eventType ?? "other"] ?? EVENT_LABEL_SL.other;
  const description = `${eventLabel} ${album.coupleName}, ${album.weddingDate}`;

  return {
    title: `${album.coupleName} — Guestcam`,
    description,
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
  const renderedAt = new Date().toISOString();

  // These are independent request operations. Starting them together avoids
  // paying their network latency one after another on every gallery visit.
  const [album, { lang: langParam, event }, requestHeaders, session] =
    await Promise.all([
      getAlbumBySlug(slug),
      searchParams,
      headers(),
      auth().catch(() => null),
    ]);

  if (!album || !album.isPublished) {
    notFound();
  }

  const VALID_LANGS: readonly Lang[] = ["sl", "hr", "sr", "de", "en", "es"];
  const isValidLang = (v: string | undefined | null): v is Lang =>
    !!v && (VALID_LANGS as readonly string[]).includes(v);
  const lang: Lang = isValidLang(langParam)
    ? langParam
    : isValidLang(album.defaultLang)
      ? album.defaultLang
      : "sl";

  let isOwner = false;
  try {
    if (session?.userId) {
      if (session.userId === album.ownerClerkId) {
        isOwner = true;
      } else if (album.ownerEmail) {
        const user = await currentUser();
        const wanted = album.ownerEmail.toLowerCase();
        if (verifiedEmails(user).includes(wanted)) {
          isOwner = true;
        }
      }
    }
  } catch {
    /* viewer is anonymous */
  }

  const internalAlbumPassword =
    requestHeaders.get("x-album-access-password") ?? "";

  const passwordRequired = !!album.password && !isOwner;
  let passwordCorrect = isOwner || !album.password;
  if (!passwordCorrect && album.password) {
    passwordCorrect = await verifyAlbumPassword(
      internalAlbumPassword,
      album.password,
    );
    if (passwordCorrect && needsRehash(album.password)) {
      const upgraded = await hashAlbumPassword(internalAlbumPassword);
      await db
        .update(albums)
        .set({ password: upgraded })
        .where(eq(albums.id, album.id))
        .catch(() => {});
    }
  }

  const isEventSurface = event === "1";
  const [albumPhotos, flags, headerSettings, appearance, albumMoments] =
    await Promise.all([
      passwordCorrect
        ? db.query.photos.findMany({
            where: and(
              eq(photos.albumId, album.id),
              eq(photos.status, "published"),
            ),
            orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
          })
        : Promise.resolve([]),
      getAlbumFlags(album.id),
      getAlbumHeaderSettings(album.id),
      isEventSurface ? getAlbumAppearance(album.id) : Promise.resolve(null),
      db.query.moments.findMany({
        where: eq(moments.albumId, album.id),
        orderBy: (m, { asc }) => [asc(m.sortOrder), asc(m.createdAt)],
      }),
    ]);

  // Restore the proven Bunny iframe playback used by the older deployments.
  // The library's optional thumbnail and MP4 fallback files currently return
  // 404, while Bunny's own iframe/HLS player is healthy. Keep the Stream ID so
  // the gallery renders that player directly instead of routing through the
  // broken optional assets.
  const playbackPhotos = albumPhotos.map((photo) =>
    photo.cfStreamVideoId
      ? { ...photo, blobUrl: compatibleBunnyPlayerUrl(photo.blobUrl) }
      : photo,
  );

  // Event/Photo Wall branding belongs only to the dedicated event surface.
  // Ordinary album URLs stay standard even when event branding is configured.
  const requireEventGuestData = flags.guestDataCapture && isEventSurface;

  return (
    <>
      <style>{`
        #CookiebotWidget { display: none !important; }
        video[controls] {
          display: block !important;
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          max-height: none !important;
          object-fit: contain !important;
          background: #000;
        }
      `}</style>
      <AlbumGuestView
        album={toPublicAlbum(album)}
        photos={playbackPhotos}
        moments={albumMoments}
        passwordRequired={passwordRequired}
        passwordCorrect={passwordCorrect}
        initialLang={lang}
        renderedAt={renderedAt}
        isOwner={isOwner}
        requireGuestData={requireEventGuestData}
        eventFlags={flags}
        headerVisibility={headerSettings}
        appearance={
          appearance
            ? {
                logoUrl: appearance.logoUrl,
                accentColor: appearance.accentColor,
                backgroundUrl: appearance.backgroundUrl,
                welcomeEnabled: appearance.welcomeEnabled,
                welcomeTitle: appearance.welcomeTitle,
                welcomeText: appearance.welcomeText,
                welcomeButton: appearance.welcomeButton,
                welcomeBgUrl: appearance.welcomeBgUrl,
                welcomeFontStack:
                  WELCOME_FONT_STACKS[appearance.welcomeFont as WelcomeFont] ??
                  WELCOME_FONT_STACKS.elegant,
              }
            : undefined
        }
      />
    </>
  );
}
