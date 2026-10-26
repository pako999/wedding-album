import type { Lang } from './i18n/translations';
import { WEDDING_OFFER_CAPACITY, WEDDING_OFFER_BATCH_SIZE, PREMIUM_REGULAR_PRICE_EUR, PREMIUM_SALE_PRICE_EUR, PREMIUM_SALE_PERCENT } from './plan-pricing';
export const OFFER_COPY: Record<Lang, { launch: string; available: string; terms: string; pending: string; changed: string; standard: string }> = {
  sl: { launch: 'Posebna ponudba: 40 % popusta', available: `Na voljo še {n} od ${WEDDING_OFFER_CAPACITY} paketov`, terms: `Akcija obsega največ ${WEDDING_OFFER_CAPACITY} paketov; trenutna serija ima ${WEDDING_OFFER_BATCH_SIZE} mest. En paket na račun. Paketi v postopku plačila so rezervirani. Po zapolnitvi: ${PREMIUM_REGULAR_PRICE_EUR} €.`, pending: 'Za ta račun že poteka plačilo po ponudbi. Dokončaj obstoječe plačilo ali počakaj na potrjen preklic.', changed: 'Razpoložljivost ali cena se je spremenila. Preveri osveženo ceno in poskusi znova.', standard: 'Redna cena paketa' },
  hr: { launch: 'Uvodna ponuda −40 %', available: `Dostupno još {n} od ${WEDDING_OFFER_CAPACITY} paketa`, terms: `Akcija obuhvaća najviše ${WEDDING_OFFER_CAPACITY} paketa; u ovoj je seriji otvoreno ${WEDDING_OFFER_BATCH_SIZE} mjesta. Jedan paket po računu. Plaćanja u tijeku rezerviraju paket. Nakon isteka: ${PREMIUM_REGULAR_PRICE_EUR} €.`, pending: 'Za ovaj račun već je pokrenuto plaćanje po ponudi. Dovrši ga ili pričekaj potvrđeno otkazivanje.', changed: 'Dostupnost ili cijena se promijenila. Provjeri osvježenu cijenu i pokušaj ponovno.', standard: 'Redovna cijena paketa' },
  sr: { launch: 'Uvodna ponuda −40 %', available: `Dostupno još {n} od ${WEDDING_OFFER_CAPACITY} paketa`, terms: `Akcija obuhvata najviše ${WEDDING_OFFER_CAPACITY} paketa; u ovoj seriji je otvoreno ${WEDDING_OFFER_BATCH_SIZE} mesta. Jedan paket po nalogu. Plaćanja u toku rezervišu paket. Nakon popune: ${PREMIUM_REGULAR_PRICE_EUR} €.`, pending: 'Za ovaj nalog već je pokrenuto plaćanje po ponudi. Dovrši ga ili sačekaj potvrđeno otkazivanje.', changed: 'Dostupnost ili cena se promenila. Proveri osveženu cenu i pokušaj ponovo.', standard: 'Redovna cena paketa' },
  en: { launch: 'Launch offer · 40% off', available: `{n} of ${WEDDING_OFFER_CAPACITY} discounted packages available`, terms: `Up to ${WEDDING_OFFER_CAPACITY} packages in this campaign; ${WEDDING_OFFER_BATCH_SIZE} places released in the current batch. One package per account. Checkouts in progress reserve a place. Then €${PREMIUM_REGULAR_PRICE_EUR}.`, pending: 'This account already has an offer payment in progress. Complete that payment or wait for its confirmed cancellation.', changed: 'Availability or pricing changed. Review the refreshed price and try again.', standard: 'Standard package price' },
  de: { launch: 'Einführungsangebot · 40 % Rabatt', available: `Noch {n} von ${WEDDING_OFFER_CAPACITY} Angebotspaketen verfügbar`, terms: `Die Aktion umfasst höchstens ${WEDDING_OFFER_CAPACITY} Pakete; im aktuellen Kontingent sind ${WEDDING_OFFER_BATCH_SIZE} Plätze freigegeben. Ein Paket pro Konto. Laufende Zahlungen reservieren einen Platz. Danach ${PREMIUM_REGULAR_PRICE_EUR} €.`, pending: 'Für dieses Konto läuft bereits eine Angebotszahlung. Schließe sie ab oder warte auf die bestätigte Stornierung.', changed: 'Verfügbarkeit oder Preis hat sich geändert. Prüfe den aktualisierten Preis und versuche es erneut.', standard: 'Regulärer Paketpreis' },
  es: { launch: 'Oferta de lanzamiento · 40 % menos', available: `Quedan {n} de ${WEDDING_OFFER_CAPACITY} paquetes en oferta`, terms: `La campaña incluye hasta ${WEDDING_OFFER_CAPACITY} paquetes; hay ${WEDDING_OFFER_BATCH_SIZE} plazas liberadas en esta tanda. Un paquete por cuenta. Los pagos en curso reservan una plaza. Después, ${PREMIUM_REGULAR_PRICE_EUR} €.`, pending: 'Esta cuenta ya tiene un pago de la oferta en curso. Complétalo o espera a su cancelación confirmada.', changed: 'La disponibilidad o el precio ha cambiado. Revisa el precio actualizado e inténtalo de nuevo.', standard: 'Precio habitual del paquete' },
};

