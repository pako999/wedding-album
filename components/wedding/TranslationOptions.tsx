'use client';
import type { Lang } from '@/lib/i18n/translations';
import { LANGS } from '@/lib/i18n/translations';

export const TRANSLATION_COPY: Record<Lang, { language: string; auto: string; hint: string; warning: string }> = {
  sl: { language: 'Jezik besedila', auto: 'Ob shranjevanju prevedi manjkajoča besedila v vseh šest jezikov', hint: 'Izberi jezik in popravi besedilo. Obstoječi prevodi in tvoji popravki ostanejo ohranjeni. Za nov prevod izbriši besedilo v izbranem jeziku in shrani.', warning: 'Besedilo je shranjeno, samodejni prevodi pa niso dokončani. Poskusi znova ali jih vnesi ročno.' },
  hr: { language: 'Jezik teksta', auto: 'Pri spremanju prevedi tekstove koji nedostaju na svih šest jezika', hint: 'Odaberi jezik i uredi tekst. Postojeći prijevodi i tvoje izmjene ostaju sačuvani. Za novi prijevod izbriši tekst na odabranom jeziku i spremi.', warning: 'Tekst je spremljen, ali automatski prijevodi nisu dovršeni. Pokušaj ponovno ili ih unesi ručno.' },
  sr: { language: 'Jezik teksta', auto: 'Pri čuvanju prevedi tekstove koji nedostaju na svih šest jezika', hint: 'Izaberi jezik i uredi tekst. Postojeći prevodi i tvoje izmene ostaju sačuvani. Za novi prevod obriši tekst na izabranom jeziku i sačuvaj.', warning: 'Tekst je sačuvan, ali automatski prevodi nisu završeni. Pokušaj ponovo ili ih unesi ručno.' },
  en: { language: 'Text language', auto: 'Translate missing text into all six languages when saving', hint: 'Choose a language and edit the text. Existing translations and your corrections are preserved. To generate a new translation, clear the text in that language and save.', warning: 'Your text was saved, but automatic translations could not be completed. Try again or enter them manually.' },
  de: { language: 'Textsprache', auto: 'Fehlende Texte beim Speichern in alle sechs Sprachen übersetzen', hint: 'Sprache wählen und Text bearbeiten. Bestehende Übersetzungen und Korrekturen bleiben erhalten. Für eine neue Übersetzung den Text in dieser Sprache löschen und speichern.', warning: 'Dein Text wurde gespeichert, aber die automatischen Übersetzungen wurden nicht abgeschlossen. Versuche es erneut oder trage sie manuell ein.' },
  es: { language: 'Idioma del texto', auto: 'Traducir los textos que faltan a los seis idiomas al guardar', hint: 'Elige un idioma y edita el texto. Se conservan las traducciones y tus correcciones. Para generar otra traducción, borra el texto de ese idioma y guarda.', warning: 'Tu texto se guardó, pero no se completaron las traducciones automáticas. Inténtalo de nuevo o introdúcelas manualmente.' },
};

export function TranslationOptions({ lang, editLang, onLanguage, enabled, onEnabled }: {
  lang: Lang; editLang?: Lang; onLanguage?: (lang: Lang) => void; enabled: boolean; onEnabled: (value: boolean) => void;
}) {
  const t = TRANSLATION_COPY[lang];
  return <div className="my-5 space-y-3 rounded-xl border border-stone-200 p-4">
    {onLanguage && <label className="block text-sm font-semibold">{t.language}<select aria-label={t.language} className="ml-3 min-h-11 rounded-xl border bg-white px-3" value={editLang} onChange={event => onLanguage(event.target.value as Lang)}>{LANGS.map(language => <option key={language.code} value={language.code}>{language.native}</option>)}</select></label>}
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 size-4 shrink-0" checked={enabled} onChange={event => onEnabled(event.target.checked)} />{t.auto}</label>
    <p className="text-xs leading-5 text-stone-600">{t.hint}</p>
  </div>;
}
