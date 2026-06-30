import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { affiliates, affiliateCommissions, discountCodes } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { AffiliateAdminControls } from "./AffiliateAdminControls";
import { PromoCodeControls } from "./PromoCodeControls";
import { ReferralLinkCard } from "./ReferralLinkCard";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: "V čakanju",
  approved: "Potrjeno",
  paid: "Izplačano",
  cancelled: "Preklicano",
};

function fmtEur(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("sl-SI");
}

export default async function AdminAffiliateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.id, id),
  });
  if (!affiliate) notFound();

  const commissions = await db
    .select()
    .from(affiliateCommissions)
    .where(eq(affiliateCommissions.affiliateId, id))
    .orderBy(desc(affiliateCommissions.createdAt))
    .limit(100);

  const promo = await db.query.discountCodes.findFirst({
    where: and(eq(discountCodes.affiliateId, id), eq(discountCodes.isActive, true)),
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/affiliates" className="text-xs text-gray-500 hover:text-[#0F1729]">
          ← Vsi partnerji
        </Link>
        <h1 className="font-serif text-3xl text-[#0F1729] mt-2">{affiliate.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{affiliate.email}</p>
      </div>

      {/* Controls */}
      <AffiliateAdminControls affiliate={affiliate} />

      {/* Referral link the partner shares with customers */}
      <ReferralLinkCard
        affiliateId={affiliate.id}
        referralCode={affiliate.referralCode}
        status={affiliate.status}
        approvedAt={affiliate.approvedAt ? affiliate.approvedAt.toISOString() : null}
      />

      {/* Promo (discount) code for customers */}
      <PromoCodeControls affiliateId={affiliate.id} initialPromo={promo ?? null} />

      {/* Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-bold text-[#0F1729] mb-3">Podatki</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Koda" value={<code className="font-mono text-[#1E3A8A]">{affiliate.referralCode}</code>} />
          <Field label="Status" value={affiliate.status} />
          <Field label="Provizija" value={`${affiliate.commissionRate}%`} />
          <Field label="Veljavnost piškotka" value={`${affiliate.cookieDays} dni`} />
          <Field label="Spletna stran" value={affiliate.website ? <a href={affiliate.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{affiliate.website}</a> : "—"} />
          <Field label="PayPal" value={affiliate.paypalEmail ?? "—"} />
          <Field label="IBAN" value={affiliate.bankIban ?? "—"} />
          <Field label="Instagram" value={affiliate.instagramUrl ? <a href={affiliate.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{affiliate.instagramUrl}</a> : "—"} />
          <Field label="Facebook" value={affiliate.facebookUrl ? <a href={affiliate.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{affiliate.facebookUrl}</a> : "—"} />
          <Field label="X (Twitter)" value={affiliate.xUrl ? <a href={affiliate.xUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{affiliate.xUrl}</a> : "—"} />
          <Field label="TikTok" value={affiliate.tiktokUrl ? <a href={affiliate.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{affiliate.tiktokUrl}</a> : "—"} />
          <Field label="Jezik obvestil" value={affiliate.preferredLocale} />
          <Field label="Prijavljen" value={fmtDate(affiliate.createdAt)} />
          <Field label="Odobren" value={fmtDate(affiliate.approvedAt)} />
        </dl>
        {affiliate.promotionPlan && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Načrt promocije</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{affiliate.promotionPlan}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Kliki" value={affiliate.totalClicks.toString()} />
        <StatCard label="Naročila" value={affiliate.totalConversions.toString()} />
        <StatCard label="V čakanju" value={fmtEur(affiliate.pendingBalanceCents)} />
        <StatCard label="Na voljo" value={fmtEur(affiliate.availableBalanceCents)} />
      </div>

      {/* Commissions */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-[#0F1729]">Provizije ({commissions.length})</h2>
        </div>
        {commissions.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">Ni provizij.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Datum</th>
                  <th className="px-4 py-3 font-medium">Album</th>
                  <th className="px-4 py-3 font-medium">Naročilo</th>
                  <th className="px-4 py-3 font-medium text-right">Provizija</th>
                  <th className="px-4 py-3 font-medium">Sproščeno</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-gray-500">{fmtDate(c.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.albumSlug ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{c.orderDescription ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0F1729]">{fmtEur(c.commissionAmountCents)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(c.lockUntil)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{STATUS_LABEL[c.status] ?? c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-sm text-[#0F1729]">{value}</dd>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-extrabold text-[#0F1729]">{value}</p>
    </div>
  );
}
