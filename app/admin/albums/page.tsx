import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { desc, or, like } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { AdminAlbumRow } from "./AdminAlbumRow";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminAlbums({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const search = (q ?? "").trim();

  const rows = await db.query.albums.findMany({
    where: search
      ? or(
          like(albums.slug, `%${search}%`),
          like(albums.coupleName, `%${search}%`),
          like(albums.ownerEmail, `%${search}%`),
        )
      : undefined,
    orderBy: [desc(albums.createdAt)],
    limit: 200,
  });

  // Older albums predate ownerEmail being persisted at creation — resolve
  // those from Clerk by ownerClerkId so the admin always sees who owns
  // what. Batched (Clerk accepts a userId array) + best-effort: if Clerk
  // is down we still render, just with dashes on the legacy rows.
  const clerkEmails = new Map<string, string>();
  const missingIds = [...new Set(
    rows.filter((r) => !r.ownerEmail).map((r) => r.ownerClerkId),
  )];
  if (missingIds.length > 0) {
    try {
      const client = await clerkClient();
      // Clerk caps userId filters at 100 per call; chunk to stay safe.
      for (let i = 0; i < missingIds.length; i += 100) {
        const { data } = await client.users.getUserList({
          userId: missingIds.slice(i, i + 100),
          limit: 100,
        });
        for (const u of data) {
          const email = u.emailAddresses?.[0]?.emailAddress;
          if (email) clerkEmails.set(u.id, email);
        }
      }
    } catch (err) {
      console.warn("[admin/albums] Clerk email lookup failed:", err);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[#0F1729]">Galerije</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rows.length} galerij{search ? ` — iskanje "${search}"` : ""}
          </p>
        </div>
        <form action="/admin/albums" method="get" className="flex gap-2">
          <input
            name="q"
            defaultValue={search}
            placeholder="slug, ime ali email…"
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FFC94D] focus:ring-1 focus:ring-[#FFC94D]"
          />
          <button className="px-4 py-2 bg-[#FFC94D] text-[#0F1729] font-semibold text-sm rounded-lg hover:opacity-90">
            Išči
          </button>
        </form>
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Galerija</th>
              <th className="px-4 py-3 font-medium">Lastnik</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Fotografije</th>
              <th className="px-4 py-3 font-medium">Poteče</th>
              <th className="px-4 py-3 font-medium text-right">Dejanja</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <AdminAlbumRow
                key={a.id}
                slug={a.slug}
                coupleName={a.coupleName}
                ownerEmail={a.ownerEmail ?? clerkEmails.get(a.ownerClerkId) ?? null}
                plan={a.plan}
                filmTier={a.filmTier}
                maxPhotos={a.maxPhotos}
                expiresAt={a.expiresAt ? a.expiresAt.toISOString() : null}
                stripeSessionId={a.stripeSessionId}
              />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  Ni rezultatov.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
