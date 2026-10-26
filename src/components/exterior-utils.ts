import type { CandidateResult } from '@/types/geo';

export type ExteriorCity = { code: string; name: string; iso: string; country: string; lat: number; lng: number; voters: number; votes: Record<string, number> };
export type CountryAgg = { iso: string; country: string; cities: number; voters: number; total: number; votes: Record<string, number>; winner?: CandidateResult; winnerPct: number };

export function aggregate(cities: ExteriorCity[], candidates: CandidateResult[]): CountryAgg[] {
  const byIso = new Map<string, CountryAgg>();
  cities.forEach(city => {
    const c = byIso.get(city.iso) ?? { iso: city.iso, country: city.country, cities: 0, voters: 0, total: 0, votes: {}, winner: undefined, winnerPct: 0 };
    c.cities += 1; c.voters += city.voters;
    Object.entries(city.votes).forEach(([id, v]) => { c.votes[id] = (c.votes[id] ?? 0) + v; c.total += v; });
    byIso.set(city.iso, c);
  });
  return Array.from(byIso.values()).map(c => {
    const top = Object.entries(c.votes).sort((a, b) => b[1] - a[1])[0];
    return { ...c, winner: top ? candidates.find(x => x.candidateId === top[0]) : undefined, winnerPct: top && c.total ? (top[1] / c.total) * 100 : 0 };
  }).sort((a, b) => b.voters - a.voters);
}

