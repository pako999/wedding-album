/**
 * Affiliate UI translations (apply page + partner dashboard).
 *
 * Master language is Slovenian — write `sl` first, then translate down.
 * Admin pages stay in Slovenian only (admin surface, not user-facing).
 *
 * Email templates have their own locale strings in
 * `lib/email/notifications.ts` (AFF_STRINGS) to keep server email render
 * paths self-contained.
 */

export type AffiliateLang = "sl" | "hr" | "sr" | "en" | "de" | "es";

export interface AffiliateUiStrings {
  // ── Apply page ────────────────────────────────────────────────────────────
  apply: {
    pageTitle: string;
    metaDescription: string;
    badge: string;
    headingLine1: string;
    headingLine2: string;
    subheading: string;
    benefits: { title: string; body: string }[]; // length 4
    formTitle: string;
    formSubtitle: string;
    formName: string;
    formEmail: string;
    formWebsite: string;
    formPromotionPlan: string;
    formPromotionPlaceholder: string;
    formIban: string;
    formLocale: string;
    formSubmit: string;
    formSubmitting: string;
    successTitle: string;
    successBody: string;
    errorGeneric: string;
    errorName: string;
    errorEmail: string;
    errorPromotion: string;
    errorDuplicate: string;
    required: string;
  };
  // ── Partner dashboard ─────────────────────────────────────────────────────
  dashboard: {
    badge: string;
    greeting: (name: string) => string;
    codeLabel: string;
    linkLabel: string;
    copyCode: string;
    copyLink: string;
    copied: string;
    statClicks: string;
    statOrders: string;
    statPending: string;
    statAvailable: string;
    infoRate: string;
    infoCookie: string;
    infoEarnings: string;
    cookieDays: (n: number) => string;
    commissionsTitle: string;
    colDate: string;
    colOrder: string;
    colCommission: string;
    colStatus: string;
    emptyState: string;
    contactFooter: string;
    pendingTitle: string;
    pendingBody: string;
    suspendedTitle: string;
    rejectedTitle: string;
    blockedBody: string;
    notAffiliateTitle: string;
    notAffiliateBody: string;
    notAffiliateCta: string;
  };
  // ── Commission status badges ──────────────────────────────────────────────
  status: {
    pending: string;
    approved: string;
    paid: string;
    cancelled: string;
  };
}

