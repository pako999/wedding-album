import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import {

export const metadata = { robots: { index: false, follow: false } };

  requireAdminEmail,
  buildAdminCookie,
  hasValidAdminCookie,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  // Must be signed in to Clerk as an allowlisted email first
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // fallthrough
  }
  if (!userId) redirect("/sign-in?redirect_url=/admin");
  const admin = await requireAdminEmail();
  if (!admin) {
    // Not allowlisted — show 404 by routing to the not-found of /admin
    redirect("/");
  }

  // Already passed the second factor? Bounce to the admin dashboard.
  if (await hasValidAdminCookie()) {
    const { next } = await searchParams;
    redirect(next && next.startsWith("/admin") ? next : "/admin");
  }

  const { error } = await searchParams;

  async function submit(formData: FormData) {
    "use server";
    const submitted = String(formData.get("password") ?? "");
    const built = buildAdminCookie(submitted);
    if (!built) {
      redirect("/admin/login?error=1");
    }
    const jar = await cookies();
    jar.set(ADMIN_COOKIE_NAME, built.value, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: built.maxAge,
      path: "/",
    });
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F4F6FB" }}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-[#C9820A] mb-1">Platform Admin</p>
        <h1 className="font-serif text-2xl text-[#0F1729] mb-2">Geslo skrbnika</h1>
        <p className="text-sm text-gray-500 mb-5">
          Drugi faktor poleg Clerk prijave. Prijavljeni ste kot{" "}
          <span className="font-semibold text-[#0F1729]">{admin.email}</span>.
        </p>
        <form action={submit} className="space-y-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Geslo"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FFC94D] focus:ring-1 focus:ring-[#FFC94D]"
          />
          {error && (
            <p className="text-xs text-red-600">Napačno geslo.</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-[#FFC94D] text-[#0F1729] font-bold text-sm rounded-lg hover:opacity-90"
          >
            Vstopi v admin
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-5">
          Seja velja 12 ur. Po preteku se boste znova prijavili.
        </p>
      </div>
    </div>
  );
}

