import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Best Wedding Photo Sharing App Alternatives 2025",
  description:
    "Guestcam vs Google Photos vs WhatsApp vs Dropbox vs HoneyCam. Find the right wedding photo sharing app for your day — honest side-by-side.",
  openGraph: {
    title: "Best Wedding Photo Sharing App Alternatives 2025",
    description:
      "Honest comparison of wedding photo sharing solutions. See which app wins on quality, ease of use, privacy and price.",
    type: "article",
    images: [ogImage("Best Wedding Photo Sharing App Alternatives")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Wedding Photo Sharing App Alternatives 2025",
    description: "Honest comparison of wedding photo sharing solutions.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://www.guestcam.si/en/alternatives",
    languages: {
      "sl": "https://www.guestcam.si/sl/alternative-aplikacije",
      "hr": "https://www.guestcam.si/hr/alternativne-aplikacije",
      "sr": "https://www.guestcam.si/sr/alternativne-aplikacije",
      "de": "https://www.guestcam.si/de/alternativen",
      "en": "https://www.guestcam.si/en/alternatives",
      "es": "https://www.guestcam.si/es/alternativas",
      "x-default": "https://www.guestcam.si/sl/alternative-aplikacije",
    },
  },
};


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <a href="mailto:hello@guestcam.me" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