const sl: AffiliateUiStrings = {
  apply: {
    pageTitle: "Postanite GuestCam partner — zaslužite 20%",
    metaDescription: "Pridružite se GuestCam partnerskemu programu in zaslužite 20% provizije za vsako priporočeno naročilo.",
    badge: "🤝 Partnerski program",
    headingLine1: "Priporočite GuestCam.",
    headingLine2: "Zaslužite 20%.",
    subheading: "Pridružite se GuestCam partnerskemu programu in zaslužite 20% od vsakega plačanega naročila — za vsako novo sklenitev partnerske povezave.",
    benefits: [
      { title: "20% provizija", body: "Za vsako naročilo prek vaše povezave." },
      { title: "60-dnevni piškotek", body: "Pripisano vam je vsako naročilo v 60 dneh od klika." },
      { title: "Hitro izplačilo", body: "Po 14 dneh na PayPal ali bančni račun." },
      { title: "Lastna nadzorna plošča", body: "Sledite klikom, naročilom in zaslužku v realnem času." },
    ],
    formTitle: "Prijava",
    formSubtitle: "Pregledali jo bomo in vam odgovorili v 2 delovnih dneh.",
    formName: "Ime in priimek",
    formEmail: "E-poštni naslov",
    formWebsite: "Vaša spletna stran (neobvezno)",
    formPromotionPlan: "Kako nameravate promovirati GuestCam?",
    formPromotionPlaceholder: "Opišite vašo publiko, kanale (blog, Instagram, YouTube...) in strategijo promocije.",
    formIban: "Transakcijski račun (IBAN) za izplačila (neobvezno)",
    formLocale: "Jezik za obvestila",
    formSubmit: "Pošlji prijavo",
    formSubmitting: "Pošiljam…",
    successTitle: "Prijava prejeta!",
    successBody: "Hvala za prijavo. Pregledali jo bomo in vam odgovorili v 2 delovnih dneh na vaš e-poštni naslov.",
    errorGeneric: "Prišlo je do napake. Prosimo, poskusite znova.",
    errorName: "Vnesite vaše ime.",
    errorEmail: "Vnesite veljaven e-poštni naslov.",
    errorPromotion: "Prosimo opišite, kako boste promovirali GuestCam (vsaj 20 znakov).",
    errorDuplicate: "Prijava s tem e-poštnim naslovom že obstaja.",
    required: "obvezno",
  },
  dashboard: {
    badge: "🤝 Partnerski program",
    greeting: (name) => `Pozdravljeni, ${name}!`,
    codeLabel: "Vaša partnerska koda",
    linkLabel: "Vaša partnerska povezava",
    copyCode: "Kopiraj kodo",
    copyLink: "Kopiraj povezavo",
    copied: "Kopirano! ✓",
    statClicks: "Kliki",
    statOrders: "Naročila",
    statPending: "V čakanju",
    statAvailable: "Na voljo",
    infoRate: "Provizija:",
    infoCookie: "Veljavnost piškotka:",
    infoEarnings: "Skupni zaslužek:",
    cookieDays: (n) => `${n} dni`,
    commissionsTitle: "Zadnje provizije",
    colDate: "Datum",
    colOrder: "Naročilo",
    colCommission: "Provizija",
    colStatus: "Status",
    emptyState: "Še nimate provizij. Delite svojo partnersko kodo!",
    contactFooter: "Za vprašanja nam pišite na partnerji@guestcam.si",
    pendingTitle: "Prijava v obdelavi",
    pendingBody: "Vašo prijavo pregledujemo. Odgovorili vam bomo v 2 delovnih dneh.",
    suspendedTitle: "Partnerski račun ustavljen",
    rejectedTitle: "Prijava zavrnjena",
    blockedBody: "Za več informacij nam pišite na partnerji@guestcam.si.",
    notAffiliateTitle: "Še niste partner",
    notAffiliateBody: "Pridružite se GuestCam partnerskemu programu in zaslužite 20% provizije.",
    notAffiliateCta: "Prijava →",
  },
  status: {
    pending: "V čakanju",
    approved: "Potrjeno",
    paid: "Izplačano",
    cancelled: "Preklicano",
  },
};

