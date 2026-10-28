#!/usr/bin/env node
/**
 * Generate CHANGELOG.md for Shipnote using OpenRouter API.
 * Run with: node scripts/generate-changelog.mjs
 */

import { readFileSync, writeFile } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env");
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const [key, ...val] = line.split("=");
      if (key && val.length && !key.startsWith("#")) {
        process.env[key.trim()] = val.join("=").trim();
      }
    }
  } catch (e) {
    console.error("Could not load .env:", e.message);
  }
}

loadEnv();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/auto";

if (!OPENROUTER_API_KEY) {
  console.error("No OPENROUTER_API_KEY in .env");
  process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchPRs() {
  const repo = "HARI9037/Shipnote";
  const since = "2026-10-01";
  const until = new Date().toISOString().slice(0, 10);

  const url = `https://api.github.com/search/issues?q=repo:${repo}+is:pr+is:merged+merged:>=${since}&sort=updated&order=desc&per_page=100`;

  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.items || [];
}

function sanitizePRs(prs) {
  return prs
    .filter((p) => p.pull_request && p.state === "closed")
    .map((p) => ({
      number: p.number,
      title: p.title,
      body: p.body || "",
      labels: p.labels?.map((l) => l.name) || [],
      user: p.user?.login || "",
    }))
    .slice(0, 100);
}

function buildPrompt(repo, range, tone, prs) {
  const toneMap = {
    Technical: "precise, developer-facing",
    Friendly: "warm, plain",
    Marketing: "benefit-led, energetic, no hype claims",
  };

  const system = `You write release notes for the users of a software product. Input is a list of merged pull requests. Group user-visible changes under three headings: New, Improved, Fixed. Rewrite each PR into one plain, benefit-focused sentence of at most 20 words. Merge duplicates. Skip purely internal work (refactors, CI, dependency bumps, tests) unless users would notice it. Never invent features that are not in the input. If there are no user-visible changes, say so in one line. Match this tone: ${toneMap[tone] || toneMap.Friendly}. Output Markdown only, with no preamble.`;

  const prsForPrompt = prs.map((p) => ({
    number: p.number,
    title: p.title,
    body_excerpt: p.body.slice(0, 400),
    labels: p.labels,
  }));

  const user = `Project: ${repo}\nDate range: ${range}\nPRs:\n${JSON.stringify(prsForPrompt, null, 2)}`;

  return { system, user };
}

async function generateChangelog() {
  console.log("Fetching merged PRs from HARI9037/Shipnote...");
  const prs = await fetchPRs();
  const selected = sanitizePRs(prs);
  console.log(`Found ${selected.length} merged PRs`);

  if (selected.length === 0) {
    console.log("No PRs found, writing empty changelog");
    return "# Shipnote Changelog\n\nNo merged PRs found in the specified range.\n";
  }

  const prompt = buildPrompt("Shipnote", "Oct 2026 to present", "Friendly", selected);

  console.log("Generating release notes with OpenRouter...");

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: 2000,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const changelog = data.choices?.[0]?.message?.content || "";

  if (!changelog.trim()) {
    throw new Error("Empty response from OpenRouter");
  }

  const header = `# Shipnote Changelog\n\nGenerated on ${new Date().toISOString().slice(0, 10)} using OpenRouter/${OPENROUTER_MODEL}\n\n---\n\n`;
  const fullContent = header + changelog.trim() + "\n";

  const outputPath = join(__dirname, "..", "CHANGELOG.md");
  await fs.writeFile(outputPath, fullContent, "utf-8");
  console.log(`CHANGELOG.md written to ${outputPath}`);
  console.log("\n---\n" + changelog);

  return fullContent;
}

generateChangelog().catch((err) => {
  console.error(err);
  process.exit(1);
});
