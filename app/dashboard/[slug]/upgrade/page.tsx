import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpgradePage } from "@/components/dashboard/UpgradePage";
import { type Lang } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function UpgradePageRoute({ params, searchParams }: Props) {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {/* ignore */}
  if (!userId) redirect("/sign-in");

  const { slug } = await params;
  const sp = await searchParams;

  const h = await headers();
  const VALID_LANGS: Lang[] = ["sl", "hr", "sr", "en", "de", "es"];

  // Lang detection precedence (upgrade flow is Slovenian-first — the
  // site's primary market — so we deliberately do NOT fall through to
  // Accept-Language, which would flip parts of the page to English for
  // any browser set to English while other hardcoded copy stays SL.
  // The right signals are the visitor's own choice, in this order):
  //   1. ?lang= search param (explicit override)
  //   2. First segment of the pathname or referrer (locale they were
  //      already browsing in)
  //   3. Clerk publicMetadata.lang (locale they picked at signup)
  //   4. "sl" default (primary market)
  function langFromPath(pathname: string | null | undefined): Lang | null {
    if (!pathname) return null;
    const seg = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return seg && VALID_LANGS.includes(seg as Lang) ? (seg as Lang) : null;
  }
  function langFromReferer(ref: string | null | undefined): Lang | null {
    if (!ref) return null;
    try { return langFromPath(new URL(ref).pathname); } catch { return null; }
  }
  async function langFromClerk(): Promise<Lang | null> {
    try {
      const u = await currentUser();
      const raw = (u?.publicMetadata as Record<string, unknown> | undefined)?.lang;
      if (typeof raw === "string" && VALID_LANGS.includes(raw as Lang)) return raw as Lang;
    } catch { /* Clerk unavailable — ignore */ }
    return null;
  }
  const lang: Lang =
    (sp.lang && VALID_LANGS.includes(sp.lang as Lang) ? (sp.lang as Lang) : null) ??
    langFromPath(h.get("x-pathname")) ??
    langFromReferer(h.get("referer")) ??
    (await langFromClerk()) ??
    "sl";

  let album: typeof albums.$inferSelect | null = null;
  try {
    const result = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    album = result ?? null;
  } catch {/* DB not ready */}

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  return <UpgradePage album={album} lang={lang} />;
}
