import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sl", "qr-koda-za-poroko");

export default function Page() {
  return <EventTopicPage locale="sl" topicKey="qr-koda-za-poroko" />;
}
