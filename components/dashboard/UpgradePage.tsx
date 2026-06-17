"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import type { Album } from "@/lib/db/schema";

type PlanId = "free" | "basic" | "plus" | "premium";

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 39,
    tagline: "Za manjše dogodke",
    features: [
      "Do 1000 fotografij",
      "Do 10 videoposnetkov",
      "QR koda za mizo",
      "Prenos vseh slik (ZIP)",
      "Dostop 3 mesece",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 49,
    tagline: "Najpopularnejši",
    badge: "PRIPOROČENO",
    features: [
      "Do 5000 fotografij",
      "Do 100 videoposnetkov",
      "QR koda za mizo",
      "Prenos vseh slik (ZIP)",
      "Dostop 1 leto",
      "Live galerija v realnem času",
      "Personalizirana stran",
      "Premium predloge",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    tagline: "Vse vključeno",
    features: [
      "Neomejeno fotografij",
      "Do 100 videoposnetkov",
      "QR koda za mizo",
      "Prenos vseh slik (ZIP)",
      "Dostop 1 leto",
      "Live galerija v realnem času",
      "Personalizirana stran",
      "Premium predloge",
      "Lasten napis na QR kartici",
      "Prioritetna podpora",
    ],
  },
];

interface Props {
  album: Album;
}

export function UpgradePage({ album }: Props) {
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

  const chosen = PLANS.find((p) => p.id === selectedPlan)!;

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
            Nazaj
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Nadgradite svojo galerijo</h1>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{album.coupleName}</span>
              {" "}· Izberite paket, ki ustreza vašemu dogodku.
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
                  onClick={() => setSelectedPlan(plan.id)}
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
                        {plan.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: "#FFC94D", color: "#0F1729" }}>
                            {plan.badge}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{plan.tagline}</span>
                      </div>

                      {isSelected && (
                        <ul className="mt-3 space-y-1.5">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xl font-bold text-gray-900">{plan.price}€</span>
                      <p className="text-xs text-gray-400">enkratno</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Trust strip ───────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: "🛡️", label: "30-dnevna garancija" },
              { icon: "🔒", label: "Varno plačilo" },
              { icon: "⚡", label: "Takojšnja aktivacija" },
            ].map((t) => (
              <div key={t.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-lg mb-1">{t.icon}</div>
                <p className="text-xs text-gray-600 font-medium leading-tight">{t.label}</p>
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
              &ldquo;Guestcam je bila najboljša odločitev za naš dan. Gostje so naložili čez 300 fotografij — brez aplikacij, brez zapletov. Vse fotografije so bile na enem mestu!&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FFF9EC] flex items-center justify-center text-sm font-bold text-[#C9820A]">A</div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Ana & Marko</p>
                <p className="text-xs text-gray-400">500+ fotografij · 2026</p>
              </div>
            </div>
          </div>

          {/* ── Payment method ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Način plačila</p>
            <div className="space-y-2">
              {[
                {
                  id: "card" as const,
                  label: "Plačilo s kartico",
                  sub: "Visa, Mastercard, iDEAL · Takojšnja aktivacija",
                  icon: (
                    <div className="flex gap-1">
                      <div className="w-7 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                      <div className="w-7 h-5 rounded bg-gray-800 flex items-center justify-center text-white text-[7px] font-bold">MC</div>
                    </div>
                  ),
                },
                {
                  id: "invoice" as const,
                  label: "Predračun / bančno nakazilo",
                  sub: "Predračun prejmete v 24 urah",
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
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Podatki za predračun</p>
              <div className="space-y-2.5">
                {[
                  { key: "name", placeholder: "Ime in priimek *", type: "text" },
                  { key: "companyName", placeholder: "Naziv podjetja (neobvezno)", type: "text" },
                  { key: "email", placeholder: "E-poštni naslov *", type: "email" },
                  { key: "address", placeholder: "Ulica in hišna številka *", type: "text" },
                  { key: "city", placeholder: "Poštna številka in kraj *", type: "text" },
                  { key: "taxId", placeholder: "Davčna številka (neobvezno)", type: "text" },
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
                <p className="font-semibold text-gray-900">Paket {chosen.name}</p>
                <p className="text-xs text-gray-400">{chosen.tagline}</p>
              </div>
              <span className="text-2xl font-bold text-gray-900">{chosen.price}€</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
              <span>DDV ni vključen</span>
              <span>Enkratno plačilo · brez naročnine</span>
            </div>

            {invoiceDone ? (
              <div className="rounded-xl p-5 text-center" style={{ background: "#F0FDF4", border: "2px solid #86EFAC" }}>
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-green-800 mb-1">Naročilo prejeto!</p>
                <p className="text-sm text-green-700">Predračun vam pošljemo v 24 urah. Po plačilu bo paket <strong>{chosen.name}</strong> takoj aktiviran.</p>
              </div>
            ) : (
              <button
                className="w-full py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                style={{ background: "#FFC94D", color: "#0F1729" }}
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    if (paymentMethod === "invoice") {
                      if (!billing.name.trim() || !billing.email.trim() || !billing.address.trim() || !billing.city.trim()) {
                        alert("Prosimo izpolnite vse obvezne podatke (ime, e-pošta, naslov, kraj).");
                        setIsLoading(false);
                        return;
                      }
                      const res = await fetch("/api/bank-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: selectedPlan,
                          albumSlug: album.slug,
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
                        body: JSON.stringify({ planId: selectedPlan, albumSlug: album.slug }),
                      });
                      const data = await res.json() as { paymentUrl?: string; error?: string };
                      if (!res.ok || !data.paymentUrl) throw new Error(data.error ?? "no payment URL");
                      window.location.href = data.paymentUrl;
                    }
                  } catch (err) {
                    console.error("[checkout]", err);
                    alert(paymentMethod === "invoice"
                      ? "Napaka pri oddaji naročila. Pišite na info@guestcam.si"
                      : "Napaka pri plačilu. Poskusite znova ali nas kontaktirajte na info@guestcam.si");
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
                    {paymentMethod === "invoice" ? "Pošiljanje…" : "Preusmeritev na plačilo…"}
                  </>
                ) : paymentMethod === "invoice" ? (
                  `Oddaj naročilo po predračunu — ${chosen.price}€`
                ) : (
                  `Nadgradi na ${chosen.name} — ${chosen.price}€ →`
                )}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mb-8">
            Z nakupom se strinjate s{" "}
            <a href="/pogoji" className="underline hover:text-gray-600">pogoji uporabe</a>.
            {" "}30-dnevna garancija vračila denarja.
          </p>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#0F1729] text-white pt-12 pb-6 mt-auto">
        <div className="max-w-2xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pb-8 border-b border-white/10 mb-6">
            <div className="col-span-2 sm:col-span-1">
              <GuestcamLogo size="sm" showMark={true} variant="onDark" />
              <p className="text-gray-400 text-xs leading-relaxed mt-3">
                Galerija s QR kodo — brez aplikacije.<br />Gostje fotografirajo, vi zbirate spomine.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Produkt</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#pricing" className="hover:text-white transition-colors">Cenik</Link></li>
                <li><Link href="/#how" className="hover:text-white transition-colors">Kako deluje</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Moje galerije</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Pravno</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Zasebnost</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Pogoji uporabe</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Vračilo denarja</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© 2026 Guestcam · Sport group d.o.o. · SI72133449 · Slovenija</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                SSL
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                GDPR
              </span>
              <span>Brez registracije za goste</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
