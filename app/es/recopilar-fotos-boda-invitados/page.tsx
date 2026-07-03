import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("es", "zbiranje-slik-s-poroke");

export default function Page() {
  return <EventTopicPage locale="es" topicKey="zbiranje-slik-s-poroke" />;
}
