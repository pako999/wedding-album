import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("hr", "porocni-album");

export default function Page() {
  return <EventTopicPage locale="hr" topicKey="porocni-album" />;
}
