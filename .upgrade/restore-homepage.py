"""Restore the verified original homepages, changing only Premium pricing."""
from pathlib import Path
import hashlib
import subprocess

BASE = 'd74edbc224e193f5beb8d7057f35c0248f1d904f'
EXPECTED = {
 'components/GuestcamHomePage.tsx': '86f77a881ab780f36bca336f1181577e0e45a0cf78c8c6e73015413bbee9cc77',
 'components/LocalizedGuestcamHomePageV3.tsx': '8933f6b69f977c97fab7713642875588289e54683c9d03a8c42248614837715e',
 'scripts/regression-check.mjs': 'd61347c2bcea190ecde2fcf70c3bae4f6c0e9bce0d7796c942b510bdf49572cf',
 'docs/wedding-premium-20260926.md': '9ceb0ff491d4572af8808355bd9b4fd97d8cf16154f2ca3ee96b28ef5357e0e0',
}
for name, sha in EXPECTED.items():
 assert hashlib.sha256(Path(name).read_bytes()).hexdigest() == sha, f'Source changed: {name}'
def original(name):
 return subprocess.check_output(['git', 'show', f'{BASE}:{name}'], text=True)
def once(text, before, after):
 assert text.count(before) == 1, f'Expected one occurrence: {before}'
 return text.replace(before, after, 1)
def parts(text):
 a = text.index('<section id="pricing"'); b = text.index('</section>', a) + len('</section>')
 return text[:a], text[a:b], text[b:]
outputs = {}
for name in list(EXPECTED)[:2]:
 baseline = original(name); prefix, pricing, suffix = parts(baseline)
 if name.endswith('/GuestcamHomePage.tsx'):
  imports = 'import { weddingCopy } from "@/lib/wedding/copy";\n'
  pricing = once(pricing, '{name}</p>', '{name === "Premium" ? weddingCopy("sl").plan : name}</p>')
  pricing = once(pricing, '{features.map(f =>', '{[...features, ...(name === "Premium" ? [weddingCopy("sl").schedule, weddingCopy("sl").menu, weddingCopy("sl").songs, weddingCopy("sl").bingo] : [])].map(f =>')
  pricing = once(pricing, '</ul><Link href="/dashboard/new"', '</ul>{name === "Premium" && <Link href="/porocni-paket" className="mt-5 text-sm font-bold underline underline-offset-4">{weddingCopy("sl").nav} →</Link>}<Link href={name === "Premium" ? "/dashboard/new?plan=premium" : "/dashboard/new"}')
  pricing = once(pricing, 'Izberi {name}</Link>', 'Izberi {name === "Premium" ? weddingCopy("sl").plan : name}</Link>')
 else:
  imports = 'import { weddingCopy } from "@/lib/wedding/copy";\nimport { WEDDING_PATHS } from "@/lib/wedding/contracts";\n'
  pricing = once(pricing, '{plan.name}</p>', '{plan.name === "Premium" ? weddingCopy(lang).plan : plan.name}</p>')
  pricing = once(pricing, '{plan.features.map((feature) =>', '{[...plan.features, ...(plan.name === "Premium" ? [weddingCopy(lang).schedule, weddingCopy(lang).menu, weddingCopy(lang).songs, weddingCopy(lang).bingo] : [])].map((feature) =>')
  pricing = once(pricing, '</ul>\n              <Link', '</ul>\n              {plan.name === "Premium" && <Link href={localePublicPath(lang, WEDDING_PATHS[lang])} className="mt-5 text-sm font-bold underline underline-offset-4">{weddingCopy(lang).nav} →</Link>}\n              <Link')
  pricing = once(pricing, '{plan.cta}</Link>', '{plan.name === "Premium" ? weddingCopy(lang).choose : plan.cta}</Link>')
 result = imports + prefix + pricing + suffix
 before, _, after = parts(result[len(imports):])
 assert before == prefix and after == suffix
 assert 'HomeWeddingHero' not in result
 outputs[name] = result
 print(f'PASS scope: {name}: original layout preserved exactly outside pricing.')
name = 'scripts/regression-check.mjs'
text = Path(name).read_text()
old = '''requireMatch(
  "homepage uses the responsive video-led hero",
  files.homeComponent,
  /<HomeWeddingHero[\\s\\S]*?<section className="border-y border-black\\/10 bg-white"/,
  "the responsive video must remain in the React hero, without DOM reparenting",
);'''
base = original(name); start = base.index('requireMatch(\n  "homepage video is rendered directly after the hero"'); end = base.index('\n);', start) + 3
outputs[name] = once(text, old, base[start:end])
name = 'docs/wedding-premium-20260926.md'
outputs[name] = once(Path(name).read_text(), "Homepage video uses GuestCam's existing footage, not Mexico branding. Desktop/mobile clips are served from public/promo with no preload. The footage itself is Slovenian; each language labels that fact explicitly. UI/control/marketing copy is localized.", "The homepage retains its original hero, images, text, calls to action, navigation and video placement in all six languages. Only the Premium pricing card is updated: localized wedding name, schedule/menu/song requests/photo bingo and a link to the separate wedding-package page. The new wedding page and private wedding features remain separate from the homepage layout.")
for name, text in outputs.items(): Path(name).write_text(text)
print('PASS: original video-placement regression restored; wedding schema and gallery features untouched.')
