import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { affiliates, affiliateCommissions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AffiliateDashboardPage() {
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    user = await currentUser();
  } catch { /* ignore */ }

  if (!user) redirect("/sign-in?redirect_url=/affiliate/dashboard");

  // Match by Clerk userId first, then by any email on the user.
  const emails = user.emailAddresses.map((e) => e.emailAddress.toLowerCase());
  const allRows = await db.select().from(affiliates);
  const affiliate = allRows.find(
    (a) => a.clerkUserId === user!.id || (a.email && emails.includes(a.email.toLowerCase())),
  );

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-4xl mb-3">🤝</div>
          <h1 className="text-xl font-extrabold text-[#0F1729] mb-2">Še niste partner</h1>
          <p className="text-sm text-gray-500 mb-5">
            Pridružite se GuestCam partnerskemu programu in zaslužite 20% provizije.
          </p>
          <Link
            href="/affiliate/apply"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Prijava →
          </Link>
        </div>
      </div>
    );
  }

  if (affiliate.status === "pending") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-4xl mb-3">⏳</div>
          <h1 className="text-xl font-extrabold text-[#0F1729] mb-2">Prijava v obdelavi</h1>
          <p className="text-sm text-gray-500">
            Vašo prijavo pregledujemo. Odgovorili vam bomo v 2 delovnih dneh.
          </p>
        </div>
      </div>
    );
  }

  if (affiliate.status === "suspended" || affiliate.status === "rejected") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-4xl mb-3">🚫</div>
          <h1 className="text-xl font-extrabold text-[#0F1729] mb-2">
            {affiliate.status === "suspended" ? "Partnerski račun ustavljen" : "Prijava zavrnjena"}
          </h1>
          <p className="text-sm text-gray-500">
            Za več informacij nam pišite na <a href="mailto:partnerji@guestcam.si" className="underline">partnerji@guestcam.si</a>.
          </p>
        </div>
      </div>
    );
  }

  const commissions = await db
    .select()
    .from(affiliateCommissions)
    .where(eq(affiliateCommissions.affiliateId, affiliate.id))
    .orderBy(desc(affiliateCommissions.createdAt))
    .limit(50);

  return <DashboardClient affiliate={affiliate} commissions={commissions} />;
}
