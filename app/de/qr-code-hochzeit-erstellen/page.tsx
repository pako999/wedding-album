import { EventTopicPage, eventTopicMetadata } from "@/components/seo/EventTopicPage";

export const metadata = eventTopicMetadata("de", "qr-koda-za-poroko");

export default function Page() {
  return <EventTopicPage locale="de" topicKey="qr-koda-za-poroko" />;
}
