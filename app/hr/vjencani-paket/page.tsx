import { WeddingOfferJsonLd } from '@/components/wedding/WeddingOfferJsonLd';
import { WeddingLandingPage,weddingMetadata } from '@/components/wedding/WeddingLandingPage';
export const metadata=weddingMetadata('hr');
export default function Page() {return <><WeddingOfferJsonLd lang="hr"/><WeddingLandingPage lang="hr"/></>;}
