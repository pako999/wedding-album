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
 * Print / QR-card story section using only real Guestcam-owned assets:
 * the actual wooden/gold QR stands, a real event photo and the real
 * Nina Badric / Maribox event visual. No AI-generated marketing images.
 */
export function PrintShowroom({ copy }: { copy: PrintShowroomCopy }) {
  const from = eur(Math.min(...STAND_VARIANTS.map((v) => v.unitCents)));
  const visuals = [
    { src: "/print/stand-wood.webp", alt: copy.imageAlts[0], label: copy.statusPhoto, pos: "object-center" },
    { src: "/events/organizacija-dogodkov-dogodek.webp", alt: copy.imageAlts[1], label: copy.statusUpload, pos: "object-center" },
    { src: "/print/stand-gold.webp", alt: copy.imageAlts[2], label: copy.statusLive, pos: "object-center" },
    { src: "/events/nina-badric-maribox.webp", alt: copy.imageAlts[3], label: copy.statusNew, pos: "object-center" },
  ] as const;

  return (
    <section id="print-service" className="overflow-hidden bg-[#FBF9F4] py-20 sm:py-28">
      <PrintSectionMover />
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9A6A16]">{copy.badge}</p>

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
          <p className="mx-auto mt-7 max-w-[720px] text-base leading-7 text-[#77746F] sm:text-xl sm:leading-8">{copy.body}</p>
        </div>

        <div className="relative">
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
            {visuals.map((visual) => (
              <figure
                key={visual.src}
                className="relative min-w-[76vw] snap-center overflow-hidden rounded-[24px] bg-[#EEE9DE] sm:min-w-[48vw] lg:min-w-0"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={visual.src}
                    alt={visual.alt}
                    fill
                    sizes="(max-width:640px) 76vw, (max-width:1024px) 48vw, 25vw"
                    className={`object-cover ${visual.pos}`}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-flex rounded-full bg-white/95 px-3.5 py-2 text-xs font-extrabold text-[#171A20] shadow-[0_10px_24px_rgba(0,0,0,.12)] backdrop-blur-sm">
                      {visual.label}
                    </span>
                  </div>
                </div>
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
