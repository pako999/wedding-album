"use client";

import { useState, useEffect } from "react";
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
import { ALBUM_THEMES } from "@/lib/album-themes";
import { fbEvent } from "@/lib/fbpixel";

/**
 * List price of each paid plan in EUR. Used to fire the Meta Pixel
 * Purchase event with a real `value` — the customer-facing price on
 * /pricing is the source of truth. Mollie discount codes / affiliate
 * codes can reduce the amount charged, but for the Pixel we report the
 * headline plan price so ad ROAS comparisons match campaign expectations.
 */
const PLAN_PRICES_EUR: Record<"basic" | "plus" | "premium", number> = {
  basic:   39,
  plus:    49,
  premium: 99,
};

type Tab = "overview" | "gallery" | "qr" | "settings" | "pending" | "film";

interface Props {
  album: Album;
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
  paidPlan?: "basic" | "plus" | "premium";
  /** Logged-in user's primary email — shown in the Settings tab so the
   *  owner can confirm which account this album is attached to. */
  ownerEmail?: string | null;
  /** True when a platform admin is opening someone else's album from
   *  /admin/albums. Renders a persistent banner so the admin can never
   *  forget they're viewing a customer's gallery and any destructive
   *  action they take applies to that customer's data. */
  viewingAsAdmin?: boolean;
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function NewAlbumSuccess({ album, paidPlan }: { album: Album; paidPlan?: "basic" | "plus" | "premium" }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.guestcam.si";
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
          Korak {step} od 3
        </p>

        {/* ── Step 1 — Album created ─────────────────────────────────── */}
        {step === 1 && (
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-[26px] sm:text-[28px] font-bold text-gray-900 mb-2 leading-snug">
              Galerija je ustvarjena! 🎉
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              <strong className="text-gray-800">{album.coupleName}</strong> — vse je pripravljeno.
              V naslednjih dveh korakih si oglejte svojo QR kodo in izberite predlogo za tisk.
            </p>
            <button
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90"
              style={{ background: "#FFC94D" }}
            >
              Naprej
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Step 2 — Your QR code ──────────────────────────────────── */}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Vaša QR koda</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Gostje skenirajo to QR kodo s telefonom — brez aplikacije, brez prijave — in začnejo deliti fotografije.
            </p>
            <div className="inline-flex items-center justify-center p-4 rounded-2xl border-2 mx-auto mb-5"
              style={{ borderColor: "rgba(255,201,77,0.25)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrPreview} alt="QR koda za galerijo" width={208} height={208} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link
                href={`/dashboard/${album.slug}/print`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                🖨️ Poglej predloge
              </Link>
              <a
                href={`/api/albums/${album.slug}/qr?format=png&design=1`}
                download={`qr-${album.slug}.png`}
                className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-white rounded-xl transition-opacity hover:opacity-90"
                style={{ background: "#FFC94D" }}
              >
                ⬇ Prenesi QR kodo
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Nazaj
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: "#FFC94D" }}
              >
                Naprej
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Izberite predlogo za tisk</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Personalizirana kartica z imenom para, datumom in vašo QR kodo.
              Natisnite in postavite na mize ali ob vhod — gostje takoj vedo, kaj storiti.
            </p>
            <Link
              href={`/dashboard/${album.slug}/print`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-bold text-base mb-3 transition-opacity hover:opacity-90"
              style={{ background: "#FFC94D" }}
            >
              🖨️ Odpri predloge za tisk
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href={dashboardUrl}
              className="block text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
            >
              Preskoči — to lahko storim kasneje v nadzorni plošči
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
                ← Nazaj na QR kodo
              </button>
              <Link
                href={dashboardUrl}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold border-2 border-[#0F1729] text-[#0F1729] hover:bg-[#0F1729] hover:text-white transition-colors"
              >
                Pojdi na nadzorno ploščo →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function AlbumAdminPanel({ album, photos, pendingCount, guestCount, activeTab, isNew, isUpgraded, paidAmount, paidPlan, ownerEmail, viewingAsAdmin }: Props) {
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.guestcam.si";
  const albumUrl = `${appUrl}/${album.slug}`;
  // Mobile sidebar drawer — hidden by default on small screens.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
    return <NewAlbumSuccess album={album} paidPlan={paidPlan} />;
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
    if (!confirm("Res želite izbrisati to fotografijo?")) return;
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

  const setCoverPhoto = async (blobUrl: string) => {
    await fetch(`/api/albums/${album.slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImageUrl: blobUrl }),
    });
    router.refresh();
  };

  const planLabel =
    album.plan === "premium" ? "Premium" :
    album.plan === "plus"    ? "Plus"    :
    album.plan === "basic"   ? "Basic"   :
    "Brezplačno";

  const planBadgeClass =
    album.plan === "premium"
      ? "bg-rose-500 text-white"
      : album.plan === "plus"
      ? "bg-gray-900 text-white"
      : album.plan === "basic"
      ? "bg-[#FFC94D] text-white"
      : "bg-gray-100 text-gray-600";

  // Last uploaded photo date
  const lastPhoto = photos[0];
  const lastUploadDate = lastPhoto
    ? new Date(lastPhoto.uploadedAt).toLocaleDateString("sl-SI", { day: "numeric", month: "short", year: "numeric" })
    : "-";

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview",  label: "Pregled",    icon: "🕐" },
    { id: "gallery",   label: "Fotografije",   icon: "🖼" },
    { id: "film",      label: "Film Studio", icon: "🎬" },
    { id: "qr",        label: "QR koda",    icon: "📱" },
    { id: "settings",  label: "Nastavitve", icon: "⚙️" },
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
              Admin pogled — galerija lastnika{ownerEmail ? `: ${ownerEmail}` : ""}
            </span>
          </div>
          <Link
            href="/admin/albums"
            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[#FFC94D] text-[#0F1729] px-2.5 py-1 text-xs font-bold hover:opacity-90"
          >
            ← Nazaj na admin
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
            Vse galerije
          </Link>
        </div>

        {/* Gallery info */}
        <div className="px-5 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Tvoja galerija</p>
          <p className="font-bold text-sm text-gray-900 leading-tight truncate">{album.coupleName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{album.weddingDate}</p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold ${planBadgeClass}`}>
            {planLabel}
          </span>
        </div>

        {/* New gallery button */}
        <div className="px-4 pb-4">
          <Link
            href="/dashboard/new"
            className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-gray-500 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Dodaj novo galerijo
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg mx-0 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "border-l-2 border-[#FFC94D] bg-[#FFF9EC] text-[#C9820A]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          {pendingCount > 0 && (
            <button
              onClick={() => navigateTab("pending")}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === "pending"
                  ? "border-l-2 border-[#FFC94D] bg-[#FFF9EC] text-[#C9820A]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="text-base leading-none">⏳</span>
              V čakanju
              <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 bg-amber-400 text-white text-[10px] font-bold rounded-full px-1">
                {pendingCount}
              </span>
            </button>
          )}
        </nav>

        {/* Sign out — clear, visible button (not a faint text link) */}
        <div className="px-4 pb-5 pt-3 border-t border-gray-100">
          <SignOutButton>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#0F1729] bg-white border border-gray-200 rounded-lg hover:bg-[#FFF9EC] hover:border-[#FFC94D] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Odjava
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Upgrade success banner */}
        {isUpgraded && (
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4"
            style={{ background: "#F0FDF4" }}
          >
            <p className="text-sm text-green-700 font-medium">
              🎉 Paket aktiviran! Hvala za zaupanje.
            </p>
          </div>
        )}

        {/* Upgrade banner (free plan only) */}
        {album.plan === "free" && (() => {
          const used = album.photoCount ?? 0;
          const max  = album.maxPhotos ?? 20;
          const pct  = Math.min(100, Math.round((used / max) * 100));
          const atLimit = used >= max;
          return (
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-2.5 gap-4"
              style={{ background: atLimit ? "#FEF2F2" : "#EEF2FF" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold" style={{ color: atLimit ? "#DC2626" : "#FFC94D" }}>
                    {used} / {max}
                  </span>
                  <span className="text-xs" style={{ color: atLimit ? "#DC2626" : "#FFC94D" }}>slik</span>
                </div>
                <div className="w-28 h-1.5 rounded-full bg-gray-200 hidden sm:block">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: atLimit ? "#DC2626" : pct > 70 ? "#F59E0B" : "#FFC94D",
                    }}
                  />
                </div>
                <span className="text-xs hidden md:block" style={{ color: atLimit ? "#DC2626" : "#FFC94D" }}>
                  {atLimit ? "⚠️ Dosežena meja — gostje ne morejo več nalagati!" : "Brezplačni paket"}
                </span>
              </div>
              <Link
                href={`/dashboard/${album.slug}/upgrade`}
                className="flex-shrink-0 px-4 py-1.5 rounded-lg text-white text-xs font-bold transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{ background: atLimit ? "#DC2626" : "#FFC94D" }}
              >
                {atLimit ? "Odkleni takoj →" : "Odkleni galerijo →"}
              </Link>
            </div>
          );
        })()}

        {/* Page header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between px-4 sm:px-8 pt-5 sm:pt-7 pb-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
              aria-label="Odpri meni"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {activeTab === "overview"  && "Pregled galerije"}
                {activeTab === "gallery"   && "Fotografije"}
                {activeTab === "film"      && "🎬 Film Studio"}
                {activeTab === "qr"        && "QR koda"}
                {activeTab === "settings"  && "Nastavitve"}
                {activeTab === "pending"   && "Čakajoče fotografije"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Upravljaj svojo galerijo.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-all"
              style={linkCopied
                ? { background: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
                : { background: "white", borderColor: "#e5e7eb", color: "#4b5563" }
              }
              title="Kopiraj povezavo za goste"
            >
              {linkCopied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Kopirano!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Kopiraj povezavo
                </>
              )}
            </button>
            <a
              href={albumUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Poglej kot gost
            </a>
            <ZipDownloader
              albumSlug={album.slug}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Prenesi ZIP
            </ZipDownloader>
          </div>
        </div>


        {/* ── TAB CONTENT ── */}
        <div className="flex-1 px-4 sm:px-8 pb-8">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <OverviewTab
              album={album}
              photos={photos}
              albumUrl={albumUrl}
              lastUploadDate={lastUploadDate}
              guestCount={guestCount}
            />
          )}

          {/* GALLERY */}
          {(activeTab === "gallery" || activeTab === "pending") && (
            <GalleryTab
              album={album}
              photos={photos}
              activeTab={activeTab}
              approvePhoto={approvePhoto}
              rejectPhoto={rejectPhoto}
              deletePhoto={deletePhoto}
              setCoverPhoto={setCoverPhoto}
            />
          )}

          {/* FILM STUDIO */}
          {activeTab === "film" && (
            <FilmStudio album={album} />
          )}

          {/* QR */}
          {activeTab === "qr" && (
            <QrTab album={album} albumUrl={albumUrl} copyToClipboard={copyToClipboard} />
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="max-w-lg space-y-6">
              <AccountInfoCard ownerEmail={ownerEmail ?? null} />
              <AlbumSettingsForm album={album}>
                {/* Cover-photo picker injected into the settings form so it
                    sits inside the same card chrome, between the password
                    field and the theme picker. */}
                <CoverPhotoSettings album={album} photos={photos} />
              </AlbumSettingsForm>
              <MomentsManager album={album} />
              <CustomDomainPanel album={album} />
              <DangerZone album={album} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

// Renders a thumbnail tile for a photo OR a video. Videos used to render
// as a plain <img src={blobUrl}> in the owner dashboard, which produced
// a broken-image fallback because video blob URLs don't decode as images.
// The public guest view handled videos correctly with <video>, so owners
// were the only ones seeing missing videos.
//
//   - Photos: <img> with the Bunny thumbnailUrl (or blobUrl as fallback).
//   - Videos with a thumbnailUrl: <img> on the still + play-icon overlay.
//   - Videos without a thumbnailUrl: <video preload="metadata" muted
//     playsInline> which renders the first frame as the poster, plus
//     the same play-icon overlay so the owner knows it's playable.
function MediaThumb({
  photo,
  heightClass,
}: {
  photo: Photo;
  /** Tailwind height class — e.g. "h-40" for gallery grid, "h-28" for the
   *  recent-uploads card. Wraps the image so videos and photos line up. */
  heightClass: string;
}) {
  const isVideo = photo.mimeType?.startsWith("video/") ?? false;
  const onError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const t = e.currentTarget;
    t.onerror = null;
    t.style.objectFit = "none";
    t.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5'%3E%3Crect x='2' y='7' width='20' height='14' rx='3'/%3E%3Ccircle cx='12' cy='14' r='3'/%3E%3Cpath d='M8 7V5a2 2 0 0 1 4 0v2'/%3E%3C/svg%3E";
  };

  // Prefer thumbnailUrl (Bunny generates one for both Storage and Stream
  // videos). Fall back to the raw blobUrl only when there's no thumb.
  const thumbSrc = photo.thumbnailUrl ?? photo.blobUrl;

  return (
    <div className={`relative w-full ${heightClass}`}>
      {isVideo && !photo.thumbnailUrl ? (
        <video
          src={bunnyDisplayUrl(photo.blobUrl)}
          preload="metadata"
          muted
          playsInline
          className={`w-full ${heightClass} object-cover rounded-xl bg-gray-100 pointer-events-none`}
        />
      ) : (
        <img
          src={bunnyDisplayUrl(thumbSrc)}
          alt={photo.caption ?? ""}
          loading="lazy"
          onError={onError}
          className={`w-full ${heightClass} object-cover rounded-xl bg-gray-100`}
        />
      )}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center">
            <svg className="w-5 h-5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

function OverviewTab({
  album,
  photos,
  albumUrl,
  lastUploadDate,
  guestCount,
}: {
  album: Album;
  photos: Photo[];
  albumUrl: string;
  lastUploadDate: string;
  guestCount: number;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(albumUrl)}&bgcolor=ffffff&color=1a1a2e&qzone=2&format=png`;
  const last4 = photos.slice(0, 4);
  const usedPct = album.plan === "free" ? Math.min(100, Math.round(((album.photoCount ?? 0) / (album.maxPhotos ?? 20)) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Upgrade nudge card — free plan only */}
      {album.plan === "free" && (
        <div className="bg-[#FFF9EC] border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-indigo-800">📦 Brezplačni paket</span>
              <span className="text-xs bg-[#FFF3CC] text-[#C9820A] px-2 py-0.5 rounded-full font-medium">
                {album.photoCount ?? 0} / {album.maxPhotos ?? 20} slik
              </span>
            </div>
            <div className="w-full h-2 bg-[#FFF3CC] rounded-full mb-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${usedPct}%`,
                  background: usedPct >= 100 ? "#DC2626" : usedPct > 70 ? "#F59E0B" : "#FFC94D",
                }}
              />
            </div>
            <p className="text-xs text-[#C9820A]">
              {usedPct >= 100
                ? "⚠️ Meja dosežena — nadgradi za neomejeno nalaganje"
                : `Nadgradi za neomejene fotografije, videe in dostop 1 leto`}
            </p>
          </div>
          <Link
            href={`/dashboard/${album.slug}/upgrade`}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 hover:brightness-95 shadow-sm"
            style={{ background: "#FFC94D" }}
          >
            Poglej pakete →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M1.5 18.75h21M3.75 9h.008v.008H3.75V9zm0 3h.008v.008H3.75V12z" />
              </svg>
            ),
            label: "Naložene slike",
            value: album.photoCount,
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            ),
            label: "Gostje",
            value: guestCount,
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: "Zadnja slika",
            value: lastUploadDate,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start justify-between gap-3"
          >
            <div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mt-1">{card.label}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#C9820A] bg-[#FFF9EC] shrink-0">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* QR Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Tvoja QR koda</h3>
            <p className="text-xs text-gray-400 mt-0.5">Natisni to kodo in jo postavi na mize.</p>
          </div>
          <a
            href={albumUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C9820A] border border-[#FFE08A] rounded-lg hover:bg-[#FFF9EC] transition-colors self-start"
          >
            Skeniraj to QR kodo in preizkusi, kako deluje
          </a>
          <div className="flex flex-col items-center gap-3">
            <div className="text-gray-300 text-xl select-none">↓</div>
            <img
              src={qrUrl}
              alt="QR koda"
              className="w-48 h-48 rounded-lg border border-gray-100"
            />
          </div>
          <div className="flex gap-2">
            <a
              href={`/api/albums/${album.slug}/qr?format=png&design=1`}
              download={`qr-design-${album.slug}.png`}
              className="flex-1 py-2 text-xs text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              ⬇ Prenesi QR kodo z designom
            </a>
            <a
              href={`/api/albums/${album.slug}/qr?format=png`}
              download={`qr-${album.slug}.png`}
              className="flex-1 py-2 text-xs text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
            >
              ⬇ Prenesi samo QR kodo
            </a>
          </div>
        </div>

        {/* Recent photos card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Zadnje naloženo</h3>
            <Link href={`/dashboard/${album.slug}?tab=gallery`} className="text-xs text-[#C9820A] hover:underline">
              Poglej vse
            </Link>
          </div>
          {last4.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 flex-1">
              {last4.map((photo) => (
                <MediaThumb key={photo.id} photo={photo} heightClass="h-28" />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Še ni naloženih fotografij.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Tab ─────────────────────────────────────────────────────────────

function GalleryTab({
  album,
  photos,
  activeTab,
  approvePhoto,
  rejectPhoto,
  deletePhoto,
  setCoverPhoto,
}: {
  album: Album;
  photos: Photo[];
  activeTab: Tab;
  approvePhoto: (id: string) => void;
  rejectPhoto: (id: string) => void;
  deletePhoto: (id: string) => void;
  setCoverPhoto: (blobUrl: string) => void;
}) {
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          {activeTab === "pending" ? "Čakajoče fotografije" : "Vse fotografije"}
        </h2>
      </div>

      {photos.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          Ni fotografij v tej kategoriji.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setViewPhoto(photo)}
                className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer"
              >
                <MediaThumb photo={photo} heightClass="h-40" />
                <div className="px-2 py-1.5">
                  <p className="text-xs text-gray-500 truncate">{photo.uploaderName ?? "Gost"}</p>
                </div>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {activeTab === "pending" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); approvePhoto(photo.id); }}
                        title="Odobri"
                        className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); rejectPhoto(photo.id); }}
                        title="Zavrni"
                        className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                  {activeTab === "gallery" && !photo.mimeType?.startsWith("video/") && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setCoverPhoto(photo.thumbnailUrl ?? photo.blobUrl); }}
                      title="Nastavi kot naslovnico"
                      className="w-9 h-9 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </button>
                  )}
                  {activeTab === "gallery" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                      title="Izbriši"
                      className="w-9 h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <a
              href={`/${album.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-full hover:border-gray-400 transition-colors"
            >
              Naloži več
            </a>
          </div>
        </>
      )}

      {/* Larger-view lightbox — opens when a photo is clicked */}
      {viewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setViewPhoto(null)}
        >
          <div className="relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {viewPhoto.mimeType?.startsWith("video/") ? (
              <video
                src={bunnyDisplayUrl(viewPhoto.blobUrl)}
                controls
                autoPlay
                className="max-h-[78vh] max-w-[90vw] rounded-2xl bg-black"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={bunnyDisplayUrl(viewPhoto.blobUrl, 1800, 90)}
                alt={viewPhoto.caption ?? ""}
                className="max-h-[78vh] max-w-[90vw] rounded-2xl object-contain"
              />
            )}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
              {!viewPhoto.mimeType?.startsWith("video/") && (
                <button
                  onClick={() => { setCoverPhoto(viewPhoto.thumbnailUrl ?? viewPhoto.blobUrl); setViewPhoto(null); }}
                  className="px-4 py-2 rounded-xl bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Nastavi kot naslovnico
                </button>
              )}
              <button
                onClick={() => { deletePhoto(viewPhoto.id); setViewPhoto(null); }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Izbriši
              </button>
              <button
                onClick={() => setViewPhoto(null)}
                className="px-4 py-2 rounded-xl border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Zapri
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QR Tab ──────────────────────────────────────────────────────────────────

function QrTab({
  album,
  albumUrl,
  copyToClipboard,
}: {
  album: Album;
  albumUrl: string;
  copyToClipboard: (text: string) => void;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(albumUrl)}&bgcolor=ffffff&color=1a1a2e&qzone=2&format=png`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(albumUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-5">
        <img
          src={qrUrl}
          alt="QR koda"
          className="w-52 h-52 rounded-xl border border-gray-100"
        />

        {/* URL input + copy */}
        <div className="w-full flex items-center gap-2">
          <input
            readOnly
            value={albumUrl}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors whitespace-nowrap"
            style={{ background: copied ? "#22c55e" : "#FFC94D" }}
          >
            {copied ? "Kopirano!" : "Kopiraj"}
          </button>
        </div>

        {/* Download buttons */}
        <div className="w-full flex gap-2">
          <a
            href={`/api/albums/${album.slug}/qr?format=png&design=1`}
            download={`qr-design-${album.slug}.png`}
            className="flex-1 py-2.5 text-sm text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            Prenesi QR kodo z designom
          </a>
          <a
            href={`/api/albums/${album.slug}/qr?format=png`}
            download={`qr-${album.slug}.png`}
            className="flex-1 py-2.5 text-sm text-center text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            Prenesi samo QR kodo
          </a>
        </div>

        <div className="w-full pt-2 text-center">
          <p className="text-xs text-gray-500 mb-3 max-w-xs mx-auto leading-relaxed">
            Personalizirajte kartico s QR kodo za vaše goste — izberite med 8 predlogami za tisk.
          </p>
          <Link
            href={`/dashboard/${album.slug}/print`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC94D] text-white text-sm font-semibold hover:bg-[#F0B429] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Odpri predloge za tisk
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Form ────────────────────────────────────────────────────────────

function DeleteAlbumModal({
  album,
  onClose,
}: {
  album: Album;
  onClose: () => void;
}) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const slug = album.slug;
  const ready = confirmText === slug;

  const handleDelete = async () => {
    if (!ready) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/albums/${slug}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Brisanje ni uspelo");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Napaka");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Izbriši galerijo</h2>
            <p className="text-sm text-gray-500 mt-0.5">To dejanje je <strong>nepovratno</strong>. Vse fotografije, videi in podatki bodo trajno izbrisani.</p>
          </div>
        </div>

        {/* Confirmation input */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-red-700">
            Za potrditev vpiši ime galerije:
            <span className="ml-1 font-mono font-bold text-red-800 select-all">{slug}</span>
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={slug}
            autoFocus
            className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white outline-none transition-colors font-mono"
            style={{ borderColor: confirmText && !ready ? "#f87171" : ready ? "#22c55e" : "#e5e7eb" }}
          />
          {confirmText && !ready && (
            <p className="text-xs text-red-600">Besedilo se ne ujema</p>
          )}
          {ready && (
            <p className="text-xs text-green-600 font-medium">✓ Potrditev pravilna</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Prekliči
          </button>
          <button
            onClick={handleDelete}
            disabled={!ready || deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: ready ? "#dc2626" : "#fca5a5" }}
          >
            {deleting ? "Brišem…" : "Izbriši galerijo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Tiny card at the top of Settings showing the owner's Clerk email +
// a sign-out shortcut. Users have asked for an easy way to confirm
// which account a given album is on.
function AccountInfoCard({ ownerEmail }: { ownerEmail: string | null }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Prijavljeni račun</p>
          <p className="text-sm font-semibold text-[#0F1729] truncate">{ownerEmail ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-0.5">Ta galerija je vezana na ta račun.</p>
        </div>
        <SignOutButton>
          <button className="flex-shrink-0 px-3 py-2 text-xs font-semibold text-[#0F1729] border border-gray-200 rounded-lg hover:bg-[#FFF9EC] hover:border-[#FFC94D] transition-colors">
            Odjava
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}

function AlbumSettingsForm({ album, children }: { album: Album; children?: React.ReactNode }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [coupleName, setCoupleName]           = useState(album.coupleName);
  const [weddingDate, setWeddingDate]         = useState(album.weddingDate);
  const [location, setLocation]               = useState(album.location ?? "");
  const [notifyEmail, setNotifyEmail]         = useState(album.notifyEmail ?? "");
  // Password stays in state so existing galleries preserve theirs on save,
  // but the UI field was removed to reduce confusion — most couples never
  // want a password. Owners who need one can still add via API.
  const [password]                            = useState(album.password ?? "");
  const [moderationEnabled, setModerationEnabled] = useState(album.moderationEnabled);
  const [isPublished, setIsPublished]         = useState(album.isPublished);
  const [eventType, setEventType]             = useState(album.eventType ?? "wedding");
  const [theme, setTheme]                     = useState(album.theme ?? "navy");

  const save = async () => {
    setSaving(true);
    await fetch(`/api/albums/${album.slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleName,
        weddingDate,
        location,
        notifyEmail,
        password,
        moderationEnabled,
        isPublished,
        eventType,
        theme,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-[#FFC94D] transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h3 className="font-semibold text-gray-900">Nastavitve galerije</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ime galerije</label>
        <input value={coupleName} onChange={(e) => setCoupleName(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
        <input
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vrsta dogodka</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className={inputClass}
        >
          <option value="wedding">Poroka</option>
          <option value="birthday">Rojstni dan</option>
          <option value="anniversary">Obletnica</option>
          <option value="party">Zabava</option>
          <option value="baptism">Krst</option>
          <option value="graduation">Diploma/Matura</option>
          <option value="baby_shower">Baby Shower</option>
          <option value="business">Poslovni dogodek</option>
          <option value="other">Drugo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ljubljana"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pozdravno sporočilo za goste</label>
        <textarea
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          rows={3}
          placeholder="Dobrodošli! Naložite svoje fotografije in delite spomine."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Slot for the cover-photo picker — passed in from AlbumAdminPanel.
          Sits between the metadata fields and the theme picker so it
          reads as one continuous "appearance" section in the form. */}
      {children}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tema galerije</label>
        <p className="text-xs text-gray-400 mb-2.5">Izberite barvno temo za javno stran galerije.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {ALBUM_THEMES.map((tm) => {
            const selected = theme === tm.id;
            return (
              <button
                key={tm.id}
                type="button"
                onClick={() => setTheme(tm.id)}
                aria-pressed={selected}
                title={tm.name}
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
                  {tm.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            role="switch"
            aria-checked={isPublished}
            onClick={() => setIsPublished(!isPublished)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-[#FFC94D]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublished ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-gray-700">Galerija je javno dostopna</span>
        </label>

        {album.plan !== "free" && (
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              role="switch"
              aria-checked={moderationEnabled}
              onClick={() => setModerationEnabled(!moderationEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${moderationEnabled ? "bg-[#FFC94D]" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${moderationEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-gray-700">Moderacija fotografij pred objavo</span>
          </label>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors bg-[#FFC94D] hover:bg-[#F0B429]"
      >
        {saving ? "Shranjevanje…" : saved ? "✓ Shranjeno" : "Shrani spremembe"}
      </button>
    </div>
  );
}

// ─── Danger Zone ─────────────────────────────────────────────────────────────
// Rendered as the very last section of the Settings tab.
function DangerZone({ album }: { album: Album }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <>
      <div className="border border-red-200 rounded-2xl p-5 space-y-3" style={{ background: "#fff5f5" }}>
        <div>
          <h4 className="font-semibold text-red-700 text-sm">Nevarno območje</h4>
          <p className="text-xs text-red-500 mt-0.5">Spodnja dejanja so nepovratna. Nadaljuj previdno.</p>
        </div>
        <div className="flex items-center justify-between gap-4 bg-white border border-red-100 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Izbriši galerijo</p>
            <p className="text-xs text-gray-500 mt-0.5">Trajno izbriše galerijo in vse fotografije.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-shrink-0 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Izbriši
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAlbumModal album={album} onClose={() => setShowDeleteModal(false)} />
      )}
    </>
  );
}

// ─── Moments Manager ──────────────────────────────────────────────────────────

function MomentsManager({ album }: { album: Album }) {
  const t = translations.sl;
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

// ─── Custom Domain Panel (Premium) ────────────────────────────────────────────

interface DnsRecord {
  type: string;
  domain: string;
  value: string;
}

interface DomainStatus {
  verified: boolean;
  misconfigured: boolean;
  verification: DnsRecord[];
}

const ACCENT = "#C9820A"; // black-blue accent

function CustomDomainPanel({ album }: { album: Album }) {
  const isPremium = album.plan === "premium";

  const [domain, setDomain] = useState<string | null>(album.customDomain ?? null);
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load current domain + status on mount (Premium only).
  useEffect(() => {
    if (!isPremium) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/albums/${album.slug}/domain`);
        if (res.ok) {
          const data = (await res.json()) as { domain: string | null; status: DomainStatus | null };
          if (!cancelled) {
            setDomain(data.domain);
            setStatus(data.status);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album.slug]);

  const saveDomain = async () => {
    const value = input.trim();
    if (!value || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/albums/${album.slug}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Shranjevanje ni uspelo.");
        return;
      }
      setDomain(data.domain ?? value);
      setStatus(data.status ?? null);
      setInput("");
    } catch {
      setError("Napaka pri povezavi.");
    } finally {
      setBusy(false);
    }
  };

  const refreshStatus = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/albums/${album.slug}/domain`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDomain(data.domain);
        setStatus(data.status);
      } else {
        setError(data.error ?? "Osvežitev ni uspela.");
      }
    } catch {
      setError("Napaka pri povezavi.");
    } finally {
      setBusy(false);
    }
  };

  const removeDomain = async () => {
    if (busy || !confirm("Res želite odstraniti lastno domeno?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/albums/${album.slug}/domain`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Odstranjevanje ni uspelo.");
        return;
      }
      setDomain(null);
      setStatus(null);
    } catch {
      setError("Napaka pri povezavi.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-[#FFC94D] transition-colors";

  // ── Locked panel (non-Premium) ──────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🌐</span>
          <h3 className="font-semibold text-gray-900">Lastna domena</h3>
          <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white">
            Premium
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Lastna domena je na voljo v paketu Premium. Galerijo lahko prikažete na
          svoji domeni, npr. <span className="font-mono">galerija.mojadomena.si</span>.
        </p>
        <Link
          href={`/dashboard/${album.slug}/upgrade`}
          className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: ACCENT }}
        >
          Nadgradi na Premium →
        </Link>
      </div>
    );
  }

  // ── Premium panel ───────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base">🌐</span>
        <h3 className="font-semibold text-gray-900">Lastna domena</h3>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Nalaganje…</p>
      ) : !domain ? (
        // No domain set — input + save.
        <>
          <p className="text-sm text-gray-500">
            Vnesite domeno, na kateri želite prikazati svojo galerijo. Po vnosu vam
            bomo prikazali DNS zapis, ki ga dodate pri svojem ponudniku domene.
          </p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveDomain()}
            placeholder="npr. galerija.mojadomena.si"
            className={inputClass}
          />
          <button
            onClick={saveDomain}
            disabled={busy || !input.trim()}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            {busy ? "Shranjevanje…" : "Shrani"}
          </button>
        </>
      ) : (
        // Domain set — show status + DNS records.
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-mono text-sm text-gray-800 break-all">{domain}</span>
            {status?.verified ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                ✅ Preverjeno
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                ⏳ Čaka na DNS
              </span>
            )}
          </div>

          {!status?.verified && (
            <div
              className="rounded-xl p-4 space-y-3 text-sm"
              style={{ background: "#EFF2FB" }}
            >
              <p className="font-medium" style={{ color: ACCENT }}>
                Dodajte naslednji DNS zapis pri svojem ponudniku domene:
              </p>

              {status?.verification && status.verification.length > 0 ? (
                status.verification.map((r, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 space-y-1.5">
                    <DnsRow label="Tip" value={r.type} />
                    <DnsRow label="Ime" value={r.domain} />
                    <DnsRow label="Vrednost" value={r.value} />
                  </div>
                ))
              ) : (
                // No explicit verification records → standard CNAME / A instruction.
                <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1.5">
                  {domain.split(".").length > 2 ? (
                    <>
                      <DnsRow label="Tip" value="CNAME" />
                      <DnsRow label="Ime" value={domain.split(".")[0]} />
                      <DnsRow label="Vrednost" value="cname.vercel-dns.com" />
                    </>
                  ) : (
                    <>
                      <DnsRow label="Tip" value="A" />
                      <DnsRow label="Ime" value="@" />
                      <DnsRow label="Vrednost" value="76.76.21.21" />
                    </>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Ko dodate DNS zapis pri svojem ponudniku domene, ga sistem samodejno
                preveri in izda SSL certifikat. To lahko traja nekaj minut.
              </p>
            </div>
          )}

          {status?.verified && (
            <p className="text-sm text-gray-500">
              Vaša galerija je dostopna na{" "}
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline"
                style={{ color: ACCENT }}
              >
                {domain}
              </a>
              .
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={refreshStatus}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-40"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              {busy ? "…" : "Osveži stanje"}
            </button>
            <button
              onClick={removeDomain}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              Odstrani
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
    </div>
  );
}

function DnsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 flex-shrink-0 text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="font-mono text-gray-800 break-all select-all">{value}</span>
    </div>
  );
}

