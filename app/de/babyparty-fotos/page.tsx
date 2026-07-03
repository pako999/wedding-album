import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("de", "baby-shower-slike");

export default function Page() {
  return <EventTopicPage locale="de" topicKey="baby-shower-slike" />;
}
