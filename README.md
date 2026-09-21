# FastestRank

> Official FastestRank plugin packages, marketplace manifests, and canonical SEO Agent Skills.

FastestRank provides SEO intelligence for AI agents (Claude Code, Codex CLI, Cursor, and Agents). It connects AI models to live SEO data, site audits, keyword metrics, backlinks, and rankings via the hosted FastestRank MCP server at `https://app.fastestrank.com/mcp/`.

## Features

- **Hosted MCP Server**: Direct connection to FastestRank SEO tools and live data.
- **10 Curated Agent Skills**: Structured, production-tested SEO workflows:
  - **SEO Project Setup**: Initialize domain context, target keywords, and competitors.
  - **SEO Coach**: Interactive SEO guidance and workflow selection.
  - **SEO Audit**: Comprehensive website audit and prioritization.
  - **Keyword Research**: Discovery and evaluation of keyword opportunities.
  - **Keyword Clustering**: Group keywords by search intent and landing pages.
  - **Competitive Landscape**: Market leadership and keyword coverage analysis.
  - **Competitor Analysis**: Deep dive into individual competitor strategies.
  - **Local SEO**: Google Business Profile and local visibility audits.
  - **Link Prospecting**: High-probability backlink target discovery.
  - **SEO Report**: Self-contained, shareable HTML report generation.

## Installation

### Claude Code

Add the FastestRank marketplace and install the plugin:

```bash
/plugin marketplace add fastestrank/fastestrank
/plugin install fastestrank@fastestrank
```

Follow the prompt to approve the OAuth connection to FastestRank MCP at `https://app.fastestrank.com/mcp/`.

### Codex CLI

```bash
codex plugin marketplace add fastestrank/fastestrank
codex plugin add fastestrank@fastestrank
codex mcp login fastestrank
```

### Cursor

Install the FastestRank plugin directly from the Cursor Marketplace. When prompted, authorize the connection to FastestRank.

## Upgrading from Legacy Packages

If you previously used legacy packages, please refer to the [Migration Guide](./docs/migration.md) for clean-break uninstall and reinstall instructions.

## Verification & Development

This repository contains zero runtime dependencies. Scripts use standard Node.js (>= 18):

```bash
# Sync canonical skills from .agents/skills/ to plugins/fastestrank/skills/
npm run sync-skills

# Validate skill integrity and skills-lock.json parity
npm run check-skills

# Run full repository sanity and policy checks
npm run check-repo

# Run all checks
npm test
```

## Security, Trademarks & Licences

- For security reporting, see [SECURITY.md](./SECURITY.md).
- For trademark and brand usage policy, see [TRADEMARKS.md](./TRADEMARKS.md).
- For public distribution scope and verification, see [docs/PUBLIC_DISTRIBUTION.md](./docs/PUBLIC_DISTRIBUTION.md).
- For third-party notices and upstream attribution, see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
- Code is released under the [MIT License](./LICENSE).
