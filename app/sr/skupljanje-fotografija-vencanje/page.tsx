import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sr", "zbiranje-slik-s-poroke");

export default function Page() {
  return <EventTopicPage locale="sr" topicKey="zbiranje-slik-s-poroke" />;
}
