import { Resend, type ListEmail } from "resend";

export type AdminEmailStatus = "all" | "read" | "unread" | "problem" | "pending";

export interface AdminEmailRow {
  id: string;
  from: string;
  to: string[];
  subject: string;
  createdAt: string;
  event: ListEmail["last_event"];
  category: string;
  isRead: boolean;
}

export interface AdminEmailResult {
  emails: AdminEmailRow[];
  hasMore: boolean;
  error: string | null;
}

const READ_EVENTS = new Set<ListEmail["last_event"]>(["opened", "clicked"]);
const PROBLEM_EVENTS = new Set<ListEmail["last_event"]>([
  "bounced",
  "canceled",
  "complained",
  "failed",
  "suppressed",
]);
const PENDING_EVENTS = new Set<ListEmail["last_event"]>(["queued", "scheduled", "delivery_delayed"]);

function normalized(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** A short operator-friendly label inferred from the localized subject. */
function emailCategory(subject: string): string {
  const value = normalized(subject);
  if (value.startsWith("[kontakt]")) return "Kontakt";
  if (/affiliate|partner|partnersk|proviz|commission|comision/.test(value)) return "Partnerji";
  if (/dobrodos|welcome|willkommen|bienven/.test(value)) return "Dobrodošlica";
  if (/nova fotograf|new photo|neues foto|nueva foto|fotografija/.test(value)) return "Nova fotografija";
  if (/racun|invoice|pedido|order|naroc|placil|payment|zahlung/.test(value)) return "Naročilo";
  if (/pote|expir|caduca|ablauf/.test(value)) return "Potek galerije";
  if (/prenos|download|descarg|herunterlad/.test(value)) return "Po dogodku";
  if (/popust|discount|descuento|rabatt|off/.test(value)) return "Prodaja";
  if (/opomnik|reminder|recordatorio|erinnerung|podsjetnik|podsetnik|faltan|days|tage|dana|dni/.test(value)) return "Opomnik";
  return "Obvestilo";
}

export function matchesAdminEmailStatus(email: AdminEmailRow, status: AdminEmailStatus): boolean {
  if (status === "all") return true;
  if (status === "read") return email.isRead;
  if (status === "problem") return PROBLEM_EVENTS.has(email.event);
  if (status === "pending") return PENDING_EVENTS.has(email.event);
  return !email.isRead && !PROBLEM_EVENTS.has(email.event) && !PENDING_EVENTS.has(email.event);
}

/**
 * Resend is the source of truth for outgoing mail, including historical
 * messages and its delivery/open events. Cursor pagination keeps this admin
 * page fast even after the account contains thousands of emails.
 */
export async function listAdminEmails(after?: string): Promise<AdminEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { emails: [], hasMore: false, error: "RESEND_API_KEY ni nastavljen." };
  }

  try {
    const { data, error } = await new Resend(apiKey).emails.list({
      limit: 100,
      ...(after ? { after } : {}),
    });
    if (error) {
      console.error("[admin/emails] Resend list failed:", error);
      return { emails: [], hasMore: false, error: error.message };
    }

    const emails = (data?.data ?? []).map((email) => ({
      id: email.id,
      from: email.from,
      to: email.to,
      subject: email.subject,
      createdAt: email.created_at,
      event: email.last_event,
      category: emailCategory(email.subject),
      isRead: READ_EVENTS.has(email.last_event),
    }));

    return { emails, hasMore: data?.has_more ?? false, error: null };
  } catch (error) {
    console.error("[admin/emails] Resend request failed:", error);
    return {
      emails: [],
      hasMore: false,
      error: error instanceof Error ? error.message : "Resend ni dosegljiv.",
    };
  }
}

export function adminEmailEventGroup(event: AdminEmailRow["event"]): Exclude<AdminEmailStatus, "all"> {
  if (READ_EVENTS.has(event)) return "read";
  if (PROBLEM_EVENTS.has(event)) return "problem";
  if (PENDING_EVENTS.has(event)) return "pending";
  return "unread";
}
