"use client";

/**
 * Event lead capture — dashboard panel for the events/business package.
 *
 * Turning this on makes guests enter name, surname and email before they
 * can upload. The marketing tickbox in that form is separate and always
 * optional: GDPR Art. 7(4) says consent isn't freely given if it's a
 * condition of the service, so it can never gate uploading.
 */

import { useState, useEffect } from "react";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  marketingConsent: boolean;
  createdAt: string;
}

interface Props {
  albumSlug: string;
  initialEnabled: boolean;
}

export function EventLeadsCard({ albumSlug, initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/albums/${albumSlug}/leads`)
      .then((r) => (r.ok ? r.json() : { leads: [] }))
      .then((d) => { if (!cancelled) { setLeads(d.leads ?? []); setLoaded(true); } })
      .catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [albumSlug]);

  const toggle = async (next: boolean) => {
    setEnabled(next);
    setSaving(true);
    await fetch(`/api/albums/${albumSlug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestDataCapture: next }),
    }).catch(() => setEnabled(!next));
    setSaving(false);
  };

  const consented = leads.filter((l) => l.marketingConsent).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">🎟 Zbiranje podatkov gostov</h3>
          <p className="text-xs text-gray-400 mt-0.5 max-w-lg">
            Za poslovne dogodke: gost pred nalaganjem vpiše ime, priimek in e-pošto.
            Privolitev za trženje je ločena in neobvezna.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Zbiranje podatkov gostov"
          disabled={saving}
          onClick={() => toggle(!enabled)}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${enabled ? "bg-[#F4B400]" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      {enabled && (
        <p
          className="text-[11px] rounded-lg px-3 py-2 mt-3 leading-relaxed"
          style={{ background: "#FFF9E8", color: "#8F6900" }}
        >
          Podatke zbirate vi kot organizator dogodka — vi ste upravljavec teh osebnih podatkov.
          Poskrbite, da imate ustrezno pravno podlago in politiko zasebnosti. CamLove podatke
          zgolj hrani in vam jih da na voljo za izvoz.
        </p>
      )}

      {loaded && leads.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{leads.length}</span> zbranih kontaktov
              <span className="text-gray-400"> · {consented} s privolitvijo za trženje</span>
            </p>
            <a
              href={`/api/albums/${albumSlug}/leads?format=csv`}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 hover:border-gray-300 transition-colors"
            >
              ⬇ Izvozi CSV
            </a>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-100">
            <table className="w-full text-xs">
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {l.firstName} {l.lastName}
                    </td>
                    <td className="px-3 py-2 text-gray-500 truncate max-w-[200px]">{l.email}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {l.marketingConsent ? (
                        <span className="text-green-700">✓ trženje</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loaded && enabled && leads.length === 0 && (
        <p className="text-xs text-gray-400 mt-3">Zbrani kontakti se bodo prikazali tukaj.</p>
      )}
    </div>
  );
}
