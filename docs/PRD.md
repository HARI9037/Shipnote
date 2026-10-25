# Shipnote: PRD v3.0 (Open Source, Bring Your Own Key)

Author: Sreehari R Nair (Build With Tommy) · October 25, 2026 · Status: Ready to build with OpenCode

## 1. One-Liner

Shipnote is an open-source changelog generator. Point it at a GitHub repo, pick a date range, and get clean release notes using **your own API key** from Anthropic, OpenAI, Google, OpenRouter, or any OpenAI-compatible endpoint (including local models when self-hosted).

## 2. Why This Pivot

- **No LLM bill for the host.** A single shared server key cannot scale. With bring-your-own-key (BYOK), every user pays their own provider directly.
- **Trust.** Developers will use a tool that is open source, self-hostable and honest about where their key goes.
- **Portfolio value.** A real, useful, well-documented open-source project says more than a closed SaaS.

**Honest trade-off:** open source plus BYOK means the core product cannot be a strong paid product. Revenue becomes secondary (sponsors, optional hosted extras). The real return is reputation, GitHub stars, contributors and an audience for Build With Tommy. The earlier paid plan with INR and Razorpay is parked for a possible hosted Pro tier later (see section 15).

## 3. Goals and Non-Goals

**Goals**
- Generate good release notes from merged PRs with any major LLM provider the user chooses.
- Make the key handling simple, visible and safe.
- Work with zero setup for a stateless first use (no account needed).
- Be easy to self-host and easy to contribute to.

**Non-Goals (v0.1)**
- Accounts, hosted public pages and payments (Milestone 2 and later)
- GitHub App, GitLab, Bitbucket
- Multi-user teams
- Provider-specific features (tool use, vision). Plain text in, Markdown out, so every provider works.

## 4. Users

| Persona | Need |
|---|---|
| Indie dev or small team | Release notes without writing them, using the API key they already have |
| Open-source maintainer | Contributor-friendly notes for GitHub Releases, with no vendor lock-in |
| Privacy-minded or local-model user | Self-host and point it at Ollama or LM Studio |

## 5. Milestones

| Milestone | Target | Outcome |
|---|---|---|
| **M1: Stateless core** | 2 hours | Anyone can open the app, paste a key, enter a repo and get notes. Copy or download Markdown. No login, no database. |
| **M2: Accounts and hosting** | +3 to 4 hours | GitHub sign-in, saved projects and releases, public changelog pages, Docker self-host |
| **M3: Open-source polish and launch** | +3 to 4 hours | README with demo GIF, license, CI, tests, contribution docs, v0.1.0 release, launch posts |

**Scope rule:** M1 is only M1. Nothing from M2 or M3 gets built in the 2-hour window.

## 6. M1 Functional Requirements

| ID | Requirement |
|---|---|
| F1 | **Provider settings panel:** provider (Anthropic, OpenAI, Google, OpenRouter, Custom), API key, model (free text with a suggested default), base URL (Custom only), "Remember on this device" checkbox |
| F2 | **Test connection** button that sends a tiny request and shows success or a clear error |
| F3 | **Repo input** accepting `owner/repo` or a GitHub URL, with a date range of 7, 14, 30 days or custom dates |
| F4 | **Fetch merged PRs** and show a checklist (all selected by default) so the user can exclude items |
| F5 | **Token estimate** shown before generating (rough input size), so users know the cost scale |
| F6 | **Generate with streaming**, grouped into New, Improved, Fixed |
| F7 | **Tone selector:** Technical, Friendly, Marketing |
| F8 | **Editor with live preview**, plus a Regenerate button |
| F9 | **Copy as Markdown** and **Download CHANGELOG.md** |
| F10 | **Friendly error messages** for invalid key, rate limit, insufficient quota, model not found, repo not found, GitHub rate limit |
| F11 | **Landing and privacy copy** explaining exactly what happens to the key |

### Later (not in M1)

