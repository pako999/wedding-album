"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function DashboardNav() {
  return (
    <nav className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "rgba(255,201,77,0.15)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-1">
          <svg className="w-4 h-4" style={{ color: "#C9820A" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
          </svg>
          <span className="font-serif italic text-lg font-semibold text-[#0F1729] ml-1">Guestcam</span>
          <span className="font-black text-xl leading-none" style={{ color: "#C9820A", marginTop: 2 }}>.</span>
        </Link>

        <div className="flex items-center gap-3">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
