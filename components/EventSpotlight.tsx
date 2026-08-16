import Image from "next/image";

/**
 * "Live at the event" spotlight under the homepage hero: Guestcam's first
 * big public event, the Nina Badrič concert at Terasa Kino centra Maribox.
 * The photograph links to the Eventim ticket page.
 *
 * Copy is the owner-approved Variant A. Deliberately no date and no
 * "partner" claim in the text: neither was confirmed.
 *
 * IMAGE / ASPECT are placeholders until the real photo arrives (it gets
 * converted to WebP, sized, and EXIF-stripped on arrival) — this
 * component is NOT rendered on the homepage until then, so nothing
 * broken can ship.
 */

const TICKETS_URL =
  "https://www.eventim.si/event/nina-badric-terasa-kino-centra-maribox-21971077/";

/** Set when the real photo lands in public/events/. */
const IMAGE = "/events/nina-badric-maribox.webp";
/** width/height of the converted WebP — filled in with the real file. */
const ASPECT = { w: 1600, h: 900 };

export function EventSpotlight() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
      <span
        className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
        style={{ background: "rgba(140,98,24,0.10)", color: "var(--honey)" }}
      >
        V živo na dogodku
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[color:var(--ink)] sm:text-4xl">
        Guestcam na koncertu Nine Badrič
      </h2>
      <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-gray-600">
        Zbiramo spomine na koncertu Nine Badrič na terasi Kino centra Maribox v
        Mariboru. Obiskovalci fotografije delijo prek QR kode, najboljši
        trenutki pa se v živo prikazujejo na foto steni.
      </p>

      <a
        href={TICKETS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-8 block"
        aria-label="Vstopnice za koncert Nine Badrič na Eventim.si"
      >
        <span className="block overflow-hidden rounded-[24px] shadow-xl transition-transform duration-200 group-hover:scale-[1.01] sm:rounded-[32px]">
          <Image
            src={IMAGE}
            alt="Koncert Nine Badrič na terasi Kino centra Maribox v Mariboru"
            width={ASPECT.w}
            height={ASPECT.h}
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="h-auto w-full"
          />
        </span>
        <span className="mt-4 inline-block text-sm font-bold text-[color:var(--honey)] underline underline-offset-4 group-hover:text-[color:var(--ink)]">
          Vstopnice na Eventim.si →
        </span>
      </a>
    </section>
  );
}
