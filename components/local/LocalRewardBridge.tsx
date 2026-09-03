"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LocalLang = "sl" | "hr" | "sr" | "en" | "de" | "es";

interface CouponView {
  code: string;
  status: "issued" | "redeemed" | "expired" | "void";
  rewardTitle: string;
  rewardDescription: string | null;
  rewardTerms: string | null;
  venueName: string;
  locale: string;
  issuedAt: string;
  expiresAt: string | null;
  redeemedAt: string | null;
  products: string[];
  redeemUrl: string;
}

const COPY: Record<LocalLang, {
  unlocked: string;
  reward: string;
  code: string;
  staff: string;
  validUntil: string;
  noExpiry: string;
  appliesTo: string;
  close: string;
  saveHint: string;
  emailTitle: string;
  emailHint: string;
  emailPlaceholder: string;
  send: string;
  sending: string;
  sent: string;
  marketing: (venue: string) => string;
}> = {
  sl: { unlocked: "Nagrada odklenjena!", reward: "Tvoja nagrada", code: "Koda kupona", staff: "Ob naslednjem obisku pokaži to kodo osebju.", validUntil: "Velja do", noExpiry: "Brez časovne omejitve", appliesTo: "Velja za", close: "Zapri", saveHint: "Shrani ta zaslon ali naredi posnetek zaslona.", emailTitle: "Pošlji kupon na e-pošto", emailHint: "Da ga boš našel tudi pozneje.", emailPlaceholder: "vas@email.com", send: "Pošlji kupon", sending: "Pošiljam…", sent: "Kupon je poslan ✓", marketing: (v) => `Želim prejemati ponudbe in novosti lokala ${v}.` },
  hr: { unlocked: "Nagrada je otključana!", reward: "Tvoja nagrada", code: "Kod kupona", staff: "Pri sljedećem posjetu pokaži ovaj kod osoblju.", validUntil: "Vrijedi do", noExpiry: "Bez vremenskog ograničenja", appliesTo: "Vrijedi za", close: "Zatvori", saveHint: "Spremi ovaj zaslon ili napravi snimku zaslona.", emailTitle: "Pošalji kupon na e-poštu", emailHint: "Da ga možeš pronaći i kasnije.", emailPlaceholder: "vi@email.com", send: "Pošalji kupon", sending: "Šaljem…", sent: "Kupon je poslan ✓", marketing: (v) => `Želim primati ponude i novosti lokala ${v}.` },
  sr: { unlocked: "Nagrada je otključana!", reward: "Tvoja nagrada", code: "Kod kupona", staff: "Pri sledećoj poseti pokaži ovaj kod osoblju.", validUntil: "Važi do", noExpiry: "Bez vremenskog ograničenja", appliesTo: "Važi za", close: "Zatvori", saveHint: "Sačuvaj ovaj ekran ili napravi snimak ekrana.", emailTitle: "Pošalji kupon na e-mail", emailHint: "Da ga možeš pronaći i kasnije.", emailPlaceholder: "vi@email.com", send: "Pošalji kupon", sending: "Šaljem…", sent: "Kupon je poslat ✓", marketing: (v) => `Želim da primam ponude i novosti lokala ${v}.` },
  en: { unlocked: "Reward unlocked!", reward: "Your reward", code: "Coupon code", staff: "Show this code to staff on your next visit.", validUntil: "Valid until", noExpiry: "No expiry", appliesTo: "Applies to", close: "Close", saveHint: "Save this screen or take a screenshot.", emailTitle: "Email me this coupon", emailHint: "So you can find it later.", emailPlaceholder: "you@email.com", send: "Send coupon", sending: "Sending…", sent: "Coupon sent ✓", marketing: (v) => `I want to receive offers and news from ${v}.` },
  de: { unlocked: "Belohnung freigeschaltet!", reward: "Deine Belohnung", code: "Gutscheincode", staff: "Zeige diesen Code bei deinem nächsten Besuch dem Personal.", validUntil: "Gültig bis", noExpiry: "Ohne Ablaufdatum", appliesTo: "Gilt für", close: "Schließen", saveHint: "Speichere diesen Bildschirm oder mache einen Screenshot.", emailTitle: "Gutschein per E-Mail senden", emailHint: "Damit du ihn später wiederfindest.", emailPlaceholder: "du@email.de", send: "Gutschein senden", sending: "Wird gesendet…", sent: "Gutschein gesendet ✓", marketing: (v) => `Ich möchte Angebote und Neuigkeiten von ${v} erhalten.` },
  es: { unlocked: "¡Recompensa desbloqueada!", reward: "Tu recompensa", code: "Código del cupón", staff: "Muestra este código al personal en tu próxima visita.", validUntil: "Válido hasta", noExpiry: "Sin caducidad", appliesTo: "Válido para", close: "Cerrar", saveHint: "Guarda esta pantalla o haz una captura.", emailTitle: "Envíame el cupón por correo", emailHint: "Para encontrarlo más tarde.", emailPlaceholder: "tu@email.com", send: "Enviar cupón", sending: "Enviando…", sent: "Cupón enviado ✓", marketing: (v) => `Quiero recibir ofertas y novedades de ${v}.` },
};