const en: AffiliateUiStrings = {
  apply: {
    pageTitle: "Become a GuestCam partner — earn 20%",
    metaDescription: "Join the GuestCam partner program and earn 20% commission on every referred order.",
    badge: "🤝 Partner program",
    headingLine1: "Recommend GuestCam.",
    headingLine2: "Earn 20%.",
    subheading: "Join the GuestCam partner program and earn 20% of every paid order — for every new sign-up through your partner link.",
    benefits: [
      { title: "20% commission", body: "On every order through your link." },
      { title: "60-day cookie", body: "Every order within 60 days of click is credited to you." },
      { title: "Fast payout", body: "After 14 days to PayPal or bank account." },
      { title: "Your own dashboard", body: "Track clicks, orders, and earnings in real time." },
    ],
    formTitle: "Apply",
    formSubtitle: "We'll review your application and reply within 2 business days.",
    formName: "Full name",
    formEmail: "Email address",
    formWebsite: "Your website (optional)",
    formPromotionPlan: "How will you promote GuestCam?",
    formPromotionPlaceholder: "Describe your audience, channels (blog, Instagram, YouTube...) and promotion strategy.",
    formIban: "Bank account (IBAN) for payouts (optional)",
    formLocale: "Notification language",
    formSubmit: "Submit application",
    formSubmitting: "Sending…",
    successTitle: "Application received!",
    successBody: "Thanks for applying. We'll review your application and reply within 2 business days to your email address.",
    errorGeneric: "Something went wrong. Please try again.",
    errorName: "Please enter your name.",
    errorEmail: "Please enter a valid email address.",
    errorPromotion: "Please describe how you'll promote GuestCam (at least 20 characters).",
    errorDuplicate: "An application with this email already exists.",
    required: "required",
  },
  dashboard: {
    badge: "🤝 Partner program",
    greeting: (name) => `Hi, ${name}!`,
    codeLabel: "Your referral code",
    linkLabel: "Your referral link",
    copyCode: "Copy code",
    copyLink: "Copy link",
    copied: "Copied! ✓",
    statClicks: "Clicks",
    statOrders: "Orders",
    statPending: "Pending",
    statAvailable: "Available",
    infoRate: "Commission:",
    infoCookie: "Cookie window:",
    infoEarnings: "Total earnings:",
    cookieDays: (n) => `${n} days`,
    commissionsTitle: "Recent commissions",
    colDate: "Date",
    colOrder: "Order",
    colCommission: "Commission",
    colStatus: "Status",
    emptyState: "No commissions yet. Share your partner code!",
    contactFooter: "Questions? Email us at partnerji@guestcam.si",
    pendingTitle: "Application in review",
    pendingBody: "We're reviewing your application. We'll get back to you within 2 business days.",
    suspendedTitle: "Partner account suspended",
    rejectedTitle: "Application rejected",
    blockedBody: "For more information, email us at partnerji@guestcam.si.",
    notAffiliateTitle: "You're not a partner yet",
    notAffiliateBody: "Join the GuestCam partner program and earn 20% commission.",
    notAffiliateCta: "Apply →",
  },
  status: {
    pending: "Pending",
    approved: "Approved",
    paid: "Paid",
    cancelled: "Cancelled",
  },
};

