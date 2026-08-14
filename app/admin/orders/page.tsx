import { listStandOrders } from "@/lib/stand-orders";
import { eur } from "@/lib/print-service";
import { OrderStatusButton } from "./OrderStatusButton";
import { CopyAddressButton } from "./CopyAddressButton";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

/**
 * Printed-stand orders — the fulfilment queue.
 *
 * This is a packing list, not an accounting report: it is ordered so the
 * person with the printer and the parcel tape can work top to bottom.
 * Everything needed to actually send a box is on the card — what to
 * print, how many, which material, and the full delivery address —
 * because having to open three tabs per parcel is how addresses get
 * mistyped.
 */

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  paid:      "bg-blue-50 text-blue-700 border-blue-200",
  printing:  "bg-violet-50 text-violet-700 border-violet-200",
  shipped:   "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "Čaka plačilo",
  paid:      "Plačano — za tisk",
  printing:  "V tisku",
  shipped:   "Poslano",
  cancelled: "Preklicano",
};

const VARIANT_LABEL: Record<string, string> = { wood: "Leseni", gold: "Zlati" };

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleString("sl-SI", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function AdminOrdersPage() {
  const orders = await listStandOrders();

  // Anything paid but not yet posted is the actual work queue.
  const toFulfil = orders.filter((o) => o.status === "paid" || o.status === "printing");
  const standsToPrint = toFulfil.reduce((n, o) => n + o.qty, 0);
  const revenue = orders
    .filter((o) => o.status !== "pending" && o.status !== "cancelled")
    .reduce((n, o) => n + o.totalCents, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Naročila podstavkov</h1>
        <span className="text-sm text-gray-400">{orders.length} naročil</span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Fizična naročila (podstavki + tisk). Paket, kupec, dostava in poštnina na enem mestu.
      </p>

      {/* What actually needs doing, before the list of everything */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400">Za tisk in odpremo</p>
          <p className="text-2xl font-bold text-gray-900">{toFulfil.length}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400">Podstavkov za natisniti</p>
          <p className="text-2xl font-bold text-gray-900">{standsToPrint}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400">Vrednost (brez čakajočih)</p>
          <p className="text-2xl font-bold text-gray-900">{eur(revenue)}</p>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">Ni naročil podstavkov.</p>
          <p className="text-xs text-gray-400 mt-1">
            Naročila se zapišejo takoj ob oddaji — tako s kartico kot po predračunu.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((o) => {
          const addressLines = [
            o.companyName,
            o.recipientName,
            o.address,
            [o.postalCode, o.city].filter(Boolean).join(" "),
            o.shipCountry,
          ].filter(Boolean).join("\n");
          // A parcel can't go out without these, and the invoice path
          // historically collected neither — call it out rather than
          // letting someone discover it at the post office.
          const missing = [
            !o.recipientName && "ime",
            !o.address && "naslov",
            !o.postalCode && "poštna št.",
            !o.city && "kraj",
            !o.recipientPhone && "telefon",
          ].filter(Boolean) as string[];

          return (
            <div key={o.id} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[o.status] ?? ""}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {o.source === "card" ? "💳 Kartica" : "🏦 Predračun"}
                    </span>
                    {o.shipCustoms && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        ⚠️ Carina — komercialna faktura
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {o.qty}× {VARIANT_LABEL[o.variant] ?? o.variant}
                  </p>
                  <p className="text-xs text-gray-400">
                    {fmtDate(o.createdAt)} · album <code className="text-gray-600">{o.albumSlug}</code>
                    {o.orderRef ? <> · <code className="text-gray-600">{o.orderRef}</code></> : null}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-gray-900">{eur(o.totalCents)}</p>
                  <p className="text-xs text-gray-400">skupaj z paketom</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                {/* What to print */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Za tisk</p>
                  <p className="text-gray-800">{o.qty}× {VARIANT_LABEL[o.variant] ?? o.variant}</p>
                  <p className="text-gray-500 text-xs mt-0.5">QR kartica, 200 g papir</p>
                  <p className="text-gray-500 text-xs">Album: <code>{o.albumSlug}</code></p>
                </div>

                {/* Where it goes */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Dostava</p>
                  {addressLines ? (
                    <p className="text-gray-800 whitespace-pre-line leading-snug">{addressLines}</p>
                  ) : (
                    <p className="text-red-600">Ni naslova</p>
                  )}
                  {o.recipientPhone && <p className="text-gray-600 mt-1">📞 {o.recipientPhone}</p>}
                  {o.recipientEmail && <p className="text-gray-500 text-xs break-all">{o.recipientEmail}</p>}
                  {o.taxId && <p className="text-gray-500 text-xs">Davčna: {o.taxId}</p>}
                  <p className="text-gray-500 text-xs mt-1">{o.shipCarrier}</p>
                  {missing.length > 0 && (
                    <p className="mt-2 text-xs text-red-600 font-semibold">
                      Manjka za odpremo: {missing.join(", ")}
                    </p>
                  )}
                </div>

                {/* The money, split the way an invoice needs it */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Razčlenitev</p>
                  <div className="space-y-0.5 text-gray-700">
                    {o.planName && (
                      <p className="flex justify-between gap-3">
                        <span>{o.planName}</span><span>{eur(o.planCents ?? 0)}</span>
                      </p>
                    )}
                    <p className="flex justify-between gap-3">
                      <span>Podstavki ({o.qty}×)</span><span>{eur(o.standsCents)}</span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span>Poštnina</span><span>{eur(o.shipCents)}</span>
                    </p>
                    <p className="flex justify-between gap-3 font-bold text-gray-900 pt-1 border-t border-gray-100 mt-1">
                      <span>Skupaj</span><span>{eur(o.totalCents)}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                <OrderStatusButton id={o.id} status={o.status} />
                <CopyAddressButton
                  text={[addressLines, o.recipientPhone].filter(Boolean).join("\n")}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
