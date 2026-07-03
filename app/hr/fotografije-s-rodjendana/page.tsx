import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("hr", "slike-z-rojstnega-dne");

export default function Page() {
  return <EventTopicPage locale="hr" topicKey="slike-z-rojstnega-dne" />;
}
