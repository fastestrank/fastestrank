import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validatePublicRelease,
  EXPECTED_NAME,
  EXPECTED_MCP_URL,
  EXPECTED_REPO_URL,
} from "./validate-public-release.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

test("validatePublicRelease passes on current repository baseline", () => {
  const errors = validatePublicRelease({ repoRoot, expectedLicense: "MIT" });
  assert.deepEqual(errors, [], `Expected no validation errors, got:\n${errors.join("\n")}`);
});

test("Manifests parse and contain expected FastestRank identities, sources, and endpoints", () => {
  const codexMarketplace = JSON.parse(readFileSync(join(repoRoot, ".agents/plugins/marketplace.json"), "utf8"));
  const claudeMarketplace = JSON.parse(readFileSync(join(repoRoot, ".claude-plugin/marketplace.json"), "utf8"));
  const cursorMarketplace = JSON.parse(readFileSync(join(repoRoot, ".cursor-plugin/marketplace.json"), "utf8"));

  const codexPlugin = JSON.parse(readFileSync(join(repoRoot, "plugins/fastestrank/.codex-plugin/plugin.json"), "utf8"));
  const claudePlugin = JSON.parse(readFileSync(join(repoRoot, "plugins/fastestrank/.claude-plugin/plugin.json"), "utf8"));
  const cursorPlugin = JSON.parse(readFileSync(join(repoRoot, "plugins/fastestrank/.cursor-plugin/plugin.json"), "utf8"));
  const cursorMcp = JSON.parse(readFileSync(join(repoRoot, "plugins/fastestrank/mcp.json"), "utf8"));

  assert.equal(codexMarketplace.name, EXPECTED_NAME);
  assert.equal(claudeMarketplace.name, EXPECTED_NAME);
  assert.equal(cursorMarketplace.name, EXPECTED_NAME);

  // Codex marketplace schema invariants
  assert.equal(codexMarketplace.plugins[0].name, EXPECTED_NAME);
  assert.equal(codexMarketplace.plugins[0].source.source, "local");
  assert.equal(codexMarketplace.plugins[0].source.path, "./plugins/fastestrank");
  assert.equal(codexMarketplace.plugins[0].policy.installation, "AVAILABLE");
  assert.equal(codexMarketplace.plugins[0].policy.authentication, "ON_INSTALL");

  assert.equal(codexPlugin.name, EXPECTED_NAME);
  assert.equal(claudePlugin.name, EXPECTED_NAME);
  assert.equal(cursorPlugin.name, EXPECTED_NAME);

  assert.equal(codexPlugin.mcpServers.fastestrank.url, EXPECTED_MCP_URL);
  assert.equal(claudePlugin.mcpServers.fastestrank.url, EXPECTED_MCP_URL);
  assert.equal(cursorMcp.mcpServers.fastestrank.url, EXPECTED_MCP_URL);

  assert.equal(codexPlugin.repository, EXPECTED_REPO_URL);
  assert.equal(claudePlugin.repository, EXPECTED_REPO_URL);
  assert.equal(cursorPlugin.repository, EXPECTED_REPO_URL);
});

test("validatePublicRelease catches corrupted plugin name fixture", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "fr-release-test-"));
  try {
    cpSync(repoRoot, tempDir, {
      recursive: true,
      filter: (src) => !src.includes(".git") && !src.includes("node_modules"),
    });

    // Corrupt codex plugin.json name to "openseo"
    const codexPath = join(tempDir, "plugins/fastestrank/.codex-plugin/plugin.json");
    const codexJson = JSON.parse(readFileSync(codexPath, "utf8"));
    codexJson.name = "openseo";
    writeFileSync(codexPath, JSON.stringify(codexJson, null, 2));

    const errors = validatePublicRelease({ repoRoot: tempDir, expectedLicense: "MIT" });
    assert.ok(errors.length > 0, "Expected errors for corrupted name");
    assert.ok(
      errors.some((e) => e.includes("plugins/fastestrank/.codex-plugin/plugin.json: name must equal fastestrank")),
      `Expected error about plugin name, got: ${errors.join("; ")}`,
    );
    assert.ok(
      errors.some((e) => e.includes("contains prohibited legacy term")),
      `Expected error about prohibited legacy term, got: ${errors.join("; ")}`,
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("validatePublicRelease catches invalid Codex marketplace source fixture", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "fr-release-mkt-test-"));
  try {
    cpSync(repoRoot, tempDir, {
      recursive: true,
      filter: (src) => !src.includes(".git") && !src.includes("node_modules"),
    });

    const mktPath = join(tempDir, ".agents/plugins/marketplace.json");
    const mktJson = JSON.parse(readFileSync(mktPath, "utf8"));
    mktJson.plugins[0].source = { type: "github", repo: "fastestrank/fastestrank", path: "plugins/fastestrank" };
    writeFileSync(mktPath, JSON.stringify(mktJson, null, 2));

    const errors = validatePublicRelease({ repoRoot: tempDir, expectedLicense: "MIT" });
    assert.ok(
      errors.some((e) => e.includes(".agents/plugins/marketplace.json: plugin.source must be")),
      `Expected error about invalid plugin source, got: ${errors.join("; ")}`,
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("validatePublicRelease catches invalid MCP URL fixture", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "fr-release-mcp-test-"));
  try {
    cpSync(repoRoot, tempDir, {
      recursive: true,
      filter: (src) => !src.includes(".git") && !src.includes("node_modules"),
    });

    const mcpPath = join(tempDir, "plugins/fastestrank/mcp.json");
    const mcpJson = JSON.parse(readFileSync(mcpPath, "utf8"));
    mcpJson.mcpServers.fastestrank.url = "https://invalid.example.com/mcp";
    writeFileSync(mcpPath, JSON.stringify(mcpJson, null, 2));

    const errors = validatePublicRelease({ repoRoot: tempDir, expectedLicense: "MIT" });
    assert.ok(
      errors.some((e) => e.includes("plugins/fastestrank/mcp.json: mcpServers.fastestrank.url must equal")),
      `Expected error about invalid MCP URL, got: ${errors.join("; ")}`,
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
