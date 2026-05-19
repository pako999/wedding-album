"use client";

import { useState } from "react";
import Link from "next/link";
import { updateCardText } from "@/app/actions/update-card-text";

interface TemplateInfo {
  id: string;
  name: string;
  emoji: string;
  style: "white" | "dark" | "cream" | "kraft" | "blush" | "minimal";
  headline: string;
  sub: string;
  cta: string;
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: "elegant",
    name: "Elegantna",
    emoji: "🌸",
    style: "white",
    headline: "Capture the Love",
    sub: "Delite fotografije s tega posebnega dne",
    cta: "Skeniraj QR kodo · Dodaj fotografijo",
  },
  {
    id: "dark",
    name: "Moderna",
    emoji: "🖤",
    style: "dark",
    headline: "Share Our Memories",
    sub: "Scan to share your photos from today",
    cta: "Scan QR · Upload instantly · No app needed",
  },
  {
    id: "blush",
    name: "Romantična",
    emoji: "💗",
    style: "blush",
    headline: "Zberi spomine",
    sub: "Fotografiraj, skeniraj in deli",
    cta: "Skeniraj QR kodo · Brez aplikacije",
  },
  {
    id: "kraft",
    name: "Rustikalna",
    emoji: "🌾",
    style: "kraft",
    headline: "Zberi naše spomine",
    sub: "Skeniraj QR kodo in dodaj fotografijo",
    cta: "Skeniraj · Fotografiraj · Deli",
  },
  {
    id: "cream",
    name: "Botanična",
    emoji: "🌿",
    style: "cream",
    headline: "Deli ta trenutek z nami",
    sub: "Skeniraj spodnjo kodo in naloži fotografijo",
    cta: "Skeniraj QR kodo · Takoj naloži",
  },
  {
    id: "minimal",
    name: "Minimalistična",
    emoji: "◻",
    style: "minimal",
    headline: "Scan & Share",
    sub: "Upload your photos from today",
    cta: "No app needed · Instant upload",
  },
];

interface Props {
  slug: string;
  coupleName: string;
  weddingDate: string;
  location: string | null;
  qrUrl: string;
  albumUrl: string;
  plan: string;
  customText: { headline: string; subtitle: string; cta: string };
}

function getColors(style: TemplateInfo["style"]) {
  switch (style) {
    case "dark":    return { bg: "#1C1917", text: "#F5F0EB", accent: "#D4A574", sub: "rgba(245,240,235,0.55)", border: "none", divider: "#D4A574" };
    case "cream":   return { bg: "#FEFBF3", text: "#0F1729", accent: "#8B6914", sub: "#9CA3AF", border: "1.5px solid rgba(139,105,20,0.25)", divider: "#C4A55A" };
    case "kraft":   return { bg: "#F0E8D8", text: "#3D2B1F", accent: "#8B5E3C", sub: "rgba(61,43,31,0.55)", border: "1.5px solid rgba(139,94,60,0.3)", divider: "#A0724A" };
    case "blush":   return { bg: "#FDF0F3", text: "#0F1729", accent: "#1E3A8A", sub: "#9CA3AF", border: "1.5px solid rgba(30,58,138,0.3)", divider: "#1E3A8A" };
    case "minimal": return { bg: "#FFFFFF", text: "#111111", accent: "#555555", sub: "#888888", border: "1px solid #E5E5E5", divider: "#CCCCCC" };
    default:        return { bg: "#FFFFFF", text: "#0F1729", accent: "#1E3A8A", sub: "#9CA3AF", border: "1.5px solid rgba(30,58,138,0.2)", divider: "#1E3A8A" };
  }
}

