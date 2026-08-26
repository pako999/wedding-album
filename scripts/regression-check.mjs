import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function read(file) {
  return fs.readFile(path.join(root, file), "utf8");
}

function requireMatch(name, text, pattern, hint) {
  if (!pattern.test(text)) {
    throw new Error(`FAIL: ${name} — ${hint}`);
  }
  console.log(`PASS: ${name}`);
}

function requireAbsent(name, text, pattern, hint) {
  if (pattern.test(text)) {
    throw new Error(`FAIL: ${name} — ${hint}`);
  }
  console.log(`PASS: ${name}`);
}

const files = {
  legacyUpload: await read("app/api/albums/[slug]/upload/route.ts"),
  uploadUrl: await read("app/api/albums/[slug]/upload-url/route.ts"),
  saveUpload: await read("app/api/albums/[slug]/save-upload/route.ts"),
  legacyGateway: await read("app/api/albums/[slug]/bunny-upload/route.ts"),
  legacyDownload: await read("app/api/albums/[slug]/download/route.ts"),
  albumPage: await read("app/[slug]/page.tsx"),
  proxy: await read("proxy.ts"),
  s3: await read("lib/storage/bunny-s3.ts"),
  s3Read: await read("app/api/bunny-s3-file/[...key]/route.ts"),
  legacyRead: await read("app/api/img/route.ts"),
  deleteMedia: await read("lib/storage/delete-media.ts"),
  instrumentation: await read("instrumentation.ts"),
  bankOrder: await read("app/api/bank-order/route.ts"),
  videoPlayback: await read("app/api/albums/[slug]/video-playback-url/route.ts"),
  videoClient: await read("components/album/IosBunnyPlaybackFix.tsx"),
  filmStatus: await read("app/api/albums/[slug]/film/status/route.ts"),
  envExample: await read(".env.example"),
};

requireMatch(
  "legacy upload endpoint stays retired",
  files.legacyUpload,
  /status:\s*410/,
  "legacy upload route must keep returning HTTP 410",
);

requireMatch(
  "legacy server ZIP endpoint stays retired",
  files.legacyDownload,
  /status:\s*410/,
  "server-side ZIP endpoint must not be re-enabled accidentally",
);

requireMatch(
  "Bunny S3 physical delete support exists",
  files.s3,
  /DeleteObjectCommand/,
  "Bunny S3 helper must support DeleteObjectCommand",
);

requireMatch(
  "central media deletion handles Bunny S3",
  files.deleteMedia,
  /deleteBunnyS3Object/,
  "provider-aware deletion must include Bunny S3",
);

requireAbsent(
  "runtime startup does not run schema migrations",
  files.instrumentation,
  /runMigrations\s*\(/,
  "schema migrations must not execute during application startup",
);

requireMatch(
  "bank orders require album ownership",
  files.bankOrder,
  /checkAlbumOwnership/,
  "bank-order route must verify album owner/admin access",
);

requireMatch(
  "protected video playback uses album request access",
  files.videoPlayback,
  /hasAlbumRequestAccess/,
  "video playback token issuance must use the shared album access gate",
);

requireAbsent(
  "video playback password is not read from query string",
  files.videoPlayback,
  /searchParams\.get\(["']pw["']\)/,
  "protected playback must use HttpOnly album-access cookies/headers, not ?pw=",
);

requireAbsent(
  "video client does not append album password to URLs",
  files.videoClient,
  /\.set\(["']pw["']/,
  "client video requests must not put album passwords into query parameters",
);

requireMatch(
  "new S3 media checks protected album guest access",
  files.s3Read,
  /hasAlbumRequestAccess/,
  "password-protected S3 reads must use the shared album access gate",
);

requireMatch(
  "new S3 media preserves owner access",
  files.s3Read,
  /checkAlbumOwnership/,
  "album owners must still be able to manage protected S3 media",
);

requireMatch(
  "legacy Bunny media checks protected album access",
  files.legacyRead,
  /hasAlbumRequestAccess/,
  "historical Bunny media must use the same protected album access model",
);

requireMatch(
  "legacy Bunny media preserves owner access",
  files.legacyRead,
  /checkAlbumOwnership/,
  "album owners must still be able to manage historical protected media",
);

requireMatch(
  "upload URL issuance uses HttpOnly album access",
  files.uploadUrl,
  /hasAlbumRequestAccess/,
  "upload-url must accept the protected album cookie instead of requiring raw client password props",
);

requireMatch(
  "upload finalization uses HttpOnly album access",
  files.saveUpload,
  /hasAlbumRequestAccess/,
  "save-upload must accept the protected album cookie instead of requiring raw client password props",
);

requireMatch(
  "legacy upload gateway uses HttpOnly album access",
  files.legacyGateway,
  /hasAlbumRequestAccess/,
  "legacy-compatible upload gateway must follow the same album access model",
);

requireAbsent(
  "album page does not serialize raw passwords to client props",
  files.albumPage,
  /providedPassword\s*=|\{\s*pw\s*,/,
  "the Server Component must never pass a raw album password into AlbumGuestView",
);

requireAbsent(
  "proxy never rewrites raw password back into query string",
  files.proxy,
  /searchParams\.set\(["']pw["']/,
  "decrypted album passwords must stay in a server-only request header",
);

requireMatch(
  "proxy strips untrusted internal password header",
  files.proxy,
  /delete\(["']x-album-access-password["']\)/,
  "browser-supplied internal password headers must be overwritten/removed",
);

requireMatch(
  "film no-generation state is a normal response",
  files.filmStatus,
  /generation:\s*null/,
  "film status should represent 'no film yet' without an expected 404",
);

requireMatch(
  "env template separates legacy Bunny CDN from new S3 CDN",
  files.envExample,
  /BUNNY_CDN_URL=https:\/\/frfr1\.b-cdn\.net[\s\S]*BUNNY_S3_CDN_URL=https:\/\/guestcam-media\.b-cdn\.net/,
  "legacy and S3 pull zones must remain separate",
);

console.log("\nAll Guestcam critical regression checks passed.");
