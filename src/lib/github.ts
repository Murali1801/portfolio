/** Build-time GitHub star counts with a graceful fallback (offline, 404, rate limit, timeout). */

export type Stars = number | null;

const cache = new Map<string, Promise<Stars>>();

export interface StarOptions {
  timeoutMs?: number;
  token?: string;
  fetchImpl?: typeof fetch;
}

export async function fetchStars(owner: string, repo: string, opts: StarOptions = {}): Promise<Stars> {
  const f = opts.fetchImpl ?? fetch;
  try {
    const res = await f(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-template-build',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      signal: AbortSignal.timeout(opts.timeoutMs ?? 4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

/** Cached per build, so the index and every case study share one request per repo. */
export function getStars(owner: string, repo: string, opts: StarOptions & { enabled?: boolean } = {}): Promise<Stars> {
  if (opts.enabled === false) return Promise.resolve(null);
  const key = `${owner}/${repo}`;
  let p = cache.get(key);
  if (!p) {
    p = fetchStars(owner, repo, opts);
    cache.set(key, p);
  }
  return p;
}

export function starLabel(stars: Stars): string {
  if (stars === null) return 'new';
  return `${stars.toLocaleString('en-US')} ${stars === 1 ? 'star' : 'stars'}`;
}
