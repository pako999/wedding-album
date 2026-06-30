import Link from "next/link";
import type { Metadata } from "next";
import { GUIDE_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Código QR para boda: recopila las fotos de tus invitados (2026) | Guestcam",
  description:
    "App para fotos de boda con código QR: los invitados escanean, tú recibes todas las fotos en calidad original. Sin instalar nada. Configura en 2 minutos.",
  openGraph: {
    title: "Código QR para boda: recopila las fotos de tus invitados (2026)",
    description:
      "Recopila todas las fotos de tus invitados con un código QR. Sin app, resolución completa, privado y seguro.",
    type: "article",
    images: [ogImage("Código QR para boda — fotos de invitados")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Código QR para boda: recopila las fotos de tus invitados",
    description: "Recopila todas las fotos de tus invitados con un código QR.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://guestcam.si/es/fotos-boda-qr",
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
            Privacidad
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Términos
          </Link>
          <a href="mailto:hello@guestcam.me" className="hover:text-white transition-colors">
            Contacto
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
        Crea tu galería de boda en 2 minutos
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Gratis para siempre — sin tarjeta de crédito.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
        style={{ background: "#FFC94D", boxShadow: "0 10px 30px rgba(255,201,77,0.35)" }}
      >
        Empezar gratis ahora →
      </Link>
    </div>
  );
}

export default function FotosBodaQrPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang="es" hreflang={GUIDE_HREFLANG} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}
          >
            Guía · España · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Código QR para boda: recopila todas las fotos de tus invitados (sin app)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Cada invitado en tu boda hace fotos. Momentos espontáneos, abrazos
            emotivos, risas en la pista de baile — todo captado en docenas de
            teléfonos distintos. Pero, ¿cuántas de esas fotos llegan realmente
            a ti? Con un código QR para bodas, la respuesta es: todas.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tiempo de lectura: ~6 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Actualizado: enero 2025
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            El problema: las fotos de boda se pierden
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            En una boda típica con 100 invitados, cada uno saca al menos 20–30
            fotos. Eso son hasta 3.000 imágenes que casi nunca llegan a la
            pareja. ¿Por qué?
          </p>
          <div className="grid gap-4">
            {[
              { title: "Los invitados se olvidan de enviarlas", desc: "Tras la boda pasan días, semanas, meses. Las fotos siguen en el teléfono y nadie se acuerda de compartirlas." },
              { title: "WhatsApp comprime hasta el 70 %", desc: "Lo que empieza como una foto de alta resolución llega borrosa e imprimible. Perfecta para recordar mal un momento perfecto." },
              { title: "Google Fotos requiere iniciar sesión", desc: "Muchos invitados no tienen cuenta de Google o no recuerdan su contraseña. Compartir por Google Fotos falla antes del primer clic." },
              { title: "Dropbox es complicado para no técnicos", desc: "Descargar la app, crear cuenta, encontrar la carpeta compartida&hellip; la mayoría renuncia antes del segundo paso." },
              { title: "El correo electrónico es engorroso para todos", desc: "Escribir a cien invitados y esperar respuestas es tedioso para ti e incómodo para ellos." },
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
            La solución: fotos de boda con código QR
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Guestcam elimina cada punto de fricción. Así lo vive un invitado:
          </p>
          <div className="space-y-4">
            {[
              { step: "1", title: "Ve la tarjeta QR en la mesa", desc: "Una tarjeta elegante en el centro de la mesa tiene los nombres de la pareja, la fecha de la boda y un código QR." },
              { step: "2", title: "Abre la cámara del móvil", desc: "La apunta al código QR. Sin descarga de apps, sin App Store, sin Google Play." },
              { step: "3", title: "La galería se abre al instante", desc: "Una página web se abre directamente en el navegador — totalmente optimizada para móviles. La interfaz aparece automáticamente en español." },
              { step: "4", title: "Sube las fotos", desc: "El invitado selecciona fotos de su galería y pulsa subir. Calidad original completa. Listo." },
              { step: "5", title: "Tú lo ves en tiempo real", desc: "Cada foto subida aparece al instante en tu galería. Muchas parejas proyectan un pase de diapositivas en vivo durante la cena — a los invitados les encanta." },
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
            Por qué Guestcam es la mejor opción
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📸", title: "Calidad original completa", desc: "Sin compresión, sin reducción. Cada archivo se almacena exactamente como el invitado lo subió." },
              { icon: "📱", title: "Sin app necesaria", desc: "Funciona en cualquier navegador móvil moderno. Los invitados escanean y suben en menos de 20 segundos." },
              { icon: "🌍", title: "Interfaz multilingüe", desc: "La galería aparece en el idioma del dispositivo del invitado — español, inglés, alemán, esloveno, croata." },
              { icon: "⚡", title: "Galería en vivo", desc: "Las fotos aparecen en tiempo real. Perfecto para proyectar un pase de diapositivas durante el banquete." },
              { icon: "🔒", title: "Totalmente privada", desc: "Tu galería solo es accesible mediante tu código QR único o enlace directo — nunca indexada por buscadores." },
              { icon: "🎨", title: "Tarjetas QR para imprimir", desc: "Elige entre 8 elegantes plantillas que incluyen automáticamente vuestros nombres, la fecha y el código QR." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Consejos para maximizar las subidas de fotos
          </h2>
          <ul className="space-y-3 text-gray-600">
            {[
              "Coloca una tarjeta QR en cada mesa — no solo una en la entrada.",
              "Pide al maestro de ceremonias que anuncie la galería durante la cena.",
              "Las tarjetas más grandes (A5 o A4) son más visibles y los invitados las notan antes.",
              "Añade una breve instrucción en español e inglés para los invitados internacionales.",
              "Prueba el código QR antes de la boda — escanéalo tú mismo y sube una foto de prueba.",
              "Activa la función de galería en vivo para proyectar un pase de diapositivas durante el banquete.",
              "Envía un recordatorio a los invitados una semana después para cualquier foto que hayan olvidado subir.",
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
            Preguntas frecuentes sobre las fotos de boda con QR
          </h2>
          <div className="space-y-3">
            {[
              { q: "¿Es Guestcam realmente gratis?", a: "Sí, el plan básico es gratuito para siempre: obtienes un código QR único y una galería para hasta 50 invitados y 200 fotos. Los planes de pago desbloquean invitados y fotos ilimitados, y más funciones." },
              { q: "¿Tienen que descargar una app los invitados?", a: "No. La galería se abre directamente en el navegador del móvil. Sin instalación, sin cuenta, sin contraseña." },
              { q: "¿Con qué calidad se almacenan las fotos?", a: "En resolución original completa. Nunca comprimimos ni redimensionamos las fotos de los invitados. Cada archivo se almacena exactamente como se subió." },
              { q: "¿Es privada la galería?", a: "Sí. Tu galería solo es accesible mediante tu código QR único o enlace directo. Ningún buscador la indexará jamás." },
              { q: "¿Cómo descargo todas las fotos?", a: "Desde tu panel, haz clic en Descargar todo. Todas las fotos y vídeos se empaquetan en un archivo ZIP con un solo clic." },
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
            Tu boda merece todos los recuerdos
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Crea una galería QR en 2 minutos — gratis, sin tarjeta de crédito.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Empezar gratis →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Lista en 2 minutos · Protección SSL · Cumple con el RGPD
          </p>
        </div>
      </main>

      <SeoFooter lang="es" />
    </div>
  );
}
