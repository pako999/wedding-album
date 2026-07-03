import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("hr", "slike-s-poroke");

export default function Page() {
  return <EventTopicPage locale="hr" topicKey="slike-s-poroke" />;
}
