import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sl", "slike-z-rojstnega-dne");

export default function Page() {
  return <EventTopicPage locale="sl" topicKey="slike-z-rojstnega-dne" />;
}
