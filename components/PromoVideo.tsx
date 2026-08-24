/**
 * "How it works" promo video under the hero, Slovenian homepage only.
 *
 * Mobile keeps the existing 25 s portrait clip presented as a phone.
 * Desktop uses the dedicated 16:9 cut so the media fills the available
 * space naturally instead of showing a narrow phone in a wide layout.
 */
const DESKTOP_VIDEO =
  "https://www.dropbox.com/scl/fi/qtuzczykxuoa9q19lktyb/guestcam_16x9.mp4?rlkey=5w335kv6w5b90t8q4js3w7e3u&raw=1";

export function PromoVideo() {
  return (
    <section className="border-b border-[color:var(--hairline)]" style={{ background: "var(--paper)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[.82fr_1.18fr] lg:gap-14">
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

        {/* Mobile / tablet: keep the existing portrait phone presentation. */}
        <div className="mx-auto w-full max-w-[300px] lg:hidden">
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

        {/* Desktop: dedicated landscape edit supplied for the wide layout. */}
        <div className="hidden w-full lg:block">
          <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-black shadow-[0_20px_55px_rgba(17,24,39,.16)]">
            <video
              controls
              playsInline
              preload="metadata"
              className="block aspect-video w-full bg-black object-contain"
              aria-label="Predstavitveni video: kako Guestcam deluje na namiznem prikazu"
            >
              <source src={DESKTOP_VIDEO} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
