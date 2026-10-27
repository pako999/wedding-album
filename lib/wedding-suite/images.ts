export const WEDDING_IMAGE_SOURCE_LIMIT = 25 * 1024 * 1024;
// Stay below Vercel's request-body limit, including on phones with large originals.
export const WEDDING_IMAGE_UPLOAD_LIMIT = 3 * 1024 * 1024;
export const WEDDING_IMAGE_MAX_EDGE = 2400;
export const WEDDING_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
