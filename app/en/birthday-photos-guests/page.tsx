import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("en", "slike-z-rojstnega-dne");

export default function Page() {
  return <EventTopicPage locale="en" topicKey="slike-z-rojstnega-dne" />;
}
