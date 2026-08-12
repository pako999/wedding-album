import Link from "next/link";
import type { ReactNode } from "react";

/**
 * DarkStageHero — the homepage AS the Photo Wall.
 *
 * A cinematic near-black stage: real wedding photos drift slowly up the
 * full width of the screen (two depth layers, the back one blurred),
 * behind a huge headline whose accent word glows gold. A LIVE badge and
 * a floating "just shared" toast make it read as the product running,
 * not a decoration. Pure CSS animation — zero JS, and the drifting
 * cards are hidden entirely under prefers-reduced-motion.
 *
 * The section fades to #0F1729 at the bottom so the navy trust band
 * that follows on both homepages continues seamlessly.
 */

interface DriftCard {
  /** Horizontal lane, percent from the left. */
  lane: string;
  size: number;
  aspect: string;
  rot: string;
  dur: string;
  delay: string;
  src: string;
  /** Back layer: smaller, blurred, dimmer — cheap depth. */
  back?: boolean;
  /** Crowded on phones — some lanes only appear from sm up. */
  desktopOnly?: boolean;
}

// Real wedding photographs (customer-provided), not product-UI shots —
// the stage is meant to look like a live wall at an actual wedding.
// The four FRONT lanes each get a distinct photo; the blurred back lanes
// carry the remaining two plus one repeat, where the blur hides it.
const CARDS: DriftCard[] = [
  { lane: "3%",  size: 170, aspect: "3/4", rot: "-6deg", dur: "38s", delay: "-6s",  src: "/hero/wedding-walk.webp" },
  { lane: "16%", size: 120, aspect: "1/1", rot: "5deg",  dur: "47s", delay: "-24s", src: "/hero/wedding-stairs.webp", back: true },
  { lane: "30%", size: 145, aspect: "4/5", rot: "-4deg", dur: "42s", delay: "-33s", src: "/hero/wedding-lift.webp", desktopOnly: true },
  { lane: "44%", size: 110, aspect: "1/1", rot: "6deg",  dur: "50s", delay: "-12s", src: "/hero/wedding-castle.webp", back: true, desktopOnly: true },
  { lane: "58%", size: 160, aspect: "3/4", rot: "4deg",  dur: "40s", delay: "-19s", src: "/hero/wedding-avenue.webp" },
  { lane: "72%", size: 125, aspect: "1/1", rot: "-5deg", dur: "46s", delay: "-38s", src: "/hero/wedding-walk.webp", back: true, desktopOnly: true },
  { lane: "84%", size: 175, aspect: "4/5", rot: "5deg",  dur: "36s", delay: "-28s", src: "/hero/wedding-kiss.webp" },
];

interface Props {
  eyebrow: string;
  headLead: string;
  headAccent: string;
  headTrail?: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
  note: string;
  /** "Just shared" toast text, e.g. "Pravkar deljeno · Ana". */
  toast: string;
  /** Optional secondary action (demo button), rendered beside the CTA. */
  demoSlot?: ReactNode;
  /** Printed-stands offer. Sits BELOW the reassurance note rather than
   *  above the CTA: it's an add-on, and pushing it between the headline
   *  and the button would put a paid upsell in front of the free
   *  sign-up the whole hero is built to win. */
  printOffer?: ReactNode;
}

export function DarkStageHero({ eyebrow, headLead, headAccent, headTrail, lead, ctaHref, ctaLabel, note, toast, demoSlot, printOffer }: Props) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: "radial-gradient(130% 100% at 50% 0%, #1B2842 0%, #0B1220 62%, #0F1729 100%)" }}
    >
      {/* ── Drifting photo layer ─────────────────────────────────────── */}
      <div className="absolute inset-0" aria-hidden>
        {CARDS.map((c, i) => (
          <div
            key={i}
            className={`gc-hero-card absolute top-full rounded-xl overflow-hidden border-2 border-white/80 ${c.desktopOnly ? "hidden sm:block" : ""}`}
            style={{
              left: c.lane,
              width: c.size,
              aspectRatio: c.aspect,
              rotate: c.rot,
              animation: `gc-drift-hero ${c.dur} linear ${c.delay} infinite`,
              boxShadow: "0 18px 50px rgba(0,0,0,.55)",
              ...(c.back ? { filter: "blur(1.5px) brightness(.7)", opacity: 0.55, zIndex: 1 } : { opacity: 0.92, zIndex: 2 }),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.src} alt="" loading={i < 2 ? "eager" : "lazy"} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Vignette so the headline always wins over the photos */}
      <div
        className="absolute inset-0 z-[4]"
        style={{ background: "radial-gradient(ellipse 90% 62% at 50% 46%, rgba(11,18,32,.38) 0%, rgba(11,18,32,.82) 74%, rgba(15,23,41,.96) 100%)" }}
        aria-hidden
      />

      {/* LIVE badge */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-20 flex items-center gap-2 bg-black/45 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-white tracking-[0.2em]">LIVE</span>
      </div>

      {/* Floating "just shared" toast */}
      <div
        className="hidden sm:flex absolute top-[16%] left-[8%] z-20 items-center gap-2.5 bg-white/95 rounded-full pl-2 pr-4 py-2 shadow-[0_14px_36px_rgba(0,0,0,0.45)]"
        style={{ animation: "gc-float 5.5s ease-in-out infinite" }}
      >
        <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-[#0F1729]">{toast}</span>
      </div>

      {/* ── Centre content ───────────────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-36 lg:pb-32 text-center">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] mb-6" style={{ color: "#FFC94D" }}>
          {eyebrow}
        </p>

        <h1
          className="font-extrabold text-white tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 6.4vw, 4.9rem)", lineHeight: 1.05 }}
        >
          {headLead}{" "}
          <span
            style={{
              color: "#FFC94D",
              textShadow: "0 0 28px rgba(255,201,77,.55), 0 0 90px rgba(255,201,77,.28)",
            }}
          >
            {headAccent}
          </span>
          {headTrail}
        </h1>

        <p className="mt-7 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto text-gray-300">
          {lead}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2.5 px-9 sm:px-11 py-4 sm:py-5 rounded-full text-[#0F1729] font-bold text-base sm:text-lg transition-all duration-200 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
              boxShadow: "0 0 44px rgba(255,201,77,.5), 0 14px 36px rgba(255,201,77,.35)",
            }}
          >
            {ctaLabel}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {demoSlot}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {note}
        </p>

        {printOffer ? <div className="mt-6 flex justify-center">{printOffer}</div> : null}
      </div>
    </div>
  );
}
