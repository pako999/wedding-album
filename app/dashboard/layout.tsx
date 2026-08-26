import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HideCookiebot } from "@/components/HideCookiebot";

/**
 * Dashboard-wide auth + chrome.
 *
 * Keep auth here instead of Clerk middleware `auth.protect()`. In production
 * the middleware protection could issue Clerk's internal protect rewrite and
 * Next's root /[slug] route would then interpret that internal path as an
 * album slug, turning /dashboard into a 404. Server-side protection keeps all
 * /dashboard/* routes private without changing the requested pathname.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <>
      <HideCookiebot />
      {children}
    </>
  );
}