const de: AffiliateUiStrings = {
  apply: {
    pageTitle: "GuestCam Partner werden — 20% verdienen",
    metaDescription: "Treten Sie dem GuestCam Partnerprogramm bei und verdienen Sie 20% Provision für jede empfohlene Bestellung.",
    badge: "🤝 Partnerprogramm",
    headingLine1: "Empfehlen Sie GuestCam.",
    headingLine2: "Verdienen Sie 20%.",
    subheading: "Treten Sie dem GuestCam Partnerprogramm bei und verdienen Sie 20% von jeder bezahlten Bestellung — für jede neue Anmeldung über Ihren Partner-Link.",
    benefits: [
      { title: "20% Provision", body: "Für jede Bestellung über Ihren Link." },
      { title: "60-Tage Cookie", body: "Jede Bestellung innerhalb von 60 Tagen nach dem Klick wird Ihnen gutgeschrieben." },
      { title: "Schnelle Auszahlung", body: "Nach 14 Tagen auf PayPal oder Bankkonto." },
      { title: "Eigenes Dashboard", body: "Verfolgen Sie Klicks, Bestellungen und Einnahmen in Echtzeit." },
    ],
    formTitle: "Bewerbung",
    formSubtitle: "Wir prüfen Ihre Bewerbung und antworten innerhalb von 2 Werktagen.",
    formName: "Vor- und Nachname",
    formEmail: "E-Mail-Adresse",
    formWebsite: "Ihre Website (optional)",
    formPromotionPlan: "Wie werden Sie GuestCam bewerben?",
    formPromotionPlaceholder: "Beschreiben Sie Ihre Zielgruppe, Kanäle (Blog, Instagram, YouTube...) und Werbestrategie.",
    formIban: "Bankkonto (IBAN) für Auszahlungen (optional)",
    formLocale: "Sprache für Benachrichtigungen",
    formSubmit: "Bewerbung absenden",
    formSubmitting: "Wird gesendet…",
    successTitle: "Bewerbung erhalten!",
    successBody: "Vielen Dank für Ihre Bewerbung. Wir prüfen sie und antworten innerhalb von 2 Werktagen an Ihre E-Mail-Adresse.",
    errorGeneric: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    errorName: "Bitte geben Sie Ihren Namen ein.",
    errorEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    errorPromotion: "Bitte beschreiben Sie, wie Sie GuestCam bewerben werden (mindestens 20 Zeichen).",
    errorDuplicate: "Eine Bewerbung mit dieser E-Mail-Adresse existiert bereits.",
    required: "Pflichtfeld",
  },
  dashboard: {
    badge: "🤝 Partnerprogramm",
    greeting: (name) => `Hallo, ${name}!`,
    codeLabel: "Ihr Partner-Code",
    linkLabel: "Ihr Partner-Link",
    copyCode: "Code kopieren",
    copyLink: "Link kopieren",
    copied: "Kopiert! ✓",
    statClicks: "Klicks",
    statOrders: "Bestellungen",
    statPending: "Ausstehend",
    statAvailable: "Verfügbar",
    infoRate: "Provision:",
    infoCookie: "Cookie-Laufzeit:",
    infoEarnings: "Gesamteinnahmen:",
    cookieDays: (n) => `${n} Tage`,
    commissionsTitle: "Letzte Provisionen",
    colDate: "Datum",
    colOrder: "Bestellung",
    colCommission: "Provision",
    colStatus: "Status",
    emptyState: "Noch keine Provisionen. Teilen Sie Ihren Partner-Code!",
    contactFooter: "Fragen? Schreiben Sie uns an partnerji@guestcam.si",
    pendingTitle: "Bewerbung in Prüfung",
    pendingBody: "Wir prüfen Ihre Bewerbung. Wir melden uns innerhalb von 2 Werktagen.",
    suspendedTitle: "Partner-Konto gesperrt",
    rejectedTitle: "Bewerbung abgelehnt",
    blockedBody: "Für weitere Informationen schreiben Sie uns an partnerji@guestcam.si.",
    notAffiliateTitle: "Sie sind noch kein Partner",
    notAffiliateBody: "Treten Sie dem GuestCam Partnerprogramm bei und verdienen Sie 20% Provision.",
    notAffiliateCta: "Bewerben →",
  },
  status: {
    pending: "Ausstehend",
    approved: "Bestätigt",
    paid: "Ausgezahlt",
    cancelled: "Storniert",
  },
};

