import { WeddingOfferJsonLd } from '@/components/wedding/WeddingOfferJsonLd';
import { WeddingLandingPage,weddingMetadata } from '@/components/wedding/WeddingLandingPage';
export const metadata=weddingMetadata('en');
export default function Page() {return <><WeddingOfferJsonLd lang="en"/><WeddingLandingPage lang="en"/></>;}
