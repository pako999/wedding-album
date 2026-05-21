import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CreateEventWizard } from "@/components/dashboard/CreateEventWizard";

export const dynamic = "force-dynamic";

export default async function NewAlbumPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // Clerk not configured or session error — redirect to sign-in
  }
  if (!userId) redirect("/sign-in");

  const { plan: planParam } = await searchParams;
  const initialPlan =
    planParam === "basic" || planParam === "plus" || planParam === "premium"
      ? planParam
      : undefined;

  // If a logged-in user lands here with `?plan=` from a homepage pricing
  // card AND already has at least one album, skip the wizard and send
  // them straight to the upgrade page for their most recent album with
  // that plan pre-selected. The upgrade page then takes them to Stripe
  // Checkout on a single click. Skipping the wizard avoids forcing
  // returning customers to create a duplicate gallery just to pay.
  if (initialPlan) {
    const existing = await db.query.albums.findFirst({
      where: eq(albums.ownerClerkId, userId),
      orderBy: [desc(albums.createdAt)],
    });
    if (existing) {
      redirect(`/dashboard/${existing.slug}/upgrade?plan=${initialPlan}`);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#F4F6FB" }}>
      <DashboardNav />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-14">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0F1729] transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Nazaj na galerije
        </Link>

        {/* Multi-step wizard */}
        <CreateEventWizard initialPlan={initialPlan} />

        <p className="text-center text-xs text-gray-400 mt-6">
          Po ustvarjanju boste dobili edinstveno QR kodo za vaše goste.
        </p>
      </main>
    </div>
  );
}
