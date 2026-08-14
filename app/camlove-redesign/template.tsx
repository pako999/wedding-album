import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`@import url('/camlove-photo-overrides.css'); @import url('/camlove-hero-photos.css');`}</style>
      {children}
    </>
  );
}
