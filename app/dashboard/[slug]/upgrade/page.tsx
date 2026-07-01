import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpgradePage } from "@/components/dashboard/UpgradePage";
import { detectLang, type Lang } from "@/lib/i18n/translations";

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

  // Lang detection precedence:
  //   1. ?lang= search param (explicit override)
  //   2. First segment of the current pathname or referrer (i.e. the
  //      locale the user was already browsing in — matches what they
  //      see in the header language switcher). This is what people
  //      actually mean by "the site is in X".
  //   3. Accept-Language browser header (fallback for direct visits).
  //   4. "sl" default.
  function langFromPath(pathname: string | null | undefined): Lang | null {
    if (!pathname) return null;
    const seg = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return seg && VALID_LANGS.includes(seg as Lang) ? (seg as Lang) : null;
  }
  function langFromReferer(ref: string | null | undefined): Lang | null {
    if (!ref) return null;
    try { return langFromPath(new URL(ref).pathname); } catch { return null; }
  }
  const lang: Lang =
    (sp.lang && VALID_LANGS.includes(sp.lang as Lang) ? (sp.lang as Lang) : null) ??
    langFromPath(h.get("x-pathname")) ??
    langFromReferer(h.get("referer")) ??
    detectLang(h.get("accept-language"));

  let album: typeof albums.$inferSelect | null = null;
  try {
    const result = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    album = result ?? null;
  } catch {/* DB not ready */}

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  return <UpgradePage album={album} lang={lang} />;
}
