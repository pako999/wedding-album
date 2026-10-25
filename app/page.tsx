import type { Metadata } from "next";
import { weddingCopy } from "@/lib/wedding/copy";
import { SITE_URL } from "@/lib/urls";
import { GuestcamHomePage, HOME_FAQS } from "@/components/GuestcamHomePage";
import { withRegionalHreflang } from "@/lib/seo/hreflang";
import { PREMIUM_REGULAR_PRICE_EUR } from "@/lib/plan-pricing";

export const metadata: Metadata = {
  title: "Guestcam.si | QR galerija za dogodke in fotografije gostov",
  description: "Guestcam.si je slovenska QR galerija za dogodke. Zberite fotografije in videe gostov v enem zasebnem albumu brez aplikacije in registracije. Za poroke, rojstne dneve in poslovne dogodke.",
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: withRegionalHreflang({
      sl: `${SITE_URL}/`, hr: `${SITE_URL}/hr`, sr: `${SITE_URL}/sr`, de: `${SITE_URL}/de`, en: `${SITE_URL}/en`, es: `${SITE_URL}/es`, "x-default": `${SITE_URL}/`,
    }),
  },
  openGraph: {
    type: "website", url: `${SITE_URL}/`, siteName: "Guestcam.si", locale: "sl_SI",
    title: "Guestcam.si | QR galerija za dogodke in fotografije gostov",
    description: "Fotografije in videi gostov z dogodka v eni zasebni galeriji. Gostje skenirajo QR-kodo — brez aplikacije in registracije.",
    images: [{ url: "/og-image.jpg?v=6", width: 1200, height: 630, alt: "Guestcam — QR-koda za fotografije in videe gostov na dogodkih" }],
  },
  twitter: { card: "summary_large_image", title: "Guestcam.si | QR galerija za dogodke in fotografije gostov", description: "Z eno QR-kodo zberite fotografije in videe gostov z dogodka v zasebni galeriji.", images: ["/og-image.jpg?v=6"] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Guestcam", url: SITE_URL, logo: `${SITE_URL}/icon-512.png` },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Guestcam.si", alternateName: "Guestcam", url: `${SITE_URL}/`, inLanguage: "sl-SI", publisher: { "@id": `${SITE_URL}/#organization` } },
    {
      "@type": "SoftwareApplication", "@id": `${SITE_URL}/#app`, name: "Guestcam", applicationCategory: "PhotographyApplication", operatingSystem: "Web", url: SITE_URL,
      description: "Spletna platforma za zbiranje fotografij in videov gostov z dogodkov prek QR-kode v zasebni galeriji, brez aplikacije in registracije gostov.",
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Basic", price: "39", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Plus", price: "49", priceCurrency: "EUR" },
        { "@type": "Offer", name: weddingCopy("sl").plan, price: String(PREMIUM_REGULAR_PRICE_EUR), priceCurrency: "EUR" },
      ],
    },
    {
      "@type": "HowTo", name: "Kako zbrati fotografije in videe gostov na dogodku z Guestcam QR-kodo", totalTime: "PT2M",
      description: "Ustvarite galerijo za dogodek, postavite Guestcam QR-kodo in gostje začnejo nalagati fotografije ter videe.",
      step: [
        { "@type": "HowToStep", position: 1, name: "Ustvarite dogodek", text: "Ustvarite zasebno Guestcam galerijo in prejmite svojo QR-kodo." },
        { "@type": "HowToStep", position: 2, name: "Postavite QR-kodo", text: "QR-kodo postavite na mize, vhod, vabila ali zaslon na dogodku." },
        { "@type": "HowToStep", position: 3, name: "Gostje nalagajo", text: "Gostje skenirajo QR-kodo in brez aplikacije naložijo fotografije ter videe." },
      ],
    },
    { "@type": "FAQPage", mainEntity: HOME_FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
};

export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><GuestcamHomePage /></>;
}
