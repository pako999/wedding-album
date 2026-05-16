import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-3">
            <span className="font-extrabold text-2xl text-[#2C2825] tracking-tight">WeddingAlbum</span>
            <span className="text-[#C9A96E] font-black text-3xl leading-none" style={{ marginTop: 2 }}>.</span>
          </div>
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
