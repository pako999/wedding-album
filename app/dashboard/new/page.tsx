import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CreateEventWizard } from "@/components/dashboard/CreateEventWizard";
import { albumOwnerWhere, getAlbumCreationGate } from "@/lib/album-limits";
import { type Lang } from "@/lib/i18n/translations";
import { GALLERY_LIMIT_COPY } from "@/lib/i18n/gallery-limit-translations";
import {
  checkoutLangFromHostname,
  checkoutLangFromPath,
  checkoutLangFromReferer,
  normalizeCheckoutLang,
} from "@/lib/i18n/checkout-locale";
import { verifiedEmails } from "@/lib/album-ownership";

export const dynamic = "force-dynamic";

export default async function NewAlbumPage({ searchParams }: { searchParams: Promise<{ plan?: string; lang?: string }> }) {
  const [sp, h] = await Promise.all([searchParams, headers()]);
  const initialPlan =
    sp.plan === "basic" || sp.plan === "plus" || sp.plan === "premium"
      ? sp.plan
      : undefined;
  const requestLang =
    checkoutLangFromHostname(h.get("x-forwarded-host")) ??
    checkoutLangFromHostname(h.get("host")) ??
    normalizeCheckoutLang(sp.lang) ??
    checkoutLangFromPath(h.get("x-pathname")) ??
    checkoutLangFromReferer(h.get("referer"));

  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // Clerk not configured or session error — redirect to sign-in
  }
  if (!userId) {
    const returnParams = new URLSearchParams();
    if (initialPlan) returnParams.set("plan", initialPlan);
    returnParams.set("lang", requestLang ?? "sl");
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/dashboard/new?${returnParams.toString()}`)}`);
  }
  const clerkUser = await currentUser().catch(() => null);

  // Same lang-detection precedence as /dashboard/[slug]/upgrade — this
  // screen links straight into that page, so it needs to land in the same
  // language the visitor was already browsing in.
  //   1. ?lang= search param (explicit override)
  //   2. First segment of the pathname or referrer (locale they were
  //      already browsing in)
  //   3. Clerk publicMetadata.lang (locale they picked at signup)
  //   4. "sl" default (primary market)
  const clerkLang = normalizeCheckoutLang(
    (clerkUser?.publicMetadata as Record<string, unknown> | undefined)?.lang,
  );
  const lang: Lang =
    requestLang ??
    clerkLang ??
    "sl";
  const t = GALLERY_LIMIT_COPY[lang];

  const ownerVerifiedEmails = verifiedEmails(clerkUser);
  const existing = await db.query.albums.findFirst({
    where: albumOwnerWhere(userId, ownerVerifiedEmails),
    orderBy: [desc(albums.createdAt)],
  });

  // Each package belongs to one event. If the account currently has an
  // active Free event and the visitor clicked a paid pricing card, upgrade
  // THAT event. If all existing events are already paid, do not reuse their
  // entitlement — show the wizard and create a new event that will purchase
  // its own selected package.
  const gate = await getAlbumCreationGate(userId, ownerVerifiedEmails);
  if (initialPlan && !gate.allowed) {
    redirect(`/dashboard/${gate.mostRecentSlug}/upgrade?plan=${initialPlan}&lang=${lang}`);
  }

  // A brand-new user has no galleries yet — /dashboard would just bounce
  // straight back here (it redirects to /dashboard/new when the list is
  // empty), so the "back" link would loop. Only show it once they have a
  // real gallery to return to.
  const hasGalleries = !!existing;

  // Free includes one active event. Once that event is upgraded, another
  // event may be created; it starts on Free and gets its own package.
  if (!gate.allowed) {
    return (
      <div className="min-h-screen" style={{ background: "#F4F6FB" }}>
        <DashboardNav />

        <main className="max-w-xl mx-auto px-4 sm:px-6 py-14">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0F1729] transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.back}
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(255,201,77,0.12)" }}>
              <svg className="w-7 h-7" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="gc-admin-page-title text-[#0F1729] mb-2">{t.title}</h1>
            <p className="text-sm text-[#0F1729]/50 max-w-sm mx-auto mb-8">{t.body}</p>
            <Link
              href={`/dashboard/${gate.mostRecentSlug}/upgrade?lang=${lang}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-[#0F1729] transition-all duration-200 hover:brightness-95"
              style={{ background: "#FFC94D" }}
            >
              {t.cta}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F6FB" }}>
      <DashboardNav />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-14">

        {/* Back to the user's dashboard — only when they actually have a
            gallery to return to (an empty dashboard redirects back here,
            which made this link appear broken for first-time users). */}
        {hasGalleries && (
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0F1729] transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Nazaj na nadzorno ploščo
          </Link>
        )}

        {/* Multi-step wizard */}
        <CreateEventWizard initialPlan={initialPlan} lang={lang} />

        <p className="text-center text-xs text-gray-400 mt-6">
          Po ustvarjanju boste dobili edinstveno QR kodo za vaše goste.
        </p>
      </main>
    </div>
  );
}
