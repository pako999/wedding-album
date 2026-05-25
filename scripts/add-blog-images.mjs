#!/usr/bin/env node
/**
 * One-shot: insert 2 contextual in-content image blocks into every
 * blog post. Images are mapped by translationKey so all 6 language
 * variants of the same post share the same imagery; alt text is
 * localised per language so Google Image search picks up the right
 * keywords for each market.
 *
 * Idempotent: if the post already contains an `image` block, it's
 * skipped (so re-running doesn't add duplicates).
 *
 * Run: node scripts/add-blog-images.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";

const BLOG_DIR = path.resolve(process.cwd(), "content", "blog");
const LANGS = ["sl", "hr", "sr", "de", "en", "es"];

// ─── Images per topic (translationKey) ──────────────────────────────────────
//
// Each entry produces TWO images, inserted at positions 3 and 7 in the
// content array (roughly: after the intro and partway through the
// body). Unsplash IDs are deliberately chosen to match the post topic:
//
//   collect-photos      → bride/groom moment + guest with phone
//   private-gallery     → private gallery on phone + QR code at table
//   checklist           → wedding details (rings/dress) + ceremony
//   guests-forget       → guests with phones + candid reception
//   vs-whatsapp         → phone screen comparison + group photo
//
// Sizes use Unsplash's CDN params (?w=1200&h=720&fit=crop&q=82&auto=format)
// so the file weight stays under 200KB regardless of device DPR.

const UNSPLASH = (id, w = 1200, h = 720) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=82&auto=format`;

const IMAGES_BY_KEY = {
  "how-to-collect-wedding-photos": [
    {
      id: "photo-1519225421980-715cb0215aed",   // bride + groom embracing
      altKey: "altCollect1",
      captionKey: "captionCollect1",
    },
    {
      id: "photo-1531058020387-3be344556be6",   // guest taking photo with phone
      altKey: "altCollect2",
      captionKey: "captionCollect2",
    },
  ],
  "private-wedding-gallery": [
    {
      id: "photo-1511285560929-80b456fea0bc",   // outdoor wedding reception
      altKey: "altPrivate1",
      captionKey: "captionPrivate1",
    },
    {
      id: "photo-1606216794074-735e91aa2c92",   // phone with QR code
      altKey: "altPrivate2",
      captionKey: "captionPrivate2",
    },
  ],
  "wedding-photo-checklist-2026": [
    {
      id: "photo-1606216794074-735e91aa2c92",   // rings on detail
      altKey: "altChecklist1",
      captionKey: "captionChecklist1",
    },
    {
      id: "photo-1519741497674-611481863552",   // ceremony moment
      altKey: "altChecklist2",
      captionKey: "captionChecklist2",
    },
  ],
  "guests-forget-to-share": [
    {
      id: "photo-1465495976277-4387d4b0b4c6",   // guests at reception with phones
      altKey: "altForget1",
      captionKey: "captionForget1",
    },
    {
      id: "photo-1525772764200-be829a350797",   // candid wedding moment
      altKey: "altForget2",
      captionKey: "captionForget2",
    },
  ],
  "guestcam-vs-whatsapp": [
    {
      id: "photo-1611162616305-c69b3fa7fbe0",   // phone with messaging app
      altKey: "altVs1",
      captionKey: "captionVs1",
    },
    {
      id: "photo-1519225421980-715cb0215aed",   // group photo at wedding
      altKey: "altVs2",
      captionKey: "captionVs2",
    },
  ],
};

// ─── Per-language alt + caption text ────────────────────────────────────────
//
// Each key maps language code → string. Designed so Google Image
// search picks up locale-specific long-tail queries
// ("poročne fotografije z gosti", "wedding photos with guests" etc.).

const COPY = {
  // collect-photos
  altCollect1: {
    sl: "Mladoporočenca v objemu na poročnem dnevu",
    hr: "Mladenci u zagrljaju na dan vjenčanja",
    sr: "Mladenci u zagrljaju na dan venčanja",
    de: "Brautpaar in inniger Umarmung am Hochzeitstag",
    en: "Bride and groom embracing on their wedding day",
    es: "Pareja de novios abrazándose el día de su boda",
  },
  captionCollect1: {
    sl: "Najlepši trenutki se zgodijo med gosti — Guestcam jih ujame vse.",
    hr: "Najljepši trenuci događaju se među gostima — Guestcam ih hvata sve.",
    sr: "Najlepši trenuci događaju se među gostima — Guestcam ih hvata sve.",
    de: "Die schönsten Momente passieren unter den Gästen — Guestcam fängt sie alle ein.",
    en: "The most precious moments happen among the guests — Guestcam captures them all.",
    es: "Los momentos más preciados ocurren entre los invitados — Guestcam los captura todos.",
  },
  altCollect2: {
    sl: "Gostja fotografira mladoporočenca s telefonom",
    hr: "Gošća fotografira mladence mobitelom",
    sr: "Gošća fotografiše mladence telefonom",
    de: "Gast fotografiert das Brautpaar mit dem Smartphone",
    en: "Guest taking a photo of the bride and groom with their phone",
    es: "Invitada fotografía a los novios con su teléfono móvil",
  },
  captionCollect2: {
    sl: "200 telefonov, 200 zornih kotov — z eno QR kodo končajo v eni galeriji.",
    hr: "200 mobitela, 200 kuteva — s jednim QR kodom završe u jednoj galeriji.",
    sr: "200 telefona, 200 uglova — sa jednim QR kodom završe u jednoj galeriji.",
    de: "200 Smartphones, 200 Perspektiven — mit einem QR-Code in einer Galerie vereint.",
    en: "200 phones, 200 angles — one QR code brings them all into a single gallery.",
    es: "200 teléfonos, 200 ángulos — un solo código QR los reúne en una galería.",
  },

  // private-gallery
  altPrivate1: {
    sl: "Poročna pojedina pod lučkami v zlati uri",
    hr: "Vjenčana večera pod svjetlima u zlatnoj uri",
    sr: "Venčana večera pod svetlima u zlatnom času",
    de: "Hochzeitsempfang unter Lichterketten in der goldenen Stunde",
    en: "Wedding reception under fairy lights at golden hour",
    es: "Banquete de boda bajo guirnaldas de luces en hora dorada",
  },
  captionPrivate1: {
    sl: "Zasebna galerija ohrani vzdušje dogodka — brez tujih oči.",
    hr: "Privatna galerija čuva atmosferu događaja — bez stranih očiju.",
    sr: "Privatna galerija čuva atmosferu događaja — bez stranih očiju.",
    de: "Eine private Galerie bewahrt die Stimmung — ohne fremde Blicke.",
    en: "A private gallery preserves the atmosphere — no prying eyes.",
    es: "Una galería privada preserva el ambiente — sin miradas ajenas.",
  },
  altPrivate2: {
    sl: "QR koda za poročno galerijo na elegantni mizi",
    hr: "QR kod za galeriju vjenčanja na eleganstnom stolu",
    sr: "QR kod za galeriju venčanja na elegantnom stolu",
    de: "QR-Code für die Hochzeitsgalerie auf einem elegant gedeckten Tisch",
    en: "QR code for a wedding gallery on an elegantly set table",
    es: "Código QR para la galería de boda en una mesa elegantemente decorada",
  },
  captionPrivate2: {
    sl: "Ena koda na vsako mizo — gostje skenirajo in delijo v sekundah.",
    hr: "Jedan kod na svakom stolu — gosti skeniraju i dijele u sekundi.",
    sr: "Jedan kod na svakom stolu — gosti skeniraju i dele u sekundi.",
    de: "Ein Code pro Tisch — Gäste scannen und teilen in Sekunden.",
    en: "One code per table — guests scan and share within seconds.",
    es: "Un código por mesa — los invitados escanean y comparten en segundos.",
  },

  // checklist
  altChecklist1: {
    sl: "Detajli poroke: prstana in šopek nevest",
    hr: "Detalji vjenčanja: prstenje i mladenkin buket",
    sr: "Detalji venčanja: prstenje i mladin buket",
    de: "Hochzeitsdetails: Eheringe und Brautstrauß",
    en: "Wedding details: rings and the bride's bouquet",
    es: "Detalles de boda: anillos y el ramo de la novia",
  },
  captionChecklist1: {
    sl: "Detajli, ki jih fotograf morda spregleda — gostje pa skoraj nikoli.",
    hr: "Detalji koje fotograf možda propusti — gosti gotovo nikad.",
    sr: "Detalji koje fotograf možda propusti — gosti gotovo nikad.",
    de: "Details, die der Fotograf vielleicht übersieht — Gäste fast nie.",
    en: "Details the photographer might miss — guests almost never do.",
    es: "Detalles que el fotógrafo puede pasar por alto — los invitados casi nunca.",
  },
  altChecklist2: {
    sl: "Poročna slovesnost — nevesta in ženin pred oltarjem",
    hr: "Vjenčana ceremonija — mladenka i mladoženja ispred oltara",
    sr: "Venčana ceremonija — mlada i mladoženja ispred oltara",
    de: "Trauzeremonie — Braut und Bräutigam vor dem Altar",
    en: "Wedding ceremony — bride and groom at the altar",
    es: "Ceremonia de boda — los novios frente al altar",
  },
  captionChecklist2: {
    sl: "Vsak ključni trenutek — od »da« do prvega plesa — naj bo na seznamu.",
    hr: "Svaki ključni trenutak — od »da« do prvog plesa — neka bude na popisu.",
    sr: "Svaki ključni trenutak — od »da« do prvog plesa — neka bude na spisku.",
    de: "Jeder Schlüsselmoment — vom Ja-Wort bis zum ersten Tanz — gehört auf die Liste.",
    en: "Every key moment — from the vows to the first dance — belongs on the list.",
    es: "Cada momento clave — del sí al primer baile — debe estar en la lista.",
  },

  // guests-forget
  altForget1: {
    sl: "Gostje za poročno mizo s telefoni v rokah",
    hr: "Gosti za stolom na vjenčanju s mobitelima u rukama",
    sr: "Gosti za stolom na venčanju sa telefonima u rukama",
    de: "Hochzeitsgäste am Tisch mit Smartphones in der Hand",
    en: "Wedding guests at the reception table with phones in hand",
    es: "Invitados de boda en la mesa del banquete con sus móviles",
  },
  captionForget1: {
    sl: "Gostje fotografirajo — a 95 % posnetkov ostane na njihovih telefonih.",
    hr: "Gosti fotografiraju — ali 95 % snimki ostane na njihovim mobitelima.",
    sr: "Gosti fotografišu — ali 95 % snimaka ostane na njihovim telefonima.",
    de: "Gäste fotografieren — aber 95 % der Aufnahmen bleiben auf ihren Smartphones.",
    en: "Guests are taking photos — but 95% of those shots stay on their phones.",
    es: "Los invitados toman fotos — pero el 95 % se queda en sus teléfonos.",
  },
  altForget2: {
    sl: "Iskren trenutek smeha med poročno pojedino",
    hr: "Iskren trenutak smijeha tijekom vjenčane večere",
    sr: "Iskren trenutak smeha tokom venčane večere",
    de: "Ein ehrlicher Moment Lachen während des Hochzeitsempfangs",
    en: "A candid moment of laughter during the wedding reception",
    es: "Un momento espontáneo de risas durante el banquete de boda",
  },
  captionForget2: {
    sl: "Najboljši kadri so vedno iskreni — in skoraj vedno na gostovem telefonu.",
    hr: "Najbolji kadrovi su uvijek iskreni — i gotovo uvijek na mobitelu gosta.",
    sr: "Najbolji kadrovi su uvek iskreni — i gotovo uvek na telefonu gosta.",
    de: "Die besten Aufnahmen sind immer ehrlich — und fast immer auf dem Smartphone eines Gastes.",
    en: "The best shots are always candid — and almost always on a guest's phone.",
    es: "Las mejores fotos son siempre espontáneas — y casi siempre en el móvil de un invitado.",
  },

  // vs-whatsapp
  altVs1: {
    sl: "Pametni telefon z aplikacijo za sporočila na poročni mizi",
    hr: "Pametni telefon s aplikacijom za poruke na svadbenom stolu",
    sr: "Pametni telefon sa aplikacijom za poruke na svadbenom stolu",
    de: "Smartphone mit Messaging-App auf einem Hochzeitstisch",
    en: "Smartphone with a messaging app on a wedding table",
    es: "Smartphone con app de mensajería sobre una mesa de boda",
  },
  captionVs1: {
    sl: "WhatsApp stisne fotografije do 70 %. Guestcam ohrani polno kakovost.",
    hr: "WhatsApp komprimira fotografije i do 70 %. Guestcam čuva punu kvalitetu.",
    sr: "WhatsApp komprimuje fotografije i do 70 %. Guestcam čuva pun kvalitet.",
    de: "WhatsApp komprimiert Fotos um bis zu 70 %. Guestcam bewahrt die volle Qualität.",
    en: "WhatsApp compresses photos by up to 70%. Guestcam preserves full quality.",
    es: "WhatsApp comprime las fotos hasta un 70 %. Guestcam preserva la calidad completa.",
  },
  altVs2: {
    sl: "Skupinska fotografija svatov med poročno slovesnostjo",
    hr: "Skupna fotografija svadbenih gostiju tijekom vjenčanja",
    sr: "Grupna fotografija svatova tokom venčanja",
    de: "Gruppenfoto der Hochzeitsgäste während der Feier",
    en: "Group photo of wedding guests during the celebration",
    es: "Foto de grupo de los invitados durante la celebración de la boda",
  },
  captionVs2: {
    sl: "Ena galerija, vsi gostje, polna ločljivost — namesto razpršenih skupinskih klepetov.",
    hr: "Jedna galerija, svi gosti, puna rezolucija — umjesto razasutih grupnih chatova.",
    sr: "Jedna galerija, svi gosti, puna rezolucija — umesto razbacanih grupnih chatova.",
    de: "Eine Galerie, alle Gäste, volle Auflösung — statt verstreuter Gruppenchats.",
    en: "One gallery, every guest, full resolution — instead of scattered group chats.",
    es: "Una sola galería, todos los invitados, resolución completa — en vez de chats dispersos.",
  },
};

const PHOTOGRAPHER_CREDIT = "Foto: Unsplash";

// ─── Worker ─────────────────────────────────────────────────────────────────

async function processPost(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const post = JSON.parse(raw);
  const { translationKey, lang, content } = post;

  // Idempotent: if any image block already exists, skip.
  if (Array.isArray(content) && content.some((b) => b?.type === "image")) {
    return { file: filePath, status: "skipped (already has images)" };
  }
  const recipe = IMAGES_BY_KEY[translationKey];
  if (!recipe) {
    return { file: filePath, status: `no recipe for translationKey '${translationKey}'` };
  }

  // Build the two image blocks for this language.
  const [img1Recipe, img2Recipe] = recipe;
  const block1 = {
    type: "image",
    src: UNSPLASH(img1Recipe.id),
    alt: COPY[img1Recipe.altKey][lang],
    caption: COPY[img1Recipe.captionKey][lang],
    credit: PHOTOGRAPHER_CREDIT,
  };
  const block2 = {
    type: "image",
    src: UNSPLASH(img2Recipe.id),
    alt: COPY[img2Recipe.altKey][lang],
    caption: COPY[img2Recipe.captionKey][lang],
    credit: PHOTOGRAPHER_CREDIT,
  };

  // Insert positions: pick the first h2 boundary and a later one.
  // Fallback to indices 3 and 7 if structure is unusual.
  const h2Indices = content.flatMap((b, i) => (b?.type === "h2" ? [i] : []));
  let pos1, pos2;
  if (h2Indices.length >= 3) {
    // Right before the 2nd h2, and right before the 3rd h2.
    pos1 = h2Indices[1];
    pos2 = h2Indices[2];
  } else if (h2Indices.length === 2) {
    pos1 = h2Indices[1];
    pos2 = Math.min(content.length, pos1 + 4);
  } else {
    pos1 = Math.min(3, content.length);
    pos2 = Math.min(7, content.length);
  }

  // Insert in reverse so the second insertion doesn't shift the first.
  const out = [...content];
  out.splice(pos2, 0, block2);
  out.splice(pos1, 0, block1);

  post.content = out;
  post.updatedAt = new Date().toISOString().slice(0, 10); // bump for sitemap

  await fs.writeFile(filePath, JSON.stringify(post, null, 2) + "\n", "utf8");
  return { file: filePath, status: "added 2 images" };
}

async function main() {
  let total = 0;
  let added = 0;
  for (const lang of LANGS) {
    const dir = path.join(BLOG_DIR, lang);
    let files;
    try {
      files = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      total++;
      const res = await processPost(path.join(dir, f));
      if (res.status.startsWith("added")) added++;
      console.log(`${lang}/${f.padEnd(50)} ${res.status}`);
    }
  }
  console.log(`\nDone — ${added}/${total} posts updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
