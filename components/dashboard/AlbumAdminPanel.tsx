Warning: truncated output (original token count: 31289)
Total output lines: 2643

"use client";
import { WeddingSettingsCard } from "@/components/wedding/WeddingSettingsCard";
import { weddingCopy } from "@/lib/wedding/copy";
import { PREMIUM_SALE_PRICE_EUR } from "@/lib/plan-pricing";

import { SITE_URL } from "@/lib/urls";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import type { Album, Photo, Moment } from "@/lib/db/schema";
import { translations } from "@/lib/i18n/translations";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";
import { ZipDownloader } from "@/components/dashboard/ZipDownloader";
import { CoverPhotoSettings } from "@/components/dashboard/CoverPhotoSettings";
import { FilmStudio } from "@/components/dashboard/FilmStudio";
import { PhotoWallCard } from "@/components/dashboard/PhotoWallCard";
import { STAND_VARIANTS, eur } from "@/lib/print-service";
import type { AlbumFlags } from "@/lib/album-flags";
import type { AlbumHeaderSettings } from "@/lib/album-header-settings";
import { EventModerationCard } from "@/components/dashboard/EventModerationCard";
import { WallCollaboratorsCard } from "@/components/dashboard/WallCollaboratorsCard";
import { EventAppearanceCard } from "@/components/dashboard/EventAppearanceCard";
import { EventLeadsCard } from "@/components/dashboard/EventLeadsCard";
import { ModerationEnabledNotice } from "@/components/dashboard/ModerationEnabledNotice";
import { ALBUM_THEMES, themesForEvent } from "@/lib/album-themes";
import { fbEvent } from "@/lib/fbpixel";
import { DashboardLanguageSwitcher } from "@/components/dashboard/DashboardLanguageSwitcher";
import {
  ALBUM_ADMIN_COPY,
  DASHBOARD_COPY,
  type DashboardLang,
} from "@/lib/i18n/dashboard-language";
import { ADMIN_SETTINGS_COPY } from "@/lib/i18n/admin-settings-copy";

/**
 * List price of each paid plan in EUR. Used to fire the Meta Pixel
 * Purchase event with a real `value` — the customer-facing price on
 * /pricing is the source of truth. Mollie discount codes / affiliate
 * codes can reduce the amount charged, but for the Pixel we report the
 * headline plan price so ad ROAS comparisons match campaign expectations.
 */
const PLAN_PRICES_EUR: Record<"basic" | "plus" | "premium" | "business", number> = {
  basic:   39,
  plus:    49,
  premium: PREMIUM_SALE_PRICE_EUR,
  business: 149,
};

const DASHBOARD_DATE_LOCALE: Record<DashboardLang, string> = {
  sl: "sl-SI", hr: "hr-HR", sr: "sr-Latn-RS", en: "en-GB", de: "de-DE", es: "es-ES",
};

const CLOSE_LABEL: Record<DashboardLang, string> = {
  sl: "Zapri", hr: "Zatvori", sr: "Zatvori", en: "Close", de: "Schließen", es: "Cerrar",
};

const PRINT_PRICE_COPY: Record<DashboardLang, { from: string; each: string }> = {
  sl: { from: "že od", each: "na kos, samo ob nakupu paketa" },
  hr: { from: "već od", each: "po komadu, samo uz kupnju paketa" },
  sr: { from: "već od", each: "po komadu, samo uz kupovinu paketa" },
  en: { from: "from", each: "each with a plan purchase" },
  de: { from: "ab", each: "pro Stück, nur beim Kauf eines Tarifs" },
  es: { from: "desde", each: "por unidad, solo al comprar un plan" },
};

const THEME_NAME_COPY: Record<DashboardLang, Record<string, string>> = {
  sl: { navy: "Polnočno modra", champagne: "Šampanjec", rose: "Pudrasto roza", sage: "Žajbelj", charcoal: "Oglje", plum: "Sliva", terracotta: "Terakota", ocean: "Ocean", burgundy: "Bordo", emerald: "Smaragd", babyblue: "Baby modra", babypink: "Baby roza", sunshine: "Sonček", lavender: "Sivka", slate: "Poslovna" },
  hr: { navy: "Ponoćno plava", champagne: "Šampanjac", rose: "Puderasto ružičasta", sage: "Kadulja", charcoal: "Ugljen", plum: "Šljiva", terracotta: "Terakota", ocean: "Ocean", burgundy: "Bordo", emerald: "Smaragdna", babyblue: "Baby plava", babypink: "Baby ružičasta", sunshine: "Sunce", lavender: "Lavanda", slate: "Poslovna" },
  sr: { navy: "Ponoćno plava", champagne: "Šampanjac", rose: "Puderasto roze", sage: "Žalfija", charcoal: "Ugalj", plum: "Šljiva", terracotta: "Terakota", ocean: "Okean", burgundy: "Bordo", emerald: "Smaragdna", babyblue: "Baby plava", babypink: "Baby roze", sunshine: "Sunce", lavender: "Lavanda", slate: "Poslovna" },
  en: { navy: "Midnight blue", champagne: "Champagne", rose: "Dusty rose", sage: "Sage", charcoal: "Charcoal", plum: "Plum", terracotta: "Terracotta", ocean: "Ocean", burgundy: "Burgundy", emerald: "Emerald", babyblue: "Baby blue", babypink: "Baby pink", sunshine: "Sunshine", lavender: "Lavender", slate: "Business" },
  de: { navy: "Mitternachtsblau", champagne: "Champagner", rose: "Altrosa", sage: "Salbei", charcoal: "Anthrazit", plum: "Pflaume", terracotta: "Terrakotta", ocean: "Ozean", burgundy: "Bordeaux", emerald: "Smaragd", babyblue: "Babyblau", babypink: "Rosé", sunshine: "Sonnenschein", lavender: "Lavendel", slate: "Business" },
  es: { navy: "Azul noche", champagne: "Champán", rose: "Rosa empolvado", sage: "Salvia", charcoal: "Carbón", plum: "Ciruela", terracotta: "Terracota", ocean: "Océano", burgundy: "Burdeos", emerald: "Esmeralda", babyblue: "Azul bebé", babypink: "Rosa bebé", sunshine: "Sol", lavender: "Lavanda", slate: "Negocios" },
};

