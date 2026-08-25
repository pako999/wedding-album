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

function MiniQr() {
  const cells = [
    1,1,1,1,1,0,1,1,1,
    1,0,0,0,1,0,1,0,1,
    1,0,1,0,1,0,1,1,1,
    1,0,0,0,1,0,0,0,0,
    1,1,1,1,1,0,1,0,1,
    0,0,0,0,0,0,0,1,0,
    1,1,1,0,1,1,1,0,1,
    1,0,1,0,0,1,0,1,0,
    1,1,1,0,1,0,1,1,1,
  ];

  return (
    <div className="grid h-14 w-14 grid-cols-9 gap-[2px] rounded-md bg-white p-1.5" aria-hidden="true">
      {cells.map((cell, index) => (
        <span key={index} className={cell ? "bg-[#11151D]" : "bg-white"} />
      ))}
    </div>
  );
}

/**
 * Photo-first print / QR section based on the approved reference layout.
 * Every photo shown here is an existing Guestcam-owned project asset:
 * two real product stand photos and two real event visuals from the repo.
 */
export function PrintShowroom({ copy }: { copy: PrintShowroomCopy }) {
  const from = eur(Math.min(...STAND_VARIANTS.map((v) => v.unitCents)));
  const visuals = [
    {
      src: "/print/stand-wood.webp",
      alt: copy.imageAlts[0],
      fit: "object-contain p-7 sm:p-9",
      bg: "bg-[#EFEAE1]",
      label: copy.woodName,
    },
    {
      src: "/events/organizacija-dogodkov-dogodek.webp",
      alt: copy.imageAlts[1],
      fit: "object-cover",
      bg: "bg-[#EAE6DE]",
      label: copy.statusUpload,
    },
    {
      src: "/print/stand-gold.webp",
      alt: copy.imageAlts[2],
      fit: "object-contain p-7 sm:p-9",
      bg: "bg-[#F1ECE1]",
      label: copy.goldName,
    },
    {
      src: "/events/nina-badric-maribox.webp",
      alt: copy.imageAlts[3],
      fit: "object-cover",
      bg: "bg-[#EAE6DE]",
      label: copy.statusNew,
    },
  ] as const;

  return (
    <section id="print-service" className="overflow-hidden bg-[#FBF9F4] py-20 sm:py-28">
      <PrintSectionMover />

      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="grid gap-5 border-b border-black/10 pb-7 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9A6A16]">
            {copy.badge}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-[#77746F] lg:justify-center">
            {copy.bullets.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#D99B00] text-[11px] font-black text-[#A96C00]">
                  ✓
                </span>
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

        <div className="mx-auto max-w-[930px] py-14 text-center sm:py-16 lg:py-20">
          <h2 className="text-[clamp(2.7rem,6vw,5.35rem)] font-extrabold leading-[0.94] tracking-[-0.055em] text-[#12151B]">
            {copy.title}
            <span className="mt-2 block font-semibold italic tracking-[-0.045em] text-[#B77B00]">
              {copy.accentTitle}
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-[720px] text-base leading-7 text-[#77746F] sm:text-xl sm:leading-8">
            {copy.body}
          </p>
        </div>

        <div className="relative">
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-16 pt-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
            {visuals.map((visual, index) => (
              <figure
                key={visual.src}
                className={`relative min-w-[76vw] snap-center overflow-hidden rounded-[24px] border border-black/5 shadow-[0_18px_44px_rgba(34,29,19,.08)] sm:min-w-[48vw] lg:min-w-0 ${visual.bg}`}
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={visual.src}
                    alt={visual.alt}
                    fill
                    sizes="(max-width:640px) 76vw, (max-width:1024px) 48vw, 25vw"
                    className={visual.fit}
                  />

                  {(index === 1 || index === 3) && (
                    <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/45 via-black/10 to-transparent" aria-hidden="true" />
                  )}

                  {index === 0 && (
                    <div className="absolute bottom-4 left-4 rounded-[18px] border-2 border-[#E2A600] bg-white p-3 shadow-[0_16px_35px_rgba(34,29,19,.14)]">
                      <p className="mb-2 text-[11px] font-extrabold text-[#171A20]">{copy.statusPhoto}</p>
                      <MiniQr />
                    </div>
                  )}

                  {index === 1 && (
                    <div className="absolute -bottom-1 left-1/2 w-[84%] -translate-x-1/2 rounded-[18px] bg-white px-4 py-3 shadow-[0_16px_35px_rgba(34,29,19,.16)]">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF2C9] text-lg font-black text-[#A66E00]">✓</span>
                        <div>
                          <p className="text-sm font-extrabold text-[#171A20]">{copy.statusUpload}</p>
                          <p className="mt-0.5 text-[11px] text-[#8A8781]">Guestcam</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="absolute left-4 top-4 rounded-[18px] bg-white/96 px-4 py-3 shadow-[0_16px_35px_rgba(34,29,19,.14)] backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF2C9] text-[#A66E00]">▶</span>
                        <div>
                          <p className="text-sm font-extrabold text-[#171A20]">{copy.statusLive}</p>
                          <p className="mt-0.5 text-[11px] text-[#8A8781]">Guestcam QR</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 3 && (
                    <div className="absolute bottom-4 right-4 max-w-[82%] rounded-[18px] bg-white/96 px-4 py-3 shadow-[0_16px_35px_rgba(34,29,19,.15)] backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF2C9] text-[#A66E00]">▧</span>
                        <div>
                          <p className="text-sm font-extrabold text-[#171A20]">{copy.statusNew}</p>
                          <p className="mt-0.5 text-[11px] text-[#8A8781]">Guestcam</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <figcaption className="sr-only">{visual.label}</figcaption>
                </div>
              </figure>
            ))}
          </div>

          <div className="pointer-events-none absolute -left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-xl text-[#171A20] shadow-lg lg:flex" aria-hidden="true">
            ‹
          </div>
          <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-xl text-[#171A20] shadow-lg lg:flex" aria-hidden="true">
            ›
          </div>
        </div>

        <div className="mt-1 flex flex-col items-center text-center">
          <div className="mb-7 flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#CBC7BF]" />
            <span className="h-2 w-2 rounded-full bg-[#CBC7BF]" />
            <span className="h-2 w-2 rounded-full bg-[#CBC7BF]" />
            <span className="h-2 w-7 rounded-full bg-[#E3A600]" />
          </div>

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
