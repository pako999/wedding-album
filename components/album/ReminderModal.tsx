"use client";

import { useState } from "react";
import { translations, type Lang } from "@/lib/i18n/translations";

interface Props {
  albumSlug: string;
  lang: Lang;
  accent: string;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BORDER = "#E5E7EB";
const DARK = "#111827";
const MUTED = "#6B7280";

export function ReminderModal({ albumSlug, lang, accent, onClose }: Props) {
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(60);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError(t.reminderInvalidEmail);
      return;
    }
    setError("");
    setStatus("sending");
    try {
      const res = await fetch(`/api/albums/${albumSlug}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, delayMinutes }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      setTimeout(onClose, 1800);
    } catch {
      setStatus("error");
      setError(t.reminderError);
    }
  };

  const sending = status === "sending";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-[#0F1729]/70 backdrop-blur-sm"
        onClick={!sending ? onClose : undefined}
      />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h2 className="font-serif text-xl font-light" style={{ color: DARK }}>
            {t.reminderTitle}
          </h2>
          <button
            onClick={onClose}
            disabled={sending}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-40"
            aria-label={t.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: MUTED }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <div className="px-6 pb-8 pt-2 text-center">
            <div
              className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
              style={{ background: `${accent}14` }}
            >
              ✅
            </div>
            <p className="text-sm font-medium" style={{ color: DARK }}>
              {t.reminderSuccess}
            </p>
          </div>
        ) : (
          <div className="px-6 pb-6 pt-1">
            <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>
              {t.reminderDesc}
            </p>

            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !sending && submit()}
              placeholder={t.reminderEmailPlaceholder}
              autoComplete="email"
              disabled={sending}
              className="w-full px-4 py-3 border rounded-2xl text-sm outline-none transition-all mb-3 disabled:opacity-50"
              style={{ borderColor: BORDER }}
            />

            {/* When to send */}
            <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>
              {t.reminderWhenLabel}
            </label>
            <select
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              disabled={sending}
              className="w-full px-4 py-3 border rounded-2xl text-sm outline-none transition-all mb-4 bg-white disabled:opacity-50"
              style={{ borderColor: BORDER, color: DARK }}
            >
              <option value={0}>{t.reminderWhenNow}</option>
              <option value={60}>{t.reminderWhen1h}</option>
              <option value={1440}>{t.reminderWhenTomorrow}</option>
              <option value={4320}>{t.reminderWhen3d}</option>
            </select>

            {error && (
              <p className="text-xs mb-3" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={sending}
                className="text-sm transition-colors disabled:opacity-40"
                style={{ color: MUTED }}
              >
                {t.cancel}
              </button>
              <button
                onClick={submit}
                disabled={sending}
                className="px-6 py-2.5 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-40 hover:brightness-95"
                style={{ background: accent }}
              >
                {sending ? t.reminderSending : t.reminderSend}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
