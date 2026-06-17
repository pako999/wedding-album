export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default function AdminDiscounts() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Kode za popust</h1>
        <p className="text-sm text-gray-500 mt-1">
          Popusti so upravljani neposredno prek Mollie nadzorne plošče.
        </p>
      </header>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        Popustne kode upravljajte prek{" "}
        <a href="https://my.mollie.com" target="_blank" rel="noreferrer" className="font-semibold underline">
          Mollie nadzorne plošče
        </a>.
      </div>
    </div>
  );
}
