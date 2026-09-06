export const PRIMARY_GUESTCAM_ORIGIN = "https://www.guestcam.si";
export const SPANISH_GUESTCAM_ORIGIN = "https://guestcam.es";
export const SERBIAN_GUESTCAM_ORIGIN = "https://www.guestcam.rs";

type MarketingLocale = "sl" | "hr" | "sr" | "de" | "en" | "es";

const MARKETING_LOCALES = new Set<MarketingLocale>(["sl", "hr", "sr", "de", "en", "es"]);

/** Equivalent localized routes used to recover malformed cross-domain URLs
 * such as guestcam.rs/es/fotos-boda-invitados without serving the wrong
 * language on a country domain. Keep these in the same order as the public
 * SEO clusters (guide, alternatives, then event-topic pages). */
const LOCALIZED_ROUTE_CLUSTERS: Array<Record<MarketingLocale, string>> = [
  { sl: "/sl/qr-koda-poroka", hr: "/hr/qr-kod-vjencanje", sr: "/sr/qr-kod-vencanje", de: "/de/hochzeitsfotos-sammeln", en: "/en/wedding-photo-sharing", es: "/es/fotos-boda-qr" },
  { sl: "/sl/alternative-aplikacije", hr: "/hr/alternativne-aplikacije", sr: "/sr/alternativne-aplikacije", de: "/de/alternativen", en: "/en/alternatives", es: "/es/alternativas" },
  { sl: "/sl/slike-s-poroke", hr: "/hr/fotografije-s-vjencanja", sr: "/sr/slike-sa-vencanja", de: "/de/hochzeitsfotos-gaeste", en: "/en/wedding-photos-from-guests", es: "/es/fotos-boda-invitados" },
  { sl: "/sl/qr-koda-za-poroko", hr: "/hr/qr-kod-za-vjencanje-kako", sr: "/sr/qr-kod-za-vencanje-kako", de: "/de/qr-code-hochzeit-erstellen", en: "/en/how-to-make-wedding-qr-code", es: "/es/como-hacer-codigo-qr-boda" },
  { sl: "/sl/porocni-album", hr: "/hr/vjencani-album", sr: "/sr/vencani-album", de: "/de/digitales-hochzeitsalbum", en: "/en/digital-wedding-album", es: "/es/album-de-boda-digital" },
  { sl: "/sl/zbiranje-slik-s-poroke", hr: "/hr/skupljanje-fotografija-vjencanje", sr: "/sr/skupljanje-fotografija-vencanje", de: "/de/hochzeitsfotos-von-gaesten-sammeln", en: "/en/collect-wedding-photos-guests", es: "/es/recopilar-fotos-boda-invitados" },
  { sl: "/sl/slike-z-rojstnega-dne", hr: "/hr/fotografije-s-rodjendana", sr: "/sr/slike-sa-rodjendana", de: "/de/geburtstagsfotos-sammeln", en: "/en/birthday-photos-guests", es: "/es/fotos-cumpleanos-invitados" },
  { sl: "/sl/baby-shower-slike", hr: "/hr/baby-shower-fotografije", sr: "/sr/baby-shower-fotografije", de: "/de/babyparty-fotos", en: "/en/baby-shower-photos-guests", es: "/es/fotos-baby-shower" },
  // Blog translation clusters let old or accidentally cross-domain article
  // URLs redirect to the equivalent article, not merely to the blog index.
  { sl: "/sl/blog/aplikacija-za-porocne-fotografije-qr-koda", hr: "/hr/blog/aplikacija-za-vjencanje-fotografije-qr-kod", sr: "/sr/blog/aplikacija-za-vencanje-fotografije-qr-kod", de: "/de/blog/hochzeit-foto-app-qr-code", en: "/en/blog/wedding-photo-app-qr-code", es: "/es/blog/app-fotos-boda-qr-codigo" },
  { sl: "/sl/blog/deljenje-fotografij-poroka-brez-aplikacije", hr: "/hr/blog/dijeljenje-fotografija-vjencanje-bez-aplikacije", sr: "/sr/blog/deljenje-fotografija-vencanje-bez-aplikacije", de: "/de/blog/hochzeitsfotos-teilen-ohne-app", en: "/en/blog/share-wedding-photos-without-an-app", es: "/es/blog/compartir-fotos-boda-sin-app" },
  { sl: "/sl/blog/guestcam-na-koncertu-nine-badric", hr: "/hr/blog/guestcam-na-koncertu-nine-badric", sr: "/sr/blog/guestcam-na-koncertu-nine-badric", de: "/de/blog/guestcam-beim-nina-badric-konzert", en: "/en/blog/guestcam-at-nina-badric-concert", es: "/es/blog/guestcam-en-el-concierto-de-nina-badric" },
  { sl: "/sl/blog/guestcam-vs-whatsapp-porocne-fotografije", hr: "/hr/blog/guestcam-vs-whatsapp-vjencanje-fotografije", sr: "/sr/blog/guestcam-vs-whatsapp-vencanje-fotografije", de: "/de/blog/guestcam-vs-whatsapp-hochzeitsfotos", en: "/en/blog/guestcam-vs-whatsapp-wedding-photos", es: "/es/blog/guestcam-vs-whatsapp-fotos-boda" },
  { sl: "/sl/blog/kako-narediti-qr-kartico-v-canvi", hr: "/hr/blog/kako-napraviti-qr-karticu-u-canvi", sr: "/sr/blog/kako-napraviti-qr-karticu-u-canvi", de: "/de/blog/qr-code-karte-in-canva-gestalten", en: "/en/blog/design-wedding-qr-code-card-canva", es: "/es/blog/como-disenar-tarjeta-qr-boda-canva" },
  { sl: "/sl/blog/kako-ustvariti-zasebno-porocno-galerijo", hr: "/hr/blog/kako-napraviti-privatnu-galeriju-vjencanja", sr: "/sr/blog/kako-napraviti-privatnu-galeriju-vencanja", de: "/de/blog/private-hochzeits-fotogalerie-erstellen", en: "/en/blog/how-to-create-private-wedding-photo-gallery", es: "/es/blog/como-crear-galeria-fotos-privada-boda" },
  { sl: "/sl/blog/kako-zbrati-fotografije-gostov-na-poroki", hr: "/hr/blog/kako-skupiti-fotografije-gostiju-na-vjencanju", sr: "/sr/blog/kako-skupiti-fotografije-gostiju-na-vencanju", de: "/de/blog/hochzeitsfotos-von-gaesten-sammeln", en: "/en/blog/how-to-collect-wedding-photos-from-guests", es: "/es/blog/como-recopilar-fotos-de-invitados-en-la-boda" },
  { sl: "/sl/blog/porocne-fotografije-ki-jih-gostje-pozabijo-deliti", hr: "/hr/blog/vjencanje-fotografije-gosti-zaborave-podijeliti", sr: "/sr/blog/vencanje-fotografije-gosti-zaborave-podeliti", de: "/de/blog/hochzeitsfotos-gaeste-vergessen-zu-teilen", en: "/en/blog/wedding-photos-guests-forget-to-share", es: "/es/blog/fotos-boda-invitados-olvidan-compartir" },
  { sl: "/sl/blog/seznam-porocnih-fotografij-2026", hr: "/hr/blog/checklista-vjencanje-fotografije-2026", sr: "/sr/blog/cheklista-vencanje-fotografije-2026", de: "/de/blog/hochzeitsfoto-checkliste-2026", en: "/en/blog/wedding-photo-checklist-2026", es: "/es/blog/lista-fotos-boda-2026" },
];

