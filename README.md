# Shipnote

Open-source release notes from merged pull requests, written by the AI provider **you** choose with **your own API key**.

Point it at a public GitHub repo, pick a date range, and get clean, editable, Markdown release notes grouped into New, Improved and Fixed.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HARI9037/Shipnote)

## Why another changelog tool?

Tools like release-drafter and git-cliff assemble changelogs from labels or commit conventions, so the output is only as good as your PR titles. Shipnote rewrites messy PR titles and descriptions into plain sentences users can read, works with any major provider, and never needs a shared server-side AI key.

## Features

- Bring your own key: Anthropic, OpenAI, Google, OpenRouter, or any OpenAI-compatible endpoint
- Merged PR fetch for the last 7, 14 or 30 days, with a checklist to exclude items
- Token estimate before you generate
- Streaming generation with Technical, Friendly or Marketing tone
- Editable Markdown with live preview, copy, and `CHANGELOG.md` download
- No account, no database

## Quick start

```bash
git clone https://github.com/HARI9037/Shipnote.git
cd Shipnote
npm install
npm run dev
```

Open http://localhost:3000, choose a provider, paste your key, and press **Test connection**.

### Environment variables (all optional)

| Variable                  | Purpose                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_TOKEN`            | Raises GitHub API rate limits. A token with no scopes is enough for public repos.                                                                 |
| `ALLOW_PRIVATE_BASE_URLS` | Set to `true` when self-hosting so the Custom provider can reach local servers such as Ollama or LM Studio. Leave it unset on public deployments. |

See `.env.example`.

## How your API key is handled

- The key lives only in your browser: `sessionStorage` by default, or `localStorage` if you tick **Remember on this device**. Keys are stored separately for each provider.
- Each request sends the key to this app's server over HTTPS in an `x-llm-key` header. The server forwards it to the provider you chose and discards it. It is never stored, logged, put in a URL, or returned in a response.
- **In hosted mode the key does pass through the server.** If you do not want to trust a hosted instance, run Shipnote yourself. It is a single Next.js app with no database.
- The page loads no third-party scripts, fonts or analytics, and a Content Security Policy restricts the browser to its own origin.

Details and reporting instructions: [SECURITY.md](SECURITY.md).

## Self-hosting

```bash
npm install
npm run build
npm start
```

To use a local model, set `ALLOW_PRIVATE_BASE_URLS=true`, choose **Custom OpenAI-compatible**, and enter a base URL such as `http://localhost:11434/v1`.

## Known limitations

- Public repositories only.
- Custom base URLs are checked against private address ranges, but the check resolves DNS before the request is made. A hostile DNS server could change its answer in between (DNS rebinding). Self-host if you need stronger guarantees.
- The rate limit (10 requests per minute per IP) is kept in memory, so it applies per server instance and resets on restart.
- Provider model names change often. If a default model is rejected, edit the **Model** field.
- Anyone can generate notes for any public repository. Shipnote does not verify repository ownership.

## Development

```bash
npm test          # unit tests
npm run typecheck
npm run build
npm run format    # Prettier
```

The code is organised as: `app/api/*` (thin routes), `lib/llm.ts` (provider request builder), `lib/ssrf.ts` (custom URL protection), `lib/keystore.ts` (browser key storage), `lib/stream.ts` (streaming parser), `components/*` (UI).

## Roadmap

See [docs/PRD.md](docs/PRD.md): accounts and hosted changelog pages, private repos with your own GitHub token, tag-range selection, label filters, RSS, direct-from-browser mode, and publishing as a GitHub Release.

## License

[MIT](LICENSE)
