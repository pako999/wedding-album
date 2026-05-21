import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { LangCode } from "@/components/LanguageSwitcher";

export type LegalKind = "privacy" | "terms" | "gdpr" | "cookies";
export type LegalLang = LangCode;

// ─── Localized strings ──────────────────────────────────────────────────────
// For non-Slovenian visitors we currently render English content for
// every legal page. English is broadly understood in HR/DE/ES/SR
// markets and is materially better than the previous behaviour (a
// German-language footer linking to a Slovenian-only document).
// Native translations can replace this block as we get them reviewed.

interface LegalCopy {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  lastUpdated: string;
  intro: string;
  /** A note shown at the top if the visitor is on a non-master locale */
  fallbackNotice: string | null;
}

function copyFor(kind: LegalKind, lang: LegalLang): LegalCopy {
  const titles: Record<LegalKind, Record<LegalLang, string>> = {
    privacy: {
      sl: "Politika zasebnosti",
      hr: "Politika privatnosti",
      sr: "Politika privatnosti",
      en: "Privacy Policy",
      de: "Datenschutzerklärung",
      es: "Política de privacidad",
    },
    terms: {
      sl: "Pogoji uporabe",
      hr: "Uvjeti korištenja",
      sr: "Uslovi korišćenja",
      en: "Terms of Service",
      de: "Nutzungsbedingungen",
      es: "Términos de uso",
    },
    gdpr: {
      sl: "Pravice po GDPR",
      hr: "Prava prema GDPR-u",
      sr: "Prava prema GDPR-u",
      en: "Your GDPR Rights",
      de: "Ihre Rechte nach DSGVO",
      es: "Tus derechos según el RGPD",
    },
    cookies: {
      sl: "Politika piškotkov",
      hr: "Politika kolačića",
      sr: "Politika kolačića",
      en: "Cookie Policy",
      de: "Cookie-Richtlinie",
      es: "Política de cookies",
    },
  };

  const lastUpdatedLabel: Record<LegalLang, string> = {
    sl: "Zadnja posodobitev:",
    hr: "Zadnje ažurirano:",
    sr: "Poslednje ažurirano:",
    en: "Last updated:",
    de: "Zuletzt aktualisiert:",
    es: "Última actualización:",
  };

  const fallbackNotice: Record<LegalLang, string | null> = {
    sl: null,
    hr: "Ova stranica je dostupna na engleskom jeziku. Slovenska verzija je dostupna na",
    sr: "Ova stranica je dostupna na engleskom jeziku. Slovenačka verzija je dostupna na",
    de: "Diese Seite ist derzeit in englischer Sprache. Die slowenische Originalversion finden Sie unter",
    es: "Esta página está disponible en inglés. La versión eslovena está disponible en",
    en: null,
  };

  return {
    metaTitle: `${titles[kind][lang]} | Guestcam`,
    metaDescription: titles[kind][lang],
    heading: titles[kind][lang],
    lastUpdated: `${lastUpdatedLabel[lang]} 21. 05. 2026`,
    intro: "",
    fallbackNotice: fallbackNotice[lang],
  };
}

// ─── English content bodies ─────────────────────────────────────────────────
// Used for every non-SL language. SL keeps its richer native pages.

function PrivacyBody() {
  return (
    <>
      <Section title="1. Who we are">
        <p>
          Guestcam is operated by the founders behind <strong>guestcam.si</strong>.
          We are based in the European Union and act as the data controller for
          all personal data processed when you use the Guestcam service.
        </p>
        <p>Contact for any privacy question: <a href="mailto:hello@guestcam.si" className="text-[#C9820A] underline">hello@guestcam.si</a></p>
      </Section>

      <Section title="2. What data we collect">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account data</strong> — email and name when you sign up.</li>
          <li><strong>Album data</strong> — names, dates, locations, photos and videos that you or your guests upload.</li>
          <li><strong>Payment data</strong> — handled by Stripe; we never see card numbers.</li>
          <li><strong>Technical data</strong> — IP address, browser, device, basic usage analytics.</li>
        </ul>
      </Section>

      <Section title="3. How we use it">
        <p>We use your data exclusively to provide the service: hosting your gallery, delivering uploads, processing payments, and sending essential transactional emails (welcome, receipts, security alerts).</p>
        <p>We do <strong>not</strong> sell your data, ever. We do not use guest photos to train AI models.</p>
      </Section>

      <Section title="4. How long we keep it">
        <p>Photos are kept for the duration of your plan (30 days for free, 90 days / 1 year for paid plans). After expiry they are permanently deleted. Account data is kept while your account is active.</p>
      </Section>

      <Section title="5. Your rights">
        <p>Under GDPR you can request access to, correction of, deletion of, or export of your personal data at any time by emailing <a href="mailto:hello@guestcam.si" className="text-[#C9820A] underline">hello@guestcam.si</a>. See our <a href="/gdpr" className="text-[#C9820A] underline">GDPR page</a> for details.</p>
      </Section>

      <Section title="6. Third parties">
        <p>We use the following processors, each bound by a Data Processing Agreement: Clerk (authentication), Neon (database, EU region), Bunny.net (image CDN), Stripe (payments), Resend (transactional email), Vercel (hosting).</p>
      </Section>

      <Section title="7. Cookies">
        <p>We use only strictly-necessary cookies for sign-in sessions. No tracking or advertising cookies. See our <a href="/cookies" className="text-[#C9820A] underline">cookie policy</a>.</p>
      </Section>
    </>
  );
}