const hr: AffiliateUiStrings = {
  apply: {
    pageTitle: "GuestCam partnerski program — Hrvatska",
    metaDescription: "Pridružite se GuestCam partnerskom programu i zaradite 20% provizije za svaku preporučenu narudžbu.",
    badge: "🤝 Partnerski program",
    headingLine1: "Preporučite GuestCam.",
    headingLine2: "Zaradite 20%.",
    subheading: "Pridružite se GuestCam partnerskom programu i zaradite 20% od svake plaćene narudžbe — za svaku novu prijavu putem vaše partnerske poveznice.",
    benefits: [
      { title: "20% provizija", body: "Za svaku narudžbu putem vaše poveznice." },
      { title: "60-dnevni kolačić", body: "Svaka narudžba u roku od 60 dana od klika pripisuje se vama." },
      { title: "Brza isplata", body: "Nakon 14 dana na PayPal ili bankovni račun." },
      { title: "Vlastita nadzorna ploča", body: "Pratite klikove, narudžbe i zaradu u stvarnom vremenu." },
    ],
    formTitle: "Prijava",
    formSubtitle: "Pregledat ćemo vašu prijavu i javiti vam se u roku od 2 radna dana.",
    formName: "Ime i prezime",
    formEmail: "E-mail adresa",
    formWebsite: "Vaša web stranica (neobavezno)",
    formPromotionPlan: "Kako ćete promovirati GuestCam?",
    formPromotionPlaceholder: "Opišite vašu publiku, kanale (blog, Instagram, YouTube...) i strategiju promocije.",
    formIban: "Bankovni račun (IBAN) za isplate (neobavezno)",
    formLocale: "Jezik obavijesti",
    formSubmit: "Pošalji prijavu",
    formSubmitting: "Šaljem…",
    successTitle: "Prijava primljena!",
    successBody: "Hvala na prijavi. Pregledat ćemo je i javiti vam se u roku od 2 radna dana na vašu e-mail adresu.",
    errorGeneric: "Došlo je do greške. Molimo pokušajte ponovno.",
    errorName: "Unesite svoje ime.",
    errorEmail: "Unesite valjanu e-mail adresu.",
    errorPromotion: "Molimo opišite kako ćete promovirati GuestCam (najmanje 20 znakova).",
    errorDuplicate: "Prijava s ovom e-mail adresom već postoji.",
    required: "obavezno",
  },
  dashboard: {
    badge: "🤝 Partnerski program",
    greeting: (name) => `Pozdrav, ${name}!`,
    codeLabel: "Vaš partnerski kod",
    linkLabel: "Vaša partnerska poveznica",
    copyCode: "Kopiraj kod",
    copyLink: "Kopiraj poveznicu",
    copied: "Kopirano! ✓",
    statClicks: "Klikovi",
    statOrders: "Narudžbe",
    statPending: "Na čekanju",
    statAvailable: "Dostupno",
    infoRate: "Provizija:",
    infoCookie: "Trajanje kolačića:",
    infoEarnings: "Ukupna zarada:",
    cookieDays: (n) => `${n} dana`,
    commissionsTitle: "Zadnje provizije",
    colDate: "Datum",
    colOrder: "Narudžba",
    colCommission: "Provizija",
    colStatus: "Status",
    emptyState: "Još nemate provizija. Podijelite svoj partnerski kod!",
    contactFooter: "Pitanja? Pišite nam na partnerji@guestcam.si",
    pendingTitle: "Prijava u obradi",
    pendingBody: "Vašu prijavu pregledavamo. Javit ćemo vam se u roku od 2 radna dana.",
    suspendedTitle: "Partnerski račun obustavljen",
    rejectedTitle: "Prijava odbijena",
    blockedBody: "Za više informacija pišite nam na partnerji@guestcam.si.",
    notAffiliateTitle: "Niste još partner",
    notAffiliateBody: "Pridružite se GuestCam partnerskom programu i zaradite 20% provizije.",
    notAffiliateCta: "Prijava →",
  },
  status: {
    pending: "Na čekanju",
    approved: "Odobreno",
    paid: "Isplaćeno",
    cancelled: "Otkazano",
  },
};

