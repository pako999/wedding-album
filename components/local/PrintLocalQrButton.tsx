"use client";

export function PrintLocalQrButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-[color:var(--ink)] px-5 py-3 text-sm font-semibold text-[color:var(--paper)] hover:opacity-90 print:hidden"
    >
      🖨️ Natisni kartico
    </button>
  );
}
