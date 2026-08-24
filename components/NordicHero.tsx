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
  /** Optional secondary action (demo). */
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
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-11 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">

          {/* ── Copy column ─────────────────────────────────────────── */}
          <div className="lg:col-span-6 gc-rise text-center lg:text-left">
            <p
              className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.19em] mb-4 sm:mb-5"
              style={{ color: "var(--honey)" }}
            >
              {eyebrow}
            </p>

            <h1
              className="font-semibold tracking-[-0.035em] max-w-[14ch] mx-auto lg:max-w-none lg:mx-0"
              style={{
                color: "var(--ink)",
                fontSize: "clamp(2.45rem, 9.6vw, 3.3rem)",
                lineHeight: 1.04,
              }}
            >
              {headLead}{" "}
              <span style={{ color: "var(--honey)" }}>{headAccent}</span>
              {headTrail}
            </h1>

            <p
              className="mt-5 sm:mt-6 text-[15px] sm:text-lg leading-[1.65] max-w-[38rem] lg:max-w-[46ch] mx-auto lg:mx-0"
              style={{ color: "var(--muted)" }}
            >
              {lead}
            </p>

            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-x-7 sm:gap-y-4 max-w-md mx-auto lg:max-w-none lg:mx-0">
              <Link
                href={ctaHref}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full text-[15px] sm:text-base font-semibold transition-transform duration-200 active:scale-[0.98]"
                style={{ background: "var(--ink)", color: "var(--paper)" }}
              >
                {ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {demoSlot}
            </div>

            <p className="mt-4 sm:mt-6 text-[13px] sm:text-sm" style={{ color: "var(--muted)" }}>
              {note}
            </p>

            {printOffer ? (
              <div className="mt-5 sm:mt-7 max-w-md mx-auto lg:max-w-none lg:mx-0 [&>div]:w-full">
                {printOffer}
              </div>
            ) : null}
          </div>

          {/* ── Photograph column ───────────────────────────────────── */}
          <div className="lg:col-span-6 gc-rise gc-rise-late">
            <div className="relative max-w-xl mx-auto lg:max-w-none">
              <div
                className="relative overflow-hidden rounded-xl"
                style={{ aspectRatio: "4 / 3", boxShadow: "0 20px 48px rgba(20,24,31,.12)" }}
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

      <div className="h-px" style={{ background: "var(--hairline)" }} />
    </section>
  );
}