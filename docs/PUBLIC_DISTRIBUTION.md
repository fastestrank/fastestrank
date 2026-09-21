# FastestRank Public Distribution

## Publication model

This repository publishes marketplace catalogues, plugin metadata, skill instructions, and installation documentation. It does not distribute the hosted FastestRank application or deployment configuration.

## Licence decision

The repository licence is: MIT License.
Every retained OpenSEO-derived file is listed in `THIRD_PARTY_NOTICES.md` with its original MIT notice. The maintainer has confirmed that this distribution complies with every retained upstream licence.

## Canonical Distribution URLs

- **Repository:** `https://github.com/fastestrank/fastestrank/`
- **MCP Endpoint:** `https://app.fastestrank.com/mcp/`
- **Homepage:** `https://www.fastestrank.com/`

## Service Verification & Evidence Table

| Target | URL | Timestamp (ISO 8601) | Tester | HTTP Status | Details & Outcome |
|---|---|---|---|---|---|
| Website Homepage | `https://www.fastestrank.com/` | 2026-09-21T16:11:38Z | Release Agent | 200 OK | Verified live homepage |
| Pricing | `https://www.fastestrank.com/pricing` | 2026-09-21T16:20:34Z | Release Agent | 404 Not Found | Pricing route pending public site rollout |
| Privacy Policy | `https://www.fastestrank.com/privacy-policy/` | 2026-09-21T16:20:34Z | Release Agent | 200 OK | Verified legal privacy policy |
| Terms of Service | `https://www.fastestrank.com/terms-of-service/` | 2026-09-21T16:20:34Z | Release Agent | 200 OK | Verified legal terms of service |
| Support | `https://www.fastestrank.com/support` | 2026-09-21T16:20:34Z | Release Agent | 404 Not Found | Contact/support route pending public site rollout |
| Hosted MCP Endpoint | `https://app.fastestrank.com/mcp/` | 2026-09-21T16:24:58Z | Release Agent | 405 Method Not Allowed | Active Cloudflare MCP server; rejects unauthenticated POST |

## Client Installation & Verification Procedures

### Codex CLI
```bash
codex plugin marketplace add fastestrank/fastestrank
codex plugin marketplace list
codex plugin add fastestrank@fastestrank
codex mcp login fastestrank
```

### Claude Code
```bash
/plugin marketplace add fastestrank/fastestrank
/plugin install fastestrank@fastestrank
```

### Cursor
Install the FastestRank plugin through the Cursor marketplace or configure via `.cursor-plugin/marketplace.json`.
