import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

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
 * Compose the printable "QR z designom" card via next/og (satori).
 *
 * IMPORTANT: satori renders text with fonts WE bundle (Liberation Sans,
 * SIL OFL, committed next to this route). The previous sharp+SVG
 * approach depended on SYSTEM fonts, which Vercel's serverless runtime
 * doesn't have — every text node rendered as tofu boxes in production
 * while looking fine locally. Never go back to system-font SVG text.
 * The fonts are loaded via import.meta.url so Next's file tracing
 * bundles them into the serverless function.
 */
async function renderDesignedCard(opts: {
  albumUrl: string;
  coupleName: string;
  headline: string;
  subtitle: string;
  slug: string;
}): Promise<ImageResponse> {
  const [fontRegular, fontBold, qrPng] = await Promise.all([
    readFile(new URL("./fonts/LiberationSans-Regular.ttf", import.meta.url)),
    readFile(new URL("./fonts/LiberationSans-Bold.ttf", import.meta.url)),
    QRCode.toDataURL(opts.albumUrl, {
      width: 480,
      margin: 1,
      color: { dark: "#0F1729", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    }),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#FFFDF7",
          fontFamily: "Liberation Sans",
          padding: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "3px solid #FFC94D",
            borderRadius: 26,
            paddingTop: 70,
            paddingBottom: 50,
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 6, color: "#C9820A" }}>
            GUESTCAM
          </div>
          <div style={{ display: "flex", marginTop: 46, fontSize: 58, fontWeight: 700, color: "#0F1729", textAlign: "center" }}>
            {opts.coupleName}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 38, fontWeight: 700, color: "#0F1729", textAlign: "center" }}>
            {opts.headline}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 26, color: "#64748B", textAlign: "center", maxWidth: 700 }}>
            {opts.subtitle}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 44,
              padding: 24,
              backgroundColor: "#FFFFFF",
              border: "2px solid #F1E7CC",
              borderRadius: 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrPng} width={460} height={460} alt="" />
          </div>

          <div style={{ display: "flex", marginTop: 56, fontSize: 26, fontWeight: 700, letterSpacing: 3, color: "#C9820A" }}>
            SKENIRAJ · NALOŽI · DELI
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 24, color: "#94A3B8" }}>
            {opts.albumUrl.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      width: 900,
      height: 1260,
      fonts: [
        { name: "Liberation Sans", data: fontRegular, weight: 400, style: "normal" },
        { name: "Liberation Sans", data: fontBold, weight: 700, style: "normal" },
      ],
      headers: {
        "Content-Disposition": `attachment; filename="qr-kartica-${opts.slug}.png"`,
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
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
    // ImageResponse IS the response (headers incl. attachment set inside).
    return renderDesignedCard({
      albumUrl,
      coupleName: album.coupleName,
      headline: album.cardHeadline?.trim() || defaults.headline,
      subtitle: album.cardSubtitle?.trim() || defaults.subtitle,
      slug,
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
