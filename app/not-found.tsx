import Link from "next/link";
import type { Metadata } from "next";
import { GuestcamLogo } from "@/components/GuestcamLogo";

/**
 * Global 404 page — rendered for any request that doesn't match a
 * route AND for any explicit `notFound()` call from a server
 * component (used by /<slug> when an album is missing, by /dashboard/
 * <slug> when the visitor isn't the owner, by /admin/* under
 * the same conditions, etc.).
 *
 * We deliberately render a 404 with a clear "back to home" CTA
 * rather than auto-redirecting. Auto-redirects on 404 hurt SEO
 * (search engines see the bounce as a soft-404 of the homepage)
 * and confuse users who mistyped a URL — they don't realise their
 * link was wrong, they just end up on the homepage with no
 * explanation.
 */

export const metadata: Metadata = {
  title: "Stran ni najdena · Guestcam",
  description: "Iskane strani ni mogoče najti.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#F2F4F8" }}
    >
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" aria-label="Guestcam">
            <GuestcamLogo size="md" showMark={true} />
          </Link>
        </div>

        <p className="text-[88px] sm:text-[110px] leading-none font-serif font-light text-[#FFC94D] mb-2">
          404
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#0F1729] mb-3">
          Stran ne obstaja
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Povezava je morda zastarela ali napačno vnesena. Vrnite se na začetno
          stran ali si oglejte naš blog za vodnike o zbiranju fotografij.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3 rounded-full text-sm font-bold text-[#0F1729] transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
              boxShadow: "0 6px 18px rgba(255,201,77,0.45)",
            }}
          >
            ← Nazaj na začetno
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:border-[#FFC94D] hover:text-[#0F1729] transition-colors"
          >
            Pojdi na blog
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">
          Iščete svojo galerijo?{" "}
          <Link href="/dashboard" className="underline hover:text-[#0F1729]">
            Prijavite se v nadzorno ploščo
          </Link>
        </p>
      </div>
    </main>
  );
}