| Milestone | Features |
|---|---|
| M2 | GitHub sign-in, saved projects and releases, public pages at `/c/[slug]`, Postgres with Docker Compose, server-key mode via env vars, rate limiting |
| M3 | Direct browser mode, passphrase-encrypted key storage, private repos via the user's own GitHub token, tag-range selection, label filters, RSS, one-click publish as GitHub Release |

## 7. BYOK Design (The Core of This Product)

### 7.1 Provider configuration

```ts
type ProviderId = "anthropic" | "openai" | "google" | "openrouter" | "custom";

type LLMConfig = {
  provider: ProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string; // required for custom, preset for openrouter
};
```

All provider defaults live in **one file**, `lib/providers.ts`, so they are easy to update.

| Provider | SDK package | Base URL | Suggested default model |
|---|---|---|---|
| Anthropic | `@ai-sdk/anthropic` | provider default | `claude-haiku-5-5` |
| OpenAI | `@ai-sdk/openai` | provider default | a small, cheap current model (**verify in provider docs at build time**) |
| Google | `@ai-sdk/google` | provider default | a small, cheap current model (**verify at build time**) |
| OpenRouter | `@ai-sdk/openai-compatible` | `https://openrouter.ai/api/v1` | user enters, format `vendor/model` |
| Custom | `@ai-sdk/openai-compatible` | user supplied | user supplied |

Model names change often. The model field is always editable free text, and the build agent must check current model names in each provider's documentation instead of trusting memory.

### 7.2 One interface for every provider

Use the Vercel AI SDK (`ai` package). A single `getModel(config)` function in `lib/llm.ts` returns the right model object, and the rest of the app only calls `streamText` or `generateText`. Adding a provider means adding one entry in `providers.ts`.

### 7.3 Where the key lives and how it travels

| Rule | Detail |
|---|---|
| Storage | Browser only. `sessionStorage` by default; `localStorage` only if "Remember on this device" is ticked. |
| Server storage | **Never.** No database column, no log line, no analytics event ever contains a key. |
| Transport | Sent per request in a header (`x-llm-key`) over HTTPS to `/api/generate` and `/api/test`. The server uses it in memory and discards it. |
| Logging | Request headers and bodies are not logged on these routes. No third-party analytics scripts on pages that handle keys. |
| Display | Key input is masked, with a show/hide toggle and a "Clear key" button. |
| Disclosure | The UI and README state plainly that in hosted mode the key passes through the server to reach the provider, and that self-hosting or Direct mode (M3) avoids that. |

### 7.4 Self-host server-key mode (M2)

If the request carries no key, the server falls back to env vars so a self-hoster can run it for a team:

```
LLM_PROVIDER=anthropic
LLM_API_KEY=
LLM_MODEL=
LLM_BASE_URL=
ALLOW_PRIVATE_BASE_URLS=false
```

### 7.5 Custom base URL safety (SSRF)

A user-supplied base URL makes the server call arbitrary addresses. On the hosted deployment:
- Require `https`.
- Resolve DNS and **block** loopback, private and link-local ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`, `fc00::/7`).
- Do not follow redirects.
- Set a timeout (30 seconds) and a response size cap.

Self-hosters who want Ollama or LM Studio set `ALLOW_PRIVATE_BASE_URLS=true`. This logic lives in `lib/ssrf.ts` and must have unit tests.

### 7.6 Abuse and cost controls

- Per-IP rate limit on `/api/generate` and `/api/test` (in-memory for M1, Upstash or Postgres in M2).
- Cap PRs at 100, PR body excerpts at 400 characters, and output at about 2,000 tokens.
- Show the token estimate before generation (F5).

## 8. GitHub Data

```
GET https://api.github.com/search/issues
  ?q=repo:{owner}/{repo}+is:pr+is:merged+merged:>={YYYY-MM-DD}
  &sort=updated&order=desc&per_page=100
