import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("es", "baby-shower-slike");

export default function Page() {
  return <EventTopicPage locale="es" topicKey="baby-shower-slike" />;
}
