import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("de", "porocni-album");

export default function Page() {
  return <EventTopicPage locale="de" topicKey="porocni-album" />;
}
