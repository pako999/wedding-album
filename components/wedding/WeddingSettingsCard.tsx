"use client";
import type { Lang } from '@/lib/i18n/translations';
import { WeddingSuiteManager } from '@/components/wedding-suite/WeddingSuiteManager';

/** The dashboard has one editor. Legacy program data is edited inside the suite. */
export function WeddingSettingsCard(props: { slug: string; lang: Lang; plan: string; albumName?: string | null; eventDate?: string | null }) {
 return <WeddingSuiteManager {...props} />;
}