function TableCard({
  template,
  headline,
  sub,
  cta,
  coupleName,
  weddingDate,
  location,
  qrUrl,
  albumUrl,
  size = "full",
}: {
  template: TemplateInfo;
  headline: string;
  sub: string;
  cta: string;
  coupleName: string;
  weddingDate: string;
  location: string | null;
  qrUrl: string;
  albumUrl: string;
  size?: "preview" | "full";
}) {
  const c = getColors(template.style);
  const isPreview = size === "preview";
  const scale = isPreview ? 0.45 : 1;

  const card = (
    <div
      style={{
        background: c.bg,
        border: c.border,
        borderRadius: isPreview ? 16 : 0,
        width: isPreview ? undefined : "100%",
        height: isPreview ? undefined : "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isPreview ? "28px 24px" : "40px 36px",
        boxSizing: "border-box",
        fontFamily: template.style === "dark" || template.style === "minimal" ? "'Inter', system-ui, sans-serif" : "Georgia, 'Times New Roman', serif",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative corner dots for some styles */}
      {(template.style === "cream" || template.style === "blush") && (
        <>
          <div style={{ position: "absolute", top: isPreview ? 10 : 16, left: isPreview ? 10 : 16, width: isPreview ? 6 : 10, height: isPreview ? 6 : 10, borderRadius: "50%", background: c.divider, opacity: 0.4 }} />
          <div style={{ position: "absolute", top: isPreview ? 10 : 16, right: isPreview ? 10 : 16, width: isPreview ? 6 : 10, height: isPreview ? 6 : 10, borderRadius: "50%", background: c.divider, opacity: 0.4 }} />
          <div style={{ position: "absolute", bottom: isPreview ? 10 : 16, left: isPreview ? 10 : 16, width: isPreview ? 6 : 10, height: isPreview ? 6 : 10, borderRadius: "50%", background: c.divider, opacity: 0.4 }} />
          <div style={{ position: "absolute", bottom: isPreview ? 10 : 16, right: isPreview ? 10 : 16, width: isPreview ? 6 : 10, height: isPreview ? 6 : 10, borderRadius: "50%", background: c.divider, opacity: 0.4 }} />
        </>
      )}

      {/* Top divider line */}
      <div style={{ width: isPreview ? 32 : 52, height: 1, background: c.divider, opacity: 0.6, marginBottom: isPreview ? 14 : 22 }} />

      {/* Headline */}
      <p style={{
        color: c.text,
        fontSize: isPreview ? 13 : 22,
        fontWeight: 700,
        marginBottom: isPreview ? 4 : 8,
        letterSpacing: template.style === "minimal" ? 2 : 0.5,
        textTransform: template.style === "minimal" ? "uppercase" : "none",
        lineHeight: 1.2,
      }}>
        {headline}
      </p>

      {/* Sub */}
      <p style={{
        color: c.sub,
        fontSize: isPreview ? 7 : 13,
        marginBottom: isPreview ? 10 : 18,
        lineHeight: 1.4,
        maxWidth: isPreview ? 110 : 220,
      }}>
        {sub}
      </p>

      {/* Couple name */}
      <p style={{
        color: c.accent,
        fontSize: isPreview ? 9 : 16,
        fontWeight: 700,
        marginBottom: isPreview ? 2 : 4,
        letterSpacing: 1,
      }}>
        {coupleName}
      </p>
      <p style={{
        color: c.sub,
        fontSize: isPreview ? 6.5 : 11,
        marginBottom: isPreview ? 10 : 18,
      }}>
        {weddingDate}{location ? ` · ${location}` : ""}
      </p>

      {/* QR Code */}
      <div style={{
        background: template.style === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
        borderRadius: isPreview ? 8 : 14,
        padding: isPreview ? 8 : 14,
        marginBottom: isPreview ? 10 : 18,
        border: template.style === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.06)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt="QR koda"
          style={{
            display: "block",
            width: isPreview ? 64 : 140,
            height: isPreview ? 64 : 140,
            imageRendering: "pixelated",
          }}
        />
      </div>

      {/* CTA */}
      <p style={{
        color: c.accent,
        fontSize: isPreview ? 6.5 : 11,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: isPreview ? 4 : 8,
      }}>
        {cta}
      </p>

      {/* URL hint */}
      <p style={{
        color: c.sub,
        fontSize: isPreview ? 5.5 : 9,
        opacity: 0.7,
        fontFamily: "monospace",
      }}>
        {albumUrl}
      </p>

      {/* Bottom divider */}
      <div style={{ width: isPreview ? 32 : 52, height: 1, background: c.divider, opacity: 0.6, marginTop: isPreview ? 10 : 18 }} />
    </div>
  );

  if (isPreview) return card;

  // In print mode the parent grid cell is exactly 105mm × 148.5mm.
  // Fill it completely — no fixed width/height here.
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "stretch" }}>
      {card}
    </div>
  );
}

