import KululuPreviewPage from "./kululu-preview/page";
import { KululuPreviewFooter } from "@/components/KululuPreviewFooter";

export default function Page() {
  return (
    <div className="kululu-footer-upgrade">
      <KululuPreviewPage />
      <KululuPreviewFooter />
    </div>
  );
}
