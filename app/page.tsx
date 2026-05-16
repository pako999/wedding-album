import Link from "next/link";
import Image from "next/image";

// ── SVG Feature Icons ─────────────────────────────────────────────────────────
function IconQR() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h.01M14 17h.01M17 14h.01M20 14h.01M20 17v3M17 20h3M17 17h.01" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
    </svg>
  );
}

// ── QR Pattern (CSS-drawn) ────────────────────────────────────────────────────
function QRPattern() {
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,0,1,1,0,1,0,1,1,0,0,1,0],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,1],
    [1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,0,1],
  ];
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(17, 1fr)`, width: 68, height: 68 }}>
      {cells.flat().map((v, i) => (
        <div key={i} style={{ backgroundColor: v ? '#2C2825' : 'transparent' }} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#2C2825] font-sans">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="font-extrabold text-[1.3rem] text-[#2C2825] tracking-tight">WeddingAlbum</span>
            <span className="text-[#C9A96E] font-black text-2xl leading-none" style={{ marginTop: 2 }}>.</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <a href="#how"     className="hover:text-[#2C2825] transition-colors">Kako deluje</a>
            <a href="#why"     className="hover:text-[#2C2825] transition-colors">Zakaj to potrebuješ</a>
            <a href="#pricing" className="hover:text-[#2C2825] transition-colors">Cenik</a>
            <a href="#reviews" className="hover:text-[#2C2825] transition-colors">Mnenja</a>
            <a href="#faq"     className="hover:text-[#2C2825] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:flex items-center justify-center w-9 h-9 text-gray-400 hover:text-[#2C2825] hover:bg-gray-100 transition-colors rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-[#2C2825] text-white text-sm font-bold rounded-xl hover:bg-[#C9A96E] transition-colors duration-200">
              Ustvari album
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-4 grid lg:grid-cols-2 gap-10 items-center" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        {/* Left */}
        <div>
          <h1 className="font-extrabold leading-[1.05] tracking-tight text-[#2C2825] mb-5" style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)' }}>
            Ne izgubi slik<br />
            <span className="text-[#C9A96E]">svoje poroke.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-9 max-w-[420px]">
            Zberite vse fotografije gostov na enem mestu — z eno samo QR kodo. Brez aplikacije, brez prijave.
          </p>

          {/* Stacked photo fan */}
          <div className="relative h-52 mb-10 select-none pointer-events-none">
            {[
              {
                rot: '-6deg', left: '0px', top: '14px', z: 10,
                src: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=300&h=400&fit=crop&q=75",
                alt: "Wedding guests celebrating",
              },
              {
                rot:  '3deg', left: '100px', top: '0px', z: 20,
                src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&h=400&fit=crop&q=75",
                alt: "Wedding couple",
              },
              {
                rot: '-2deg', left: '195px', top: '18px', z: 30,
                src: "https://images.unsplash.com/photo-1511285560929-80b456503681?w=300&h=400&fit=crop&q=75",
                alt: "Wedding reception dancing",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute w-[148px] h-[188px] rounded-2xl shadow-xl border-[3px] border-white overflow-hidden"
                style={{ transform: `rotate(${p.rot})`, left: p.left, top: p.top, zIndex: p.z }}
              >
                <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            ))}
          </div>

          {/* CTA — pill button like kliksy */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-8 py-4 font-bold text-base text-white rounded-full transition-all duration-200 shadow-lg"
            style={{ background: '#C9A96E', boxShadow: '0 8px 24px rgba(201,169,110,0.35)' }}
          >
            Ustvari svojo galerijo zdaj
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-emerald-600 font-medium flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Varno. Zasebno. Samo za vas in vaše goste.
          </p>
        </div>

        {/* Right — hero photo with floating UI */}
        <div className="hidden lg:block relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: 520 }}>
            {/* Real wedding photo */}
            <Image
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=900&h=600&fit=crop&q=80"
              alt="Wedding celebration"
              fill
              className="object-cover"
              priority
            />
            {/* Floating notification badge */}
            <div className="absolute top-5 right-5 bg-white/96 backdrop-blur rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-white">
              <span className="text-2xl">🥂</span>
              <div>
                <p className="font-bold text-[13px] text-[#2C2825]">Poroka Ana & Marko</p>
                <p className="text-xs text-[#C9A96E] font-semibold">+183 novih fotografij ❤️</p>
              </div>
            </div>
            {/* Floating QR card */}
            <div className="absolute bottom-5 left-5 bg-white/96 backdrop-blur rounded-2xl shadow-xl px-4 py-3.5 flex items-center gap-3.5 border border-white">
              <div className="w-11 h-11 bg-[#2C2825] rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[13px] text-[#2C2825]">Skeniraj QR kodo</p>
                <p className="text-xs text-gray-400">Dodaj fotografijo takoj</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm grid grid-cols-3 divide-x divide-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <span className="text-[1.4rem]">👫👫👫</span>
            <div>
              <p className="font-extrabold text-xl text-[#2C2825]">500+</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">parov je izbralo Wedding Album</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <div className="text-amber-400 text-base leading-none shrink-0">★★★★★</div>
            <div>
              <p className="font-extrabold text-xl text-[#C9A96E]">5.0/5</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">na podlagi prvih ocen</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <span className="text-[1.4rem]">📸</span>
            <div>
              <p className="font-extrabold text-xl text-[#2C2825]">25.000+</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">zbranih fotografij</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#2C2825] mb-20">Kako deluje?</h2>

          {/* Numbers row with connecting line */}
          <div className="relative hidden md:grid grid-cols-3 mb-8">
            {/* Connecting line */}
            <div className="absolute top-6 bg-gray-200" style={{ left: 'calc(16.67% + 24px)', right: 'calc(16.67% + 24px)', height: 1 }} />
            {["1","2","3"].map((n) => (
              <div key={n} className="flex justify-center">
                <div
                  className="relative z-10 w-12 h-12 rounded-full text-white font-extrabold text-lg flex items-center justify-center shadow-lg"
                  style={{ background: '#C9A96E', boxShadow: '0 4px 16px rgba(201,169,110,0.4)' }}
                >{n}</div>
              </div>
            ))}
          </div>

          {/* Step titles + descriptions */}
          <div className="grid md:grid-cols-3 gap-10 text-center mb-12">
            {[
              { title: "Natisnite QR kodo",   desc: "QR kodo natisnite in postavite na mize, pri vhodu ali kamorkoli na poročnem dnevu." },
              { title: "Gosti slikajo in delijo", desc: "Gosti skenirajo QR kodo in takoj začnejo dodajati fotografije — brez prijave." },
              { title: "Vse na enem mestu",   desc: "Vse fotografije se zbirajo v vaši zasebni galeriji, ki jo po poroki prenesete v 1 kliku." },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                {/* Mobile: show number */}
                <div className="md:hidden w-12 h-12 rounded-full text-white font-extrabold text-lg flex items-center justify-center" style={{ background: '#C9A96E' }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2825] text-xl mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-[260px] mx-auto">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Step visuals */}
          <div className="grid md:grid-cols-3 gap-8 items-start">

            {/* Step 1 — QR table scene */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100" style={{ background: '#F5EFE8' }}>
              <div className="relative h-64 overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4C4B0 0%, #C0A882 40%, #A89070 100%)' }}>
                {/* Table surface */}
                <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(0deg, #8B6B4A 0%, transparent 100%)' }} />
                {/* Candle lights */}
                {[[20, 60], [75, 55]].map(([x, y], i) => (
                  <div key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                    <div className="w-2 h-8 rounded-full mx-auto" style={{ background: '#F5F0E8' }} />
                    <div className="w-3 h-3 rounded-full -mt-1 mx-auto opacity-90" style={{ background: '#FFC040', filter: 'blur(2px)' }} />
                  </div>
                ))}
                {/* QR stand card */}
                <div className="absolute left-1/2 bottom-8 -translate-x-1/2 bg-white rounded-xl shadow-xl p-3 w-28">
                  <div className="flex items-center justify-center mb-1.5">
                    <QRPattern />
                  </div>
                  <p className="text-center text-[9px] font-bold text-[#2C2825] uppercase tracking-wider">Skeniraj me</p>
                  <div className="mt-1 w-4 h-4 border-b-2 border-gray-300 mx-auto" style={{ borderRadius: '0 0 2px 2px' }} />
                </div>
              </div>
            </div>

            {/* Step 2 — Phone mockup */}
            <div className="flex justify-center">
              <div className="relative" style={{ width: 220 }}>
                {/* Phone body */}
                <div className="rounded-[40px] p-2.5 shadow-2xl" style={{ background: '#1C1917' }}>
                  {/* Screen */}
                  <div className="rounded-[30px] overflow-hidden" style={{ background: '#111827' }}>
                    {/* Notch bar */}
                    <div className="flex items-center justify-center py-2.5 px-4" style={{ background: '#1C1917' }}>
                      <div className="w-20 h-4 rounded-full" style={{ background: '#0A0A0A' }} />
                    </div>
                    {/* App header */}
                    <div className="px-4 py-3 text-center" style={{ background: '#2C2825' }}>
                      <p className="text-white font-semibold text-sm tracking-wide">ana &amp; marko</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#C9A96E' }}>Hvala, ker deliš spomine z nama.</p>
                    </div>
                    {/* Buttons */}
                    <div className="p-4 space-y-3" style={{ background: '#1a1a2e' }}>
                      <button className="w-full py-4 rounded-2xl flex flex-col items-center gap-1.5" style={{ background: '#2C2825' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <span className="text-white font-bold text-sm">Slikaj zdaj</span>
                      </button>
                      <button className="w-full py-3 rounded-2xl flex flex-col items-center gap-1" style={{ background: '#252535' }}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-gray-400 text-xs">Naloži iz galerije</span>
                      </button>
                    </div>
                    {/* Recent photos strip */}
                    <div className="px-3 pb-3 pt-1" style={{ background: '#1a1a2e' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-gray-500 font-medium">Zadnji spomini</span>
                        <span className="text-[10px]" style={{ color: '#C9A96E' }}>V živo</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[
                          "photo-1529634806980-85c3dd6d34ac",
                          "photo-1519741497674-611481863552",
                          "photo-1511285560929-80b456503681",
                          "photo-1465495976277-4387d4b0b4c6",
                        ].map((id) => (
                          <div key={id} className="flex-1 aspect-square rounded-lg overflow-hidden">
                            <img src={`https://images.unsplash.com/${id}?w=80&h=80&fit=crop&q=60`} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Side buttons */}
                <div className="absolute right-0 top-20 w-1 h-8 rounded-l-sm" style={{ background: '#111', right: -2 }} />
                <div className="absolute left-0 top-16 w-1 h-6 rounded-r-sm" style={{ background: '#111', left: -2 }} />
                <div className="absolute left-0 top-24 w-1 h-6 rounded-r-sm" style={{ background: '#111', left: -2 }} />
              </div>
            </div>

            {/* Step 3 — Gallery card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <div>
                  <p className="font-bold text-sm text-[#2C2825]">Vsa zbirka</p>
                  <p className="text-xs mt-0.5" style={{ color: '#C9A96E' }}>182 fotografij · 24 videov</p>
                </div>
                <button className="text-xs text-white px-3 py-1.5 rounded-lg font-bold" style={{ background: '#C9A96E' }}>
                  Prenesi vse
                </button>
              </div>
              {/* Photo grid — real wedding thumbnails */}
              <div className="p-3 grid grid-cols-3 gap-1.5">
                {[
                  "photo-1529634806980-85c3dd6d34ac",
                  "photo-1519741497674-611481863552",
                  "photo-1537633552985-df8429e8048b",
                  "photo-1511285560929-80b456503681",
                  "photo-1465495976277-4387d4b0b4c6",
                  "photo-1606216794074-735e91aa2c92",
                  "photo-1520854221256-17451cc331bf",
                  "photo-1583939003579-730e3918a45a",
                  "photo-1544642058-b5943a6fc5b6",
                ].map((id) => (
                  <div key={id} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/${id}?w=120&h=120&fit=crop&q=70`}
                      alt="Wedding photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 pt-1">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Vseh 182 slik naloženih</span>
                  <span className="text-emerald-500 font-medium">✓ Shranjeno</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-14">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-9 py-4 text-white font-bold rounded-full transition-all duration-200"
              style={{ background: '#C9A96E', boxShadow: '0 6px 20px rgba(201,169,110,0.35)' }}
            >
              Ustvari svojo galerijo zdaj →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why you need it ─────────────────────────────────────────────────── */}
      <section id="why" className="py-24" style={{ background: '#FAF7F2' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#2C2825] mb-4">Zakaj to potrebuješ?</h2>
          <p className="text-center text-gray-400 text-base mb-14 max-w-md mx-auto">
            Na vaši poroki fotografira vsak gost — ampak te slike nikoli ne pridejo do vas.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📷", title: "Fotograf ne more biti povsod",   desc: "Gosti ujamejo spontane trenutke, ki jih profesionalni fotograf pogosto zamudi. Ti drobni, nepozabni momenti." },
              { icon: "📱", title: "Slike ostanejo na telefonih",     desc: "Fotografije ostanejo zaklenjene v klepetih WhatsApp in jih nikoli ne prejmete. Za vedno izgubljene." },
              { icon: "👁",  title: "Vse iz vseh zornih kotov",       desc: "Dobite celotno zgodbo vašega dne, skozi oči vseh vaših gostov — od strica Franca do sestrične Tine." },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:border-[#C9A96E]/30 transition-all duration-200">
                <div className="w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm" style={{ background: '#FAF7F2' }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#2C2825] text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#2C2825] mb-4">Zakaj izbrati Wedding Album?</h2>
          <p className="text-center text-gray-400 mb-14 max-w-md mx-auto">Vse, kar potrebujete za popoln poročni album.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            {[
              { Icon: IconPhone,  title: "Brez aplikacije",     desc: "Gosti odprejo album direktno v brskalniku. Nobene namestitve, nobene prijave." },
              { Icon: IconGlobe,  title: "6 jezikov",            desc: "Slovenščina, hrvaščina, srbščina, angleščina, nemščina, španščina — vmesnik se prilagodi vsakemu gostu." },
              { Icon: IconLock,   title: "100% zasebnost",       desc: "Album je samo za vas in vaše goste. Brez javnih povezav, brez oglaševanja." },
              { Icon: IconCamera, title: "Polna kakovost",       desc: "Fotografije so shranjene v originalni ločljivosti. Brez stiskanja, brez izgube kakovosti." },
              { Icon: IconBolt,   title: "Takojšen dostop",      desc: "Med poroko že vidite nove vsebine. Popolno za deljenje z gosti v realnem času." },
              { Icon: IconQR,     title: "Lastna domena",        desc: "foto.vase-ime.si — album na vaši domeni, brez omembe Wedding Album (Premium)." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(201,169,110,0.12)', color: '#C9A96E' }}
                >
                  <Icon />
                </div>
                <h3 className="font-bold text-[#2C2825] text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[220px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-24" style={{ background: '#FAF7F2' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#2C2825] mb-14">Mnenja naših parov</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { text: "Noro dobra ideja! Dobila sva toliko spontanih fotografij, ki jih fotograf nikoli ne bi ujel. Gosti so bili navdušeni nad tem, kako enostavno je bilo.", name: "Tina & Luka",   date: "April 2026" },
              { text: "Postavili smo QR kodo na vsako mizo in že med večerjo smo imeli 200+ fotografij. Preprosto genijalno! Vsem priporočamo.", name: "Ana & Marko",   date: "Junij 2025" },
              { text: "Končno smo zbrali vse spomine na enem mestu. Gostje iz tujine so naložili fotografije v svojem jeziku brez kakršnih koli težav.", name: "Sara & David", date: "September 2025" },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: 'rgba(201,169,110,0.15)' }}>💑</div>
                  <div>
                    <p className="font-bold text-sm text-[#2C2825]">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#2C2825] mb-4">Preprosti paketi</h2>
          <p className="text-center text-gray-400 mb-14">Izberite paket, ki ustreza vaši poroki.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "Brezplačno", desc: "Za preizkus", price: "0", period: "",
                features: ["1 album","50 fotografij","6 jezikov","Javna stran albuma"],
                cta: "Začni brezplačno", highlight: false,
              },
              {
                name: "Pro", desc: "Za poroko", price: "49", period: "/leto",
                badge: "NAJBOLJ PRILJUBLJENO",
                features: ["Neomejeni albumi","500 fotografij","QR koda za tisk","ZIP prenos vseh slik","Moderacija fotografij","E-mail obvestila"],
                cta: "Izberi Pro", highlight: true,
              },
              {
                name: "Premium", desc: "Za tiste, ki želite vse", price: "99", period: "/leto",
                features: ["2000 fotografij","Lastna domena","Bela oznaka (no branding)","Vse Pro funkcije"],
                cta: "Izberi Premium", highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border p-8 flex flex-col ${plan.highlight ? 'text-white' : 'bg-white border-gray-200'}`}
                style={plan.highlight ? { background: '#2C2825', borderColor: '#2C2825', transform: 'scale(1.03)', boxShadow: '0 20px 60px rgba(44,40,37,0.25)' } : {}}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full" style={{ background: '#C9A96E' }}>
                    {plan.badge}
                  </div>
                )}
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.highlight ? 'text-[#C9A96E]' : 'text-gray-400'}`}>{plan.name}</p>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-white/60' : 'text-gray-400'}`}>{plan.desc}</p>
                <div className="flex items-end gap-1 mb-7">
                  <span className={`font-extrabold leading-none ${plan.highlight ? 'text-white' : 'text-[#2C2825]'}`} style={{ fontSize: '3rem' }}>{plan.price}€</span>
                  {plan.period && <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-white/50' : 'text-gray-400'}`}>{plan.period}</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 shrink-0 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="block text-center py-3.5 rounded-2xl font-bold text-sm transition-colors"
                  style={plan.highlight ? { background: '#C9A96E', color: '#fff' } : { border: '1.5px solid #e5e7eb', color: '#2C2825' }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24" style={{ background: '#FAF7F2' }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#2C2825] mb-12">Pogosta vprašanja</h2>
          <div className="space-y-3">
            {[
              { q: "Ali morajo gosti prenesti aplikacijo?",        a: "Ne. Gosti odprejo album direktno v brskalniku telefona — brez namestitve, brez prijave. Enostavno skenirajo QR kodo in takoj naložijo fotografijo." },
              { q: "Ali so fotografije zasebne?",                   a: "Da. Album je dostopen samo z vašo QR kodo ali povezavo. Po želji ga zaščitite z geslom za dodatno varnost." },
              { q: "V kakšni kakovosti se shranjujejo fotografije?", a: "V polni originalni ločljivosti, brez kakršnega koli stiskanja ali zmanjšanja kakovosti." },
              { q: "Ali podpirate videe?",                          a: "Pro in Premium paket podpirata nalaganje videov do 500 MB na posnetek." },
              { q: "Kaj se zgodi po poroki?",                       a: "Album ostane aktiven toliko časa, kolikor traja vaš paket. Vse fotografije prenesete kot ZIP arhiv v enem kliku." },
            ].map((faq) => (
              <details key={faq.q} className="bg-white border border-gray-100 rounded-2xl group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-[#2C2825] list-none text-[0.95rem]">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 pt-1 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white text-center px-6">
        <h2 className="font-extrabold text-[#2C2825] mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
          Začnite zbirati spomine<br />
          <span style={{ color: '#C9A96E' }}>danes.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">Brezplačno, brez kreditne kartice. Pripravljeno v 2 minutah.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 px-10 py-5 text-white font-bold text-lg rounded-full transition-all duration-200 shadow-2xl"
          style={{ background: '#C9A96E', boxShadow: '0 12px 32px rgba(201,169,110,0.35)' }}
        >
          Ustvari svojo galerijo zdaj
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="mt-5 text-sm text-gray-300">Varno · Zasebno · Made with ♥ in Slovenia</p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#2C2825]">WeddingAlbum</span>
            <span className="text-[#C9A96E] font-black text-base leading-none">.</span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-xs text-gray-400">del <a href="https://wedflow.app" className="hover:underline" style={{ color: '#C9A96E' }}>WedFlow</a></span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/dashboard" className="hover:text-[#2C2825] transition-colors">Prijava</Link>
            <a href="mailto:hello@wedflow.app" className="hover:text-[#2C2825] transition-colors">Kontakt</a>
            <span>© {new Date().getFullYear()} WedFlow</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
