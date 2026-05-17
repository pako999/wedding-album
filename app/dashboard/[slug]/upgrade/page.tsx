import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpgradePage } from "@/components/dashboard/UpgradePage";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function UpgradePageRoute({ params }: Props) {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {/* ignore */}
  if (!userId) redirect("/sign-in");

  const { slug } = await params;

  let album: typeof albums.$inferSelect | null = null;
  try {
    const result = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    album = result ?? null;
  } catch {/* DB not ready */}

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  return <UpgradePage album={album} />;
}
