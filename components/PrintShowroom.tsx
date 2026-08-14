import Image from "next/image";
import Link from "next/link";
import { STAND_VARIANTS, eur } from "@/lib/print-service";

export interface PrintShowroomCopy {
  badge: string;
  title: string;
  body: string;
  bullets: [string, string, string, string];
  cta: string;
  /** Takes the formatted cheapest unit price so the number can't drift
   *  from the rate card in lib/print-service. */
  note: (price: string) => string;
  woodName: string;
  goldName: string;
  /** Per-piece suffix, e.g. " / kos", " / Stück". */
  perPiece: string;
}

/**
 * Print-service showroom: dark panel with the real product photos of the
 * wooden and gold QR table stands. Ported from the CamLove homepage the
 * owner approved; prices come from STAND_VARIANTS so the showroom can
 * never disagree with checkout.
 */
export function PrintShowroom({ copy }: { copy: PrintShowroomCopy }) {
  const from = eur(Math.min(...STAND_VARIANTS.map((v) => v.unitCents)));
  const price = (id: "wood" | "gold") =>
    eur(STAND_VARIANTS.find((v) => v.id === id)!.unitCents) + copy.perPiece;

  const products: Array<[string, string, string]> = [
    ["/print/stand-wood.webp", copy.woodName, price("wood")],
    ["/print/stand-gold.webp", copy.goldName, price("gold")],
  ];

  return (
    <section id="print-service" className="py-14 sm:py-20" style={{ background: "var(--paper)" }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-[34px] bg-[#151515] text-white shadow-2xl">
          <div className="grid lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
            <div className="p-7 sm:p-10 lg:p-12">
              <span className="inline-flex rounded-full bg-[#FFC94D] px-4 py-2 text-[11px] font-black uppercase tracking-[.14em] text-black">{copy.badge}</span>
              <h2 className="mt-6 max-w-2xl text-3xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl">{copy.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">{copy.body}</p>
              <div className="mt-7 grid gap-3 text-sm font-semibold text-white/75 sm:grid-cols-2">
                {copy.bullets.map((b) => <span key={b}>✓ {b}</span>)}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/dashboard/new" className="rounded-full bg-[#FFC94D] px-7 py-4 text-center font-black text-black transition-transform hover:scale-[1.02]">
                  {copy.cta}
                </Link>
                <span className="text-sm font-semibold text-white/50">{copy.note(from)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/10 p-px">
              {products.map(([src, name, priceLabel]) => (
                <div key={name} className="bg-[#202020] p-3 sm:p-5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white">
                    <Image src={src} alt={name} fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
                  </div>
                  <div className="px-1 pb-2 pt-4">
                    <p className="text-sm font-extrabold sm:text-base">{name}</p>
                    <p className="mt-1 text-xs font-semibold text-[#FFC94D] sm:text-sm">{priceLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
