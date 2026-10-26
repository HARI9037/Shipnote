# Security Policy

Shipnote handles API keys that belong to its users, so security reports are taken seriously.

## Reporting a vulnerability

Please do **not** open a public issue. Use GitHub's private vulnerability reporting
(Security tab, "Report a vulnerability") on this repository. Include steps to reproduce and the
impact you see. You can expect an acknowledgement within a few days.

## What is in scope

- Any path where an API key could be logged, stored on the server, placed in a URL, or returned to a client
- Bypasses of the custom base URL protection (SSRF)
- Injection through repository names, dates or pull request content

## Key handling

See "How your API key is handled" in the README.
