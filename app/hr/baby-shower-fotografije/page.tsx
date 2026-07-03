import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("hr", "baby-shower-slike");

export default function Page() {
  return <EventTopicPage locale="hr" topicKey="baby-shower-slike" />;
}
