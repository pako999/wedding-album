import { getAffiliateAnalytics, getAffiliateRevenueWindow } from "@/lib/affiliate/analytics";

interface Props {
  affiliateId: string;
  windowDays?: number;
  /** Labels — admin uses Slovenian; partner dashboard could pass localized
   *  strings later. Defaults to SL since that's what the rest of the
   *  affiliate UI is in today. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  /** Show the "recent activity" table below the cards. Useful for admin
   *  but a bit much for the partner-facing dashboard. */
  showRecentClicks?: boolean;
}

const DEFAULT_LABELS = {
  heading:        "Analitika prometa",
  windowSuffix:   (n: number) => `· zadnjih ${n} dni`,
  clicks:         "Kliki",
  conversions:    "Konverzije",
  conversionRate: "Konv. razmerje",
  commissions:    "Provizije",
  sources:        "Od kod prihajajo",
  landingPages:   "Najpopularnejše vstopne strani",
  devices:        "Naprave",
  trend:          "Klici po dnevih",
  recent:         "Zadnji kliki",
  recentTime:     "Čas",
  recentSource:   "Vir",
  recentPage:     "Stran",
  recentDevice:   "Naprava",
  recentConv:     "Konv.",
  noData:         "Še ni klikov v tem obdobju.",
  conv:           "Da",
  notConv:        "—",
};

function fmtEur(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

function fmtDateTime(d: Date): string {
  return d.toLocaleString("sl-SI", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
}

export async function AffiliateAnalytics({
  affiliateId,
  windowDays = 30,
  labels,
  showRecentClicks = true,
}: Props) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const [analytics, revenue] = await Promise.all([
    getAffiliateAnalytics(affiliateId, windowDays),
    getAffiliateRevenueWindow(affiliateId, windowDays),
  ]);

  const maxDaily = Math.max(1, ...analytics.daily.map((d) => d.clicks));
  const maxSource = Math.max(1, ...analytics.bySource.map((s) => s.clicks));
  const maxLanding = Math.max(1, ...analytics.byLandingPage.map((l) => l.clicks));
  const totalDevice = analytics.byDevice.reduce((a, b) => a + b.clicks, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold text-[#0F1729]">📊 {t.heading}</h2>
        <span className="text-xs text-gray-400">{t.windowSuffix(windowDays)}</span>
      </div>

      {analytics.totals.clicks === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">{t.noData}</p>
      ) : (
        <>
          {/* Funnel summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FunnelCard label={t.clicks}         value={analytics.totals.clicks.toString()} />
            <FunnelCard label={t.conversions}    value={analytics.totals.conversions.toString()} />
            <FunnelCard label={t.conversionRate} value={`${analytics.totals.conversionRatePct.toFixed(1)}%`} />
            <FunnelCard label={t.commissions}    value={fmtEur(revenue.commissionCents)} hint={`${revenue.commissionCount}`} />
          </div>

          {/* Daily trend — tiny bar chart */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t.trend}</p>
            <div className="flex items-end gap-0.5 h-20">
              {analytics.daily.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.clicks}`}
                  className="flex-1 min-w-0 rounded-t bg-gradient-to-t from-[#FFC94D] to-[#FFD966] hover:opacity-80"
                  style={{ height: `${(d.clicks / maxDaily) * 100}%`, minHeight: d.clicks > 0 ? "2px" : "0" }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>{analytics.daily[0]?.date.slice(5)}</span>
              <span>{analytics.daily[analytics.daily.length - 1]?.date.slice(5)}</span>
            </div>
          </div>

          {/* Side-by-side breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t.sources}</p>
              <div className="space-y-1.5">
                {analytics.bySource.slice(0, 8).map((s) => (
                  <BarRow key={s.label} label={s.label} value={s.clicks} max={maxSource} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t.landingPages}</p>
              <div className="space-y-1.5">
                {analytics.byLandingPage.slice(0, 8).map((l) => (
                  <BarRow key={l.page} label={l.page} value={l.clicks} max={maxLanding} mono />
                ))}
              </div>
            </div>
          </div>

          {/* Devices — small inline pie-ish */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t.devices}</p>
            <div className="flex gap-2">
              {analytics.byDevice.map((d) => {
                if (d.clicks === 0) return null;
                const pct = totalDevice > 0 ? ((d.clicks / totalDevice) * 100).toFixed(0) : "0";
                return (
                  <div key={d.label} className="flex-1 rounded-xl border border-gray-100 px-3 py-2 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{d.label}</p>
                    <p className="font-bold text-[#0F1729]">{d.clicks}</p>
                    <p className="text-[10px] text-gray-400">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity table */}
          {showRecentClicks && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t.recent}</p>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">{t.recentTime}</th>
                      <th className="px-3 py-2 text-left font-semibold">{t.recentSource}</th>
                      <th className="px-3 py-2 text-left font-semibold">{t.recentPage}</th>
                      <th className="px-3 py-2 text-left font-semibold">{t.recentDevice}</th>
                      <th className="px-3 py-2 text-left font-semibold">{t.recentConv}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentClicks.map((c) => (
                      <tr key={c.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{fmtDateTime(c.clickedAt)}</td>
                        <td className="px-3 py-2 text-[#0F1729] font-semibold">{c.source}</td>
                        <td className="px-3 py-2 text-gray-600 font-mono truncate max-w-[200px]">{c.landingPage ?? "/"}</td>
                        <td className="px-3 py-2 text-gray-500">{c.device}</td>
                        <td className="px-3 py-2">
                          {c.converted ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ {t.conv}
                            </span>
                          ) : (
                            <span className="text-gray-300">{t.notConv}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FunnelCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-extrabold text-[#0F1729] leading-tight">{value}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function BarRow({ label, value, max, mono = false }: { label: string; value: number; max: number; mono?: boolean }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 min-w-0 text-xs truncate ${mono ? "font-mono text-gray-600" : "text-[#0F1729] font-semibold"}`} title={label}>
        {label}
      </div>
      <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#FFD966] to-[#F0B429]" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-[#0F1729] w-8 text-right">{value}</span>
    </div>
  );
}
