import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

const legacyZone = () => process.env.BUNNY_STORAGE_ZONE ?? "";
const legacyStorageKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const s3Bucket = () => process.env.BUNNY_S3_BUCKET ?? legacyZone();
const s3AccessKey = () =>
  process.env.BUNNY_S3_ACCESS_KEY ??
  process.env.BUNNY_S3_ACCESS_KEY_ID ??
  s3Bucket();
const s3SecretKey = () =>
  process.env.BUNNY_S3_SECRET_KEY ??
  process.env.BUNNY_S3_SECRET_ACCESS_KEY ??
  legacyStorageKey();
const cdnBase = () => (process.env.BUNNY_CDN_URL ?? "").replace(/\/$/, "");

/**
 * Resolve the AWS signing region Bunny expects.
 *
 * Bunny S3 endpoints include the region in the hostname, for example:
 *   https://de-s3.storage.bunnycdn.com -> de
 *
 * A production env was accidentally configured with that full endpoint URL in
 * BUNNY_S3_REGION. The AWS SDK rejects URLs as region names before it can even
 * create a presigned URL. Accept a normal region token when supplied, otherwise
 * infer it from BUNNY_S3_ENDPOINT and fall back to us-east-1 for compatibility.
 */
function s3Region(): string {
  const configured = (process.env.BUNNY_S3_REGION ?? "").trim();
  if (configured && /^[a-z0-9][a-z0-9-]*$/i.test(configured)) {
    return configured;
  }

  const endpoint = (process.env.BUNNY_S3_ENDPOINT ?? "").trim();
  try {
    const host = new URL(endpoint).hostname;
    const match = host.match(/^([a-z0-9-]+)-s3\.storage\.bunnycdn\.com$/i);
    if (match?.[1]) return match[1].toLowerCase();
  } catch {
    // Configuration validation below will surface a missing/invalid endpoint.
  }

  return "us-east-1";
}

/**
 * Bunny S3 compatibility is opt-in. Normal Bunny Storage API credentials do
 * not automatically enable direct browser uploads; an explicit S3 endpoint is
 * required.
 *
 * Preferred env names:
 * - BUNNY_S3_ENDPOINT      (example: https://de-s3.storage.bunnycdn.com)
 * - BUNNY_S3_BUCKET
 * - BUNNY_S3_ACCESS_KEY
 * - BUNNY_S3_SECRET_KEY
 * - BUNNY_S3_REGION        (optional; example: de)
 * - BUNNY_CDN_URL
 */
export function isBunnyS3Configured(): boolean {
  return !!(
    process.env.BUNNY_S3_ENDPOINT &&
    s3Bucket() &&
    s3AccessKey() &&
    s3SecretKey() &&
    cdnBase()
  );
}

function getClient(): S3Client {
  if (!client) {
    const endpoint = process.env.BUNNY_S3_ENDPOINT;
    if (!endpoint || !s3Bucket() || !s3AccessKey() || !s3SecretKey()) {
      throw new Error("Bunny S3 direct uploads are not configured");
    }
    client = new S3Client({
      region: s3Region(),
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: s3AccessKey(),
        secretAccessKey: s3SecretKey(),
      },
    });
  }
  return client;
}

export async function createBunnyS3PresignedUpload({
  key,
  contentType,
  expiresIn = 300,
}: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
  if (!isBunnyS3Configured()) {
    throw new Error("Bunny S3 direct uploads are not configured");
  }
  const command = new PutObjectCommand({
    Bucket: s3Bucket(),
    Key: key,
    ContentType: contentType,
  });
  const presignedUrl = await getSignedUrl(getClient(), command, { expiresIn });
  return {
    presignedUrl,
    publicUrl: `${cdnBase()}/${key}`,
    key,
  };
}
