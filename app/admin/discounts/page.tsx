import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { CreateDiscountForm } from "./CreateDiscountForm";
import { DiscountToggle } from "./DiscountToggle";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

async function loadCodes() {
  try {
    return await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  } catch {
    return [];
  }
}

export default async function AdminDiscounts() {
  const codes = await loadCodes();
  const active = codes.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-[#0F1729]">Kode za popust</h1>
          <p className="text-sm text-gray-500 mt-1">
            {codes.length} kod · {active} aktivnih
          </p>
        </div>
        <CreateDiscountForm />
      </header>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Koda</th>
              <th className="px-4 py-3 font-medium">Popust</th>
              <th className="px-4 py-3 font-medium">Cena (Basic / Plus / Premium)</th>
              <th className="px-4 py-3 font-medium">Poraba</th>
              <th className="px-4 py-3 font-medium">Velja do</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const pct = c.percentOff;
              const prices = [39, 49, 99].map((p) => Math.round(p * (1 - pct / 100)));
              const expired = c.expiresAt && c.expiresAt < new Date();
              return (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-mono font-bold text-[#0F1729] tracking-wider">{c.code}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-green-700">{pct}% popust</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {prices[0]}€ / {prices[1]}€ / {prices[2]}€
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.usedCount}
                    {c.maxUses !== null && <span className="text-gray-400"> / {c.maxUses}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {c.expiresAt ? (
                      <span className={expired ? "text-red-500" : ""}>
                        {new Date(c.expiresAt).toLocaleDateString("sl-SI")}
                        {expired && " ⚠️"}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <DiscountToggle id={c.id} isActive={c.isActive} />
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  Še ni kod za popust. Kliknite &ldquo;+ Nova koda&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#FFF9EC] rounded-2xl border border-[#FFE08A] p-4 text-sm text-[#0F1729]">
        <p className="font-semibold mb-1">Kako deluje?</p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Stranke vnesejo kodo na strani za nadgradnjo pred plačilom.</li>
          <li>Popust se avtomatsko odšteje od cene paketa.</li>
          <li>Koda se šteje kot porabljena šele ko pride do dejanskega plačila (Mollie) oz. ob oddaji naročila za predračun.</li>
          <li>Kodo lahko kadarkoli izklopite s klikom na status.</li>
        </ul>
      </div>
    </div>
  );
}
