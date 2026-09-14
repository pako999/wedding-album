const SAFE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomToken(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SAFE_ALPHABET[bytes[i] % SAFE_ALPHABET.length];
  }
  return out;
}

/** Public QR source code placed in URLs/printed stands. */
export function createLocalSourceCode(): string {
  return `L${randomToken(9)}`;
}

/** Human-readable one-time reward code shown to the guest and venue staff. */
export function createLocalCouponCode(): string {
  return `GC-${randomToken(4)}-${randomToken(4)}`;
}

export function couponExpiry(validDays: number, from = new Date()): Date | null {
  if (!Number.isFinite(validDays) || validDays <= 0) return null;
  const expires = new Date(from);
  expires.setUTCDate(expires.getUTCDate() + Math.floor(validDays));
  return expires;
}

export function isCampaignLive(
  campaign: {
    isActive: boolean;
    startsAt?: Date | null;
    endsAt?: Date | null;
    maxCoupons?: number | null;
    issuedCount?: number;
  },
  now = new Date(),
): boolean {
  if (!campaign.isActive) return false;
  if (campaign.startsAt && campaign.startsAt > now) return false;
  if (campaign.endsAt && campaign.endsAt < now) return false;
  if (
    campaign.maxCoupons != null &&
    (campaign.issuedCount ?? 0) >= campaign.maxCoupons
  ) return false;
  return true;
}

export function formatRewardPreview(input: {
  rewardType: "percent" | "fixed" | "free_item" | "custom";
  rewardValue?: number | null;
  rewardCurrency?: string | null;
  rewardTitle: string;
}): string {
  if (input.rewardType === "percent" && input.rewardValue != null) {
    return `${input.rewardValue}% off`;
  }
  if (input.rewardType === "fixed" && input.rewardValue != null) {
    const amount = (input.rewardValue / 100).toFixed(2);
    return `${amount} ${input.rewardCurrency ?? "EUR"} off`;
  }
  return input.rewardTitle;
}
