import Link from "next/link";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { LangCode } from "@/components/LanguageSwitcher";
import type { LegalDoc, Block, LegalKind } from "@/lib/legal/types";
import { privacyDoc } from "@/lib/legal/privacy";
import { termsDoc }   from "@/lib/legal/terms";
import { gdprDoc }    from "@/lib/legal/gdpr";
import { cookiesDoc } from "@/lib/legal/cookies";

export type { LegalKind } from "@/lib/legal/types";
export type LegalLang = LangCode;

const DOCS: Record<LegalKind, Record<LangCode, LegalDoc>> = {
  privacy: privacyDoc,
  terms:   termsDoc,
  gdpr:    gdprDoc,
  cookies: cookiesDoc,
};

// ─── Block renderers ─────────────────────────────────────────────────────────

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="text-gray-600 leading-relaxed mb-3">{block.text}</p>;

    case "h3":
      return (
        <h3 className="font-semibold text-[#0F1729] mt-4 mb-2">{block.text}</h3>
      );

    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-1 text-gray-600 mb-3">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "table":
      return (
        <table className="w-full text-sm border-collapse mt-2 mb-3">
          <thead>
            <tr className="bg-[#F2F4F8]">
              {block.headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left p-3 font-semibold border border-gray-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="p-3 border border-gray-200 text-gray-600"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "cards":
      return (
        <div className="space-y-3 mb-3">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="bg-[#F2F4F8] rounded-xl p-4 border border-gray-100"
            >
              <p className="font-semibold text-[#0F1729] mb-1">{item.title}</p>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      );

    case "contactCard":
      return (
        <div className="bg-[#F2F4F8] rounded-xl p-4 mt-3 mb-3 border border-gray-100">
          {block.lines.map((line, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-semibold text-[#0F1729]"
                  : "text-sm text-gray-600 mt-1"
              }
            >
              {line.includes("@") ? (
                <>
                  {line.split(/(\S+@\S+\.\S+)/).map((part, j) =>
                    /@/.test(part) ? (
                      <a
                        key={j}
                        href={`mailto:${part}`}
                        className="text-[#C9820A] hover:underline"
                      >
                        {part}
                      </a>
                    ) : (
                      <span key={j}>{part}</span>
                    ),
                  )}
                </>
              ) : (
                line
              )}
            </p>
          ))}
        </div>
      );

    case "callout":
      return (
        <div className="bg-[#FFF9EC] border border-[#FFC94D]/40 rounded-xl p-4 mb-3 text-sm text-gray-700">
          {block.text}
        </div>
      );

    case "link":
      return (
        <p className="mb-3">
          <Link href={block.href} className="text-[#C9820A] hover:underline">
            {block.text}
          </Link>
        </p>
      );
  }
}

function Section({ title, blocks }: { title: string; blocks: Block[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#0F1729] mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <div>
        {blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  );
}

// ─── Public component ───────────────────────────────────────────────────────

export function LegalPage({ kind, lang }: { kind: LegalKind; lang: LegalLang }) {
  const doc = DOCS[kind][lang];

  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang={lang} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Title */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9820A] mb-3">
              {doc.eyebrow}
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#0F1729] mb-3">
              {doc.heading}
            </h1>
            <p className="text-sm text-gray-400">{doc.lastUpdated}</p>
          </div>

          <div className="prose prose-gray max-w-none text-[#0F1729]">
            {/* Intro */}
            <p className="text-base leading-relaxed text-gray-600 mb-8">
              {doc.intro}
            </p>

            {/* Sections */}
            {doc.sections.map((s, i) => (
              <Section key={i} title={s.title} blocks={s.blocks} />
            ))}
          </div>
        </div>
      </main>

      <SeoFooter lang={lang} />
    </div>
  );
}
