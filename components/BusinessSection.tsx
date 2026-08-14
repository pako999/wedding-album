import Image from "next/image";
import Link from "next/link";

export interface BusinessCopy {
  badge: string;
  title: string;
  body: string;
  bullets: [string, string, string, string, string, string];
  cta: string;
  imgAlt: string;
}

/**
 * "For business" section: real crowd photo beside the corporate pitch.
 * Ported from the CamLove homepage the owner approved; accent moved to
 * the Guestcam gold and the CTA points at the language's contact page.
 */
export function BusinessSection({ copy, contactHref }: { copy: BusinessCopy; contactHref: string }) {
  return (
    <section id="business" className="bg-[#171717] py-24 text-white sm:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[420px] overflow-hidden rounded-[34px] bg-black shadow-2xl sm:min-h-[560px]">
          <Image src="/events/organizacija-dogodkov-dogodek.webp" alt={copy.imgAlt} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <span className="inline-flex rounded-full bg-[#FFC94D] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">{copy.badge}</span>
          <h2 className="mt-6 text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">{copy.title}</h2>
          <p className="mt-6 text-lg leading-8 text-white/60">{copy.body}</p>
          <div className="mt-9 grid gap-3 text-sm font-semibold text-white/75 sm:grid-cols-2">
            {copy.bullets.map((b) => <span key={b}>✓ {b}</span>)}
          </div>
          <Link href={contactHref} className="mt-9 inline-flex rounded-full bg-[#FFC94D] px-8 py-4 font-black text-black transition-transform hover:scale-[1.02]">
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
