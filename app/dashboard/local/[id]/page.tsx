import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { db } from "@/lib/db";
import {
  localRewardCampaigns,
  localQrSources,
  localRewardProducts,
} from "@/lib/db/local-rewards-schema";

export const dynamic = "force-dynamic";

export default async function LocalCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;

  let campaign: typeof localRewardCampaigns.$inferSelect | null = null;
  let sources: (typeof localQrSources.$inferSelect)[] = [];
  let products: (typeof localRewardProducts.$inferSelect)[] = [];
  let migrationReady = true;

  try {
    const rows = await db
      .select()
      .from(localRewardCampaigns)
      .where(and(eq(localRewardCampaigns.id, id), eq(localRewardCampaigns.ownerClerkId, userId)))
      .limit(1);
    campaign = rows[0] ?? null;
    if (campaign) {
      [sources, products] = await Promise.all([
        db.select().from(localQrSources).where(eq(localQrSources.campaignId, campaign.id)),
        db.select().from(localRewardProducts).where(eq(localRewardProducts.campaignId, campaign.id)),
      ]);
    }
  } catch {
    migrationReady = false;
  }

  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/dashboard/local" className="text-xs font-semibold text-[color:var(--honey)]">← Local Rewards</Link>

        {!migrationReady ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <h1 className="text-xl font-semibold">Local Rewards baza še ni aktivirana</h1>
            <p className="mt-2 text-sm">Najprej je treba izvesti varno Local/Rewards migracijo. Obstoječi Guestcam albumi niso prizadeti.</p>
          </div>
        ) : !campaign ? (
          <div className="mt-6 rounded-2xl border border-[color:var(--hairline)] bg-white p-8 text-center">
            <h1 className="text-xl font-semibold">Kampanja ni najdena</h1>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
                  <span className={`h-2.5 w-2.5 rounded-full ${campaign.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                  {campaign.isActive ? "Aktivna kampanja" : "Neaktivna kampanja"}
                </div>
                <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">{campaign.campaignName}</h1>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{campaign.venueName} · {campaign.rewardTitle}</p>
              </div>
              <Link href="/dashboard/local/new" className="rounded-xl border border-[color:var(--hairline)] bg-white px-4 py-2.5 text-sm font-semibold">+ Nova kampanja</Link>
            </div>

            <div className="mt-7 grid sm:grid-cols-3 gap-4">
              <Stat label="Izdani kuponi" value={String(campaign.issuedCount)} />
              <Stat label="Unovčeni" value={String(campaign.redeemedCount)} />
              <Stat label="Stopnja vrnitve" value={`${campaign.issuedCount ? Math.round(campaign.redeemedCount / campaign.issuedCount * 100) : 0}%`} />
            </div>

            <div className="mt-6 grid lg:grid-cols-[1fr_.8fr] gap-5">
              <section className="rounded-2xl border border-[color:var(--hairline)] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">QR lokacije</h2>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">Vsaka miza ali lokacija ima svoj QR, source code in statistiko.</p>
                  </div>
                  <span className="rounded-full bg-[color:var(--paper)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--muted)]">{sources.length} QR</span>
                </div>
                <div className="mt-4 space-y-3">
                  {sources.map((source) => (
                    <div key={source.id} className="rounded-xl border border-[color:var(--hairline)] bg-[color:var(--paper)] p-4">
                      <div className="flex gap-4">
                        <img
                          src={`/api/local/sources/${encodeURIComponent(source.code)}/qr`}
                          alt={`QR ${source.label}`}
                          className="h-20 w-20 shrink-0 rounded-xl border border-[color:var(--hairline)] bg-white p-1.5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{source.label}</p>
                              <p className="mt-1 text-xs text-[color:var(--muted)]">{source.tableNumber ? `Miza ${source.tableNumber} · ` : ""}{source.scanCount} skenov</p>
                            </div>
                            <span className="hidden sm:inline rounded-lg bg-white px-2.5 py-1 font-mono text-[10px]">{source.code}</span>
                          </div>
                          <div className="mt-2 truncate rounded-lg bg-white px-3 py-2 text-[11px] text-[color:var(--muted)]">/local/{source.code}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Link
                              href={`/dashboard/local/qr/${encodeURIComponent(source.code)}`}
                              className="rounded-lg bg-[color:var(--ink)] px-3 py-2 text-[11px] font-semibold text-[color:var(--paper)]"
                            >
                              🖨️ Natisni QR
                            </Link>
                            <Link
                              href={`/local/${encodeURIComponent(source.code)}`}
                              target="_blank"
                              className="rounded-lg border border-[color:var(--hairline)] bg-white px-3 py-2 text-[11px] font-semibold"
                            >
                              👁 Predogled gosta
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!sources.length && <p className="text-sm text-[color:var(--muted)]">Še ni QR lokacij.</p>}
                </div>
              </section>

              <section className="rounded-2xl border border-[color:var(--hairline)] bg-white p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--honey)]">Nagrada</p>
                <h2 className="mt-2 text-2xl font-semibold">{campaign.rewardTitle}</h2>
                {campaign.rewardDescription && <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{campaign.rewardDescription}</p>}
                <div className="mt-4 rounded-xl bg-[#FFF3CC] p-4 text-sm text-[#68470F]">
                  Kupon velja {campaign.validDays === 0 ? "brez časovne omejitve" : `${campaign.validDays} dni`}.
                  {campaign.maxCoupons ? ` Največ ${campaign.maxCoupons} kuponov.` : " Brez omejitve števila kuponov."}
                </div>
                {products.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold">Velja za:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {products.map((product) => <span key={product.id} className="rounded-full border border-[color:var(--hairline)] px-3 py-1 text-xs">{product.name}</span>)}
                    </div>
                  </div>
                )}
                {campaign.socialBonusEnabled && campaign.socialBonusText && (
                  <div className="mt-4 rounded-xl border border-[color:var(--hairline)] p-4 text-xs leading-5 text-[color:var(--muted)]">
                    📱 <strong className="text-[color:var(--ink)]">Social bonus:</strong> {campaign.socialBonusText}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[color:var(--hairline)] bg-white p-5"><p className="text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}