type Tab = "wedding" | "overview" | "gallery" | "qr" | "events" | "settings" | "pending" | "film";

interface Props {
  album: Album;
  lang: DashboardLang;
  photos: Photo[];
  pendingCount: number;
  guestCount: number;
  activeTab: Tab;
  isNew?: boolean;
  isUpgraded?: boolean;
  /** Exact amount charged (EUR, incl. discount codes) forwarded by the
   *  Mollie return redirect. Used only for the Meta Pixel Purchase
   *  value; falls back to the headline plan price when absent (e.g.
   *  webhook-reconciled upgrades that skip the return redirect). */
  paidAmount?: number;
  /** When the owner came from a homepage pricing card, this is the plan
   *  they picked. The onboarding success screen finishes by routing them
   *  straight into Paddle checkout for that plan. */
  paidPlan?: "basic" | "plus" | "premium" | "business";
  /** Logged-in user's primary email — shown in the Settings tab so the
   *  owner can confirm which account this album is attached to. */
  ownerEmail?: string | null;
  /** True when a platform admin is opening someone else's album from
   *  /admin/albums. Renders a persistent banner so the admin can never
   *  forget they're viewing a customer's gallery and any destructive
   *  action they take applies to that customer's data. */
  viewingAsAdmin?: boolean;
  /** Result of a just-completed Google Drive export, forwarded by
   *  /api/google-drive/callback's redirect (?drive=ok|partial|denied|
   *  empty|notconfigured|error). Undefined outside that redirect. */
  driveResult?: string;
  /** Number of files uploaded, forwarded alongside driveResult="ok"|"partial". */
  driveCount?: string;
  /** Whether the album currently has a password set. Computed server-side
   *  from the raw (unstripped) row — `album.password` itself never reaches
   *  this client component (see lib/album-view.ts → toOwnerAlbum), so this
   *  boolean is the only password-related signal the dashboard gets. */
  hasPassword?: boolean;
  /** Photo Wall access token (see lib/wall-token.ts) — a secret separate
   *  from `album.slug`, guaranteed non-null by getOrCreateWallToken() on
   *  the server before this prop is ever passed down. */
  wallToken: string;
  /** Events/business package: guests must leave name/surname/email. */
  guestDataCapture?: boolean;
  /** Event flags (moderation & permissions), read once server-side. */
  flags?: AlbumFlags;
  /** Controls which event details guests see in the public gallery header. */
  headerSettings: AlbumHeaderSettings;
  qrTargetUrl: string;
}

/** Copy + tone for the one-time Google Drive result banner. */
function driveBannerCopy(result: string, count: string | undefined, lang: DashboardLang): { tone: "success" | "warning" | "neutral" | "error"; text: string } {
  const suffix = count ? ` (${count})` : "";
  const messages = {
    sl: { ok: `Galerija je shranjena v Google Drive${suffix}.`, partial: `Del galerije je shranjen v Google Drive${suffix}; nekaj datotek ni bilo mogoče prenesti. Poskusite znova.`, denied: "Shranjevanje v Google Drive je bilo preklicano.", empty: "Galerija še nima objavljenih fotografij za shranjevanje v Google Drive.", notconfigured: "Shranjevanje v Google Drive trenutno ni na voljo. Kontaktirajte info@guestcam.si.", error: "Pri shranjevanju v Google Drive je prišlo do napake. Poskusite znova ali kontaktirajte info@guestcam.si." },
    hr: { ok: `Galerija je spremljena na Google Drive${suffix}.`, partial: `Dio galerije spremljen je na Google Drive${suffix}; neke datoteke nije bilo moguće prenijeti. Pokušajte ponovno.`, denied: "Spremanje na Google Drive je otkazano.", empty: "Galerija još nema objavljenih fotografija za spremanje.", notconfigured: "Izvoz na Google Drive trenutačno nije dostupan. Kontaktirajte info@guestcam.si.", error: "Došlo je do pogreške pri spremanju na Google Drive. Pokušajte ponovno ili kontaktirajte info@guestcam.si." },
    sr: { ok: `Galerija je sačuvana na Google Drive${suffix}.`, partial: `Deo galerije je sačuvan na Google Drive${suffix}; neke datoteke nije bilo moguće preneti. Pokušajte ponovo.`, denied: "Čuvanje na Google Drive je otkazano.", empty: "Galerija još nema objavljenih fotografija za čuvanje.", notconfigured: "Izvoz na Google Drive trenutno nije dostupan. Kontaktirajte info@guestcam.si.", error: "Došlo je do greške pri čuvanju na Google Drive. Pokušajte ponovo ili kontaktirajte info@guestcam.si." },
    en: { ok: `Gallery saved to Google Drive${suffix}.`, partial: `Part of the gallery was saved to Google Drive${suffix}; some files could not be transferred. Please try again.`, denied: "Saving to Google Drive was cancelled.", empty: "The gallery has no published photos to save yet.", notconfigured: "Google Drive export is currently unavailable. Contact info@guestcam.si.", error: "An error occurred while saving to Google Drive. Try again or contact info@guestcam.si." },
    de: { ok: `Galerie in Google Drive gespeichert${suffix}.`, partial: `Ein Teil der Galerie wurde in Google Drive gespeichert${suffix}; einige Dateien konnten nicht übertragen werden. Bitte erneut versuchen.`, denied: "Das Speichern in Google Drive wurde abgebrochen.", empty: "Die Galerie enthält noch keine veröffentlichten Fotos zum Speichern.", notconfigured: "Der Google-Drive-Export ist derzeit nicht verfügbar. Kontaktieren Sie info@guestcam.si.", error: "Beim Speichern in Google Drive ist ein Fehler aufgetreten. Versuchen Sie es erneut oder kontaktieren Sie info@guestcam.si." },
    es: { ok: `Galería guardada en Google Drive${suffix}.`, partial: `Parte de la galería se guardó en Google Drive${suffix}; algunos archivos no se pudieron transferir. Inténtalo de nuevo.`, denied: "Se canceló el guardado en Google Drive.", empty: "La galería aún no tiene fotos publicadas para guardar.", notconfigured: "La exportación a Google Drive no está disponible en este momento. Contacta con info@guestcam.si.", error: "Se produjo un error al guardar en Google Drive. Inténtalo de nuevo o contacta con info@guestcam.si." },
  }[lang];
  if (result === "ok") return { tone: "success", text: messages.ok };
  if (result === "partial") return { tone: "warning", text: messages.partial };
  if (result === "denied" || result === "empty") return { tone: "neutral", text: messages[result] };
  return { tone: "error", text: result === "notconfigured" ? messages.notconfigured : messages.error };
}

