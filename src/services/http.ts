// Helper de fetch server-side com rastreio de fonte.
// Cada chamada registra a URL real consultada e o horário da coleta.
// APIs oficiais oscilam (reset de socket, WAF, lentidão) — por isso há
// timeout por tentativa e retentativas com backoff antes de desistir.

const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;
const USER_AGENT = 'FiscalizaBrasil/1.0 (+https://fiscaliza-brasil-neon.vercel.app)';

export type FetchedJson<T> = { data: T; url: string; fetchedAt: string };

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchTrackedJson<T>(url: string, revalidate = 3600): Promise<FetchedJson<T>> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        next: { revalidate },
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as T;
      return { data, url, fetchedAt: new Date().toISOString() };
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_ATTEMPTS) await sleep(400 * attempt);
    }
  }
  throw new Error(`${lastError?.message ?? 'fetch failed'} — após ${MAX_ATTEMPTS} tentativas em ${url}`);
}

export async function fetchAllPages<T>(buildUrl: (page: number) => string, pick: (body: any) => T[], revalidate = 3600, maxPages = 30): Promise<FetchedJson<T[]>> {
  const items: T[] = [];
  const urls: string[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const result = await fetchTrackedJson<any>(buildUrl(page), revalidate);
    urls.push(result.url);
    const batch = pick(result.data) ?? [];
    items.push(...batch);
    if (batch.length === 0) break;
    const hasNext = (result.data?.links ?? []).some((link: any) => link?.rel === 'next');
    if (!hasNext) break;
  }
  return { data: items, url: urls.join(' | '), fetchedAt: new Date().toISOString() };
}
