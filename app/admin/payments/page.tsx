import { listPayments, mollieConfigured, isPaidStatus, type MolliePayment } from "@/lib/mollie";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

interface EnrichedPayment extends MolliePayment {
  ownerEmail: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
}

async function safeList(): Promise<MolliePayment[]> {
  if (!mollieConfigured()) return [];
  try {
    return await listPayments(50);
  } catch (err) {
    console.error("[admin payments] mollie list failed:", err);
    return [];
  }
}

async function enrichWithOwner(payments: MolliePayment[]): Promise<EnrichedPayment[]> {
  // Collect unique album slugs from payment metadata
  const slugs = [...new Set(
    payments.map((p) => p.metadata?.albumSlug).filter(Boolean) as string[]
  )];

  if (slugs.length === 0) {
    return payments.map((p) => ({ ...p, ownerEmail: null, ownerFirstName: null, ownerLastName: null }));
  }

  // Fetch matching albums from DB
  const albumRows = await db
    .select({ slug: albums.slug, ownerClerkId: albums.ownerClerkId, ownerEmail: albums.ownerEmail })
    .from(albums)
    .where(inArray(albums.slug, slugs));

  const slugToClerkId = new Map(albumRows.map((a) => [a.slug, { clerkId: a.ownerClerkId, email: a.ownerEmail }]));

  // Batch-fetch Clerk users for unique clerk IDs
  const uniqueClerkIds = [...new Set(albumRows.map((a) => a.ownerClerkId))];
  const clerkUserMap = new Map<string, { email: string | null; firstName: string | null; lastName: string | null }>();

  await Promise.all(
    uniqueClerkIds.map(async (clerkId) => {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(clerkId);
        clerkUserMap.set(clerkId, {
          email: user.emailAddresses?.[0]?.emailAddress ?? null,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
        });
      } catch {
        clerkUserMap.set(clerkId, { email: null, firstName: null, lastName: null });
      }
    })
  );

  return payments.map((p) => {
    const slug = p.metadata?.albumSlug;
    const owner = slug ? slugToClerkId.get(slug) : undefined;
    const clerkUser = owner ? clerkUserMap.get(owner.clerkId) : undefined;
    return {
      ...p,
      ownerEmail: clerkUser?.email ?? owner?.email ?? null,
      ownerFirstName: clerkUser?.firstName ?? null,
      ownerLastName: clerkUser?.lastName ?? null,
    };
  });
}

export default async function AdminPayments() {
  const payments = await safeList();
  const configured = mollieConfigured();
  const enriched = await enrichWithOwner(payments);

  const totalEur = enriched
    .filter((p) => isPaidStatus(p.status) && p.amount.currency.toUpperCase() === "EUR")
    .reduce((sum, p) => sum + parseFloat(p.amount.value), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Plačila</h1>
        <p className="text-sm text-gray-500 mt-1">
          Zadnjih {enriched.length} transakcij iz Mollie · skupaj plačano {totalEur.toFixed(2)}€
        </p>
      </header>

      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>MOLLIE_API_KEY ni nastavljen.</strong> Dodajte ga v okoljske spremenljivke.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Stranka</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Galerija</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Znesek</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium text-right">ID</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 text-[#0F1729]">
                  {[p.ownerFirstName, p.ownerLastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {p.ownerEmail ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {p.metadata?.albumSlug ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs uppercase font-semibold text-gray-700">
                  {p.metadata?.planId ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-[#0F1729]">
                  {parseFloat(p.amount.value).toFixed(2)}{p.amount.currency === "EUR" ? "€" : ` ${p.amount.currency}`}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${
                    isPaidStatus(p.status)
                      ? "bg-green-50 text-green-700"
                      : p.status === "canceled" || p.status === "expired" || p.status === "failed"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-amber-50 text-amber-700"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {p.createdAt ? new Date(p.createdAt).toLocaleString("sl-SI") : "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-400">
                  {p.id}
                </td>
              </tr>
            ))}
            {enriched.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  Ni Mollie transakcij.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
