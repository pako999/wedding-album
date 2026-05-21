export const dynamic = "force-dynamic";

interface CheckoutSession {
  id: string;
  amount_total: number | null;
  currency: string | null;
  payment_status: string;
  status: string | null;
  created: number;
  customer_details: { email: string | null; name: string | null } | null;
  metadata: Record<string, string> | null;
}

async function listSessions(): Promise<CheckoutSession[]> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return [];
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions?limit=50", {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export default async function AdminPayments() {
  const sessions = await listSessions();
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

  const totalEur = sessions
    .filter((s) => s.payment_status === "paid")
    .reduce((sum, s) => sum + ((s.amount_total ?? 0) / 100), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Plačila</h1>
        <p className="text-sm text-gray-500 mt-1">
          Zadnjih {sessions.length} sej iz Stripe Checkout · skupaj plačano {totalEur.toFixed(2)}€
        </p>
      </header>

      {!stripeConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>STRIPE_SECRET_KEY ni nastavljen.</strong> Lokalno ne morem brati sej.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Stranka</th>
              <th className="px-4 py-3 font-medium">Galerija</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Znesek</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium text-right">Stripe</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0F1729]">{s.customer_details?.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{s.customer_details?.email ?? "—"}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.metadata?.albumSlug ?? "—"}</td>
                <td className="px-4 py-3 text-xs uppercase font-semibold text-gray-700">{s.metadata?.planId ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-[#0F1729]">
                  {s.amount_total != null ? `${(s.amount_total / 100).toFixed(2)}${(s.currency || "eur").toUpperCase() === "EUR" ? "€" : " " + (s.currency || "").toUpperCase()}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${
                    s.payment_status === "paid"
                      ? "bg-green-50 text-green-700"
                      : s.payment_status === "unpaid"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-amber-50 text-amber-700"
                  }`}>
                    {s.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.created * 1000).toLocaleString("sl-SI")}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`https://dashboard.stripe.com/test/checkout/sessions/${s.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#C9820A] hover:underline"
                  >
                    Odpri →
                  </a>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  Ni Stripe sej.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
