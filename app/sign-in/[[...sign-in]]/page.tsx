import { SignIn } from "@clerk/nextjs";
import { GuestcamLogo } from "@/components/GuestcamLogo";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <GuestcamLogo size="md" showMark={true} />
          <p className="text-sm text-gray-400">Prijavite se za dostop do vaših albumov</p>
        </div>
        <SignIn
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-md rounded-2xl border border-[#C9820A]/15 bg-white",
              headerTitle: "font-serif text-[#0F1729]",
              formButtonPrimary: "bg-[#0F1729] hover:bg-[#C9820A] transition-colors rounded-xl",
              footerActionLink: "text-[#C9820A] hover:text-[#152C66]",
            },
          }}
        />
      </div>
    </div>
  );
}
