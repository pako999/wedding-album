import Link from "next/link";
import type { ReactNode } from "react";

/**
 * ConfettiHero — the loud, playful counterpart to DarkStageHero.
 *
 * A bright party-invitation stage: soft peach/cream gradient, oversized
 * blurred colour blobs, scattered confetti shapes and tilted polaroids
 * of real event photos, with a sticker-style badge pinned to the
 * headline. Everything is CSS — no JS, no extra image weight beyond the
 * four hero photos the site already ships.
 *
 * Text sits in the middle column with confetti/polaroids pushed to the
 * outer thirds, so nothing ever lands on the headline. Decoration is
 * hidden under prefers-reduced-motion and thinned right down on phones.
 */

/** Confetti pieces. `x`/`y` are percentages; the middle band (34–66%)
 *  is deliberately left empty so nothing collides with the copy. */
const CONFETTI = [
  { x: "4%",  y: "12%", c: "#FFC94D", s: 16, r: "18deg",  shape: "rect", d: "0s"    },
  { x: "11%", y: "34%", c: "#F472B6", s: 12, r: "-24deg", shape: "rect", d: "-1.2s" },
  { x: "7%",  y: "62%", c: "#34D399", s: 14, r: "40deg",  shape: "dot",  d: "-2.4s" },
  { x: "17%", y: "78%", c: "#38BDF8", s: 11, r: "12deg",  shape: "rect", d: "-0.6s" },
  { x: "24%", y: "18%", c: "#A78BFA", s: 13, r: "-14deg", shape: "dot",  d: "-3s"   },
  { x: "29%", y: "52%", c: "#FB7185", s: 10, r: "30deg",  shape: "rect", d: "-1.8s" },
  { x: "70%", y: "16%", c: "#34D399", s: 13, r: "22deg",  shape: "rect", d: "-2.1s" },
  { x: "76%", y: "44%", c: "#FFC94D", s: 15, r: "-18deg", shape: "dot",  d: "-0.9s" },
  { x: "84%", y: "26%", c: "#38BDF8", s: 12, r: "36deg",  shape: "rect", d: "-3.3s" },
  { x: "89%", y: "60%", c: "#F472B6", s: 14, r: "-30deg", shape: "rect", d: "-1.5s" },
  { x: "93%", y: "14%", c: "#A78BFA", s: 10, r: "16deg",  shape: "dot",  d: "-2.7s" },
  { x: "81%", y: "80%", c: "#FFC94D", s: 12, r: "-20deg", shape: "rect", d: "-0.3s" },
] as const;

/** Tilted polaroids of real photos, pinned to the outer corners. */
const POLAROIDS = [
  { src: "/hero/scan.webp",    pos: "left-[2%] top-[14%]",     w: "w-32 lg:w-44", rot: "-8deg", d: "-0.4s", hideSm: false },
  { src: "/hero/gallery.webp", pos: "left-[6%] bottom-[10%]",  w: "w-28 lg:w-40", rot: "6deg",  d: "-2.2s", hideSm: true  },
  { src: "/hero/cards.webp",   pos: "right-[3%] top-[18%]",    w: "w-28 lg:w-40", rot: "9deg",  d: "-1.4s", hideSm: true  },
  { src: "/hero/guestcam-hero-photo.webp", pos: "right-[6%] bottom-[12%]", w: "w-32 lg:w-44", rot: "-6deg", d: "-3.1s", hideSm: false },
] as const;

interface Props {
  eyebrow: string;
  headLead: string;
  headAccent: string;
  headTrail?: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
  note: string;
  /** Sticker badge text, e.g. "500+ dogodkov". */
  sticker: string;
  demoSlot?: ReactNode;
}

