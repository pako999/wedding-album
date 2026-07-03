import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("es", "slike-z-rojstnega-dne");

export default function Page() {
  return <EventTopicPage locale="es" topicKey="slike-z-rojstnega-dne" />;
}