const sr: AffiliateUiStrings = {
  apply: {
    pageTitle: "GuestCam partnerski program — Srbija",
    metaDescription: "Pridružite se GuestCam partnerskom programu i zaradite 20% provizije za svaku preporučenu porudžbinu.",
    badge: "🤝 Partnerski program",
    headingLine1: "Preporučite GuestCam.",
    headingLine2: "Zaradite 20%.",
    subheading: "Pridružite se GuestCam partnerskom programu i zaradite 20% od svake plaćene porudžbine — za svaku novu prijavu putem vašeg partnerskog linka.",
    benefits: [
      { title: "20% provizija", body: "Za svaku porudžbinu preko vašeg linka." },
      { title: "60-dnevni kolačić", body: "Svaka porudžbina u roku od 60 dana od klika pripisuje se vama." },
      { title: "Brza isplata", body: "Posle 14 dana na PayPal ili bankovni račun." },
      { title: "Sopstvena kontrolna tabla", body: "Pratite klikove, porudžbine i zaradu u realnom vremenu." },
    ],
    formTitle: "Prijava",
    formSubtitle: "Pregledaćemo vašu prijavu i javiti vam se u roku od 2 radna dana.",
    formName: "Ime i prezime",
    formEmail: "E-mail adresa",
    formWebsite: "Vaš sajt (opciono)",
    formPromotionPlan: "Kako ćete promovisati GuestCam?",
    formPromotionPlaceholder: "Opišite vašu publiku, kanale (blog, Instagram, YouTube...) i strategiju promocije.",
    formIban: "Bankovni račun (IBAN) za isplate (opciono)",
    formLocale: "Jezik obaveštenja",
    formSubmit: "Pošalji prijavu",
    formSubmitting: "Šaljem…",
    successTitle: "Prijava primljena!",
    successBody: "Hvala na prijavi. Pregledaćemo je i javiti vam se u roku od 2 radna dana na vašu e-mail adresu.",
    errorGeneric: "Došlo je do greške. Pokušajte ponovo.",
    errorName: "Unesite svoje ime.",
    errorEmail: "Unesite ispravnu e-mail adresu.",
    errorPromotion: "Opišite kako ćete promovisati GuestCam (najmanje 20 karaktera).",
    errorDuplicate: "Prijava sa ovom e-mail adresom već postoji.",
    required: "obavezno",
  },
  dashboard: {
    badge: "🤝 Partnerski program",
    greeting: (name) => `Pozdrav, ${name}!`,
    codeLabel: "Vaš partnerski kod",
    linkLabel: "Vaš partnerski link",
    copyCode: "Kopiraj kod",
    copyLink: "Kopiraj link",
    copied: "Kopirano! ✓",
    statClicks: "Klikovi",
    statOrders: "Porudžbine",
    statPending: "Na čekanju",
    statAvailable: "Dostupno",
    infoRate: "Provizija:",
    infoCookie: "Trajanje kolačića:",
    infoEarnings: "Ukupna zarada:",
    cookieDays: (n) => `${n} dana`,
    commissionsTitle: "Poslednje provizije",
    colDate: "Datum",
    colOrder: "Porudžbina",
    colCommission: "Provizija",
    colStatus: "Status",
    emptyState: "Još nemate provizija. Podelite svoj partnerski kod!",
    contactFooter: "Pitanja? Pišite nam na partnerji@guestcam.si",
    pendingTitle: "Prijava u obradi",
    pendingBody: "Vašu prijavu pregledamo. Javićemo vam se u roku od 2 radna dana.",
    suspendedTitle: "Partnerski nalog suspendovan",
    rejectedTitle: "Prijava odbijena",
    blockedBody: "Za više informacija pišite nam na partnerji@guestcam.si.",
    notAffiliateTitle: "Još niste partner",
    notAffiliateBody: "Pridružite se GuestCam partnerskom programu i zaradite 20% provizije.",
    notAffiliateCta: "Prijava →",
  },
  status: {
    pending: "Na čekanju",
    approved: "Odobreno",
    paid: "Isplaćeno",
    cancelled: "Otkazano",
  },
};