export function ConfettiHero({ eyebrow, headLead, headAccent, headTrail, lead, ctaHref, ctaLabel, note, sticker, demoSlot }: Props) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(165deg, #FFF6E5 0%, #FFEFE2 38%, #FDE9F0 72%, #F3EEFF 100%)" }}
    >
      {/* Oversized soft blobs — colour without hard edges */}
      <div className="absolute -top-32 -left-24 w-[30rem] h-[30rem] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle,#FFD98A,transparent 68%)" }} aria-hidden />
      <div className="absolute -bottom-40 -right-20 w-[34rem] h-[34rem] rounded-full opacity-45 blur-3xl" style={{ background: "radial-gradient(circle,#F9A8D4,transparent 68%)" }} aria-hidden />
      <div className="hidden lg:block absolute top-1/4 right-1/3 w-80 h-80 rounded-full opacity-35 blur-3xl" style={{ background: "radial-gradient(circle,#A5D8FF,transparent 68%)" }} aria-hidden />

      {/* Confetti */}
      <div className="absolute inset-0" aria-hidden>
        {CONFETTI.map((p, i) => (
          <span
            key={i}
            className="gc-confetti absolute block"
            style={{
              left: p.x,
              top: p.y,
              width: p.s,
              height: p.shape === "dot" ? p.s : Math.round(p.s * 0.55),
              background: p.c,
              borderRadius: p.shape === "dot" ? "9999px" : "3px",
              rotate: p.r,
              animation: `gc-confetti-bob 6.5s ease-in-out ${p.d} infinite`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Polaroids */}
      <div className="absolute inset-0" aria-hidden>
        {POLAROIDS.map((p, i) => (
          <div
            key={i}
            className={`gc-confetti absolute ${p.pos} ${p.w} ${p.hideSm ? "hidden md:block" : "hidden sm:block"} bg-white rounded-lg p-2 pb-6 shadow-[0_18px_44px_rgba(15,23,41,0.18)]`}
            style={{ rotate: p.rot, animation: `gc-float 7s ease-in-out ${p.d} infinite` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" loading={i < 2 ? "eager" : "lazy"} className="w-full aspect-square object-cover rounded" />
          </div>
        ))}
      </div>

      {/* ── Centre content ───────────────────────────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pt-20 pb-20 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-white px-4 py-1.5 mb-6 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9820A] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9820A]" />
          </span>
          <p className="text-[11px] sm:text-xs font-bold tracking-wide text-gray-700">{eyebrow}</p>
        </div>

        <div className="relative inline-block">
          {/* Sticker badge — rotated, pinned to the headline's corner */}
          <span
            className="hidden sm:flex absolute -top-6 -right-8 lg:-right-14 z-20 items-center gap-1 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-[#0F1729] shadow-lg"
            style={{ background: "#FFC94D", rotate: "-12deg", border: "2px solid #fff" }}
          >
            ★ {sticker}
          </span>

          <h1
            className="font-extrabold text-[#0F1729] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.4rem)", lineHeight: 1.06 }}
          >
            {headLead}{" "}
            <span className="relative inline-block">
              {/* Chunky sticker highlight behind the accent words */}
              <span
                className="absolute -inset-x-2 inset-y-1 -z-[1] rounded-xl"
                style={{ background: "linear-gradient(135deg,#FFD966,#FFC94D)", rotate: "-1.5deg" }}
                aria-hidden
              />
              <span className="relative">{headAccent}</span>
            </span>
            {headTrail}
          </h1>
        </div>

        <p className="mt-7 text-base sm:text-xl leading-relaxed text-gray-600 max-w-xl mx-auto">{lead}</p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2.5 px-9 sm:px-11 py-4 sm:py-5 rounded-full text-[#0F1729] font-extrabold text-base sm:text-lg transition-all duration-200 hover:scale-[1.04] hover:-rotate-1"
            style={{
              background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
              boxShadow: "0 14px 34px rgba(255,201,77,.55)",
            }}
          >
            {ctaLabel}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {demoSlot}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {note}
        </p>
      </div>
    </div>
  );
}
