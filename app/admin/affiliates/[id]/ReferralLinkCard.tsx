"use client";

import { useState, useTransition } from "react";

interface Props {
  affiliateId: string;
  referralCode: string;
  status: string;
  approvedAt: string | null;
}

export function ReferralLinkCard({ affiliateId, referralCode, status, approvedAt }: Props) {
  const referralLink = `https://guestcam.si/api/affiliate/track?ref=${referralCode}&to=/`;
  const cleanShareLink = `https://guestcam.si?ref=${referralCode}`;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resending, startResend] = useTransition();

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const resendWelcome = () => {
    setResendMsg(null);
    startResend(async () => {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/resend-welcome`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      setResendMsg(res.ok ? "✓ E-pošta poslana" : (json.error ?? "Napaka"));
      setTimeout(() => setResendMsg(null), 4000);
    });
  };

  const formattedApproved = approvedAt
    ? new Date(approvedAt).toLocaleString("sl-SI")
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-bold text-[#0F1729]">🔗 Partnerska povezava</h2>
        <button
          onClick={resendWelcome}
          disabled={resending || status !== "active"}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-[#FFF9EC] hover:border-[#FFC94D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={status !== "active" ? "Najprej potrdi partnerja" : "Ponovno pošlji partnerju email z linkom"}
        >
          {resending ? "Pošiljanje…" : "Ponovno pošlji email"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        {formattedApproved
          ? `Welcome email avtomatsko poslan ob potrditvi: ${formattedApproved}. Pod gumbom »Ponovno pošlji email« lahko pošljete znova, če je prvi šel v spam ali se ga partner ne spomni.`
          : "Welcome email s partnerskim linkom se pošlje, ko partnerja potrdiš."}
      </p>

      {resendMsg && (
        <p className="text-xs text-[#C9820A] mb-3">{resendMsg}</p>
      )}

      {/* Clean share link — what partner posts on Instagram bio etc. */}
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
          Povezava za deljenje (Instagram, TikTok, bio)
        </p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
          <code className="flex-1 font-mono text-xs text-[#1E3A8A] truncate">{cleanShareLink}</code>
          <button
            onClick={() => copy(cleanShareLink, "clean")}
            className="shrink-0 text-xs font-semibold text-[#C9820A] hover:text-[#0F1729] transition-colors"
          >
            {copiedKey === "clean" ? "✓" : "Kopiraj"}
          </button>
        </div>
      </div>

      {/* Full tracker link */}
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
          Polna sledilna povezava
        </p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
          <code className="flex-1 font-mono text-xs text-[#1E3A8A] truncate">{referralLink}</code>
          <button
            onClick={() => copy(referralLink, "full")}
            className="shrink-0 text-xs font-semibold text-[#C9820A] hover:text-[#0F1729] transition-colors"
          >
            {copiedKey === "full" ? "✓" : "Kopiraj"}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        Vsak klik na katero koli različico se beleži v partnerski dashboard. Piškotek
        ostane 30 dni, tako da se naročilo še vedno pripiše partnerju, tudi če stranka
        nakup dokonča kasneje.
      </p>
    </div>
  );
}
