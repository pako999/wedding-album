import { WeddingOfferJsonLd } from '@/components/wedding/WeddingOfferJsonLd';
import { WeddingLandingPage,weddingMetadata } from '@/components/wedding/WeddingLandingPage';
export const metadata=weddingMetadata('sr');
export default function Page() {return <><WeddingOfferJsonLd lang="sr"/><WeddingLandingPage lang="sr"/></>;}
