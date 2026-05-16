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
      <header className="absolute top-0 left-0 right-0 z-40">
        <nav className="max-w-7xl mx-auto px-8 h-18 flex items-center justify-between" style={{ height: 72 }}>
          <Link href="/" className="flex items-center gap-0.5">
            <span className="font-serif italic text-xl font-bold text-white drop-shadow">WeddingAlbum</span>
            <span className="font-black text-2xl leading-none text-white drop-shadow" style={{ color: '#f9a8c0' }}>.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <a href="#how" className="hover:text-white transition-colors">Kako deluje</a>
            <a href="#templates" className="hover:text-white transition-colors">Predloge</a>
            <a href="#pricing" className="hover:text-white transition-colors">Cenik</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors hidden sm:block">Prijava</Link>
            <Link href="/dashboard/new" className="px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 text-white" style={{ background: '#C4738A', boxShadow: '0 4px 16px rgba(196,115,138,0.5)' }}>
              Začni brezplačno
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ─── full viewport split */}
      <section className="relative flex" style={{ height: '100vh', minHeight: 680 }}>

        {/* LEFT 60% — photo collage panel */}
        <div className="relative overflow-hidden" style={{ width: '60%' }}>
          {/* Main background photo */}
          <img
            src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1400&h=1200&fit=crop&crop=faces,center&q=90"
            alt="Wedding memories"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)' }} />

          {/* TOP: Horizontal photo strip (wedtrove style) */}
          <div className="absolute top-0 left-0 right-0 flex gap-1.5 p-3 pt-20">
            {[
              'photo-1529634806980-85c3dd6d34ac',
              'photo-1537633552985-df8429e8048b',
              'photo-1469371670807-013ccf25f16a',
              'photo-1558636508-e0969431e51e',
              'photo-1465495976277-4387d4b0b4c6',
            ].map((id) => (
              <div key={id} className="flex-1 rounded-xl overflow-hidden shadow-lg border-2 border-white/30" style={{ height: 90 }}>
                <img src={`https://images.unsplash.com/${id}?w=220&h=140&fit=crop&q=70`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* BOTTOM LEFT: QR card mockup (like the wedtrove sign photo) */}
          <div className="absolute bottom-10 left-10 bg-white rounded-3xl shadow-2xl p-5 w-52">
            <p className="font-serif text-center text-sm font-light text-[#2C2825] mb-0.5">Zberi spomine</p>
            <p className="text-center text-[10px] text-gray-400 mb-3">Skeniraj QR kodo in dodaj foto</p>
            <div className="flex justify-center mb-3">
              <QRPattern />
            </div>
            <div className="border-t border-gray-100 pt-3 text-center">
              <p className="font-serif text-sm italic text-[#C4738A]">Ana & Marko</p>
              <p className="text-[10px] text-gray-400">14. junij 2025</p>
            </div>
          </div>

          {/* BOTTOM RIGHT: photo count badge */}
          <div className="absolute bottom-10 right-6 bg-white/95 backdrop-blur rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(196,115,138,0.15)' }}>
              <svg className="w-4 h-4" style={{ color: '#C4738A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C2825]">+183 novih fotografij</p>
              <p className="text-[10px] text-gray-400">danes · v živo</p>
            </div>
          </div>
        </div>

        {/* RIGHT 40% — white form panel */}
        <div className="bg-white flex flex-col items-center justify-center px-10 xl:px-16" style={{ width: '40%' }}>
          <div className="w-full max-w-sm">

            {/* Logo mark */}
            <div className="flex items-center gap-1 mb-10">
              <svg className="w-5 h-5" style={{ color: '#C4738A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
              </svg>
              <span className="font-serif italic text-xl font-bold text-[#2C2825]">WeddingAlbum</span>
              <span className="font-black text-2xl leading-none" style={{ color: '#C4738A' }}>.</span>
            </div>

            {/* Headline */}
            <h1 className="font-extrabold text-[#2C2825] leading-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              Zberi fotografije<br />vseh gostov
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-7">
              QR koda za poroko, rojstni dan, obletnico in vsak poseben trenutek. Gostje delijo — brez aplikacije.
            </p>

            {/* Event type pills */}
            <div className="flex flex-wrap gap-1.5 mb-8">
              {['💍 Poroka', '🎂 Rojstni dan', '💑 Obletnica', '🎉 Zabava', '👶 Krst', '🎓 Diploma'].map((t) => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium text-gray-600 border border-gray-100 bg-gray-50">{t}</span>
              ))}
            </div>

            {/* Get started form */}
            <div className="space-y-3 mb-6">
              <input
                type="email"
                placeholder="Vaš email naslov"
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-sm text-[#2C2825] outline-none transition-colors text-center"
                style={{ background: '#fafafa' }}
                readOnly
              />
              <Link
                href="/dashboard/new"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-200"
                style={{ background: '#C4738A', boxShadow: '0 8px 24px rgba(196,115,138,0.38)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
                Začni brezplačno
              </Link>
            </div>

            <p className="text-center text-xs text-gray-400 mb-8">
              Že imate račun?{' '}
              <Link href="/dashboard" className="font-semibold hover:underline" style={{ color: '#C4738A' }}>
                Prijava
              </Link>
            </p>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                SSL
              </span>
              <span>500+ galerij</span>
              <span>Brezplačno</span>
              <span>GDPR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pb-20 pt-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm grid grid-cols-3 divide-x divide-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <span className="text-[1.4rem]">👫👫👫</span>
            <div>
              <p className="font-extrabold text-xl text-[#2C2825]">500+</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">ustvarjenih galerij</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <div className="text-amber-400 text-base leading-none shrink-0">★★★★★</div>
            <div>
              <p className="font-extrabold text-xl text-[#C4738A]">5.0/5</p>
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

      {/* ── Print Templates ─────────────────────────────────────────────────── */}
      <section id="templates" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest" style={{ background: 'rgba(196,115,138,0.1)', color: '#C4738A' }}>
              Predloge za tisk
            </div>
            <h2 className="text-[2.5rem] font-extrabold text-[#2C2825] mb-4">Prelepe predloge za vaš dogodek</h2>
            <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
              Natisnite kartico s QR kodo in jo postavite na mize. Gostje skenirajo in delijo fotografije takoj.
            </p>
          </div>

          {/* 4-column template grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { name: 'Klasična',        bg: 'photo-1490750967868-88df5691cc27', headline: 'Capture the Love ♥',   sub: 'Skeniraj in deli',     rotate: -3, dark: false },
              { name: 'Botanična',       bg: 'photo-1523438885200-e635ba2c371e', headline: 'Deli naše spomine',    sub: 'Share the memories',  rotate:  2, dark: false },
              { name: 'Elegantna',       bg: 'photo-1519225421980-716433b74c7b', headline: 'Thank You',            sub: 'Za skupne spomine',   rotate: -1, dark: false },
              { name: 'Cvetlična',       bg: 'photo-1474862520816-c809f9895cd5', headline: 'Scan & Share',         sub: 'Brez aplikacije',     rotate:  2, dark: false },
              { name: 'Rustikalna',      bg: 'photo-1501286353178-1ec881214838', headline: 'Zberi spomine',        sub: 'Skeniraj QR kodo',    rotate: -2, dark: false },
              { name: 'Moderna',         bg: 'photo-1537633552985-df8429e8048b', headline: 'Our Memories',         sub: 'Scan to share',       rotate:  1, dark: true  },
              { name: 'Minimalistična',  bg: 'photo-1596436889106-be35e843f974', headline: 'Vaš dan',              sub: 'Dodaj fotografijo',   rotate: -2, dark: false },
              { name: 'Skandinavska',    bg: 'photo-1529634806980-85c3dd6d34ac', headline: 'Share the Love',       sub: 'Scan the QR code',    rotate:  2, dark: true  },
            ].map((t) => (
              <div key={t.name} className="group relative rounded-2xl overflow-hidden cursor-pointer" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                {/* Background photo */}
                <div className="relative" style={{ height: 300 }}>
                  <img
                    src={`https://images.unsplash.com/${t.bg}?w=400&h=500&fit=crop&q=80`}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Slight overlay */}
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.18)' }} />

                  {/* Card overlay — the template preview */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className={`${t.dark ? 'bg-[#2C2825] text-white' : 'bg-white/97 text-[#2C2825]'} rounded-xl p-4 shadow-2xl text-center`}
                      style={{ width: 130, transform: `rotate(${t.rotate}deg)` }}
                    >
                      <p className={`font-serif text-[11px] font-bold mb-0.5 leading-tight ${t.dark ? 'text-white' : 'text-[#2C2825]'}`}>
                        {t.headline}
                      </p>
                      <p className={`text-[8px] mb-2.5 ${t.dark ? 'text-white/60' : 'text-gray-400'}`}>{t.sub}</p>
                      {/* Tiny QR pattern */}
                      <div className="flex justify-center mb-2" style={{ transform: 'scale(0.48)', transformOrigin: 'center', height: 33, overflow: 'hidden' }}>
                        <QRPattern />
                      </div>
                      <p className={`font-serif text-[8px] italic ${t.dark ? 'text-[#f9a8c0]' : 'text-[#C4738A]'}`}>Ana & Marko</p>
                      {t.dark ? null : <div className="w-8 h-px bg-gray-200 mx-auto mt-1.5" />}
                      <p className={`text-[7px] mt-1 ${t.dark ? 'text-white/40' : 'text-gray-300'}`}>14. 06. 2025</p>
                    </div>
                  </div>

                  {/* Hover: CTA overlay */}
                  <div className="absolute inset-0 bg-[#C4738A]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <Link
                      href="/dashboard/new"
                      className="bg-white font-bold text-xs px-5 py-2.5 rounded-full transition-transform hover:scale-105"
                      style={{ color: '#C4738A' }}
                    >
                      Uporabi predlogo →
                    </Link>
                  </div>
                </div>

                {/* Name label */}
                <div className="px-3 py-2.5 bg-white flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2C2825]">{t.name}</span>
                  <span className="text-[10px] text-[#C4738A] font-medium">PDF ↓</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-gray-400 mb-5">Vsaka predloga vključuje vaše ime, datum in personalizirano QR kodo</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-200 border-2"
              style={{ borderColor: '#C4738A', color: '#C4738A' }}
            >
              Ustvari galerijo in prenesi predloge →
            </Link>
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
                  style={{ background: '#C4738A', boxShadow: '0 4px 16px rgba(196,115,138,0.4)' }}
                >{n}</div>
              </div>
            ))}
          </div>

          {/* Step titles + descriptions */}
          <div className="grid md:grid-cols-3 gap-10 text-center mb-12">
            {[
              { title: "Ustvari galerijo in natisni predlogo",   desc: "V 2 minutah ustvarite galerijo, izberite predlogo in jo natisnite. Postavite na mize ali ob vhod." },
              { title: "Gosti slikajo in delijo", desc: "Gosti skenirajo QR kodo in takoj začnejo dodajati fotografije — brez prijave." },
              { title: "Vse na enem mestu",   desc: "Vse fotografije se zbirajo v vaši zasebni galeriji, ki jo po poroki prenesete v 1 kliku." },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                {/* Mobile: show number */}
                <div className="md:hidden w-12 h-12 rounded-full text-white font-extrabold text-lg flex items-center justify-center" style={{ background: '#C4738A' }}>
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
                      <p className="text-[10px] mt-0.5" style={{ color: '#C4738A' }}>Hvala, ker deliš spomine z nama.</p>
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
                        <span className="text-[10px]" style={{ color: '#C4738A' }}>V živo</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[
                          "photo-1529634806980-85c3dd6d34ac",
                          "photo-1606800052052-a08af7148866",
                          "photo-1469371670807-013ccf25f16a",
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
                  <p className="text-xs mt-0.5" style={{ color: '#C4738A' }}>182 fotografij · 24 videov</p>
                </div>
                <button className="text-xs text-white px-3 py-1.5 rounded-lg font-bold" style={{ background: '#C4738A' }}>
                  Prenesi vse
                </button>
              </div>
              {/* Photo grid — real wedding thumbnails */}
              <div className="p-3 grid grid-cols-3 gap-1.5">
                {[
                  "photo-1529634806980-85c3dd6d34ac",
                  "photo-1606800052052-a08af7148866",
                  "photo-1537633552985-df8429e8048b",
                  "photo-1469371670807-013ccf25f16a",
                  "photo-1465495976277-4387d4b0b4c6",
                  "photo-1606216794074-735e91aa2c92",
                  "photo-1520854221256-17451cc331bf",
                  "photo-1583939003579-730e3918a45a",
                  "photo-1515934751635-c81c6bc9a2d8",
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
              href="/dashboard/new"
              className="inline-flex items-center gap-2.5 px-9 py-4 text-white font-bold rounded-full transition-all duration-200"
              style={{ background: '#C4738A', boxShadow: '0 6px 20px rgba(196,115,138,0.35)' }}
            >
              Ustvari svojo galerijo zdaj →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why you need it ─────────────────────────────────────────────────── */}
      <section id="why" className="py-24" style={{ background: '#FEF2F4' }}>
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
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:border-[#C4738A]/30 transition-all duration-200">
                <div className="w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm" style={{ background: '#FEF2F4' }}>
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
                  style={{ background: 'rgba(196,115,138,0.12)', color: '#C4738A' }}
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
      <section id="reviews" className="py-24" style={{ background: '#FEF2F4' }}>
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
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: 'rgba(196,115,138,0.15)' }}>💑</div>
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

          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* BASIC */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col">
              <p className="font-extrabold text-lg text-[#2C2825] mb-1">Basic</p>
              <p className="text-sm text-gray-400 mb-6">Za manjše dogodke</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none text-[#2C2825]">39€</span>
                <span className="text-gray-300 line-through text-lg mb-1.5">55€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {["Unikatna QR koda","Do 50 gostov","Do 200 fotografij","Dostop do galerije 1 mesec","Prenos vseh slik (ZIP)"].map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-[#C4738A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#2C2825] transition-colors hover:bg-gray-50" style={{ border: '1.5px solid #e5e7eb' }}>
                Izberi Basic
              </Link>
            </div>

            {/* PLUS — highlighted */}
            <div className="relative bg-white rounded-3xl p-8 flex flex-col" style={{ border: '2px solid #C4738A', boxShadow: '0 8px 40px rgba(196,115,138,0.2)', transform: 'translateY(-8px)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold tracking-widest uppercase px-5 py-1.5 rounded-full" style={{ background: '#C4738A' }}>
                NAJBOLJ PRILJUBLJENO
              </div>
              <p className="font-extrabold text-lg text-[#2C2825] mb-1">Plus</p>
              <p className="text-sm text-gray-400 mb-6">Za večje dogodke in poroke</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none" style={{ color: '#C4738A' }}>49€</span>
                <span className="text-gray-300 line-through text-lg mb-1.5">69€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unikatna QR koda",
                  "Neomejeno število gostov",
                  "Neomejeno fotografij",
                  "Dostop do galerije 1 leto",
                  "Prenos vseh slik (ZIP)",
                  "Live galerija (projekcija)",
                  "Personalizirana stran z imeni",
                  "E-mail obvestila za par",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-[#C4738A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-white transition-colors" style={{ background: '#C4738A' }}>
                Izberi Plus
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col">
              <p className="font-extrabold text-lg text-[#2C2825] mb-1">Premium</p>
              <p className="text-sm text-gray-400 mb-6">Za tiste, ki želite vse</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none text-[#2C2825]">79€</span>
                <span className="text-gray-300 line-through text-lg mb-1.5">109€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unikatna QR koda",
                  "Neomejeno število gostov",
                  "Neomejeno fotografij",
                  "Do 100 videoposnetkov",
                  "Dostop do galerije 2 leti",
                  "Prenos vseh slik (ZIP)",
                  "Live galerija (projekcija)",
                  "Personalizirana stran z imeni",
                  "Lastna domena (foto.vase-ime.si)",
                  "Premium design predloge",
                  "Prioritetna podpora",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-[#C4738A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#2C2825] transition-colors hover:bg-gray-50" style={{ border: '1.5px solid #e5e7eb' }}>
                Izberi Premium
              </Link>
            </div>
          </div>

          {/* Guarantee badge */}
          <div className="flex items-center justify-center gap-2 mt-10 text-sm text-gray-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            30-dnevna garancija vračila denarja – brez vprašanj.
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24" style={{ background: '#FEF2F4' }}>
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
          Poroka, rojstni dan, obletnica —<br />
          <span style={{ color: '#C4738A' }}>zberi vse spomine.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">Brezplačno, brez kreditne kartice. Galerija pripravljena v 2 minutah.</p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2.5 px-10 py-5 text-white font-bold text-lg rounded-full transition-all duration-200 shadow-2xl"
          style={{ background: '#C4738A', boxShadow: '0 12px 32px rgba(196,115,138,0.35)' }}
        >
          Ustvari galerijo zdaj
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="mt-5 text-sm text-gray-300">Varno · Zasebno · GDPR skladno</p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#2C2825] text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">

          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-1 mb-3">
                <svg className="w-4 h-4" style={{ color: '#C4738A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
                </svg>
                <span className="font-serif italic text-lg font-semibold">WeddingAlbum</span>
                <span className="font-black text-xl leading-none" style={{ color: '#C4738A' }}>.</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-5">
                Poročna galerija s QR kodo — brez aplikacije. Gostje fotografirajo, vi zbirate spomine.
              </p>
              {/* Social */}
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/wedflow.app" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/wedflow.app" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.pinterest.com/wedflow" aria-label="Pinterest" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Produkt */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Produkt</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#how" className="hover:text-white transition-colors">Kako deluje</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Funkcionalnosti</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Cenik</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Pogosta vprašanja</a></li>
                <li><Link href="/dashboard/new" className="hover:text-white transition-colors">Ustvari album</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Prijava</Link></li>
              </ul>
            </div>

            {/* Jeziki / Trgi */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Jeziki</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/sl" className="hover:text-white transition-colors">🇸🇮 Slovenija</Link></li>
                <li><Link href="/hr" className="hover:text-white transition-colors">🇭🇷 Hrvatska</Link></li>
                <li><Link href="/sr" className="hover:text-white transition-colors">🇷🇸 Srbija</Link></li>
                <li><Link href="/de" className="hover:text-white transition-colors">🇩🇪 Deutschland</Link></li>
                <li><Link href="/es" className="hover:text-white transition-colors">🇪🇸 España</Link></li>
                <li><Link href="/en" className="hover:text-white transition-colors">🇬🇧 English</Link></li>
              </ul>
            </div>

            {/* Vodniki & SEO */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Vodniki</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/sl/qr-koda-poroka" className="hover:text-white transition-colors">QR koda za poroko</Link></li>
                <li><Link href="/hr/qr-kod-vjencanje" className="hover:text-white transition-colors">QR kod za vjenčanje</Link></li>
                <li><Link href="/en/wedding-photo-sharing" className="hover:text-white transition-colors">Wedding photo sharing</Link></li>
                <li><Link href="/de/hochzeitsfotos-sammeln" className="hover:text-white transition-colors">Hochzeitsfotos sammeln</Link></li>
                <li><Link href="/es/fotos-boda-qr" className="hover:text-white transition-colors">Fotos boda QR</Link></li>
                <li><Link href="/en/alternatives" className="hover:text-white transition-colors">App alternatives</Link></li>
              </ul>
            </div>

            {/* Pravno */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Pravno</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Zasebnost</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Pogoji uporabe</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Piškotki</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
                <li><a href="mailto:hello@wedflow.app" className="hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} WedFlow d.o.o. · WeddingAlbum je del ekosistema{' '}
              <a href="https://wedflow.app" className="hover:text-gray-300 transition-colors" style={{ color: '#C4738A' }}>WedFlow</a>
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                SSL
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                GDPR
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Brez registracije za goste
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
