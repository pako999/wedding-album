import type { ReactNode } from "react";
import { IosBunnyPlaybackFix } from "@/components/album/IosBunnyPlaybackFix";
import { LocalRewardBridge } from "@/components/local/LocalRewardBridge";

export default function AlbumGuestLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <IosBunnyPlaybackFix />
      <LocalRewardBridge />
    </>
  );
}
