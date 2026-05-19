import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  const { slug } = await params;

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  if (!album) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only owner can generate QR (or it's a public endpoint — adjust as needed)
  if (userId && userId !== album.ownerClerkId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://guestcam.si";
  const albumUrl = `${appUrl}/${slug}`;

  // Generate QR as SVG
  const svg = await QRCode.toString(albumUrl, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#0F1729",
      light: "#F2F4F8",
    },
  });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "svg";

  if (format === "png") {
    const png = await QRCode.toBuffer(albumUrl, {
      type: "png",
      width: 400,
      margin: 2,
      color: { dark: "#0F1729", light: "#F2F4F8" },
    });
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="album-qr-${slug}.png"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
