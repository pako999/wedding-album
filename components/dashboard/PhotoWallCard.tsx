"use client";

/**
 * PhotoWallCard — dashboard control panel for the TV-facing Photo Wall.
 *
 * Every option is encoded into the wall URL rather than persisted to the
 * database. That's deliberate: the owner can retune the screen mid-event
 * (or undo a change) just by opening a different link, the configured
 * link is shareable/bookmarkable, and adding a new option later needs no
 * schema migration. The link is regenerated live as the toggles change.
 */

import { useState } from "react";

interface Props {
  /** Base wall URL, no query string — e.g. https://…/wall/<token>. */
  wallUrl: string;
  /** Whether the album is password-protected (needs ?pw= on the link). */
  hasPassword: boolean;
  /** Album slug, for deep-linking to the moderation queue. */
  albumSlug: string;
  /** Whether photos need approval before they appear anywhere public. */
  moderationEnabled: boolean;
  /** How many photos are currently awaiting approval. */
  pendingCount: number;
}

const DEFAULT_SECONDS = 6;

const BACKGROUNDS = [
  { id: "photo", label: "Fotografija", swatch: "linear-gradient(135deg,#1f2937,#0F1729)" },
  { id: "dark",  label: "Temna",       swatch: "#0F1729" },
  { id: "light", label: "Svetla",      swatch: "#F2F4F8" },
  { id: "warm",  label: "Kremna",      swatch: "#FFF9EC" },
] as const;

const TRANSITIONS = [
  { id: "fade",     label: "Zatemnitev" },
  { id: "slide",    label: "Podrsaj" },
  { id: "kenburns", label: "Počasen zoom" },
] as const;

const ORIENTATIONS = [
  { id: "auto",      label: "Samodejno" },
  { id: "landscape", label: "Ležeče" },
  { id: "portrait",  label: "Pokončno" },
] as const;

