# Migration Guide: Upgrading from OpenSEO to FastestRank

This document outlines the clean-break migration instructions for users transitioning from legacy OpenSEO installations to FastestRank.

## Background

FastestRank is the official, rebranded suite for SEO tools, Agent Skills, and MCP endpoints. Legacy packages and marketplace manifests referencing OpenSEO, `openseo`, or `every-app/open-seo` are deprecated.

## Clean-Break Removal & Reinstallation

### Claude Code

1. **Remove the old OpenSEO plugin and marketplace**:
   ```bash
   /plugin uninstall openseo@openseo
   /plugin marketplace remove openseo
   ```
   *(If previously installed at the user scope, run: `claude plugin uninstall openseo@openseo --scope user`)*

2. **Clear the plugin cache** (optional but recommended if stale skill definitions persist):
   ```bash
   rm -rf ~/.claude/plugins/cache
   ```

3. **Install FastestRank**:
   ```bash
   /plugin marketplace add fastestrank/fastestrank
   /plugin install fastestrank@fastestrank
   /reload-plugins
   ```

4. **Authenticate**:
   Run `/mcp`, choose `fastestrank`, and approve the connection to `https://app.fastestrank.com/mcp`.

---

### Codex CLI

1. **Remove the old OpenSEO plugin**:
   ```bash
   codex plugin remove openseo@openseo
   codex mcp logout openseo
   ```

2. **Install FastestRank**:
   ```bash
   codex plugin marketplace add fastestrank/fastestrank
   codex plugin add fastestrank@fastestrank
   codex mcp login fastestrank
   ```

---

### Cursor

1. Open the Cursor Settings / Extensions pane.
2. Locate and uninstall **OpenSEO**.
3. Search for **FastestRank** in the Marketplace and click **Install**.
4. Authenticate your FastestRank account when prompted.

---

## MCP Server Endpoint

The official hosted MCP endpoint for FastestRank is:
```text
https://app.fastestrank.com/mcp
```
Legacy self-hosted OpenSEO endpoints or local bridge scripts are no longer used by the official distribution.
