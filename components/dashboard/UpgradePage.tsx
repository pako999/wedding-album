"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Album } from "@/lib/db/schema";

type PlanId = "basic" | "plus" | "premium";

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  originalPrice: number;
  tagline: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "BASIC",
    price: 39,
    originalPrice: 55,
    tagline: "Osnovne funkcionalnosti",
    features: [
      "QR koda za mizo",
      "Do 500 fotografij",
      "Do 20 videoposnetkov",
      "Prenos vseh slik (ZIP)",
      "Dostop 1 leto",
    ],
  },
  {
    id: "plus",
    name: "PLUS",
    price: 49,
    originalPrice: 69,
    tagline: "Live galerija + personalizacija",
    features: [
      "QR koda za mizo",
      "Do 500 fotografij",
      "Do 20 videoposnetkov",
      "Prenos vseh slik (ZIP)",
      "Dostop 1 leto",
      "Live galerija",
      "Personalizirana stran",
      "Premium predloge",
    ],
  },
  {
    id: "premium",
    name: "PREMIUM",
    price: 79,
    originalPrice: 109,
    tagline: "Vse + premium podpora",
    features: [
      "QR koda za mizo",
      "Do 500 fotografij",
      "Do 20 videoposnetkov",
      "Prenos vseh slik (ZIP)",
      "Dostop 1 leto",
      "Live galerija",
      "Personalizirana stran",
      "Premium predloge",
      "Neomejeno fotografij",
      "Do 100 videoposnetkov",
      "Dostop 2 leti",
      "Prioritetna podpora",
    ],
  },
];

interface Props {
  album: Album;
}

export function UpgradePage({ album }: Props) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("premium");
  const [expandedPlan, setExpandedPlan] = useState<PlanId>("premium");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const chosen = PLANS.find((p) => p.id === selectedPlan)!;

  const applyDiscount = () => {
    if (discountCode.trim().length > 0) {
      setDiscountApplied(true);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#f5f5f7" }}>
      <div className="max-w-lg mx-auto">
        {/* Back arrow */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Nazaj
        </button>

        {/* Discount badge */}
        <div className="flex justify-center mb-4">
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white" style={{ background: "#4F46E5" }}>
            -30% SAMO ŠE DANES!
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Izbira paketa in plačilo</h1>
          <p className="text-sm text-gray-400">Izberite paket in zaključite nakup.</p>
        </div>

        {/* Plan cards */}
        <div className="space-y-3 mb-6">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isExpanded = expandedPlan === plan.id;
            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl border-2 transition-all cursor-pointer"
                style={{ borderColor: isSelected ? "#4F46E5" : "#e5e7eb" }}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  setExpandedPlan(plan.id);
                }}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Radio */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: isSelected ? "#4F46E5" : "#d1d5db",
                      background: isSelected ? "#4F46E5" : "white",
                    }}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  {/* Plan info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{plan.name}</span>
                      <span className="text-xs text-gray-400">{plan.tagline}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-gray-900">{plan.price}€</span>
                    <span className="ml-1.5 text-xs text-gray-400 line-through">{plan.originalPrice}€</span>
                  </div>
                </div>

                {/* Expanded features */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Social proof */}
        <div className="bg-purple-50 rounded-xl p-3 text-center mb-5">
          <p className="text-sm font-semibold text-purple-700">200+ GALERIJ je bilo že ustvarjenih letos 💜</p>
        </div>

        {/* Trust cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
            <div className="text-green-500 text-xl">🛡</div>
            <div>
              <p className="text-xs font-semibold text-gray-800">30-dnevna garancija</p>
              <p className="text-xs text-gray-400">Vračilo brez vprašanj</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: "#e5e7eb" }}>
            <div className="text-blue-500 text-xl">🔒</div>
            <div>
              <p className="text-xs font-semibold text-gray-800">100% varno plačilo</p>
              <p className="text-xs text-gray-400">Zavarovano z Stripe</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white rounded-xl border p-5 mb-5" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-sm text-gray-600 italic mb-3">
            "Guestcam je bila najboljša odločitev za naše gostje. Vse fotografije na enem mestu, brez aplikacij!"
          </p>
          <p className="text-xs font-semibold text-gray-800">Ana & Luka</p>
          <p className="text-xs text-gray-400">Poročena 2025</p>
        </div>

        {/* Add-on upsell */}
        <div className="bg-white rounded-xl border p-4 mb-5" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Morda potrebujete še to?</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-lg">🪧</div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Podstavki za mizo</p>
                <p className="text-xs text-gray-400">Elegantni kartončki s QR kodo za vsako mizo</p>
              </div>
            </div>
            <button className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-gray-300 transition-colors whitespace-nowrap">
              Dodaj +9€
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border p-5 mb-5" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Povzetek naročila</h3>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Paket {chosen.name}</span>
            <span className="text-sm font-semibold text-gray-900">{chosen.price}€</span>
          </div>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <span className="text-xs text-gray-400 line-through">Redna cena</span>
            <span className="text-xs text-gray-400 line-through">{chosen.originalPrice}€</span>
          </div>

          {/* Discount code */}
          <div className="flex gap-2 mb-4">
            <input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Koda za popust"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              onClick={applyDiscount}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors whitespace-nowrap"
            >
              Uporabi
            </button>
          </div>
          {discountApplied && (
            <p className="text-xs text-green-600 -mt-2 mb-3">Koda je bila uspešno uporabljena.</p>
          )}

          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Skupaj za plačilo</span>
            <span className="font-bold text-xl text-gray-900">{discountApplied ? Math.round(chosen.price * 0.9) : chosen.price}€</span>
          </div>
        </div>

        {/* Payment placeholder */}
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4 mb-5 text-center">
          <p className="text-sm text-indigo-700 font-medium mb-1">Podatki za plačilo</p>
          <p className="text-xs text-indigo-500">Integracija s Stripe prihaja kmalu. Kontaktirajte nas na <a href="mailto:hello@guestcam.si" className="underline">hello@guestcam.si</a> za ročno aktivacijo paketa.</p>
        </div>

        {/* CTA */}
        <button
          className="w-full py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 mb-4"
          style={{ background: "#4F46E5" }}
          onClick={() => {
            // TODO: redirect to Stripe checkout
            alert("Plačilo bo kmalu na voljo. Kontaktirajte nas na hello@guestcam.si.");
          }}
        >
          Nadgradi na {chosen.name} za {discountApplied ? Math.round(chosen.price * 0.9) : chosen.price}€ →
        </button>

        <p className="text-center text-xs text-gray-400">
          Z nakupom se strinjate s{" "}
          <a href="/pogoji" className="underline hover:text-gray-600">pogoji uporabe</a>.
          {" "}30-dnevna garancija vračila denarja.
        </p>
      </div>
    </div>
  );
}
