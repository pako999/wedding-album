"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createAlbum } from "@/app/actions/create-album";

type EventType = {
  id: string;
  emoji: string;
  label: string;
  nameLabel: string;
  namePlaceholder: string;
  dateLabel: string;
};

const EVENT_TYPES: EventType[] = [
  { id: "wedding",     emoji: "💍", label: "Poroka",      nameLabel: "Ime para",      namePlaceholder: "npr. Ana & Marko",       dateLabel: "Datum poroke"       },
  { id: "birthday",    emoji: "🎂", label: "Rojstni dan", nameLabel: "Ime",           namePlaceholder: "npr. Janko, 50 let",     dateLabel: "Datum rojstnega dne"},
  { id: "anniversary", emoji: "💑", label: "Obletnica",   nameLabel: "Ime para",      namePlaceholder: "npr. Ana & Marko",       dateLabel: "Datum obletnice"    },
  { id: "party",       emoji: "🎉", label: "Zabava",      nameLabel: "Ime zabave",    namePlaceholder: "npr. Novoletna zabava",  dateLabel: "Datum zabave"       },
  { id: "baptism",     emoji: "👶", label: "Krst",        nameLabel: "Ime otroka",    namePlaceholder: "npr. Mali Luka",         dateLabel: "Datum krsta"        },
  { id: "graduation",  emoji: "🎓", label: "Diploma/Matura", nameLabel: "Ime",      namePlaceholder: "npr. Sara, diplomirala", dateLabel: "Datum zagovora"     },
  { id: "baby_shower", emoji: "👶", label: "Baby Shower", nameLabel: "Ime",           namePlaceholder: "npr. Ana",               dateLabel: "Datum baby showerja"},
  { id: "business",    emoji: "💼", label: "Poslovni dogodek", nameLabel: "Ime dogodka", namePlaceholder: "npr. Letna konferenca 2026", dateLabel: "Datum dogodka" },
  { id: "other",       emoji: "📸", label: "Drugo",       nameLabel: "Ime dogodka",   namePlaceholder: "npr. Ekskurzija 2025",   dateLabel: "Datum dogodka"      },
];

// ── Event category icons — clean line icons in the brand gold ────────────────
const EVENT_ICON_PATHS: Record<string, ReactNode> = {
  // Solitaire ring — band + diamond
  wedding: (
    <>
      <path d="M9 4.5h6l2 2.8-5 3.2-5-3.2z" />
      <path d="M9 4.5l3 2.7 3-2.7M7 7.3h10" />
      <circle cx="12" cy="15.5" r="5.7" />
    </>
  ),
  // Cake with a candle
  birthday: (
    <>
      <rect x="4.5" y="12.5" width="15" height="8" rx="1.6" />
      <path d="M4.5 15.6h15" />
      <path d="M12 12.5V8" />
      <path d="M12 4.6c1.3 1.4 1.3 2.7 0 3.4-1.3-.7-1.3-2 0-3.4z" />
    </>
  ),
  // Two hearts
  anniversary: (
    <>
      <path d="M11 19.4C7.2 17 5 14.1 5 11.4A3.3 3.3 0 0 1 11 9.6 3.3 3.3 0 0 1 17 11.4C17 14.1 14.8 17 11 19.4Z" />
      <path d="M17.6 9.1c-1.7-1.1-2.7-2.3-2.7-3.4a1.35 1.35 0 0 1 2.7-.6 1.35 1.35 0 0 1 2.7.6c0 1.1-1 2.3-2.7 3.4z" />
    </>
  ),
  // Balloons
  party: (
    <>
      <ellipse cx="9.3" cy="8" rx="3.9" ry="4.8" />
      <ellipse cx="15.6" cy="10.6" rx="3.2" ry="4" />
      <path d="M9.3 12.8c0 1.7-1.1 2.2-.7 4M15.6 14.6c0 1.5.9 1.9.5 3.3" />
    </>
  ),
  // Candle
  baptism: (
    <>
      <rect x="9" y="9" width="6" height="11.5" rx="1.1" />
      <path d="M9 12.4h6" />
      <path d="M12 9V6" />
      <path d="M12 2.6c1.6 1.9 1.6 3.4 0 4.3-1.6-.9-1.6-2.4 0-4.3z" />
    </>
  ),
  // Graduation cap
  graduation: (
    <>
      <path d="M12 4 22 8.4 12 12.8 2 8.4Z" />
      <path d="M6 10.4v4.2c0 1.6 2.7 2.9 6 2.9s6-1.3 6-2.9v-4.2" />
      <path d="M22 8.4v6.2" />
      <circle cx="22" cy="15.6" r="1.05" />
    </>
  ),
  // Baby bottle
  baby_shower: (
    <>
      <rect x="9.5" y="3.4" width="5" height="2" rx="0.8" />
      <path d="M8.7 7.5h6.6l-.5-2.1H9.2z" />
      <rect x="8.3" y="7.5" width="7.4" height="13.1" rx="2.6" />
      <path d="M8.3 11.6h4.4M8.3 14.6h4.4" />
    </>
  ),
  // Briefcase
  business: (
    <>
      <rect x="3" y="7.6" width="18" height="12.4" rx="2.4" />
      <path d="M9 7.6V6.3A2 2 0 0 1 11 4.3h2A2 2 0 0 1 15 6.3v1.3" />
      <path d="M3 13.2h18" />
      <rect x="10.4" y="11.7" width="3.2" height="3" rx="0.7" />
    </>
  ),
  // Camera
  other: (
    <>
      <path d="M7.2 6.2 8 4.8a1.6 1.6 0 0 1 1.4-.8h5.2a1.6 1.6 0 0 1 1.4.8l.8 1.4" />
      <rect x="3" y="6.2" width="18" height="13.4" rx="2.6" />
      <circle cx="12" cy="12.9" r="3.6" />
    </>
  ),
};

function EventIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {EVENT_ICON_PATHS[id] ?? EVENT_ICON_PATHS.other}
    </svg>
  );
}

type PaidPlanId = "basic" | "plus" | "premium";

export function CreateEventWizard({ initialPlan }: { initialPlan?: PaidPlanId } = {}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const eventInfo = selectedType ?? EVENT_TYPES[0];

  function handleTypeSelect(et: EventType) {
    setSelectedType(et);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createAlbum(fd);
      } catch (err: unknown) {
        // redirect() throws NEXT_REDIRECT — Next.js handles navigation, ignore it
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("NEXT_REDIRECT") || msg.includes("redirect")) return;
        setError("Napaka pri ustvarjanju galerije. Preverite povezavo in poskusite znova.");
        console.error("[createAlbum]", err);
      }
    });
  }

  /* ── Step 1: Choose event type ───────────────────────────────────────── */
  if (step === 1) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,201,77,0.10)" }}>
              <span className="text-xl">📸</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F1729]">Nova galerija</h1>
              <p className="text-xs text-gray-400">Korak 1 od 2 · Izberi vrsto dogodka</p>
            </div>
          </div>
        </div>

        {/* Event type grid */}
        <div className="p-8">
          <p className="text-sm text-gray-500 mb-5">Za kakšen dogodek ustvarjaš galerijo?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EVENT_TYPES.map((et) => (
              <button
                key={et.id}
                onClick={() => handleTypeSelect(et)}
                className="group flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-150 hover:shadow-md text-center"
                style={{ borderColor: "rgba(255,201,77,0.2)", background: "rgba(255,201,77,0.03)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#C9820A";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,201,77,0.07)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,201,77,0.2)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,201,77,0.03)";
                }}
              >
                <span className="group-hover:scale-110 transition-transform" style={{ color: "#C9820A" }}>
                  <EventIcon id={et.id} className="w-9 h-9" />
                </span>
                <span className="text-sm font-semibold text-[#0F1729]">{et.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2: Event details ───────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,201,77,0.10)", color: "#C9820A" }}>
            <EventIcon id={eventInfo.id} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F1729]">{eventInfo.label}</h1>
            <p className="text-xs text-gray-400">Korak 2 od 2 · Podatki o dogodku</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
        {/* Hidden event type + pre-selected plan (when arriving from a pricing card) */}
        <input type="hidden" name="eventType" value={eventInfo.id} />
        {initialPlan ? <input type="hidden" name="plan" value={initialPlan} /> : null}

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-[#0F1729] mb-2">
            {eventInfo.nameLabel} <span style={{ color: "#C9820A" }}>*</span>
          </label>
          <input
            name="coupleName"
            required
            placeholder={eventInfo.namePlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0F1729] text-sm outline-none transition-all focus:border-[#C9820A]"
            style={{ boxShadow: "0 0 0 0px rgba(255,201,77,0)" }}
            onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(255,201,77,0.15)")}
            onBlur={e => (e.target.style.boxShadow = "0 0 0 0px rgba(255,201,77,0)")}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-[#0F1729] mb-2">
            {eventInfo.dateLabel} <span style={{ color: "#C9820A" }}>*</span>
          </label>
          <input
            type="date"
            name="eventDate"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0F1729] text-sm outline-none transition-all focus:border-[#C9820A]"
            onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(255,201,77,0.15)")}
            onBlur={e => (e.target.style.boxShadow = "0 0 0 0px rgba(255,201,77,0)")}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-[#0F1729] mb-2">
            Lokacija <span className="text-gray-400 font-normal">(neobvezno)</span>
          </label>
          <input
            name="location"
            placeholder="npr. Grad Bogenšperk, Ljubljana"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#0F1729] text-sm outline-none transition-all focus:border-[#C9820A]"
            onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(255,201,77,0.15)")}
            onBlur={e => (e.target.style.boxShadow = "0 0 0 0px rgba(255,201,77,0)")}
          />
        </div>

        {/* Info strip */}
        <div className="rounded-2xl p-4 flex items-start gap-3 text-sm" style={{ background: "rgba(255,201,77,0.06)", border: "1px solid rgba(255,201,77,0.15)" }}>
          <span className="shrink-0" style={{ color: "#C9820A" }}>✨</span>
          <p className="text-gray-500 leading-relaxed">
            Galerija se ustvari z <strong className="text-[#0F1729]">brezplačnim</strong> paketom (do 20 fotografij).
            Nadgradnjo na Plus ali Premium lahko opravite kadarkoli.
          </p>
        </div>

        {/* Privacy agreement — required before submitting */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="privacyAgreed"
            required
            className="mt-0.5 shrink-0 w-4 h-4 rounded border-gray-300 accent-[#C9820A]"
          />
          <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
            Potrjujem, da bom goste in udeležence dogodka obvestil/a o uporabi Guestcam galerije,
            zagotovil/a ustrezno pravno podlago za obdelavo fotografij in videov ter odgovarjal/a
            na zahteve udeležencev v zvezi z vsebino galerije.{" "}
            <a href="/gdpr" target="_blank" rel="noopener noreferrer" className="underline text-[#C9820A]">
              Politika zasebnosti →
            </a>
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 hover:text-[#0F1729] transition-all"
          >
            ← Nazaj
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 disabled:opacity-60 hover:brightness-95"
            style={{ background: "#FFC94D" }}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ustvarjam...
              </span>
            ) : (
              "Ustvari galerijo →"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
