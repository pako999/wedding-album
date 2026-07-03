import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("en", "porocni-album");

export default function Page() {
  return <EventTopicPage locale="en" topicKey="porocni-album" />;
}
