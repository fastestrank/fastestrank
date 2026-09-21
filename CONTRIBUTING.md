# Contributing to FastestRank

Thank you for your interest in contributing to FastestRank! This repository hosts the public plugin packages, marketplace manifests, and canonical agent skills for FastestRank.

## Repository Scope

This repository is focused exclusively on **hosted-MCP client distributions**:
- It provides marketplace manifests and plugin packages for Claude Code, Codex CLI, Cursor, and Agents.
- It connects strictly to the hosted FastestRank MCP server at `https://app.fastestrank.com/mcp`.
- It does **not** host backend engine code, database schemas, internal worker scripts, or private credentials.

## Development Workflow

This repository has zero runtime dependencies and requires only Node.js (>= 18):

```bash
# Verify skill copies and lock file
npm run check-skills

# Run all repository consistency checks
npm run check-repo

# Run all checks together
npm test
```

## Modifying Skills

1. Canonical skill source files live under `.agents/skills/<skill-name>/`.
2. When updating or adding content to skills, run:
   ```bash
   npm run sync-skills
   ```
   This regenerates the identical distribution copies under `plugins/fastestrank/skills/` and ensures real files (not symlinks) are used.
3. Update `skills-lock.json` if required and verify with `npm run check-skills`.

## Submitting Pull Requests

- Keep changes focused and surgical.
- Ensure `npm test` passes cleanly before opening a pull request.
- All contributions are reviewed by repository maintainers according to [CODEOWNERS](./CODEOWNERS).
