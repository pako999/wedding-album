import Image from "next/image";

const qrPattern = [
  1,1,1,1,1,0,1,1,1,1,1,
  1,0,0,0,1,0,1,0,0,0,1,
  1,0,1,0,1,0,1,0,1,0,1,
  1,0,0,0,1,0,1,0,0,0,1,
  1,1,1,1,1,0,1,1,1,1,1,
  0,0,0,0,0,0,0,0,0,0,0,
  1,1,0,1,1,1,0,1,0,1,1,
  0,1,1,0,0,1,1,0,1,0,1,
  1,0,1,1,0,0,1,1,0,1,0,
  1,1,0,0,1,1,0,0,1,1,1,
  0,1,1,1,0,1,1,1,0,0,1,
] as const;

function FlowQR() {
  return (
    <div className="grid h-[84px] w-[84px] grid-cols-11 gap-[1px] rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black/8">
      {qrPattern.map((cell, i) => <span key={i} className={cell ? "bg-black" : "bg-white"} />)}
    </div>
  );
}

type Step = readonly [string, string, string?];

export function GuestcamGuestFlowVisual({ steps }: { steps: readonly Step[] }) {
  const first = steps[0] ?? ["Skenira QR kodo", "", "01"];
  const second = steps[1] ?? ["Izbere fotografije ali videe", "", "02"];
  const third = steps[2] ?? ["Vse je v vaši galeriji", "", "03"];

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-black/8 bg-[#F7F5EF] px-4 py-8 shadow-[0_24px_70px_rgba(17,17,17,.10)] sm:px-7 sm:py-10">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FFF2B3]/70 to-transparent" aria-hidden />
      <div className="relative grid gap-5 md:grid-cols-3 md:items-center">
        <PhoneShell label={first[0]} badge={first[2] || "01"}>
          <div className="relative h-full overflow-hidden rounded-[20px] bg-[#111827]">
            <Image src="/hero/wedding-avenue.webp" alt="" fill sizes="220px" className="object-cover opacity-55" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-x-0 top-5 flex justify-center"><span className="rounded-full bg-black/65 px-3 py-1 text-[8px] font-black uppercase tracking-[.14em] text-white">GUESTCAM QR</span></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative rounded-[22px] border-2 border-white/80 p-5 shadow-2xl backdrop-blur-[1px]">
                <span className="absolute -left-0.5 -top-0.5 h-5 w-5 border-l-4 border-t-4 border-[#F4B400]" />
                <span className="absolute -right-0.5 -top-0.5 h-5 w-5 border-r-4 border-t-4 border-[#F4B400]" />
                <span className="absolute -bottom-0.5 -left-0.5 h-5 w-5 border-b-4 border-l-4 border-[#F4B400]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 border-b-4 border-r-4 border-[#F4B400]" />
                <FlowQR />
              </div>
            </div>
          </div>
        </PhoneShell>

        <div className="hidden md:block absolute left-[31.7%] top-1/2 z-20 -translate-y-1/2 text-2xl font-black text-black/25">→</div>
        <PhoneShell label={second[0]} badge={second[2] || "02"} featured>
          <div className="h-full rounded-[20px] bg-white px-3 pb-3 pt-4">
            <div className="flex items-center justify-between"><span className="text-[9px] font-black">Guestcam</span><span className="h-2 w-2 rounded-full bg-[#F4B400]" /></div>
            <p className="mt-3 text-[11px] font-black leading-tight">{second[0]}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {["/hero/wedding-avenue.webp", "/events/party.webp", "/events/birthday-party.webp", "/events/babyshower.webp"].map((src, i) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-black/5">
                  <Image src={src} alt="" fill sizes="90px" className="object-cover" />
                  {i < 3 && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F4B400] text-[9px] font-black">✓</span>}
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-full bg-black px-3 py-2 text-center text-[9px] font-black text-white">{second[0]} →</div>
          </div>
        </PhoneShell>

        <div className="hidden md:block absolute left-[65.2%] top-1/2 z-20 -translate-y-1/2 text-2xl font-black text-black/25">→</div>
        <PhoneShell label={third[0]} badge={third[2] || "03"}>
          <div className="h-full rounded-[20px] bg-[#FFFDF8] px-3 pb-3 pt-4">
            <div className="flex items-center justify-between"><span className="text-[9px] font-black">Guestcam</span><span className="rounded-full bg-[#FFF2B3] px-2 py-0.5 text-[7px] font-black">✓ LIVE</span></div>
            <p className="mt-3 text-[11px] font-black leading-tight">{third[0]}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <div className="relative col-span-2 aspect-[2/1] overflow-hidden rounded-lg"><Image src="/hero/wedding-avenue.webp" alt="" fill sizes="190px" className="object-cover" /></div>
              <div className="relative aspect-square overflow-hidden rounded-lg"><Image src="/events/party.webp" alt="" fill sizes="90px" className="object-cover" /></div>
              <div className="relative aspect-square overflow-hidden rounded-lg"><Image src="/events/birthday-party.webp" alt="" fill sizes="90px" className="object-cover" /></div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[8px] font-bold text-black/55 shadow-sm ring-1 ring-black/5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F4B400] text-black">✓</span>{third[0]}</div>
          </div>
        </PhoneShell>
      </div>
    </div>
  );
}

function PhoneShell({ label, badge, featured = false, children }: { label: string; badge: string; featured?: boolean; children: React.ReactNode }) {
  return (
    <div className={`relative mx-auto w-full max-w-[220px] ${featured ? "md:-translate-y-4 md:scale-[1.04]" : ""}`}>
      <div className="rounded-[30px] bg-[#111111] p-[7px] shadow-[0_18px_40px_rgba(0,0,0,.22)]">
        <div className="relative aspect-[9/17] overflow-hidden rounded-[24px] bg-white">
          <div className="absolute left-1/2 top-2 z-20 h-3 w-12 -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute inset-x-0 bottom-0 top-0 p-2 pt-7">{children}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-center"><span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FFF2B3] px-1.5 text-[9px] font-black ring-1 ring-[#F4B400]/30">{badge}</span><span className="text-[11px] font-black leading-tight text-black/65">{label}</span></div>
    </div>
  );
}
