import type { Metadata } from "next";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { localQrSources, localRewardCampaigns } from "@/lib/db/local-rewards-schema";
import { isCampaignLive } from "@/lib/local-rewards/core";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guestcam Local Rewards",
  robots: { index: false, follow: false },
};

type LocalLang = "sl" | "hr" | "sr" | "en" | "de" | "es";

const COPY: Record<LocalLang, {
  upload: string;
  helper: string;
  reward: string;
  unlock: string;
  noApp: string;
  terms: string;
  unavailable: string;
  unavailableDesc: string;
  socialBonus: string;
}> = {
  sl: { upload: "Naloži fotografijo", helper: "Deli trenutek iz lokala in odkleni svojo nagrado.", reward: "Tvoja nagrada", unlock: "Naloži in odkleni nagrado →", noApp: "Brez aplikacije · brez registracije", terms: "Pogoji", unavailable: "Kampanja trenutno ni aktivna", unavailableDesc: "Vprašajte osebje za aktualno Guestcam ponudbo.", socialBonus: "Dodaten izziv" },
  hr: { upload: "Učitaj fotografiju", helper: "Podijeli trenutak iz lokala i otključaj svoju nagradu.", reward: "Tvoja nagrada", unlock: "Učitaj i otključaj nagradu →", noApp: "Bez aplikacije · bez registracije", terms: "Uvjeti", unavailable: "Kampanja trenutno nije aktivna", unavailableDesc: "Pitajte osoblje za aktualnu Guestcam ponudu.", socialBonus: "Dodatni izazov" },
  sr: { upload: "Otpremi fotografiju", helper: "Podeli trenutak iz lokala i otključaj svoju nagradu.", reward: "Tvoja nagrada", unlock: "Otpremi i otključaj nagradu →", noApp: "Bez aplikacije · bez registracije", terms: "Uslovi", unavailable: "Kampanja trenutno nije aktivna", unavailableDesc: "Pitajte osoblje za aktuelnu Guestcam ponudu.", socialBonus: "Dodatni izazov" },
  en: { upload: "Upload a photo", helper: "Share a moment from the venue and unlock your reward.", reward: "Your reward", unlock: "Upload & unlock reward →", noApp: "No app · no registration", terms: "Terms", unavailable: "This campaign is not active right now", unavailableDesc: "Ask the staff for the current Guestcam offer.", socialBonus: "Extra challenge" },
  de: { upload: "Foto hochladen", helper: "Teile einen Moment aus dem Lokal und sichere dir deine Belohnung.", reward: "Deine Belohnung", unlock: "Hochladen & Belohnung sichern →", noApp: "Keine App · keine Registrierung", terms: "Bedingungen", unavailable: "Diese Kampagne ist derzeit nicht aktiv", unavailableDesc: "Frag das Personal nach dem aktuellen Guestcam-Angebot.", socialBonus: "Extra-Challenge" },
  es: { upload: "Subir una foto", helper: "Comparte un momento del local y desbloquea tu recompensa.", reward: "Tu recompensa", unlock: "Sube y desbloquea la recompensa →", noApp: "Sin app · sin registro", terms: "Condiciones", unavailable: "Esta campaña no está activa ahora", unavailableDesc: "Pregunta al personal por la oferta actual de Guestcam.", socialBonus: "Reto extra" },
};

