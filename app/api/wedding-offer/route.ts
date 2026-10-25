import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { weddingOffer } from '@/lib/wedding-offer';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  let customer = '';
  if (req.nextUrl.searchParams.get('customer') === '1') {
    try { customer = (await auth()).userId || ''; } catch { /* unconfigured local auth */ }
    if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(await weddingOffer.quote(customer), { headers: { 'Cache-Control': 'private, no-store' } });
}
