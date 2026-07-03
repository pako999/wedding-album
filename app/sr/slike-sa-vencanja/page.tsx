import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sr", "slike-s-poroke");

export default function Page() {
  return <EventTopicPage locale="sr" topicKey="slike-s-poroke" />;
}
