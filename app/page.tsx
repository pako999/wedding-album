import type { Metadata } from "next";
import { SITE_URL } from "@/lib/urls";
import { GuestcamHomePage, HOME_FAQS } from "@/components/GuestcamHomePage";
import { PromoVideo } from "@/components/PromoVideo";
import { MoveAfterHero } from "@/components/MoveAfterHero";

export const metadata: Metadata = {
  title: "QR koda za poroko • Fotografije gostov v enem albumu | Guestcam",
  description: "Z Guestcam QR kodo zberite fotografije in videe gostov v zasebni galeriji. Brez aplikacije in registracije, v originalni kakovosti. Za poroke in dogodke.",
  alternates: {
    canonical: SITE_URL,
    languages: {
      sl: `${SITE_URL}/`, hr: `${SITE_URL}/hr`, sr: `${SITE_URL}/sr`, de: `${SITE_URL}/de`, en: `${SITE_URL}/en`, es: `${SITE_URL}/es`, "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website", url: SITE_URL, siteName: "Guestcam", locale: "sl_SI",
    title: "QR koda za poroko • Fotografije gostov | Guestcam",
    description: "Vse fotografije in videi gostov v eni zasebni galeriji. Gostje skenirajo QR kodo — brez aplikacije in brez registracije.",
    images: [{ url: "/og-image.png?v=2", width: 910, height: 1200, alt: "Guestcam — QR koda za fotografije gostov na poroki in dogodkih" }],
  },
  twitter: { card: "summary_large_image", title: "QR koda za poroko • Fotografije gostov | Guestcam", description: "Z eno QR kodo zberite fotografije in videe gostov v zasebni galeriji.", images: ["/og-image.png?v=2"] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Guestcam", url: SITE_URL, logo: `${SITE_URL}/icon-512.png` },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Guestcam", url: SITE_URL, inLanguage: "sl-SI", publisher: { "@id": `${SITE_URL}/#organization` } },
    {
      "@type": "SoftwareApplication", "@id": `${SITE_URL}/#app`, name: "Guestcam", applicationCategory: "PhotographyApplication", operatingSystem: "Web", url: SITE_URL,
      description: "Spletna platforma za zbiranje fotografij in videov gostov prek QR kode v zasebni galeriji, brez aplikacije in brez registracije gostov.",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Basic", price: "39", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Plus", price: "49", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Premium", price: "99", priceCurrency: "EUR" },
      ],
    },
    {
      "@type": "HowTo", name: "Kako zbrati fotografije gostov z Guestcam QR kodo", totalTime: "PT2M",
      description: "Ustvarite Guestcam galerijo, postavite QR kodo in gostje začnejo nalagati fotografije ter videe.",
      step: [
        { "@type": "HowToStep", position: 1, name: "Ustvarite dogodek", text: "Ustvarite zasebno Guestcam galerijo in prejmite svojo QR kodo." },
        { "@type": "HowToStep", position: 2, name: "Postavite QR kodo", text: "QR kodo postavite na mize, vhod, vabila ali zaslon na dogodku." },
        { "@type": "HowToStep", position: 3, name: "Gostje nalagajo", text: "Gostje skenirajo QR kodo in brez aplikacije naložijo fotografije ter videe." },
      ],
    },
    { "@type": "FAQPage", mainEntity: HOME_FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><GuestcamHomePage /><MoveAfterHero><PromoVideo /></MoveAfterHero></>;
}
