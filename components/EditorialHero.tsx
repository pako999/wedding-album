import Link from "next/link";
import type { ReactNode } from "react";

/**
 * EditorialHero — the quiet, luxury counterpart to DarkStage and Confetti.
 *
 * A wedding-magazine cover: ivory paper, a very large Cormorant serif
 * headline with the accent set in italic, generous whitespace, hairline
 * rules, and a single duotone-warm photograph doing the talking. No
 * animation beyond one slow reveal — restraint IS the design here, and
 * it signals a higher price point than a loud page can.
 *
 * The layout is an asymmetric editorial grid: 7 columns of type, 5 of
 * image, with a thin rule and small-caps metadata line borrowed from
 * print. Stacks to a single centred column on phones.
 */

interface Props {
  /** Small-caps kicker above the rule, e.g. the eyebrow line. */
  kicker: string;
  headLead: string;
  /** Set in italic serif — the emphasis word(s). */
  headAccent: string;
  headTrail?: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
  note: string;
  /** Right-hand metadata column, print-style. */
  meta: { label: string; value: string }[];
  demoSlot?: ReactNode;
}

export function EditorialHero({ kicker, headLead, headAccent, headTrail, lead, ctaHref, ctaLabel, note, meta, demoSlot }: Props) {
  return (
    <div className="relative overflow-hidden" style={{ background: "#FBF9F4" }}>
      {/* Faint paper warmth in the corners — no hard edges, no colour blocks */}
      <div className="absolute -top-40 -right-32 w-[38rem] h-[38rem] rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle,#F3E6CE,transparent 70%)" }} aria-hidden />
      <div className="absolute -bottom-48 -left-40 w-[34rem] h-[34rem] rounded-full opacity-30 blur-3xl" style={{ background: "radial-gradient(circle,#EADFD0,transparent 70%)" }} aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24">
        {/* Masthead rule + kicker, straight out of print */}
        <div className="flex items-center gap-5 mb-12 sm:mb-16">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: "#A18F72" }}>
            {kicker}
          </span>
          <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg,#DED2BE,transparent)" }} aria-hidden />
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ── Type column ─────────────────────────────────────────── */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1
              className="font-serif text-[#20242C]"
              style={{ fontSize: "clamp(2.9rem, 6.6vw, 5.2rem)", lineHeight: 1.02, fontWeight: 300, letterSpacing: "-0.015em" }}
            >
              {headLead}{" "}
              <em className="italic" style={{ color: "#B08D4F", fontWeight: 400 }}>
                {headAccent}
              </em>
              {headTrail}
            </h1>

            {/* Short rule under the headline — print convention */}
            <span className="block w-16 h-px mx-auto lg:mx-0 my-8" style={{ background: "#C9B896" }} aria-hidden />

            <p className="text-base sm:text-lg leading-[1.8] text-[#5A5C63] max-w-md mx-auto lg:mx-0">
              {lead}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-5">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-3 px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:gap-4"
                style={{ background: "#20242C" }}
              >
                {ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {demoSlot}
            </div>

            <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-[#9A9691]">{note}</p>
          </div>

          {/* ── Image column ────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <figure className="relative">
              <div className="relative overflow-hidden" style={{ animation: "gc-reveal 1.1s cubic-bezier(.2,.7,.2,1) both" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero/guestcam-hero-photo.webp"
                  alt=""
                  width={794}
                  height={930}
                  fetchPriority="high"
                  className="w-full h-auto"
                  style={{ filter: "saturate(.82) contrast(1.03)" }}
                />
                {/* Warm duotone wash — unifies any photo with the paper */}
                <span className="absolute inset-0 mix-blend-multiply pointer-events-none" style={{ background: "linear-gradient(160deg, rgba(243,230,206,.42), rgba(176,141,79,.14))" }} aria-hidden />
              </div>

              {/* Print-style metadata, hairline-separated */}
              <figcaption className="mt-7 divide-y" style={{ borderColor: "#E4DACA" }}>
                {meta.map((m) => (
                  <div key={m.label} className="flex items-baseline justify-between gap-4 py-2.5" style={{ borderTop: "1px solid #E4DACA" }}>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#A6A29B]">{m.label}</span>
                    <span className="font-serif text-lg text-[#20242C]">{m.value}</span>
                  </div>
                ))}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
