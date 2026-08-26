export interface TurnstileResult {
  ok: boolean;
  status: number;
  error?: string;
}

function secret(): string {
  return process.env.CF_TURNSTILE_SECRET_KEY ?? process.env.TURNSTILE_SECRET_KEY ?? "";
}

/**
 * Verify Cloudflare Turnstile. Production fails closed when the secret is
 * missing; local development may proceed so forms remain testable offline.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const configuredSecret = secret();
  if (!configuredSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] missing CF_TURNSTILE_SECRET_KEY / TURNSTILE_SECRET_KEY");
      return { ok: false, status: 503, error: "Verification service unavailable" };
    }
    return { ok: true, status: 200 };
  }

  if (!token) return { ok: false, status: 403, error: "Verification required" };

  try {
    const body = new URLSearchParams({ secret: configuredSecret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!response.ok) {
      return { ok: false, status: 502, error: "Verification service error" };
    }
    const data = await response.json() as { success?: boolean };
    return data.success
      ? { ok: true, status: 200 }
      : { ok: false, status: 403, error: "Bot verification failed" };
  } catch (err) {
    console.error("[turnstile] verification failed", err);
    return { ok: false, status: 502, error: "Verification service error" };
  }
}