const VALID_LANGS = new Set<LocalLang>(["sl", "hr", "sr", "en", "de", "es"]);

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function uploadModalIsOpen(): boolean {
  return Boolean(document.querySelector(".fixed.inset-0.z-50"));
}

export function LocalRewardBridge() {
  const [sourceCode, setSourceCode] = useState<string | null>(null);
  const [claimToken, setClaimToken] = useState<string>("");
  const [coupon, setCoupon] = useState<CouponView | null>(null);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const issuingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = (params.get("local") ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{5,32}$/.test(source)) return;
    setSourceCode(source);

    let claim = "";
    try {
      const key = `gc_lr_claim_${source}`;
      claim = localStorage.getItem(key) ?? "";
      if (!claim) {
        claim = crypto.randomUUID();
        localStorage.setItem(key, claim);
      }
      const saved = localStorage.getItem(`gc_lr_coupon_${source}`);
      if (saved) setCoupon(JSON.parse(saved) as CouponView);
    } catch {
      claim = crypto.randomUUID();
    }
    setClaimToken(claim);
  }, []);

  useEffect(() => {
    if (!sourceCode || !claimToken) return;

    const originalFetch = window.fetch.bind(window);

    const wrappedFetch: typeof window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);
      const url = urlOf(input);

      if (
        response.ok &&
        url.includes("/api/albums/") &&
        url.includes("/save-upload")
      ) {
        void (async () => {
          try {
            const upload = await response.clone().json() as {
              photoId?: string;
              alreadySaved?: boolean;
            };
            if (!upload.photoId || upload.alreadySaved || issuingRef.current) return;
            issuingRef.current = true;

            const params = new URLSearchParams(window.location.search);
            const requestedLang = params.get("lang") as LocalLang | null;
            const locale = requestedLang && VALID_LANGS.has(requestedLang)
              ? requestedLang
              : undefined;

            const rewardRes = await originalFetch("/api/local/coupons/issue", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sourceCode,
                photoId: upload.photoId,
                claimToken,
                locale,
              }),
            });
            if (!rewardRes.ok) return;

            const reward = await rewardRes.json() as { coupon?: CouponView };
            if (!reward.coupon) return;
            setCoupon(reward.coupon);
            try {
              localStorage.setItem(`gc_lr_coupon_${sourceCode}`, JSON.stringify(reward.coupon));
            } catch { /* ignore */ }
          } catch {
            // Rewards must never make the core Guestcam upload fail.
          } finally {
            issuingRef.current = false;
          }
        })();
      }

      return response;
    };

    window.fetch = wrappedFetch;
    return () => {
      if (window.fetch === wrappedFetch) window.fetch = originalFetch;
    };
  }, [sourceCode, claimToken]);

  useEffect(() => {
    if (!coupon) {
      setVisible(false);
      return;
    }

    const showWhenUploaderCloses = () => {
      if (!uploadModalIsOpen()) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (showWhenUploaderCloses()) return;
    const timer = window.setInterval(() => {
      if (showWhenUploaderCloses()) window.clearInterval(timer);
    }, 350);
    return () => window.clearInterval(timer);
  }, [coupon]);

  const lang = useMemo<LocalLang>(() => {
    const c = coupon?.locale as LocalLang | undefined;
    return c && VALID_LANGS.has(c) ? c : "en";
  }, [coupon]);

  async function sendCouponEmail() {
    if (!coupon || !claimToken || emailSending || emailSent) return;
    setEmailError("");
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setEmailError("Please enter a valid email.");
      return;
    }
    setEmailSending(true);
    try {
      const res = await fetch("/api/local/coupons/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon.code,
          claimToken,
          email: clean,
          marketingConsent,
          locale: lang,
        }),
      });
      if (!res.ok) throw new Error("send_failed");
      setEmailSent(true);
    } catch {
      setEmailError("Email could not be sent. Please try again.");
    } finally {
      setEmailSending(false);
    }
  }

  if (!sourceCode || !coupon || !visible) return null;
  const t = COPY[lang];
  const expiry = coupon.expiresAt
    ? new Intl.DateTimeFormat(lang === "sl" ? "sl-SI" : lang, { dateStyle: "medium" }).format(new Date(coupon.expiresAt))
    : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-[#14181F]/72 p-0 sm:p-5 backdrop-blur-sm">
      <section className="w-full max-w-md overflow-hidden rounded-t-[30px] sm:rounded-[30px] border border-[color:var(--hairline)] bg-[color:var(--paper)] shadow-2xl">
        <div className="bg-[color:var(--ink)] px-6 py-7 text-center text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#FFF3CC] text-3xl">🎁</div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/55">{coupon.venueName}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{t.unlocked}</h2>
        </div>

        <div className="max-h-[70dvh] overflow-y-auto p-5 sm:p-6">
          <div className="rounded-2xl bg-[#FFF3CC] p-5 text-center text-[#68470F]">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em]">{t.reward}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight">{coupon.rewardTitle}</p>
            {coupon.rewardDescription && <p className="mt-2 text-sm leading-5 opacity-75">{coupon.rewardDescription}</p>}
          </div>

          <div className="mt-4 rounded-2xl border border-[color:var(--hairline)] bg-white p-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[color:var(--muted)]">{t.code}</p>
            <p className="mt-2 font-mono text-3xl font-black tracking-[0.08em] text-[color:var(--ink)]">{coupon.code}</p>
            <img
              src={`/api/local/coupons/${encodeURIComponent(coupon.code)}/qr`}
              alt={coupon.code}
              className="mx-auto mt-4 h-44 w-44 rounded-xl border border-[color:var(--hairline)] bg-white p-2"
            />
            <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">{t.staff}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <div className="rounded-xl border border-[color:var(--hairline)] bg-white px-4 py-3">
              <span className="text-[color:var(--muted)]">{t.validUntil}: </span>
              <strong>{expiry ?? t.noExpiry}</strong>
            </div>
            {coupon.products.length > 0 && (
              <div className="rounded-xl border border-[color:var(--hairline)] bg-white px-4 py-3">
                <span className="text-[color:var(--muted)]">{t.appliesTo}: </span>
                <strong>{coupon.products.join(", ")}</strong>
              </div>
            )}
          </div>

          {coupon.rewardTerms && (
            <p className="mt-4 text-xs leading-5 text-[color:var(--muted)]">{coupon.rewardTerms}</p>
          )}
          <p className="mt-4 text-center text-xs text-[color:var(--muted)]">{t.saveHint}</p>

          <div className="mt-5 rounded-2xl border border-[color:var(--hairline)] bg-white p-4">
            <p className="text-sm font-semibold">📩 {t.emailTitle}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">{t.emailHint}</p>
            <div className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                disabled={emailSent}
                className="min-w-0 flex-1 rounded-xl border border-[color:var(--hairline)] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--honey)] disabled:bg-gray-50"
              />
              <button
                type="button"
                disabled={emailSending || emailSent}
                onClick={() => void sendCouponEmail()}
                className="shrink-0 rounded-xl bg-[color:var(--honey)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {emailSent ? t.sent : emailSending ? t.sending : t.send}
              </button>
            </div>
            <label className="mt-3 flex items-start gap-2 text-[11px] leading-4 text-[color:var(--muted)]">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                disabled={emailSent}
                className="mt-0.5 accent-[#8C6218]"
              />
              <span>{t.marketing(coupon.venueName)}</span>
            </label>
            {emailError && <p className="mt-2 text-xs text-red-600">{emailError}</p>}
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="mt-5 w-full rounded-2xl bg-[color:var(--ink)] px-5 py-4 text-sm font-semibold text-[color:var(--paper)]"
          >
            {t.close}
          </button>
        </div>
      </section>
    </div>
  );
}
