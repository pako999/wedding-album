import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PrintPageClient } from "@/components/dashboard/PrintPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PrintPage({ params }: Props) {
  // Auth
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {/* ignore */}
  if (!userId) redirect("/sign-in");

  const { slug } = await params;

  // Fetch album
  let album: typeof albums.$inferSelect | null = null;
  try {
    const result = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    album = result ?? null;
  } catch {/* DB not ready */}

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  // Build URLs
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://wedding-album-lilac.vercel.app";
  const albumUrl = `${appUrl}/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(albumUrl)}&bgcolor=ffffff&color=1C1917&qzone=2&format=png`;

  return (
    <PrintPageClient
      slug={slug}
      coupleName={album.coupleName}
      weddingDate={album.weddingDate}
      location={album.location ?? null}
      qrUrl={qrUrl}
      albumUrl={albumUrl}
    />
  );
}