function Check() {
  return (
    <svg className="w-5 h-5 mx-auto" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Cross() {
  return (
    <svg className="w-5 h-5 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Partial({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function AlternativesPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang="en" hreflang={ALTERNATIVES_HREFLANG} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}
          >
            Comparison · English · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Best Wedding Photo Sharing App Alternatives
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            You&apos;re planning a wedding and want a simple way for guests to
            share photos. You&apos;ve probably considered Google Photos,
            WhatsApp, or just emailing people. But which solution is actually
            the best for weddings? This honest comparison covers every major
            option — and shows you exactly where each one falls short.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Read time: ~8 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Updated: January 2025
            </span>
          </div>
        </div>

        {/* What to look for */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            What to look for in a wedding photo sharing app
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Before comparing specific tools, it&apos;s worth defining what makes
            a wedding photo solution actually good. The requirements are quite
            specific:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "No app download for guests", desc: "Your guests range from tech-savvy to technophobic. The best solution works for everyone, in every browser." },
              { title: "Full original quality", desc: "You need photos you can print. That means no compression, no resizing — original files only." },
              { title: "Effortless upload process", desc: "Guests are busy enjoying the wedding. The upload flow must take under 30 seconds, start to finish." },
              { title: "Privacy by default", desc: "Wedding photos are personal. You don't want them indexed by Google or accessible to strangers." },
              { title: "Easy for the couple to manage", desc: "Creating the gallery, downloading photos, and managing access should be simple even for non-technical users." },
              { title: "Fair pricing", desc: "A wedding already costs a lot. The photo solution should be affordable or free, without hidden costs." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,201,77,0.1)" }}>
                  <svg className="w-4 h-4" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">{title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Quick comparison table
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{ background: "#0F1729" }}>
                  <th className="p-4 text-white font-semibold">Feature</th>
                  <th className="p-4 text-center" style={{ color: "#C9820A", fontWeight: 700 }}>Guestcam</th>
                  <th className="p-4 text-center text-gray-300 font-medium">Google Photos</th>
                  <th className="p-4 text-center text-gray-300 font-medium">WhatsApp</th>
                  <th className="p-4 text-center text-gray-300 font-medium">Dropbox</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "No app download for guests",
                    wa: true, gp: false, wp: false, db: false,
                    wpNote: "App required",
                    gpNote: "Account needed",
                    dbNote: "App needed",
                  },
                  {
                    feature: "Full original photo quality",
                    wa: true, gp: "partial", wp: false, db: true,
                    wpNote: "70% compression",
                    gpNote: "Compressed by default",
                  },
                  {
                    feature: "QR code for easy access",
                    wa: true, gp: false, wp: false, db: false,
                  },
                  {
                    feature: "Private (no indexing)",
                    wa: true, gp: "partial", wp: true, db: true,
                    gpNote: "Depends on settings",
                  },
                  {
                    feature: "Works without guest login",
                    wa: true, gp: false, wp: false, db: false,
                  },
                  {
                    feature: "Multilingual interface",
                    wa: true, gp: true, wp: true, db: true,
                  },
                  {
                    feature: "Live gallery during wedding",
                    wa: true, gp: false, wp: false, db: false,
                  },
                  {
                    feature: "Bulk download (ZIP)",
                    wa: true, gp: "partial", wp: false, db: true,
                    gpNote: "Limited",
                    wpNote: "One by one",
                  },
                  {
                    feature: "Purpose-built for weddings",
                    wa: true, gp: false, wp: false, db: false,
                  },
                  {
                    feature: "Free plan available",
                    wa: true, gp: true, wp: true, db: "partial",
                    dbNote: "2 GB free only",
                  },
                ].map(({ feature, wa, gp, wp, db, wpNote, gpNote, dbNote }, i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4 font-medium text-[#0F1729]">{feature}</td>
                    <td className="p-4 text-center">
                      {wa === true ? <Check /> : wa === false ? <Cross /> : <Partial label={typeof wa === "string" ? wa : ""} />}
                    </td>
                    <td className="p-4 text-center">
                      {gp === true ? <Check /> : gp === false ? <Cross /> : <Partial label={gpNote ?? "Partial"} />}
                    </td>
                    <td className="p-4 text-center">
                      {wp === true ? <Check /> : wp === false ? <Cross /> : <Partial label={wpNote ?? "Partial"} />}
                    </td>
                    <td className="p-4 text-center">
                      {db === true ? <Check /> : db === false ? <Cross /> : <Partial label={dbNote ?? "Partial"} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Based on public features as of January 2025. Partial means the feature exists but with significant limitations for wedding use cases.
          </p>
        </section>

        {/* Individual reviews */}
        <section className="mb-12 space-y-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-6">
            Detailed breakdown of each option
          </h2>

          {/* Guestcam */}
          <div className="bg-white rounded-3xl border-2 p-7 shadow-sm" style={{ borderColor: "#C9820A" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2" style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}>
                  Our pick
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Guestcam</h3>
                <p className="text-sm text-gray-500">Purpose-built wedding photo sharing with QR code</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Free</p>
                <p className="text-xs text-gray-400">Paid plans from €39</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Guestcam is the only solution on this list that was designed
              specifically for weddings and similar events. The entire flow —
              from creating the gallery to downloading all photos — is built
              around real wedding scenarios.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">What works well</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Guests scan QR and upload with no login required",
                    "Photos stored at full original resolution",
                    "Printable QR card templates included",
                    "Live gallery projection during the reception",
                    "Multilingual (6 languages) interface",
                    "GDPR-compliant, EU data storage",
                    "One-click ZIP download after the wedding",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitations</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Free plan capped at 20 photos and 30 days of access",
                    "Newer service — less brand recognition",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Verdict:{" "}
              <span className="font-normal text-gray-600">
                The best choice for couples who want a simple, elegant solution
                that works for every guest — technical or not.
              </span>
            </p>
          </div>

          {/* Google Photos */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Google Photos</h3>
                <p className="text-sm text-gray-500">Shared albums for photo collection</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Free</p>
                <p className="text-xs text-gray-400">Up to 15 GB storage</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Google Photos is a familiar, well-known platform. Its shared albums
              feature lets multiple people contribute photos to a single album.
              Many couples consider it because they assume guests already have it.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">What works well</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Familiar brand — guests may already have it",
                    "Good photo organization features",
                    "Face grouping and search",
                    "Decent free storage tier",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitations</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Guests must have a Google account",
                    "Not all guests have Google accounts (especially older relatives)",
                    "No QR code — you must share a link",
                    "Photos compressed unless using original quality setting",
                    "No printable QR card templates",
                    "Not designed for weddings",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Verdict:{" "}
              <span className="font-normal text-gray-600">
                Works if all your guests have Google accounts and are tech-savvy.
                For mixed-age groups or non-Google users, it creates friction.
              </span>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">WhatsApp Group</h3>
                <p className="text-sm text-gray-500">Group chat photo sharing</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Free</p>
                <p className="text-xs text-gray-400">With a WhatsApp account</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Creating a WhatsApp group for wedding photos seems simple. Almost
              everyone has WhatsApp. Just add guests to a group and ask them to
              share. It sounds perfect — until you actually try it.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">What works well</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Near-universal adoption",
                    "Guests already have it",
                    "Real-time notifications",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitations</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Photos compressed up to 70% — no high quality",
                    "Group becomes chaotic with 100+ people",
                    "Downloading photos individually — no bulk download",
                    "Guests' phone numbers exposed to each other",
                    "Photos buried in conversation clutter",
                    "No organization, no albums, no search",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Verdict:{" "}
              <span className="font-normal text-gray-600">
                The compression issue alone makes it unsuitable for wedding
                photos. Fun for quick sharing during the day, terrible for
                keeping memories.
              </span>
            </p>
          </div>

          {/* Dropbox */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Dropbox</h3>
                <p className="text-sm text-gray-500">Cloud storage with shared folders</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Free</p>
                <p className="text-xs text-gray-400">2 GB free / €9.99/mo+</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Dropbox is excellent cloud storage. You can create a shared folder
              and ask guests to upload photos there. Files are stored at full
              quality. But the guest experience is where it breaks down.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">What works well</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Full quality file storage",
                    "Reliable and well-known brand",
                    "Good for large files",
                    "Works across all devices",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitations</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Guests must create a Dropbox account",
                    "Confusing for non-technical users",
                    "No QR code — only a link",
                    "2 GB free — fills up quickly with RAW photos",
                    "Not designed for events",
                    "No live gallery or real-time viewing",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Verdict:{" "}
              <span className="font-normal text-gray-600">
                Great for file storage, but painful for guests. Better suited
                for sharing files between colleagues than collecting photos at
                a wedding.
              </span>
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            The bottom line
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Here is the honest summary: every general-purpose photo sharing tool
            was designed for everyday use, not for the specific requirements of
            a wedding. They all have at least one major friction point that makes
            them unsuitable:
          </p>
          <div className="grid gap-3 mb-6">
            {[
              { name: "WhatsApp", problem: "Destroys photo quality with compression." },
              { name: "Google Photos", problem: "Requires a Google account — creates barriers for many guests." },
              { name: "Dropbox", problem: "Too complex for non-technical guests." },
              { name: "iCloud shared album", problem: "iPhone-only — Android guests are excluded." },
            ].map(({ name, problem }) => (
              <div key={name} className="flex gap-4 items-start bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">{name}</p>
                  <p className="text-sm text-gray-500">{problem}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed">
            Guestcam was built from day one to solve these exact problems. No
            app download. No login for guests. Full quality. QR code on the table.
            One-click ZIP download after. If you want every guest to be able to
            contribute — from the tech-savvy nephew to grandma with her old
            Android — Guestcam is the right tool for the job.
          </p>
        </section>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "#0F1729" }}>
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Ready to collect every wedding photo?
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create your QR gallery in 2 minutes — free, no credit card required.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Start for free →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Ready in 2 minutes · SSL secured · GDPR compliant · EU data storage
          </p>
        </div>
      </main>

      <SeoFooter lang="en" />
    </div>
  );
}
