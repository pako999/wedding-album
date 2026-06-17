/**
 * Telegram push notifications for ops events (new sign-ups, paid
 * upgrades, etc.).
 *
 * Setup (one-time):
 *   1. Talk to @BotFather on Telegram → /newbot → save the token.
 *   2. Send any message to the new bot from the account/group that
 *      should receive notifications. Then open
 *      https://api.telegram.org/bot<TOKEN>/getUpdates and copy the
 *      "chat":{"id": …} value.
 *   3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel env.
 *
 * Behaviour:
 *   • If either env var is missing, `notifyTelegram` is a no-op so
 *     local dev and partially-configured environments don't break
 *     the calling code path (Paddle webhooks, Clerk webhooks).
 *   • Telegram API errors are caught and logged — they never throw.
 *     A webhook that 500s because Telegram is down would force
 *     Paddle / Clerk to retry the delivery indefinitely, which is
 *     worse than missing one ops ping.
 */

const TELEGRAM_API = "https://api.telegram.org";

export interface TelegramSendOptions {
  /** Override the default chat id (env TELEGRAM_CHAT_ID). */
  chatId?: string;
  /**
   * Telegram MarkdownV2 / HTML parse mode. HTML is easier to escape
   * (only `< > &` need encoding), so we default to that and ask
   * callers to pass already-escaped text.
   */
  parseMode?: "HTML" | "MarkdownV2";
  /** Suppress the in-Telegram notification sound. */
  silent?: boolean;
}

/**
 * Escape a string for safe inclusion in HTML-mode Telegram messages.
 * Only `< > &` are reserved; everything else (Unicode emoji, URLs,
 * etc.) passes through unchanged.
 */
export function htmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Fire-and-forget Telegram notification. Returns `true` on a 200
 * from the Telegram API, `false` on any failure (missing config,
 * network, non-2xx). Never throws.
 */
export async function notifyTelegram(
  text: string,
  opts: TelegramSendOptions = {},
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = opts.chatId ?? process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    // Don't log on missing config — too noisy in dev. The deploy
    // checklist for adding the env vars is in this file's header.
    return false;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: opts.parseMode ?? "HTML",
        disable_notification: opts.silent ?? false,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "(no body)");
      console.error("[telegram] non-2xx:", res.status, detail.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] fetch failed:", err);
    return false;
  }
}
