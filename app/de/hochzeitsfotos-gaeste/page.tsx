import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("de", "slike-s-poroke");

export default function Page() {
  return <EventTopicPage locale="de" topicKey="slike-s-poroke" />;
}
