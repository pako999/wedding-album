/**
 * WallMiniDemo — a self-animating miniature of the Photo Wall, drawn
 * entirely in CSS (no images, no client JS), so it can sit on the
 * marketing homepage and in the dashboard as a living product demo.
 *
 * Mirrors the real wall's anatomy: dark stage, one large "photo" in the
 * centre, small thumbnails drifting up the sides, LIVE badge, uploader
 * pill and a QR chip in the corner. The photos are real wedding shots —
 * abstract on purpose, so the demo never competes with real content
 * around it. Keyframes live in globals.css (gc-drift, gc-pop).
 */

const THUMBS = [
  { left: "4%",  size: "16%", dur: "11s", delay: "-2s",  rot: "-5deg", src: "/hero/wedding-kiss.webp" },
  { left: "13%", size: "12%", dur: "14s", delay: "-9s",  rot: "4deg",  src: "/hero/wedding-stairs.webp" },
  { right: "5%", size: "17%", dur: "12s", delay: "-6s",  rot: "5deg",  src: "/hero/wedding-lift.webp" },
  { right: "14%", size: "11%", dur: "15s", delay: "-12s", rot: "-4deg", src: "/hero/wedding-castle.webp" },
] as const;

export function WallMiniDemo({ label = "LIVE" }: { label?: string }) {
  return (
    <div className="relative w-full select-none" aria-hidden>
      {/* TV frame */}
      <div className="rounded-2xl bg-[#111111] p-2 sm:p-2.5 shadow-[0_24px_60px_rgba(15,23,41,0.35)]">
        <div className="relative aspect-video rounded-xl overflow-hidden" style={{ background: "radial-gradient(120% 120% at 50% 0%, #1E2A44 0%, #0B1220 60%)" }}>

          {/* drifting side thumbnails */}
          {THUMBS.map((t2, i) => (
            <div
              key={i}
              className="absolute top-full z-[1] rounded-md border border-white/70"
              style={{
                left: "left" in t2 ? t2.left : undefined,
                right: "right" in t2 ? t2.right : undefined,
                width: t2.size,
                aspectRatio: "3/3.4",
                animation: `gc-drift ${t2.dur} linear ${t2.delay} infinite`,
                rotate: t2.rot,
                boxShadow: "0 6px 18px rgba(0,0,0,.45)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t2.src} alt="" loading="lazy" className="w-full h-full object-cover rounded-md" />
            </div>
          ))}

          {/* centre photo */}
          {/* height-constrained: 76% of the 16:9 stage — a width-based size
              at 3:4 would overflow the stage vertically. The gc-pop keyframe
              supplies the centering translate, so no translate classes here. */}
          <div
            className="absolute left-1/2 top-1/2 z-10 rounded-lg overflow-hidden border-[3px] border-white"
            style={{ height: "76%", aspectRatio: "3/4", boxShadow: "0 16px 40px rgba(0,0,0,.55)", animation: "gc-pop 7s ease-in-out infinite", transform: "translate(-50%,-50%)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero/wedding-walk-lg.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
            {/* bottom scrim keeps the uploader pill legible over the photo */}
            <div className="absolute bottom-0 inset-x-0 h-1/3" style={{ background: "linear-gradient(0deg, rgba(15,23,41,.55), transparent)" }} />
          </div>

          {/* uploader pill */}
          <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-[#111111] bg-[#F4B400]">
              ✓ Ana
            </span>
          </div>

          {/* LIVE badge */}
          <div className="absolute top-[5%] right-[4%] z-20 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-white tracking-widest">{label}</span>
          </div>

          {/* QR chip */}
          <div className="absolute bottom-[6%] left-[4%] z-20 flex items-center gap-1.5 bg-black/50 rounded-lg p-1 sm:p-1.5">
            <div
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-[3px] bg-white p-[2px]"
            >
              <div className="w-full h-full" style={{ background: "repeating-conic-gradient(#111111 0% 25%, #fff 0% 50%) 50% / 25% 25%" }} />
            </div>
            <span className="hidden sm:block text-[8px] leading-tight text-white/85 font-semibold pr-1">Skeniraj<br />& deli</span>
          </div>
        </div>
      </div>
      {/* stand */}
      <div className="mx-auto w-[18%] h-1.5 sm:h-2 rounded-b-xl bg-[#111111]/85" />
      <div className="mx-auto mt-0.5 w-[30%] h-1 rounded-full bg-[#111111]/20" />
    </div>
  );
}
