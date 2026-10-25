import { weddingCopy } from '@/lib/wedding/copy';
import type { Lang } from '@/lib/i18n/translations';

/** Database and checkout IDs stay stable; display names match the public pricing. */
export function adminPlanLabel(plan: string, lang: Lang = 'sl'): string {
  if (plan === 'premium') return weddingCopy(lang).plan;
  const labels: Record<string, string> = { free: 'Free', basic: 'Basic', plus: 'Plus', business: 'Business', influencer: '🎤 Influencer', sponsor: '🤝 Sponsor' };
  return labels[plan] || plan;
}
