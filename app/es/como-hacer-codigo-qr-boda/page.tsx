import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("es", "qr-koda-za-poroko");

export default function Page() {
  return <EventTopicPage locale="es" topicKey="qr-koda-za-poroko" />;
}
