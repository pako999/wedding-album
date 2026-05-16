import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PrintButton } from "@/components/dashboard/PrintButton";

export const dynamic = "force-dynamic";

const TEMPLATES = [
  { id: 'classic',   name: 'Klasična',       style: 'white',  headline: 'Capture the Love ♥', sub: 'Skeniraj QR kodo in deli fotografije', font: 'serif' },
  { id: 'modern',    name: 'Moderna',        style: 'dark',   headline: 'Share Our Memories',  sub: 'Scan the QR code to share photos',     font: 'sans'  },
  { id: 'elegant',   name: 'Elegantna',      style: 'white',  headline: 'Thank You',           sub: 'Za skupne spomine tega dne',           font: 'serif' },
  { id: 'botanical', name: 'Botanična',      style: 'cream',  headline: 'Deli naše spomine',   sub: 'Skeniraj in dodaj fotografijo',         font: 'serif' },
  { id: 'minimal',   name: 'Minimalistična', style: 'white',  headline: 'Scan & Share',        sub: 'Upload your photos',                   font: 'sans'  },
  { id: 'rustic',    name: 'Rustikalna',     style: 'kraft',  headline: 'Zberi spomine',       sub: 'Skeniraj QR kodo',                     font: 'serif' },
];

export default async function PrintPage({ params }: { params: { slug: string } }) {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {/* ignore */}
  if (!userId) redirect("/sign-in");

  let album: typeof albums.$inferSelect | null = null;
  try {
    const result = await db.query.albums.findFirst({ where: eq(albums.slug, params.slug) });
    album = result ?? null;
  } catch {/* DB not ready */}

  if (!album || album.ownerClerkId !== userId) redirect("/dashboard");

  const albumUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://weddingalbum.app'}/a/${params.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(albumUrl)}&bgcolor=ffffff&color=2C2825&qzone=1&format=png`;

  const eventEmoji = album.eventType === 'wedding' ? '💍' : album.eventType === 'birthday' ? '🎂' : album.eventType === 'anniversary' ? '💑' : album.eventType === 'party' ? '🎉' : album.eventType === 'baptism' ? '👶' : album.eventType === 'graduation' ? '🎓' : '📸';

  return (
    <div className="min-h-screen" style={{ background: '#FDF4F5' }}>
      {/* Screen nav - hidden when printing */}
      <div className="no-print">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-40" style={{ borderColor: 'rgba(196,115,138,0.15)' }}>
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href={`/dashboard/${params.slug}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2C2825] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Nazaj na galerijo
            </Link>
            <PrintButton />
          </div>
        </nav>

        {/* Page content */}
        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-light text-[#2C2825] mb-1">
              {eventEmoji} {album.coupleName}
            </h1>
            <p className="text-sm text-gray-400">Izberite predlogo — natisnite in postavite na mize</p>
          </div>

          {/* Template selector grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {TEMPLATES.map((tmpl) => {
              const bgColor = tmpl.style === 'dark' ? '#2C2825' : tmpl.style === 'kraft' ? '#F5EFE8' : tmpl.style === 'cream' ? '#FFFBF5' : '#FFFFFF';
              const textColor = tmpl.style === 'dark' ? '#FFFFFF' : '#2C2825';
              const accentColor = tmpl.style === 'dark' ? '#f9a8c0' : '#C4738A';
              const subColor = tmpl.style === 'dark' ? 'rgba(255,255,255,0.55)' : '#9CA3AF';
              const borderColor = tmpl.style === 'dark' ? 'transparent' : 'rgba(196,115,138,0.2)';
              return (
                <a key={tmpl.id} href={`#template-${tmpl.id}`} className="group cursor-pointer">
                  {/* Preview card */}
                  <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border" style={{ borderColor: 'rgba(196,115,138,0.15)' }}>
                    {/* A5 card preview */}
                    <div className="p-6 flex items-center justify-center" style={{ background: '#f8f4f5', minHeight: 200 }}>
                      <div className="rounded-xl p-5 shadow-lg text-center w-40" style={{ background: bgColor, border: `1.5px solid ${borderColor}` }}>
                        <p className="font-serif text-xs font-bold leading-tight mb-1" style={{ color: textColor, fontFamily: tmpl.font === 'serif' ? 'Georgia, serif' : 'inherit' }}>
                          {tmpl.headline}
                        </p>
                        <p className="text-[8px] mb-3" style={{ color: subColor }}>{tmpl.sub}</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrUrl} alt="QR" className="w-16 h-16 mx-auto mb-2" style={{ imageRendering: 'pixelated' }} />
                        <p className="font-serif text-[9px] italic" style={{ color: accentColor }}>{album!.coupleName}</p>
                        <p className="text-[7px] mt-0.5" style={{ color: subColor }}>{album!.weddingDate}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-white flex items-center justify-between border-t border-gray-50">
                      <span className="text-xs font-semibold text-[#2C2825]">{tmpl.name}</span>
                      <span className="text-[10px] font-medium" style={{ color: '#C4738A' }}>Izberi →</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Full printable versions */}
          <h2 className="font-serif text-2xl font-light text-[#2C2825] mb-6">Predloge za tisk (A5 format)</h2>
          <p className="text-sm text-gray-400 mb-8">Kliknite &ldquo;Natisni / Shrani PDF&rdquo; zgoraj — natisnete se le spodnje kartice (navigacija se skrije)</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.map((tmpl) => {
              const bgColor = tmpl.style === 'dark' ? '#2C2825' : tmpl.style === 'kraft' ? '#F5EFE8' : tmpl.style === 'cream' ? '#FFFBF5' : '#FFFFFF';
              const textColor = tmpl.style === 'dark' ? '#FFFFFF' : '#2C2825';
              const accentColor = tmpl.style === 'dark' ? '#f9a8c0' : '#C4738A';
              const subColor = tmpl.style === 'dark' ? 'rgba(255,255,255,0.55)' : '#9CA3AF';
              const borderStyle = tmpl.style === 'dark' ? 'none' : `2px solid rgba(196,115,138,0.25)`;
              return (
                <div id={`template-${tmpl.id}`} key={tmpl.id} className="print-card rounded-2xl overflow-hidden shadow-lg" style={{ background: bgColor, border: borderStyle }}>
                  {/* Template name label - screen only */}
                  <div className="no-print px-5 py-2 border-b text-xs font-bold" style={{ color: accentColor, borderColor: 'rgba(196,115,138,0.15)', background: tmpl.style === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(196,115,138,0.05)' }}>
                    {tmpl.name} — A5 / A6
                  </div>

                  {/* Card content — this prints */}
                  <div className="p-8 text-center">
                    {/* Top decorative line */}
                    <div className="w-16 h-0.5 mx-auto mb-6" style={{ background: accentColor, opacity: 0.5 }} />

                    <p className="font-serif text-2xl font-bold mb-1 leading-tight" style={{ color: textColor, fontFamily: 'Georgia, serif' }}>
                      {tmpl.headline}
                    </p>
                    <p className="text-sm mb-6" style={{ color: subColor }}>{tmpl.sub}</p>

                    {/* Event name */}
                    <p className="font-serif text-base font-semibold mb-1" style={{ color: textColor }}>{album!.coupleName}</p>
                    <p className="text-sm mb-6" style={{ color: subColor }}>{album!.weddingDate}{album!.location ? ` · ${album!.location}` : ''}</p>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-2xl" style={{ background: tmpl.style === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(196,115,138,0.06)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrUrl}
                          alt="QR koda"
                          width={180}
                          height={180}
                          style={{ display: 'block', imageRendering: 'pixelated' }}
                        />
                      </div>
                    </div>

                    <p className="text-xs font-medium mb-1" style={{ color: accentColor }}>Skeniraj QR kodo</p>
                    <p className="text-xs" style={{ color: subColor }}>Dodaj fotografijo takoj · Brez aplikacije</p>

                    {/* Bottom decorative line */}
                    <div className="w-16 h-0.5 mx-auto mt-6" style={{ background: accentColor, opacity: 0.5 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card {
            page-break-inside: avoid;
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
