import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  DASHBOARD_LANG_COOKIE,
  type DashboardLang,
} from "@/lib/i18n/dashboard-language";

const SUPPORTED = new Set<DashboardLang>(["sl", "hr", "sr", "en", "de", "es"]);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const lang = body?.lang as DashboardLang | undefined;
  if (!lang || !SUPPORTED.has(lang)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...(user.publicMetadata ?? {}),
        dashboardLang: lang,
        // Keep the general account language aligned as well so emails and
        // other account-level surfaces can follow the owner's explicit choice.
        lang,
      },
    });
  } catch (error) {
    console.warn("[account/language] Clerk preference save failed:", error);
    return NextResponse.json({ error: "Could not save language" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true, lang });
  response.cookies.set(DASHBOARD_LANG_COOKIE, lang, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
