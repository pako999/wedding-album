import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import { safeJsonLd } from "@/lib/seo/jsonld-safe";

export const metadata: Metadata = {
  title: "Mejores Apps para Compartir Fotos de Boda 2025",
  description:
    "Comparativa: Guestcam vs Google Photos vs WhatsApp vs Dropbox. ¿Cuál es la mejor app para recopilar fotos de boda? Análisis honesto de pros y contras.",
  openGraph: {
    title: "Mejores Apps para Compartir Fotos de Boda 2025",
    description:
      "Comparativa honesta de soluciones para recopilar fotos de boda. Calidad, privacidad, precio — todo en un solo lugar.",
    type: "article",
    images: [ogImage("Mejores Apps para Compartir Fotos de Boda")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mejores Apps para Compartir Fotos de Boda 2025",
    description: "Comparativa honesta de soluciones para recopilar fotos de boda.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://www.guestcam.si/es/alternativas",
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

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Mejores Apps para Compartir Fotos de Boda 2025",
  description:
    "Comparativa: Guestcam vs Google Photos vs WhatsApp vs Dropbox. ¿Cuál es la mejor app para recopilar fotos de boda?",
  inLanguage: "es-ES",
  author: { "@type": "Organization", name: "Guestcam" },
  publisher: {
    "@type": "Organization",
    name: "Guestcam",
    logo: "https://www.guestcam.si/icon-512.png",
  },
  mainEntityOfPage: "https://www.guestcam.si/es/alternativas",
};


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          <a href="mailto:info@guestcam.si" className="hover:text-white transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
}

function Check() {
  return (
    <svg className="w-5 h-5 mx-auto text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
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
    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function AlternativasPage() {
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <SiteHeader lang="es" hreflang={ALTERNATIVES_HREFLANG} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest bg-[#FFF3CC] text-[#C9820A]">
            Comparativa · España · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Mejores apps para compartir fotos de boda
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Estás organizando una boda y buscas una forma sencilla para que los
            invitados compartan fotos. Seguramente ya has pensado en Google
            Photos, WhatsApp o pedirlas por correo. Pero, ¿cuál es realmente la
            mejor solución para una boda? En esta comparativa honesta repasamos
            todas las opciones principales — y mostramos claramente en qué
            falla cada una.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tiempo de lectura: ~8 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M16.5 6.108c1.131.094 1.976 1.057 1.976 2.192V18A2.25 2.25 0 0116.226 20.25H7.5A2.25 2.25 0 015.25 18V8.3c0-1.135.844-2.098 1.976-2.192" />
              </svg>
              Actualizado: enero 2025
            </span>
          </div>
        </div>

        {/* Criteria */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Qué buscar en una app para fotos de boda
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Antes de comparar herramientas concretas, conviene definir qué hace
            que una solución para fotos de boda sea realmente buena. Los
            requisitos son bastante específicos:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Sin descargar app para los invitados", desc: "Tus invitados son de distintas edades y niveles tecnológicos. La mejor solución funciona para todos, en cualquier navegador." },
              { title: "Calidad original completa", desc: "Las fotos deben servir para imprimir. Sin compresión, sin reducción — solo archivos originales." },
              { title: "Subida rápida", desc: "Los invitados quieren disfrutar de la boda, no perder tiempo. Subir una foto debería llevar menos de 30 segundos." },
              { title: "Privacidad por defecto", desc: "Las fotos de boda son personales. No quieres que Google las indexe ni que estén accesibles a desconocidos." },
              { title: "Gestión sencilla para la pareja", desc: "Crear la galería, descargar fotos y gestionar accesos debe ser simple incluso para usuarios poco técnicos." },
              { title: "Precio justo", desc: "Una boda ya cuesta mucho. La solución de fotos debería ser asequible o gratuita, sin costes ocultos." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FFF3CC]">
                  <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
        <section className="mb-12 -mx-6 px-6 py-12 bg-[#FFF9EC]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
              Comparativa rápida
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: "#0F1729" }}>
                    <th className="p-4 text-white font-semibold">Característica</th>
                    <th className="p-4 text-center text-[#FFC94D] font-bold">Guestcam</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Google Photos</th>
                    <th className="p-4 text-center text-gray-300 font-medium">WhatsApp</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Dropbox</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Sin app para los invitados", wa: true, gp: false, wp: false, db: false, gpNote: "Cuenta requerida", wpNote: "App requerida", dbNote: "App requerida" },
                    { feature: "Calidad original completa", wa: true, gp: "partial", wp: false, db: true, wpNote: "Compresión del 70 %", gpNote: "Comprimido por defecto" },
                    { feature: "Código QR para acceso rápido", wa: true, gp: false, wp: false, db: false },
                    { feature: "Privado (sin indexación)", wa: true, gp: "partial", wp: true, db: true, gpNote: "Depende de la configuración" },
                    { feature: "Funciona sin login del invitado", wa: true, gp: false, wp: false, db: false },
                    { feature: "Interfaz multilingüe", wa: true, gp: true, wp: true, db: true },
                    { feature: "Galería en directo durante la boda", wa: true, gp: false, wp: false, db: false },
                    { feature: "Descarga masiva (ZIP)", wa: true, gp: "partial", wp: false, db: true, gpNote: "Limitado", wpNote: "Una por una" },
                    { feature: "Diseñado específicamente para bodas", wa: true, gp: false, wp: false, db: false },
                    { feature: "Plan gratuito disponible", wa: true, gp: true, wp: true, db: "partial", dbNote: "Solo 2 GB" },
                  ].map(({ feature, wa, gp, wp, db, wpNote, gpNote, dbNote }, i) => (
                    <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 font-medium text-[#0F1729]">{feature}</td>
                      <td className="p-4 text-center">{wa === true ? <Check /> : wa === false ? <Cross /> : <Partial label={typeof wa === "string" ? wa : ""} />}</td>
                      <td className="p-4 text-center">{gp === true ? <Check /> : gp === false ? <Cross /> : <Partial label={gpNote ?? "Parcial"} />}</td>
                      <td className="p-4 text-center">{wp === true ? <Check /> : wp === false ? <Cross /> : <Partial label={wpNote ?? "Parcial"} />}</td>
                      <td className="p-4 text-center">{db === true ? <Check /> : db === false ? <Cross /> : <Partial label={dbNote ?? "Parcial"} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Datos basados en funciones públicas en enero de 2025. »Parcial« significa que la función existe, pero con limitaciones importantes para bodas.
            </p>
          </div>
        </section>

        {/* Individual reviews */}
        <section className="mb-12 space-y-8">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-2">
            Análisis detallado de cada opción
          </h2>

          {/* Guestcam */}
          <div className="bg-white rounded-3xl border-2 p-7 shadow-sm border-[#FFC94D]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-[#FFF3CC] text-[#C9820A]">
                  Nuestra recomendación
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Guestcam</h3>
                <p className="text-sm text-gray-500">Herramienta específica para fotos de boda con código QR</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Gratis</p>
                <p className="text-xs text-gray-400">Planes de pago desde 39 €</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Guestcam es la única solución de esta lista diseñada
              específicamente para bodas y eventos similares. Todo el flujo —
              desde crear la galería hasta descargar todas las fotos — está
              pensado para escenarios reales de boda.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Qué funciona muy bien</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Los invitados escanean el QR y suben fotos sin registro",
                    "Fotos en resolución original completa",
                    "Plantillas imprimibles de tarjetas QR incluidas",
                    "Galería en directo durante la celebración",
                    "Interfaz en seis idiomas (sl, hr, sr, en, de, es)",
                    "Cumple el RGPD, datos en la UE",
                    "Descarga de todas las fotos en ZIP con un clic",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitaciones</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Plan gratuito limitado a 20 fotos y 30 días de acceso",
                    "Servicio más reciente — menor notoriedad de marca",
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
              Veredicto:{" "}
              <span className="font-normal text-gray-600">
                La mejor opción para parejas que quieren una solución sencilla y
                elegante que funcione para cualquier invitado — sea o no
                tecnológicamente diestro.
              </span>
            </p>
          </div>

          {/* Google Photos */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Google Photos</h3>
                <p className="text-sm text-gray-500">Álbumes compartidos para recopilar fotos</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Gratis</p>
                <p className="text-xs text-gray-400">Hasta 15 GB de almacenamiento</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Google Photos es una plataforma conocida y consolidada. Su
              función de álbumes compartidos permite que varias personas
              añadan fotos a un mismo álbum. Muchas parejas la consideran
              porque suponen que sus invitados ya la usan.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Qué funciona bien</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Marca conocida — los invitados quizá ya la utilizan",
                    "Buenas funciones de organización de fotos",
                    "Reconocimiento facial y búsqueda",
                    "Capa gratuita generosa",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitaciones</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Los invitados necesitan una cuenta de Google",
                    "No todos la tienen (especialmente familiares mayores)",
                    "Sin código QR — solo enlace",
                    "Fotos comprimidas salvo en la opción de calidad original",
                    "No hay plantillas imprimibles de tarjetas QR",
                    "No está pensado para bodas",
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
              Veredicto:{" "}
              <span className="font-normal text-gray-600">
                Funciona si todos tus invitados tienen cuenta de Google y se
                manejan bien. Para grupos de edades mixtas crea una fricción
                innecesaria.
              </span>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Grupo de WhatsApp</h3>
                <p className="text-sm text-gray-500">Compartir fotos en un chat de grupo</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Gratis</p>
                <p className="text-xs text-gray-400">Con cuenta de WhatsApp</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Crear un grupo de WhatsApp para las fotos de boda parece fácil.
              Casi todo el mundo tiene WhatsApp. Añades a los invitados y les
              pides que compartan. Suena perfecto — hasta que lo pruebas de
              verdad.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Qué funciona bien</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Adopción casi universal",
                    "Los invitados ya tienen la app",
                    "Notificaciones en tiempo real",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitaciones</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Fotos comprimidas hasta un 70 % — sin alta calidad",
                    "Un grupo con más de 100 personas se vuelve caótico",
                    "Descarga foto a foto — sin descarga masiva",
                    "Los números de teléfono de los invitados quedan expuestos",
                    "Las fotos se pierden entre la avalancha de mensajes",
                    "Sin organización, sin álbumes, sin búsqueda",
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
              Veredicto:{" "}
              <span className="font-normal text-gray-600">
                Solo por la compresión, WhatsApp no es adecuado para recuerdos
                duraderos. Útil para compartir rápido el mismo día, pésimo
                para guardar la memoria a largo plazo.
              </span>
            </p>
          </div>

          {/* Dropbox */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Dropbox</h3>
                <p className="text-sm text-gray-500">Almacenamiento en la nube con carpetas compartidas</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Gratis</p>
                <p className="text-xs text-gray-400">2 GB gratis / 9,99 €/mes+</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Dropbox es un excelente almacenamiento en la nube. Puedes crear
              una carpeta compartida y pedir a los invitados que suban las
              fotos allí. Los archivos se guardan en calidad completa. Pero la
              experiencia para los invitados es donde flaquea.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Qué funciona bien</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Almacenamiento en calidad completa",
                    "Marca fiable y bien conocida",
                    "Apto para archivos grandes",
                    "Funciona en todos los dispositivos",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Limitaciones</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Los invitados deben crear una cuenta de Dropbox",
                    "Confuso para usuarios poco técnicos",
                    "Sin código QR — solo un enlace",
                    "2 GB gratis — se llenan rápido con fotos en RAW",
                    "No está diseñado para eventos",
                    "Sin galería en directo ni vista en tiempo real",
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
              Veredicto:{" "}
              <span className="font-normal text-gray-600">
                Genial para almacenar archivos, pero engorroso para los
                invitados. Más útil para compartir entre compañeros de
                trabajo que para recopilar fotos en una boda.
              </span>
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Conclusión
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            En resumen honesto: cada herramienta de uso general fue diseñada
            para el día a día, no para los requisitos específicos de una
            boda. Todas tienen al menos un obstáculo grande que las hace
            poco adecuadas:
          </p>
          <div className="grid gap-3 mb-6">
            {[
              { name: "WhatsApp", problem: "Destruye la calidad de las fotos con la compresión." },
              { name: "Google Photos", problem: "Requiere cuenta de Google — barrera para muchos invitados." },
              { name: "Dropbox", problem: "Demasiado complejo para invitados poco técnicos." },
              { name: "Álbum compartido de iCloud", problem: "Solo iPhone — los invitados con Android quedan fuera." },
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
            Guestcam fue construido desde el primer día para resolver
            exactamente estos problemas. Sin instalar nada. Sin login para los
            invitados. Calidad completa. Código QR en la mesa. Descarga de
            todo en ZIP con un clic tras la boda. Si quieres que todos los
            invitados puedan participar — desde el sobrino tecnológico hasta
            la abuela con un móvil antiguo — Guestcam es la herramienta
            adecuada.
          </p>
        </section>

        {/* Final dark CTA */}
        <div className="rounded-3xl p-8 text-center bg-[#0F1729]">
          <p className="font-serif text-3xl font-bold text-white mb-3">
            ¿Listo para recopilar todas las fotos de boda?
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Crea tu galería con código QR en 2 minutos — gratis, sin tarjeta de crédito.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFC94D] text-[#0F1729] font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:brightness-95"
          >
            Empezar gratis →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Listo en 2 minutos · SSL · Conforme al RGPD · Datos en la UE
          </p>
        </div>
      </main>

      <SeoFooter lang="es" />
    </div>
  );
}
