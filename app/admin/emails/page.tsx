import Link from "next/link";
import {
  adminEmailEventGroup,
  listAdminEmails,
  matchesAdminEmailStatus,
  type AdminEmailRow,
  type AdminEmailStatus,
} from "@/lib/admin-emails";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<AdminEmailStatus, string> = {
  all: "Vsi",
  read: "Odprti",
  unread: "Neodprti",
  problem: "Težave",
  pending: "V čakanju",
};

const EVENT_LABELS: Record<AdminEmailRow["event"], string> = {
  bounced: "Zavrnjeno",
  canceled: "Preklicano",
  clicked: "Kliknjeno",
  complained: "Označeno kot spam",
  delivered: "Dostavljeno",
  delivery_delayed: "Dostava zamuja",
  failed: "Napaka",
  opened: "Odprto",
  queued: "V vrsti",
  scheduled: "Načrtovano",
  sent: "Poslano",
  suppressed: "Blokirano",
};

function parseStatus(value?: string): AdminEmailStatus {
  return value === "read" || value === "unread" || value === "problem" || value === "pending"
    ? value
    : "all";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Ljubljana",
  }).format(date);
}

function statusClasses(group: ReturnType<typeof adminEmailEventGroup>): string {
  if (group === "read") return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
  if (group === "problem") return "bg-red-50 text-red-700 ring-red-600/15";
  if (group === "pending") return "bg-amber-50 text-amber-800 ring-amber-600/20";
  return "bg-gray-100 text-gray-600 ring-gray-500/10";
}

function filterHref(status: AdminEmailStatus, after?: string): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (after) params.set("after", after);
  const query = params.toString();
  return query ? `/admin/emails?${query}` : "/admin/emails";
}

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; after?: string }>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const result = await listAdminEmails(params.after);
  const visible = result.emails.filter((email) => matchesAdminEmailStatus(email, status));
  const readCount = result.emails.filter((email) => email.isRead).length;
  const unreadCount = result.emails.filter((email) => adminEmailEventGroup(email.event) === "unread").length;
  const problemCount = result.emails.filter((email) => adminEmailEventGroup(email.event) === "problem").length;
  const openRate = result.emails.length > 0 ? Math.round((readCount / result.emails.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="gc-admin-page-title text-[#0F1729]">Poslani e‑maili</h1>
        <p className="mt-1 text-sm text-gray-500">
          Zgodovina pošiljanja in stanje odpiranja neposredno iz Resend.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Summary label="Prikazanih" value={result.emails.length} />
        <Summary label="Odprtih" value={readCount} accent="green" />
        <Summary label="Stopnja odprtja" value={`${openRate} %`} />
        <Summary label="Težave" value={problemCount} accent={problemCount ? "red" : undefined} />
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
        <strong>Kako se meri:</strong> »Odprto« pomeni, da je e‑mail odjemalec naložil sledilno sliko;
        »Kliknjeno« prav tako šteje kot prebrano. Apple Mail Privacy lahko odpiranje zabeleži samodejno,
        blokirane slike pa lahko povzročijo, da prebran e‑mail ostane označen kot neodprt.
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-semibold text-[#0F1729]">E‑mail dnevnik</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Zadnjih največ 100 sporočil na stran · čas Slovenije
            </p>
          </div>
          <nav aria-label="Filter e-pošte" className="flex w-fit flex-wrap rounded-xl bg-gray-100 p-1 text-xs font-bold">
            {(Object.keys(STATUS_LABELS) as AdminEmailStatus[]).map((item) => (
              <Link
                key={item}
                href={filterHref(item, params.after)}
                aria-current={status === item ? "page" : undefined}
                className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                  status === item ? "bg-white text-[#0F1729] shadow-sm" : "text-gray-500 hover:text-[#0F1729]"
                }`}
              >
                {STATUS_LABELS[item]}
              </Link>
            ))}
          </nav>
        </div>

        {result.error ? (
          <div className="px-5 py-12 text-center">
            <p className="font-bold text-red-700">Zgodovine trenutno ni mogoče naložiti.</p>
            <p className="mt-2 text-sm text-gray-500">{result.error}</p>
          </div>
        ) : visible.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-400">
            {result.emails.length === 0 ? "Ni poslanih e‑mailov." : "Na tej strani ni sporočil s tem stanjem."}
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {visible.map((email) => {
              const group = adminEmailEventGroup(email.event);
              return (
                <article key={email.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_170px_130px] sm:items-center sm:px-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#FFF5D6] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#8A5A00]">
                        {email.category}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusClasses(group)}`}>
                        {EVENT_LABELS[email.event]}
                      </span>
                    </div>
                    <h3 className="mt-2 break-words text-sm font-bold text-[#0F1729]">{email.subject}</h3>
                    <p className="mt-1 break-all text-xs font-medium text-[#3551A8]">{email.to.join(", ")}</p>
                    <p className="mt-1 truncate text-[11px] text-gray-400">Od: {email.from}</p>
                  </div>
                  <div className="text-xs text-gray-500 sm:text-right">
                    <p className="font-semibold text-[#0F1729]">{formatDate(email.createdAt)}</p>
                    <p className="mt-1 font-mono text-[10px] text-gray-400">{email.id}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ring-inset ${statusClasses(group)}`}>
                      {group === "read" ? "✓ Prebrano" : group === "problem" ? "! Težava" : group === "pending" ? "… V čakanju" : "Ni odprto"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {(params.after || (result.hasMore && result.emails.length > 0)) && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:px-5">
            {params.after ? (
              <Link href={filterHref(status)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-[#0F1729] hover:border-[#FFC94D]">
                ← Najnovejši
              </Link>
            ) : <span />}
            {result.hasMore && result.emails.length > 0 && (
              <Link
                href={filterHref(status, result.emails.at(-1)?.id)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-[#0F1729] hover:border-[#FFC94D]"
              >
                Starejši →
              </Link>
            )}
          </div>
        )}
      </section>

      {unreadCount > 0 && (
        <p className="text-center text-xs text-gray-400">
          Na tej strani je {unreadCount} dostavljenih ali poslanih e‑mailov brez zaznanega odprtja.
        </p>
      )}
    </div>
  );
}

function Summary({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "green" | "red";
}) {
  const valueClass = accent === "green" ? "text-emerald-700" : accent === "red" ? "text-red-700" : "text-[#0F1729]";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${valueClass}`}>{value}</p>
    </div>
  );
}
