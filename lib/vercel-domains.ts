// Server-only helper for managing custom domains on the Vercel project
// via the Vercel REST API. Never import this from client components — it
// reads VERCEL_API_TOKEN from process.env.

import "server-only";

const API_TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID = process.env.VERCEL_TEAM_ID;

const BASE = "https://api.vercel.com";

function requireEnv() {
  if (!API_TOKEN || !PROJECT_ID || !TEAM_ID) {
    throw new Error(
      "Vercel domain integration is not configured (missing VERCEL_API_TOKEN / VERCEL_PROJECT_ID / VERCEL_TEAM_ID)."
    );
  }
}

// Append ?teamId=... to every URL.
function withTeam(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}teamId=${TEAM_ID}`;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export interface DnsRecord {
  type: string;
  domain: string;
  value: string;
}

export interface NormalizedDomainStatus {
  verified: boolean;
  misconfigured: boolean;
  verification: DnsRecord[];
}

// ─── Add a domain to the project ──────────────────────────────────────────────

export async function addProjectDomain(domain: string): Promise<unknown> {
  requireEnv();

  const res = await fetch(
    withTeam(`${BASE}/v10/projects/${PROJECT_ID}/domains`),
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name: domain }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (res.ok) return data;

  // Idempotent: if the domain is already attached to THIS project, treat as success.
  const code: string | undefined = data?.error?.code;
  const message: string = data?.error?.message ?? "";
  const alreadyInUse =
    code === "domain_already_in_use" ||
    code === "domain_taken" ||
    /already (in use|exists|assigned)/i.test(message);

  if (alreadyInUse) {
    // Confirm it's on our project by fetching it; if so, return its info.
    try {
      return await fetchProjectDomain(domain);
    } catch {
      // Domain exists but on a different project — surface the original error.
      throw new Error(`Vercel: domain "${domain}" is already in use elsewhere.`);
    }
  }

  throw new Error(
    `Vercel addProjectDomain failed (${res.status}): ${message || JSON.stringify(data)}`
  );
}

// ─── Fetch a single project domain ────────────────────────────────────────────

async function fetchProjectDomain(domain: string): Promise<unknown> {
  requireEnv();
  const res = await fetch(
    withTeam(`${BASE}/v9/projects/${PROJECT_ID}/domains/${domain}`),
    { headers: authHeaders() }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Vercel getProjectDomain failed (${res.status}): ${data?.error?.message ?? JSON.stringify(data)}`
    );
  }
  return data;
}

// ─── Normalized verification status ───────────────────────────────────────────

export async function getDomainStatus(
  domain: string
): Promise<NormalizedDomainStatus> {
  requireEnv();

  // 1. Project domain → verified + verification records.
  const projectRes = await fetch(
    withTeam(`${BASE}/v9/projects/${PROJECT_ID}/domains/${domain}`),
    { headers: authHeaders() }
  );
  const projectData = await projectRes.json().catch(() => ({}));
  if (!projectRes.ok) {
    throw new Error(
      `Vercel getDomainStatus (project) failed (${projectRes.status}): ${projectData?.error?.message ?? JSON.stringify(projectData)}`
    );
  }

  const verified: boolean = projectData?.verified === true;
  const rawVerification: unknown[] = Array.isArray(projectData?.verification)
    ? projectData.verification
    : [];
  const verification: DnsRecord[] = rawVerification.map((v) => {
    const r = v as { type?: string; domain?: string; value?: string };
    return {
      type: r.type ?? "",
      domain: r.domain ?? "",
      value: r.value ?? "",
    };
  });

  // 2. Domain config → misconfigured flag.
  let misconfigured = false;
  try {
    const configRes = await fetch(
      withTeam(`${BASE}/v6/domains/${domain}/config`),
      { headers: authHeaders() }
    );
    if (configRes.ok) {
      const configData = await configRes.json().catch(() => ({}));
      misconfigured = configData?.misconfigured === true;
    }
  } catch {
    // Config lookup is best-effort; ignore failures.
  }

  return { verified, misconfigured, verification };
}

// ─── Remove a domain from the project ─────────────────────────────────────────

export async function removeProjectDomain(domain: string): Promise<void> {
  requireEnv();

  const res = await fetch(
    withTeam(`${BASE}/v9/projects/${PROJECT_ID}/domains/${domain}`),
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  if (res.ok || res.status === 404) return; // 404 = already gone, fine.

  const data = await res.json().catch(() => ({}));
  throw new Error(
    `Vercel removeProjectDomain failed (${res.status}): ${data?.error?.message ?? JSON.stringify(data)}`
  );
}
