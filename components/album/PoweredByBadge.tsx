/**
 * PoweredByBadge — non-removable "Powered by Guestcam" pill shown in the
 * public gallery footer for ALL plans (including Premium). This is the
 * gallery_footer touchpoint in the referral engine — clicks land on the
 * localized home with ?ref=<code>&tp=gallery_footer, so the middleware
 * (see middleware.ts guest-referral block) stamps the attribution cookie
 * and the eventual paid sign-up earns K-factor credit for the couple.
 *
 * "Non-removable" is enforced simply by unconditionally rendering it in
 * AlbumGuestView — there is no owner toggle. If we ever want to sell an
 * "unbrand" add-on it goes through admin-only gating, not owner config.
 */

interface Props {
  referralCode: string | null;
  /** Guest UI language — passed straight through so the landing page opens in-lang. */
  lang: string;
}

const SUPPORTED = new Set(["sl", "hr", "sr", "de", "en", "es"]);

const LABELS: Record<string, string> = {
  sl: "Naredite svojo galerijo",
  hr: "Napravite svoju galeriju",
  sr: "Napravite svoju galeriju",
  de: "Erstellen Sie Ihre Galerie",
  en: "Create your own gallery",
  es: "Crea tu propia galería",
};

const POWERED: Record<string, string> = {
  sl: "Poganja",
  hr: "Pokreće",
  sr: "Pokreće",
  de: "Betrieben von",
  en: "Powered by",
  es: "Con la tecnología de",
};

export function PoweredByBadge({ referralCode, lang }: Props) {
  const locale = SUPPORTED.has(lang) ? lang : "sl";
  const localePrefix = locale === "sl" ? "" : `/${locale}`;
  // With a referral code we attribute the click via middleware; without
  // one we still ship the badge (older albums pre-P0 migration have no code
  // — they'll get one on the next admin bootstrap, but until then the link
  // is a plain "learn more" without attribution).
  const href = referralCode
    ? `https://www.guestcam.si${localePrefix}?ref=${encodeURIComponent(referralCode)}&tp=gallery_footer`
    : `https://www.guestcam.si${localePrefix}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 backdrop-blur px-3.5 py-1.5 text-[11px] font-medium text-gray-700 hover:border-gray-300 hover:bg-white transition-colors shadow-sm"
      style={{ textDecoration: "none" }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFC94D]" aria-hidden />
      <span className="text-gray-500">{POWERED[locale]}</span>
      <span className="font-bold text-[#0F1729]">Guestcam</span>
      <span className="text-gray-300">·</span>
      <span className="text-[#1E3A8A] font-semibold whitespace-nowrap">{LABELS[locale]} →</span>
    </a>
  );
}
