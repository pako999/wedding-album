import type { Lang } from "./translations";

/**
 * Upgrade page copy — kept in its own file to avoid bloating the
 * shared translations bundle that every public gallery page pulls in.
 * Only the /dashboard/[slug]/upgrade route needs this dictionary.
 */

export interface UpgradeCopy {
  // Top nav
  back: string;

  // Page title
  title: string;
  subtitle: string; // "Choose the plan that fits your event."

  // Plan card
  vatIncluded: string; // "22% VAT included"

  // Trust strip
  trustRefund: string;    // "30-day money-back guarantee"
  trustSecure: string;    // "Secure payment"
  trustInstant: string;   // "Instant activation"

  // Data-protection trust strip (second row)
  trustGdpr: string;       // "GDPR Compliant"
  trustEuServers: string;  // "EU Data Centers"
  trustEncryption: string; // "SSL Encryption"

  // Testimonial
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialMeta: string;

  // Support
  supportTitle: string;
  supportSubtitle: string;

  // Payment method
  paymentMethod: string;                  // "Payment method" section
  paymentCardLabel: string;               // "Pay by card"
  paymentCardSub: string;                 // "Visa, Mastercard, iDEAL · instant activation"
  paymentInvoiceLabel: string;            // "Bank transfer / invoice"
  paymentInvoiceSub: string;              // "You'll receive the invoice within 24 h"

  // Billing form
  billingTitle: string;
  billingCardTitle: string;   // heading when shown on the card path
  billingCompanyToggle: string; // "I need a company invoice" checkbox
  billingName: string;
  billingCompany: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  billingPostalCode: string;
  billingCity: string;
  billingTaxId: string;

  // Order summary
  planPrefix: string;                     // "Plan"
  onetimePayment: string;                 // "One-time payment · no subscription"
  termsAcceptance: (linkText: string) => string; // "By purchasing you agree to the {link}. 30-day money-back guarantee."
  termsLinkText: string;                  // "terms of use"

  // CTA button
  ctaCard: (plan: string, price: number) => string;    // "Upgrade to {plan} — {price}€ →"
  ctaInvoice: (price: number) => string;                // "Submit invoice order — {price}€"
  ctaSending: string;                                   // "Sending…"
  ctaRedirecting: string;                               // "Redirecting to payment…"

  // Invoice done
  invoiceDoneTitle: string;
  invoiceDoneBody: (plan: string) => string;

  // Alerts
  alertMissingFields: string;
  alertInvoiceFailed: string;
  alertPaymentFailed: string;

  // Footer
  footerTagline: string;
  footerProduct: string;
  footerLegal: string;
  footerLinkPricing: string;
  footerLinkHow: string;
  footerLinkMyGalleries: string;
  footerLinkContact: string;
  footerLinkPrivacy: string;
  footerLinkTerms: string;
  footerLinkRefund: string;
  footerCompanyLine: string;
  footerNoRegistration: string;

  // Plan card taglines / badge
  taglineBasic:   string;
  taglinePlus:    string;
  taglinePremium: string;
  badgeRecommended: string;

  // Feature bullets used across plans (dedup — same key can be referenced by
  // multiple plans in the PLAN_FEATURE_KEYS map on the client).
  featurePhotos1000:       string; // "Up to 1000 photos"
  featurePhotos5000:       string; // "Up to 5000 photos"
  featurePhotosUnlimited:  string; // "Unlimited photos"
  featureVideos10:         string; // "Up to 10 videos"
  featureVideos100:        string; // "Up to 100 videos"
  featureQrCode:           string; // "QR code for tables"
  featureFullQuality:      string; // "Full-quality photo download"
  featureZipDownload:      string; // "Download all photos (ZIP)"
  featureAccess3mo:        string; // "3-month access"
  featureAccess1yr:        string; // "1-year access"
  featureAccess2yr:        string; // "2-year access"
  featureLiveGallery:      string; // "Live gallery in real time"
  featureCustomPage:       string; // "Personalized page"
  featurePremiumTemplates: string; // "Premium templates"
  featureCustomQrText:     string; // "Custom text on QR card"
  featurePhotoWall:        string; // "Photo Wall for TV / projector"
  featurePrioritySupport:  string; // "Priority support"

  // Printed QR table stands (physical add-on)
  standsTitle:    string; // "Printed QR table stands"
  standsDesc:     string; // what we print and post
  standsCountry:  string; // "Delivery country"
  standsShipping: string; // "Shipping"
  standsTotal:    string; // "Total"
  standsQty:      string; // "Number of stands"
  standsMaterial: string; // "Material"
  standsWood:     string; // "Wooden"
  standsGold:     string; // "Gold"
  standsVat:      string; // "Prices include VAT"
  /** "100+ pcs −15%, 200+ pcs −20%" — shown only until they qualify. */
  standsVolumeHint: (q1: number, p1: number, q2: number, p2: number) => string;
  /** "Order 100 and pay 21,00 € less" — thresholds mean a smaller order
   *  can cost more, so offer the better deal rather than charge it. */
  standsBetterOffer: (qty: number, save: string) => string;
  standsPiece:    string; // unit in the per-stand hint, e.g. "ea" in "1,80 €/ea"
  standsFrom:     string; // "from", prefixing the cheapest bundle price
}

