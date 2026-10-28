# Shipnote Changelog

Generated on 2026-10-28

---

## v0.1.0 (2026-10-28)

### New

- Stateless BYOK release notes generator — paste your own API key, generate notes, no account needed
- Support for 5 LLM providers: Anthropic, OpenAI, Google, OpenRouter, and custom OpenAI-compatible endpoints
- Provider settings panel with model selection, custom base URL, and "Remember on this device" option
- Test connection button to verify API key before generating
- Repository input accepting `owner/repo` or GitHub URL
- Date range presets (7, 14, 30 days) plus custom date range
- Merged PR fetch with checklist to include/exclude items
- Token estimate shown before generation
- Streaming generation with New / Improved / Fixed groupings
- Tone selector: Technical, Friendly, Marketing
- Editable Markdown editor with live preview, copy, and CHANGELOG.md download
- Self-hostable single Next.js app, no database required

### Improved

- SSRF protection on custom base URLs (blocks private/link-local ranges, no redirects, DNS rebinding protection)
- Rate limiting on `/api/generate` and `/api/test` (10 req/min per IP, in-memory)
- Friendly error messages for invalid key, quota exceeded, rate limits, model not found, repo not found
- Strict Content Security Policy, no third-party scripts on generator page
- Keys stored only in browser (sessionStorage/localStorage), never on server, never logged

### Fixed

- TypeScript `baseUrl` deprecation in tsconfig.json
- Build and key handling edge cases
- Input validation on all API routes

### Security

- API keys never stored, logged, or returned in responses
- Custom base URLs validated against private address ranges
- DNS resolution before request with private range blocking
- No redirects followed on provider calls
- Request/response size caps and timeouts

---

_This changelog was generated from git commit history as the repository uses direct commits to master rather than pull requests._
