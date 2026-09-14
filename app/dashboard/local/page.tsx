import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { db } from "@/lib/db";
import { localRewardCampaigns } from "@/lib/db/local-rewards-schema";

export const dynamic = "force-dynamic";

export default async function LocalRewardsDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let campaigns: (typeof localRewardCampaigns.$inferSelect)[] = [];
  let migrationReady = true;
  try {
    campaigns = await db
      .select()
      .from(localRewardCampaigns)
      .where(eq(localRewardCampaigns.ownerClerkId, userId))
      .orderBy(desc(localRewardCampaigns.createdAt));
  } catch {
    migrationReady = false;
  }

  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      <DashboardNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center rounded-full border border-[color:var(--hairline)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--honey)] mb-3">
              Guestcam Local · MVP
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Local Rewards</h1>
            <p className="mt-2 text-sm sm:text-base text-[color:var(--muted)] max-w-2xl">
              QR na mizi → gost naloži fotografijo → prejme unikaten kupon → lokal meri ponovne obiske.
            </p>
          </div>
          <Link
            href="/dashboard/local/new"
            className="inline-flex items-center justify-center rounded-xl bg-[color:var(--ink)] px-5 py-3 text-sm font-semibold text-[color:var(--paper)] hover:opacity-90"
          >
            + Nova kampanja
          </Link>
        </div>

        {!migrationReady && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">Local Rewards baza še ni aktivirana</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              UI je pripravljen, production podatkov pa še ne zapisujemo. Ko potrdimo MVP model, zaženemo
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5">npm run db:migrate-local</code>.
            </p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3 mb-8">
          <Stat label="Aktivne kampanje" value={String(campaigns.filter((c) => c.isActive).length)} />
          <Stat label="Izdani kuponi" value={String(campaigns.reduce((sum, c) => sum + c.issuedCount, 0))} />
          <Stat label="Unovčeni kuponi" value={String(campaigns.reduce((sum, c) => sum + c.redeemedCount, 0))} />
        </section>

        {campaigns.length === 0 ? (
          <section className="rounded-3xl border border-[color:var(--hairline)] bg-white p-6 sm:p-10">
            <div className="grid md:grid-cols-[1.1fr_.9fr] gap-8 items-center">
              <div>
                <span className="text-4xl">☕</span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">Prva kampanja v manj kot minuti</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Lokal izbere nagrado, natisne QR za mizo in začne zbirati fotografije ter ponovne obiske.
                  Osnovna nagrada je vezana na upload; social sharing bomo dodali kot dodatni bonus.
                </p>
                <Link
                  href="/dashboard/local/new"
                  className="mt-5 inline-flex rounded-xl bg-[color:var(--honey)] px-5 py-3 text-sm font-semibold text-white hover:brightness-95"
                >
                  Ustvari testno kampanjo →
                </Link>
              </div>
              <div className="rounded-2xl border border-[color:var(--hairline)] bg-[color:var(--paper)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">Primer QR kartice</p>
                <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto grid h-32 w-32 place-items-center rounded-xl border-2 border-dashed border-[color:var(--hairline)] text-5xl">▦</div>
                  <p className="mt-4 text-lg font-semibold">📸 Deli trenutek</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Naloži fotografijo in odkleni nagrado.</p>
                  <div className="mt-4 rounded-xl bg-[#FFF3CC] px-4 py-3 font-semibold text-[#7A5514]">−20 % na naslednjo kavo</div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-4">
            {campaigns.map((campaign) => {
              const redemptionRate = campaign.issuedCount > 0
                ? Math.round((campaign.redeemedCount / campaign.issuedCount) * 100)
                : 0;
              return (
                <article key={campaign.id} className="rounded-2xl border border-[color:var(--hairline)] bg-white p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${campaign.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                        <h2 className="text-lg font-semibold">{campaign.campaignName}</h2>
                      </div>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">{campaign.venueName} · {campaign.rewardTitle}</p>
                    </div>
                    <Link href={`/dashboard/local/${campaign.id}`} className="text-sm font-semibold text-[color:var(--honey)]">
                      Odpri kampanjo →
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <MiniStat label="Izdano" value={String(campaign.issuedCount)} />
                    <MiniStat label="Unovčeno" value={String(campaign.redeemedCount)} />
                    <MiniStat label="Return rate" value={`${redemptionRate}%`} />
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--hairline)] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[color:var(--paper)] p-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-[color:var(--muted)]">{label}</p>
    </div>
  );
}
