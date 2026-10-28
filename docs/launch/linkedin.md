# LinkedIn Post

## Headline

Shipnote v0.1.0: Open-source release notes generator — bring your own AI key, no database, self-hostable in 30 seconds 🚀

## Body

After weeks of building, I'm excited to share **Shipnote** — a stateless, open-source tool that turns merged GitHub PRs into clean, readable release notes using whatever LLM provider you already use.

### The problem

Most changelog tools fall into two camps:

1. **SaaS with shared AI keys** — the host pays, costs don't scale, you're locked into their model
2. **Label/commit convention parsers** — output quality = your team's PR hygiene (let's be honest, most PR titles are messy)

### My approach: BYOK + Stateless

- **Bring Your Own Key** — Anthropic, OpenAI, Google, OpenRouter, or any OpenAI-compatible endpoint (including Ollama/LM Studio when self-hosted)
- **No database, no accounts** — your key lives in your browser, sent per-request over HTTPS, discarded immediately
- **Rewrites, doesn't just dump** — LLM rewrites messy PR titles into benefit-focused sentences grouped as New/Improved/Fixed
- **Self-host in 30 seconds** — `npm run build && npm start` or Docker

### Key features

✅ 5 providers + custom endpoints
✅ Streaming generation with tone control (Technical/Friendly/Marketing)
✅ Token estimate before you generate
✅ Editable Markdown with live preview + CHANGELOG.md download
✅ Strict CSP, SSRF protection, rate limiting
✅ MIT licensed, no analytics, no third-party scripts

### Try it

🔗 Live: https://shipnote.vercel.app
🔗 GitHub: https://github.com/HARI9037/Shipnote

```bash
git clone https://github.com/HARI9037/Shipnote.git
cd Shipnote
npm install
npm run dev
```

### What's next

v0.2 will add GitHub sign-in, saved projects, public changelog pages, and private repo support with your own GitHub token. But the core BYOK stateless experience will always stay free and open.

---

#OpenSource #LLM #DeveloperTools #Shipnote #BuildInPublic #SideProject #TypeScript #NextJS
