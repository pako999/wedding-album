"use client";

import { useState, useTransition } from "react";

/**
 * Admin control for the Black Friday email campaign. Same-origin fetches carry
 * the admin's session + cookie automatically, so no console needed.
 *
 *   Preview  → GET  (dry run: counts only, sends nothing)
 *   Test     → POST ?test=<email>&lang=<lang>  (one email)
 *   Send all → POST ?confirm=SEND              (throttled, resumable)
 */

const ENDPOINT = "/api/admin/blackfriday-blast";
const LANGS = ["sl", "hr", "sr", "de", "en", "es"] as const;

type Result = { ok: boolean; text: string };

export function BlackFridayBlastPanel({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [lang, setLang] = useState<(typeof LANGS)[number]>("sl");
  const [busy, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);

  const call = (url: string, confirmMsg?: string) => {
    if (confirmMsg && typeof window !== "undefined" && !window.confirm(confirmMsg)) return;
    setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch(url, { method: url === `${ENDPOINT}` ? "GET" : "POST" });
        const json = await res.json().catch(() => ({}));
        setResult({ ok: res.ok && json.ok !== false, text: JSON.stringify(json, null, 2) });
      } catch (err) {
        setResult({ ok: false, text: String(err) });
      }
    });
  };

  const preview = () => call(ENDPOINT); // GET dry run
  const sendTest = () => {
    const to = email.trim().toLowerCase();
    if (!to) { setResult({ ok: false, text: "Vnesite e-naslov za test." }); return; }
    call(`${ENDPOINT}?test=${encodeURIComponent(to)}&lang=${lang}`, `Pošljem test na ${to}?`);
  };
  const sendAll = () =>
    call(
      `${ENDPOINT}?confirm=SEND`,
      "POZOR: pošlje Black Friday e-mail VSEM registriranim uporabnikom. Nadaljujem?",
    );

  return (
    <section className="rounded-2xl border border-[#FFE08A] bg-[#FFFCF2] p-5">
      <h2 className="text-sm font-bold text-[#0F1729]">🖤 Black Friday kampanja</h2>
      <p className="mt-1 text-xs text-gray-500">
        Pošlje promocijski e-mail (−30 %, koda BLACKFRIDAY) registriranim uporabnikom, vsakemu v
        njegovem jeziku. Najprej <strong>Predogled</strong>, nato <strong>test nase</strong>, šele
        potem <strong>Pošlji vsem</strong>.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@email.si"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as (typeof LANGS)[number])}
          className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
        >
          {LANGS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={sendTest}
          disabled={busy}
          className="rounded-lg bg-[#0F1729] px-3 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          Pošlji test
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={preview}
          disabled={busy}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          👁 Predogled (nič ne pošlje)
        </button>
        <button
          type="button"
          onClick={sendAll}
          disabled={busy}
          className="rounded-lg bg-[#B91C1C] px-3 py-2 text-xs font-bold text-white hover:bg-[#991B1B] disabled:opacity-50"
        >
          ✉️ Pošlji VSEM
        </button>
        {busy && <span className="text-xs text-gray-400">Izvajam…</span>}
      </div>

      <p className="mt-2 text-[11px] text-gray-400">
        Pri velikem seznamu je »Pošlji vsem« omejen na paket naenkrat — če rezultat pokaže
        <code className="mx-1">hasMore: true</code>, znova klikni »Pošlji vsem« za nadaljevanje.
        Ponovni klik nikoli ne pošlje dvakrat istemu uporabniku.
      </p>

      {result && (
        <pre
          className={`mt-3 max-h-56 overflow-auto rounded-lg p-3 text-[11px] leading-relaxed ${
            result.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
          }`}
        >
          {result.text}
        </pre>
      )}
    </section>
  );
}
