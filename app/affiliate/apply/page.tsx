import type { Metadata } from "next";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = {
  title: "Postanite GuestCam partner — zaslužite 20%",
  description: "Pridružite se GuestCam partnerskemu programu in zaslužite 20% provizije za vsako priporočeno naročilo.",
};

export default function AffiliateApplyPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9820A] mb-3">
            🤝 Partnerski program
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F1729] mb-3">
            Priporočite GuestCam.<br />
            Zaslužite 20%.
          </h1>
          <p className="text-base text-gray-500 max-w-lg mx-auto">
            Pridružite se GuestCam partnerskemu programu in zaslužite 20% od vsakega plačanega naročila — za vsako nove sklenitev partnerske povezave.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {[
            { icon: "💰", title: "20% provizija", body: "Za vsako naročilo prek vaše povezave." },
            { icon: "🍪", title: "30-dnevni piškotek", body: "Pripisano vam je vsako naročilo v 30 dneh od klika." },
            { icon: "💳", title: "Hitro izplačilo", body: "Po 14 dneh na PayPal ali bančni račun." },
            { icon: "📊", title: "Lastna nadzorna plošča", body: "Sledite klikom, naročilom in zaslužku v realnem času." },
          ].map((b) => (
            <div key={b.title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-2xl mb-2">{b.icon}</div>
              <p className="font-bold text-[#0F1729] text-sm mb-1">{b.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-[#0F1729] mb-1">Prijava</h2>
          <p className="text-sm text-gray-500 mb-6">Pregledali jo bomo in vam odgovorili v 2 delovnih dneh.</p>
          <ApplyForm />
        </div>
      </div>
    </div>
  );
}
