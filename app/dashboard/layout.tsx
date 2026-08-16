import { HideCookiebot } from "@/components/HideCookiebot";

/** Dashboard-wide chrome. Exists (so far) for one job: keeping the
 *  floating Cookiebot badge off logged-in screens, where it overlays
 *  real controls on phones. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HideCookiebot />
      {children}
    </>
  );
}
