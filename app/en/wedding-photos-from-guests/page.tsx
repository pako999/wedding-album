import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("en", "slike-s-poroke");

export default function Page() {
  return <EventTopicPage locale="en" topicKey="slike-s-poroke" />;
}
