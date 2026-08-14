import type { Lang } from "./translations";

/** Copy for the "upgrade to create another gallery" screen shown at
 *  /dashboard/new when a Free/Basic account already owns a gallery.
 *  Kept in its own file for the same reason as upgrade-translations.ts —
 *  only that one route needs it. */
export interface GalleryLimitCopy {
  back: string;
  title: string;
  body: string;
  cta: string;
}

export const GALLERY_LIMIT_COPY: Record<Lang, GalleryLimitCopy> = {
  sl: {
    back: "Nazaj na nadzorno ploščo",
    title: "Za več galerij nadgradite paket",
    body: "Brezplačni in Basic paket omogočata eno galerijo na račun. Za dodatne galerije nadgradite obstoječo galerijo na paket Plus ali Premium — nato lahko ustvarite neomejeno novih galerij.",
    cta: "Nadgradi paket →",
  },
  hr: {
    back: "Natrag na nadzornu ploču",
    title: "Za više galerija nadogradite paket",
    body: "Besplatni i Basic paket omogućuju jednu galeriju po računu. Za dodatne galerije nadogradite postojeću galeriju na paket Plus ili Premium — zatim možete kreirati neograničen broj novih galerija.",
    cta: "Nadogradi paket →",
  },
  sr: {
    back: "Nazad na kontrolnu tablu",
    title: "Za više galerija nadogradite paket",
    body: "Besplatni i Basic paket omogućavaju jednu galeriju po nalogu. Za dodatne galerije nadogradite postojeću galeriju na paket Plus ili Premium — zatim možete kreirati neograničen broj novih galerija.",
    cta: "Nadogradi paket →",
  },
  de: {
    back: "Zurück zur Übersicht",
    title: "Für weitere Galerien Paket upgraden",
    body: "Das kostenlose und das Basic-Paket erlauben eine Galerie pro Konto. Für weitere Galerien upgraden Sie eine bestehende Galerie auf Plus oder Premium — danach können Sie unbegrenzt neue Galerien erstellen.",
    cta: "Paket upgraden →",
  },
  en: {
    back: "Back to dashboard",
    title: "Upgrade your plan for more galleries",
    body: "The Free and Basic plans allow one gallery per account. To create more, upgrade an existing gallery to Plus or Premium — then you can create unlimited new galleries.",
    cta: "Upgrade plan →",
  },
  es: {
    back: "Volver al panel",
    title: "Actualiza tu plan para más galerías",
    body: "Los planes Gratis y Basic permiten una galería por cuenta. Para crear más, actualiza una galería existente a Plus o Premium — después podrás crear galerías nuevas sin límite.",
    cta: "Actualizar plan →",
  },
};
