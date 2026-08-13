"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useId } from "react";

declare global {
  interface Window {
    turnstile?: {
      render(el: string | HTMLElement, opts: { sitekey: string; callback?: (token: string) => void; theme?: "light" | "dark" | "auto" }): string;
      reset(widgetId?: string): void;
    };
  }
}

interface Labels {
  name: string;
  email: string;
  subject: string;
  message: string;
  cta: string;
  successTitle: string;
  successBody: string;
  errorGeneric: string;
}

export function ContactForm({ labels }: { labels: Labels }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const widgetId = useId().replace(/:/g, "_");
  const [token, setToken] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<string | null>(null);

  // Render the Turnstile widget once the script is loaded
  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      if (typeof window === "undefined" || !window.turnstile) {
        setTimeout(tryRender, 200);
        return;
      }
      const el = document.getElementById(`turnstile-${widgetId}`);
      if (!el || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(el, {
        sitekey: siteKey,
        theme: "light",
        callback: (t: string) => setToken(t),
      });
    };
    tryRender();
    return () => {
      cancelled = true;
    };
  }, [siteKey, widgetId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (siteKey && !token) {
      setError(labels.errorGeneric + " (captcha)");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          turnstileToken: token,
        }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}));
        throw new Error(msg || labels.errorGeneric);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.errorGeneric);
      // Reset the captcha so user can retry
      if (typeof window !== "undefined" && window.turnstile && widgetRef.current) {
        window.turnstile.reset(widgetRef.current);
        setToken("");
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="bg-[#FFF9E8] border border-[#F4B400]/40 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-serif text-xl font-bold text-[#111111] mb-2">{labels.successTitle}</h3>
        <p className="text-sm text-gray-600">{labels.successBody}</p>
      </div>
    );
  }

  return (
    <>
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          async
          defer
          strategy="afterInteractive"
        />
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">{labels.name}</span>
            <input
              name="name"
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F4B400] focus:ring-1 focus:ring-[#F4B400]"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">{labels.email}</span>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F4B400] focus:ring-1 focus:ring-[#F4B400]"
            />
          </label>
        </div>
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">{labels.subject}</span>
          <input
            name="subject"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F4B400] focus:ring-1 focus:ring-[#F4B400]"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">{labels.message}</span>
          <textarea
            name="message"
            rows={5}
            required
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F4B400] focus:ring-1 focus:ring-[#F4B400] resize-y"
          />
        </label>

        {siteKey ? (
          <div id={`turnstile-${widgetId}`} className="cf-turnstile" />
        ) : (
          <p className="text-[11px] text-amber-700">
            (Captcha ni nastavljen — NEXT_PUBLIC_TURNSTILE_SITE_KEY manjka.)
          </p>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy || (!!siteKey && !token)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #FFCC3D 0%, #F4B400 55%, #D69E00 100%)",
            boxShadow: "0 6px 18px rgba(255,201,77,0.45)",
          }}
        >
          {busy ? "…" : `${labels.cta} →`}
        </button>
      </form>
    </>
  );
}
