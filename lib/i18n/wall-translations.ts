import type { Lang } from "./translations";

/**
 * Photo Wall copy. The wall renders on a venue screen in front of every
 * guest, so it follows the album's own language (`albums.defaultLang`)
 * rather than the dashboard's Slovenian.
 */
export interface WallCopy {
  /** Empty-state headline under the couple/event name. */
  emptyPrompt: string;
  /** Text beside the corner QR code. */
  qrPrompt: string;
  /** Badge on a photo that was just uploaded. */
  justShared: string;
  /** Label marking a sponsor slide. */
  sponsor: string;
  /** Shown when the gallery is password protected and the link lacks it. */
  passwordNeeded: string;
  /** Upsell shown when the album isn't on the Premium plan. */
  premiumOnly: string;
}

export const WALL_COPY: Record<Lang, WallCopy> = {
  sl: {
    emptyPrompt: "Skenirajte in delite prve fotografije",
    qrPrompt: "Skenirajte in delite svoje fotografije!",
    justShared: "Pravkar deljeno",
    sponsor: "Sponzor",
    passwordNeeded: "Ta galerija je zaščitena z geslom. Odprite povezavo za steno neposredno iz nadzorne plošče.",
    premiumOnly: "Predogled — Foto stena je na voljo v paketu Premium",
  },
  hr: {
    emptyPrompt: "Skenirajte i podijelite prve fotografije",
    qrPrompt: "Skenirajte i podijelite svoje fotografije!",
    justShared: "Upravo podijeljeno",
    sponsor: "Sponzor",
    passwordNeeded: "Ova galerija zaštićena je lozinkom. Otvorite poveznicu za zid izravno s nadzorne ploče.",
    premiumOnly: "Pregled — Foto zid dostupan je u paketu Premium",
  },
  sr: {
    emptyPrompt: "Skenirajte i podelite prve fotografije",
    qrPrompt: "Skenirajte i podelite svoje fotografije!",
    justShared: "Upravo podeljeno",
    sponsor: "Sponzor",
    passwordNeeded: "Ova galerija je zaštićena lozinkom. Otvorite link za zid direktno sa kontrolne table.",
    premiumOnly: "Pregled — Foto zid je dostupan u paketu Premium",
  },
  de: {
    emptyPrompt: "Scannen und die ersten Fotos teilen",
    qrPrompt: "Scannen und Ihre Fotos teilen!",
    justShared: "Gerade geteilt",
    sponsor: "Sponsor",
    passwordNeeded: "Diese Galerie ist passwortgeschützt. Öffnen Sie den Wall-Link direkt aus Ihrer Übersicht.",
    premiumOnly: "Vorschau — die Foto-Wall ist im Premium-Paket enthalten",
  },
  en: {
    emptyPrompt: "Scan and share the first photos",
    qrPrompt: "Scan and share your photos!",
    justShared: "Just shared",
    sponsor: "Sponsor",
    passwordNeeded: "This gallery is password protected. Open the wall link directly from your dashboard.",
    premiumOnly: "Preview — the Photo Wall is available on the Premium plan",
  },
  es: {
    emptyPrompt: "Escanea y comparte las primeras fotos",
    qrPrompt: "¡Escanea y comparte tus fotos!",
    justShared: "Recién compartida",
    sponsor: "Patrocinador",
    passwordNeeded: "Esta galería está protegida con contraseña. Abre el enlace del muro desde tu panel.",
    premiumOnly: "Vista previa — el Muro de Fotos está disponible en el plan Premium",
  },
};
