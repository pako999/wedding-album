import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("en", "zbiranje-slik-s-poroke");

export default function Page() {
  return <EventTopicPage locale="en" topicKey="zbiranje-slik-s-poroke" />;
}
