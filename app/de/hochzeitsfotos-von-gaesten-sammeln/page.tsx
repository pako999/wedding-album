import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("de", "zbiranje-slik-s-poroke");

export default function Page() {
  return <EventTopicPage locale="de" topicKey="zbiranje-slik-s-poroke" />;
}
