import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * NordicHero — the light, editorial replacement for DarkStageHero.
 *
 * The dark stage read as "AI landing page": centred stack, saturated
 * gold glow, photos animated as decoration. This is the opposite move.
 * The page is warm paper, the only colour comes from the photographs,
 * and the composition is a plain editorial split: copy on a left axis,
 * two real photographs on the right at different sizes so the eye has a
 * path. No rotation, no drift, no gradients.
 *
 * Contrast is measured, not eyeballed (WCAG AA):
 *   ink   #14181F on paper #F7F6F2 = 16.45:1
 *   muted #5A6068 on paper         =  5.87:1
 *   honey #8C6218 on paper         =  5.01:1  (accent that survives body text)
 *   paper on ink CTA               = 16.45:1
 *
 * The only motion is a short entry fade, gated on prefers-reduced-motion
 * in globals.css. Photography carries the page; motion does not.
 */

interface Props {
  eyebrow: string;
  headLead: string;
  headAccent: string;
  headTrail?: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
  note: string;
  /** Optional secondary action (demo), rendered as a quiet text link. */
  demoSlot?: ReactNode;
  /** Printed-stands offer, below the reassurance line. */
  printOffer?: ReactNode;
  /** Primary and secondary photographs. Real event photos only. */
  primaryPhoto: { src: string; alt: string };
  secondaryPhoto?: { src: string; alt: string };
}

export function NordicHero({
  eyebrow, headLead, headAccent, headTrail, lead,
  ctaHref, ctaLabel, note, demoSlot, printOffer,
  primaryPhoto, secondaryPhoto,
}: Props) {
  return (
    <section className="relative" style={{ background: "var(--paper)" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* ── Copy column ─────────────────────────────────────────── */}
          <div className="lg:col-span-6 gc-rise">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-5"
              style={{ color: "var(--honey)" }}
            >
              {eyebrow}
            </p>

            <h1
              className="font-semibold tracking-tight"
              style={{
                color: "var(--ink)",
                // Scale planned around the photo: 5-word headline, two
                // lines at desktop, never four.
                // Capped at 3.3rem: at 3.9rem a long Slovenian or German
                // headline broke to three lines, which is a font-size error.
                fontSize: "clamp(2.1rem, 3.7vw, 3.3rem)",
                lineHeight: 1.08,
              }}
            >
              {headLead}{" "}
              <span style={{ color: "var(--honey)" }}>{headAccent}</span>
              {headTrail}
            </h1>

            <p
              className="mt-6 text-base sm:text-lg leading-relaxed max-w-[46ch]"
              style={{ color: "var(--muted)" }}
            >
              {lead}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm sm:text-base font-semibold transition-transform duration-200 active:scale-[0.98]"
                style={{ background: "var(--ink)", color: "var(--paper)" }}
              >
                {ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {demoSlot}
            </div>

            <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>
              {note}
            </p>

            {printOffer ? <div className="mt-7">{printOffer}</div> : null}
          </div>

          {/* ── Photograph column ───────────────────────────────────── */}
          {/* Two sizes, one overlap, no rotation: an editorial pairing
              rather than a scattered collage. The companion frame sits
              INSIDE the primary vertically and only breaks the left edge, so
              it never spills past the section hairline. Hidden from assistive tech
              only for the decorative second frame; the lead photo keeps
              a real alt. */}
          <div className="lg:col-span-6 gc-rise gc-rise-late">
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-xl"
                style={{ aspectRatio: "4 / 3", boxShadow: "0 24px 60px rgba(20,24,31,.14)" }}
              >
                <Image
                  src={primaryPhoto.src}
                  alt={primaryPhoto.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>

              {secondaryPhoto && (
                <div
                  className="hidden sm:block absolute bottom-6 -left-6 lg:-left-10 w-32 lg:w-40 overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: "3 / 4",
                    border: "5px solid var(--paper)",
                    boxShadow: "0 18px 40px rgba(20,24,31,.16)",
                  }}
                >
                  <Image
                    src={secondaryPhoto.src}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hairline close, not a coloured band: the section ends where the
          next one begins, with no decorative divider. */}
      <div className="h-px" style={{ background: "var(--hairline)" }} />
    </section>
  );
}
