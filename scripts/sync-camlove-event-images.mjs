import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const files = [
  "babyshower.webp",
  "birthday-party.webp",
  "birthday.webp",
  "business.webp",
  "gromparty.webp",
  "krst.webp",
  "matura.webp",
  "nina-badric-maribox.webp",
  "organizacija-dogodkov-dogodek.webp",
  "party.webp",
  "template-elegant.webp",
  "template-minimal.webp",
  "template-modern.webp",
  "wedding.webp",
];

const sourceBase = "https://raw.githubusercontent.com/pako999/camlove.me/main/public/events";
const targetDir = path.join(process.cwd(), "public", "events");

await mkdir(targetDir, { recursive: true });

for (const name of files) {
  const url = `${sourceBase}/${encodeURIComponent(name)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not sync ${name} from CamLove (${response.status})`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100) {
    throw new Error(`CamLove image ${name} returned an unexpectedly small file`);
  }
  await writeFile(path.join(targetDir, name), bytes);
  console.log(`[camlove-images] ${name}: ${bytes.length} bytes`);
}

console.log(`[camlove-images] synced ${files.length} images into Guestcam public/events`);
