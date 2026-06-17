/**
 * Converts raw event photos → public/events/*.webp
 *
 * Usage:
 *   1. Drop your source images into  event-images-source/
 *      using these exact filenames (any extension: jpg, png, jpeg):
 *
 *        wedding.*       — wedding couple photo
 *        birthday.*      — birthday celebration
 *        babyshower.*    — baby shower / hen party
 *        anniversary.*   — anniversary / couples
 *        party.*         — bachelor / fun party
 *        business.*      — corporate / business event
 *        baptism.*       — baptism / christening
 *        graduation.*    — graduation / school event
 *
 *   2. node scripts/optimize-event-images.mjs
 *
 *   Output lands in  public/events/  as 600×800 WebP (quality 82).
 */

import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { join, parse } from "path";

const SRC = "./event-images-source";
const OUT = "./public/events";
const W   = 600;
const H   = 800;
const Q   = 82;

await mkdir(OUT, { recursive: true });

let files;
try {
  files = await readdir(SRC);
} catch {
  console.error(`❌  Source folder "${SRC}" not found.`);
  console.error(`    Create it and add your images, then re-run.`);
  process.exit(1);
}

const images = files.filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f));

if (!images.length) {
  console.error(`❌  No image files found in "${SRC}".`);
  process.exit(1);
}

for (const file of images) {
  const { name } = parse(file);
  const src = join(SRC, file);
  const dst = join(OUT, `${name}.webp`);

  await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .webp({ quality: Q })
    .toFile(dst);

  console.log(`✓  ${name}.webp  (${W}×${H}, q${Q})`);
}

console.log(`\nDone — ${images.length} image(s) saved to ${OUT}/`);
