import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sl", "zbiranje-slik-s-poroke");

export default function Page() {
  return <EventTopicPage locale="sl" topicKey="zbiranje-slik-s-poroke" />;
}
