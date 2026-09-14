import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RedeemCouponButton } from "@/components/local/RedeemCouponButton";
import { db } from "@/lib/db";
import {
  localCoupons,
  localRewardCampaigns,
  localRewardProducts,
} from "@/lib/db/local-rewards-schema";

export const dynamic = "force-dynamic";

export default async function RedeemLocalCouponPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { userId } = await auth();
  const { code } = await params;
  const normalized = decodeURIComponent(code).trim().toUpperCase();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/dashboard/local/redeem/${normalized}`)}`);
  }

  let row: {
    coupon: typeof localCoupons.$inferSelect;
    campaign: typeof localRewardCampaigns.$inferSelect;
  } | null = null;
  let products: string[] = [];
  let migrationReady = true;

  try {
    const rows = await db
      .select({ coupon: localCoupons, campaign: localRewardCampaigns })
      .from(localCoupons)
      .innerJoin(localRewardCampaigns, eq(localCoupons.campaignId, localRewardCampaigns.id))
      .where(and(
        eq(localCoupons.code, normalized),
        eq(localRewardCampaigns.ownerClerkId, userId),
      ))
      .limit(1);
    row = rows[0] ?? null;

    if (row) {
      const itemRows = await db
        .select({ name: localRewardProducts.name })
        .from(localRewardProducts)
        .where(and(
          eq(localRewardProducts.campaignId, row.campaign.id),
          eq(localRewardProducts.isActive, true),
        ));
      products = itemRows.map((item) => item.name);
    }
  } catch {
    migrationReady = false;
  }

  const now = Date.now();
  const expiredByDate = Boolean(
    row?.coupon.expiresAt && row.coupon.expiresAt.getTime() < now,
  );
  const visualStatus = expiredByDate && row?.coupon.status === "issued"
    ? "expired"
    : row?.coupon.status;

  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      <DashboardNav />
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/dashboard/local" className="text-xs font-semibold text-[color:var(--honey)]">
          ← Local Rewards
        </Link>

        {!migrationReady ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            Local Rewards baza še ni aktivirana.
          </div>
        ) : !row ? (
          <div className="mt-6 rounded-3xl border border-[color:var(--hairline)] bg-white p-8 text-center">
            <div className="text-4xl">🔒</div>
            <h1 className="mt-4 text-2xl font-semibold">Kupon ni najden</h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Koda ni veljavna ali kupon ne pripada vašemu lokalu.
            </p>
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-[30px] border border-[color:var(--hairline)] bg-white shadow-sm">
            <div className="bg-[color:var(--ink)] px-6 py-7 text-center text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">{row.campaign.venueName}</p>
              <h1 className="mt-2 text-2xl font-semibold">Preverjanje kupona</h1>
              <p className="mt-3 font-mono text-3xl font-black tracking-[0.08em]">{row.coupon.code}</p>
            </div>

            <div className="p-5 sm:p-6">
              <StatusCard status={visualStatus ?? "void"} redeemedAt={row.coupon.redeemedAt} />

              <div className="mt-4 rounded-2xl bg-[#FFF3CC] p-5 text-[#68470F]">
                <p className="text-[10px] font-bold uppercase tracking-[0.17em]">Nagrada</p>
                <p className="mt-1.5 text-xl font-semibold">{row.coupon.rewardTitle}</p>
                {row.coupon.rewardDescription && (
                  <p className="mt-2 text-sm leading-5 opacity-75">{row.coupon.rewardDescription}</p>
                )}
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <Info label="Gost" value={row.coupon.guestName || "—"} />
                <Info
                  label="Velja do"
                  value={row.coupon.expiresAt ? row.coupon.expiresAt.toLocaleDateString("sl-SI") : "Brez omejitve"}
                />
                {products.length > 0 && <Info label="Velja za" value={products.join(", ")} />}
              </dl>

              {row.coupon.rewardTerms && (
                <p className="mt-4 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--paper)] px-4 py-3 text-xs leading-5 text-[color:var(--muted)]">
                  {row.coupon.rewardTerms}
                </p>
              )}

              {visualStatus === "issued" && (
                <div className="mt-5">
                  <RedeemCouponButton code={row.coupon.code} />
                  <p className="mt-3 text-center text-xs text-[color:var(--muted)]">
                    Po potrditvi se kupon trajno označi kot unovčen in ga ni mogoče uporabiti še enkrat.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[color:var(--hairline)] px-4 py-3">
      <dt className="text-[color:var(--muted)]">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function StatusCard({
  status,
  redeemedAt,
}: {
  status: string;
  redeemedAt: Date | null;
}) {
  if (status === "redeemed") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center text-green-800">
        <div className="text-3xl">✅</div>
        <p className="mt-2 text-lg font-bold">Kupon je že unovčen</p>
        {redeemedAt && <p className="mt-1 text-xs">{redeemedAt.toLocaleString("sl-SI")}</p>}
      </div>
    );
  }
  if (status === "expired") {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center font-semibold text-amber-800">⌛ Kupon je potekel</div>;
  }
  if (status === "void") {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-semibold text-red-800">✕ Kupon je preklican</div>;
  }
  return <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center font-semibold text-green-800">✓ Veljaven kupon</div>;
}
