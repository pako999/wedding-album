import Link from "next/link";
import type { Metadata } from "next";
import { GUIDE_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Wedding Photo Sharing App — Complete Guide 2025 | Guestcam",
  description:
    "The best way to share wedding photos with guests. No app downloads, full quality, instant QR code upload. See why couples choose Guestcam over Google Photos and WhatsApp.",
  openGraph: {
    title: "Wedding Photo Sharing App — Complete Guide 2025",
    description:
      "Collect all your guests' photos with one QR code. No app needed, full resolution, private and secure.",
    type: "article",
    images: [ogImage("Wedding Photo Sharing App — Complete Guide 2025")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Photo Sharing App — Complete Guide 2025",
    description: "Collect all your guests' photos with one QR code.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://guestcam.si/en/wedding-photo-sharing",
    languages: {
      "sl": "https://guestcam.si/sl/qr-koda-poroka",
      "hr": "https://guestcam.si/hr/qr-kod-vjencanje",
      "sr": "https://guestcam.si/sr/qr-kod-vencanje",
      "de": "https://guestcam.si/de/hochzeitsfotos-sammeln",
      "en": "https://guestcam.si/en/wedding-photo-sharing",
      "es": "https://guestcam.si/es/fotos-boda-qr",
      "x-default": "https://guestcam.si/sl/qr-koda-poroka",
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

function CtaBox() {
  return (
    <div
      className="rounded-3xl p-8 my-12 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(255,201,77,0.12) 0%, rgba(255,201,77,0.12) 100%)",
        border: "1px solid rgba(255,201,77,0.2)",
      }}
    >
      <p className="font-serif text-2xl font-bold text-[#0F1729] mb-3">
        Ready to collect all your wedding photos?
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Create your gallery in 2 minutes. Free forever — no credit card required.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
        style={{ background: "#FFC94D", boxShadow: "0 10px 30px rgba(255,201,77,0.35)" }}
      >
        Start for free →
      </Link>
    </div>
  );
}

export default function WeddingPhotoSharingPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang="en" hreflang={GUIDE_HREFLANG} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}
          >
            Guide · English · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Wedding Photo Sharing App — the complete guide
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Every guest at your wedding takes photos. Beautiful candid moments,
            silly dance-floor shots, tearful toasts — all captured on dozens of
            different phones. But how many of those photos actually make it back
            to you? If the answer is &ldquo;not many,&rdquo; this guide is for you.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Read time: ~6 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Updated: January 2025
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Why traditional wedding photo sharing fails
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Couples spend months planning their wedding — the venue, the flowers,
            the dress. Yet when it comes to collecting photos from guests, the
            strategy is usually&hellip; nothing. Here is what typically happens:
          </p>
          <div className="grid gap-4">
            {[
              { title: "Photos stay on guests' phones", desc: "Everyone means to send their photos. Few actually do. Three months later, those memories are still buried in someone's camera roll." },
              { title: "WhatsApp destroys quality", desc: "WhatsApp compresses images by up to 70%. Those beautiful high-res shots get turned into blurry, unprintable files before they even reach you." },
              { title: "Google Photos requires sign-in", desc: "Sharing a Google Photos album is great — in theory. In practice, many guests don't have a Google account or can't remember their password." },
              { title: "Dropbox is complicated for non-techies", desc: "Uploading to Dropbox means downloading an app, creating an account, finding the shared folder&hellip; most guests give up before step two." },
              { title: "Email threads get out of hand", desc: "Emailing dozens of guests, waiting for responses, downloading attachments — tedious for you, inconvenient for them." },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,201,77,0.1)" }}>
                  <svg className="w-4 h-4" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729]">{title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CtaBox />

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            How QR code photo sharing works at weddings
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            A wedding photo sharing app with QR codes eliminates every friction
            point. Here&apos;s the experience from a guest&apos;s perspective:
          </p>
          <div className="space-y-4">
            {[
              { step: "1", title: "Spot the QR card on the table", desc: "A beautifully designed card sits at the center of each table. It has the couple's names, the wedding date, and a QR code." },
              { step: "2", title: "Open the phone camera", desc: "Point it at the QR code. No app download, no App Store, no Google Play." },
              { step: "3", title: "The gallery opens instantly", desc: "A web page opens directly in the browser — fully optimized for mobile. The interface matches the language of the device automatically." },
              { step: "4", title: "Upload photos and videos", desc: "The guest selects photos from their camera roll (or takes new ones) and hits upload. Full original quality. Done." },
              { step: "5", title: "You see it in real time", desc: "Every uploaded photo appears instantly in the couple's gallery. Some couples project a live slideshow during dinner — the guests love it." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5" style={{ background: "#FFC94D", color: "#0F1729" }}>
                  {step}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 shadow-sm">
                  <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            What makes Guestcam different
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📸", title: "Full original quality", desc: "No compression, no resizing. Every file is stored exactly as the guest uploaded it." },
              { icon: "📱", title: "No app required", desc: "Works in any modern mobile browser. Guests scan and upload within 15 seconds." },
              { icon: "🌍", title: "Multilingual interface", desc: "The gallery UI appears in the guest's device language — Slovenian, Croatian, English, German, Spanish, Serbian." },
              { icon: "⚡", title: "Live gallery", desc: "Watch photos appear in real time during the reception. Perfect for a projected slideshow." },
              { icon: "🔒", title: "Fully private", desc: "Your gallery is accessible only via your unique QR code or link — never indexed by search engines." },
              { icon: "🎨", title: "Printable QR cards", desc: "Choose from 8 elegant card templates that automatically include your names, date and QR code." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — Tips */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Tips for maximizing guest photo uploads
          </h2>
          <ul className="space-y-3 text-gray-600">
            {[
              "Place a QR card at every table — not just one at the entrance.",
              "Have the MC announce the gallery during dinner: \"Scan the QR code on your table to share your photos!\"",
              "Print larger cards (A5 or A4) for visibility. Smaller table cards get overlooked.",
              "Add a brief instruction in multiple languages for international guests.",
              "Test your QR code before the wedding — scan it yourself and upload a test photo.",
              "Enable the live gallery feature for a projected slideshow during the reception.",
              "Send a reminder link to guests a week after the wedding for any photos they forgot to upload.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,201,77,0.15)" }}>
                  <svg className="w-3 h-3" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {[
              { q: "Is Guestcam really free?", a: "Yes, the basic plan is free forever — you get a unique QR code and gallery for up to 50 guests and 200 photos. Paid plans unlock unlimited guests, unlimited photos, and extra features." },
              { q: "Do guests need to download an app?", a: "No. The gallery opens directly in the mobile browser. No installation, no account, no password." },
              { q: "What photo quality is stored?", a: "Full original resolution. We never compress or resize guest photos. Every file is stored exactly as uploaded." },
              { q: "Is the gallery private?", a: "Yes. Your gallery is accessible only via your unique QR code or direct link. It is never indexed by Google or other search engines." },
              { q: "How do I download all the photos?", a: "From your dashboard, click Download All. All photos and videos are packaged into a ZIP file and downloaded in one click." },
              { q: "Can guests upload videos?", a: "Yes, video uploads are supported on Plus and Premium plans." },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-100 rounded-2xl group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#0F1729] list-none text-sm">
                  {q}
                  <svg className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "#0F1729" }}>
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Your wedding deserves every memory
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create a QR photo gallery in 2 minutes — free, no credit card needed.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Create your gallery →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Ready in 2 minutes · SSL secured · GDPR compliant
          </p>
        </div>
      </main>

      <SeoFooter lang="en" />
    </div>
  );
}
