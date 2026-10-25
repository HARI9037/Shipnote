# Shipnote

Open-source release notes from merged GitHub PRs. Bring your own key from Anthropic, OpenAI, Google, OpenRouter, or any OpenAI-compatible endpoint.

## Run locally

```bash
npm install
npm run dev
```

Keys are entered in the browser and sent over HTTPS per request. Shipnote never stores or logs them. `GITHUB_TOKEN` is optional and raises the GitHub API rate limit for public repositories.

## Scope

This first release is intentionally stateless: no accounts, database, payments, or private repositories.
