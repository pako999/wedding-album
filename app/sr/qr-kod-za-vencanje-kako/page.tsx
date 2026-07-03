import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("sr", "qr-koda-za-poroko");

export default function Page() {
  return <EventTopicPage locale="sr" topicKey="qr-koda-za-poroko" />;
}