const DRIVE_BANNER_STYLES: Record<"success" | "warning" | "neutral" | "error", { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", icon: "✅" },
  warning: { bg: "#FFF9EC", border: "#FFC94D", text: "#92600A", icon: "⚠️" },
  neutral: { bg: "#F9FAFB", border: "#E5E7EB", text: "#4B5563", icon: "ℹ️" },
  error:   { bg: "#FEF2F2", border: "#FCA5A5", text: "#B91C1C", icon: "⚠️" },
};

// ─── Success Screen ───────────────────────────────────────────────────────────

function NewAlbumSuccess({ album, paidPlan, lang }: { album: Album; paidPlan?: "basic" | "plus" | "premium" | "business"; lang: DashboardLang }) {
  const copy = ALBUM_ADMIN_COPY[lang].success;
  const dashboardCopy = DASHBOARD_COPY[lang];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;
  const albumUrl = `${appUrl}/${album.slug}`;
  // Always route to the dashboard — the upgrade page is a separate flow.
  const dashboardUrl = `/dashboard/${album.slug}`;
  const qrPreview =
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&qzone=2&format=png` +
    `&bgcolor=ffffff&color=0F1729&data=${encodeURIComponent(albumUrl)}`;

  // 3-step onboarding wizard: success → QR code → print templates → dashboard.
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Meta Pixel CompleteRegistration event ────────────────────────────
  // Landing on this success screen IS the "gallery created" moment. The
  // ?new=1 query param is only set by app/actions/create-album.ts on the
  // post-insert redirect, so this component mounts exactly once per new
  // gallery. Dedup by album.id in sessionStorage in case the owner
  // refreshes the wizard before advancing — one CompleteRegistration per
  // album, not per render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dedupKey = `fbq_register_${album.id}`;
    try {
      if (sessionStorage.getItem(dedupKey)) return;
      fbEvent("CompleteRegistration", {
        content_name: paidPlan
          ? paidPlan.charAt(0).toUpperCase() + paidPlan.slice(1)
          : "Free",
        status: "completed",
      });
      sessionStorage.setItem(dedupKey, "1");
    } catch {
      // sessionStorage unavailable — best effort.
    }
  }, [album.id, paidPlan]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f5f5f7" }}>
      <div className="fixed right-4 top-4 z-20">
        <DashboardLanguageSwitcher current={lang} ariaLabel={dashboardCopy.language} />
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 max-w-md w-full">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex-1 h-1.5 rounded-full transition-colors"
              style={{ background: n <= step ? "#FFC94D" : "#E5E7EB" }}
            />
          ))}
        </div>
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-5">
          {copy.step} {step} {copy.of} 3
        </p>

        {/* ── Step 1 — Album created ─────────────────────────────────── */}
        {step === 1 && (
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="gc-admin-page-title text-gray-900 mb-2">
              {copy.created}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              <strong className="text-gray-800">{album.coupleName}</strong> {copy.ready}
            </p>
            <button
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90"
              style={{ background: "#FFC94D" }}
            >
              {copy.next}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Step 2 — Your QR code ──────────────────────────────────── */}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{copy.qrTitle}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              {copy.qrBody}
            </p>
            <div className="inline-flex items-center justify-center p-4 rounded-2xl border-2 mx-auto mb-5"
              style={{ borderColor: "rgba(255,201,77,0.25)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrPreview} alt={copy.qrTitle} width={208} height={208} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link
                href={`/dashboard/${album.slug}/print`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {copy.templates}
              </Link>
              <a
                href={`/api/albums/${album.slug}/qr?format=png&design=1`}
                download={`qr-${album.slug}.png`}
                className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-white rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "#FFC94D" }}
              >
                {copy.downloadQr}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copy.back}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: "#FFC94D" }}
              >
                {copy.next}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Print template ────────────────────────────────── */}
        {step === 3 && (
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFF9EC] mx-auto mb-4">
              <svg className="w-8 h-8 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{copy.printTitle}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              {copy.printBody}
            </p>
            <Link
              href={`/dashboard/${album.slug}/print`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-bold text-base mb-3 transition-opacity hover:opacity-90"
              style={{ background: "#FFC94D" }}
            >
              {copy.openTemplates}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href={dashboardUrl}
              className="block text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
            >
              {copy.skip}
            </Link>

            {/* Bottom row — back on the left, primary dashboard CTA on the right.
                Replaces the centred single 'back' button so new owners always
                see a clear exit into the admin instead of having to use the
                browser back arrow or click 'Preskoči'. */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                {copy.backQr}
              </button>
              <Link
                href={dashboardUrl}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold border-2 border-[#0F1729] text-[#0F1729] hover:bg-[#0F1729] hover:text-white transition-colors"
              >
                {copy.dashboard}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function AlbumAdminPanel({ album, lang, photos, pendingCount, guestCount, activeTab, isNew, isUpgraded, paidAmount, paidPlan, ownerEmail, viewingAsAdmin, driveResult, driveCount, hasPassword, wallToken, guestDataCapture = false, flags, headerSettings, qrTargetUrl }: Props) {
  const copy = ALBUM_ADMIN_COPY[lang];
  const dashboardCopy = DASHBOARD_COPY[lang];
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;
  const albumUrl = `${appUrl}/${album.slug}`;
  // Mobile sidebar drawer — hidden by default on small screens.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // ── Google Drive export result banner ───────────────────────────────
  // driveResult arrives once, via the redirect from /api/google-drive/
  // callback. Show it, then strip ?drive=&n= from the URL so a page
  // refresh doesn't keep re-showing it.
  const [driveBanner, setDriveBanner] = useState(driveResult);
  useEffect(() => {
    if (!driveResult) return;
    router.replace(`/dashboard/${album.slug}?tab=${activeTab}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(albumUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // ── Meta Pixel Purchase event ─────────────────────────────────────────
  // Fire once when the Mollie return handler bounces the owner back here
  // with ?upgraded=1 AND the DB confirms the plan actually flipped off
  // free (i.e. the payment reconciled server-side — we don't want to fire
  // Purchase on a stale query param). Dedup via sessionStorage per album
  // so a refresh doesn't double-count.
  useEffect(() => {
    if (!isUpgraded) return;
    if (album.plan === "free") return;
    const dedupKey = `fbq_purchase_${album.id}_${album.stripeSessionId ?? ""}`;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(dedupKey)) return;
      const planKey = (album.plan as keyof typeof PLAN_PRICES_EUR);
      // Exact charged amount from the Mollie return redirect wins —
      // it includes discount codes. Headline price is the fallback.
      const value = paidAmount ?? PLAN_PRICES_EUR[planKey] ?? 0;
      if (value > 0) {
        fbEvent(
          "Purchase",
          {
            value,
            currency: "EUR",
            content_name: album.plan.charAt(0).toUpperCase() + album.plan.slice(1),
            content_type: "product",
            content_ids: [album.plan],
          },
          // Dedup id matching the server-side CAPI event_id.
          album.stripeSessionId ?? undefined,
        );
      }
      sessionStorage.setItem(dedupKey, "1");
    } catch {
      // sessionStorage unavailable (private mode, etc.) — best effort.
    }
  }, [isUpgraded, album.plan, album.id, album.stripeSessionId, paidAmount]);

  // Show success screen if just created
  if (isNew) {
    return <NewAlbumSuccess album={album} paidPlan={paidPlan} lang={lang} />;
  }

  const navigateTab = (tab: Tab) => {
    setSidebarOpen(false);
    router.push(`/dashboard/${album.slug}?tab=${tab}`);
  };

  const approvePhoto = async (photoId: string) => {
    await fetch(`/api/albums/${album.slug}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "approve" }),
    });
    router.refresh();
  };

  const rejectPhoto = async (photoId: string) => {
    await fetch(`/api/albums/${album.slug}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "reject" }),
    });
    router.refresh();
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm(copy.deleteConfirm)) return;
    await fetch(`/api/albums/${album.slug}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "delete" }),
    });
    router.refresh();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const setCoverPhoto = async (photoId: string) => {
    await fetch(`/api/albums/${album.slug}/cover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });
    router.refresh();
  };

  const planLabel =
    album.plan === "business" ? "Poslovni" :
    album.plan === "premium" ? weddingCopy(lang).plan :
    album.plan === "plus"    ? "Plus"    :
    album.plan === "basic"   ? "Basic"   :
    copy.freePlan;

  const planBadgeClass =
    album.plan === "premium" || album.plan === "business"
      ? "bg-rose-500 text-white"
      : album.plan === "plus"
      ? "bg-gray-900 text-white"
      : album.plan === "basic"
      ? "bg-[#FFC94D] text-white"
      : "bg-gray-100 text-gray-600";

  // Last uploaded photo date
  const lastPhoto = photos[0];
  const lastUploadDate = lastPhoto
    ? new Date(lastPhoto.uploadedAt).toLocaleDateString(DASHBOARD_DATE_LOCALE[lang], { day: "numeric", month: "short", year: "numeric" })
    : "-";

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview",  label: copy.tabs.overview, icon: "🕐" },
    { id: "gallery",   label: copy.tabs.gallery, icon: "🖼" },
    { id: "film",      label: copy.tabs.film, icon: "🎬" },
    { id: "qr",        label: copy.tabs.qr, icon: "📱" },
    { id: "wedding", label: weddingCopy(lang).nav, icon: "♡" },
    { id: "events",    label: copy.tabs.events, icon: "🎪" },
    { id: "settings",  label: copy.tabs.settings, icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#f9fafb" }}>
      {/* Admin impersonation banner — sticky strip at the very top so it
         survives scroll. Only renders when an allowlisted platform admin
         opens another user's album via /admin/albums. */}
      {viewingAsAdmin && (
        <div
          className="fixed top-0 inset-x-0 z-[60] flex items-center justify-between gap-3 px-4 py-2 text-sm font-semibold text-white shadow-md"
          style={{ background: "#0F1729" }}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base leading-none">🛡️</span>
            <span className="truncate">
              {copy.adminView}{ownerEmail ? `: ${ownerEmail}` : ""}
            </span>
          </div>
          <Link
            href="/admin/albums"
            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[#FFC94D] text-[#0F1729] px-2.5 py-1 text-xs font-bold hover:opacity-90"
          >
            {copy.backAdmin}
          </Link>
        </div>
      )}
      {viewingAsAdmin && <div aria-hidden="true" style={{ height: 36 }} />}

      {/* Backdrop — covers the page while the mobile drawer is open. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      {/* On mobile the sidebar is a fixed drawer toggled by the hamburger;
         on lg+ it sits in the flex flow as a sticky column. */}
      <aside
        className={`fixed lg:sticky inset-y-0 left-0 top-0 z-50 w-[220px] h-screen flex flex-col bg-white border-r border-gray-200 overflow-y-auto transform transition-transform duration-200 lg:translate-x-0 lg:flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo — links back to the gallery list */}
        <div className="px-5 py-5">
          <Link href="/dashboard">
            <GuestcamLogo size="sm" showMark={true} />
          </Link>
        </div>

        {/* Back to all galleries */}
        <div className="px-4 pb-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {copy.allGalleries}
          </Link>
        </div>

        {/* Gallery info */}
        <div className="px-5 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{copy.yourGallery}</p>
          <p className="font-bold text-sm text-gray-900 leading-tight truncate">{album.coupleName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{album.weddingDate}</p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${planBadgeClass}`}>
            {planLabel}
          </span>
        </div>

        {/* New gallery button */}
        <div className="px-4 pb-4">
          <Link
    …15289 tokens truncated…   </div>
  );
}

