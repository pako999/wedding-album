"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { weddingCopy } from "@/lib/wedding/copy";
import type { WeddingSettings } from "@/lib/wedding/contracts";
import { ScheduleView, MenuView, BingoView } from "./WeddingViews";

type PreviewTab = "schedule" | "menu" | "songs" | "bingo";

const COPY: Record<Lang, { live: string; phone: string; draft: string; disabled: string }> = {
  sl: { live: "Predogled v živo", phone: "Gostje · na telefonu", draft: "Spremembe vidiš takoj med urejanjem.", disabled: "Predogled · stran še ni vključena" },
  hr: { live: "Pregled uživo", phone: "Gosti · na mobitelu", draft: "Promjene vidiš odmah tijekom uređivanja.", disabled: "Pregled · stranica još nije uključena" },
  sr: { live: "Pregled uživo", phone: "Gosti · na telefonu", draft: "Promene vidiš odmah tokom uređivanja.", disabled: "Pregled · stranica još nije uključena" },
  en: { live: "Live preview", phone: "Guests · on mobile", draft: "See changes instantly while you edit.", disabled: "Preview · page is not enabled yet" },
  de: { live: "Live-Vorschau", phone: "Gäste · auf dem Handy", draft: "Änderungen erscheinen sofort in der Vorschau.", disabled: "Vorschau · Seite noch nicht aktiviert" },
  es: { live: "Vista previa en vivo", phone: "Invitados · en el móvil", draft: "Ve los cambios al instante mientras editas.", disabled: "Vista previa · página aún desactivada" },
};

export function WeddingSettingsLivePreview({ lang, data, name, eventDate }: {
  lang: Lang;
  data: WeddingSettings;
  name?: string | null;
  eventDate?: string | null;
}) {
  const t = weddingCopy(lang);
  const copy = COPY[lang];
  const [tab, setTab] = useState<PreviewTab>("schedule");
  const title = name?.trim() || t.sample;
  const formattedDate = eventDate
    ? new Intl.DateTimeFormat(lang, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${eventDate.slice(0, 10)}T12:00:00Z`))
    : "";

  const tabs: Array<{ id: PreviewTab; icon: string; label: string }> = [
    { id: "schedule", icon: "🗓️", label: t.schedule },
    { id: "menu", icon: "🍽️", label: t.menu },
    { id: "songs", icon: "🎵", label: t.songs },
    { id: "bingo", icon: "📷", label: t.bingo },
  ];

  return (
    <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
      <div className="mb-4 px-1">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#A34A78]">{copy.phone}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#111A55]">{copy.live}</h2>
        <p className="mt-1 text-sm leading-6 text-stone-500">{copy.draft}</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-[#fbf8f5] shadow-[0_18px_55px_rgba(33,29,24,.12)]">
        <header className="border-b border-stone-100 bg-white px-6 py-6 text-center sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#A56B7D]">GuestCam · {t.guest}</p>
          <h3 className="mt-2 break-words text-2xl font-black tracking-tight text-[#111A55]">{title}</h3>
          {formattedDate ? <p className="mt-1 text-xs text-stone-500">{formattedDate}</p> : null}
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">{t.subtitle}</p>
          {!data.enabled ? <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{copy.disabled}</span> : null}
        </header>

        <div className="min-h-[420px] p-4 sm:p-5">
          {tab === "schedule" ? <section><h4 className="mb-4 text-2xl font-semibold text-stone-900">{t.schedule}</h4><div className="rounded-2xl bg-white p-5 shadow-sm"><ScheduleView rows={data.schedule} lang={lang} /></div></section> : null}
          {tab === "menu" ? <section><h4 className="mb-4 text-2xl font-semibold text-stone-900">{t.menu}</h4><div className="rounded-2xl bg-white p-5 shadow-sm"><MenuView rows={data.menu} lang={lang} /></div></section> : null}
          {tab === "songs" ? <section><h4 className="mb-4 text-2xl font-semibold text-stone-900">{t.songs}</h4><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="mb-4 text-sm leading-6 text-stone-500">{t.songHint}</p>{data.requestsOpen ? <div className="space-y-3"><div className="h-11 rounded-xl border border-stone-200 bg-stone-50"/><div className="h-11 rounded-xl border border-stone-200 bg-stone-50"/><div className="h-11 w-32 rounded-xl bg-stone-900"/></div> : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{t.requestsPaused}</p>}</div></section> : null}
          {tab === "bingo" ? <section><h4 className="mb-4 text-2xl font-semibold text-stone-900">{t.bingo}</h4><div className="rounded-2xl bg-white p-4 shadow-sm"><BingoView rows={data.challenges} lang={lang} preview /></div></section> : null}
        </div>

        <nav className="grid grid-cols-4 border-t border-stone-200 bg-white" aria-label={copy.live}>
          {tabs.map((item) => {
            const active = tab === item.id;
            return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`min-w-0 px-1 py-3 text-center transition ${active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"}`} aria-pressed={active}><span className="block text-base" aria-hidden="true">{item.icon}</span><span className="mt-1 block truncate text-[10px] font-semibold sm:text-xs">{item.label}</span></button>;
          })}
        </nav>
      </div>
    </aside>
  );
}
