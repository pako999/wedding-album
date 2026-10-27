import { WEDDING_IMAGE_MAX_EDGE, WEDDING_IMAGE_SOURCE_LIMIT, WEDDING_IMAGE_UPLOAD_LIMIT } from './images';

/** Website artwork only. Album guest uploads retain their original full quality. */
export async function prepareWeddingImage(file: File): Promise<Blob> {
 if (file.size > WEDDING_IMAGE_SOURCE_LIMIT) throw new Error('too_large');
 if (!file.size || !(/\.(jpe?g|png|webp|avif|hei[cf])$/i.test(file.name) || /^image\/(jpeg|jpg|png|webp|avif|heic|heif)$/.test(file.type))) throw new Error('invalid_image');
 let source: ImageBitmap | HTMLImageElement;
 let objectUrl: string | undefined;
 try {
  try { source = await createImageBitmap(file); }
  catch {
   objectUrl = URL.createObjectURL(file);
   const image = new Image(); image.src = objectUrl; await image.decode(); source = image;
  }
  try {
   const width = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
   const height = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
   if (!width || !height || width * height > 100_000_000) throw new Error('invalid_image');
   const scale = Math.min(1, WEDDING_IMAGE_MAX_EDGE / Math.max(width, height));
   const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
   const context = canvas.getContext('2d'); if (!context) throw new Error('invalid_image');
   context.drawImage(source, 0, 0, canvas.width, canvas.height);
   for (const quality of [.85, .75, .6]) {
    let blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob || blob.type !== 'image/webp') blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size && blob.size <= WEDDING_IMAGE_UPLOAD_LIMIT) return blob;
   }
   throw new Error('invalid_image');
  } finally { if ('close' in source) source.close(); }
 } catch { throw new Error('invalid_image'); }
 finally { if (objectUrl) URL.revokeObjectURL(objectUrl); }
}