// Tiny card at the top of Settings showing the owner's Clerk email +
// a sign-out shortcut. Users have asked for an easy way to confirm
// which account a given album is on.
function AccountInfoCard({ ownerEmail, lang }: { ownerEmail: string | null; lang: DashboardLang }) {
  const copy = ADMIN_SETTINGS_COPY[lang];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{copy.account}</p>
          <p className="text-sm font-semibold text-[#0F1729] truncate">{ownerEmail ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{copy.accountHelp}</p>
        </div>
        <SignOutButton>
          <button className="flex-shrink-0 px-3 py-2 text-xs font-semibold text-[#0F1729] border border-gray-200 rounded-lg hover:bg-[#FFF9EC] hover:border-[#FFC94D] transition-colors">
            {lang === "sl" ? "Odjava" : lang === "de" ? "Abmelden" : lang === "es" ? "Cerrar sesión" : lang === "hr" ? "Odjava" : lang === "sr" ? "Одјава" : "Sign out"}
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}

function SettingsToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#FFC94D]" : "bg-gray-200"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

function AlbumSettingsForm({ album, children, wallToken, hasPassword, headerSettings, lang }: { album: Album; children?: React.ReactNode; wallToken: string; hasPassword: boolean; headerSettings: AlbumHeaderSettings; lang: DashboardLang }) {
  const copy = ADMIN_SETTINGS_COPY[lang];
  const wallAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL;
  const wallUrl = `${wallAppUrl}/wall/${wallToken}`;
  const router = useRouter();
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const [autoSaveRetry, setAutoSaveRetry] = useState(0);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaveStatus, setPasswordSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const [coupleName, setCoupleName]           = useState(album.coupleName);
  const [weddingDate, setWeddingDate]         = useState(album.weddingDate);
  const [eventTime, setEventTime]             = useState(headerSettings.eventTime ?? "");
  const [location, setLocation]               = useState(album.location ?? "");
  const [notifyEmail, setNotifyEmail]         = useState(album.notifyEmail ?? "");
  const [moderationEnabled, setModerationEnabled] = useState(album.moderationEnabled);
  const [isPublished, setIsPublished]         = useState(album.isPublished);
  const [eventType, setEventType]             = useState(album.eventType ?? "wedding");
  const [defaultLang, setDefaultLang]         = useState(album.defaultLang ?? "sl");
  const [theme, setTheme]                     = useState(album.theme ?? "navy");
  const [showTitle, setShowTitle]              = useState(headerSettings.showTitle);
  const [showEventType, setShowEventType]      = useState(headerSettings.showEventType);
  const [showEventDate, setShowEventDate]      = useState(headerSettings.showEventDate);

  const lastQueuedSnapshot = useRef(JSON.stringify({
    coupleName: album.coupleName,
    weddingDate: album.weddingDate,
    eventTime: headerSettings.eventTime ?? "",
    location: album.location ?? "",
    notifyEmail: album.notifyEmail ?? "",
    moderationEnabled: album.moderationEnabled,
    isPublished: album.isPublished,
    eventType: album.eventType ?? "wedding",
    defaultLang: album.defaultLang ?? "sl",
    theme: album.theme ?? "navy",
    showTitle: headerSettings.showTitle,
    showEventType: headerSettings.showEventType,
    showEventDate: headerSettings.showEventDate,
  }));
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const latestRevision = useRef(0);
  const saveNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateSetting = <T,>(setter: (value: T) => void, value: T) => {
    if (saveNoticeTimer.current) clearTimeout(saveNoticeTimer.current);
    setAutoSaveStatus("pending");
    setter(value);
  };

  useEffect(() => () => {
    if (saveNoticeTimer.current) clearTimeout(saveNoticeTimer.current);
  }, []);

  useEffect(() => {
    const body = {
      coupleName,
      weddingDate,
      eventTime,
      location,
      notifyEmail,
      moderationEnabled,
      isPublished,
      eventType,
      defaultLang,
      theme,
      showTitle,
      showEventType,
      showEventDate,
    };
    const snapshot = JSON.stringify(body);
    if (snapshot === lastQueuedSnapshot.current) return;

    lastQueuedSnapshot.current = snapshot;
    const revision = ++latestRevision.current;
    const timeoutId = window.setTimeout(() => {
      setAutoSaveStatus("saving");
      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          const response = await fetch(`/api/albums/${album.slug}/settings`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!response.ok) throw new Error("Settings save failed");
          if (latestRevision.current === revision) {
            setAutoSaveStatus("saved");
            if (saveNoticeTimer.current) clearTimeout(saveNoticeTimer.current);
            saveNoticeTimer.current = setTimeout(() => setAutoSaveStatus("idle"), 2500);
          }
        })
        .catch(() => {
          if (latestRevision.current === revision) {
            lastQueuedSnapshot.current = "";
            setAutoSaveStatus("error");
          }
        });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [album.slug, autoSaveRetry, coupleName, defaultLang, eventTime, eventType, isPublished, location, moderationEnabled, notifyEmail, showEventDate, showEventType, showTitle, theme, weddingDate]);

  // NOTE: the password hash itself is deliberately NOT sent to this client
  // component (see lib/album-view.ts → toOwnerAlbum) — only the boolean
  // `hasPassword` prop, computed server-side. This form is write-only for
  // the password: `passwordDraft` holds a NEW plaintext value the owner is
  // typing (never the current one, which can't be recovered from its hash),
  // and `hasPasswordNow` tracks local state so the UI updates immediately
  // after a save without waiting on the router.refresh() round-trip.
  const [passwordDraft, setPasswordDraft]     = useState("");
  const [removePassword, setRemovePassword]   = useState(false);
  const [hasPasswordNow, setHasPasswordNow]   = useState(hasPassword);
  // Kept in memory only, just long enough to show a copyable Photo Wall
  // link with ?pw= filled in — the one moment the plaintext actually
  // exists anywhere, since the owner just typed it themselves.
  const [justSetPassword, setJustSetPassword] = useState<string | null>(null);

  const savePassword = async () => {
    const newPassword = passwordDraft.trim();
    if (!removePassword && !newPassword) return;

    setPasswordSaving(true);
    setPasswordSaveStatus("idle");
    const body: Record<string, unknown> = {};
    if (removePassword) {
      body.password = ""; // PATCH route treats empty string as "clear"
    } else if (newPassword) {
      body.password = newPassword;
    }

    try {
      const response = await fetch(`/api/albums/${album.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Password save failed");

      if (removePassword) {
        setHasPasswordNow(false);
        setRemovePassword(false);
        setJustSetPassword(null);
      } else {
        setHasPasswordNow(true);
        setJustSetPassword(newPassword);
        setPasswordDraft("");
      }
      setPasswordSaveStatus("saved");
      router.refresh();
    } catch {
      setPasswordSaveStatus("error");
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-[#FFC94D] transition-colors";
  const autoSaveLabel = autoSaveStatus === "pending" ? copy.autosave[0] : autoSaveStatus === "saving" ? copy.autosave[1] : autoSaveStatus === "saved" ? copy.autosave[2] : autoSaveStatus === "error" ? copy.autosave[3] : copy.autosave[4];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{copy.title}</h3>
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <span className={`text-xs font-medium ${
            autoSaveStatus === "error"
              ? "text-red-600"
              : autoSaveStatus === "saved"
                ? "text-green-600"
                : "text-gray-400"
          }`}>
            {autoSaveLabel}
          </span>
          {autoSaveStatus === "error" && (
            <button
              type="button"
              onClick={() => setAutoSaveRetry((value) => value + 1)}
              className="text-xs font-semibold text-[#C9820A] underline underline-offset-2"
            >
              {copy.retry}
            </button>
          )}
        </div>
      </div>

      {autoSaveStatus !== "idle" && (
        <div
          className={`fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-semibold shadow-lg ${
            autoSaveStatus === "error" ? "border-red-200 text-red-600" : "border-gray-200 text-gray-700"
          }`}
          role={autoSaveStatus === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <span>{autoSaveLabel}</span>
          {autoSaveStatus === "error" && (
            <button
              type="button"
              onClick={() => setAutoSaveRetry((value) => value + 1)}
              className="text-xs font-semibold underline underline-offset-2"
            >
              {copy.retry}
            </button>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{copy.galleryName}</label>
        <input value={coupleName} onChange={(e) => updateSetting(setCoupleName, e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{copy.date}</label>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => updateSetting(setWeddingDate, e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {copy.eventTime} <span className="font-normal text-gray-400">({copy.optional})</span>
          </label>
          <input
            type="time"
            step={300}
            value={eventTime}
            onChange={(e) => updateSetting(setEventTime, e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{copy.eventType}</label>
        <select
          value={eventType}
          onChange={(e) => updateSetting(setEventType, e.target.value)}
          className={inputClass}
        >
          {(["wedding", "birthday", "anniversary", "party", "baptism", "graduation", "baby_shower", "business", "other"] as const).map((id, index) => <option key={id} value={id}>{copy.eventTypes[index]}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{copy.galleryLanguage}</label>
        <p className="text-xs text-gray-400 mb-2">
          {copy.galleryLanguageHelp}
        </p>
        <select
          value={defaultLang}
          onChange={(e) => updateSetting(setDefaultLang, e.target.value)}
          className={inputClass}
        >
          <option value="sl">Slovenščina</option>
          <option value="hr">Hrvatski</option>
          <option value="sr">Srpski</option>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800">{copy.header}</h4>
        <p className="mb-3 mt-1 text-xs text-gray-400">
          {copy.headerHelp}
        </p>
        <div className="space-y-2">
          <SettingsToggle
            checked={showTitle}
            onChange={(value) => updateSetting(setShowTitle, value)}
            label={copy.titleLabel}
            description={copy.titleHelp}
          />
          <SettingsToggle
            checked={showEventType}
            onChange={(value) => updateSetting(setShowEventType, value)}
            label={copy.typeLabel}
            description={copy.typeHelp}
          />
          <SettingsToggle
            checked={showEventDate}
            onChange={(value) => updateSetting(setShowEventDate, value)}
            label={copy.dateLabel}
            description={copy.dateHelp}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{copy.location}</label>
        <input
          value={location}
          onChange={(e) => updateSetting(setLocation, e.target.value)}
          placeholder={lang === "sl" ? "Ljubljana" : lang === "de" ? "Berlin" : lang === "es" ? "Madrid" : "London"}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{copy.welcome}</label>
        <textarea
          value={notifyEmail}
          onChange={(e) => updateSetting(setNotifyEmail, e.target.value)}
          rows={3}
          placeholder={copy.welcomePlaceholder}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{copy.password}</label>
        <p className="text-xs text-gray-400 mb-2.5">
          {hasPasswordNow
            ? copy.protected
            : copy.unprotected}
        </p>
        {!removePassword && (
          <input
            type="password"
            value={passwordDraft}
            onChange={(e) => {
              setPasswordDraft(e.target.value);
              setPasswordSaveStatus("idle");
            }}
            placeholder={hasPasswordNow ? copy.newPassword : copy.setPassword}
            className={inputClass}
            autoComplete="new-password"
          />
        )}
        {hasPasswordNow && (
          <label className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={removePassword}
              onChange={(e) => {
                setRemovePassword(e.target.checked);
                setPasswordSaveStatus("idle");
                if (e.target.checked) setPasswordDraft("");
              }}
            />
            {copy.removePassword}
          </label>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {copy.passwordHint}
        </p>
        {justSetPassword && (
          <div className="mt-3 rounded-xl border p-3" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
            <p className="text-xs font-medium mb-1.5" style={{ color: "#15803d" }}>
              {copy.passwordSavedLink}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate bg-white/70 px-2 py-1 rounded text-[11px]" style={{ color: "#15803d" }}>
                {`${wallUrl}?pw=${justSetPassword}`}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${wallUrl}?pw=${encodeURIComponent(justSetPassword)}`)}
                className="shrink-0 px-2 py-1 text-[11px] rounded bg-white border hover:bg-green-50"
                style={{ borderColor: "#86efac", color: "#15803d" }}
              >
                {copy.copy}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slot for the cover-photo picker — passed in from AlbumAdminPanel.
          Sits between the metadata fields and the theme picker so it
          reads as one continuous "appearance" section in the form. */}
      {children}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{copy.theme}</label>
        <p className="text-xs text-gray-400 mb-2.5">{copy.themeHelp}</p>
        {(() => {
          const { recommended, others } = themesForEvent(eventType);
          const renderTheme = (tm: (typeof ALBUM_THEMES)[number]) => {
            const selected = theme === tm.id;
            return (
              <button
                key={tm.id}
                type="button"
                onClick={() => updateSetting(setTheme, tm.id)}
                aria-pressed={selected}
                title={THEME_NAME_COPY[lang][tm.id] ?? tm.name}
                className={`group flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all ${
                  selected
                    ? "ring-2 ring-[#FFC94D] ring-offset-1"
                    : "ring-1 ring-gray-200 hover:ring-gray-300"
                }`}
              >
                {/* Mini preview of how the public album page looks in this theme */}
                <span className="relative block w-full overflow-hidden rounded-lg border border-gray-200">
                  {/* Hero header */}
                  <span className="block px-2 pt-2.5 pb-2" style={{ background: tm.heroBg }}>
                    <span className="block h-[5px] w-3/5 mx-auto rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
                    <span className="block h-[3px] w-2/5 mx-auto mt-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                    <span className="block h-2 w-1/3 mx-auto mt-1.5 rounded-full" style={{ background: tm.accent }} />
                  </span>
                  {/* Photo grid */}
                  <span className="grid grid-cols-3 gap-[3px] bg-white p-[3px]">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="block aspect-square rounded-[2px] bg-gray-200" />
                    ))}
                  </span>
                  {selected && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FFC94D] text-[#0F1729] flex items-center justify-center shadow">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className={`text-[11px] text-center leading-tight ${selected ? "font-semibold text-[#C9820A]" : "text-gray-600"}`}>
                  {THEME_NAME_COPY[lang][tm.id] ?? tm.name}
                </span>
              </button>
            );
          };
          // Recommended-for-this-event group first, everything else below.
          // Follows the live `eventType` select above, so switching event
          // type instantly re-groups the themes.
          return recommended.length > 0 ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#C9820A] mb-2">
                ✨ {copy.recommendedThemes}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
                {recommended.map(renderTheme)}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                {copy.allThemes}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {others.map(renderTheme)}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {ALBUM_THEMES.map(renderTheme)}
            </div>
          );
        })()}
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            role="switch"
            aria-checked={isPublished}
            onClick={() => updateSetting(setIsPublished, !isPublished)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-[#FFC94D]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-gray-700">{copy.published}</span>
        </label>

        {album.plan !== "free" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={moderationEnabled}
                aria-label={copy.moderation}
                onClick={() => updateSetting(setModerationEnabled, !moderationEnabled)}
                className={`relative mt-0.5 h-5 w-10 shrink-0 rounded-full transition-colors ${moderationEnabled ? "bg-[#FFC94D]" : "bg-gray-200"}`}
              >
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${moderationEnabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-800">{copy.moderation}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  {copy.moderationHelp}
                </p>
              </div>
            </div>
            {moderationEnabled ? <ModerationEnabledNotice albumSlug={album.slug} /> : null}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={savePassword}
        disabled={passwordSaving || (!removePassword && !passwordDraft.trim())}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors bg-[#FFC94D] hover:bg-[#F0B429]"
      >
        {passwordSaving
          ? copy.savingPassword
          : passwordSaveStatus === "saved"
            ? copy.passwordSaved
            : copy.savePassword}
      </button>
      {passwordSaveStatus === "error" && (
        <p className="text-center text-xs font-medium text-red-600" role="alert">
          {copy.passwordError}
        </p>
      )}
    </div>
  );
}

// ─── Danger Zone ─────────────────────────────────────────────────────────────
// Rendered as the very last section of the Settings tab.
function DangerZone({ album, lang }: { album: Album; lang: DashboardLang }) {
  const copy = ADMIN_SETTINGS_COPY[lang];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <>
      <div className="border border-red-200 rounded-2xl p-5 space-y-3" style={{ background: "#fff5f5" }}>
        <div>
          <h4 className="font-semibold text-red-700 text-sm">{copy.danger}</h4>
          <p className="text-xs text-red-500 mt-0.5">{copy.dangerHelp}</p>
        </div>
        <div className="flex items-center justify-between gap-4 bg-white border border-red-100 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">{copy.deleteGallery}</p>
            <p className="text-xs text-gray-500 mt-0.5">{copy.deleteGalleryHelp}</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-shrink-0 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            {copy.delete}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAlbumModal album={album} lang={lang} onClose={() => setShowDeleteModal(false)} />
      )}
    </>
  );
}

