import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { requireAdmin } from "@/lib/admin";
import { GuestcamLogo } from "@/components/GuestcamLogo";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin",            label: "Pregled",       icon: "📊" },
  { href: "/admin/albums",     label: "Galerije",      icon: "🖼️" },
  { href: "/admin/users",      label: "Uporabniki",    icon: "👥" },
  { href: "/admin/discounts",  label: "Kode za popust", icon: "🏷️" },
  { href: "/admin/payments",   label: "Plačila",       icon: "💳" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth — bounce anonymous users to sign-in, everyone else either passes
  // or gets a 404 (deliberately not a 403, so the admin surface is not
  // discoverable to random Clerk users).
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // fall through to redirect
  }
  if (!userId) redirect("/sign-in?redirect_url=/admin");

  const admin = await requireAdmin();
  if (!admin) notFound();

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F6FB" }}>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link href="/admin" className="block">
            <GuestcamLogo variant="onLight" />
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-widest font-semibold text-[#C9820A]">
            Platform Admin
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
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
          <Link
            href="/dashboard"
            className="block text-xs text-gray-400 hover:text-[#0F1729] transition-colors px-3"
          >
            ← Nazaj na nadzorno ploščo
          </Link>
          <p className="text-[10px] text-gray-400 px-3 truncate">{admin.email}</p>
          <SignOutButton>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#0F1729] bg-white border border-gray-200 rounded-lg hover:bg-[#FFF9EC] hover:border-[#FFC94D] transition-colors">
              Odjava
            </button>
          </SignOutButton>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
