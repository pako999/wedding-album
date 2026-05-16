import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { createAlbum } from "@/app/actions/create-album";

export const dynamic = "force-dynamic";

export default async function NewAlbumPage() {
  try {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  } catch {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen" style={{ background: "#FDF4F5" }}>
      <DashboardNav />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-14">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2C2825] transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Nazaj na albume
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#C4738A]/15 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-7 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #FDF4F5, #FEF2F4)" }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(196,115,138,0.12)" }}>
                <svg className="w-5 h-5" style={{ color: "#C4738A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-light text-[#2C2825]">Novi poročni album</h1>
            </div>
            <p className="text-sm text-gray-400 ml-13">Ustvarite album in delite QR kodo z gosti.</p>
          </div>

          {/* Form */}
          <form action={createAlbum} className="px-8 py-8 space-y-6">

            {/* Couple name */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2825] mb-2">
                Ime para <span style={{ color: "#C4738A" }}>*</span>
              </label>
              <input
                name="coupleName"
                required
                placeholder="npr. Ana & Marko"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none transition-all focus:border-[#C4738A] focus:ring-2"
                style={{ "--tw-ring-color": "rgba(196,115,138,0.15)" } as React.CSSProperties}
              />
              <p className="text-xs text-gray-400 mt-1.5">Prikaže se gostom na vrhu albuma.</p>
            </div>

            {/* Wedding date */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2825] mb-2">
                Datum poroke <span style={{ color: "#C4738A" }}>*</span>
              </label>
              <input
                type="date"
                name="weddingDate"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none focus:border-[#C4738A] focus:ring-2 transition-all"
                style={{ "--tw-ring-color": "rgba(196,115,138,0.15)" } as React.CSSProperties}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2825] mb-2">
                Lokacija <span className="text-gray-400 font-normal">(neobvezno)</span>
              </label>
              <input
                name="location"
                placeholder="npr. Grad Bogenšperk, Slovenija"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none focus:border-[#C4738A] focus:ring-2 transition-all"
                style={{ "--tw-ring-color": "rgba(196,115,138,0.15)" } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2C2825] mb-2">
                Geslo albuma <span className="text-gray-400 font-normal">(neobvezno)</span>
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  name="password"
                  type="text"
                  placeholder="Pustite prazno za javni dostop"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-[#2C2825] text-sm outline-none focus:border-[#C4738A] focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": "rgba(196,115,138,0.15)" } as React.CSSProperties}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Gosti bodo morali vnesti geslo za ogled in dodajanje fotografij.</p>
            </div>

            {/* Info strip */}
            <div className="rounded-2xl p-4 flex items-start gap-3 text-sm" style={{ background: "rgba(196,115,138,0.06)", border: "1px solid rgba(196,115,138,0.15)" }}>
              <span className="shrink-0" style={{ color: "#C4738A" }}>✨</span>
              <p className="text-gray-500 leading-relaxed">
                Album se ustvari z <strong className="text-[#2C2825]">brezplačnim</strong> paketom (do 200 fotografij).
                Nadgradnjo na Plus ali Premium lahko opravite kadarkoli.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-200"
              style={{ background: "#C4738A", boxShadow: "0 6px 20px rgba(196,115,138,0.3)" }}
            >
              Ustvari album →
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Po ustvarjanju boste dobili edinstveno QR kodo za vaše goste.
        </p>
      </main>
    </div>
  );
}
