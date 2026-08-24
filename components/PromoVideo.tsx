/**
 * "How it works" promo video under the hero, Slovenian homepage only.
 *
 * Mobile keeps the existing portrait clip presented as a phone.
 * Desktop uses the dedicated 16:9 cut as a large cinematic block with
 * the explanatory copy above it.
 */
const DESKTOP_VIDEO =
  "https://www.dropbox.com/scl/fi/qtuzczykxuoa9q19lktyb/guestcam_16x9.mp4?rlkey=5w335kv6w5b90t8q4js3w7e3u&raw=1";

export function PromoVideo() {
  return (
    <section className="border-b border-[color:var(--hairline)]" style={{ background: "var(--paper)" }}>
      {/* Mobile / tablet: keep the existing compact phone presentation. */}
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 sm:py-20 lg:hidden">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[color:var(--ink)] sm:text-4xl">
            Poglejte, kako deluje
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-600">
            V 25 sekundah: gost skenira QR kodo, naloži fotografije in vsi
            spomini se zberejo v vaši zasebni galeriji.
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-gray-600">
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

      {/* Desktop: copy first, then a large edge-to-edge landscape video. */}
      <div className="mx-auto hidden max-w-[1600px] px-8 py-24 lg:block xl:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[color:var(--honey)]">
            Kako deluje
          </p>
          <h2 className="mt-4 text-5xl font-extrabold tracking-[-0.04em] text-[color:var(--ink)] xl:text-6xl">
            Poglejte Guestcam v akciji
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            V manj kot pol minute gost skenira QR kodo, naloži fotografije in vsi spomini se samodejno zberejo v vaši zasebni galeriji.
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-5xl grid-cols-3 gap-8 text-sm text-gray-600">
          {[
            ["1.", "Natisnite QR kartice", "Postavite jih na mize ali pri vhodu."],
            ["2.", "Gostje skenirajo QR", "Brez aplikacije in brez prijave."],
            ["3.", "Fotografije so pri vas", "Vse zbrane na enem mestu v polni kakovosti."],
          ].map(([number, title, text]) => (
            <div key={number} className="flex items-start gap-3 border-t border-black/10 pt-4 text-left">
              <span className="text-base font-extrabold text-[color:var(--honey)]">{number}</span>
              <div>
                <p className="font-bold text-[color:var(--ink)]">{title}</p>
                <p className="mt-1 leading-6">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 w-full overflow-hidden rounded-[2rem] border border-black/10 bg-black shadow-[0_28px_80px_rgba(17,24,39,.18)]">
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
    </section>
  );
}
