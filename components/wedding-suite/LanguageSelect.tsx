'use client';
import { SUITE_LANGS, type SuiteLang } from '@/lib/wedding-suite/contracts';
import { LANGUAGE_NAMES } from '@/lib/wedding-suite/copy';
export function LanguageSelect({ label, value, onChange }: { label: string; value: SuiteLang; onChange: (value: SuiteLang) => void }) {
 return <label className="block text-sm font-medium">{label}<select aria-label={label} className="mt-1 min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900" value={value} onChange={e => onChange(e.target.value as SuiteLang)}>
  {SUITE_LANGS.map(code => <option value={code} key={code}>{LANGUAGE_NAMES[code]}</option>)}
 </select></label>;
}
