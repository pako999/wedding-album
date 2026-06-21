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

  // Prefer explicit ?lang= param, fall back to Accept-Language header
  const h = await headers();
  const lang: Lang = (sp.lang as Lang | undefined) ?? detectLang(h.get("accept-language"));

  let album: typeof albums.$inferSelect | null = null;
  try {
    const result = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    album = result ?? null;
  } catch {/* DB not ready */}

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  return <UpgradePage album={album} lang={lang} />;
}