export default async function LocalRewardLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    const rows = await db
      .select({ source: localQrSources, campaign: localRewardCampaigns, album: albums })
      .from(localQrSources)
      .innerJoin(localRewardCampaigns, eq(localQrSources.campaignId, localRewardCampaigns.id))
      .innerJoin(albums, eq(localRewardCampaigns.albumId, albums.id))
      .where(eq(localQrSources.code, code.toUpperCase()))
      .limit(1);

    const row = rows[0];
    if (!row) return <Unavailable />;

    const lang = (COPY[row.album.defaultLang as LocalLang] ? row.album.defaultLang : "en") as LocalLang;
    const t = COPY[lang];
    const campaignLive = row.source.isActive && isCampaignLive(row.campaign);

    if (!campaignLive) return <Unavailable lang={lang} />;

    // Best-effort analytics. A refresh counts as another scan; later we can add
    // a short session cookie if we want unique-scan reporting.
    await db
      .update(localQrSources)
      .set({
        scanCount: sql`${localQrSources.scanCount} + 1`,
        lastScannedAt: new Date(),
      })
      .where(eq(localQrSources.id, row.source.id))
      .catch(() => {});

    return (
      <main className="min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
        <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:py-10">
          <div className="flex items-center justify-between px-1">
            <Link href="/" className="font-serif italic text-xl font-semibold">Guestcam<span className="text-[color:var(--honey)]">.</span></Link>
            <span className="rounded-full border border-[color:var(--hairline)] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[color:var(--muted)]">Local Rewards</span>
          </div>

          <section className="mt-6 overflow-hidden rounded-[30px] border border-[color:var(--hairline)] bg-white shadow-sm">
            <div className="bg-[color:var(--ink)] px-6 py-8 text-center text-white">
              <p className="text-xs font-medium text-white/60">{row.campaign.venueName}{row.source.label ? ` · ${row.source.label}` : ""}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{row.campaign.headline || `📸 ${t.upload}`}</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/70">{t.helper}</p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl bg-[#FFF3CC] px-5 py-5 text-center text-[#68470F]">
                <p className="text-[10px] font-bold uppercase tracking-[0.17em]">{t.reward}</p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">{row.campaign.rewardTitle}</h2>
                {row.campaign.rewardDescription && <p className="mt-2 text-sm leading-5 opacity-75">{row.campaign.rewardDescription}</p>}
              </div>

              <div className="mt-5 rounded-2xl border-2 border-dashed border-[#D8C79F] bg-[color:var(--paper)] p-5 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-3xl shadow-sm">📷</div>
                <p className="mt-3 text-lg font-semibold">{t.upload}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{t.noApp}</p>
              </div>

              <Link
                href={`/${row.album.slug}?local=${encodeURIComponent(row.source.code)}`}
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[color:var(--honey)] px-5 py-4 text-base font-semibold text-white shadow-sm hover:brightness-95"
              >
                {t.unlock}
              </Link>

              {row.campaign.socialBonusEnabled && row.campaign.socialBonusText && (
                <div className="mt-4 rounded-xl border border-[color:var(--hairline)] bg-white p-4 text-sm leading-6 text-[color:var(--muted)]">
                  📱 <strong className="text-[color:var(--ink)]">{t.socialBonus}:</strong> {row.campaign.socialBonusText}
                </div>
              )}

              {row.campaign.rewardTerms && (
                <details className="mt-4 rounded-xl border border-[color:var(--hairline)] bg-white px-4 py-3">
                  <summary className="cursor-pointer text-xs font-semibold">{t.terms}</summary>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{row.campaign.rewardTerms}</p>
                </details>
              )}
            </div>
          </section>

          <p className="mt-5 text-center text-[11px] text-[color:var(--muted)]">Powered by Guestcam · QR photo sharing & rewards</p>
        </div>
      </main>
    );
  } catch (error) {
    console.error("[local/landing]", error);
    return <Unavailable />;
  }
}

function Unavailable({ lang = "en" }: { lang?: LocalLang }) {
  const t = COPY[lang];
  return (
    <main className="min-h-screen bg-[color:var(--paper)] px-4 grid place-items-center text-[color:var(--ink)]">
      <div className="w-full max-w-md rounded-3xl border border-[color:var(--hairline)] bg-white p-8 text-center shadow-sm">
        <div className="text-4xl">☕</div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t.unavailable}</h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.unavailableDesc}</p>
      </div>
    </main>
  );
}
