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
}> = {
  sl: { unlocked: "Nagrada odklenjena!", reward: "Tvoja nagrada", code: "Koda kupona", staff: "Ob naslednjem obisku pokaži to kodo osebju.", validUntil: "Velja do", noExpiry: "Brez časovne omejitve", appliesTo: "Velja za", close: "Zapri", saveHint: "Shrani ta zaslon ali naredi posnetek zaslona." },
  hr: { unlocked: "Nagrada je otključana!", reward: "Tvoja nagrada", code: "Kod kupona", staff: "Pri sljedećem posjetu pokaži ovaj kod osoblju.", validUntil: "Vrijedi do", noExpiry: "Bez vremenskog ograničenja", appliesTo: "Vrijedi za", close: "Zatvori", saveHint: "Spremi ovaj zaslon ili napravi snimku zaslona." },
  sr: { unlocked: "Nagrada je otključana!", reward: "Tvoja nagrada", code: "Kod kupona", staff: "Pri sledećoj poseti pokaži ovaj kod osoblju.", validUntil: "Važi do", noExpiry: "Bez vremenskog ograničenja", appliesTo: "Važi za", close: "Zatvori", saveHint: "Sačuvaj ovaj ekran ili napravi snimak ekrana." },
  en: { unlocked: "Reward unlocked!", reward: "Your reward", code: "Coupon code", staff: "Show this code to staff on your next visit.", validUntil: "Valid until", noExpiry: "No expiry", appliesTo: "Applies to", close: "Close", saveHint: "Save this screen or take a screenshot." },
  de: { unlocked: "Belohnung freigeschaltet!", reward: "Deine Belohnung", code: "Gutscheincode", staff: "Zeige diesen Code bei deinem nächsten Besuch dem Personal.", validUntil: "Gültig bis", noExpiry: "Ohne Ablaufdatum", appliesTo: "Gilt für", close: "Schließen", saveHint: "Speichere diesen Bildschirm oder mache einen Screenshot." },
  es: { unlocked: "¡Recompensa desbloqueada!", reward: "Tu recompensa", code: "Código del cupón", staff: "Muestra este código al personal en tu próxima visita.", validUntil: "Válido hasta", noExpiry: "Sin caducidad", appliesTo: "Válido para", close: "Cerrar", saveHint: "Guarda esta pantalla o haz una captura." },
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
  const [coupon, setCoupon] = useState<CouponView | null>(null);
  const [visible, setVisible] = useState(false);
  const issuingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = (params.get("local") ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{5,32}$/.test(source)) return;
    setSourceCode(source);

    try {
      const saved = localStorage.getItem(`gc_lr_coupon_${source}`);
      if (saved) setCoupon(JSON.parse(saved) as CouponView);
    } catch { /* private browsing / corrupt cache */ }
  }, []);

  useEffect(() => {
    if (!sourceCode) return;

    let claimToken = "";
    try {
      const key = `gc_lr_claim_${sourceCode}`;
      claimToken = localStorage.getItem(key) ?? "";
      if (!claimToken) {
        claimToken = crypto.randomUUID();
        localStorage.setItem(key, claimToken);
      }
    } catch {
      claimToken = crypto.randomUUID();
    }

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
  }, [sourceCode]);

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
