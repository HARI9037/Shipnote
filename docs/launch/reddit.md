# Reddit Post (r/sideproject / r/opensource / r/webdev)

## Title
I built an open-source release notes generator that uses YOUR API key (no shared keys, no database, self-hostable)

## Body

**Shipnote** – turn merged GitHub PRs into clean release notes using the AI provider you already pay for.

### Why I built this

Every changelog tool I tried had one of these problems:
- **Shared AI key** — the host pays, doesn't scale, you don't control the model
- **Label-based** — output is only as good as your PR hygiene (most teams have messy titles)
- **Heavy setup** — database, auth, Docker, Kubernetes...

### What Shipnote does

1. **Pick your provider** — Anthropic, OpenAI, Google, OpenRouter, or any OpenAI-compatible endpoint
2. **Paste your key** — stored in your browser only (sessionStorage, or localStorage if you check "Remember")
3. **Enter a repo** — `owner/repo` or GitHub URL, pick date range (7/14/30 days or custom)
4. **Fetch PRs** — shows merged PRs with a checklist, token estimate
5. **Generate** — streaming output grouped as New / Improved / Fixed
6. **Edit & export** — live Markdown preview, copy, download CHANGELOG.md

### Key differentiators

- **BYOK (Bring Your Own Key)** — you pay your provider directly, no markup
- **Stateless** — no database, no accounts, no server-side secrets
- **Rewrites PRs** — doesn't just dump titles; writes readable sentences
- **Self-hostable** — single `npm run build && npm start`, or Docker
- **Privacy-first** — key never stored on server, strict CSP, SSRF protection
- **Open source (MIT)** — no vendor lock-in

### Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Custom LLM request builder (no Vercel AI SDK dependency — works with any OpenAI-compatible endpoint)
- Vitest for unit tests (SSRF, error mapping, prompts)
- Deployed on Vercel (1-click deploy button in README)

### Try it

Live demo: https://shipnote.vercel.app
GitHub: https://github.com/HARI9037/Shipnote

```bash
git clone https://github.com/HARI9037/Shipnote.git
cd Shipnote
npm install
npm run dev
```

### Roadmap (v0.2+)

- GitHub sign-in + saved projects/releases
- Public changelog pages at `/c/[slug]`
- Private repos with your own GitHub token
- Tag-range selection, label filters
- RSS feed, one-click publish as GitHub Release
- Direct-from-browser mode (no server key pass-through)

---

**Looking for feedback on:**
- Provider experience (Anthropic/OpenAI/Google/OpenRouter/custom)
- Self-hosting with local models (Ollama, LM Studio)
- UI/UX improvements
- Feature priorities for v0.2

Contributions welcome — check the `good first issue` label!