/**
 * "How it works" promo video under the hero, Slovenian homepage only.
 *
 * The source is a 25 s portrait (9:16) clip, so it is presented as a
 * phone: that is both honest to the footage and on-message, since the
 * guest experience IS a phone. Transcoded from the delivered HEVC .mov
 * to H.264 (HEVC does not play in Chrome/Firefox/most Androids), with
 * faststart and a poster frame so nothing downloads until the visitor
 * presses play (preload="metadata", no autoplay).
 */
export function PromoVideo() {
  return (
    <section className="border-b border-[color:var(--hairline)]" style={{ background: "var(--paper)" }}>
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr]">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-[color:var(--ink)] sm:text-4xl">
            Poglejte, kako deluje
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-600 lg:mx-0">
            V 25 sekundah: gost skenira QR kodo, naloži fotografije in vsi
            spomini se zberejo v vaši zasebni galeriji.
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-gray-600 lg:mx-0">
            <li className="flex gap-2.5"><span className="font-bold text-[color:var(--honey)]">1.</span>Natisnite QR kartice in jih postavite na mize.</li>
            <li className="flex gap-2.5"><span className="font-bold text-[color:var(--honey)]">2.</span>Gostje skenirajo in nalagajo, brez aplikacije.</li>
            <li className="flex gap-2.5"><span className="font-bold text-[color:var(--honey)]">3.</span>Vse fotografije vas čakajo v polni kakovosti.</li>
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[300px]">
          <div className="overflow-hidden rounded-[2rem] border-[6px] border-[color:var(--ink)] bg-black shadow-2xl">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/promo/kako-deluje-poster.webp"
              className="block h-auto w-full"
              aria-label="Predstavitveni video: kako Guestcam zbira fotografije gostov prek QR kode"
            >
              <source src="/promo/kako-deluje.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
