"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { RunMigrationsButton } from "@/components/admin/RunMigrationsButton";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface Props {
  nav: NavItem[];
  adminEmail: string;
}

export function AdminShell({ nav, adminEmail, children }: Props & { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open on mobile
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="min-h-screen lg:flex" style={{ background: "#F4F6FB" }}>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <Link href="/admin" className="flex items-center">
          <GuestcamLogo variant="onLight" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <span className="block w-5 space-y-1">
            <span className="block h-0.5 bg-[#0F1729]" />
            <span className="block h-0.5 bg-[#0F1729]" />
            <span className="block h-0.5 bg-[#0F1729]" />
          </span>
        </button>
      </div>

      {/* Backdrop (mobile only when open) */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <aside
        className={[
          "fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link href="/admin" className="block">
            <GuestcamLogo variant="onLight" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <p className="px-5 pt-3 text-[10px] uppercase tracking-widest font-semibold text-[#C9820A]">
          Platform Admin
        </p>

        <nav className="flex-1 p-3 mt-2 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#FFF9EC] hover:text-[#0F1729] transition-colors"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-2">
          <RunMigrationsButton />
          <Link
            href="/dashboard"
            className="block text-xs text-gray-400 hover:text-[#0F1729] transition-colors px-3"
          >
            ← Nazaj na nadzorno ploščo
          </Link>
          <p className="text-[10px] text-gray-400 px-3 truncate">{adminEmail}</p>
          <SignOutButton>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#0F1729] bg-white border border-gray-200 rounded-lg hover:bg-[#FFF9EC] hover:border-[#FFC94D] transition-colors">
              Odjava
            </button>
          </SignOutButton>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
