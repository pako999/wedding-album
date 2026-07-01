"use client";

import { useState } from "react";
import type { Affiliate, AffiliateCommission } from "@/lib/db/schema";

const APP_URL = typeof window !== "undefined" ? window.location.origin : "https://www.guestcam.si";

interface Props {
  affiliate: Affiliate;
  commissions: AffiliateCommission[];
  /** Server-rendered analytics block injected from the page. Lets us
   *  keep DashboardClient as a client component (for copy-to-clipboard
   *  etc.) while doing the heavy SQL aggregation on the server. */
  analytics?: React.ReactNode;
}

function fmtEur(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("sl-SI", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:   { label: "V čakanju", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  approved:  { label: "Potrjeno",  cls: "bg-green-50 text-green-700 border-green-200" },
  paid:      { label: "Izplačano", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  cancelled: { label: "Preklicano",cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

export function DashboardClient({ affiliate, commissions, analytics }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  // Route the visible "your link" through the tracker endpoint so each
  // share-click produces an affiliate_clicks row and bumps totalClicks.
  // The endpoint sets the cookie and redirects to "/" — same UX as the
  // direct ?ref= link, but with proper analytics.
  const refLink = `${APP_URL}/api/affiliate/track?ref=${affiliate.referralCode}&to=/`;

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9820A] mb-1.5">
            🤝 Partnerski program
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1729]">
            Pozdravljeni, {affiliate.name}!
          </h1>
        </div>

        {/* Referral code card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Vaša partnerska koda</p>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="font-mono text-2xl font-extrabold text-[#0F1729] tracking-[0.2em] bg-[#FFF9EC] border border-[#FFC94D]/30 px-4 py-2 rounded-xl">
              {affiliate.referralCode}
            </div>
            <button
              onClick={() => copy(affiliate.referralCode, "code")}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
            >
              {copied === "code" ? "Kopirano! ✓" : "Kopiraj kodo"}
            </button>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Vaša partnerska povezava</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-[#1E3A8A] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 truncate">
              {refLink}
            </code>
            <button
              onClick={() => copy(refLink, "link")}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors shrink-0"
            >
              {copied === "link" ? "Kopirano! ✓" : "Kopiraj povezavo"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Kliki", value: affiliate.totalClicks.toString() },
            { label: "Naročila", value: affiliate.totalConversions.toString() },
            { label: "V čakanju", value: fmtEur(affiliate.pendingBalanceCents) },
            { label: "Na voljo", value: fmtEur(affiliate.availableBalanceCents), highlight: true },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-5"
              style={s.highlight ? { background: "linear-gradient(135deg,#FFF9EC,#FFFBF0)", borderColor: "#FFC94D" } : {}}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">{s.label}</p>
              <p className="text-xl font-extrabold text-[#0F1729]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Commission rate + cookie days info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm mb-3">
            <div>
              <span className="text-gray-400 mr-2">Provizija:</span>
              <strong className="text-[#0F1729]">{affiliate.commissionRate}%</strong>
            </div>
            <div>
              <span className="text-gray-400 mr-2">Veljavnost piškotka:</span>
              <strong className="text-[#0F1729]">{affiliate.cookieDays} dni</strong>
            </div>
            <div>
              <span className="text-gray-400 mr-2">Skupni zaslužek:</span>
              <strong className="text-[#0F1729]">{fmtEur(affiliate.totalEarningsCents)}</strong>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
            <strong className="text-[#0F1729]">Kako deluje {affiliate.cookieDays}-dnevni piškotek:</strong>{" "}
            Ko nekdo klikne tvojo povezavo, se v njegovem brskalniku shrani piškotek za{" "}
            <strong>{affiliate.cookieDays} dni</strong>. Če v tem času opravi nakup —
            tudi če klikne danes in plača šele čez {Math.max(1, affiliate.cookieDays - 5)}{" "}
            dni — se provizija pripiše tebi.
          </p>
        </div>

        {/* 360 traffic analytics — server-rendered, see page.tsx */}
        {analytics && <div className="mb-6">{analytics}</div>}

        {/* Commission history */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-extrabold text-[#0F1729]">Zadnje provizije</h2>
          </div>
          {commissions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-gray-500">
                Še nimate provizij. Delite svojo partnersko kodo!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Datum</th>
                    <th className="px-6 py-3">Naročilo</th>
                    <th className="px-6 py-3 text-right">Provizija</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => {
                    const s = STATUS_LABEL[c.status] ?? { label: c.status, cls: "bg-gray-100 text-gray-500 border-gray-200" };
                    return (
                      <tr key={c.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-6 py-3 text-gray-500">{fmtDate(c.createdAt)}</td>
                        <td className="px-6 py-3 text-[#0F1729]">{c.orderDescription ?? "—"}</td>
                        <td className="px-6 py-3 text-right font-bold text-[#0F1729]">{fmtEur(c.commissionAmountCents)}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Za vprašanja nam pišite na <a href="mailto:partnerji@guestcam.si" className="underline">partnerji@guestcam.si</a>
        </p>
      </div>
    </div>
  );
}