// ─── Moments Manager ──────────────────────────────────────────────────────────

function MomentsManager({ album, lang }: { album: Album; lang: DashboardLang }) {
  const t = translations[lang];
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`/api/albums/${album.slug}/moments`);
      if (res.ok) {
        const data = (await res.json()) as { moments: Moment[] };
        setMoments(data.moments ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album.slug]);

  const addMoment = async () => {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/albums/${album.slug}/moments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setNewName("");
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const renameMoment = async (id: string) => {
    const name = editName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/albums/${album.slug}/moments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      if (res.ok) {
        setEditingId(null);
        await load();
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteMoment = async (id: string) => {
    if (busy || !confirm(t.momentDeleteConfirm)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/albums/${album.slug}/moments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) await load();
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-[#FFC94D] transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">{t.momentsTitle}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{t.momentsDesc}</p>
      </div>

      {/* Add */}
      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMoment()}
          placeholder={t.momentNamePlaceholder}
          maxLength={60}
          className={inputClass}
        />
        <button
          onClick={addMoment}
          disabled={busy || !newName.trim()}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#FFC94D] hover:bg-[#F0B429] transition-colors disabled:opacity-40"
        >
          {t.momentAdd}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-gray-400">…</p>
      ) : moments.length === 0 ? (
        <p className="text-sm text-gray-400">{t.momentEmpty}</p>
      ) : (
        <div className="space-y-2">
          {moments.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-2"
            >
              {editingId === m.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && renameMoment(m.id)}
                    maxLength={60}
                    autoFocus
                    className={`${inputClass} py-1.5`}
                  />
                  <button
                    onClick={() => renameMoment(m.id)}
                    disabled={busy || !editName.trim()}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-semibold bg-[#FFC94D] hover:bg-[#F0B429] transition-colors disabled:opacity-40"
                  >
                    {t.momentRename}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-800 truncate">{m.name}</span>
                  <button
                    onClick={() => { setEditingId(m.id); setEditName(m.name); }}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t.momentRename}
                  </button>
                  <button
                    onClick={() => deleteMoment(m.id)}
                    disabled={busy}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    {t.momentDelete}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ACCENT = "#C9820A";

function DnsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 flex-shrink-0 text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="font-mono text-gray-800 break-all select-all">{value}</span>
    </div>
  );
}
