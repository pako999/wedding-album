"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

interface AlbumOption {
  id: string;
  name: string;
  slug: string;
  location: string | null;
}

type RewardType = "percent" | "fixed" | "free_item" | "custom";

export function LocalCampaignForm({ albums }: { albums: AlbumOption[] }) {
  const first = albums[0];
  const [albumId, setAlbumId] = useState(first.id);
  const [venueName, setVenueName] = useState(first.location || first.name);
  const [campaignName, setCampaignName] = useState("Deli trenutek & prejmi nagrado");
  const [headline, setHeadline] = useState("📸 Deli trenutek. Odkleni nagrado.");
  const [rewardType, setRewardType] = useState<RewardType>("percent");
  const [rewardValue, setRewardValue] = useState("20");
  const [rewardTitle, setRewardTitle] = useState("20 % popusta na naslednjo kavo");
  const [rewardDescription, setRewardDescription] = useState("Pokaži kupon ob naslednjem obisku.");
  const [rewardTerms, setRewardTerms] = useState("Velja enkrat. Ni združljivo z drugimi popusti.");
  const [validDays, setValidDays] = useState("30");
  const [maxCoupons, setMaxCoupons] = useState("");
  const [products, setProducts] = useState("Kava, Cappuccino, Latte");
  const [sourceLabel, setSourceLabel] = useState("Miza 1");
  const [tableNumber, setTableNumber] = useState("1");
  const [socialBonusEnabled, setSocialBonusEnabled] = useState(true);
  const [socialBonusText, setSocialBonusText] = useState("Objavi trenutek na Instagramu ali TikToku in sodeluj še za tedensko nagrado.");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ sourceCode: string; localUrl: string } | null>(null);

  const selectedAlbum = albums.find((album) => album.id === albumId) ?? first;
  const previewReward = useMemo(() => {
    if (rewardType === "percent" && rewardValue) return `${rewardValue} % popusta`;
    if (rewardType === "fixed" && rewardValue) return `${rewardValue} € popusta`;
    return rewardTitle || "Tvoja nagrada";
  }, [rewardType, rewardValue, rewardTitle]);

  const onAlbumChange = (id: string) => {
    setAlbumId(id);
    const next = albums.find((album) => album.id === id);
    if (next && (!venueName || venueName === first.location || venueName === first.name)) {
      setVenueName(next.location || next.name);
    }
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setCreated(null);

    let numericReward: number | null = null;
    if (rewardType === "percent") numericReward = Math.round(Number(rewardValue));
    if (rewardType === "fixed") numericReward = Math.round(Number(rewardValue) * 100);

    try {
      const response = await fetch("/api/local/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId,
          venueName,
          campaignName,
          headline,
          rewardType,
          rewardValue: Number.isFinite(numericReward) ? numericReward : null,
          rewardCurrency: "EUR",
          rewardTitle,
          rewardDescription,
          rewardTerms,
          validDays: Number(validDays) || 0,
          maxCoupons: maxCoupons ? Number(maxCoupons) : null,
          products: products.split(",").map((item) => item.trim()).filter(Boolean),
          sourceLabel,
          tableNumber,
          socialBonusEnabled,
          socialBonusText,
        }),
      });
      const data = await response.json() as {
        error?: string;
        message?: string;
        sourceCode?: string;
        localUrl?: string;
      };
      if (!response.ok) {
        if (data.error === "local_rewards_not_ready") {
          throw new Error("Local Rewards baza še ni aktivirana. UI in API sta pripravljena; pred testnim zapisom moramo zagnati migration.");
        }
        throw new Error(data.message || data.error || "Kampanje ni bilo mogoče ustvariti.");
      }
      setCreated({ sourceCode: data.sourceCode!, localUrl: data.localUrl! });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kampanje ni bilo mogoče ustvariti.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-6 lg:gap-8 items-start">
      <form onSubmit={submit} className="space-y-5">
        <Panel title="1. Lokal in galerija" description="Za MVP uporabimo obstoječo Guestcam galerijo kot galerijo lokala.">
          <Field label="Guestcam galerija">
            <select value={albumId} onChange={(e) => onAlbumChange(e.target.value)} className={inputClass}>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>{album.name}{album.location ? ` · ${album.location}` : ""}</option>
              ))}
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Ime lokala">
              <input value={venueName} onChange={(e) => setVenueName(e.target.value)} className={inputClass} required />
            </Field>
            <Field label="Ime kampanje">
              <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className={inputClass} required />
            </Field>
          </div>
          <Field label="Glavno sporočilo gostu">
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} />
          </Field>
        </Panel>

        <Panel title="2. Nagrada" description="Osnovna nagrada se odklene po uspešnem uploadu. Social share bo dodatni bonus.">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              ["percent", "% popust"],
              ["fixed", "€ popust"],
              ["free_item", "Brezplačen artikel"],
              ["custom", "Po meri"],
            ] as [RewardType, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRewardType(value)}
                className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${rewardType === value ? "border-[color:var(--honey)] bg-[#FFF8E6] text-[#7A5514]" : "border-[color:var(--hairline)] bg-white text-[color:var(--muted)]"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {(rewardType === "percent" || rewardType === "fixed") && (
            <Field label={rewardType === "percent" ? "Višina popusta (%)" : "Višina popusta (€)"}>
              <input type="number" min="0" max={rewardType === "percent" ? "100" : undefined} step={rewardType === "fixed" ? "0.01" : "1"} value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} className={inputClass} />
            </Field>
          )}

          <Field label="Naslov nagrade">
            <input value={rewardTitle} onChange={(e) => setRewardTitle(e.target.value)} className={inputClass} required />
          </Field>
          <Field label="Opis">
            <textarea value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} className={`${inputClass} min-h-20 resize-y`} />
          </Field>
          <Field label="Pogoji">
            <textarea value={rewardTerms} onChange={(e) => setRewardTerms(e.target.value)} className={`${inputClass} min-h-20 resize-y`} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Veljavnost kupona (dni)">
              <input type="number" min="0" max="365" value={validDays} onChange={(e) => setValidDays(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Največ kuponov (prazno = brez omejitve)">
              <input type="number" min="1" value={maxCoupons} onChange={(e) => setMaxCoupons(e.target.value)} className={inputClass} placeholder="Brez omejitve" />
            </Field>
          </div>
          <Field label="Artikli, za katere nagrada velja" hint="Loči z vejico. Lokal jih lahko kasneje ureja.">
            <input value={products} onChange={(e) => setProducts(e.target.value)} className={inputClass} placeholder="Kava, Cappuccino, Latte" />
          </Field>
        </Panel>

        <Panel title="3. Prvi QR" description="Kasneje lahko isti kampanji dodaš poljubno število miz ali drugih QR lokacij.">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Oznaka QR">
              <input value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} className={inputClass} placeholder="Terasa · Miza 4" required />
            </Field>
            <Field label="Številka mize / lokacije">
              <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className={inputClass} placeholder="4" />
            </Field>
          </div>
        </Panel>

        <Panel title="4. Social bonus" description="Ne pogojujemo osnovne nagrade z objavo. Sharing uporabimo kot dodatno motivacijo.">
          <label className="flex items-start gap-3 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--paper)] p-4 cursor-pointer">
            <input type="checkbox" checked={socialBonusEnabled} onChange={(e) => setSocialBonusEnabled(e.target.checked)} className="mt-1 accent-[#8C6218]" />
            <span>
              <span className="block text-sm font-semibold">Ponudi dodaten social izziv</span>
              <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">Gost že ima osnovni kupon; z objavo lahko sodeluje še za večjo nagrado.</span>
            </span>
          </label>
          {socialBonusEnabled && (
            <Field label="Besedilo social bonusa">
              <textarea value={socialBonusText} onChange={(e) => setSocialBonusText(e.target.value)} className={`${inputClass} min-h-24 resize-y`} />
            </Field>
          )}
        </Panel>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {created && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            <p className="font-semibold">Kampanja ustvarjena ✓</p>
            <p className="mt-1">QR source: <code>{created.sourceCode}</code> · Guest URL: <code>{created.localUrl}</code></p>
            <Link href="/dashboard/local" className="mt-2 inline-block font-semibold underline">Nazaj na Local Rewards</Link>
          </div>
        )}

        <button disabled={saving} className="w-full rounded-2xl bg-[color:var(--ink)] px-6 py-4 text-sm font-semibold text-[color:var(--paper)] hover:opacity-90 disabled:opacity-50">
          {saving ? "Ustvarjam kampanjo…" : "Ustvari kampanjo in prvi QR →"}
        </button>
      </form>

      <aside className="lg:sticky lg:top-20">
        <div className="rounded-3xl border border-[color:var(--hairline)] bg-white p-5 sm:p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--honey)]">Live preview za gosta</p>
          <div className="mt-5 overflow-hidden rounded-[28px] border border-[color:var(--hairline)] bg-[color:var(--paper)]">
            <div className="bg-[color:var(--ink)] px-5 py-7 text-white text-center">
              <p className="text-xs text-white/60">{venueName || "Tvoj lokal"}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{headline || "📸 Deli trenutek"}</h2>
              <p className="mt-2 text-sm text-white/70">Naloži fotografijo iz lokala in odkleni svojo nagrado.</p>
            </div>
            <div className="p-5">
              <div className="rounded-2xl border-2 border-dashed border-[#D9C69E] bg-white px-4 py-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FFF3CC] text-2xl">📷</div>
                <p className="mt-3 font-semibold">Dodaj fotografijo</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">Brez aplikacije in brez registracije</p>
              </div>
              <div className="mt-4 rounded-2xl bg-[#FFF3CC] p-4 text-center text-[#68470F]">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Tvoja nagrada</p>
                <p className="mt-1 text-xl font-semibold">{previewReward}</p>
                <p className="mt-1 text-xs opacity-70">{rewardTitle}</p>
              </div>
              {socialBonusEnabled && (
                <div className="mt-3 rounded-xl border border-[color:var(--hairline)] bg-white p-3 text-xs leading-5 text-[color:var(--muted)]">
                  📱 <strong className="text-[color:var(--ink)]">Bonus:</strong> {socialBonusText}
                </div>
              )}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[color:var(--muted)]">
            Galerija: <strong>{selectedAlbum.name}</strong>. Po uploadu bo gost dobil unikaten enkratni kupon, ki ga osebje pozneje unovči.
          </p>
        </div>
      </aside>
    </div>
  );
}

const inputClass = "w-full min-w-0 rounded-xl border border-[color:var(--hairline)] bg-white px-3.5 py-3 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--honey)] focus:ring-2 focus:ring-[#8C62181A]";

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[color:var(--hairline)] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{description}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[color:var(--ink)]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] leading-4 text-[color:var(--muted)]">{hint}</span>}
    </label>
  );
}
