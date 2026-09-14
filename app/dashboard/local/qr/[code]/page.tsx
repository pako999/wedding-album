import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { PrintLocalQrButton } from "@/components/local/PrintLocalQrButton";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { localQrSources, localRewardCampaigns } from "@/lib/db/local-rewards-schema";

export const dynamic = "force-dynamic";

type Lang = "sl" | "hr" | "sr" | "en" | "de" | "es";

const COPY: Record<Lang, { eyebrow: string; title: string; subtitle: string; scan: string; footer: string }> = {
  sl: { eyebrow: "Guestcam Local Rewards", title: "📸 Deli trenutek. Odkleni nagrado.", subtitle: "Naloži fotografijo iz lokala in prejmi nagrado za naslednji obisk.", scan: "Skeniraj QR kodo", footer: "Brez aplikacije · brez registracije" },
  hr: { eyebrow: "Guestcam Local Rewards", title: "📸 Podijeli trenutak. Otključaj nagradu.", subtitle: "Učitaj fotografiju iz lokala i osvoji nagradu za sljedeći posjet.", scan: "Skeniraj QR kod", footer: "Bez aplikacije · bez registracije" },
  sr: { eyebrow: "Guestcam Local Rewards", title: "📸 Podeli trenutak. Otključaj nagradu.", subtitle: "Otpremi fotografiju iz lokala i osvoji nagradu za sledeću posetu.", scan: "Skeniraj QR kod", footer: "Bez aplikacije · bez registracije" },
  en: { eyebrow: "Guestcam Local Rewards", title: "📸 Share the moment. Unlock a reward.", subtitle: "Upload a photo from the venue and get a reward for your next visit.", scan: "Scan the QR code", footer: "No app · no registration" },
  de: { eyebrow: "Guestcam Local Rewards", title: "📸 Teile den Moment. Sichere dir eine Belohnung.", subtitle: "Lade ein Foto aus dem Lokal hoch und erhalte eine Belohnung für deinen nächsten Besuch.", scan: "QR-Code scannen", footer: "Keine App · keine Registrierung" },
  es: { eyebrow: "Guestcam Local Rewards", title: "📸 Comparte el momento. Desbloquea una recompensa.", subtitle: "Sube una foto del local y consigue una recompensa para tu próxima visita.", scan: "Escanea el código QR", footer: "Sin app · sin registro" },
};

export default async function LocalQrPrintPage({ params }: { params: Promise<{ code: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { code } = await params;
  const normalized = decodeURIComponent(code).trim().toUpperCase();

  let row: {
    source: typeof localQrSources.$inferSelect;
    campaign: typeof localRewardCampaigns.$inferSelect;
    album: typeof albums.$inferSelect;
  } | null = null;

  try {
    const rows = await db
      .select({ source: localQrSources, campaign: localRewardCampaigns, album: albums })
      .from(localQrSources)
      .innerJoin(localRewardCampaigns, eq(localQrSources.campaignId, localRewardCampaigns.id))
      .innerJoin(albums, eq(localRewardCampaigns.albumId, albums.id))
      .where(and(
        eq(localQrSources.code, normalized),
        eq(localRewardCampaigns.ownerClerkId, userId),
      ))
      .limit(1);
    row = rows[0] ?? null;
  } catch {
    row = null;
  }

  if (!row) {
    return (
      <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
        <DashboardNav />
        <main className="mx-auto max-w-xl px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold">QR ni najden</h1>
          <Link href="/dashboard/local" className="mt-4 inline-block text-sm font-semibold text-[color:var(--honey)]">← Local Rewards</Link>
        </main>
      </div>
    );
  }

  const lang = (COPY[row.album.defaultLang as Lang] ? row.album.defaultLang : "en") as Lang;
  const t = COPY[lang];

  return (
    <div className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)] print:bg-white">
      <div className="print:hidden"><DashboardNav /></div>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 print:p-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <Link href={`/dashboard/local/${row.campaign.id}`} className="text-xs font-semibold text-[color:var(--honey)]">← Kampanja</Link>
            <h1 className="mt-2 text-2xl font-semibold">QR kartica · {row.source.label}</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Natisni kot A6 kartico ali prilagodi velikost v nastavitvah tiskalnika.</p>
          </div>
          <PrintLocalQrButton />
        </div>

        <div className="mx-auto w-full max-w-[105mm] print:max-w-none">
          <section className="local-reward-print-card mx-auto flex min-h-[148mm] w-[105mm] max-w-full flex-col overflow-hidden rounded-[8mm] border border-[color:var(--hairline)] bg-white shadow-lg print:rounded-none print:border-0 print:shadow-none">
            <div className="bg-[color:var(--ink)] px-[8mm] pb-[7mm] pt-[8mm] text-center text-white">
              <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-white/55">{t.eyebrow}</p>
              <p className="mt-2 text-[12px] font-semibold text-white/75">{row.campaign.venueName}</p>
              <h2 className="mt-3 text-[22px] font-semibold leading-[1.08] tracking-tight">{row.campaign.headline || t.title}</h2>
              <p className="mx-auto mt-3 max-w-[80mm] text-[10px] leading-4 text-white/65">{t.subtitle}</p>
            </div>

            <div className="flex flex-1 flex-col items-center px-[8mm] py-[7mm] text-center">
              <div className="rounded-[5mm] bg-[#FFF3CC] px-[6mm] py-[4mm] text-[#68470F]">
                <p className="text-[8px] font-bold uppercase tracking-[0.17em]">🎁</p>
                <p className="mt-1 text-[17px] font-bold leading-tight">{row.campaign.rewardTitle}</p>
              </div>

              <p className="mt-[5mm] text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--muted)]">{t.scan}</p>
              <img
                src={`/api/local/sources/${encodeURIComponent(row.source.code)}/qr`}
                alt={row.source.code}
                className="mt-[2mm] h-[47mm] w-[47mm] bg-white"
              />

              <p className="mt-[2mm] rounded-full bg-[color:var(--paper)] px-[4mm] py-[1.5mm] text-[9px] font-semibold text-[color:var(--muted)]">
                {row.source.label}{row.source.tableNumber ? ` · ${row.source.tableNumber}` : ""}
              </p>
              <p className="mt-auto pt-[4mm] text-[9px] text-[color:var(--muted)]">{t.footer}</p>
              <p className="mt-1 text-[8px] font-semibold text-[color:var(--honey)]">guestcam.si</p>
            </div>
          </section>
        </div>

        <style>{`@media print { @page { size: A6 portrait; margin: 0; } body { margin: 0 !important; background: #fff !important; } .local-reward-print-card { width: 105mm !important; height: 148mm !important; min-height: 148mm !important; page-break-after: always; } }`}</style>
      </main>
    </div>
  );
}
