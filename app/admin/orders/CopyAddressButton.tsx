"use client";

import { useState } from "react";

/** Copies the delivery address in one go — retyping an address into a
 *  courier form is where wrong parcels come from. */
export function CopyAddressButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  if (!text.trim()) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard blocked — the address is on screen anyway */ }
      }}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:border-gray-300"
    >
      {copied ? "Kopirano ✓" : "Kopiraj naslov"}
    </button>
  );
}
