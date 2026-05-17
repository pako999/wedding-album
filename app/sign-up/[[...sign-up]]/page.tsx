import { SignUp } from "@clerk/nextjs";
import { GuestcamLogo } from "@/components/GuestcamLogo";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <GuestcamLogo size="md" showMark={true} />
          <p className="text-sm text-gray-400">Ustvarite račun in začnite zbirati spomine</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-md rounded-2xl border border-[#C9A96E]/15 bg-white",
              headerTitle: "font-serif text-[#2C2825]",
              formButtonPrimary: "bg-[#2C2825] hover:bg-[#C9A96E] transition-colors rounded-xl",
              footerActionLink: "text-[#C9A96E] hover:text-[#B8945A]",
            },
          }}
        />
      </div>
    </div>
  );
}
