import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import sharp from "sharp";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

/** XML-escape user-supplied text before embedding in the card SVG. */
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
}

/** Per-event default headline/subtitle for the designed card. */
function cardDefaults(eventType: string): { headline: string; subtitle: string } {
  switch (eventType) {
    case "birthday":    return { headline: "Delite fotografije", subtitle: "Skenirajte QR kodo in dodajte svoje utrinke" };
    case "baby_shower": return { headline: "Delite fotografije", subtitle: "Skenirajte QR kodo in dodajte svoje utrinke" };
    case "business":    return { headline: "Delite fotografije", subtitle: "Skenirajte QR kodo z dogodka" };
    default:            return { headline: "Delite naše fotografije", subtitle: "Skenirajte QR kodo in dodajte svoje utrinke" };
  }
}

/**
 * Compose a printable QR card as a PNG (cream card, headline, centered
 * QR, subtitle, gallery URL). Returns a PNG Buffer.
 */
async function renderDesignedCard(opts: {
  albumUrl: string;
  coupleName: string;
  headline: string;
  subtitle: string;
}): Promise<Buffer> {
  const W = 900, H = 1260;
  // QR as a PNG data URI embedded in the card SVG.
  const qrPng = await QRCode.toDataURL(opts.albumUrl, {
    width: 480,
    margin: 1,
    color: { dark: "#0F1729", light: "#FFFDF7" },
    errorCorrectionLevel: "M",
  });
  const qrSize = 480;
  const qrX = (W - qrSize) / 2;
  const qrY = 470;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="'DM Sans','Helvetica Neue',Arial,sans-serif">
    <rect width="${W}" height="${H}" rx="36" fill="#FFFDF7"/>
    <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="26" fill="none" stroke="#FFC94D" stroke-width="3"/>

    <text x="${W / 2}" y="150" text-anchor="middle" font-size="30" font-weight="700" letter-spacing="6" fill="#C9820A">GUESTCAM</text>
    <text x="${W / 2}" y="270" text-anchor="middle" font-size="58" font-weight="800" fill="#0F1729">${esc(opts.coupleName)}</text>
    <text x="${W / 2}" y="350" text-anchor="middle" font-size="40" font-weight="700" fill="#0F1729">${esc(opts.headline)}</text>

    <text x="${W / 2}" y="430" text-anchor="middle" font-size="26" fill="#64748B">${esc(opts.subtitle)}</text>

    <rect x="${qrX - 24}" y="${qrY - 24}" width="${qrSize + 48}" height="${qrSize + 48}" rx="24" fill="#FFFFFF" stroke="#F1E7CC" stroke-width="2"/>
    <image href="${qrPng}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>

    <text x="${W / 2}" y="${qrY + qrSize + 96}" text-anchor="middle" font-size="26" font-weight="700" letter-spacing="2" fill="#C9820A">SKENIRAJ · NALOŽI · DELI</text>
    <text x="${W / 2}" y="${qrY + qrSize + 150}" text-anchor="middle" font-size="24" fill="#94A3B8">${esc(opts.albumUrl.replace(/^https?:\/\//, ""))}</text>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.guestcam.si";
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
  const design = searchParams.get("design") === "1";

  // "Prenesi QR kodo z designom" → composed printable card (was
  // previously ignored, so this button produced the same plain QR as
  // "samo QR kodo").
  if (format === "png" && design) {
    const defaults = cardDefaults(album.eventType ?? "wedding");
    const png = await renderDesignedCard({
      albumUrl,
      coupleName: album.coupleName,
      headline: album.cardHeadline?.trim() || defaults.headline,
      subtitle: album.cardSubtitle?.trim() || defaults.subtitle,
    });
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-kartica-${slug}.png"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

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
