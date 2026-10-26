export type PR = { number: number; title: string; body_excerpt: string; labels: string[]; author: string };

export function parseRepo(input: string) {
  const clean = String(input)
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//, "")
    .replace(/\.git\/?$/, "")
    .replace(/\/$/, "");
  if (!/^[\w.-]+\/[\w.-]+$/.test(clean)) throw new Error("Enter a GitHub URL or owner/repo");
  return clean;
}

export function parseSince(input: unknown) {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input) || Number.isNaN(Date.parse(input))) {
    throw new Error("Invalid date range");
  }
  return input;
}

type GitHubItem = {
  number: number;
  title: string;
  body: string | null;
  labels: { name: string }[];
  user?: { login: string };
};

export async function fetchPRs(repo: string, since: string): Promise<PR[]> {
  const q = encodeURIComponent(`repo:${repo} is:pr is:merged merged:>=${since}`);
  const res = await fetch(
    `https://api.github.com/search/issues?q=${q}&sort=updated&order=desc&per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    // The search API answers 422 (not 404) when a repository does not exist or is not visible.
    if (res.status === 404 || res.status === 422) throw new Error("Repository not found");
    if (res.status === 403 || res.status === 429) throw new Error("GitHub rate limit reached");
    throw new Error("Could not fetch pull requests");
  }
  const data = (await res.json()) as { items: GitHubItem[] };
  return data.items.slice(0, 100).map((p) => ({
    number: p.number,
    title: p.title,
    body_excerpt: (p.body || "").slice(0, 400),
    labels: p.labels.map((l) => l.name),
    author: p.user?.login || "unknown",
  }));
}

/** Server-side input hygiene: caps the number of PRs and the size of every field the client can send. */
export function sanitizePRs(value: unknown): PR[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((pr: Record<string, unknown>) => {
    if (typeof pr?.number !== "number" || typeof pr.title !== "string") return [];
    return [
      {
        number: pr.number,
        title: pr.title.slice(0, 300),
        body_excerpt: typeof pr.body_excerpt === "string" ? pr.body_excerpt.slice(0, 400) : "",
        labels: Array.isArray(pr.labels)
          ? pr.labels.filter((label): label is string => typeof label === "string").slice(0, 20)
          : [],
        author: typeof pr.author === "string" ? pr.author.slice(0, 100) : "unknown",
      },
    ];
  });
}
