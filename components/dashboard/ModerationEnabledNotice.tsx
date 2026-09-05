import Link from "next/link";

export function ModerationEnabledNotice({ albumSlug }: { albumSlug: string }) {
  return (
    <div
      className="rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-4 shadow-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none" aria-hidden="true">⚠️</span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold uppercase tracking-wide text-amber-900">
            Ročna odobritev je vključena
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-amber-950">
            Nove fotografije in videi po nalaganju ne bodo vidni v albumu ali na Foto steni.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            Vsako novo objavo morate ročno odobriti v nadzorni plošči pod »V čakanju«.
          </p>
          <Link
            href={`/dashboard/${albumSlug}?tab=pending`}
            className="mt-3 inline-flex items-center rounded-lg bg-amber-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-950"
          >
            Odpri čakajoče objave →
          </Link>
        </div>
      </div>
    </div>
  );
}
