import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("de", "slike-z-rojstnega-dne");

export default function Page() {
  return <EventTopicPage locale="de" topicKey="slike-z-rojstnega-dne" />;
}
