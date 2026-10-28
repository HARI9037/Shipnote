# Contributing to Shipnote

Thanks for your interest in contributing! Shipnote is a stateless, BYOK (Bring Your Own Key) release notes generator. We welcome PRs that keep the codebase clean, typed, and secure.

## Getting Started

```bash
git clone https://github.com/HARI9037/Shipnote.git
cd Shipnote
npm install
npm run dev
```

Open http://localhost:3000 and test with your own API key.

## Development Commands

| Command                | Purpose                      |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start dev server (Turbopack) |
| `npm run build`        | Production build             |
| `npm run typecheck`    | TypeScript strict check      |
| `npm test`             | Run Vitest unit tests        |
| `npm run format`       | Format with Prettier         |
| `npm run format:check` | Verify formatting            |

## Pull Request Process

1. **Branch from `master`** — use a descriptive name: `feat/provider-logos`, `fix/ssrf-edge-case`
2. **Keep changes focused** — one logical change per PR
3. **Run quality gates locally** before pushing:
   ```bash
   npm run format:check && npm run typecheck && npm test && npm run build
   ```
4. **Update tests** if you change behavior (see `tests/`)
5. **No new dependencies** without discussion — we minimize supply chain risk
6. **Security-sensitive changes** (SSRF, key handling, CSP, rate limiting) require extra review

## Code Style

- **TypeScript strict mode** — no `any`, no implicit `any`
- **Prettier** — run `npm run format` before committing
- **React** — functional components, hooks, no class components
- **Next.js App Router** — server components by default, `'use client'` only when needed
- **Error handling** — use `lib/errors.ts` helpers for user-facing messages

## Testing

- Unit tests in `tests/` (Vitest)
- Test pure logic: `ssrf.ts`, `errors.ts`, `prompt.ts`, `keystore.ts`
- Integration tests for API routes are welcome (add to `tests/`)
- Run `npm test` — all 68 tests must pass

## Security

- **Never log, store, or return API keys** — they travel only in `x-llm-key` header, used in memory, discarded
- **SSRF protection** — all custom base URLs validated in `lib/ssrf.ts`
- **CSP** — strict policy in `next.config.ts`, no third-party scripts on generator page
- **Rate limiting** — in-memory per-IP on `/api/generate` and `/api/test`

Report security issues privately via [GitHub Security Advisories](https://github.com/HARI9037/Shipnote/security/advisories) — see [SECURITY.md](SECURITY.md).

## Project Structure

```
app/
  page.tsx              # Main generator UI
  api/generate/route.ts # Streaming generation
  api/prs/route.ts      # Fetch merged PRs
  api/test/route.ts     # Test provider connection
components/
  ProviderSettings.tsx  # Provider + key + model UI
  RepoForm.tsx          # Repo + date range UI
  PRChecklist.tsx       # PR selection + token estimate
  NotesEditor.tsx       # Markdown editor + preview
lib/
  providers.ts          # Provider presets (single source of truth)
  llm.ts                # Request builder for all providers
  keystore.ts           # Browser key storage (sessionStorage/localStorage)
  github.ts             # GitHub PR fetch
  prompt.ts             # System prompt + tone map
  ssrf.ts               # Custom base URL validation
  errors.ts             # Friendly error mapping
  stream.ts             # SSE stream parser
  guard.ts              # Rate limiting
```

## Good First Issues

Look for the `good first issue` label on GitHub — we maintain 5 starter issues for new contributors.

---

**Questions?** Open a discussion or ask in the PR. We're happy to help.