```

- Use `number`, `title`, `labels`, `user.login` and the first 400 characters of `body`. Never fetch code diffs.
- M1 supports public repos. Unauthenticated GitHub requests are heavily rate limited, so the server uses an optional `GITHUB_TOKEN` env var, and M3 lets users supply their own fine-grained read-only token.
- Show clear messages for 404 (not found or private) and for GitHub rate limits.

## 9. Prompt Design

The prompt must work on every provider: plain text instructions, no tool calls, no provider-specific features.

**System:**
> You write release notes for the users of a software product. Input is a list of merged pull requests. Group user-visible changes under three headings: New, Improved, Fixed. Rewrite each PR into one plain, benefit-focused sentence of at most 20 words. Merge duplicates. Skip purely internal work (refactors, CI, dependency bumps, tests) unless users would notice it. Never invent features that are not in the input. If there are no user-visible changes, say so in one line. Match this tone: {tone}. Output Markdown only, with no preamble.

**User message:** project name, date range, and a JSON array of `{number, title, body_excerpt, labels}`.

**Tone map:** Technical (precise, developer-facing), Friendly (warm, plain), Marketing (benefit-led, energetic, no hype claims).

**Before shipping M1:** run it on 3 real repos, one with messy PR titles, using at least two different providers.

## 10. Architecture (M1)

Single Next.js app, no database.

```
shipnote/
  app/
    page.tsx                  # landing + generator UI
    api/test/route.ts         # test connection
    api/prs/route.ts          # fetch merged PRs
    api/generate/route.ts     # streaming generation
  components/
    ProviderSettings.tsx
    RepoForm.tsx
    PRChecklist.tsx
    NotesEditor.tsx
  lib/
    providers.ts              # provider presets (single source of truth)
    llm.ts                    # getModel(config)
    keystore.ts               # browser key storage helpers
    github.ts                 # PR fetch
    prompt.ts                 # system prompt + tone map
    ssrf.ts                   # base URL validation
    errors.ts                 # map provider errors to friendly messages
  tests/
    ssrf.test.ts
    errors.test.ts
    prompt.test.ts
```

**Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Vercel AI SDK, `react-markdown`, Vitest, deployed on Vercel.

## 11. Data Model (Milestone 2 Only)

Use Postgres with Drizzle ORM so it runs on Supabase, Neon or a local Docker container. There is deliberately **no column for any API key**.

```sql
users (
  id uuid pk,
  github_id bigint unique,
  github_login text,
  created_at timestamptz default now()
);

projects (
  id uuid pk,
  user_id uuid fk users,
  repo_full_name text,
  slug text unique,
  created_at timestamptz default now()
);

