import Link from "next/link";
import type { AdminEvent } from "@/lib/admin-events";
import { daysBetweenIsoDates } from "@/lib/admin-events";

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "Poroka",
  birthday: "Rojstni dan",
  anniversary: "Obletnica",
  party: "Zabava",
  baptism: "Krst",
  graduation: "Diploma",
  other: "Dogodek",
};

function dateParts(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return { day: "–", month: "Neznano", full: isoDate };
  return {
    day: new Intl.DateTimeFormat("sl-SI", { day: "2-digit", timeZone: "UTC" }).format(date),
    month: new Intl.DateTimeFormat("sl-SI", { month: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
    full: new Intl.DateTimeFormat("sl-SI", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
  };
}

function statusLabel(days: number): { label: string; className: string } {
  if (!Number.isFinite(days)) return { label: "Neveljaven datum", className: "bg-red-50 text-red-700" };
  if (days === 0) return { label: "Danes", className: "bg-emerald-100 text-emerald-800" };
  if (days === 1) return { label: "Jutri", className: "bg-amber-100 text-amber-800" };
  if (days > 1) return { label: `Čez ${days} dni`, className: "bg-blue-50 text-blue-700" };
  if (days === -1) return { label: "Včeraj", className: "bg-gray-100 text-gray-600" };
  return { label: `Pred ${Math.abs(days)} dnevi`, className: "bg-gray-100 text-gray-600" };
}

export function AdminEventList({
  events,
  today,
  emptyMessage = "Ni dogodkov v tem obdobju.",
}: {
  events: AdminEvent[];
  today: string;
  emptyMessage?: string;
}) {
  if (events.length === 0) {
    return <p className="px-5 py-12 text-center text-sm text-gray-400">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {events.map((event) => {
        const date = dateParts(event.weddingDate);
        const status = statusLabel(daysBetweenIsoDates(today, event.weddingDate));
        const eventType = EVENT_TYPE_LABELS[event.eventType] ?? "Dogodek";

        return (
          <article key={event.id} className="flex items-start gap-3 px-4 py-4 sm:items-center sm:gap-5 sm:px-5">
            <div className="w-14 shrink-0 overflow-hidden rounded-xl border border-[#FFE3A2] bg-[#FFF9EC] text-center">
              <div className="bg-[#FFC94D] px-1 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0F1729]">
                {date.month}
              </div>
              <div className="py-1.5 text-xl font-extrabold leading-none text-[#0F1729]">{date.day}</div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="truncate font-bold text-[#0F1729]">{event.coupleName}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium capitalize text-gray-500">
                {date.full}{event.eventTime ? ` ob ${event.eventTime}` : " · ura ni vpisana"}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>{eventType}</span>
                {event.location && <span>📍 {event.location}</span>}
                <span className="uppercase">{event.plan}</span>
                <span>{event.photoCount} slik</span>
                <span>{event.isPublished ? "Objavljeno" : "Osnutek"}</span>
              </div>
              {event.ownerEmail ? (
                <a
                  href={`mailto:${event.ownerEmail}`}
                  className="mt-1.5 block w-fit max-w-full truncate text-xs font-semibold text-[#3551A8] hover:underline"
                >
                  {event.ownerEmail}
                </a>
              ) : (
                <p className="mt-1.5 text-xs text-amber-700">E-pošta lastnika ni na voljo</p>
              )}
            </div>

            <Link
              href={`/admin/albums?q=${encodeURIComponent(event.slug)}`}
              className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-[#0F1729] transition-colors hover:border-[#FFC94D] hover:bg-[#FFF9EC]"
            >
              Uredi
            </Link>
          </article>
        );
      })}
    </div>
  );
}