function TermsBody() {
  return (
    <>
      <Section title="1. Agreement">
        <p>By creating an account or uploading photos to a Guestcam gallery, you agree to these terms. If you do not agree, please do not use the service.</p>
      </Section>

      <Section title="2. The service">
        <p>Guestcam provides QR-code-based galleries that let event guests upload photos and videos to a private collection owned by the event organiser. The service is offered on free and paid plans described on the pricing page.</p>
      </Section>

      <Section title="3. Acceptable use">
        <ul className="list-disc pl-6 space-y-2">
          <li>Do not upload illegal content, hate speech, or material that infringes third-party copyright or privacy.</li>
          <li>Do not attempt to bypass plan limits, security, or rate limits.</li>
          <li>Do not use the service to spam, phish, or distribute malware.</li>
        </ul>
        <p>We may suspend or delete accounts that violate this section without notice.</p>
      </Section>

      <Section title="4. Payments">
        <p>Paid plans are charged as a one-time fee in EUR via Stripe. Charges are non-refundable except where required by law or by our 30-day money-back guarantee (applies to first-time purchases only).</p>
      </Section>

      <Section title="5. Liability">
        <p>The service is provided “as is”. To the maximum extent permitted by law, Guestcam is not liable for indirect, incidental or consequential damages, lost profits, or lost data.</p>
      </Section>

      <Section title="6. Governing law">
        <p>These terms are governed by Slovenian law. Any dispute is subject to the exclusive jurisdiction of the courts of Ljubljana, Slovenia.</p>
      </Section>
    </>
  );
}

function GdprBody() {
  return (
    <>
      <Section title="Your rights under the GDPR">
        <p>The General Data Protection Regulation (Regulation EU 2016/679) gives every individual in the EU a set of rights regarding their personal data. Below is a short summary of how to exercise each of them with Guestcam.</p>
      </Section>
      <Section title="Right of access (Art. 15)">
        <p>You may ask us for a copy of all personal data we hold about you. We respond within 30 days.</p>
      </Section>
      <Section title="Right to rectification (Art. 16)">
        <p>If any of your personal data is inaccurate or incomplete, ask us to correct it.</p>
      </Section>
      <Section title="Right to erasure (Art. 17)">
        <p>You may ask us to delete your account and all associated data. This includes albums you own and any photos uploaded under your account.</p>
      </Section>
      <Section title="Right to restriction (Art. 18) and objection (Art. 21)">
        <p>You may restrict the processing of your data, or object to processing that is based on our legitimate interests.</p>
      </Section>
      <Section title="Right to data portability (Art. 20)">
        <p>You may request a machine-readable export of your data. We provide JSON exports on request.</p>
      </Section>
      <Section title="Right to lodge a complaint">
        <p>You can complain to your national data protection authority. In Slovenia this is the Information Commissioner (<a href="https://www.ip-rs.si" className="text-[#C9820A] underline" target="_blank" rel="noreferrer">ip-rs.si</a>).</p>
      </Section>
      <Section title="How to exercise these rights">
        <p>Email <a href="mailto:hello@guestcam.si" className="text-[#C9820A] underline">hello@guestcam.si</a> from the email address tied to your Guestcam account. We respond within 30 days and never charge a fee.</p>
      </Section>
    </>
  );
}

function CookiesBody() {
  return (
    <>
      <Section title="What cookies we use">
        <p>Guestcam uses only strictly-necessary cookies. We do not use marketing, advertising, or third-party tracking cookies.</p>
      </Section>
      <Section title="The cookies we set">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>__session</strong>, <strong>__client_uat</strong> — set by Clerk to keep you signed in. Required.</li>
          <li><strong>guestcam_consent</strong> — remembers your cookie consent choice. Optional.</li>
        </ul>
      </Section>
      <Section title="Third-party cookies">
        <p>Stripe may set cookies on its own checkout pages for fraud prevention. We do not embed Stripe cookies on guestcam.si itself.</p>
      </Section>
      <Section title="How to control cookies">
        <p>You can clear or block cookies via your browser settings. Note that disabling the session cookies will sign you out and prevent you from using the dashboard.</p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl font-bold text-[#0F1729]">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

// ─── Public component ───────────────────────────────────────────────────────

export function LegalPage({ kind, lang }: { kind: LegalKind; lang: LegalLang }) {
  const copy = copyFor(kind, lang);
  const Body =
    kind === "privacy" ? PrivacyBody :
    kind === "terms"   ? TermsBody :
    kind === "gdpr"    ? GdprBody :
                         CookiesBody;

  const slPath =
    kind === "privacy" ? "/privacy" :
    kind === "terms"   ? "/terms" :
    kind === "gdpr"    ? "/gdpr" :
                         "/cookies";

  return (
    <div className="min-h-screen bg-white text-[#0F1729]">
      <SiteHeader lang={lang} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl font-bold text-[#0F1729] mb-3">{copy.heading}</h1>
        <p className="text-xs text-gray-400 mb-10">{copy.lastUpdated}</p>

        {copy.fallbackNotice && (
          <div className="bg-[#FFF9EC] border border-[#FFC94D]/40 rounded-xl p-4 mb-10 text-sm text-gray-700">
            {copy.fallbackNotice}{" "}
            <a href={slPath} className="text-[#C9820A] font-semibold underline">{slPath}</a>.
          </div>
        )}

        <div className="space-y-10">
          <Body />
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-sm text-gray-500">
          <p>
            Questions? Email{" "}
            <a href="mailto:hello@guestcam.si" className="text-[#C9820A] underline">hello@guestcam.si</a>.
          </p>
        </div>
      </main>

      <SeoFooter lang={lang} />
    </div>
  );
}
