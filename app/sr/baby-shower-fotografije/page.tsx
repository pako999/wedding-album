import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sr", "baby-shower-slike");

export default function Page() {
  return <EventTopicPage locale="sr" topicKey="baby-shower-slike" />;
}
