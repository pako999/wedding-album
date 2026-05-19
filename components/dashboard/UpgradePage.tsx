"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Album } from "@/lib/db/schema";

type PlanId = "free" | "basic" | "plus" | "premium";

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  originalPrice: number;
  tagline: string;
  features: string[];
}

const FREE_FEATURES = [
  "QR koda za mizo",
  "Do 20 fotografij",
  "1 videoposnetek",
  "Dostop 30 dni",
  "Brez varnostne kopije",
];

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "BASIC",
    price: 39,
    originalPrice: 55,
    tagline: "Osnovne funkcionalnosti",
    features: [
      "QR koda za mizo",
      "Do 1000 fotografij",
      "Do 10 videoposnetkov",
      "Prenos vseh slik (ZIP)",
      "Dostop 3 mesece",
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
      "Do 100 videoposnetkov",
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
      "Neomejeno fotografij",
      "Do 100 videoposnetkov",
      "Prenos vseh slik (ZIP)",
      "Dostop 1 leto",
      "Live galerija",
      "Personalizirana stran",
      "Premium predloge",
      "Lasten napis na QR kartici",
      "Prioritetna podpora",
    ],
  },
];

interface EventCopy {
  emoji: string;
  title: string;
  testimonialText: string;
  testimonialName: string;
  testimonialSub: string;
  socialProof: string;
}

function getEventCopy(eventType: string): EventCopy {
  switch (eventType) {
    case "birthday":
      return {
        emoji: "🎂",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Guestcam je bil hit na mojem rojstnem dnevu! Vsi so delili fotografije in video v živo.",
        testimonialName: "Janko",
        testimonialSub: "50. rojstni dan 2026",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🎂",
      };
    case "anniversary":
      return {
        emoji: "🥂",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Popoln način za zbiranje spominov ob naši obletnici. Vse fotografije na enem mestu!",
        testimonialName: "Maja & Peter",
        testimonialSub: "25. obletnica 2025",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🥂",
      };
    case "party":
      return {
        emoji: "🎉",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Fantastičen način za zbiranje foto-spominov s zabave. Vsi gostje so navdušeni!",
        testimonialName: "Nina",
        testimonialSub: "Maturantska zabava 2025",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🎉",
      };
    case "graduation":
      return {
        emoji: "🎓",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Vsi sošolci so naložili fotografije z mature. Neprecenljiv spomin za vse!",
        testimonialName: "Razred 2025",
        testimonialSub: "Matura 2025",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🎓",
      };
    case "baptism":
      return {
        emoji: "🕊️",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Lepa galerija za krst naše hčerke. Vsi sorodniki so delili fotografije!",
        testimonialName: "Ana & Luka",
        testimonialSub: "Krst 2025",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🕊️",
      };
    default: // wedding
      return {
        emoji: "💍",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Guestcam je bila najboljša odločitev za naše goste. Vse fotografije na enem mestu, brez aplikacij!",
        testimonialName: "Ana & Marko",
        testimonialSub: "Poročena 2025",
        socialProof: "500+ porok je že zbralo spomine z Guestcam 💍",
      };
  }
}

interface Props {
  album: Album;
}

export function UpgradePage({ album }: Props) {
  const router = useRouter();
  const copy = getEventCopy(album.eventType ?? "wedding");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("premium");
  const [expandedPlan, setExpandedPlan] = useState<PlanId>("premium");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [tableStandsSelected, setTableStandsSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          <div className="text-4xl mb-2">{copy.emoji}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{copy.title}</h1>
          <p className="text-sm text-gray-500 font-medium">{album.coupleName}</p>
          <p className="text-sm text-gray-400">Izberite paket in zaključite nakup.</p>
        </div>

        {/* Free plan display (current / comparison) */}
        <div className="bg-white rounded-xl border-2 border-gray-200 mb-3 opacity-70">
          <div className="flex items-center gap-3 p-4">
            {/* Inactive radio */}
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-500">BREZPLAČNO</span>
                <span className="text-xs text-gray-400">Vaš trenutni paket</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="font-bold text-gray-400">0€</span>
            </div>
          </div>
          {/* Features */}
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-gray-100 pt-3 space-y-2">
              {FREE_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paid plan cards */}
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
          <p className="text-sm font-semibold text-purple-700">{copy.socialProof}</p>
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
            &ldquo;{copy.testimonialText}&rdquo;
          </p>
          <p className="text-xs font-semibold text-gray-800">{copy.testimonialName}</p>
          <p className="text-xs text-gray-400">{copy.testimonialSub}</p>
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
            <button
              onClick={() => setTableStandsSelected((prev) => !prev)}
              className={`px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors whitespace-nowrap ${
                tableStandsSelected
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {tableStandsSelected ? "Dodano ✓" : "Dodaj +9€"}
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

        {/* CTA */}
        <button
          className="w-full py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 mb-4 flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "#4F46E5" }}
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            try {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlan, albumSlug: album.slug, tableStands: tableStandsSelected }),
              });
              const { url, error } = await res.json();
              if (error) throw new Error(error);
              window.location.href = url;
            } catch (err) {
              alert("Napaka pri plačilu. Prosimo, poskusite znova ali nas kontaktirajte na hello@guestcam.si");
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
              Preusmeritev…
            </>
          ) : (
            <>Nadgradi na {chosen.name} za {discountApplied ? Math.round(chosen.price * 0.9) : chosen.price}€ →</>
          )}
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
