import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

/**
 * Resolve the AWS signing region Bunny expects.
 *
 * Bunny S3 endpoints include the region in the hostname, for example:
 *   https://de-s3.storage.bunnycdn.com -> de
 *
 * Accept a normal region token when supplied. If BUNNY_S3_REGION was
 * accidentally populated with the endpoint URL, infer the region from the
 * endpoint instead of letting the AWS SDK reject the configuration.
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
 * Bunny S3 is intentionally separate from the legacy Bunny Storage zone.
 * BUNNY_CDN_URL belongs to the legacy zone and MUST NOT be reused for newly
 * uploaded S3 objects, otherwise the database contains a valid photo row that
 * points at an object which does not exist in the old pull zone.
 *
 * Required envs:
 * - BUNNY_S3_ENDPOINT      (example: https://de-s3.storage.bunnycdn.com)
 * - BUNNY_S3_BUCKET
 * - BUNNY_S3_ACCESS_KEY
 * - BUNNY_S3_SECRET_KEY
 * - BUNNY_S3_REGION        (optional; example: de)
 *
 * Optional:
 * - BUNNY_S3_CDN_URL       pull-zone URL connected to the NEW S3 storage zone.
 *                           If omitted, reads safely redirect to a short-lived
 *                           signed S3 GET URL instead.
 */
export function isBunnyS3Configured(): boolean {
  return !!(
    process.env.BUNNY_S3_ENDPOINT &&
    s3Bucket() &&
    s3AccessKey() &&
    s3SecretKey()
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

function validObjectKey(key: string): boolean {
  return (
    key.startsWith("albums/") &&
    !key.includes("..") &&
    !key.includes("\\") &&
    !key.includes("//") &&
    key.length <= 1024
  );
}

function publicReadPath(key: string): string {
  const encoded = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/bunny-s3-file/${encoded}`;
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
  if (!validObjectKey(key)) {
    throw new Error("Invalid Bunny S3 object key");
  }
  const command = new PutObjectCommand({
    Bucket: s3Bucket(),
    Key: key,
    ContentType: contentType,
  });
  const presignedUrl = await getSignedUrl(getClient(), command, { expiresIn });
  return {
    presignedUrl,
    // Do not use BUNNY_CDN_URL here: it belongs to the old storage zone.
    // This stable app URL redirects either to the new S3 pull zone or to a
    // short-lived signed GET URL, so both old and new storage can coexist.
    publicUrl: publicReadPath(key),
    key,
  };
}

export async function createBunnyS3PresignedRead(
  key: string,
  expiresIn = 300,
): Promise<string> {
  if (!isBunnyS3Configured()) {
    throw new Error("Bunny S3 direct reads are not configured");
  }
  if (!validObjectKey(key)) {
    throw new Error("Invalid Bunny S3 object key");
  }
  const command = new GetObjectCommand({ Bucket: s3Bucket(), Key: key });
  return getSignedUrl(getClient(), command, { expiresIn });
}

/**
 * Permanently delete one object from the NEW Bunny S3 zone.
 * S3 DELETE is idempotent, so retrying cleanup after a partial failure is safe.
 */
export async function deleteBunnyS3Object(key: string): Promise<void> {
  if (!isBunnyS3Configured()) {
    throw new Error("Bunny S3 deletes are not configured");
  }
  if (!validObjectKey(key)) {
    throw new Error("Invalid Bunny S3 object key");
  }

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: s3Bucket(),
      Key: key,
    }),
  );
}
