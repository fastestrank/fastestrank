#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const EXPECTED_NAME = "fastestrank";
export const EXPECTED_REPO_URL = "https://github.com/fastestrank/fastestrank/";
export const EXPECTED_MCP_URL = "https://app.fastestrank.com/mcp/";
export const EXPECTED_HOMEPAGE_URL = "https://www.fastestrank.com/";
export const EXPECTED_SKILLS = [
  "competitive-landscape",
  "competitor-analysis",
  "keyword-clustering",
  "keyword-research",
  "link-prospecting",
  "local-seo",
  "seo-audit",
  "seo-coach",
  "seo-project-setup",
  "seo-report",
].sort();

const BANNED_TERMS = [
  ["open", "seo"].join(""),
  ["open", "seo", ".so"].join(""),
  ["every-app", "open-seo"].join("/"),
];

export function validatePublicRelease({ repoRoot, expectedLicense = "MIT" }) {
  const errors = [];

  function err(msg) {
    errors.push(msg);
  }

  function readJson(relPath) {
    const fullPath = join(repoRoot, relPath);
    if (!existsSync(fullPath)) {
      err(`${relPath}: file does not exist`);
      return null;
    }
    try {
      const raw = readFileSync(fullPath, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      err(`${relPath}: failed to parse JSON: ${e.message}`);
      return null;
    }
  }

  // 1. Marketplace manifests
  const codexMkt = readJson(".agents/plugins/marketplace.json");
  const claudeMkt = readJson(".claude-plugin/marketplace.json");
  const cursorMkt = readJson(".cursor-plugin/marketplace.json");

  if (codexMkt) {
    if (codexMkt.name !== EXPECTED_NAME) {
      err(`.agents/plugins/marketplace.json: name must equal ${EXPECTED_NAME}`);
    }
    const plugin = codexMkt.plugins?.[0];
    if (!plugin) {
      err(`.agents/plugins/marketplace.json: must declare at least one plugin`);
    } else {
      if (plugin.name !== EXPECTED_NAME) {
        err(`.agents/plugins/marketplace.json: plugin.name must equal ${EXPECTED_NAME}`);
      }
      if (plugin.source?.source !== "local" || plugin.source?.path !== "./plugins/fastestrank") {
        err(`.agents/plugins/marketplace.json: plugin.source must be { source: "local", path: "./plugins/fastestrank" }`);
      }
      if (plugin.policy?.installation !== "AVAILABLE" || plugin.policy?.authentication !== "ON_INSTALL") {
        err(`.agents/plugins/marketplace.json: plugin.policy must have installation: "AVAILABLE" and authentication: "ON_INSTALL"`);
      }
    }
  }
  if (claudeMkt) {
    if (claudeMkt.name !== EXPECTED_NAME) {
      err(`.claude-plugin/marketplace.json: name must equal ${EXPECTED_NAME}`);
    }
  }
  if (cursorMkt) {
    if (cursorMkt.name !== EXPECTED_NAME) {
      err(`.cursor-plugin/marketplace.json: name must equal ${EXPECTED_NAME}`);
    }
  }

  // 2. Plugin manifests
  const codexPlugin = readJson("plugins/fastestrank/.codex-plugin/plugin.json");
  const claudePlugin = readJson("plugins/fastestrank/.claude-plugin/plugin.json");
  const cursorPlugin = readJson("plugins/fastestrank/.cursor-plugin/plugin.json");
  const cursorMcp = readJson("plugins/fastestrank/mcp.json");

  if (codexPlugin) {
    if (codexPlugin.name !== EXPECTED_NAME) {
      err(`plugins/fastestrank/.codex-plugin/plugin.json: name must equal ${EXPECTED_NAME}`);
    }
    if (codexPlugin.repository !== EXPECTED_REPO_URL) {
      err(`plugins/fastestrank/.codex-plugin/plugin.json: repository must equal ${EXPECTED_REPO_URL}`);
    }
    if (codexPlugin.license !== expectedLicense) {
      err(`plugins/fastestrank/.codex-plugin/plugin.json: license must equal ${expectedLicense}`);
    }
    const mcpUrl = codexPlugin.mcpServers?.fastestrank?.url;
    if (mcpUrl !== EXPECTED_MCP_URL) {
      err(`plugins/fastestrank/.codex-plugin/plugin.json: mcpServers.fastestrank.url must equal ${EXPECTED_MCP_URL}`);
    }
  }

  if (claudePlugin) {
    if (claudePlugin.name !== EXPECTED_NAME) {
      err(`plugins/fastestrank/.claude-plugin/plugin.json: name must equal ${EXPECTED_NAME}`);
    }
    if (claudePlugin.repository !== EXPECTED_REPO_URL) {
      err(`plugins/fastestrank/.claude-plugin/plugin.json: repository must equal ${EXPECTED_REPO_URL}`);
    }
    if (claudePlugin.license !== expectedLicense) {
      err(`plugins/fastestrank/.claude-plugin/plugin.json: license must equal ${expectedLicense}`);
    }
    const mcpUrl = claudePlugin.mcpServers?.fastestrank?.url;
    if (mcpUrl !== EXPECTED_MCP_URL) {
      err(`plugins/fastestrank/.claude-plugin/plugin.json: mcpServers.fastestrank.url must equal ${EXPECTED_MCP_URL}`);
    }
  }

  if (cursorPlugin) {
    if (cursorPlugin.name !== EXPECTED_NAME) {
      err(`plugins/fastestrank/.cursor-plugin/plugin.json: name must equal ${EXPECTED_NAME}`);
    }
    if (cursorPlugin.repository !== EXPECTED_REPO_URL) {
      err(`plugins/fastestrank/.cursor-plugin/plugin.json: repository must equal ${EXPECTED_REPO_URL}`);
    }
    if (cursorPlugin.license !== expectedLicense) {
      err(`plugins/fastestrank/.cursor-plugin/plugin.json: license must equal ${expectedLicense}`);
    }
  }

  if (cursorMcp) {
    const mcpUrl = cursorMcp.mcpServers?.fastestrank?.url;
    if (mcpUrl !== EXPECTED_MCP_URL) {
      err(`plugins/fastestrank/mcp.json: mcpServers.fastestrank.url must equal ${EXPECTED_MCP_URL}`);
    }
  }

  // 3. Required plugin files
  const requiredPluginFiles = [
    "plugins/fastestrank/.codex-plugin/plugin.json",
    "plugins/fastestrank/.claude-plugin/plugin.json",
    "plugins/fastestrank/.cursor-plugin/plugin.json",
    "plugins/fastestrank/mcp.json",
    "plugins/fastestrank/README.md",
  ];
  for (const f of requiredPluginFiles) {
    if (!existsSync(join(repoRoot, f))) {
      err(`Missing required plugin file: ${f}`);
    }
  }

  // 4. Ten skills directories verification
  for (const skillsRoot of [".agents/skills", "plugins/fastestrank/skills"]) {
    const fullSkillsDir = join(repoRoot, skillsRoot);
    if (!existsSync(fullSkillsDir)) {
      err(`Missing skills directory: ${skillsRoot}`);
      continue;
    }
    const foundSkills = readdirSync(fullSkillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    if (foundSkills.length !== 10) {
      err(`${skillsRoot}: expected 10 skills, found ${foundSkills.length}`);
    }
    for (const expSkill of EXPECTED_SKILLS) {
      if (!foundSkills.includes(expSkill)) {
        err(`${skillsRoot}: missing expected skill ${expSkill}`);
      }
    }
  }

  // 5. Banned legacy strings check in release manifests and plugin directory
  const filesToScanForBanned = [
    ".agents/plugins/marketplace.json",
    ".claude-plugin/marketplace.json",
    ".cursor-plugin/marketplace.json",
    "plugins/fastestrank/.codex-plugin/plugin.json",
    "plugins/fastestrank/.claude-plugin/plugin.json",
    "plugins/fastestrank/.cursor-plugin/plugin.json",
    "plugins/fastestrank/mcp.json",
    "plugins/fastestrank/README.md",
    "package.json",
  ];

  for (const f of filesToScanForBanned) {
    const p = join(repoRoot, f);
    if (!existsSync(p)) continue;
    const content = readFileSync(p, "utf8").toLowerCase();
    for (const term of BANNED_TERMS) {
      if (content.includes(term.toLowerCase())) {
        err(`${f}: contains prohibited legacy term '${term}'`);
      }
    }
  }

  return errors;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  const repoRoot = fileURLToPath(new URL("..", import.meta.url));
  const errors = validatePublicRelease({ repoRoot, expectedLicense: "MIT" });
  if (errors.length > 0) {
    console.error("Public release validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }
  console.log("Public release validation passed: all platform manifests, identities, endpoints, and skills are valid.");
}
