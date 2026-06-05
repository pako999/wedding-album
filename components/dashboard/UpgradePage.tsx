"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Album } from "@/lib/db/schema";

// ── Paddle.js loader ──────────────────────────────────────────────────────────
// Loaded from the CDN on demand (no npm dep). Initialized once with the public
// client token; the eventCallback fires our redirect on checkout.completed.
interface PaddleCheckout {
  Checkout: { open: (opts: { transactionId: string }) => void };
  Environment: { set: (env: string) => void };
  Initialize: (opts: { token: string; eventCallback?: (ev: { name?: string }) => void }) => void;
}
declare global {
  interface Window { Paddle?: PaddleCheckout }
}

let paddleReady: Promise<PaddleCheckout> | null = null;
let paddleInitialized = false;
let onCheckoutComplete: (() => void) | null = null;

function loadPaddle(): Promise<PaddleCheckout> {
  if (paddleReady) return paddleReady;
  paddleReady = new Promise<PaddleCheckout>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.Paddle) return resolve(window.Paddle);
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error("Paddle.js missing")));
    s.onerror = () => reject(new Error("Failed to load Paddle.js"));
    document.head.appendChild(s);
  });
  return paddleReady;
}

async function ensurePaddle(): Promise<PaddleCheckout> {
  const Paddle = await loadPaddle();
  if (!paddleInitialized) {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) throw new Error("Paddle client token not configured");
    if (process.env.NEXT_PUBLIC_PADDLE_ENV !== "live") Paddle.Environment.set("sandbox");
    Paddle.Initialize({
      token,
      eventCallback: (ev) => {
        if (ev?.name === "checkout.completed") onCheckoutComplete?.();
      },
    });
    paddleInitialized = true;
  }
  return Paddle;
}

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
        testimonialSub: "25. obletnica 2026",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🥂",
      };
    case "party":
      return {
        emoji: "🎉",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Fantastičen način za zbiranje foto-spominov s zabave. Vsi gostje so navdušeni!",
        testimonialName: "Nina",
        testimonialSub: "Maturantska zabava 2026",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🎉",
      };
    case "graduation":
      return {
        emoji: "🎓",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Vsi sošolci so naložili fotografije z mature. Neprecenljiv spomin za vse!",
        testimonialName: "Razred 2026",
        testimonialSub: "Matura 2026",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🎓",
      };
    case "baptism":
      return {
        emoji: "🕊️",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Lepa galerija za krst naše hčerke. Vsi sorodniki so delili fotografije!",
        testimonialName: "Ana & Luka",
        testimonialSub: "Krst 2026",
        socialProof: "500+ galerij je bilo že ustvarjenih letos 🕊️",
      };
    default: // wedding
      return {
        emoji: "💍",
        title: "Odklenite vse zmogljivosti",
        testimonialText: "Guestcam je bila najboljša odločitev za naše goste. Vse fotografije na enem mestu, brez aplikacij!",
        testimonialName: "Ana & Marko",
        testimonialSub: "Poročena 2026",
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
  // Honour a ?plan=... query param so a click on a homepage pricing card
  // lands on the upgrade screen with that plan already chosen and expanded.
  const searchParams = useSearchParams();
  const initialPlan: PlanId = (() => {
    const p = searchParams.get("plan");
    return p === "basic" || p === "plus" || p === "premium" ? p : "premium";
  })();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(initialPlan);
  const [expandedPlan, setExpandedPlan] = useState<PlanId>(initialPlan);
  const [tableStandsSelected, setTableStandsSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "invoice">("card");
  const [invoiceDone, setInvoiceDone] = useState(false);

  const chosen = PLANS.find((p) => p.id === selectedPlan)!;

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
          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white" style={{ background: "#FFC94D" }}>
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
                style={{ borderColor: isSelected ? "#FFC94D" : "#e5e7eb" }}
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
                      borderColor: isSelected ? "#FFC94D" : "#d1d5db",
                      background: isSelected ? "#FFC94D" : "white",
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
              <p className="text-xs text-gray-400">Zavarovano s Paddle</p>
            </div>
          </div>
        </div>

        {/* Payment method toggle */}
        <div className="bg-white rounded-xl border mb-5 overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-xs font-semibold text-gray-500 px-4 pt-4 pb-2 uppercase tracking-widest">Način plačila</p>
          <div className="px-4 pb-4 space-y-2">
            {/* Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
              style={{ borderColor: paymentMethod === "card" ? "#FFC94D" : "#e5e7eb", background: paymentMethod === "card" ? "#FFFBF0" : "white" }}
            >
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: paymentMethod === "card" ? "#FFC94D" : "#d1d5db", background: paymentMethod === "card" ? "#FFC94D" : "white" }}>
                {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">💳 Plačilo s kartico</p>
                <p className="text-xs text-gray-400">Visa, Mastercard — takojšnja aktivacija</p>
              </div>
            </button>
            {/* Invoice */}
            <button
              type="button"
              onClick={() => setPaymentMethod("invoice")}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
              style={{ borderColor: paymentMethod === "invoice" ? "#FFC94D" : "#e5e7eb", background: paymentMethod === "invoice" ? "#FFFBF0" : "white" }}
            >
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: paymentMethod === "invoice" ? "#FFC94D" : "#d1d5db", background: paymentMethod === "invoice" ? "#FFC94D" : "white" }}>
                {paymentMethod === "invoice" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">🏦 Plačilo po predračunu</p>
                <p className="text-xs text-gray-400">Bančno nakazilo — predračun prejmete v 24 urah</p>
              </div>
            </button>
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

          {/* Discount code is entered inside the Paddle checkout overlay
              (Paddle Discounts with enabled_for_checkout). Keeping it off this
              screen avoids two places to enter the same code and stops us from
              having to validate codes twice. */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Skupaj za plačilo</span>
            <span className="font-bold text-xl text-gray-900">{chosen.price}€</span>
          </div>
        </div>

        {/* CTA */}
        {invoiceDone ? (
          <div className="w-full rounded-xl p-5 mb-4 text-center" style={{ background: "#F0FDF4", border: "2px solid #86EFAC" }}>
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-green-800 text-base mb-1">Naročilo prejeto!</p>
            <p className="text-sm text-green-700">Predračun vam pošljemo v 24 urah na vaš e-poštni naslov. Po plačilu bo paket <strong>{chosen.name}</strong> takoj aktiviran.</p>
          </div>
        ) : (
          <button
            className="w-full py-4 rounded-xl font-bold text-base transition-opacity hover:opacity-90 mb-4 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "#FFC94D", color: "#0F1729" }}
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                if (paymentMethod === "invoice") {
                  const res = await fetch("/api/bank-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId: selectedPlan, albumSlug: album.slug }),
                  });
                  const data = await res.json() as { success?: boolean; error?: string };
                  if (!res.ok || !data.success) throw new Error(data.error ?? "Napaka");
                  setInvoiceDone(true);
                  setIsLoading(false);
                } else {
                  const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId: selectedPlan, albumSlug: album.slug, tableStands: tableStandsSelected }),
                  });
                  const { transactionId, error } = await res.json() as { transactionId?: string; error?: string };
                  if (error || !transactionId) throw new Error(error ?? "no transaction");
                  const Paddle = await ensurePaddle();
                  onCheckoutComplete = () => {
                    window.location.href = `/dashboard/${album.slug}?upgraded=1&txn=${transactionId}`;
                  };
                  Paddle.Checkout.open({ transactionId });
                  setIsLoading(false);
                }
              } catch (err) {
                console.error("[checkout]", err);
                alert(paymentMethod === "invoice"
                  ? "Napaka pri oddaji naročila. Prosimo, pišite na hello@guestcam.si"
                  : "Napaka pri plačilu. Prosimo, poskusite znova ali nas kontaktirajte na hello@guestcam.si");
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
                {paymentMethod === "invoice" ? "Pošiljanje…" : "Preusmeritev…"}
              </>
            ) : paymentMethod === "invoice" ? (
              <>🏦 Oddaj naročilo po predračunu — {chosen.price}€</>
            ) : (
              <>Nadgradi na {chosen.name} za {chosen.price}€ →</>
            )}
          </button>
        )}

        <p className="text-center text-xs text-gray-400">
          Z nakupom se strinjate s{" "}
          <a href="/pogoji" className="underline hover:text-gray-600">pogoji uporabe</a>.
          {" "}30-dnevna garancija vračila denarja.
        </p>
      </div>
    </div>
  );
}
