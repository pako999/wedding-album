import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("hr", "zbiranje-slik-s-poroke");

export default function Page() {
  return <EventTopicPage locale="hr" topicKey="zbiranje-slik-s-poroke" />;
}
