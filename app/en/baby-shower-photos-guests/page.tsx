import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("en", "baby-shower-slike");

export default function Page() {
  return <EventTopicPage locale="en" topicKey="baby-shower-slike" />;
}
