export type GalleryPlan = "free" | "basic" | "plus" | "premium";

/**
 * Each Guestcam package is sold for one event. Within that event the owner
 * can split the album into this many named galleries (moments/sub-galleries).
 *
 * Keep these limits server-side as the source of truth; pricing UI mirrors
 * the same numbers for customers.
 */
export const GALLERY_LIMIT_BY_PLAN: Record<GalleryPlan, number> = {
  free: 2,
  basic: 1,
  plus: 3,
  premium: 5,
};

export function galleryLimitForPlan(plan: string | null | undefined): number {
  if (plan === "basic" || plan === "plus" || plan === "premium") {
    return GALLERY_LIMIT_BY_PLAN[plan];
  }
  return GALLERY_LIMIT_BY_PLAN.free;
}
