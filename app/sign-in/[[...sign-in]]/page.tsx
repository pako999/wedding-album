import { SignIn } from "@clerk/nextjs";
import { CamLoveLogo } from "@/components/CamLoveLogo";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <CamLoveLogo size="md" showMark={true} />
          <p className="text-sm text-gray-400">Prijavite se za dostop do vaših albumov</p>
        </div>
        <SignIn
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-md rounded-2xl border border-[#946D00]/15 bg-white",
              headerTitle: "font-serif text-[#111111]",
              formButtonPrimary: "bg-[#111111] hover:bg-[#946D00] transition-colors rounded-xl",
              footerActionLink: "text-[#946D00] hover:text-[#152C66]",
            },
          }}
        />
      </div>
    </div>
  );
}
