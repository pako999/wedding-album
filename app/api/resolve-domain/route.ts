import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Custom-domain resolution now happens directly in proxy.ts, where Next.js
// supports rewrites. Keep this retired endpoint explicit so stale or direct
// requests never trigger the unsupported App Route Handler rewrite again.
export async function GET() {
  return NextResponse.json(
    { error: "Gone" },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
