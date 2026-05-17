/**
 * Cloudflare R2 — S3-compatible object storage for images.
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_R2_ACCESS_KEY_ID
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY
 *   CLOUDFLARE_R2_BUCKET_NAME
 *   CLOUDFLARE_R2_PUBLIC_URL   ← e.g. https://assets.yourdomain.com
 *                                (R2 custom domain or r2.dev public bucket URL)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    if (!accountId || !accessKey || !secretKey) {
      throw new Error("Cloudflare R2 credentials not configured");
    }
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
  }
  return _client;
}

export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME &&
    process.env.CLOUDFLARE_R2_PUBLIC_URL
  );
}

/**
 * Create a presigned PUT URL for direct browser → R2 upload.
 * The URL is valid for `expiresIn` seconds (default 5 minutes).
 */
export async function createR2PresignedUrl({
  key,
  contentType,
  expiresIn = 300,
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
  const publicBase = process.env.CLOUDFLARE_R2_PUBLIC_URL!.replace(/\/$/, "");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(getClient(), command, { expiresIn });
  const publicUrl = `${publicBase}/${key}`;

  return { presignedUrl, publicUrl, key };
}

/** Delete an object from R2 by key. */
export async function deleteR2Object(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
    })
  );
}