const es: AffiliateUiStrings = {
  apply: {
    pageTitle: "Hazte partner de GuestCam — gana 20%",
    metaDescription: "Únete al programa de afiliados de GuestCam y gana un 20% de comisión por cada pedido referido.",
    badge: "🤝 Programa de afiliados",
    headingLine1: "Recomienda GuestCam.",
    headingLine2: "Gana 20%.",
    subheading: "Únete al programa de afiliados de GuestCam y gana el 20% de cada pedido pagado — por cada nuevo registro a través de tu enlace de afiliado.",
    benefits: [
      { title: "20% de comisión", body: "Por cada pedido a través de tu enlace." },
      { title: "Cookie de 60 días", body: "Cada pedido en los 60 días siguientes al clic se te acredita." },
      { title: "Pago rápido", body: "Tras 14 días a PayPal o cuenta bancaria." },
      { title: "Tu propio panel", body: "Sigue clics, pedidos y ganancias en tiempo real." },
    ],
    formTitle: "Solicitud",
    formSubtitle: "Revisaremos tu solicitud y te responderemos en 2 días hábiles.",
    formName: "Nombre completo",
    formEmail: "Correo electrónico",
    formWebsite: "Tu sitio web (opcional)",
    formPromotionPlan: "¿Cómo vas a promocionar GuestCam?",
    formPromotionPlaceholder: "Describe tu audiencia, canales (blog, Instagram, YouTube...) y estrategia de promoción.",
    formIban: "Cuenta bancaria (IBAN) para pagos (opcional)",
    formLocale: "Idioma de notificaciones",
    formSubmit: "Enviar solicitud",
    formSubmitting: "Enviando…",
    successTitle: "¡Solicitud recibida!",
    successBody: "Gracias por tu solicitud. La revisaremos y te responderemos en 2 días hábiles a tu correo electrónico.",
    errorGeneric: "Ocurrió un error. Por favor, inténtalo de nuevo.",
    errorName: "Introduce tu nombre.",
    errorEmail: "Introduce un correo electrónico válido.",
    errorPromotion: "Describe cómo vas a promocionar GuestCam (al menos 20 caracteres).",
    errorDuplicate: "Ya existe una solicitud con este correo electrónico.",
    required: "obligatorio",
  },
  dashboard: {
    badge: "🤝 Programa de afiliados",
    greeting: (name) => `Hola, ${name}!`,
    codeLabel: "Tu código de afiliado",
    linkLabel: "Tu enlace de afiliado",
    copyCode: "Copiar código",
    copyLink: "Copiar enlace",
    copied: "¡Copiado! ✓",
    statClicks: "Clics",
    statOrders: "Pedidos",
    statPending: "Pendiente",
    statAvailable: "Disponible",
    infoRate: "Comisión:",
    infoCookie: "Duración de cookie:",
    infoEarnings: "Ganancias totales:",
    cookieDays: (n) => `${n} días`,
    commissionsTitle: "Comisiones recientes",
    colDate: "Fecha",
    colOrder: "Pedido",
    colCommission: "Comisión",
    colStatus: "Estado",
    emptyState: "Aún no tienes comisiones. ¡Comparte tu código de afiliado!",
    contactFooter: "¿Preguntas? Escríbenos a partnerji@guestcam.si",
    pendingTitle: "Solicitud en revisión",
    pendingBody: "Estamos revisando tu solicitud. Te responderemos en 2 días hábiles.",
    suspendedTitle: "Cuenta de afiliado suspendida",
    rejectedTitle: "Solicitud rechazada",
    blockedBody: "Para más información, escríbenos a partnerji@guestcam.si.",
    notAffiliateTitle: "Aún no eres afiliado",
    notAffiliateBody: "Únete al programa de afiliados de GuestCam y gana un 20% de comisión.",
    notAffiliateCta: "Solicitar →",
  },
  status: {
    pending: "Pendiente",
    approved: "Aprobado",
    paid: "Pagado",
    cancelled: "Cancelado",
  },
};

export const affiliateTranslations: Record<AffiliateLang, AffiliateUiStrings> = {
  sl, en, de, hr, sr, es,
};

const VALID: AffiliateLang[] = ["sl", "hr", "sr", "en", "de", "es"];

/**
 * Pick the affiliate UI language for a given request.
 * 1. Explicit `?lang=` query param (validated).
 * 2. First language in the Accept-Language header that we support.
 * 3. Fallback to Slovenian.
 */
export function pickAffiliateLang(
  searchParamLang: string | undefined,
  acceptLanguage: string | null | undefined,
): AffiliateLang {
  if (searchParamLang && VALID.includes(searchParamLang as AffiliateLang)) {
    return searchParamLang as AffiliateLang;
  }
  if (acceptLanguage) {
    // Accept-Language: "sl,en;q=0.9,de;q=0.8" → ["sl","en","de"]
    const tags = acceptLanguage
      .split(",")
      .map((s) => s.trim().split(";")[0].toLowerCase().slice(0, 2))
      .filter(Boolean);
    for (const tag of tags) {
      if (VALID.includes(tag as AffiliateLang)) return tag as AffiliateLang;
    }
  }
  return "sl";
}
