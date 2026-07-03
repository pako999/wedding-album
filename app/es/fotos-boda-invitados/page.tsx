import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("es", "slike-s-poroke");

export default function Page() {
  return <EventTopicPage locale="es" topicKey="slike-s-poroke" />;
}
