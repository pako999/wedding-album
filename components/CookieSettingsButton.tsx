"use client";

/**
 * Footer "Cookie settings" button. Re-opens the consent banner so visitors
 * can change their granular choices at any time. Tiny client component so
 * the parent SeoFooter can stay server-rendered.
 */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.openCookieConsent) {
          window.openCookieConsent();
        }
      }}
      className="hover:text-white transition-colors underline-offset-2 hover:underline"
    >
      {label}
    </button>
  );
}
