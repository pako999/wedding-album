import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sr", "slike-z-rojstnega-dne");

export default function Page() {
  return <EventTopicPage locale="sr" topicKey="slike-z-rojstnega-dne" />;
}
