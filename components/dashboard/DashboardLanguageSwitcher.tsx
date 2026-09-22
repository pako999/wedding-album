"use client";

import type { DashboardLang } from "@/lib/i18n/dashboard-language";
import { LANGS } from "@/lib/i18n/translations";

export function DashboardLanguageSwitcher({
  current,
  ariaLabel,
}: {
  current: DashboardLang;
  ariaLabel: string;
}) {
  function changeLanguage(next: DashboardLang) {
    document.cookie = `guestcam_dashboard_lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.assign(url.toString());
  }

  return (
    <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm">
      <span aria-hidden="true">🌐</span>
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={current}
        onChange={(event) => changeLanguage(event.target.value as DashboardLang)}
        aria-label={ariaLabel}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-sm font-bold text-[#0F1729] outline-none"
      >
        {LANGS.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.native}
          </option>
        ))}
      </select>
    </label>
  );
}
