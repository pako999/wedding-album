<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Canonical URLs — always www.guestcam.si

`guestcam.si` (bare host) 307-redirects to `www.guestcam.si` on Vercel. Any hardcoded
`"https://guestcam.si..."` in canonical tags, sitemap entries, hreflang alternates,
OG images, JSON-LD schemas or email deep links creates a redirect chain and gets
flagged by Semrush/Ahrefs audits.

**Do:** `import { SITE_URL, absoluteUrl } from "@/lib/urls"` and use those.

**Do NOT:** hardcode the domain in strings. If a preview deploy needs to canonicalize
to itself, set `NEXT_PUBLIC_APP_URL` in Vercel — `SITE_URL` reads from that first.

Outbound links to external sites should also use their canonical host (e.g.
`https://www.futurecode.si`, not `https://futurecode.si`).
