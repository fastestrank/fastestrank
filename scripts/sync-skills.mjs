#!/usr/bin/env node
// Sync canonical skills from .agents/skills/ into plugins/fastestrank/skills/
// Ensures real file copies (dereferencing symlinks) and removes stale directories.
import { cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(repoRoot, ".agents/skills");
const targetDir = join(repoRoot, "plugins/fastestrank/skills");

export const SKILLS = [
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
];

// Verify source directory exists
if (!existsSync(sourceDir)) {
  console.error(`Source directory not found: ${sourceDir}`);
  process.exit(1);
}

// Remove target skills directory completely to purge stale files
rmSync(targetDir, { recursive: true, force: true });

for (const skill of SKILLS) {
  const src = join(sourceDir, skill);
  const dst = join(targetDir, skill);

  if (!existsSync(src)) {
    console.error(`Missing canonical source skill: ${skill} at ${src}`);
    process.exit(1);
  }

  cpSync(src, dst, {
    recursive: true,
    dereference: true,
  });
}

console.log(`Successfully synced ${SKILLS.length} skills into plugins/fastestrank/skills/`);
