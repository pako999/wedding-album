import type { ReactNode } from "react";
import { IosBunnyPlaybackFix } from "@/components/album/IosBunnyPlaybackFix";

export default function AlbumGuestLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <IosBunnyPlaybackFix />
    </>
  );
}
