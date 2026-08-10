import type { Album } from "@/lib/db/schema";

/**
 * Strip owner secrets / PII from an album row before it is handed to a
 * **client** component.
 *
 * Why this exists: the guest gallery (`AlbumGuestView`) and the owner
 * dashboard (`AlbumAdminPanel`) are React *client* components. Anything
 * passed to them as props is serialized by React Server Components into
 * the page's HTML/Flight payload — i.e. it ships to the browser and is
 * readable by anyone who views source, INCLUDING an anonymous guest on a
 * public/QR album. Passing the raw `albums` row therefore leaked:
 *
 *   • `password`        — the scrypt hash (or legacy plaintext) of the
 *                          album password. On the guest page this let a
 *                          visitor read the very secret the password gate
 *                          is supposed to protect.
 *   • `ownerEmail`      — the owner's email address (PII).
 *   • `ownerClerkId`    — the owner's Clerk user id.
 *   • `notifyEmail`     — the owner's notification email (PII).
 *   • `stripeSessionId` — the payment/transaction reference.
 *
 * None of these are read by the client components; they were only ever
 * along for the ride because we spread the whole row. This blanks them
 * while keeping the exact `Album` type shape, so callers don't need to
 * change the prop type of the (large) client components.
 *
 * `ownerClerkId` is `NOT NULL` in the schema (type `string`), so it is
 * emptied to "" rather than null to preserve the type. The client never
 * uses it — owner status is passed as an explicit `isOwner` boolean.
 */
export function toPublicAlbum(album: Album): Album {
  return {
    ...album,
    password: null,
    ownerEmail: null,
    ownerClerkId: "",
    notifyEmail: null,
    stripeSessionId: null,
  };
}

/**
 * Strip the password secret for the **owner dashboard** client
 * (`AlbumAdminPanel`).
 *
 * Unlike the guest view, the dashboard is owner/admin-only, so the
 * owner's own email / notify email / payment reference are theirs to see
 * (and `stripeSessionId` is used client-side for the Meta Pixel Purchase
 * dedup key). The one field that must never reach the browser is the
 * password hash: it is a secret, and it was previously round-tripped
 * (read into form state, sent back on save). The settings PATCH route
 * treats an absent `password` as "leave unchanged", so the dashboard no
 * longer needs it at all.
 */
export function toOwnerAlbum(album: Album): Album {
  return { ...album, password: null };
}
