import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpgradePage } from "@/components/dashboard/UpgradePage";
import {
  DASHBOARD_LANG_COOKIE,
  resolveDashboardLang,
} from "@/lib/i18n/dashboard-language";
import { validateDiscount } from "@/lib/discount";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; plan?: string; discount?: string }>;
}

export default async function UpgradePageRoute({ params, searchParams }: Props) {
  const [{ slug }, sp, h, cookieStore] = await Promise.all([
    params,
    searchParams,
    headers(),
    cookies(),
  ]);
  const initialDashboardLang = resolveDashboardLang({
    requested: sp.lang,
    saved: cookieStore.get(DASHBOARD_LANG_COOKIE)?.value,
    country: h.get("x-vercel-ip-country"),
    acceptLanguage: h.get("accept-language"),
  });

  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {/* ignore */}
  if (!userId) {
    const returnParams = new URLSearchParams();
    if (sp.plan) returnParams.set("plan", sp.plan);
    if (sp.discount) returnParams.set("discount", sp.discount);
    returnParams.set("lang", initialDashboardLang);
    const returnTo = `/dashboard/${encodeURIComponent(slug)}/upgrade?${returnParams.toString()}`;
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
  }

  const [albumResult, clerkUser] = await Promise.all([
    db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null),
    currentUser().catch(() => null),
  ]);
  const album: typeof albums.$inferSelect | null = albumResult ?? null;

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  const clerkMetadata = clerkUser?.publicMetadata as Record<string, unknown> | undefined;
  const lang = resolveDashboardLang({
    requested: sp.lang,
    saved: cookieStore.get(DASHBOARD_LANG_COOKIE)?.value,
    account: clerkMetadata?.dashboardLang,
    country: h.get("x-vercel-ip-country"),
    clerk: clerkMetadata?.lang,
    acceptLanguage: h.get("accept-language"),
  });

  const initialPlan = sp.plan === "basic" || sp.plan === "premium" ? sp.plan : "plus";
  const requestedCode = sp.discount?.trim().toUpperCase();
  let initialDiscount: { code: string; percentOff: number } | null = null;
  if (requestedCode) {
    const result = await validateDiscount(requestedCode, initialPlan);
    if (result.valid) {
      initialDiscount = { code: requestedCode, percentOff: result.percentOff };
    }
  }

  return <UpgradePage album={album} lang={lang} initialDiscount={initialDiscount} />;
}
