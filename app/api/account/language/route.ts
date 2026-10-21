import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DASHBOARD_LANG_COOKIE,
  type DashboardLang,
} from "@/lib/i18n/dashboard-language";

const SUPPORTED = new Set<DashboardLang>(["sl", "hr", "sr", "en", "de", "es"]);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const lang = body?.lang as DashboardLang | undefined;
  const defaultAlbumLang = body?.defaultAlbumLang as DashboardLang | undefined;
  const initializeOnly = body?.initializeOnly === true;
  if ((!lang && !defaultAlbumLang) || (lang && !SUPPORTED.has(lang)) || (defaultAlbumLang && !SUPPORTED.has(defaultAlbumLang))) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (initializeOnly) {
      const cookieLang = (await cookies()).get(DASHBOARD_LANG_COOKIE)?.value;
      const savedCookieLang = typeof cookieLang === "string" && SUPPORTED.has(cookieLang as DashboardLang)
        ? cookieLang as DashboardLang
        : null;
      const savedLang = user.publicMetadata?.dashboardLang;
      const accountLang = typeof savedLang === "string" && SUPPORTED.has(savedLang as DashboardLang)
        ? savedLang as DashboardLang
        : null;
      const preferredLang = savedCookieLang ?? accountLang ?? lang;
      if (!preferredLang) {
        return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
      }
      if (!accountLang) {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...(user.publicMetadata ?? {}),
            dashboardLang: preferredLang,
            lang: preferredLang,
          },
        });
      }
      const response = NextResponse.json({ ok: true, lang: preferredLang });
      response.cookies.set(DASHBOARD_LANG_COOKIE, preferredLang, { path: "/", maxAge: 365 * 24 * 60 * 60, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
      return response;
    }
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...(user.publicMetadata ?? {}),
        ...(lang ? { dashboardLang: lang, lang } : {}),
        ...(defaultAlbumLang ? { defaultAlbumLang } : {}),
      },
    });
  } catch (error) {
    console.warn("[account/language] Clerk preference save failed:", error);
    return NextResponse.json({ error: "Could not save language" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true, lang, defaultAlbumLang });
  if (lang) response.cookies.set(DASHBOARD_LANG_COOKIE, lang, { path: "/", maxAge: 365 * 24 * 60 * 60, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return response;
}
