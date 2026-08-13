import Link from "next/link";
import { GuestcamLogo } from "@/components/GuestcamLogo";

const columns = [
  {
    title: "Produkt",
    links: [
      ["Kako deluje", "#how"],
      ["Funkcionalnosti", "#features"],
      ["Live Photo Wall", "#features"],
      ["Cenik", "/#pricing"],
      ["Ustvari galerijo", "/dashboard/new"],
    ],
  },
  {
    title: "Za dogodke",
    links: [
      ["Poroke", "#events"],
      ["Rojstni dnevi", "#events"],
      ["Baby shower", "#events"],
      ["Poslovni dogodki", "#events"],
      ["Mature in zabave", "#events"],
    ],
  },
  {
    title: "Guestcam",
    links: [
      ["Blog", "/blog"],
      ["Kontakt", "/contact"],
      ["Partnerski program", "/affiliate/apply"],
      ["Prijava", "/dashboard"],
    ],
  },
] as const;

export function KululuPreviewFooter() {
  return (
    <>
      <style>{`.kululu-footer-upgrade main > footer { display: none !important; }`}</style>
      <footer className="bg-[#0F1729] text-white">
        <div className="mx-auto max-w-[1180px] px-5 pb-8 pt-16 sm:px-8 sm:pb-10 sm:pt-20">
          <div className="grid gap-12 border-b border-white/12 pb-14 lg:grid-cols-[1.35fr_2fr] lg:gap-20">
            <div>
              <GuestcamLogo size="sm" showMark variant="onDark" />
              <p className="mt-5 max-w-[390px] text-[15px] leading-7 text-white/55">
                Zberi fotografije in videe vseh gostov z eno QR kodo. Brez aplikacije, brez registracije in brez lovljenja slik po dogodku.
              </p>

              <Link
                href="/dashboard/new"
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFC94D] px-6 text-sm font-extrabold text-[#0F1729] transition-transform hover:-translate-y-0.5"
              >
                Ustvari svoj QR album →
              </Link>

              <div className="mt-8 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/guestcam.si"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Guestcam na Instagramu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/65 transition-colors hover:border-white/35 hover:text-white"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.25-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.66-4.77 4.92-4.92C8.42 2.17 8.8 2.16 12 2.16Zm0 5.68a4.16 4.16 0 1 0 0 8.32 4.16 4.16 0 0 0 0-8.32Zm5.68-.84a.97.97 0 1 0 0 1.94.97.97 0 0 0 0-1.94Z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/guestcam.si"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Guestcam na Facebooku"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/65 transition-colors hover:border-white/35 hover:text-white"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.92-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07Z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
              {columns.map((column) => (
                <div key={column.title}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#FFC94D]">{column.title}</p>
                  <ul className="mt-5 space-y-3.5">
                    {column.links.map(([label, href]) => (
                      <li key={label}>
                        {href.startsWith("#") ? (
                          <a href={href} className="text-sm text-white/58 transition-colors hover:text-white">{label}</a>
                        ) : (
                          <Link href={href} className="text-sm text-white/58 transition-colors hover:text-white">{label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-7 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Guestcam.si · Vsi spomini na enem mestu.</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/privacy" className="transition-colors hover:text-white">Zasebnost</Link>
              <Link href="/terms" className="transition-colors hover:text-white">Pogoji uporabe</Link>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <Link href="/" className="transition-colors hover:text-white">SL</Link>
              <Link href="/hr" className="transition-colors hover:text-white">HR</Link>
              <Link href="/sr" className="transition-colors hover:text-white">SR</Link>
              <Link href="/en" className="transition-colors hover:text-white">EN</Link>
              <Link href="/de" className="transition-colors hover:text-white">DE</Link>
              <Link href="/es" className="transition-colors hover:text-white">ES</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
