import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

// New Bunny S3 is intentionally isolated from the legacy Bunny Storage zone.
// Never fall back to BUNNY_STORAGE_* here: a partial S3 config must fail loudly
// instead of signing against the wrong bucket/secret and silently splitting data.
const s3Bucket = () => process.env.BUNNY_S3_BUCKET ?? "";
const s3AccessKey = () =>
  process.env.BUNNY_S3_ACCESS_KEY ??
  process.env.BUNNY_S3_ACCESS_KEY_ID ??
  "";
const s3SecretKey = () =>
  process.env.BUNNY_S3_SECRET_KEY ??
  process.env.BUNNY_S3_SECRET_ACCESS_KEY ??
  "";

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
  } catch { /* validation below handles it */ }

  return "us-east-1";
}

/** True when Guestcam has intentionally selected Bunny S3 as its photo store. */
export function isBunnyS3Selected(): boolean {
  return Boolean(process.env.BUNNY_S3_ENDPOINT);
}

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
      throw new Error(
        "Bunny S3 requires BUNNY_S3_ENDPOINT, BUNNY_S3_BUCKET, BUNNY_S3_ACCESS_KEY and BUNNY_S3_SECRET_KEY",
      );
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
  if (!isBunnyS3Configured()) throw new Error("Bunny S3 direct uploads are not configured");
  if (!validObjectKey(key)) throw new Error("Invalid Bunny S3 object key");

  const command = new PutObjectCommand({
    Bucket: s3Bucket(),
    Key: key,
    ContentType: contentType,
  });
  const presignedUrl = await getSignedUrl(getClient(), command, { expiresIn });
  return { presignedUrl, publicUrl: publicReadPath(key), key };
}

export async function createBunnyS3PresignedRead(
  key: string,
  expiresIn = 300,
): Promise<string> {
  if (!isBunnyS3Configured()) throw new Error("Bunny S3 direct reads are not configured");
  if (!validObjectKey(key)) throw new Error("Invalid Bunny S3 object key");
  const command = new GetObjectCommand({ Bucket: s3Bucket(), Key: key });
  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function deleteBunnyS3Object(key: string): Promise<void> {
  if (!isBunnyS3Configured()) throw new Error("Bunny S3 deletes are not configured");
  if (!validObjectKey(key)) throw new Error("Invalid Bunny S3 object key");
  await getClient().send(new DeleteObjectCommand({ Bucket: s3Bucket(), Key: key }));
}
