"use client";

import { useEffect } from "react";

/**
 * Keeps the marketing-page source changes isolated while we review the
 * section redesign: after hydration, move #print-service to the intentional
 * "Print Templates" slot immediately before #how. The section stays fully
 * server-rendered and indexable; this only changes its visual order.
 */
export function PrintSectionMover() {
  useEffect(() => {
    const section = document.getElementById("print-service");
    const how = document.getElementById("how");
    if (!section || !how || section.nextElementSibling === how) return;
    how.parentElement?.insertBefore(section, how);
  }, []);

  return null;
}
