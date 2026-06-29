import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin, requireAdminEmail, hasValidAdminCookie } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin",            label: "Pregled",       icon: "📊" },
  { href: "/admin/albums",     label: "Galerije",      icon: "🖼️" },
  { href: "/admin/users",      label: "Uporabniki",    icon: "👥" },
  { href: "/admin/discounts",  label: "Kode za popust", icon: "🏷️" },
  { href: "/admin/payments",     label: "Plačila",           icon: "💳" },
  { href: "/admin/bank-orders",  label: "Predračuni",         icon: "🏦" },
  { href: "/admin/affiliates",   label: "Partnerji",          icon: "🤝" },
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

  // /admin/login is its own page (renders the password form); skip the
  // password check there to avoid a redirect loop. The middleware
  // forwards the request path as x-pathname (header name varies across
  // Next.js versions — check several to be robust).
  const h = await headers();
  const path =
    h.get("x-pathname") ??
    h.get("x-invoke-path") ??
    h.get("next-url") ??
    "";
  const onLoginPage = path.startsWith("/admin/login");

  if (onLoginPage) {
    // Clerk email gate still applies — non-admins shouldn't even see
    // the password prompt.
    const allowed = await requireAdminEmail();
    if (!allowed) notFound();
    return <>{children}</>;
  }

  // Full check: email allowlist AND signed password cookie.
  const admin = await requireAdmin();
  if (!admin) {
    // Email is allowed but no/expired password cookie? Send to the
    // password form. Anyone else → 404 (don't leak admin existence).
    const emailOnly = await requireAdminEmail();
    if (emailOnly && !(await hasValidAdminCookie())) {
      redirect("/admin/login");
    }
    notFound();
  }

  return (
    <AdminShell nav={NAV} adminEmail={admin.email}>
      {children}
    </AdminShell>
  );
}
