import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { localQrSources } from "@/lib/db/local-rewards-schema";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const normalized = decodeURIComponent(code).trim().toUpperCase();
  if (!/^[A-Z0-9]{5,32}$/.test(normalized)) {
    return new Response("Invalid source", { status: 400 });
  }

  try {
    const [source] = await db
      .select({ id: localQrSources.id, active: localQrSources.isActive })
      .from(localQrSources)
      .where(eq(localQrSources.code, normalized))
      .limit(1);
    if (!source) return new Response("Source not found", { status: 404 });

    const localUrl = `${req.nextUrl.origin}/local/${encodeURIComponent(normalized)}`;
    const svg = await QRCode.toString(localUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 520,
      color: { dark: "#14181F", light: "#FFFFFF" },
    });

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": source.active ? "public, max-age=300, s-maxage=3600" : "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return new Response("Local Rewards not ready", { status: 503 });
  }
}
