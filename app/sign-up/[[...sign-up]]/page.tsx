import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { CamLoveLogo } from "@/components/CamLoveLogo";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[520px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <CamLoveLogo size="md" showMark={true} />
          <span className="mt-4 rounded-full bg-[#FFF0A8] px-4 py-2 text-xs font-black uppercase tracking-[.14em] text-[#8C6800]">
            Brezplačen začetek
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-.04em] text-black sm:text-4xl">
            Ustvarite svoj CamLove račun
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-black/55 sm:text-base">
            V nekaj minutah dobite zasebno galerijo in QR kodo za svoj dogodek.
          </p>
        </div>

        <SignUp
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl rounded-[28px] border border-black/10 bg-white",
              headerTitle: "font-sans font-black text-[#111111] text-2xl",
              headerSubtitle: "text-black/50",
              socialButtonsBlockButton: "rounded-xl border-black/10 hover:bg-[#FFF7D6]",
              formFieldInput: "rounded-xl border-black/15",
              formButtonPrimary: "bg-[#F4B400] hover:bg-[#DFA500] text-black transition-colors rounded-xl py-3.5 font-black",
              footerAction: "hidden",
            },
          }}
        />

        <div className="mt-5 rounded-[22px] border border-black/10 bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-black/50">Že imate CamLove račun?</p>
          <Link
            href="/sign-in"
            className="mt-3 block rounded-full bg-black px-6 py-3.5 text-sm font-black text-white"
          >
            PRIJAVA V OBSTOJEČ RAČUN →
          </Link>
        </div>
      </div>
    </main>
  );
}
