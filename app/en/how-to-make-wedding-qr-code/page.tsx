import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("en", "qr-koda-za-poroko");

export default function Page() {
  return <EventTopicPage locale="en" topicKey="qr-koda-za-poroko" />;
}