/** Safe for static FAQs and articles: never promises an unverified sale price. */
export function weddingPriceSummary(lang: Lang): string {
  const money = (value: number) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(value);
  const regular = money(PREMIUM_REGULAR_PRICE_EUR), sale = money(PREMIUM_SALE_PRICE_EUR);
  return {
    sl: `Redna cena Poročnega paketa Premium je ${regular}. Ob aktivni ponudbi in preverjeni razpoložljivosti velja ${PREMIUM_SALE_PERCENT} % popusta: ${sale}. Trenutno razpoložljivost in končno ceno preverita pred plačilom.`,
    hr: `Redovna cijena Vjenčanog premium paketa je ${regular}. Uz aktivnu ponudu i potvrđenu dostupnost vrijedi ${PREMIUM_SALE_PERCENT} % popusta: ${sale}. Prije plaćanja provjerite dostupnost i konačnu cijenu.`,
    sr: `Redovna cena Venčanog premium paketa je ${regular}. Uz aktivnu ponudu i potvrđenu dostupnost važi ${PREMIUM_SALE_PERCENT} % popusta: ${sale}. Pre plaćanja proverite dostupnost i konačnu cenu.`,
    en: `Wedding Premium normally costs ${regular}. When the offer is active and availability is verified, ${PREMIUM_SALE_PERCENT}% off brings it to ${sale}. Check current availability and the final price before paying.`,
    de: `Der reguläre Preis für Hochzeits-Premium beträgt ${regular}. Bei aktiver Aktion und bestätigter Verfügbarkeit gelten ${PREMIUM_SALE_PERCENT} % Rabatt: ${sale}. Prüft vor der Zahlung die aktuelle Verfügbarkeit und den Endpreis.`,
    es: `El precio habitual de Premium para bodas es ${regular}. Con la oferta activa y disponibilidad verificada se aplica un ${PREMIUM_SALE_PERCENT} % de descuento: ${sale}. Comprobad la disponibilidad y el precio final antes de pagar.`,
  }[lang];
}

export function weddingPricingFaq(lang: Lang): [string, string] {
  const question: Record<Lang, string> = {
    sl: 'Koliko stane Poročni paket Premium in kako velja popust?',
    hr: 'Koliko košta Vjenčani premium paket i kako vrijedi popust?',
    sr: 'Koliko košta Venčani premium paket i kako važi popust?',
    en: 'How much does Wedding Premium cost and when does the discount apply?',
    de: 'Was kostet Hochzeits-Premium und wann gilt der Rabatt?',
    es: '¿Cuánto cuesta Premium para bodas y cuándo se aplica el descuento?',
  };
  return [question[lang], `${weddingPriceSummary(lang)} ${OFFER_COPY[lang].terms}`];
}
