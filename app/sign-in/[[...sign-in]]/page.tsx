import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { CamLoveLogo } from "@/components/CamLoveLogo";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[520px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <CamLoveLogo size="md" showMark={true} />
          <p className="mt-3 text-sm font-semibold text-black/50">
            Fotografije vseh gostov. En sam album.
          </p>
        </div>

        <section className="mb-5 overflow-hidden rounded-[28px] border-2 border-[#F4B400] bg-[#FFF4B8] p-5 shadow-[0_16px_45px_rgba(244,180,0,.16)] sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4B400] text-2xl">
              ✨
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#8C6800]">
                Ste prvič tukaj?
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight tracking-[-.035em] text-black sm:text-3xl">
                Ustvarite CamLove račun
              </h1>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Začnite brezplačno. Ustvarite svoj prvi album in QR kodo v nekaj minutah.
              </p>
            </div>
          </div>

          <Link
            href="/sign-up"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#F4B400] px-6 py-4 text-base font-black text-black shadow-[0_10px_25px_rgba(244,180,0,.28)] transition-transform hover:scale-[1.01]"
          >
            USTVARI BREZPLAČEN RAČUN
            <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-3 text-center text-xs font-semibold text-black/45">
            Brez kreditne kartice · brezplačni paket
          </p>
        </section>

        <div className="mb-4 flex items-center gap-4 px-2">
          <span className="h-px flex-1 bg-black/10" />
          <span className="text-xs font-black uppercase tracking-[.14em] text-black/35">
            Že imate račun? Prijavite se
          </span>
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <SignIn
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            layout: { logoImageUrl: "/camlove-logo.svg" },
            elements: {
              rootBox: "w-full",
              card: "shadow-xl rounded-[28px] border border-black/10 bg-white",
              headerTitle: "font-sans font-black text-[#111111] text-2xl",
              headerSubtitle: "text-black/50",
              socialButtonsBlockButton: "rounded-xl border-black/10 hover:bg-[#FFF7D6]",
              formFieldInput: "rounded-xl border-black/15",
              formButtonPrimary: "bg-black hover:bg-[#2a2a2a] transition-colors rounded-xl py-3.5 font-bold",
              footerAction: "hidden",
            },
          }}
        />
      </div>
    </main>
  );
}
