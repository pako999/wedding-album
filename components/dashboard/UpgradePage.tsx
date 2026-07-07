"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import type { Album } from "@/lib/db/schema";
import { translations, type Lang } from "@/lib/i18n/translations";
import { UPGRADE_COPY, PLAN_FEATURE_KEYS } from "@/lib/i18n/upgrade-translations";

type PlanId = "free" | "basic" | "plus" | "premium";

// Plan prices and product-tier metadata are locale-independent —
// only the display copy (tagline / features / badge) is localised via
// UPGRADE_COPY + PLAN_FEATURE_KEYS.
interface PlanMeta {
  id: PlanId;
  name: string;
  price: number;
  hasBadge?: boolean;
}

const PLANS: PlanMeta[] = [
  { id: "basic",   name: "Basic",   price: 39 },
  { id: "plus",    name: "Plus",    price: 49, hasBadge: true },
  { id: "premium", name: "Premium", price: 99 },
];

interface Props {
  album: Album;
  lang?: Lang;
}

export function UpgradePage({ album, lang = "sl" }: Props) {
  const t = translations[lang];
  const u = UPGRADE_COPY[lang];

  // Localised tagline lookup, keyed by plan id → UPGRADE_COPY key.
  const planTagline = (id: PlanId): string => {
    if (id === "basic")   return u.taglineBasic;
    if (id === "plus")    return u.taglinePlus;
    if (id === "premium") return u.taglinePremium;
    return "";
  };
  const searchParams = useSearchParams();
  const initialPlan: PlanId = (() => {
    const p = searchParams.get("plan");
    return p === "basic" || p === "plus" || p === "premium" ? p : "plus";
  })();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(initialPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "invoice">("card");
  const [invoiceDone, setInvoiceDone] = useState(false);
  const [billing, setBilling] = useState({ name: "", companyName: "", email: "", address: "", city: "", taxId: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Discount code state
  const [discountInput, setDiscountInput] = useState("");
  const [discountStatus, setDiscountStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountCodeId, setDiscountCodeId] = useState<string>("");
  const [appliedCode, setAppliedCode] = useState<string>("");

  const chosen = PLANS.find((p) => p.id === selectedPlan)!;

  // Reset discount when plan changes
  const selectPlan = (id: PlanId) => {
    setSelectedPlan(id);
    setDiscountStatus("idle");
    setDiscountPercent(0);
    setDiscountCodeId("");
    setAppliedCode("");
    setDiscountInput("");
  };

  const discountedPrice = discountStatus === "valid"
    ? Math.round(chosen.price * (1 - discountPercent / 100))
    : chosen.price;

  async function applyDiscount() {
    if (!discountInput.trim()) return;
    setDiscountStatus("checking");
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountInput.trim(), planId: selectedPlan }),
      });
      const data = await res.json() as {
        valid: boolean; percentOff?: number; discountCodeId?: string; error?: string;
      };
      if (data.valid && data.percentOff && data.discountCodeId) {
        setDiscountStatus("valid");
        setDiscountPercent(data.percentOff);
        setDiscountCodeId(data.discountCodeId);
        setAppliedCode(discountInput.trim().toUpperCase());
      } else {
        setDiscountStatus("invalid");
      }
    } catch {
      setDiscountStatus("invalid");
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F5F7" }}>

      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/${album.slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {u.back}
          </Link>
          <GuestcamLogo size="sm" showMark={false} />
          <div className="w-16" />
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Page title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{u.title}</h1>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{album.coupleName}</span>
              {" "}· {u.subtitle}
            </p>
          </div>

          {/* ── Plan cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  className="w-full text-left rounded-2xl border-2 bg-white transition-all focus:outline-none"
                  style={{
                    borderColor: isSelected ? "#FFC94D" : "#e5e7eb",
                    boxShadow: isSelected ? "0 0 0 3px rgba(255,201,77,0.15)" : "none",
                  }}
                  onClick={() => selectPlan(plan.id)}
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Radio */}
                    <div
                      className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: isSelected ? "#FFC94D" : "#d1d5db",
                        background: isSelected ? "#FFC94D" : "white",
                      }}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{plan.name}</span>
                        {plan.hasBadge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: "#FFC94D", color: "#0F1729" }}>
                            {u.badgeRecommended}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{planTagline(plan.id)}</span>
                      </div>

                      {isSelected && plan.id !== "free" && (
                        <ul className="mt-3 space-y-1.5">
                          {PLAN_FEATURE_KEYS[plan.id as "basic" | "plus" | "premium"].map((fk) => (
                            <li key={fk} className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {u[fk] as string}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xl font-bold text-gray-900">{plan.price}€</span>
                      <p className="text-xs text-gray-400">{u.vatIncluded}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Trust strip ───────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: "🛡️", label: u.trustRefund },
              { icon: "🔒", label: u.trustSecure },
              { icon: "⚡", label: u.trustInstant },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-lg mb-1">{item.icon}</div>
                <p className="text-xs text-gray-600 font-medium leading-tight">{item.label}</p>
              </div>
            ))}
          </div>

          {/* ── Testimonial ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-600 italic leading-relaxed mb-3">
              &ldquo;{u.testimonialQuote}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FFF9EC] flex items-center justify-center text-sm font-bold text-[#C9820A]">A</div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{u.testimonialAuthor}</p>
                <p className="text-xs text-gray-400">{u.testimonialMeta}</p>
              </div>
            </div>
          </div>

          {/* ── Support card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 flex items-center gap-4">
            {/* Person avatar */}
            <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden" style={{ background: "linear-gradient(135deg,#FFF3CC,#FFC94D)" }}>
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Head */}
                <circle cx="28" cy="20" r="10" fill="#C9820A" opacity="0.85" />
                {/* Body */}
                <ellipse cx="28" cy="44" rx="14" ry="10" fill="#C9820A" opacity="0.85" />
                {/* Face highlight */}
                <circle cx="25" cy="18" r="2" fill="white" opacity="0.4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">{u.supportTitle}</p>
              <p className="text-xs text-gray-500 mb-3">{u.supportSubtitle}</p>
              <div className="flex gap-2 flex-wrap">
                <a
                  href="viber://chat?number=38641580250"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#7360F2" }}
                >
                  {/* Viber icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 0C5.5 0 1 4.3 1 9.6c0 3 1.5 5.7 3.9 7.5v3.7l3.5-1.9c1 .3 2 .4 3.1.4 5.9 0 10.4-4.3 10.4-9.6S17.3 0 11.4 0zm1 13l-2.5-2.7-4.9 2.7 5.4-5.7 2.5 2.7 4.9-2.7L12.4 13z"/>
                  </svg>
                  Viber
                </a>
                <a
                  href="https://wa.me/38641580250"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#25D366" }}
                >
                  {/* WhatsApp icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.118 1.528 5.847L0 24l6.302-1.504A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.652-.49-5.186-1.349l-.371-.22-3.742.893.942-3.628-.242-.385A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="tel:+38641580250"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: "#F3F4F6", color: "#374151" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
                  </svg>
                  +386 41 580 250
                </a>
              </div>
            </div>
          </div>

          {/* ── Discount code ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{t.discountCode}</p>
            {discountStatus === "valid" ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-sm font-mono font-bold text-green-800 tracking-wider">
                  {appliedCode}
                </div>
                <span className="text-sm font-bold text-green-700">{t.discountOff(discountPercent)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountStatus("idle");
                    setDiscountPercent(0);
                    setDiscountCodeId("");
                    setAppliedCode("");
                    setDiscountInput("");
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  {t.discountRemove}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.discountPlaceholder}
                  value={discountInput}
                  onChange={(e) => {
                    setDiscountInput(e.target.value.toUpperCase());
                    if (discountStatus === "invalid") setDiscountStatus("idle");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                  className="flex-1 px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#FFC94D] font-mono uppercase tracking-wider"
                  style={{ borderColor: discountStatus === "invalid" ? "#ef4444" : "#e5e7eb" }}
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={discountStatus === "checking" || !discountInput.trim()}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {discountStatus === "checking" ? "…" : t.discountApply}
                </button>
              </div>
            )}
            {discountStatus === "invalid" && (
              <p className="text-xs text-red-500 mt-1.5">{t.discountInvalid}</p>
            )}
          </div>

          {/* ── Payment method ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{u.paymentMethod}</p>
            <div className="space-y-2">
              {[
                {
                  id: "card" as const,
                  label: u.paymentCardLabel,
                  sub: u.paymentCardSub,
                  icon: (
                    <div className="flex gap-1">
                      <div className="w-7 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                      <div className="w-7 h-5 rounded bg-gray-800 flex items-center justify-center text-white text-[7px] font-bold">MC</div>
                    </div>
                  ),
                },
                {
                  id: "invoice" as const,
                  label: u.paymentInvoiceLabel,
                  sub: u.paymentInvoiceSub,
                  icon: (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z" />
                      <polyline points="17,21 17,13 7,13 7,21" />
                      <polyline points="7,3 7,8 15,8" />
                    </svg>
                  ),
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: paymentMethod === m.id ? "#FFC94D" : "#e5e7eb",
                    background: paymentMethod === m.id ? "#FFFBF0" : "white",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: paymentMethod === m.id ? "#FFC94D" : "#d1d5db",
                      background: paymentMethod === m.id ? "#FFC94D" : "white",
                    }}
                  >
                    {paymentMethod === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.sub}</p>
                  </div>
                  {m.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── Billing form (invoice only) ───────────────────────────── */}
          {paymentMethod === "invoice" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{u.billingTitle}</p>
              <div className="space-y-2.5">
                {[
                  { key: "name",        placeholder: u.billingName,    type: "text"  },
                  { key: "companyName", placeholder: u.billingCompany, type: "text"  },
                  { key: "email",       placeholder: u.billingEmail,   type: "email" },
                  { key: "address",     placeholder: u.billingAddress, type: "text"  },
                  { key: "city",        placeholder: u.billingCity,    type: "text"  },
                  { key: "taxId",       placeholder: u.billingTaxId,   type: "text"  },
                ].map(({ key, placeholder, type }) => (
                  <input
                    key={key}
                    type={type}
                    placeholder={placeholder}
                    value={billing[key as keyof typeof billing]}
                    onChange={e => setBilling(b => ({ ...b, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#FFC94D] focus:ring-1 focus:ring-[#FFC94D] transition-colors"
                    style={{ borderColor: "#e5e7eb" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Order summary + CTA ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">{u.planPrefix} {chosen.name}</p>
                <p className="text-xs text-gray-400">{planTagline(chosen.id)}</p>
              </div>
              <div className="text-right">
                {discountStatus === "valid" && (
                  <p className="text-sm text-gray-400 line-through">{chosen.price}€</p>
                )}
                <span className="text-2xl font-bold text-gray-900">{discountedPrice}€</span>
                {discountStatus === "valid" && (
                  <p className="text-xs font-bold text-green-700">{t.discountOff(discountPercent)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
              <span>{u.vatIncluded}</span>
              <span>{u.onetimePayment}</span>
            </div>

            {/* Terms acceptance checkbox */}
            {!invoiceDone && (
              <label className="flex items-start gap-2.5 mb-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-[#FFC94D] flex-shrink-0 cursor-pointer"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  {(() => {
                    // Split the localised "By purchasing you agree to the {link}..."
                    // sentence around the {link} placeholder so the interior can be
                    // an actual <Link> component (not just anchored HTML string).
                    const marker = "__LINK__";
                    const rendered = u.termsAcceptance(marker);
                    const [before, after] = rendered.split(marker);
                    return (
                      <>
                        {before}
                        <Link href="/terms" target="_blank" className="underline hover:text-gray-800">{u.termsLinkText}</Link>
                        {after}
                      </>
                    );
                  })()}
                </span>
              </label>
            )}

            {invoiceDone ? (
              <div className="rounded-xl p-5 text-center" style={{ background: "#F0FDF4", border: "2px solid #86EFAC" }}>
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-green-800 mb-1">{u.invoiceDoneTitle}</p>
                <p className="text-sm text-green-700">{u.invoiceDoneBody(chosen.name)}</p>
              </div>
            ) : (
              <button
                className="w-full py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                style={{ background: "#FFC94D", color: "#0F1729" }}
                disabled={isLoading || !termsAccepted}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    if (paymentMethod === "invoice") {
                      if (!billing.name.trim() || !billing.email.trim() || !billing.address.trim() || !billing.city.trim()) {
                        alert(u.alertMissingFields);
                        setIsLoading(false);
                        return;
                      }
                      const res = await fetch("/api/bank-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: selectedPlan,
                          albumSlug: album.slug,
                          discountCode: discountStatus === "valid" ? appliedCode : undefined,
                          billing: {
                            name: billing.name.trim(),
                            companyName: billing.companyName.trim() || undefined,
                            email: billing.email.trim(),
                            address: billing.address.trim(),
                            city: billing.city.trim(),
                            taxId: billing.taxId.trim() || undefined,
                          },
                        }),
                      });
                      const data = await res.json() as { success?: boolean; error?: string };
                      if (!res.ok || !data.success) throw new Error(data.error ?? "Napaka");
                      setInvoiceDone(true);
                      setIsLoading(false);
                    } else {
                      const res = await fetch("/api/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: selectedPlan,
                          albumSlug: album.slug,
                          discountCode: discountStatus === "valid" ? appliedCode : undefined,
                        }),
                      });
                      const data = await res.json() as { paymentUrl?: string; error?: string };
                      if (!res.ok || !data.paymentUrl) throw new Error(data.error ?? "no payment URL");
                      window.location.href = data.paymentUrl;
                    }
                  } catch (err) {
                    console.error("[checkout]", err);
                    alert(paymentMethod === "invoice" ? u.alertInvoiceFailed : u.alertPaymentFailed);
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {paymentMethod === "invoice" ? u.ctaSending : u.ctaRedirecting}
                  </>
                ) : paymentMethod === "invoice" ? (
                  u.ctaInvoice(discountedPrice)
                ) : (
                  u.ctaCard(chosen.name, discountedPrice)
                )}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#0F1729] text-white pt-12 pb-6 mt-auto">
        <div className="max-w-2xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pb-8 border-b border-white/10 mb-6">
            <div className="col-span-2 sm:col-span-1">
              <GuestcamLogo size="sm" showMark={true} variant="onDark" />
              <p className="text-gray-400 text-xs leading-relaxed mt-3">
                {u.footerTagline}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{u.footerProduct}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={lang === "sl" ? "/#pricing" : `/${lang}#pricing`} className="hover:text-white transition-colors">{u.footerLinkPricing}</Link></li>
                <li><Link href={lang === "sl" ? "/#how" : `/${lang}#how`} className="hover:text-white transition-colors">{u.footerLinkHow}</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">{u.footerLinkMyGalleries}</Link></li>
                <li><Link href={lang === "sl" ? "/contact" : `/${lang}/contact`} className="hover:text-white transition-colors">{u.footerLinkContact}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">{u.footerLegal}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={lang === "sl" ? "/privacy" : `/${lang}/privacy`} className="hover:text-white transition-colors">{u.footerLinkPrivacy}</Link></li>
                <li><Link href={lang === "sl" ? "/terms" : `/${lang}/terms`} className="hover:text-white transition-colors">{u.footerLinkTerms}</Link></li>
                <li><Link href={lang === "sl" ? "/refund" : `/${lang}/refund`} className="hover:text-white transition-colors">{u.footerLinkRefund}</Link></li>
                <li><Link href={lang === "sl" ? "/gdpr" : `/${lang}/gdpr`} className="hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>{u.footerCompanyLine}</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                SSL
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                GDPR
              </span>
              <span>{u.footerNoRegistration}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
