import Image from "next/image";
import Link from "next/link";
import { STAND_VARIANTS, eur } from "@/lib/print-service";
import { PrintSectionMover } from "@/components/PrintSectionMover";

export interface PrintShowroomCopy {
  badge: string;
  title: string;
  accentTitle: string;
  body: string;
  bullets: [string, string, string, string];
  cta: string;
  designCta: string;
  note: (price: string) => string;
  woodName: string;
  goldName: string;
  perPiece: string;
  imageAlts: [string, string, string, string];
  statusPhoto: string;
  statusUpload: string;
  statusLive: string;
  statusNew: string;
  trustLine: string;
}

/**
 * Print / QR-card story section.
 *
 * This deliberately avoids a generic product grid. It shows the real flow
 * visually: printed QR card -> guest phone -> table stand -> shared gallery.
 * All visible typography inherits the homepage DM Sans font.
 */
export function PrintShowroom({ copy }: { copy: PrintShowroomCopy }) {
  const from = eur(Math.min(...STAND_VARIANTS.map((v) => v.unitCents)));
  const visuals = [
    { src: "/hero/cards.webp", alt: copy.imageAlts[0], pos: "object-center" },
    { src: "/hero/gallery.webp", alt: copy.imageAlts[1], pos: "object-center" },
    { src: "/print/stand-gold.webp", alt: copy.imageAlts[2], pos: "object-center" },
    { src: "/hero/guestcam-hero-photo.webp", alt: copy.imageAlts[3], pos: "object-center" },
  ] as const;

  return (
    <section id="print-service" className="overflow-hidden bg-[#FBF9F4] py-20 sm:py-28">
      <PrintSectionMover />
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9A6A16]">
            {copy.badge}
          </p>

          <div className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 text-sm font-semibold text-[#77746F] lg:justify-center">
            {copy.bullets.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#D99B00] text-[11px] font-black text-[#A96C00]">✓</span>
                {item}
              </span>
            ))}
          </div>

          <div className="lg:justify-self-end">
            <Link
              href="/dashboard/new"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[#E0A100] bg-white px-6 text-sm font-extrabold text-[#171A20] transition-transform hover:-translate-y-0.5"
            >
              <span aria-hidden="true">▣</span>
              {copy.designCta}
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-[920px] py-14 text-center sm:py-16">
          <h2 className="text-[clamp(2.55rem,6vw,5.2rem)] font-extrabold leading-[0.95] tracking-[-0.055em] text-[#12151B]">
            {copy.title}
            <span className="mt-2 block font-medium italic tracking-[-0.045em] text-[#B77B00]">{copy.accentTitle}</span>
          </h2>
          <p className="mx-auto mt-7 max-w-[720px] text-base leading-7 text-[#77746F] sm:text-xl sm:leading-8">
            {copy.body}
          </p>
        </div>

        <div className="relative">
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
            {visuals.map((visual, index) => (
              <figure key={visual.src} className="relative min-w-[76vw] snap-center overflow-hidden rounded-[24px] bg-[#EEE9DE] sm:min-w-[48vw] lg:min-w-0">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={visual.src}
                    alt={visual.alt}
                    fill
                    sizes="(max-width:640px) 76vw, (max-width:1024px) 48vw, 25vw"
                    className={`object-cover ${visual.pos}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5" />
                </div>

                {index === 0 && (
                  <div className="absolute bottom-4 left-4 rounded-2xl border border-[#E6B23B] bg-white/95 p-3 shadow-[0_14px_35px_rgba(36,30,20,.16)] backdrop-blur-sm">
                    <p className="text-[11px] font-extrabold text-[#171A20]">{copy.statusPhoto}</p>
                    <div className="mt-2 grid h-12 w-12 grid-cols-5 gap-[2px] rounded-md border border-black/10 bg-white p-1" aria-hidden="true">
                      {Array.from({ length: 25 }).map((_, i) => <span key={i} className={(i * 7) % 5 < 3 ? "bg-[#12151B]" : "bg-white"} />)}
                    </div>
                  </div>
                )}

                {index === 1 && (
                  <div className="absolute -bottom-1 left-1/2 w-[86%] -translate-x-1/2 rounded-2xl bg-white px-4 py-3 shadow-[0_14px_35px_rgba(36,30,20,.16)]">
                    <p className="text-sm font-extrabold text-[#171A20]">✓ {copy.statusUpload}</p>
                  </div>
                )}

                {index === 2 && (
                  <div className="absolute left-4 top-4 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_14px_35px_rgba(36,30,20,.15)] backdrop-blur-sm">
                    <p className="text-sm font-extrabold text-[#171A20]">{copy.statusLive}</p>
                  </div>
                )}

                {index === 3 && (
                  <div className="absolute bottom-4 right-4 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_14px_35px_rgba(36,30,20,.16)] backdrop-blur-sm">
                    <p className="text-sm font-extrabold text-[#171A20]">{copy.statusNew}</p>
                  </div>
                )}
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-[#8C8983]">♡ &nbsp; {copy.trustLine} &nbsp; ♡</p>
          <Link
            href="/dashboard/new"
            className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-[#12151B] px-8 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
          >
            {copy.cta}
          </Link>
          <p className="mt-4 text-xs font-semibold text-[#99958D]">{copy.note(from)}</p>
        </div>
      </div>
    </section>
  );
}
