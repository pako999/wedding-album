import type { Lang } from '@/lib/i18n/translations';
import { weddingOffer } from '@/lib/wedding-offer';
import { weddingStructuredOffer } from '@/lib/wedding-offer-presentation';

export async function WeddingOfferJsonLd({ lang }: { lang: Lang }) {
  const quote = await weddingOffer.quote();
  const offer = weddingStructuredOffer(lang, quote);
  const data = { '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name: offer.name, applicationCategory: 'PhotographyApplication', operatingSystem: 'Web', offers: offer,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
