import Link from "next/link";
import { AdminEventList } from "@/components/admin/AdminEventList";
import { daysBetweenIsoDates, listAdminEvents, todayInSlovenia } from "@/lib/admin-events";

export const dynamic = "force-dynamic";

type View = "upcoming" | "past" | "all";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: requestedView } = await searchParams;
  const view: View = requestedView === "past" || requestedView === "all" ? requestedView : "upcoming";
  const today = todayInSlovenia();
  const allEvents = await listAdminEvents();
  const upcoming = allEvents.filter((event) => event.weddingDate >= today);
  const past = allEvents.filter((event) => event.weddingDate < today).reverse();
  const visible = view === "upcoming" ? upcoming : view === "past" ? past : allEvents;
  const todayCount = upcoming.filter((event) => event.weddingDate === today).length;
  const next30Count = upcoming.filter((event) => {
    const days = daysBetweenIsoDates(today, event.weddingDate);
    return days >= 0 && days <= 30;
  }).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="gc-admin-page-title text-[#0F1729]">Dogodki strank</h1>
        <p className="mt-1 text-sm text-gray-500">
          Datumi, ure in kontaktni podatki za vse galerije.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Summary label="Danes" value={todayCount} />
        <Summary label="Naslednjih 30 dni" value={next30Count} />
        <Summary label="Prihajajoči" value={upcoming.length} />
        <Summary label="Vsi dogodki" value={allEvents.length} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-semibold text-[#0F1729]">
              {view === "upcoming" ? "Prihajajoči dogodki" : view === "past" ? "Pretekli dogodki" : "Vsi dogodki"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">{visible.length} rezultatov · čas Slovenije</p>
          </div>
          <nav aria-label="Filter dogodkov" className="flex w-fit rounded-xl bg-gray-100 p-1 text-xs font-bold">
            <FilterLink href="/admin/events" active={view === "upcoming"}>Prihajajoči</FilterLink>
            <FilterLink href="/admin/events?view=past" active={view === "past"}>Pretekli</FilterLink>
            <FilterLink href="/admin/events?view=all" active={view === "all"}>Vsi</FilterLink>
          </nav>
        </div>
        <AdminEventList events={visible} today={today} />
      </section>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0F1729]">{value}</p>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-1.5 transition-colors ${active ? "bg-white text-[#0F1729] shadow-sm" : "text-gray-500 hover:text-[#0F1729]"}`}
    >
      {children}
    </Link>
  );
}
