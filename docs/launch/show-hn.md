# Show HN Submission

## Title

Show HN: Shipnote – Open-source release notes from merged PRs, using your own API key

## URL

https://shipnote.vercel.app (or your deployed URL)

## Submission Text

I built Shipnote because every changelog tool I found either:

- Required a shared server-side AI key (costly, doesn't scale)
- Assembled notes from labels/commit conventions (output only as good as your PR titles)
- Needed a database, auth, or complex setup

Shipnote is different:

- **Bring your own key** — Anthropic, OpenAI, Google, OpenRouter, or any OpenAI-compatible endpoint (Ollama, LM Studio when self-hosted)
- **Stateless** — no database, no accounts, no server-side secrets
- **Rewrites messy PR titles** into plain, benefit-focused sentences grouped as New/Improved/Fixed
- **Streaming output** with tone control (Technical/Friendly/Marketing)
- **Editable Markdown** with live preview, copy, download
- **Self-host in 30 seconds** — `npm run build && npm start`

How it works:

1. Pick a provider, paste your API key, test connection
2. Enter a GitHub repo (e.g., `vercel/next.js`) and date range
3. Fetch merged PRs, select which to include
4. Generate → get streaming release notes
5. Edit, copy, or download as CHANGELOG.md

Your key stays in your browser (sessionStorage by default). Each request sends it to the server over HTTPS in a header, the server forwards it to your chosen provider and discards it. In hosted mode the key passes through the server; self-host to keep the entire path under your control.

Open source (MIT), no analytics, strict CSP, SSRF protection on custom endpoints.

GitHub: https://github.com/HARI9037/Shipnote
Live demo: https://shipnote.vercel.app

Feedback welcome!
