"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function DashboardNav() {
  return (
    <nav className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "rgba(196,115,138,0.15)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-1">
          <svg className="w-4 h-4" style={{ color: "#C4738A" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
          </svg>
          <span className="font-serif italic text-lg font-semibold text-[#2C2825] ml-1">Guestcam</span>
          <span className="font-black text-xl leading-none" style={{ color: "#C4738A", marginTop: 2 }}>.</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl"
            style={{ background: "#C4738A" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nova galerija
          </Link>
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
