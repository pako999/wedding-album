"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function DashboardNav() {
  return (
    <nav className="bg-white border-b sticky top-0 z-40" style={{ borderColor: "rgba(255,201,77,0.15)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-1 shrink-0">
            <svg className="w-4 h-4" style={{ color: "#C9820A" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
            </svg>
            <span className="font-serif italic text-lg font-semibold text-[#0F1729] ml-1">Guestcam</span>
            <span className="font-black text-xl leading-none" style={{ color: "#C9820A", marginTop: 2 }}>.</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            <Link href="/dashboard" className="rounded-lg px-3 py-2 text-xs font-semibold text-[color:var(--muted)] hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]">
              Galerije
            </Link>
            <Link href="/dashboard/local" className="rounded-lg px-3 py-2 text-xs font-semibold text-[color:var(--muted)] hover:bg-[#FFF8E6] hover:text-[color:var(--honey)]">
              ☕ Local Rewards
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/local" className="sm:hidden rounded-lg px-2.5 py-2 text-xs font-semibold text-[color:var(--honey)]" aria-label="Local Rewards">
            ☕
          </Link>
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
