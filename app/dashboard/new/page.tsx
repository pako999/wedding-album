import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CreateEventWizard } from "@/components/dashboard/CreateEventWizard";
import { getAlbumCreationGate } from "@/lib/album-limits";
import { type Lang } from "@/lib/i18n/translations";
import { GALLERY_LIMIT_COPY } from "@/lib/i18n/gallery-limit-translations";

export const dynamic = "force-dynamic";

export default async function NewAlbumPage({ searchParams }: { searchParams: Promise<{ plan?: string; lang?: string }> }) {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // Clerk not configured or session error — redirect to sign-in
  }
  if (!userId) redirect("/sign-in");

  const sp = await searchParams;
  const initialPlan =
    sp.plan === "basic" || sp.plan === "plus" || sp.plan === "premium"
      ? sp.plan
      : undefined;

  // Same lang-detection precedence as /dashboard/[slug]/upgrade — this
  // screen links straight into that page, so it needs to land in the same
  // language the visitor was already browsing in.
  //   1. ?lang= search param (explicit override)
  //   2. First segment of the pathname or referrer (locale they were
  //      already browsing in)
  //   3. Clerk publicMetadata.lang (locale they picked at signup)
  //   4. "sl" default (primary market)
  const h = await headers();
  const VALID_LANGS: Lang[] = ["sl", "hr", "sr", "en", "de", "es"];
  function langFromPath(pathname: string | null | undefined): Lang | null {
    if (!pathname) return null;
    const seg = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    return seg && VALID_LANGS.includes(seg as Lang) ? (seg as Lang) : null;
  }
  function langFromReferer(ref: string | null | undefined): Lang | null {
    if (!ref) return null;
    try { return langFromPath(new URL(ref).pathname); } catch { return null; }
  }
  async function langFromClerk(): Promise<Lang | null> {
    try {
      const u = await currentUser();
      const raw = (u?.publicMetadata as Record<string, unknown> | undefined)?.lang;
      if (typeof raw === "string" && VALID_LANGS.includes(raw as Lang)) return raw as Lang;
    } catch { /* Clerk unavailable — ignore */ }
    return null;
  }
  const lang: Lang =
    (sp.lang && VALID_LANGS.includes(sp.lang as Lang) ? (sp.lang as Lang) : null) ??
    langFromPath(h.get("x-pathname")) ??
    langFromReferer(h.get("referer")) ??
    (await langFromClerk()) ??
    "sl";
  const t = GALLERY_LIMIT_COPY[lang];

  // If a logged-in user lands here with `?plan=` from a homepage pricing
  // card AND already has at least one album, skip the wizard and send
  // them straight to the upgrade page for their most recent album with
  // that plan pre-selected. The upgrade page then takes them to the Paddle
  // checkout on a single click. Skipping the wizard avoids forcing
  // returning customers to create a duplicate gallery just to pay.
  const existing = await db.query.albums.findFirst({
    where: eq(albums.ownerClerkId, userId),
    orderBy: [desc(albums.createdAt)],
  });

  if (initialPlan && existing) {
    redirect(`/dashboard/${existing.slug}/upgrade?plan=${initialPlan}`);
  }

  // A brand-new user has no galleries yet — /dashboard would just bounce
  // straight back here (it redirects to /dashboard/new when the list is
  // empty), so the "back" link would loop. Only show it once they have
  // a real gallery to return to.
  const hasGalleries = !!existing;

  // Free and Basic accounts are capped at one gallery. Once they already
  // have a gallery and haven't upgraded it to Plus/Premium, don't show the
  // creation wizard — send them to upgrade their existing gallery instead.
  const gate = await getAlbumCreationGate(userId);

  if (!gate.allowed) {
    return (
      <div className="min-h-screen" style={{ background: "#F4F6FB" }}>
        <DashboardNav />

        <main className="max-w-xl mx-auto px-4 sm:px-6 py-14">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#111111] transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.back}
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(255,201,77,0.12)" }}>
              <svg className="w-7 h-7" style={{ color: "#946D00" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl font-light text-[#111111] mb-2">{t.title}</h1>
            <p className="text-sm text-[#111111]/50 max-w-sm mx-auto mb-8">{t.body}</p>
            <Link
              href={`/dashboard/${gate.mostRecentSlug}/upgrade?lang=${lang}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-[#111111] transition-all duration-200 hover:brightness-95"
              style={{ background: "#F4B400" }}
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
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#111111] transition-colors mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Nazaj na nadzorno ploščo
          </Link>
        )}

        {/* Multi-step wizard */}
        <CreateEventWizard initialPlan={initialPlan} />

        <p className="text-center text-xs text-gray-400 mt-6">
          Po ustvarjanju boste dobili edinstveno QR kodo za vaše goste.
        </p>
      </main>
    </div>
  );
}
