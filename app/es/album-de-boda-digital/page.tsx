import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("es", "porocni-album");

export default function Page() {
  return <EventTopicPage locale="es" topicKey="porocni-album" />;
}
