// Helper de fetch server-side com rastreio de fonte.
// Cada chamada registra a URL real consultada e o horário da coleta.

export type FetchedJson<T> = { data: T; url: string; fetchedAt: string };

export async function fetchTrackedJson<T>(url: string, revalidate = 3600): Promise<FetchedJson<T>> {
  const response = await fetch(url, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Fonte respondeu HTTP ${response.status} em ${url}`);
  const data = (await response.json()) as T;
  return { data, url, fetchedAt: new Date().toISOString() };
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
