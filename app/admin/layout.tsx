import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin, requireAdminEmail, hasValidAdminCookie } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { runMigrations } from "@/lib/db/migrations";

export const dynamic = "force-dynamic";

/**
 * Cold-start bootstrap. First admin request per Vercel instance calls
 * runMigrations() — idempotent, uses IF NOT EXISTS / IF EXISTS
 * everywhere, so re-running is cheap. We cache the promise so subsequent
 * admin requests skip the DB round-trip.
 *
 * This exists because Drizzle's SELECT now includes columns added in
 * later migrations (referral_code, etc.). If a Neon instance hasn't been
 * migrated yet, EVERY page that touches `albums` throws — including the
 * admin layout itself, so the "🔧 Popravi bazo" button becomes
 * unreachable. Running here makes the button redundant on cold start.
 */
let bootstrapPromise: Promise<void> | null = null;
async function ensureMigrations(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runMigrations().catch((err) => {
      console.error("[admin bootstrap] migrations failed:", err);
      // Reset so the next request retries.
      bootstrapPromise = null;
    });
  }
  return bootstrapPromise;
}

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
  // Bootstrap on the first admin hit per instance so a stale schema
  // doesn't crash the layout itself and lock the operator out.
  await ensureMigrations();

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
