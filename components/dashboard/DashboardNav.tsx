"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function DashboardNav() {
  return (
    <nav className="bg-white border-b border-[#C9A96E]/20 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* Heart icon */}
          <svg className="w-4 h-4 text-[#C9A96E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
          </svg>
          <span className="font-serif italic text-lg font-semibold text-[#2C2825]">Album</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://wedflow.app/dashboard"
            className="font-sans text-xs text-[#2C2825]/60 hover:text-[#2C2825] transition-colors hidden sm:block"
          >
            ← WedFlow
          </a>
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
