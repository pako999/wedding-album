import { WeddingOfferJsonLd } from '@/components/wedding/WeddingOfferJsonLd';
import { WeddingLandingPage,weddingMetadata } from '@/components/wedding/WeddingLandingPage';
export const metadata=weddingMetadata('sl');
export default function Page() {return <><WeddingOfferJsonLd lang="sl"/><WeddingLandingPage lang="sl"/></>;}
