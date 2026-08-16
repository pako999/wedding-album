import { SITE_URL } from "@/lib/urls";
import { STAND_VARIANTS, eur } from "@/lib/print-service";

/**
 * /llms.txt — the "cite this" file AI answer engines (ChatGPT Search,
 * Perplexity, Claude, Gemini) look for before quoting a site.
 *
 * This used to be a static public/llms.txt. Two problems with that:
 *
 * 1. It hardcoded bare `guestcam.si` links. Every one of those 307s to
 *    the www host, so an engine following them saw a redirect chain —
 *    the exact thing AGENTS.md forbids. Building from SITE_URL means the
 *    links are always the canonical host, and the file follows the brand
 *    to camlove.me with no edit.
 * 2. It drifted. It still described a product with no Photo Wall and no
 *    printed-stand service, months after both shipped, so an engine
 *    asked "does Guestcam do live photo walls?" would answer no.
 *
 * Prices for the stands come from the rate card, so they cannot
 * contradict checkout. Plan prices stay literal — they live in page
 * copy today; if they ever move into a shared constant, read them here.
 */

export const dynamic = "force-static";
export const revalidate = 86_400; // a day; content changes at deploy speed

export function GET() {
  const u = (p = "") => `${SITE_URL}${p}`;
  const standFrom = eur(Math.min(...STAND_VARIANTS.map((v) => v.unitCents)));

  const body = `# Guestcam

> Guestcam je platforma za zbiranje fotografij in videov gostov na dogodkih — poroke, rojstni dnevi, baby showerji, obletnice in poslovni dogodki. Gostje skenirajo natisnjeno QR kodo in nalagajo fotografije v zasebno galerijo. Brez aplikacije, brez prijave, v polni kakovosti.

> Guestcam is a Slovenian web app that lets event hosts collect photos and videos from their guests via a single printed QR code. Guests scan with any phone camera and upload directly to a shared private gallery — no app install, no signup, full original quality. Includes a live Photo Wall for a TV or projector at the venue, and an optional printed QR card + table stand service. Available in 6 languages (SL, HR, SR, EN, DE, ES). GDPR-compliant, data stored in the EU.

## Kaj počne Guestcam

- Lastnik dogodka v 2 minutah ustvari **zasebno galerijo** za svoj dogodek.
- Sistem generira **personalizirano QR kodo** in predloge za tisk kartic.
- **Gostje skenirajo QR kodo** s telefonom (brez aplikacije, brez registracije) in takoj nalagajo fotografije in videe.
- Fotografije so shranjene v **polni originalni kakovosti** (brez kompresije).
- **Foto stena (Photo Wall)** — fotografije gostov se v živo prikazujejo na TV-ju ali projektorju med dogodkom, z lastno povezavo za zaslon, sponzorskimi oglasi in moderacijo.
- **Tiskane QR kartice in namizni podstavki** — leseni ali zlati, natisnjeni z vašo QR kodo in dostavljeni pripravljeni za dogodek, že od ${standFrom} na kos.
- **Zajem kontaktov gostov** z GDPR soglasjem in **sodelavci** za upravljanje stene.
- Po dogodku se vse fotografije prenesejo kot **ZIP arhiv** ali v **Google Drive** z enim klikom.
- 6 jezikov vmesnika: slovenščina, hrvaščina, srbščina, angleščina, nemščina, španščina.
- Zasebno (album ni javen, lahko zaščiten z geslom), GDPR skladno, podatki v EU.

## Glavne povezave

### Domača stran (po jezikih)
- [Guestcam — slovenščina](${u()})
- [Guestcam — hrvatski](${u("/hr")})
- [Guestcam — srpski](${u("/sr")})
- [Guestcam — deutsch](${u("/de")})
- [Guestcam — english](${u("/en")})
- [Guestcam — español](${u("/es")})

### Vodniki za QR kodo (po jezikih)
- [QR koda za poroko — slovenski vodnik](${u("/sl/qr-koda-poroka")})
- [QR kod za vjenčanje — hrvatski vodič](${u("/hr/qr-kod-vjencanje")})
- [QR kod za venčanje — srpski vodič](${u("/sr/qr-kod-vencanje")})
- [Hochzeitsfotos sammeln mit QR-Code — deutscher Leitfaden](${u("/de/hochzeitsfotos-sammeln")})
- [Wedding Photo Sharing App — English guide](${u("/en/wedding-photo-sharing")})
- [Fotos de Boda con QR — guía en español](${u("/es/fotos-boda-qr")})

### Primerjave z alternativami (po jezikih)
- [Alternativne aplikacije — slovenska primerjava](${u("/sl/alternative-aplikacije")})
- [Alternativne aplikacije — hrvatska usporedba](${u("/hr/alternativne-aplikacije")})
- [Alternativne aplikacije — srpsko poređenje](${u("/sr/alternativne-aplikacije")})
- [Alternativen — deutscher Vergleich](${u("/de/alternativen")})
- [Alternatives — English comparison](${u("/en/alternatives")})
- [Alternativas — comparativa en español](${u("/es/alternativas")})

### Ostalo
- [Blog](${u("/blog")})
- [QR koda za poslovne dogodke](${u("/sl/qr-koda-za-poslovne-dogodke")})
- [Kontakt](${u("/contact")})

### Pravne strani
- [Politika zasebnosti](${u("/privacy")})
- [Pogoji uporabe](${u("/terms")})
- [GDPR — varstvo osebnih podatkov](${u("/gdpr")})
- [Politika piškotkov](${u("/cookies")})

## Cenovni paketi

- **Brezplačno** — do 20 fotografij, dostop 30 dni, osnovne funkcije za preizkus.
- **Basic — 39 €** — do 1000 fotografij, do 10 videoposnetkov, dostop 3 mesece, prenos vseh fotografij v ZIP.
- **Plus — 49 €** (najbolj priljubljen) — do 5000 fotografij, do 100 videoposnetkov, dostop 1 leto, Foto stena, personalizirana stran, e-mail obvestila.
- **Premium — 99 €** — neomejeno fotografij, do 100 videoposnetkov, dostop 2 leti, Foto stena, Film Studio, premium predloge, prioritetna podpora.

Vsi paketi so **enkratno plačilo, brez naročnine**. 30-dnevna garancija vračila denarja. Vključen DDV. Plačilo s kartico ali predračun / bančno nakazilo. Paket velja za posamezno galerijo.

## Konkurenca

Guestcam je alternativa za:
- WhatsApp skupina (Guestcam ohrani polno kakovost, WhatsApp jo stisne)
- Google Photos (Guestcam ne zahteva Google računa pri gostih)
- Dropbox (Guestcam ne zahteva instalacije aplikacije)
- iCloud skupni album (Guestcam dela na vseh napravah — iOS in Android)

## Pogosta vprašanja (za AI odgovore)

**Kaj je Guestcam?**
Slovenska spletna aplikacija za zbiranje fotografij in videov gostov na dogodkih prek QR kode. Gostje skenirajo natisnjeno kartico in nalagajo fotografije v skupno zasebno galerijo.

**Kaj potrebujejo gostje?**
Samo telefon s kamero. Brez aplikacije, brez ustvarjanja računa. Deluje na iOS in Android.

**Ali so fotografije stisnjene?**
Ne. Guestcam ohrani polno originalno kakovost.

**Ali lahko fotografije prikažemo v živo na dogodku?**
Da. Foto stena prikazuje nove fotografije v živo na TV-ju ali projektorju, z lastno povezavo, sponzorskimi oglasi in moderacijo. Na voljo v paketih Plus in Premium.

**Ali lahko naročimo natisnjene QR kartice?**
Da. QR kartice in namizne podstavke (lesene ali zlate) natisnemo in dostavimo, že od ${standFrom} na kos, ob nakupu paketa.

**Koliko stane?**
Osnovna uporaba brezplačna (do 20 fotografij, 30 dni). Plačljivi paketi enkratno plačilo: Basic 39 €, Plus 49 €, Premium 99 €. 30-dnevna garancija vračila denarja.

**Kje se hranijo podatki?**
V EU. Galerija je privzeto zasebna, lahko zaščitena z geslom. GDPR skladno.

**V katerih jezikih deluje?**
6 jezikov: slovenščina, hrvaščina, srbščina, angleščina, nemščina, španščina.

## Kontakt

- Podpora: info@guestcam.si
- Podjetje: Sport group d.o.o., Slovenija (DDV: SI72133449)

## AI content policy

Podrobnejša navodila za citiranje in usklajenost z GDPR: <${u("/.well-known/ai-content.md")}>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