export function PrintPageClient({ slug, coupleName, weddingDate, location, qrUrl, albumUrl, plan, customText }: Props) {
  const [selected, setSelected] = useState(TEMPLATES[0]);

  const isPremium = plan === "premium";
  const [customHeadline, setCustomHeadline] = useState(customText.headline);
  const [customSubtitle, setCustomSubtitle] = useState(customText.subtitle);
  const [customCta, setCustomCta] = useState(customText.cta);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Effective card text — custom value if set, otherwise the template default
  const effHeadline = customHeadline.trim() || selected.headline;
  const effSub = customSubtitle.trim() || selected.sub;
  const effCta = customCta.trim() || selected.cta;

  async function handleSaveText() {
    setSaving(true);
    setSaved(false);
    const res = await updateCardText(slug, {
      headline: customHeadline,
      subtitle: customSubtitle,
      cta: customCta,
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F6FB" }}>
      {/* Screen nav */}
      <nav className="no-print bg-white border-b sticky top-0 z-40" style={{ borderColor: "rgba(30,58,138,0.15)" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/${slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0F1729] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Nazaj
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block">Predloga: <strong className="text-[#0F1729]">{selected.name}</strong></span>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2 text-white text-sm font-bold rounded-xl hover:brightness-95"
              style={{ background: "#1E3A8A" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Natisni / Shrani PDF
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="no-print max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-light text-[#0F1729] mb-1">{coupleName}</h1>
          <p className="text-sm text-gray-400">
            {weddingDate}{location ? ` · ${location}` : ""} — Predloge za tisk
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Template selector */}
          <div className="lg:w-80 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Izberi predlogo</h2>
            <div className="space-y-2">
              {TEMPLATES.map((tmpl) => {
                const c = getColors(tmpl.style);
                const isActive = selected.id === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelected(tmpl)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left"
                    style={{
                      background: isActive ? "white" : "transparent",
                      border: isActive ? "1.5px solid rgba(30,58,138,0.4)" : "1.5px solid transparent",
                    }}
                  >
                    {/* Mini preview swatch */}
                    <div
                      className="w-12 h-16 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ background: c.bg, border: c.border || "1px solid #eee" }}
                    >
                      <span style={{ fontSize: 20 }}>{tmpl.emoji}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0F1729]">{tmpl.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tmpl.headline}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1E3A8A" }}>
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Card text editor — Premium only */}
            {isPremium ? (
              <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-[#0F1729] mb-1">✏️ Besedilo na kartici</p>
                <p className="text-[11px] text-gray-400 mb-3">
                  Prilagodite besedilo. Pustite prazno za privzeto besedilo predloge.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Naslov</label>
                    <input
                      value={customHeadline}
                      onChange={(e) => setCustomHeadline(e.target.value)}
                      placeholder={selected.headline}
                      maxLength={200}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#0F1729] outline-none transition-colors focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Podnaslov</label>
                    <input
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      placeholder={selected.sub}
                      maxLength={200}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#0F1729] outline-none transition-colors focus:border-[#1E3A8A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Poziv (CTA)</label>
                    <input
                      value={customCta}
                      onChange={(e) => setCustomCta(e.target.value)}
                      placeholder={selected.cta}
                      maxLength={200}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#0F1729] outline-none transition-colors focus:border-[#1E3A8A]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveText}
                  disabled={saving}
                  className="mt-3 w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60 hover:brightness-95"
                  style={{ background: "#1E3A8A" }}
                >
                  {saving ? "Shranjujem…" : saved ? "Shranjeno ✓" : "Shrani besedilo"}
                </button>
              </div>
            ) : (
              <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3.5 h-3.5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-xs font-bold text-[#0F1729]">Lasten napis na kartici</p>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  Uredite naslov, podnaslov in poziv na kartici. Na voljo v paketu{" "}
                  <strong className="text-[#0F1729]">Premium</strong>.
                </p>
                <Link
                  href={`/dashboard/${slug}/upgrade`}
                  className="block text-center py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-95"
                  style={{ background: "#1E3A8A" }}
                >
                  Nadgradi na Premium
                </Link>
              </div>
            )}

            {/* Print tip */}
            <div className="mt-6 bg-white rounded-2xl p-4 border" style={{ borderColor: "rgba(30,58,138,0.15)" }}>
              <p className="text-xs font-bold text-[#0F1729] mb-2">💡 Nasveti za tisk</p>
              <ul className="text-xs text-gray-500 space-y-1.5">
                <li>→ Natisnite na debel papir (200g+)</li>
                <li>→ Razrežite na 4 kartice (A4 → 4× A6)</li>
                <li>→ Postavite v stojalo na mizo</li>
                <li>→ QR koda deluje brez aplikacije</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Live preview */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Predogled</h2>
            <div className="bg-white rounded-3xl p-6 border flex items-center justify-center" style={{ borderColor: "rgba(30,58,138,0.15)" }}>
              {/* True-to-print A4 sheet — the real 210×297 mm / 4×A6 grid,
                  uniformly scaled down to fit the preview column. */}
              <div
                style={{ width: 600, height: 849, maxWidth: "100%", position: "relative", overflow: "hidden", borderRadius: 6 }}
                className="shadow-sm"
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "210mm",
                    height: "297mm",
                    background: "#fff",
                    transform: "scale(0.756)",
                    transformOrigin: "top left",
                    display: "grid",
                    gridTemplateColumns: "105mm 105mm",
                    gridTemplateRows: "148.5mm 148.5mm",
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "105mm",
                        height: "148.5mm",
                        overflow: "hidden",
                        borderRight: i % 2 === 0 ? "1px dashed rgba(0,0,0,0.15)" : "none",
                        borderBottom: i < 2 ? "1px dashed rgba(0,0,0,0.15)" : "none",
                      }}
                    >
                      <TableCard
                        template={selected}
                        headline={effHeadline}
                        sub={effSub}
                        cta={effCta}
                        coupleName={coupleName}
                        weddingDate={weddingDate}
                        location={location}
                        qrUrl={qrUrl}
                        albumUrl={albumUrl}
                        size="full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              4 kartice na A4 list · razrežite po tisku
            </p>
          </div>
        </div>
      </main>

      {/* PRINT OUTPUT — exactly one A4 page, 4 × A6 cards */}
      <div className="print-only">
        <div
          style={{
            width: "210mm",
            height: "297mm",
            display: "grid",
            /* Two A6 columns: 105mm each */
            gridTemplateColumns: "105mm 105mm",
            /* Two A6 rows: 148.5mm each */
            gridTemplateRows: "148.5mm 148.5mm",
            gap: 0,
            padding: 0,
            margin: 0,
            boxSizing: "border-box",
            overflow: "hidden",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "105mm",
                height: "148.5mm",
                boxSizing: "border-box",
                overflow: "hidden",
                position: "relative",
                /* Dashed cut guides */
                borderRight:  i % 2 === 0 ? "1px dashed rgba(0,0,0,0.18)" : "none",
                borderBottom: i < 2       ? "1px dashed rgba(0,0,0,0.18)" : "none",
              }}
            >
              <TableCard
                template={selected}
                headline={effHeadline}
                sub={effSub}
                cta={effCta}
                coupleName={coupleName}
                weddingDate={weddingDate}
                location={location}
                qrUrl={qrUrl}
                albumUrl={albumUrl}
                size="full"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media screen {
          .print-only { display: none !important; }
        }
        @media print {
          .no-print  { display: none !important; }
          .print-only { display: block !important; }

          /* Reset every possible source of extra space */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            background: white !important;
            overflow: hidden !important;
          }

          /* Exact A4, zero browser margins */
          @page {
            size: 210mm 297mm;
            margin: 0mm;
          }
        }
      `}</style>
    </div>
  );
}
