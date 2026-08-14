import type { Metadata } from "next";
import { CamLoveHomePage, HOME_FAQS } from "@/components/CamLoveHomePage";
import { SITE_URL } from "@/lib/urls";
import { ogImage, OG_IMAGE_URL } from "@/lib/og";
import { buildFaqSchema, buildHowToSchema } from "@/lib/seo/jsonld";

const title = "CamLove | QR foto album za dogodke in fotografije gostov";
const description = "Zberite fotografije in videe gostov z eno QR kodo v zasebni CamLove galeriji. Brez aplikacije, polna kakovost, Live Photo Wall in brezplačen začetek.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: SITE_URL,
    languages: {
      sl: SITE_URL,
      hr: `${SITE_URL}/hr`,
      sr: `${SITE_URL}/sr`,
      de: `${SITE_URL}/de`,
      en: `${SITE_URL}/en`,
      es: `${SITE_URL}/es`,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    siteName: "CamLove",
    locale: "sl_SI",
    url: SITE_URL,
    title,
    description,
    images: [ogImage("CamLove — vse fotografije gostov v enem QR albumu")],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE_URL],
  },
  robots: { index: true, follow: true },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "CamLove",
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      email: "info@camlove.me",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Osojnikova 4a",
        postalCode: "2000",
        addressLocality: "Maribor",
        addressCountry: "SI",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "CamLove",
      description,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["sl-SI", "hr-HR", "sr-RS", "de-DE", "en", "es"],
    },
  ],
};

const faqSchema = buildFaqSchema(HOME_FAQS.map(({ q, a }) => ({ q, a })));
const howToSchema = buildHowToSchema({
  name: "Kako zbrati fotografije gostov s CamLove",
  description: "Ustvarite CamLove dogodek, postavite QR kodo in gostje začnejo nalagati fotografije ter videe v skupno zasebno galerijo.",
  totalTimeIso: "PT2M",
  steps: [
    { name: "Ustvarite dogodek", text: "Ustvarite zasebno CamLove galerijo in dobite unikatno QR kodo." },
    { name: "Postavite QR kodo", text: "QR kodo dodajte na mize, vhod, vabila ali zaslon na dogodku." },
    { name: "Gostje nalagajo", text: "Gostje skenirajo QR kodo in brez aplikacije naložijo fotografije ter videe." },
  ],
});

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <CamLoveHomePage />
    </>
  );
}
