import type { NextRequest } from "next/server";
import { verifyAlbumPassword } from "@/lib/album-password";
import { albumPasswordCookieName, unsealAlbumPassword } from "@/lib/album-password-cookie";

interface PasswordProtectedAlbum {
  password: string | null;
}

/**
 * Authorize a guest API request against an album.
 * Open/link-only albums always pass. Protected albums accept either the legacy
 * x-album-password header or the encrypted HttpOnly cookie issued by proxy.ts.
 */
export async function hasAlbumRequestAccess(
  req: NextRequest,
  slug: string,
  album: PasswordProtectedAlbum,
): Promise<boolean> {
  if (!album.password) return true;

  const headerPassword = req.headers.get("x-album-password") ?? "";
  if (headerPassword && await verifyAlbumPassword(headerPassword, album.password)) {
    return true;
  }

  const sealed = req.cookies.get(albumPasswordCookieName(slug))?.value;
  if (!sealed) return false;
  const cookiePassword = await unsealAlbumPassword(slug, sealed);
  if (!cookiePassword) return false;
  return verifyAlbumPassword(cookiePassword, album.password);
}
