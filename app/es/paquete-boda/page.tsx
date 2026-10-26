import { WeddingOfferJsonLd } from '@/components/wedding/WeddingOfferJsonLd';
import { WeddingLandingPage,weddingMetadata } from '@/components/wedding/WeddingLandingPage';
export const metadata=weddingMetadata('es');
export default function Page() {return <><WeddingOfferJsonLd lang="es"/><WeddingLandingPage lang="es"/></>;}