releases (
  id uuid pk,
  project_id uuid fk projects,
  version text,
  title text,
  body_markdown text,
  status text default 'draft',       -- draft | published
  published_at timestamptz,
  created_at timestamptz default now()
);
```

Auth in M2 uses Auth.js with the GitHub provider, so the app stays portable to self-hosting.

## 12. Security and Privacy Checklist

- [ ] No API key in logs, error reports, URLs, cookies, the database or analytics
- [ ] Key input masked, with "Clear key" and a visible "Remember on this device" choice
- [ ] SSRF protection on custom base URLs, with tests
- [ ] Rate limiting on generation and test routes
- [ ] Strict Content Security Policy and no third-party scripts on the generator page
- [ ] Provider errors never echo the key back to the client
- [ ] `SECURITY.md` with a private reporting contact
- [ ] Dependency audit in CI

## 13. Open-Source Plan

| Item | Decision |
|---|---|
| License | **MIT.** Maximizes adoption and portfolio value. (AGPL would discourage closed hosted clones but also discourages adoption.) |
| Repo name | `shipnote` (check that the GitHub name, domain and npm name are free before committing to it; otherwise use an alternate) |
| README | One-line pitch, demo GIF, features, supported providers, quick start, self-host guide, privacy and key handling, architecture diagram, roadmap, contributing link |
| Community files | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue and PR templates |
| CI | GitHub Actions: lint, typecheck, test, build on every PR |
| Deploy | "Deploy with Vercel" button plus `docker compose up` for self-hosting (M2) |
| Releases | Tag `v0.1.0` with release notes **generated by Shipnote itself** |
| Discoverability | GitHub topics (`changelog`, `release-notes`, `llm`, `byok`, `nextjs`), a "good first issue" label with 5 starter issues |

## 14. Success Metrics (30 Days After Launch)

| Metric | Target |
|---|---|
| GitHub stars | 100 |
| Working self-host from README in under 5 minutes | Verified by 3 outside testers |
| External issues or pull requests | 5 |
| Providers verified end to end | 3 (Anthropic, OpenAI, one OpenAI-compatible) |
| Launch content | 1 build video, 1 Show HN or Reddit post, 1 LinkedIn post |

## 15. Monetization (Optional, Later)

- **GitHub Sponsors and a "Buy me a coffee" link** from day one.
- **Hosted Pro** (only if there is demand): saved projects, public pages without a badge, custom domain, team seats. Pricing from the earlier plan applies: $12 per month or ₹799 per month, with Lemon Squeezy for USD and Razorpay for INR.
- **Do not** gate the core generator behind payment. The open-source promise is that BYOK generation always stays free.

## 16. M1 Build Plan (2 Hours)

| Time | Task | Done when |
|---|---|---|
| 0:00 to 0:15 | Scaffold Next.js, Tailwind, install `ai` and provider packages, deploy empty app to Vercel | Live URL loads |
| 0:15 to 0:40 | `providers.ts`, `llm.ts`, `keystore.ts`, settings panel, `/api/test` | Test connection succeeds with Anthropic and with one OpenAI-compatible endpoint |
| 0:40 to 1:05 | `/api/prs`, repo form, PR checklist, token estimate | A public repo lists its merged PRs |
| 1:05 to 1:30 | `prompt.ts`, `/api/generate` streaming, tone selector, `errors.ts` | Generate streams grouped notes; bad key shows a friendly error |
| 1:30 to 1:50 | Editor and preview, regenerate, copy, download, landing and privacy copy | Full flow works start to finish |
| 1:50 to 2:00 | Deploy, smoke test with two providers, fix blockers only | Definition of done passes |

**Cut line:** if anything slips, drop in this order: token estimate, tone selector, download button. Never drop Test connection, streaming, or the privacy copy.

## 17. M1 Definition of Done

- [ ] A stranger can open the live URL, paste a key and generate notes with no signup
- [ ] Works with Anthropic and with at least one other provider or custom endpoint
- [ ] Key is stored only in the browser, and no server log contains it (verified by reading the route code and deployment logs)
- [ ] Invalid key, quota and rate-limit errors show readable messages
- [ ] Notes can be edited, copied and downloaded as `CHANGELOG.md`
- [ ] Custom base URLs to private addresses are rejected on the hosted deployment
- [ ] `lib/ssrf.ts` and `lib/errors.ts` have passing unit tests
- [ ] The README states in plain words how the key is handled

## 18. Risks and Trade-Offs

| Risk | Mitigation |
|---|---|
| Users distrust pasting a key into a website | Open source code, plain privacy copy, self-host guide, Direct browser mode in M3 |
| Provider model names change or are retired | One `providers.ts` file, free-text model field, README note on updating |
| Some providers behave differently through compatible endpoints | Test with at least 3 providers, document known quirks |
| SSRF through custom base URL | Block private ranges, no redirects, tests, self-host override flag |
| GitHub rate limits on unauthenticated search | Server token env var, user token in M3, clear error message |
| Another project already uses the name | Check GitHub, npm and domain before the repo is public |
| Little direct revenue | Accepted. The goal is portfolio, reputation and audience; hosted Pro stays optional |

## 19. Instructions for the Coding Agent (OpenCode)

1. Build **M1 only**, in the order of the time boxes in section 16. Do not start M2 or M3.
2. Before writing provider code, check each provider's current documentation for package names, base URLs and current small-model names. Do not rely on memory for model IDs.
3. Never write an API key to logs, disk, a database or an error message. Review every route for this before finishing.
4. Keep all provider defaults in `lib/providers.ts`.
5. Write the unit tests listed in section 10 and make them pass.
6. Run lint, typecheck, tests and build before reporting done.
7. At the end, report: what was built, what was cut, env vars needed, and any provider you could not verify.
