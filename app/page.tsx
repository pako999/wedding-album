import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // Public landing — show a minimal splash
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <svg className="w-6 h-6 text-[#C9A96E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21C12 21 3 13.5 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
          </svg>
          <span className="font-serif italic text-2xl font-semibold text-[#2C2825]">Wedding Album</span>
        </div>
        <h1 className="font-serif text-4xl font-light text-[#2C2825] mb-4">
          Delite poročne spomine<br />
          <em className="italic text-[#C9A96E]">z vašimi gosti</em>
        </h1>
        <p className="font-sans text-sm text-[#2C2825]/60 mb-8 leading-relaxed">
          Gostje naložijo fotografije s telefona, vi jih prejmete urejene v enem albumu.
        </p>
        <a
          href="https://wedflow.app"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#2C2825] text-[#FAF7F2] font-sans text-sm font-medium rounded-xl hover:bg-[#C9A96E] transition-colors"
        >
          Pojdi na WedFlow
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
        <p className="font-sans text-xs text-[#2C2825]/40 mt-6">
          Wedding Album je del <a href="https://wedflow.app" className="text-[#C9A96E]">WedFlow</a> — slovenskega orodja za načrtovanje porok.
        </p>
      </div>
    </div>
  );
}
