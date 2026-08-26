import type { Lang } from "./translations";

/** Copy for the "finish or upgrade your active Free event" screen shown at
 * /dashboard/new. Every paid package is attached to one event; after that
 * event is paid, the owner may create another event with its own package. */
export interface GalleryLimitCopy {
  back: string;
  title: string;
  body: string;
  cta: string;
}

export const GALLERY_LIMIT_COPY: Record<Lang, GalleryLimitCopy> = {
  sl: {
    back: "Nazaj na nadzorno ploščo",
    title: "Free paket vključuje 1 dogodek",
    body: "Trenutno že imate aktiven brezplačni dogodek. Najprej nadgradite ta dogodek; vsak Basic, Plus ali Premium paket velja za en dogodek. Nato lahko ustvarite nov dogodek z novim paketom.",
    cta: "Nadgradi ta dogodek →",
  },
  hr: {
    back: "Natrag na nadzornu ploču",
    title: "Free paket uključuje 1 događaj",
    body: "Već imate aktivan besplatni događaj. Najprije nadogradite taj događaj; svaki Basic, Plus ili Premium paket vrijedi za jedan događaj. Nakon toga možete kreirati novi događaj s novim paketom.",
    cta: "Nadogradi ovaj događaj →",
  },
  sr: {
    back: "Nazad na kontrolnu tablu",
    title: "Free paket uključuje 1 događaj",
    body: "Već imate aktivan besplatan događaj. Najpre nadogradite taj događaj; svaki Basic, Plus ili Premium paket važi za jedan događaj. Zatim možete napraviti novi događaj sa novim paketom.",
    cta: "Nadogradi ovaj događaj →",
  },
  de: {
    back: "Zurück zur Übersicht",
    title: "Free enthält 1 Event",
    body: "Sie haben bereits ein aktives kostenloses Event. Upgraden Sie zuerst dieses Event; jedes Basic-, Plus- oder Premium-Paket gilt für genau ein Event. Danach können Sie ein neues Event mit einem neuen Paket erstellen.",
    cta: "Dieses Event upgraden →",
  },
  en: {
    back: "Back to dashboard",
    title: "Free includes 1 event",
    body: "You already have an active Free event. Upgrade that event first; each Basic, Plus or Premium package is valid for one event. You can then create another event with its own package.",
    cta: "Upgrade this event →",
  },
  es: {
    back: "Volver al panel",
    title: "Free incluye 1 evento",
    body: "Ya tienes un evento gratuito activo. Primero actualiza ese evento; cada paquete Basic, Plus o Premium es válido para un solo evento. Después podrás crear otro evento con su propio paquete.",
    cta: "Actualizar este evento →",
  },
};
