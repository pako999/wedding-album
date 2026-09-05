import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withSchemaHealing } from "@/lib/db/bootstrap";
import { AlbumGuestView } from "@/components/album/AlbumGuestView";
import { type Lang } from "@/lib/i18n/translations";
import { hashAlbumPassword, needsRehash, verifyAlbumPassword } from "@/lib/album-password";
import { verifiedEmails } from "@/lib/album-ownership";
import { toPublicAlbum } from "@/lib/album-view";
import { getAlbumFlags } from "@/lib/album-flags";
import { getAlbumHeaderSettings } from "@/lib/album-header-settings";
import { getAlbumAppearance, WELCOME_FONT_STACKS, type WelcomeFont } from "@/lib/album-appearance";
import { createVideoPlaybackToken } from "@/lib/video-playback-token";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; event?: string }>;
}

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

/** Legacy Bunny iframe fallback if signed same-origin playback is unavailable. */
function compatibleBunnyPlayerUrl(url: string): string {
  return url.replace(
    "https://player.mediadelivery.net/embed/",
    "https://iframe.mediadelivery.net/embed/",
  );
}

/** Safari HLS fallback if the signed MP4 playback token cannot be created. */
function bunnyHlsUrl(thumbnailUrl: string | null | undefined, videoId: string): string | null {
  if (!thumbnailUrl || !videoId) return null;
  try {
    const normalized = /^https?:\/\//i.test(thumbnailUrl)
      ? thumbnailUrl
      : `https://${thumbnailUrl}`;
    const thumbnail = new URL(normalized);
    return `${thumbnail.protocol}//${thumbnail.host}/${videoId}/playlist.m3u8`;
  } catch {
    return null;
  }
}

function isSafariUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;
  const hasSafari = /Safari\//i.test(userAgent);
  const isOtherWebKitBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);
  return hasSafari && !isOtherWebKitBrowser;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await withSchemaHealing(() =>
    db.query.albums.findFirst({ where: eq(albums.slug, slug) }),
  );
  if (!album) return { title: "Album not found" };

  const eventLabel = EVENT_LABEL_SL[album.eventType ?? "other"] ?? EVENT_LABEL_SL.other;
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
  const { lang: langParam, event } = await searchParams;
  const renderedAt = new Date().toISOString();

  const album = await withSchemaHealing(() =>
    db.query.albums.findFirst({ where: eq(albums.slug, slug) }),
  );

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
    const session = await auth();
    if (session.userId) {
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
  } catch { /* viewer is anonymous */ }

  const requestHeaders = await headers();
  const internalAlbumPassword = requestHeaders.get("x-album-access-password") ?? "";

  const passwordRequired = !!album.password && !isOwner;
  let passwordCorrect = isOwner || !album.password;
  if (!passwordCorrect && album.password) {
    passwordCorrect = await verifyAlbumPassword(internalAlbumPassword, album.password);
    if (passwordCorrect && needsRehash(album.password)) {
      const upgraded = await hashAlbumPassword(internalAlbumPassword);
      await db
        .update(albums)
        .set({ password: upgraded })
        .where(eq(albums.id, album.id))
        .catch(() => {});
    }
  }

  const albumPhotos = passwordCorrect
    ? await db.query.photos.findMany({
        where: and(
          eq(photos.albumId, album.id),
          eq(photos.status, "published")
        ),
        orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
      })
    : [];

  const userAgent = requestHeaders.get("user-agent") ?? "";
  const safari = isSafariUserAgent(userAgent);
  const playbackExpiresAt = Math.floor(Date.now() / 1000) + 2 * 60 * 60;

  // Use Guestcam's same-origin signed MP4 proxy for every browser. This keeps
  // portrait videos in the native <video> element, so they can use the full
  // card width instead of being letterboxed inside Bunny's fixed 16:9 iframe.
  // HLS/iframe remain fallbacks only if a playback token cannot be created.
  const playbackPhotos = albumPhotos.map((photo) => {
    if (!photo.cfStreamVideoId) return photo;

    const sig = createVideoPlaybackToken(slug, photo.cfStreamVideoId, playbackExpiresAt);
    if (sig) {
      const qs = new URLSearchParams({
        vid: photo.cfStreamVideoId,
        play: "1",
        exp: String(playbackExpiresAt),
        sig,
      });
      return {
        ...photo,
        blobUrl: `/api/albums/${encodeURIComponent(slug)}/video-download?${qs.toString()}`,
        cfStreamVideoId: null,
      };
    }

    if (safari) {
      const hlsUrl = bunnyHlsUrl(photo.thumbnailUrl, photo.cfStreamVideoId);
      if (hlsUrl) {
        return {
          ...photo,
          blobUrl: hlsUrl,
          cfStreamVideoId: null,
        };
      }
    }

    return { ...photo, blobUrl: compatibleBunnyPlayerUrl(photo.blobUrl) };
  });

  // Event/Photo Wall branding belongs only to the dedicated event surface.
  // Ordinary album URLs stay standard even when event branding is configured.
  const [flags, headerSettings] = await Promise.all([
    getAlbumFlags(album.id),
    getAlbumHeaderSettings(album.id),
  ]);
  const isEventSurface = event === "1";
  const appearance = isEventSurface ? await getAlbumAppearance(album.id) : null;
  const requireEventGuestData = flags.guestDataCapture && isEventSurface;

  const albumMoments = await db.query.moments.findMany({
    where: eq(moments.albumId, album.id),
    orderBy: (m, { asc }) => [asc(m.sortOrder), asc(m.createdAt)],
  });

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
        appearance={appearance ? {
          logoUrl: appearance.logoUrl,
          accentColor: appearance.accentColor,
          backgroundUrl: appearance.backgroundUrl,
          welcomeEnabled: appearance.welcomeEnabled,
          welcomeTitle: appearance.welcomeTitle,
          welcomeText: appearance.welcomeText,
          welcomeButton: appearance.welcomeButton,
          welcomeBgUrl: appearance.welcomeBgUrl,
          welcomeFontStack: WELCOME_FONT_STACKS[(appearance.welcomeFont as WelcomeFont)] ?? WELCOME_FONT_STACKS.elegant,
        } : undefined}
      />
    </>
  );
}
