#!/usr/bin/env node
// Check parity between .agents/skills/ and plugins/fastestrank/skills/
// and validate / update skills-lock.json.
import { readFileSync, readdirSync, statSync, lstatSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(repoRoot, ".agents/skills");
const targetDir = join(repoRoot, "plugins/fastestrank/skills");
const lockFilePath = join(repoRoot, "skills-lock.json");

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
].sort();

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function getFilesRecursively(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = join(prefix, entry.name);
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? getFilesRecursively(fullPath, rel) : [rel];
  });
}

const errors = [];

// 1. Verify exactly the 10 expected canonical skills exist in sourceDir
const actualSourceSkills = readdirSync(sourceDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

if (JSON.stringify(actualSourceSkills) !== JSON.stringify(SKILLS)) {
  errors.push(`Canonical source skills mismatch.\nExpected: ${JSON.stringify(SKILLS)}\nActual: ${JSON.stringify(actualSourceSkills)}`);
}

// 2. Verify parity and real files in plugins/fastestrank/skills
const actualTargetSkills = existsSync(targetDir)
  ? readdirSync(targetDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  : [];

if (JSON.stringify(actualTargetSkills) !== JSON.stringify(SKILLS)) {
  errors.push(`Generated plugin skills directory mismatch.\nExpected: ${JSON.stringify(SKILLS)}\nActual: ${JSON.stringify(actualTargetSkills)}`);
}

const computedHashes = {};

for (const skill of SKILLS) {
  const srcSkillDir = join(sourceDir, skill);
  const dstSkillDir = join(targetDir, skill);

  if (!existsSync(srcSkillDir)) {
    errors.push(`Missing source skill: ${skill}`);
    continue;
  }
  if (!existsSync(dstSkillDir)) {
    errors.push(`Missing generated plugin skill: ${skill}`);
    continue;
  }

  const srcFiles = getFilesRecursively(srcSkillDir).sort();
  const dstFiles = getFilesRecursively(dstSkillDir).sort();

  if (JSON.stringify(srcFiles) !== JSON.stringify(dstFiles)) {
    errors.push(`File list differs for skill '${skill}':\nSource: ${srcFiles.join(", ")}\nTarget: ${dstFiles.join(", ")}`);
    continue;
  }

  for (const relFile of srcFiles) {
    const srcPath = join(srcSkillDir, relFile);
    const dstPath = join(dstSkillDir, relFile);

    // Verify generated files are real files, not symlinks
    const dstStat = lstatSync(dstPath);
    if (dstStat.isSymbolicLink()) {
      errors.push(`Generated file ${skill}/${relFile} is a symlink. Must be a real file.`);
    }

    const srcBuf = readFileSync(srcPath);
    const dstBuf = readFileSync(dstPath);

    if (!srcBuf.equals(dstBuf)) {
      errors.push(`Byte content differs for ${skill}/${relFile}`);
    }

    computedHashes[`${skill}/${relFile}`] = sha256(srcBuf);
  }
}

// 3. Verify skills-lock.json
const updateLock = process.argv.includes("--update-lock");

if (!existsSync(lockFilePath)) {
  if (updateLock) {
    const lockData = {
      schemaVersion: "1.0.0",
      releaseVersion: "1.0.0",
      repository: "https://github.com/fastestrank/fastestrank/",
      skills: SKILLS,
      files: computedHashes,
    };
    writeFileSync(lockFilePath, JSON.stringify(lockData, null, 2) + "\n");
    console.log("Created skills-lock.json");
  } else {
    errors.push("skills-lock.json is missing. Run with --update-lock to generate.");
  }
} else {
  try {
    const lockData = JSON.parse(readFileSync(lockFilePath, "utf8"));
    if (lockData.schemaVersion !== "1.0.0") {
      errors.push(`Invalid schemaVersion in skills-lock.json: ${lockData.schemaVersion}`);
    }
    if (lockData.releaseVersion !== "1.0.0") {
      errors.push(`Invalid releaseVersion in skills-lock.json: ${lockData.releaseVersion}`);
    }
    if (JSON.stringify(lockData.skills?.sort()) !== JSON.stringify(SKILLS)) {
      errors.push(`skills-lock.json skills array does not match expected 10 skills.`);
    }

    // Check lock file hashes against computed
    for (const [file, hash] of Object.entries(computedHashes)) {
      if (lockData.files?.[file] !== hash) {
        errors.push(`Lock file hash mismatch for ${file}: expected ${hash}, found ${lockData.files?.[file]}`);
      }
    }
    for (const file of Object.keys(lockData.files || {})) {
      if (!computedHashes[file]) {
        errors.push(`Lock file contains extra unknown file entry: ${file}`);
      }
    }

    if (updateLock && errors.length > 0) {
      lockData.skills = SKILLS;
      lockData.files = computedHashes;
      writeFileSync(lockFilePath, JSON.stringify(lockData, null, 2) + "\n");
      console.log("Updated skills-lock.json with current hashes.");
      process.exit(0);
    }
  } catch (err) {
    errors.push(`Failed to parse skills-lock.json: ${err.message}`);
  }
}

if (errors.length > 0) {
  console.error("Skill check failed:");
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  process.exit(1);
}

console.log(`Skill parity & lock verification passed for all ${SKILLS.length} skills.`);
