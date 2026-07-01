import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sl", "baby-shower-slike");

export default function Page() {
  return <EventTopicPage locale="sl" topicKey="baby-shower-slike" />;
}
