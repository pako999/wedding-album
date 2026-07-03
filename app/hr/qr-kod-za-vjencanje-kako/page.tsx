import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("hr", "qr-koda-za-poroko");

export default function Page() {
  return <EventTopicPage locale="hr" topicKey="qr-koda-za-poroko" />;
}
