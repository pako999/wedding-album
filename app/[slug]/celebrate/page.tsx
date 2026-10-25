import type { Metadata } from 'next';
import { WeddingSuiteGuest } from '@/components/wedding-suite/WeddingSuiteGuest';
import { suiteLang } from '@/lib/wedding-suite/contracts';
export const metadata: Metadata = { title: 'GuestCam', robots: { index: false, follow: false, noarchive: true }, referrer: 'no-referrer' };
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
 const { slug } = await params; const query = await searchParams;
 return <WeddingSuiteGuest slug={slug} initialLang={query.lang ? suiteLang(query.lang) : undefined} />;
}
