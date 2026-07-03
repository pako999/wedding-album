import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sr", "porocni-album");

export default function Page() {
  return <EventTopicPage locale="sr" topicKey="porocni-album" />;
}
