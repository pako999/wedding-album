import { WeddingOfferJsonLd } from '@/components/wedding/WeddingOfferJsonLd';
import { WeddingLandingPage,weddingMetadata } from '@/components/wedding/WeddingLandingPage';
export const metadata=weddingMetadata('de');
export default function Page() {return <><WeddingOfferJsonLd lang="de"/><WeddingLandingPage lang="de"/></>;}
