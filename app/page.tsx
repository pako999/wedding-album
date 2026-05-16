import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#2C2825] font-sans">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C9A96E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
            </svg>
            <span className="font-bold text-xl text-[#2C2825] tracking-tight">Wedding<span className="text-[#C9A96E]">Album</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#how" className="hover:text-[#2C2825] transition-colors">Kako deluje</a>
            <a href="#features" className="hover:text-[#2C2825] transition-colors">Funkcionalnosti</a>
            <a href="#pricing" className="hover:text-[#2C2825] transition-colors">Cenik</a>
            <a href="#faq" className="hover:text-[#2C2825] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:block text-sm text-gray-500 hover:text-[#2C2825] transition-colors px-3 py-2">
              Prijava
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#2C2825] text-white text-sm font-semibold rounded-xl hover:bg-[#C9A96E] transition-colors duration-200"
            >
              Ustvari album
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#C9A96E]/10 border border-[#C9A96E]/25 text-[#8B6B3D] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            🎊 Novo · Poročni foto album
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-[#2C2825] mb-6">
            Ne izgubi slik<br />
            <span className="text-[#C9A96E]">svoje poroke.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
            Zberite vse fotografije gostov na enem mestu — z eno samo QR kodo. Brez aplikacije, brez prijave.
          </p>

          {/* Photo stack preview */}
          <div className="relative h-48 mb-8 select-none pointer-events-none">
            {[
              { rotate: "-rotate-6", left: "0", top: "10px", zIndex: 1 },
              { rotate: "rotate-2", left: "90px", top: "0", zIndex: 2 },
              { rotate: "-rotate-2", left: "180px", top: "15px", zIndex: 3 },
            ].map((s, i) => (
              <div
                key={i}
                className={`absolute w-36 h-44 rounded-2xl shadow-lg ${s.rotate} overflow-hidden border-2 border-white`}
                style={{ left: s.left, top: s.top, zIndex: s.zIndex }}
              >
                <div className={`w-full h-full ${
                  i === 0 ? "bg-gradient-to-br from-rose-200 to-pink-300" :
                  i === 1 ? "bg-gradient-to-br from-amber-100 to-orange-200" :
                  "bg-gradient-to-br from-stone-200 to-neutral-300"
                } flex items-center justify-center`}>
                  <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2C2825] text-white font-bold text-base rounded-2xl hover:bg-[#C9A96E] transition-colors duration-200 shadow-lg shadow-[#2C2825]/20"
          >
            Ustvari svojo galerijo zdaj
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-3 text-sm text-gray-400 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            Varno. Zasebno. Samo za vas in vaše goste.
          </p>
        </div>

        {/* Right — main photo + floating badges */}
        <div className="relative hidden lg:block">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[460px] bg-gradient-to-br from-stone-200 via-rose-100 to-amber-100">
            {/* Simulated wedding photo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-[#C9A96E]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            {/* Notification badge */}
            <div className="absolute top-5 right-5 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">🥂</span>
              <div>
                <p className="font-bold text-sm text-[#2C2825]">Poroka Ana & Marko</p>
                <p className="text-xs text-[#C9A96E] font-semibold">+183 novih fotografij</p>
              </div>
            </div>
            {/* QR card */}
            <div className="absolute bottom-5 left-5 bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2C2825] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-[#2C2825]">Skeniraj QR kodo</p>
                <p className="text-xs text-gray-400">Dodaj fotografijo takoj</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-3 divide-x divide-gray-200">
          {[
            { emoji: "👫", value: "500+", label: "parov je izbralo Wedding Album" },
            { emoji: "⭐", value: "5.0/5", label: "povprečna ocena" },
            { emoji: "📸", value: "25.000+", label: "zbranih fotografij" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col sm:flex-row items-center gap-3 px-6 text-center sm:text-left">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <p className="font-extrabold text-2xl text-[#2C2825]">{s.value}</p>
                <p className="text-sm text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why you need it ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-4xl font-extrabold text-center text-[#2C2825] mb-3">Zakaj to potrebuješ?</h2>
        <p className="text-center text-gray-400 text-base mb-14 max-w-md mx-auto">Na vaši poroki fotografira vsak gost — ampak te slike nikoli ne pridejo do vas.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "📷", title: "Fotograf ne more biti povsod", desc: "Gosti ujamejo spontane trenutke, ki jih profesionalni fotograf pogosto zamudi." },
            { icon: "📱", title: "Slike ostanejo na telefonih", desc: "Fotografije ostanejo zakolenene v klepetih in jih nikoli ne prejmete." },
            { icon: "👁", title: "Spomini iz vseh zornih kotov", desc: "Dobite celotno zgodbo vašega dne, skozi oči vseh vaših gostov." },
          ].map((f) => (
            <div key={f.title} className="bg-[#FAF7F2] border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:border-[#C9A96E]/30 transition-all duration-200">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm">
                {f.icon}
              </div>
              <h3 className="font-bold text-[#2C2825] text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C9A96E] text-white font-bold text-sm rounded-2xl hover:bg-[#B8945A] transition-colors shadow-md">
            Začnite zbirati spomine →
          </Link>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="how" className="bg-[#FAF7F2] py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-extrabold text-center text-[#2C2825] mb-16">Kako deluje?</h2>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {[
              {
                num: "1",
                title: "Natisnite QR kodo",
                desc: "QR kodo natisnite in postavite na mize, pri vhodu ali kamorkoli na poročnem dnevu.",
                visual: (
                  <div className="bg-white rounded-2xl shadow p-6 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-[#2C2825] rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-sm text-[#2C2825]">Skeniraj QR kodo</p>
                    <p className="text-xs text-gray-400 mt-1">Takoj odpre album</p>
                  </div>
                ),
              },
              {
                num: "2",
                title: "Gosti slikajo in delijo",
                desc: "Gosti skenirajo QR kodo in takoj začnejo dodajati fotografije — brez prijave.",
                visual: (
                  <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                    <div className="bg-[#2C2825] px-4 py-3 text-center">
                      <p className="text-white font-semibold text-sm">ana & marko</p>
                      <p className="text-[#C9A96E] text-xs mt-0.5">Hvala, ker deliš spomine z nama.</p>
                    </div>
                    <div className="p-4 space-y-2">
                      <button className="w-full py-3 bg-[#FAF7F2] border border-[#C9A96E]/30 rounded-xl text-sm font-medium text-[#2C2825] flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                        Slikaj zdaj
                      </button>
                      <button className="w-full py-3 bg-[#FAF7F2] border border-gray-200 rounded-xl text-sm text-gray-400 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                        Naloži iz galerije
                      </button>
                    </div>
                  </div>
                ),
              },
              {
                num: "3",
                title: "Vse na enem mestu",
                desc: "Vse fotografije se zbirajo v vaši zasebni galeriji, ki jo po poroki prenesete v 1 kliku.",
                visual: (
                  <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm text-[#2C2825]">Vsa zbirka</p>
                        <p className="text-xs text-[#C9A96E]">182 fotografij · 24 videov</p>
                      </div>
                      <button className="text-xs bg-[#2C2825] text-white px-3 py-1.5 rounded-lg font-semibold">Prenesi vse</button>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`aspect-square rounded-lg ${
                          ["bg-rose-100","bg-amber-100","bg-stone-200","bg-pink-100","bg-orange-100","bg-neutral-200"][i]
                        }`} />
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#C9A96E] text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-[#C9A96E]/30">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2825] text-xl mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {step.visual}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A96E] text-white font-bold rounded-2xl hover:bg-[#B8945A] transition-colors shadow-md">
              Ustvari svoj album zdaj →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-4xl font-extrabold text-center text-[#2C2825] mb-3">Zakaj izbrati Wedding Album?</h2>
        <p className="text-center text-gray-400 mb-14 max-w-md mx-auto">Vse, kar potrebujete za popoln poročni album.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "📲", title: "Brez aplikacije", desc: "Gosti odprejo album direktno v brskalniku. Nobene namestitve, nobene prijave." },
            { icon: "🌍", title: "6 jezikov", desc: "Slovenščina, hrvaščina, srbščina, angleščina, nemščina, španščina — vmesnik se prilagodi vsakemu gostu." },
            { icon: "🔒", title: "100% zasebnost", desc: "Album je samo za vas in vaše goste. Brez javnih povezav, brez oglaševanja." },
            { icon: "📸", title: "Polna kakovost", desc: "Fotografije so shranjene v originalni ločljivosti. Brez stiskanja, brez izgube kakovosti." },
            { icon: "✅", title: "Moderacija", desc: "Preverite fotografije, preden so vidne vsem. Odobrite ali zavrnite posamezne slike." },
            { icon: "🌐", title: "Lastna domena", desc: "foto.vase-ime.si — album na vaši domeni, brez omembe Wedding Album (Premium)." },
          ].map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:border-[#C9A96E]/40 hover:shadow-md transition-all duration-200 bg-white">
              <div className="w-11 h-11 bg-[#FAF7F2] border border-gray-100 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">
                {f.icon}
              </div>
              <h3 className="font-bold text-[#2C2825] mb-1.5">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF7F2] py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-4xl font-extrabold text-center text-[#2C2825] mb-14">Mnenja naših parov</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { stars: 5, text: "Noro dobra ideja! Dobila sva toliko spontanih fotografij, ki jih fotograf nikoli ne bi ujel. Gosti so bili navdušeni.", name: "Tina & Luka", date: "April 2026" },
              { stars: 5, text: "Postavili smo QR kodo na vsako mizo in že med večerjo smo imeli 200+ fotografij. Preprosto genijalno!", name: "Ana & Marko", date: "Junij 2025" },
              { stars: 5, text: "Končno smo zbrali vse spomine na enem mestu. Gostje iz tujine so naložili fotografije v svojem jeziku brez težav.", name: "Sara & David", date: "September 2025" },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-base">💑</div>
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
      <section id="pricing" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-4xl font-extrabold text-center text-[#2C2825] mb-3">Preprosti paketi</h2>
        <p className="text-center text-gray-400 mb-14">Izberite paket, ki ustreza vaši poroki.</p>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            {
              name: "Brezplačno",
              desc: "Za preizkus",
              price: "0",
              period: "",
              features: ["1 album", "50 fotografij", "6 jezikov", "Javna stran albuma"],
              cta: "Začni brezplačno",
              highlight: false,
            },
            {
              name: "Pro",
              desc: "Za poroko",
              price: "49",
              period: "/leto",
              badge: "NAJBOLJ PRILJUBLJENO",
              features: ["Neomejeni albumi", "500 fotografij", "QR koda za tisk", "ZIP prenos vseh slik", "Moderacija fotografij", "E-mail obvestila"],
              cta: "Izberi Pro",
              highlight: true,
            },
            {
              name: "Premium",
              desc: "Za tiste, ki želite vse",
              price: "99",
              period: "/leto",
              features: ["2000 fotografij", "Lastna domena", "Bela oznaka (no branding)", "Vse Pro funkcije"],
              cta: "Izberi Premium",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-7 flex flex-col ${
                plan.highlight
                  ? "bg-[#2C2825] border-[#2C2825] shadow-2xl shadow-[#2C2825]/25 scale-[1.03]"
                  : "bg-white border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A96E] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.highlight ? "text-[#C9A96E]" : "text-gray-400"}`}>{plan.name}</p>
              <p className={`text-sm mb-5 ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{plan.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className={`text-5xl font-extrabold leading-none ${plan.highlight ? "text-white" : "text-[#2C2825]"}`}>{plan.price}€</span>
                {plan.period && <span className={`text-sm mb-1 ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>{plan.period}</span>}
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-[#C9A96E]" : "text-[#C9A96E]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className={`block text-center py-3.5 rounded-2xl font-bold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-[#C9A96E] text-white hover:bg-[#B8945A]"
                    : "border border-gray-200 text-[#2C2825] hover:border-[#C9A96E] hover:bg-[#FAF7F2]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="bg-[#FAF7F2] py-20">
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-4xl font-extrabold text-center text-[#2C2825] mb-12">Pogosta vprašanja</h2>
          <div className="space-y-4">
            {[
              { q: "Ali morajo gosti prenesti aplikacijo?", a: "Ne. Gosti odprejo album direktno v brskalniku telefona — brez namestitve, brez prijave." },
              { q: "Ali so fotografije zasebne?", a: "Da. Album je dostopen samo z vašo QR kodo ali povezavo. Optionally zaščitite z geslom." },
              { q: "V kakšni kakovosti se shranjujejo fotografije?", a: "V polni originalni ločljivosti, brez kakršnega koli stiskanja ali zmanjšanja kakovosti." },
              { q: "Ali podpirate videe?", a: "Pro in Premium paket podpirata nalaganje videov do 500 MB na posnetek." },
              { q: "Kaj se zgodi po poroki?", a: "Album ostane aktiven toliko časa, kolikor traja vaš paket. Vse fotografije lahko prenesete kot ZIP arhiv." },
            ].map((faq) => (
              <details key={faq.q} className="bg-white border border-gray-100 rounded-2xl group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-[#2C2825] list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2C2825] mb-4">
          Začnite zbirati spomine<br />
          <span className="text-[#C9A96E]">danes.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10">Brezplačno, brez kreditne kartice. Pripravljeno v 2 minutah.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-10 py-5 bg-[#2C2825] text-white font-bold text-lg rounded-2xl hover:bg-[#C9A96E] transition-colors shadow-2xl shadow-[#2C2825]/20"
        >
          Ustvari svojo galerijo zdaj
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="mt-4 text-sm text-gray-300">Varno · Zasebno · Made with ♥ in Slovenia</p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A96E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
            </svg>
            <span className="font-bold text-sm text-[#2C2825]">WeddingAlbum</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">del <a href="https://wedflow.app" className="text-[#C9A96E] hover:underline">WedFlow</a></span>
          </div>
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} WedFlow · Vse pravice pridržane</p>
        </div>
      </footer>
    </div>
  );
}
