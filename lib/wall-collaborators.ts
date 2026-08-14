import { db } from "@/lib/db";
import { wallCollaborators, type WallCollaborator } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Wall collaborators — people the owner invites to manage ONLY the
 * Photo Wall (wall settings + sponsor slides). A DJ or venue tech gets
 * exactly the screen they need and nothing else: no photos, no album
 * settings, no billing.
 *
 * Every read swallows errors and returns an empty/false default so a
 * deploy that lands before the wall_collaborators migration degrades to
 * "no collaborators" instead of breaking the dashboard or the wall.
 */

export async function listCollaborators(albumId: string): Promise<WallCollaborator[]> {
  try {
    return await db.query.wallCollaborators.findMany({
      where: eq(wallCollaborators.albumId, albumId),
    });
  } catch (err) {
    console.warn("[wall-collab] list failed (table missing?):", err);
    return [];
  }
}

export async function addCollaborator(albumId: string, email: string, invitedBy: string | null): Promise<boolean> {
  try {
    await db
      .insert(wallCollaborators)
      .values({ albumId, email: email.trim().toLowerCase(), invitedBy })
      .onConflictDoNothing();
    return true;
  } catch (err) {
    console.error("[wall-collab] add failed:", err);
    return false;
  }
}

export async function removeCollaborator(albumId: string, id: string): Promise<boolean> {
  try {
    await db
      .delete(wallCollaborators)
      .where(and(eq(wallCollaborators.id, id), eq(wallCollaborators.albumId, albumId)));
    return true;
  } catch (err) {
    console.error("[wall-collab] remove failed:", err);
    return false;
  }
}

/**
 * Is the signed-in user an invited wall collaborator for this album?
 * Matched against VERIFIED Clerk e-mail addresses only — typing someone
 * else's address into a fresh account grants nothing until that address
 * is actually verified.
 */
export async function isWallCollaborator(albumId: string): Promise<boolean> {
  let emails: string[] = [];
  try {
    const user = await currentUser();
    emails = (user?.emailAddresses ?? [])
      .filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress.toLowerCase());
  } catch {
    return false; // Clerk unavailable → no elevated access
  }
  if (emails.length === 0) return false;
  try {
    const rows = await db.query.wallCollaborators.findMany({
      where: eq(wallCollaborators.albumId, albumId),
    });
    return rows.some((r) => emails.includes(r.email));
  } catch (err) {
    console.warn("[wall-collab] check failed (table missing?):", err);
    return false;
  }
}
