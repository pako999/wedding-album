import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sl", "slike-s-poroke");

export default function Page() {
  return <EventTopicPage locale="sl" topicKey="slike-s-poroke" />;
}