export function PhotoWallCard({ wallUrl, hasPassword, albumSlug, moderationEnabled, pendingCount }: Props) {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);
  const [showSides, setShowSides] = useState(true);
  const [showQr, setShowQr] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showBrand, setShowBrand] = useState(true);
  const [pw, setPw] = useState("");
  const [copied, setCopied] = useState(false);
  const [background, setBackground] = useState<string>("photo");
  const [transition, setTransition] = useState<string>("fade");
  const [orientation, setOrientation] = useState<string>("auto");

  const params = new URLSearchParams();
  if (seconds !== DEFAULT_SECONDS) params.set("dur", String(seconds));
  if (!showSides) params.set("sides", "0");
  if (!showQr) params.set("qr", "0");
  if (!showNames) params.set("names", "0");
  if (!showTitle) params.set("title", "0");
  if (!showBrand) params.set("brand", "0");
  if (background !== "photo") params.set("bg", background);
  if (transition !== "fade") params.set("fx", transition);
  if (orientation !== "auto") params.set("orient", orientation);
  if (pw.trim()) params.set("pw", pw.trim());
  const qs = params.toString();
  const finalUrl = qs ? `${wallUrl}?${qs}` : wallUrl;

  const copy = () => {
    navigator.clipboard.writeText(finalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggles: { label: string; desc: string; on: boolean; set: (v: boolean) => void }[] = [
    { label: "Stranske fotografije", desc: "Manjše slike, ki priletijo ob straneh.", on: showSides, set: setShowSides },
    { label: "QR koda",              desc: "Gostje lahko skenirajo in dodajo slike.", on: showQr,    set: setShowQr },
    { label: "Imena gostov",         desc: "Kdo je naložil fotografijo.",             on: showNames, set: setShowNames },
    { label: "Naziv dogodka",        desc: "Ime dogodka v zgornjem kotu.",            on: showTitle, set: setShowTitle },
    { label: "Guestcam oznaka",      desc: "»Powered by guestcam.si« v kotu.",        on: showBrand, set: setShowBrand },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">📺 Foto stena</h3>
        <p className="text-xs text-gray-400 mt-0.5 max-w-lg">
          Ločena povezava od vaše galerije — varna za prikaz na skupnem zaslonu. Odprite jo na TV-ju,
          tablici ali projektorju in jo pustite predvajati. Nove fotografije priletijo ob strani, nato se
          premešajo med ostale — brez da bi kdo pri zaslonu karkoli naredil.
        </p>
      </div>

      {/* Moderation warning. Without this the owner sets up the TV, sees
          nothing appear all night, and has no idea why — every upload is
          sitting in the approval queue. */}
      {moderationEnabled && (
        <div
          className="mb-4 flex items-start gap-3 rounded-xl border p-3.5"
          style={{ background: "#FFF9EC", borderColor: "#FFC94D" }}
        >
          <span className="text-lg shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#92600A" }}>
              Moderacija je vklopljena
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#92600A" }}>
              Fotografije se na steni prikažejo šele, ko jih potrdite — dokler jih ne odobrite, zaslon ostane prazen.
              {pendingCount > 0
                ? ` Trenutno čaka ${pendingCount} ${pendingCount === 1 ? "fotografija" : "fotografij"}.`
                : " Med dogodkom jih boste morali sproti potrjevati."}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {pendingCount > 0 && (
                <a
                  href={`/dashboard/${albumSlug}?tab=pending`}
                  className="text-xs font-semibold underline"
                  style={{ color: "#92600A" }}
                >
                  Poglej čakajoče →
                </a>
              )}
              <a
                href={`/dashboard/${albumSlug}?tab=settings`}
                className="text-xs font-semibold underline"
                style={{ color: "#92600A" }}
              >
                Izklopi moderacijo v nastavitvah →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Slide duration */}
      <div className="flex items-center justify-between gap-4 py-3 border-t border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-700">Trajanje fotografije</p>
          <p className="text-xs text-gray-400">Kako dolgo je vsaka slika na sredini.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={2}
            max={120}
            value={seconds}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              setSeconds(Number.isFinite(n) ? Math.min(120, Math.max(2, n)) : DEFAULT_SECONDS);
            }}
            className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 text-center outline-none focus:border-[#FFC94D]"
          />
          <span className="text-xs text-gray-400">sekund</span>
        </div>
      </div>

      {/* Background */}
      <div className="py-3 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700">Ozadje</p>
        <p className="text-xs text-gray-400 mb-2.5">
          Privzeto zamegljena trenutna fotografija; ravne barve so mirnejše na velikem zaslonu.
        </p>
        <div className="flex flex-wrap gap-2">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBackground(b.id)}
              aria-pressed={background === b.id}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{
                borderColor: background === b.id ? "#FFC94D" : "#e5e7eb",
                background: background === b.id ? "#FFF9EC" : "white",
                color: "#374151",
              }}
            >
              <span
                className="w-5 h-5 rounded border border-gray-200 shrink-0"
                style={{ background: b.swatch }}
              />
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transition */}
      <div className="py-3 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700">Prehod</p>
        <p className="text-xs text-gray-400 mb-2.5">Kako se menjajo fotografije na sredini.</p>
        <div className="flex flex-wrap gap-2">
          {TRANSITIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTransition(t.id)}
              aria-pressed={transition === t.id}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{
                borderColor: transition === t.id ? "#FFC94D" : "#e5e7eb",
                background: transition === t.id ? "#FFF9EC" : "white",
                color: "#374151",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div className="py-3 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700">Postavitev zaslona</p>
        <p className="text-xs text-gray-400 mb-2.5">
          Samodejno se prilagodi zaslonu. Pokončno je za navpične zaslone in toteme.
        </p>
        <div className="flex flex-wrap gap-2">
          {ORIENTATIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setOrientation(o.id)}
              aria-pressed={orientation === o.id}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{
                borderColor: orientation === o.id ? "#FFC94D" : "#e5e7eb",
                background: orientation === o.id ? "#FFF9EC" : "white",
                color: "#374151",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      {toggles.map((t) => (
        <div key={t.label} className="flex items-center justify-between gap-4 py-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">{t.label}</p>
            <p className="text-xs text-gray-400">{t.desc}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={t.on}
            aria-label={t.label}
            onClick={() => t.set(!t.on)}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${t.on ? "bg-[#FFC94D]" : "bg-gray-200"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${t.on ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      ))}

      {/* Password — only relevant when the gallery actually has one */}
      {hasPassword && (
        <div className="py-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700">Geslo galerije</p>
          <p className="text-xs text-gray-400 mb-2">
            Galerija je zaščitena — vpišite geslo, da ga vgradimo v povezavo (na TV-ju ga ni mogoče vnesti).
          </p>
          <input
            type="text"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Geslo galerije"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#FFC94D]"
          />
        </div>
      )}

      {/* Generated link */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg truncate">
            {finalUrl}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-all"
              style={
                copied
                  ? { background: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
                  : { background: "white", borderColor: "#e5e7eb", color: "#4b5563" }
              }
            >
              {copied ? "Kopirano!" : "Kopiraj povezavo"}
            </button>
            <a
              href={finalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-[#0F1729] transition-all hover:brightness-95"
              style={{ background: "#FFC94D" }}
            >
              Odpri →
            </a>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Nastavitve so shranjene v sami povezavi — kopirajte to povezavo na napravo, kjer bo stena tekla.
        </p>
      </div>
    </div>
  );
}