const SAME_SLUG_ROUTES = new Set([
  "contact", "privacy", "terms", "gdpr", "cookies", "refund", "blog", "affiliate/apply",
]);

// Both hosts are treated as official Guestcam routing hosts so a request is
// never mistaken for a customer's custom album domain. Vercel redirects the
// www host to the bare production domain before the app normally sees it.
const SPANISH_ROUTING_HOSTS = new Set(["guestcam.es", "www.guestcam.es"]);
const SERBIAN_ROUTING_HOSTS = new Set(["guestcam.rs", "www.guestcam.rs"]);

export function normalizedHostname(hostname: string): string {
  return hostname.split(":")[0].trim().toLowerCase();
}

export function isSpanishGuestcamHost(hostname: string): boolean {
  return SPANISH_ROUTING_HOSTS.has(normalizedHostname(hostname));
}

/**
 * guestcam.rs and guestcam.es are marketing/SEO hosts only. They deliberately
 * are not Clerk satellite domains: account creation and every authenticated
 * surface remain on the primary www.guestcam.si application.
 */
export function isSerbianGuestcamHost(hostname: string): boolean {
  return SERBIAN_ROUTING_HOSTS.has(normalizedHostname(hostname));
}

export function isPrimaryGuestcamHost(hostname: string): boolean {
  const host = normalizedHostname(hostname);
  return host === "guestcam.si" || host === "www.guestcam.si";
}

export function isCountryMarketingHost(hostname: string): boolean {
  return isSpanishGuestcamHost(hostname) || isSerbianGuestcamHost(hostname);
}

/** Strip the internal App Router locale prefix from a public country URL. */
export function countryPublicPath(locale: "sr" | "es", pathname = "/"): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const prefix = `/${locale}`;
  if (normalizedPath === prefix) return "/";
  if (normalizedPath.startsWith(`${prefix}/`)) {
    return normalizedPath.slice(prefix.length) || "/";
  }
  return normalizedPath;
}

/** Return the canonical, language-correct public path on a country domain.
 * Unknown foreign-language paths intentionally fall back to that country's
 * homepage instead of rendering foreign text or creating an indexable 404. */
export function equivalentCountryPublicPath(
  targetLocale: "sr" | "es",
  pathname: string,
): string | null {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalizedPath.split("/").filter(Boolean);
  const sourceLocale = segments[0] as MarketingLocale | undefined;
  if (!sourceLocale || !MARKETING_LOCALES.has(sourceLocale)) return null;

  const cluster = LOCALIZED_ROUTE_CLUSTERS.find((routes) => routes[sourceLocale] === normalizedPath);
  if (cluster) return countryPublicPath(targetLocale, cluster[targetLocale]);

  const remainder = segments.slice(1).join("/");
  if (!remainder) return "/";
  if (SAME_SLUG_ROUTES.has(remainder)) {
    return countryPublicPath(targetLocale, `/${targetLocale}/${remainder}`);
  }
  if (remainder.startsWith("blog/")) return "/blog";
  return "/";
}

/** Public Serbian URL for canonical, hreflang and sitemap output. */
export function serbianGuestcamUrl(pathname = "/"): string {
  return `${SERBIAN_GUESTCAM_ORIGIN}${countryPublicPath("sr", pathname)}`;
}

/** Public Spanish URL for canonical, hreflang and sitemap output. */
export function spanishGuestcamUrl(pathname = "/"): string {
  return `${SPANISH_GUESTCAM_ORIGIN}${countryPublicPath("es", pathname)}`;
}
