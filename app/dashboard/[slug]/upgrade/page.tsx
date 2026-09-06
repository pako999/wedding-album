import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpgradePage } from "@/components/dashboard/UpgradePage";
import { type Lang } from "@/lib/i18n/translations";
import {
  checkoutLangFromHostname,
  checkoutLangFromPath,
  checkoutLangFromReferer,
  normalizeCheckoutLang,
} from "@/lib/i18n/checkout-locale";
import { validateDiscount } from "@/lib/discount";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; plan?: string; discount?: string }>;
}

export default async function UpgradePageRoute({ params, searchParams }: Props) {
  const [{ slug }, sp, h] = await Promise.all([params, searchParams, headers()]);

  // Country domains are authoritative. On guestcam.si, preserve an explicit
  // language choice (or the localized page that sent the visitor here).
  const countryLang =
    checkoutLangFromHostname(h.get("x-forwarded-host")) ??
    checkoutLangFromHostname(h.get("host"));
  const requestLang =
    countryLang ??
    normalizeCheckoutLang(sp.lang) ??
    checkoutLangFromPath(h.get("x-pathname")) ??
    checkoutLangFromReferer(h.get("referer"));

  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {/* ignore */}
  if (!userId) {
    const returnParams = new URLSearchParams();
    if (sp.plan) returnParams.set("plan", sp.plan);
    if (sp.discount) returnParams.set("discount", sp.discount);
    returnParams.set("lang", requestLang ?? "sl");
    const returnTo = `/dashboard/${encodeURIComponent(slug)}/upgrade?${returnParams.toString()}`;
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
  }

  const [albumResult, clerkUser] = await Promise.all([
    db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null),
    currentUser().catch(() => null),
  ]);
  const album: typeof albums.$inferSelect | null = albumResult ?? null;

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  const clerkLang = normalizeCheckoutLang(
    (clerkUser?.publicMetadata as Record<string, unknown> | undefined)?.lang,
  );
  const lang: Lang =
    requestLang ??
    normalizeCheckoutLang(album.defaultLang) ??
    clerkLang ??
    "sl";

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
