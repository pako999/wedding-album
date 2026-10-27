'use client';
import { useEffect, useRef, useState } from 'react';
import { localized, PAGE_CATEGORIES, PAGE_FIELD_TYPES, PAGE_FONTS, type PageDesign, type PageField, type PageSection, type SuiteLang } from '@/lib/wedding-suite/contracts';
import { DEFAULT_PAGE, FONT_FAMILIES, movePageItem } from '@/lib/wedding-suite/page-design';
import { builderCopy } from '@/lib/wedding-suite/builder-copy';
import { fieldClass, secondaryClass, WeddingPanel } from '@/components/wedding/WeddingViews';
import { WeddingImageField } from './WeddingImageField';
import { imageCopy } from '@/lib/wedding-suite/image-copy';
import { WeddingPageContent } from './WeddingPageContent';
import { presentationCopy } from '@/lib/wedding-suite/presentation-copy';
import { applyPageStyle, PAGE_STYLES, starterSections, type PageStyle } from '@/lib/wedding-suite/page-templates';

export function WeddingPageBuilder({ value, lang, editLang, onChange, uploadEndpoint, onUploadBusy }: {
  value?: PageDesign; lang: SuiteLang; editLang: SuiteLang; onChange: (page: PageDesign) => void; uploadEndpoint?: string; onUploadBusy?: (busy: boolean) => void;
}) {
  const page = value ?? DEFAULT_PAGE; const t = builderCopy(lang); const p = presentationCopy(lang);
  const previewRef = useRef<HTMLElement>(null); const editorRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { previewScrollRef.current?.scrollTo(0, 0); }, [page.coverImageUrl]);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [category, setCategory] = useState<PageSection['category']>('ceremony');
  const [sectionId, setSectionId] = useState('');
  const [fieldType, setFieldType] = useState<PageField['type']>('text');
  const drag = useRef<{ section: string; field: string } | null>(null);
  const section = page.sections.find(item => item.id === sectionId) ?? page.sections[0];
  function updateSection(next: PageSection) { onChange({ ...page, sections: page.sections.map(item => item.id === next.id ? next : item) }); }
  function updateField(id: string, patch: Partial<PageField>) {
    if (section) updateSection({ ...section, fields: section.fields.map(field => field.id === id ? { ...field, ...patch } : field) });
  }
  function addCategory() {
    if (page.sections.length >= 12) return;
    const next: PageSection = { id: crypto.randomUUID(), category, visible: true, fields: [],
      title: { [editLang]: builderCopy(editLang)[category] },
    };
    onChange({ ...page, sections: [...page.sections, next] }); setSectionId(next.id);
  }
  function addField() {
    if (!section || section.fields.length >= 12) return;
    updateSection({ ...section, fields: [...section.fields, { id: crypto.randomUUID(), type: fieldType, text: {}, ...(['link', 'image'].includes(fieldType) ? { url: '' } : {}) }] });
  }
  function reorder(id: string, destination: number) {
    if (section) updateSection({ ...section, fields: movePageItem(section.fields, id, destination) });
  }
  return <WeddingPanel title={t.editor}>
    <div ref={editorRef} data-wedding-builder className="min-w-0 scroll-mt-32 space-y-6">
      <p className="max-w-2xl text-sm leading-6 text-stone-600">{p.editorHint}</p>
      <button type="button" className={`${secondaryClass} xl:hidden`} onClick={() => previewRef.current?.scrollIntoView({ block: 'start' })}>{t.preview} ↓</button>
      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <div className="space-y-3"><h3 className="text-sm font-semibold">{p.templates}</h3><div className="grid grid-cols-3 gap-3">{(Object.keys(PAGE_STYLES) as PageStyle[]).map(style => <button key={style} type="button" className="min-w-0 overflow-hidden rounded-xl border border-stone-300 bg-white text-left transition hover:border-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700" onClick={() => { onChange(applyPageStyle(page, style)); previewScrollRef.current?.scrollTo(0, 0); }}>
            <img src={PAGE_STYLES[style].image} alt="" width={320} height={240} loading="lazy" className="aspect-[4/3] w-full object-cover" /><span className="block px-2 py-3 text-xs font-semibold leading-5 [overflow-wrap:anywhere]">{p[style]}</span>
          </button>)}</div></div>
          <label className="block text-sm font-semibold">{t.pageTitle}<input className={fieldClass} maxLength={180} value={page.title[editLang] ?? ''} onChange={event => onChange({ ...page, title: { ...page.title, [editLang]: event.target.value } })} /></label>
          <label className="block text-sm">{p.subtitle}<input className={fieldClass} maxLength={180} value={page.subtitle?.[editLang] ?? ''} onChange={event => onChange({ ...page, subtitle: { ...page.subtitle, [editLang]: event.target.value } })} /></label>
          <details className="rounded-xl border border-stone-200 p-4"><summary className="cursor-pointer text-sm font-semibold">{p.cover}</summary><div className="mt-4"><WeddingImageField value={page.coverImageUrl || ''} lang={lang} label={p.cover} uploadEndpoint={uploadEndpoint} onUploadBusy={onUploadBusy} onChange={url => onChange({ ...page, coverImageUrl: url })} />{!uploadEndpoint && <p className="mt-2 text-xs leading-5 text-stone-600">{p.coverHint}</p>}</div></details>
          <details className="rounded-xl border border-stone-200 p-4">
            <summary className="cursor-pointer font-semibold">{t.design}</summary>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(['headingFont', 'bodyFont'] as const).map(key => <label className="block text-sm" key={key}>{t[key]}<select aria-label={t[key]} className={fieldClass} value={page[key]} onChange={event => onChange({ ...page, [key]: event.target.value })}>{PAGE_FONTS.map(font => <option key={font} value={font}>{t[font]}</option>)}</select></label>)}
              {(['background', 'textColor', 'accent'] as const).map(key => <label className="flex min-h-11 items-center justify-between gap-2 text-sm" key={key}>{t[key]}<input aria-label={t[key]} type="color" className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border" value={page[key]} onChange={event => onChange({ ...page, [key]: event.target.value })} /></label>)}
            </div>
            <button type="button" className={`${secondaryClass} mt-4`} onClick={() => onChange({ ...page, headingFont: DEFAULT_PAGE.headingFont, bodyFont: DEFAULT_PAGE.bodyFont, background: DEFAULT_PAGE.background, textColor: DEFAULT_PAGE.textColor, accent: DEFAULT_PAGE.accent })}>{t.reset}</button>
          </details>
          <div className="rounded-2xl border border-stone-200 p-4">
            <label className="block text-sm font-semibold">{t.addCategory}<select aria-label={t.addCategory} className={fieldClass} value={category} onChange={event => setCategory(event.target.value as PageSection['category'])}>{PAGE_CATEGORIES.map(key => <option key={key} value={key}>{t[key]}</option>)}</select></label>
            <button type="button" className={`${secondaryClass} mt-3`} disabled={page.sections.length >= 12} onClick={addCategory}>+ {t.addCategory}</button>
          </div>
          {section ? <div className="space-y-4 rounded-2xl border border-stone-200 p-4">
            <label className="block text-sm font-semibold">{t.category}<select aria-label={t.category} className={fieldClass} value={section.id} onChange={event => setSectionId(event.target.value)}>{page.sections.map((item, index) => <option value={item.id} key={item.id}>{index + 1}. {localized(item.title, editLang) || t[item.category]}</option>)}</select></label>
            <label className="block text-sm">{t.sectionTitle}<input className={fieldClass} maxLength={180} value={section.title[editLang] ?? ''} onChange={event => updateSection({ ...section, title: { ...section.title, [editLang]: event.target.value } })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={section.visible} onChange={event => updateSection({ ...section, visible: event.target.checked })} />{t.visible}</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={secondaryClass} aria-label={`${t.moveUp} · ${t.category}`} disabled={page.sections[0].id === section.id} onClick={() => onChange({ ...page, sections: movePageItem(page.sections, section.id, page.sections.findIndex(item => item.id === section.id) - 1) })}>↑</button>
              <button type="button" className={secondaryClass} aria-label={`${t.moveDown} · ${t.category}`} disabled={page.sections.at(-1)?.id === section.id} onClick={() => onChange({ ...page, sections: movePageItem(page.sections, section.id, page.sections.findIndex(item => item.id === section.id) + 1) })}>↓</button>
              <button type="button" className={secondaryClass} onClick={() => onChange({ ...page, sections: page.sections.filter(item => item.id !== section.id) })}>{t.remove} · {t.category}</button>
            </div>
            <div className="flex flex-wrap items-end gap-2 border-t pt-4">
              <label className="min-w-0 flex-1 text-sm">{t.fieldType}<select aria-label={t.fieldType} className={fieldClass} value={fieldType} onChange={event => setFieldType(event.target.value as PageField['type'])}>{PAGE_FIELD_TYPES.map(key => <option key={key} value={key}>{t[key]}</option>)}</select></label>
              <button type="button" className={secondaryClass} disabled={section.fields.length >= 12} onClick={addField}>+ {t.addField}</button>
            </div>
            <div className="space-y-4">{section.fields.map((field, index) => <div key={field.id} data-page-field={field.id} className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3"
              onDragEnter={event => { if (drag.current?.section === section.id) event.preventDefault(); }}
              onDragOver={event => { if (drag.current?.section === section.id) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }}
              onDrop={event => { event.preventDefault(); if (drag.current?.section === section.id) reorder(drag.current.field, index); drag.current = null; }}>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" draggable aria-label={`${t.drag} ${index + 1}`} className="min-h-11 cursor-grab rounded-lg border bg-white px-3" onDragStart={event => { event.dataTransfer.setData('application/x-guestcam-page-field', field.id); event.dataTransfer.effectAllowed = 'move'; drag.current = { section: section.id, field: field.id }; }} onDragEnd={() => { drag.current = null; }}>⠿</button>
                <strong className="text-sm">{index + 1}. {t[field.type]}</strong>
                <button type="button" className="min-h-11 rounded-lg border bg-white px-3" aria-label={`${t.moveUp} ${index + 1}`} disabled={index === 0} onClick={() => reorder(field.id, index - 1)}>↑</button>
                <button type="button" className="min-h-11 rounded-lg border bg-white px-3" aria-label={`${t.moveDown} ${index + 1}`} disabled={index === section.fields.length - 1} onClick={() => reorder(field.id, index + 1)}>↓</button>
                <button type="button" className="ml-auto min-h-11 text-sm text-red-700" onClick={() => updateSection({ ...section, fields: section.fields.filter(item => item.id !== field.id) })}>{t.remove}</button>
              </div>
              <label className="block text-sm">{field.type === 'image' ? imageCopy(lang).caption : t[field.type]}{field.type === 'text'
                ? <textarea aria-label={t[field.type]} className={fieldClass} rows={3} maxLength={5000} value={field.text[editLang] ?? ''} onChange={event => updateField(field.id, { text: { ...field.text, [editLang]: event.target.value } })} />
                : <input className={fieldClass} maxLength={180} value={field.text[editLang] ?? ''} onChange={event => updateField(field.id, { text: { ...field.text, [editLang]: event.target.value } })} />}</label>
              {field.type === 'image' && <WeddingImageField key={field.id} value={field.url || ''} lang={lang} label={imageCopy(lang).image} uploadEndpoint={uploadEndpoint} onUploadBusy={onUploadBusy} onChange={url => updateField(field.id, { url })} />}
              {field.type === 'link' && <label className="block text-sm">{t.url}<input type="url" required placeholder="https://" className={fieldClass} value={field.url || ''} onChange={event => updateField(field.id, { url: event.target.value })} /></label>}
              {field.type !== 'image' && <details className="rounded-lg border border-stone-200 bg-white p-3"><summary className="cursor-pointer text-xs font-semibold">{p.fieldStyle}</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">{t.font}<select aria-label={`${t.font} ${index + 1}`} className={fieldClass} value={field.font || ''} onChange={event => updateField(field.id, { font: event.target.value ? event.target.value as PageField['font'] : undefined })}><option value="">{t.inherit}</option>{PAGE_FONTS.map(font => <option key={font} value={font} style={{ fontFamily: FONT_FAMILIES[font] }}>{t[font]}</option>)}</select></label>
                <label className="flex items-center justify-between gap-2 text-sm">{t.textColor}<input aria-label={`${t.textColor} ${index + 1}`} type="color" className="h-11 w-14 rounded-lg border" value={field.color || (field.type === 'text' ? page.textColor : page.accent)} onChange={event => updateField(field.id, { color: event.target.value })} /></label>
              </div>
              <button type="button" className="min-h-11 text-xs underline" onClick={() => updateField(field.id, { font: undefined, color: undefined })}>{t.inherit}</button></details>}
            </div>)}</div>
          </div> : <div className="space-y-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5"><p className="text-sm leading-6 text-stone-700">{p.startHint}</p><button type="button" className={secondaryClass} onClick={() => onChange({ ...page, sections: starterSections() })}>{p.start}</button></div>}
        </div>
        <aside ref={previewRef} className="min-w-0 scroll-mt-32 xl:sticky xl:top-24 xl:self-start" aria-label={t.preview}>
          <button type="button" className={`${secondaryClass} mb-4 xl:hidden`} onClick={() => editorRef.current?.scrollIntoView({ block: 'start' })}>↑ {p.content}</button>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{t.preview}</h3><div className="inline-flex rounded-lg bg-stone-100 p-1">{(['desktop', 'mobile'] as const).map(mode => <button type="button" key={mode} aria-pressed={previewMode === mode} className={`min-h-10 rounded-md px-3 text-xs font-semibold ${previewMode === mode ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`} onClick={() => setPreviewMode(mode)}>{p[mode]}</button>)}</div></div>
          <p className="mb-4 text-xs leading-5 text-stone-600">{p.previewHint}</p>
          <div ref={previewScrollRef} data-wedding-preview-scroll className={`mx-auto max-h-[900px] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-sm ${previewMode === 'mobile' ? 'max-w-[390px]' : ''}`}><WeddingPageContent page={page} lang={editLang} idPrefix="editor-" /></div>
        </aside>
      </div>
    </div>
  </WeddingPanel>;
}
