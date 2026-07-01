import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sl", "porocni-album");

export default function Page() {
  return <EventTopicPage locale="sl" topicKey="porocni-album" />;
}