export const UPGRADE_COPY: Record<Lang, UpgradeCopy> = {
  sl: {
    back: "Nazaj",
    title: "Nadgradite svojo galerijo",
    subtitle: "Izberite paket, ki ustreza vašemu dogodku.",
    vatIncluded: "vključen 22% DDV",
    trustRefund: "30-dnevna garancija",
    trustSecure: "Varno plačilo",
    trustInstant: "Takojšnja aktivacija",
    trustGdpr: "GDPR skladno", trustEuServers: "Strežniki v EU", trustEncryption: "SSL šifriranje",
    testimonialQuote: "Guestcam je bila najboljša odločitev za naš dan. Gostje so naložili čez 300 fotografij — brez aplikacij, brez zapletov. Vse fotografije so bile na enem mestu!",
    testimonialAuthor: "Ana & Marko",
    testimonialMeta: "500+ fotografij · 2026",
    supportTitle: "Imate vprašanje?",
    supportSubtitle: "Pišite nam na Viber ali WhatsApp — odgovorimo v nekaj minutah.",
    paymentMethod: "Način plačila",
    paymentCardLabel: "Plačilo s kartico",
    paymentCardSub: "Visa, Mastercard, iDEAL · Takojšnja aktivacija",
    paymentInvoiceLabel: "Predračun / bančno nakazilo",
    paymentInvoiceSub: "Predračun prejmete v 24 urah",
    billingTitle: "Podatki za predračun",
    billingCardTitle: "Podatki za račun (za izdajo računa)",
    billingName: "Ime in priimek *",
    billingCompanyToggle: "Potrebujem račun na podjetje",
    billingCompany: "Naziv podjetja (neobvezno)",
    billingEmail: "E-poštni naslov *",
    billingPhone: "Telefon *",
    billingAddress: "Ulica in hišna številka *",
    billingPostalCode: "Poštna številka *",
    billingCity: "Kraj *",
    billingTaxId: "Davčna številka (neobvezno)",
    planPrefix: "Paket",
    onetimePayment: "Enkratno plačilo · brez naročnine",
    termsAcceptance: (link) => `Z nakupom se strinjate s ${link}. 30-dnevna garancija vračila denarja.`,
    termsLinkText: "pogoji uporabe",
    ctaCard:    (p, price) => `Nadgradi na ${p} — ${price}€ →`,
    ctaInvoice: (price) => `Oddaj naročilo po predračunu — ${price}€`,
    ctaSending: "Pošiljanje…",
    ctaRedirecting: "Preusmeritev na plačilo…",
    invoiceDoneTitle: "Naročilo prejeto!",
    invoiceDoneBody: (plan) => `Predračun vam pošljemo v 24 urah. Po plačilu bo paket ${plan} takoj aktiviran.`,
    alertMissingFields: "Prosimo izpolnite vse obvezne podatke (ime, e-pošta, naslov, kraj).",
    alertInvoiceFailed: "Napaka pri oddaji naročila. Pišite na info@guestcam.si",
    alertPaymentFailed: "Napaka pri plačilu. Poskusite znova ali nas kontaktirajte na info@guestcam.si",
    footerTagline: "Galerija s QR kodo — brez aplikacije. Gostje fotografirajo, vi zbirate spomine.",
    footerProduct: "Produkt",
    footerLegal: "Pravno",
    footerLinkPricing: "Cenik",
    footerLinkHow: "Kako deluje",
    footerLinkMyGalleries: "Moje galerije",
    footerLinkContact: "Kontakt",
    footerLinkPrivacy: "Zasebnost",
    footerLinkTerms: "Pogoji uporabe",
    footerLinkRefund: "Vračilo denarja",
    footerCompanyLine: "© 2026 Guestcam · Sport group d.o.o. · SI72133449 · Slovenija",
    footerNoRegistration: "Brez registracije za goste",
    taglineBasic: "Za manjše dogodke",
    taglinePlus:  "Najpopularnejši",
    taglinePremium: "Vse vključeno",
    badgeRecommended: "PRIPOROČENO",
    featurePhotos1000:       "Do 1000 fotografij",
    featurePhotos5000:       "Do 5000 fotografij",
    featurePhotosUnlimited:  "Neomejeno fotografij",
    featureVideos10:         "Do 10 videoposnetkov",
    featureVideos100:        "Do 100 videoposnetkov",
    featureQrCode:           "QR koda za mizo",
    featureFullQuality:      "Prenos slik v polni kakovosti",
    featureZipDownload:      "Prenos vseh slik (ZIP)",
    featureAccess3mo:        "Dostop 3 mesece",
    featureAccess1yr:        "Dostop 1 leto",
    featureAccess2yr:        "Dostop 2 leti",
    featureLiveGallery:      "Live galerija v realnem času",
    featureCustomPage:       "Personalizirana stran",
    featurePremiumTemplates: "Premium predloge",
    featureCustomQrText:     "Lasten napis na QR kartici",
    featurePhotoWall:        "Foto stena za TV / projektor",
    featurePrioritySupport:  "Prioritetna podpora",
    standsTitle:    "Natisnjeni QR podstavki za mize",
    standsDesc:     "Natisnemo podstavke z vašo QR kodo in vam jih pošljemo domov — pripravljeni za mize.",
    standsCountry:  "Država dostave",
    standsShipping: "Poštnina",
    standsTotal:    "Skupaj",
    standsQty:      "Število podstavkov",
    standsMaterial: "Material",
    standsWood:     "Leseni",
    standsGold:     "Zlati",
    standsVat:      "Cene vključujejo tisk in DDV.",
    standsVolumeHint: (q1, p1, q2, p2) => `${q1}+ kosov −${p1}%, ${q2}+ kosov −${p2}%`,
    standsBetterOffer: (qty, save) => `Naročite ${qty} kosov in plačajte ${save} manj — kliknite za popravek.`,
    standsPiece:    "kos",
    standsFrom:     "od",
  },
  hr: {
    back: "Natrag",
    title: "Nadogradite svoju galeriju",
    subtitle: "Odaberite paket koji odgovara vašem događaju.",
    vatIncluded: "PDV uključen",
    trustRefund: "30-dnevno jamstvo",
    trustSecure: "Sigurno plaćanje",
    trustInstant: "Trenutna aktivacija",
    trustGdpr: "GDPR sukladno", trustEuServers: "Poslužitelji u EU", trustEncryption: "SSL enkripcija",
    testimonialQuote: "Guestcam je bio najbolja odluka za naš dan. Gosti su uploadali preko 300 fotografija — bez aplikacija, bez komplikacija. Sve fotografije na jednom mjestu!",
    testimonialAuthor: "Ana & Marko",
    testimonialMeta: "500+ fotografija · 2026",
    supportTitle: "Imate pitanje?",
    supportSubtitle: "Pišite nam na Viber ili WhatsApp — odgovaramo u nekoliko minuta.",
    paymentMethod: "Način plaćanja",
    paymentCardLabel: "Plaćanje karticom",
    paymentCardSub: "Visa, Mastercard, iDEAL · trenutna aktivacija",
    paymentInvoiceLabel: "Predračun / bankovni transfer",
    paymentInvoiceSub: "Predračun ćete primiti u 24 h",
    billingTitle: "Podaci za predračun",
    billingCardTitle: "Podaci za račun (za izdavanje računa)",
    billingName: "Ime i prezime *",
    billingCompanyToggle: "Trebam račun na tvrtku",
    billingCompany: "Naziv tvrtke (neobvezno)",
    billingEmail: "E-mail adresa *",
    billingPhone: "Telefon *",
    billingAddress: "Ulica i kućni broj *",
    billingPostalCode: "Poštanski broj *",
    billingCity: "Mjesto *",
    billingTaxId: "OIB (neobvezno)",
    planPrefix: "Paket",
    onetimePayment: "Jednokratno plaćanje · bez pretplate",
    termsAcceptance: (link) => `Kupnjom prihvaćate ${link}. 30-dnevno jamstvo povrata novca.`,
    termsLinkText: "uvjete korištenja",
    ctaCard:    (p, price) => `Nadogradi na ${p} — ${price}€ →`,
    ctaInvoice: (price) => `Pošalji narudžbu za predračun — ${price}€`,
    ctaSending: "Slanje…",
    ctaRedirecting: "Preusmjeravanje na plaćanje…",
    invoiceDoneTitle: "Narudžba primljena!",
    invoiceDoneBody: (plan) => `Predračun šaljemo u 24 h. Nakon plaćanja paket ${plan} bit će odmah aktiviran.`,
    alertMissingFields: "Molimo popunite sva obvezna polja (ime, e-mail, adresa, grad).",
    alertInvoiceFailed: "Greška pri slanju narudžbe. Pišite na info@guestcam.si",
    alertPaymentFailed: "Greška pri plaćanju. Pokušajte ponovno ili nas kontaktirajte na info@guestcam.si",
    footerTagline: "Galerija s QR kodom — bez aplikacije. Gosti fotografiraju, vi prikupljate uspomene.",
    footerProduct: "Proizvod",
    footerLegal: "Pravno",
    footerLinkPricing: "Cjenik",
    footerLinkHow: "Kako radi",
    footerLinkMyGalleries: "Moje galerije",
    footerLinkContact: "Kontakt",
    footerLinkPrivacy: "Privatnost",
    footerLinkTerms: "Uvjeti korištenja",
    footerLinkRefund: "Povrat novca",
    footerCompanyLine: "© 2026 Guestcam · Sport group d.o.o. · SI72133449 · Slovenija",
    footerNoRegistration: "Bez registracije za goste",
    taglineBasic: "Za manje događaje",
    taglinePlus:  "Najpopularniji",
    taglinePremium: "Sve uključeno",
    badgeRecommended: "PREPORUČENO",
    featurePhotos1000:       "Do 1000 fotografija",
    featurePhotos5000:       "Do 5000 fotografija",
    featurePhotosUnlimited:  "Neograničeno fotografija",
    featureVideos10:         "Do 10 videa",
    featureVideos100:        "Do 100 videa",
    featureQrCode:           "QR kod za stol",
    featureFullQuality:      "Preuzimanje slika u punoj kvaliteti",
    featureZipDownload:      "Preuzmi sve fotografije (ZIP)",
    featureAccess3mo:        "Pristup 3 mjeseca",
    featureAccess1yr:        "Pristup 1 godinu",
    featureAccess2yr:        "Pristup 2 godine",
    featureLiveGallery:      "Live galerija u stvarnom vremenu",
    featureCustomPage:       "Personalizirana stranica",
    featurePremiumTemplates: "Premium predlošci",
    featureCustomQrText:     "Vlastiti tekst na QR kartici",
    featurePhotoWall:        "Foto zid za TV / projektor",
    featurePrioritySupport:  "Prioritetna podrška",
    standsTitle:    "Tiskani QR stalci za stolove",
    standsDesc:     "Tiskamo stalke s vašim QR kodom i šaljemo vam ih — spremni za stolove.",
    standsCountry:  "Država dostave",
    standsShipping: "Poštarina",
    standsTotal:    "Ukupno",
    standsQty:      "Broj stalaka",
    standsMaterial: "Materijal",
    standsWood:     "Drveni",
    standsGold:     "Zlatni",
    standsVat:      "Cijene uključuju tisak i PDV.",
    standsVolumeHint: (q1, p1, q2, p2) => `${q1}+ komada −${p1}%, ${q2}+ komada −${p2}%`,
    standsBetterOffer: (qty, save) => `Naručite ${qty} komada i platite ${save} manje — kliknite za ispravak.`,
    standsPiece:    "kom",
    standsFrom:     "od",
  },
  sr: {
    back: "Nazad",
    title: "Nadogradite svoju galeriju",
    subtitle: "Izaberite paket koji odgovara vašem događaju.",
    vatIncluded: "PDV uključen",
    trustRefund: "30-dnevna garancija",
    trustSecure: "Sigurno plaćanje",
    trustInstant: "Trenutna aktivacija",
    trustGdpr: "GDPR usklađeno", trustEuServers: "Serveri u EU", trustEncryption: "SSL enkripcija",
    testimonialQuote: "Guestcam je bio najbolja odluka za naš dan. Gosti su uploadovali preko 300 fotografija — bez aplikacija, bez komplikacija. Sve fotografije na jednom mestu!",
    testimonialAuthor: "Ana & Marko",
    testimonialMeta: "500+ fotografija · 2026",
    supportTitle: "Imate pitanje?",
    supportSubtitle: "Pišite nam na Viber ili WhatsApp — odgovaramo u par minuta.",
    paymentMethod: "Način plaćanja",
    paymentCardLabel: "Plaćanje karticom",
    paymentCardSub: "Visa, Mastercard, iDEAL · trenutna aktivacija",
    paymentInvoiceLabel: "Predračun / bankovni transfer",
    paymentInvoiceSub: "Predračun ćete primiti u 24 h",
    billingTitle: "Podaci za predračun",
    billingCardTitle: "Podaci za račun (za izdavanje računa)",
    billingName: "Ime i prezime *",
    billingCompanyToggle: "Treba mi račun na firmu",
    billingCompany: "Naziv firme (opciono)",
    billingEmail: "E-mail adresa *",
    billingPhone: "Telefon *",
    billingAddress: "Ulica i kućni broj *",
    billingPostalCode: "Poštanski broj *",
    billingCity: "Mesto *",
    billingTaxId: "PIB (opciono)",
    planPrefix: "Paket",
    onetimePayment: "Jednokratna uplata · bez pretplate",
    termsAcceptance: (link) => `Kupovinom prihvatate ${link}. 30-dnevna garancija povrata novca.`,
    termsLinkText: "uslove korišćenja",
    ctaCard:    (p, price) => `Nadogradi na ${p} — ${price}€ →`,
    ctaInvoice: (price) => `Pošalji narudžbinu za predračun — ${price}€`,
    ctaSending: "Slanje…",
    ctaRedirecting: "Preusmeravanje na plaćanje…",
    invoiceDoneTitle: "Narudžbina primljena!",
    invoiceDoneBody: (plan) => `Predračun šaljemo u 24 h. Nakon uplate paket ${plan} će biti odmah aktiviran.`,
    alertMissingFields: "Molimo popunite sva obavezna polja (ime, e-mail, adresa, grad).",
    alertInvoiceFailed: "Greška pri slanju narudžbine. Pišite na info@guestcam.si",
    alertPaymentFailed: "Greška pri plaćanju. Pokušajte ponovo ili nas kontaktirajte na info@guestcam.si",
    footerTagline: "Galerija s QR kodom — bez aplikacije. Gosti fotografišu, vi skupljate uspomene.",
    footerProduct: "Proizvod",
    footerLegal: "Pravno",
    footerLinkPricing: "Cenovnik",
    footerLinkHow: "Kako radi",
    footerLinkMyGalleries: "Moje galerije",
    footerLinkContact: "Kontakt",
    footerLinkPrivacy: "Privatnost",
    footerLinkTerms: "Uslovi korišćenja",
    footerLinkRefund: "Povrat novca",
    footerCompanyLine: "© 2026 Guestcam · Sport group d.o.o. · SI72133449 · Slovenija",
    footerNoRegistration: "Bez registracije za goste",
    taglineBasic: "Za manje događaje",
    taglinePlus:  "Najpopularniji",
    taglinePremium: "Sve uključeno",
    badgeRecommended: "PREPORUČENO",
    featurePhotos1000:       "Do 1000 fotografija",
    featurePhotos5000:       "Do 5000 fotografija",
    featurePhotosUnlimited:  "Neograničeno fotografija",
    featureVideos10:         "Do 10 video zapisa",
    featureVideos100:        "Do 100 video zapisa",
    featureQrCode:           "QR kod za sto",
    featureFullQuality:      "Preuzimanje slika u punom kvalitetu",
    featureZipDownload:      "Preuzmi sve fotografije (ZIP)",
    featureAccess3mo:        "Pristup 3 meseca",
    featureAccess1yr:        "Pristup 1 godinu",
    featureAccess2yr:        "Pristup 2 godine",
    featureLiveGallery:      "Live galerija u realnom vremenu",
    featureCustomPage:       "Personalizovana stranica",
    featurePremiumTemplates: "Premium šabloni",
    featureCustomQrText:     "Sopstveni tekst na QR kartici",
    featurePhotoWall:        "Foto zid za TV / projektor",
    featurePrioritySupport:  "Prioritetna podrška",
    standsTitle:    "Štampani QR stalci za stolove",
    standsDesc:     "Štampamo stalke sa vašim QR kodom i šaljemo vam ih — spremni za stolove.",
    standsCountry:  "Država dostave",
    standsShipping: "Poštarina",
    standsTotal:    "Ukupno",
    standsQty:      "Broj stalaka",
    standsMaterial: "Materijal",
    standsWood:     "Drveni",
    standsGold:     "Zlatni",
    standsVat:      "Cene uključuju štampu i PDV.",
    standsVolumeHint: (q1, p1, q2, p2) => `${q1}+ komada −${p1}%, ${q2}+ komada −${p2}%`,
    standsBetterOffer: (qty, save) => `Naručite ${qty} komada i platite ${save} manje — kliknite za ispravku.`,
    standsPiece:    "kom",
    standsFrom:     "od",
  },
  en: {
    back: "Back",
    title: "Upgrade your gallery",
    subtitle: "Choose the plan that fits your event.",
    vatIncluded: "VAT included",
    trustRefund: "30-day guarantee",
    trustSecure: "Secure payment",
    trustInstant: "Instant activation",
    trustGdpr: "GDPR Compliant", trustEuServers: "EU Data Centers", trustEncryption: "SSL Encryption",
    testimonialQuote: "Guestcam was the best decision for our day. Guests uploaded over 300 photos — no apps, no hassle. All the memories in one place!",
    testimonialAuthor: "Ana & Marko",
    testimonialMeta: "500+ photos · 2026",
    supportTitle: "Got a question?",
    supportSubtitle: "Message us on Viber or WhatsApp — we reply within minutes.",
    paymentMethod: "Payment method",
    paymentCardLabel: "Pay by card",
    paymentCardSub: "Visa, Mastercard, iDEAL · instant activation",
    paymentInvoiceLabel: "Bank transfer / invoice",
    paymentInvoiceSub: "You'll receive the invoice within 24 h",
    billingTitle: "Invoice details",
    billingCardTitle: "Billing details (for your invoice)",
    billingName: "Full name *",
    billingCompanyToggle: "I need a company invoice",
    billingCompany: "Company name (optional)",
    billingEmail: "Email address *",
    billingPhone: "Phone *",
    billingAddress: "Street and number *",
    billingPostalCode: "Postal code *",
    billingCity: "City *",
    billingTaxId: "Tax ID (optional)",
    planPrefix: "Plan",
    onetimePayment: "One-time payment · no subscription",
    termsAcceptance: (link) => `By purchasing you agree to the ${link}. 30-day money-back guarantee.`,
    termsLinkText: "terms of use",
    ctaCard:    (p, price) => `Upgrade to ${p} — €${price} →`,
    ctaInvoice: (price) => `Submit invoice order — €${price}`,
    ctaSending: "Sending…",
    ctaRedirecting: "Redirecting to payment…",
    invoiceDoneTitle: "Order received!",
    invoiceDoneBody: (plan) => `We'll send the invoice within 24 h. After payment your ${plan} plan will be activated immediately.`,
    alertMissingFields: "Please fill in all required fields (name, email, address, city).",
    alertInvoiceFailed: "Failed to submit order. Write to info@guestcam.si",
    alertPaymentFailed: "Payment failed. Please try again or contact us at info@guestcam.si",
    footerTagline: "QR-code gallery — no app needed. Guests take the photos, you collect the memories.",
    footerProduct: "Product",
    footerLegal: "Legal",
    footerLinkPricing: "Pricing",
    footerLinkHow: "How it works",
    footerLinkMyGalleries: "My galleries",
    footerLinkContact: "Contact",
    footerLinkPrivacy: "Privacy",
    footerLinkTerms: "Terms of use",
    footerLinkRefund: "Refunds",
    footerCompanyLine: "© 2026 Guestcam · Sport group d.o.o. · SI72133449 · Slovenia",
    footerNoRegistration: "No registration for guests",
    taglineBasic: "For smaller events",
    taglinePlus:  "Most popular",
    taglinePremium: "Everything included",
    badgeRecommended: "RECOMMENDED",
    featurePhotos1000:       "Up to 1000 photos",
    featurePhotos5000:       "Up to 5000 photos",
    featurePhotosUnlimited:  "Unlimited photos",
    featureVideos10:         "Up to 10 videos",
    featureVideos100:        "Up to 100 videos",
    featureQrCode:           "QR code for tables",
    featureFullQuality:      "Full-quality photo download",
    featureZipDownload:      "Download all photos (ZIP)",
    featureAccess3mo:        "3-month access",
    featureAccess1yr:        "1-year access",
    featureAccess2yr:        "2-year access",
    featureLiveGallery:      "Live gallery in real time",
    featureCustomPage:       "Personalized page",
    featurePremiumTemplates: "Premium templates",
    featureCustomQrText:     "Custom text on the QR card",
    featurePhotoWall:        "Photo Wall for TV / projector",
    featurePrioritySupport:  "Priority support",
    standsTitle:    "Printed QR table stands",
    standsDesc:     "We print stands with your QR code and post them to you — ready for the tables.",
    standsCountry:  "Delivery country",
    standsShipping: "Shipping",
    standsTotal:    "Total",
    standsQty:      "Number of stands",
    standsMaterial: "Material",
    standsWood:     "Wooden",
    standsGold:     "Gold",
    standsVat:      "Prices include printing and VAT.",
    standsVolumeHint: (q1, p1, q2, p2) => `${q1}+ pcs −${p1}%, ${q2}+ pcs −${p2}%`,
    standsBetterOffer: (qty, save) => `Order ${qty} and pay ${save} less — tap to change.`,
    standsPiece:    "ea",
    standsFrom:     "from",
  },
  de: {
    back: "Zurück",
    title: "Galerie upgraden",
    subtitle: "Wählen Sie das Paket, das zu Ihrer Veranstaltung passt.",
    vatIncluded: "inkl. MwSt.",
    trustRefund: "30-Tage-Garantie",
    trustSecure: "Sichere Zahlung",
    trustInstant: "Sofortige Aktivierung",
    trustGdpr: "DSGVO-konform", trustEuServers: "EU-Server", trustEncryption: "SSL-Verschlüsselung",
    testimonialQuote: "Guestcam war die beste Entscheidung für unseren Tag. Die Gäste haben über 300 Fotos hochgeladen — ohne App, ohne Umstände. Alle Erinnerungen an einem Ort!",
    testimonialAuthor: "Ana & Marko",
    testimonialMeta: "500+ Fotos · 2026",
    supportTitle: "Haben Sie eine Frage?",
    supportSubtitle: "Schreiben Sie uns auf Viber oder WhatsApp — wir antworten in wenigen Minuten.",
    paymentMethod: "Zahlungsmethode",
    paymentCardLabel: "Kartenzahlung",
    paymentCardSub: "Visa, Mastercard, iDEAL · sofort aktiv",
    paymentInvoiceLabel: "Rechnung / Überweisung",
    paymentInvoiceSub: "Rechnung erhalten Sie innerhalb von 24 h",
    billingTitle: "Rechnungsdaten",
    billingCardTitle: "Rechnungsdaten (für Ihre Rechnung)",
    billingName: "Vor- und Nachname *",
    billingCompanyToggle: "Ich benötige eine Firmenrechnung",
    billingCompany: "Firmenname (optional)",
    billingEmail: "E-Mail-Adresse *",
    billingPhone: "Telefon *",
    billingAddress: "Straße und Hausnummer *",
    billingPostalCode: "PLZ *",
    billingCity: "Ort *",
    billingTaxId: "Steuernummer (optional)",
    planPrefix: "Paket",
    onetimePayment: "Einmalzahlung · kein Abo",
    termsAcceptance: (link) => `Mit dem Kauf akzeptieren Sie die ${link}. 30-Tage-Geld-zurück-Garantie.`,
    termsLinkText: "Nutzungsbedingungen",
    ctaCard:    (p, price) => `Upgrade auf ${p} — ${price} € →`,
    ctaInvoice: (price) => `Rechnungsbestellung absenden — ${price} €`,
    ctaSending: "Wird gesendet…",
    ctaRedirecting: "Weiterleitung zur Zahlung…",
    invoiceDoneTitle: "Bestellung eingegangen!",
    invoiceDoneBody: (plan) => `Die Rechnung senden wir innerhalb von 24 h. Nach Zahlung wird das Paket ${plan} sofort aktiviert.`,
    alertMissingFields: "Bitte füllen Sie alle Pflichtfelder aus (Name, E-Mail, Adresse, Ort).",
    alertInvoiceFailed: "Bestellung konnte nicht gesendet werden. Schreiben Sie an info@guestcam.si",
    alertPaymentFailed: "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns unter info@guestcam.si",
    footerTagline: "QR-Code-Galerie — keine App nötig. Ihre Gäste fotografieren, Sie sammeln die Erinnerungen.",
    footerProduct: "Produkt",
    footerLegal: "Rechtliches",
    footerLinkPricing: "Preise",
    footerLinkHow: "So funktioniert's",
    footerLinkMyGalleries: "Meine Galerien",
    footerLinkContact: "Kontakt",
    footerLinkPrivacy: "Datenschutz",
    footerLinkTerms: "Nutzungsbedingungen",
    footerLinkRefund: "Rückerstattung",
    footerCompanyLine: "© 2026 Guestcam · Sport group d.o.o. · SI72133449 · Slowenien",
    footerNoRegistration: "Keine Registrierung für Gäste",
    taglineBasic: "Für kleinere Events",
    taglinePlus:  "Am beliebtesten",
    taglinePremium: "Alles inklusive",
    badgeRecommended: "EMPFOHLEN",
    featurePhotos1000:       "Bis zu 1000 Fotos",
    featurePhotos5000:       "Bis zu 5000 Fotos",
    featurePhotosUnlimited:  "Unbegrenzt Fotos",
    featureVideos10:         "Bis zu 10 Videos",
    featureVideos100:        "Bis zu 100 Videos",
    featureQrCode:           "QR-Code für den Tisch",
    featureFullQuality:      "Fotodownload in voller Qualität",
    featureZipDownload:      "Alle Fotos herunterladen (ZIP)",
    featureAccess3mo:        "3 Monate Zugang",
    featureAccess1yr:        "1 Jahr Zugang",
    featureAccess2yr:        "2 Jahre Zugang",
    featureLiveGallery:      "Live-Galerie in Echtzeit",
    featureCustomPage:       "Personalisierte Seite",
    featurePremiumTemplates: "Premium-Vorlagen",
    featureCustomQrText:     "Eigener Text auf der QR-Karte",
    featurePhotoWall:        "Foto-Wall für TV / Beamer",
    featurePrioritySupport:  "Prioritäts-Support",
    standsTitle:    "Gedruckte QR-Tischaufsteller",
    standsDesc:     "Wir drucken Aufsteller mit Ihrem QR-Code und senden sie Ihnen zu — fertig für die Tische.",
    standsCountry:  "Lieferland",
    standsShipping: "Versand",
    standsTotal:    "Gesamt",
    standsQty:      "Anzahl der Aufsteller",
    standsMaterial: "Material",
    standsWood:     "Holz",
    standsGold:     "Gold",
    standsVat:      "Preise inkl. Druck und MwSt.",
    standsVolumeHint: (q1, p1, q2, p2) => `ab ${q1} Stk. −${p1}%, ab ${q2} Stk. −${p2}%`,
    standsBetterOffer: (qty, save) => `Bestellen Sie ${qty} Stück und zahlen Sie ${save} weniger — zum Ändern klicken.`,
    standsPiece:    "St.",
    standsFrom:     "ab",
  },
  es: {
    back: "Atrás",
    title: "Mejora tu galería",
    subtitle: "Elige el plan que se ajusta a tu evento.",
    vatIncluded: "IVA incluido",
    trustRefund: "Garantía de 30 días",
    trustSecure: "Pago seguro",
    trustInstant: "Activación inmediata",
    trustGdpr: "Cumple GDPR", trustEuServers: "Servidores en la UE", trustEncryption: "Cifrado SSL",
    testimonialQuote: "Guestcam fue la mejor decisión para nuestro día. Los invitados subieron más de 300 fotos — sin apps, sin líos. ¡Todos los recuerdos en un solo lugar!",
    testimonialAuthor: "Ana & Marko",
    testimonialMeta: "500+ fotos · 2026",
    supportTitle: "¿Alguna pregunta?",
    supportSubtitle: "Escríbenos por Viber o WhatsApp — respondemos en minutos.",
    paymentMethod: "Método de pago",
    paymentCardLabel: "Pago con tarjeta",
    paymentCardSub: "Visa, Mastercard, iDEAL · activación inmediata",
    paymentInvoiceLabel: "Factura / transferencia bancaria",
    paymentInvoiceSub: "Recibirás la factura en 24 h",
    billingTitle: "Datos de facturación",
    billingCardTitle: "Datos de facturación (para tu factura)",
    billingName: "Nombre y apellidos *",
    billingCompanyToggle: "Necesito factura de empresa",
    billingCompany: "Nombre de la empresa (opcional)",
    billingEmail: "Correo electrónico *",
    billingPhone: "Teléfono *",
    billingAddress: "Calle y número *",
    billingPostalCode: "Código postal *",
    billingCity: "Ciudad *",
    billingTaxId: "NIF/CIF (opcional)",
    planPrefix: "Plan",
    onetimePayment: "Pago único · sin suscripción",
    termsAcceptance: (link) => `Al comprar aceptas los ${link}. Garantía de devolución de 30 días.`,
    termsLinkText: "términos de uso",
    ctaCard:    (p, price) => `Mejorar a ${p} — ${price}€ →`,
    ctaInvoice: (price) => `Enviar pedido con factura — ${price}€`,
    ctaSending: "Enviando…",
    ctaRedirecting: "Redirigiendo al pago…",
    invoiceDoneTitle: "¡Pedido recibido!",
    invoiceDoneBody: (plan) => `Enviaremos la factura en 24 h. Tras el pago tu plan ${plan} se activará al instante.`,
    alertMissingFields: "Por favor completa todos los campos obligatorios (nombre, email, dirección, ciudad).",
    alertInvoiceFailed: "Error al enviar el pedido. Escribe a info@guestcam.si",
    alertPaymentFailed: "Error en el pago. Inténtalo de nuevo o contáctanos en info@guestcam.si",
    footerTagline: "Galería con código QR — sin app. Los invitados toman las fotos, tú recoges los recuerdos.",
    footerProduct: "Producto",
    footerLegal: "Legal",
    footerLinkPricing: "Precios",
    footerLinkHow: "Cómo funciona",
    footerLinkMyGalleries: "Mis galerías",
    footerLinkContact: "Contacto",
    footerLinkPrivacy: "Privacidad",
    footerLinkTerms: "Términos de uso",
    footerLinkRefund: "Reembolsos",
    footerCompanyLine: "© 2026 Guestcam · Sport group d.o.o. · SI72133449 · Eslovenia",
    footerNoRegistration: "Sin registro para invitados",
    taglineBasic: "Para eventos más pequeños",
    taglinePlus:  "El más popular",
    taglinePremium: "Todo incluido",
    badgeRecommended: "RECOMENDADO",
    featurePhotos1000:       "Hasta 1000 fotos",
    featurePhotos5000:       "Hasta 5000 fotos",
    featurePhotosUnlimited:  "Fotos ilimitadas",
    featureVideos10:         "Hasta 10 vídeos",
    featureVideos100:        "Hasta 100 vídeos",
    featureQrCode:           "Código QR para las mesas",
    featureFullQuality:      "Descarga de fotos en calidad completa",
    featureZipDownload:      "Descarga todas las fotos (ZIP)",
    featureAccess3mo:        "Acceso 3 meses",
    featureAccess1yr:        "Acceso 1 año",
    featureAccess2yr:        "Acceso 2 años",
    featureLiveGallery:      "Galería en vivo, en tiempo real",
    featureCustomPage:       "Página personalizada",
    featurePremiumTemplates: "Plantillas premium",
    featureCustomQrText:     "Texto propio en la tarjeta QR",
    featurePhotoWall:        "Muro de fotos para TV / proyector",
    featurePrioritySupport:  "Soporte prioritario",
    standsTitle:    "Soportes de mesa QR impresos",
    standsDesc:     "Imprimimos soportes con tu código QR y te los enviamos — listos para las mesas.",
    standsCountry:  "País de entrega",
    standsShipping: "Envío",
    standsTotal:    "Total",
    standsQty:      "Número de soportes",
    standsMaterial: "Material",
    standsWood:     "Madera",
    standsGold:     "Dorado",
    standsVat:      "Precios con impresión e IVA incluidos.",
    standsVolumeHint: (q1, p1, q2, p2) => `${q1}+ uds −${p1}%, ${q2}+ uds −${p2}%`,
    standsBetterOffer: (qty, save) => `Pide ${qty} unidades y paga ${save} menos — toca para cambiar.`,
    standsPiece:    "ud",
    standsFrom:     "desde",
  },
};

/** Feature keys used by each plan — keyed the same way in every locale. */
export const PLAN_FEATURE_KEYS: Record<"basic" | "plus" | "premium", (keyof UpgradeCopy)[]> = {
  basic: [
    "featureFullQuality",
    "featurePhotos1000",
    "featureVideos10",
    "featureQrCode",
    "featureZipDownload",
    "featureAccess3mo",
  ],
  plus: [
    "featureFullQuality",
    "featurePhotos5000",
    "featureVideos100",
    "featureQrCode",
    "featureZipDownload",
    "featureAccess1yr",
    "featureLiveGallery",
    "featureCustomPage",
    "featurePremiumTemplates",
  ],
  premium: [
    "featureFullQuality",
    "featurePhotosUnlimited",
    "featureVideos100",
    "featureQrCode",
    "featureZipDownload",
    "featureAccess2yr",
    "featureLiveGallery",
    "featureCustomPage",
    "featurePremiumTemplates",
    "featureCustomQrText",
    "featurePhotoWall",
    "featurePrioritySupport",
  ],
};
