"use client";

import { useEffect, useState } from "react";

/**
 * First-visit welcome overlay. Shows ONCE per guest per album
 * (localStorage), collects the guest's name so the rest of the gallery
 * greets them ready-to-upload. Pure overlay — the gallery renders
 * underneath, so a guest with storage blocked just sees it again.
 */
interface Props {
  albumSlug: string;
  title: string;
  text: string | null;
  button: string;
  bgUrl: string | null;
  fontStack: string;
  accent: string;
  logoUrl: string | null;
  initialName: string;
  onDone: (name: string) => void;
}

export function WelcomeScreen({ albumSlug, title, text, button, bgUrl, fontStack, accent, logoUrl, initialName, onDone }: Props) {
  const storageKey = `welcome-${albumSlug}`;
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(initialName);

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setVisible(true);
    } catch { setVisible(true); }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe first-visit check
  }, [storageKey]);

  if (!visible) return null;

  const done = () => {
    try { localStorage.setItem(storageKey, "1"); } catch { /* private mode */ }
    setVisible(false);
    onDone(name.trim());
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#0A0E19]">
        {bgUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(10,14,25,.88) 0%, rgba(10,14,25,.3) 55%, rgba(10,14,25,.4) 100%)" }} />
      </div>
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="absolute top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl object-cover border border-white/40 shadow-lg" />
      )}
      <div className="relative p-6 pb-10 max-w-md mx-auto w-full">
        <h1 className="text-white text-4xl leading-tight" style={{ fontFamily: fontStack }}>{title}</h1>
        {text && <p className="text-gray-200 text-sm mt-2">{text}</p>}
        <label className="block mt-5">
          <span className="block text-[11px] font-semibold text-gray-300 mb-1">Ime</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") done(); }}
            placeholder="Vpišite svoje ime"
            className="w-full px-4 py-3 rounded-xl bg-white/15 text-white placeholder-gray-400 text-sm outline-none border border-white/20 focus:border-white/50 backdrop-blur-sm"
          />
        </label>
        <button
          type="button"
          onClick={done}
          className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm text-[#111111] transition-all hover:brightness-95"
          style={{ background: accent }}
        >
          {button}
        </button>
      </div>
    </div>
  );
}
