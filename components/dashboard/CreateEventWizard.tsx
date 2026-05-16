"use client";

import { useState, useTransition } from "react";
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
  { id: "other",       emoji: "📸", label: "Drugo",       nameLabel: "Ime dogodka",   namePlaceholder: "npr. Ekskurzija 2025",   dateLabel: "Datum dogodka"      },
];

export function CreateEventWizard() {
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
      <div className="bg-white rounded-3xl border border-[#C4738A]/15 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-7 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #FDF4F5, #FEF2F4)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(196,115,138,0.12)" }}>
              <span className="text-xl">📸</span>
            </div>
            <div>
              <h1 className="font-serif text-2xl font-light text-[#2C2825]">Nova galerija</h1>
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
                style={{ borderColor: "rgba(196,115,138,0.2)", background: "rgba(196,115,138,0.03)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#C4738A";
                  (e.currentTarget as HTMLElement).style.background = "rgba(196,115,138,0.07)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,115,138,0.2)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(196,115,138,0.03)";
                }}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{et.emoji}</span>
                <span className="text-sm font-semibold text-[#2C2825]">{et.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2: Event details ───────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-3xl border border-[#C4738A]/15 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-7 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #FDF4F5, #FEF2F4)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(196,115,138,0.12)" }}>
            {eventInfo.emoji}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-light text-[#2C2825]">{eventInfo.label}</h1>
            <p className="text-xs text-gray-400">Korak 2 od 2 · Podatki o dogodku</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
        {/* Hidden event type */}
        <input type="hidden" name="eventType" value={eventInfo.id} />

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-[#2C2825] mb-2">
            {eventInfo.nameLabel} <span style={{ color: "#C4738A" }}>*</span>
          </label>
          <input
            name="coupleName"
            required
            placeholder={eventInfo.namePlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none transition-all focus:border-[#C4738A]"
            style={{ boxShadow: "0 0 0 0px rgba(196,115,138,0)" }}
            onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(196,115,138,0.15)")}
            onBlur={e => (e.target.style.boxShadow = "0 0 0 0px rgba(196,115,138,0)")}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-[#2C2825] mb-2">
            {eventInfo.dateLabel} <span style={{ color: "#C4738A" }}>*</span>
          </label>
          <input
            type="date"
            name="eventDate"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none transition-all focus:border-[#C4738A]"
            onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(196,115,138,0.15)")}
            onBlur={e => (e.target.style.boxShadow = "0 0 0 0px rgba(196,115,138,0)")}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-[#2C2825] mb-2">
            Lokacija <span className="text-gray-400 font-normal">(neobvezno)</span>
          </label>
          <input
            name="location"
            placeholder="npr. Grad Bogenšperk, Ljubljana"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none transition-all focus:border-[#C4738A]"
            onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(196,115,138,0.15)")}
            onBlur={e => (e.target.style.boxShadow = "0 0 0 0px rgba(196,115,138,0)")}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#2C2825] mb-2">
            Geslo galerije <span className="text-gray-400 font-normal">(neobvezno)</span>
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <input
              name="password"
              type="text"
              placeholder="Pustite prazno za javni dostop"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none transition-all focus:border-[#C4738A]"
              onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(196,115,138,0.15)")}
              onBlur={e => (e.target.style.boxShadow = "0 0 0 0px rgba(196,115,138,0)")}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Gosti bodo morali vnesti geslo za ogled in dodajanje fotografij.</p>
        </div>

        {/* Info strip */}
        <div className="rounded-2xl p-4 flex items-start gap-3 text-sm" style={{ background: "rgba(196,115,138,0.06)", border: "1px solid rgba(196,115,138,0.15)" }}>
          <span className="shrink-0" style={{ color: "#C4738A" }}>✨</span>
          <p className="text-gray-500 leading-relaxed">
            Galerija se ustvari z <strong className="text-[#2C2825]">brezplačnim</strong> paketom (do 200 fotografij).
            Nadgradnjo na Plus ali Premium lahko opravite kadarkoli.
          </p>
        </div>

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
            className="px-5 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 hover:text-[#2C2825] transition-all"
          >
            ← Nazaj
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 disabled:opacity-60"
            style={{ background: "#C4738A", boxShadow: "0 6px 20px rgba(196,115,138,0.3)" }}
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
