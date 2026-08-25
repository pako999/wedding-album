import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = "https://player.mediadelivery.net/embed/662454/d5412ee4-d1cd-4e7c-ba12-ae1c5e5ce98d";
  try {
    const res = await fetch(url, { cache: "no-store", redirect: "follow" });
    const text = await res.text();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type"),
      finalUrl: res.url,
      looksLikePlayer: /video|player|media-controller|mediadelivery/i.test(text),
      sample: text.slice(0, 180),
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
