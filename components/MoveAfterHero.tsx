"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Lets a server-rendered section be mounted from the route while visually
 * placing it immediately after the homepage hero. This keeps the large
 * homepage component untouched and makes the preview change easy to remove.
 */
export function MoveAfterHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    const hero = document.querySelector("main > section");
    if (!node || !hero?.parentNode) {
      setReady(true);
      return;
    }

    hero.parentNode.insertBefore(node, hero.nextSibling);
    setReady(true);
  }, []);

  return (
    <div ref={ref} style={{ visibility: ready ? "visible" : "hidden" }}>
      {children}
    </div>
  );
}
