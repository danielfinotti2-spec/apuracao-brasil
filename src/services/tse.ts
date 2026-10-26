import type { CandidateResult, ElectionResult } from '@/types/geo';
import { locate } from './geo-exterior';

const ORIGIN = 'https://resultados.tse.jus.br/oficial';
const COLORS = ['#ef3340', '#4a6cf0', '#f0ac68', '#aa91df', '#64c9a3', '#d4c66c', '#70c6d2', '#da8299'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
const number = (value?: string) => Number((value || '0').replace(/\./g, '').replace(',', '.')) || 0;

type ElectionEntry = { cd: string; cdt2?: string; t: string; abr: Array<{ cd: string; cp: Array<{ cd: string; ds: string }> }> };
type TSEResultFile = {
  ele: string; t: string; dg?: string; hg?: string; cdabr: string;
  carg?: Array<{ cd: string; nmn: string; agr?: Array<{ par?: Array<{ n: string; sg: string; nm: string; cand?: Array<{ sqcand: string; n: string; nm: string; nmu: string; vap: string; pvap: string }> }> }> }>;
  s?: { ts?: string; st?: string };
  e?: { c?: string; a?: string; pc?: string };
  v?: { vv?: string; vb?: string; vn?: string };
};

function colorFor(candidateId: string): string {
  if (candidateId === '280002542548') return COLORS[0]; // Lula
  if (candidateId === '280002551544') return COLORS[1]; // Flávio Bolsonaro
  let hash = 0;
  for (const char of candidateId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return COLORS[2 + (Math.abs(hash) % (COLORS.length - 2))];
}

async function fetchJson<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, { next: { revalidate }, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`TSE respondeu ${response.status} em ${url}`);
  return response.json();
}

async function officialMunicipality(ibgeCode: string, cycle: string, electionCode: string) {
  const url = `${ORIGIN}/${cycle}/${electionCode}/config/mun-e${electionCode.padStart(6, '0')}-cm.json`;
  const config = await fetchJson<{ abr: Array<{ cd: string; mu: Array<{ cd: string; cdi: string; nm: string }> }> }>(url, 86400);
  for (const uf of config.abr || []) {
    const municipality = uf.mu?.find(item => item.cdi === ibgeCode);
    if (municipality) return { uf: uf.cd.toLowerCase(), municipality: municipality.cd };
  }
  throw new Error('Código municipal IBGE não encontrado na tabela oficial do TSE.');
}

type ResultInput = { localityCode: string; uf?: string; year: number; round: number; office: string };

// Senador e deputados não têm 2º turno, e governador só em alguns estados.
// Nesses casos mostramos o 1º turno, marcando `fellBack` para a interface avisar.
export async function getOfficialResult(input: ResultInput): Promise<ElectionResult> {
  try {
    return await fetchResult(input);
  } catch (error) {
    if (input.round === 2 && normalize(input.office) !== 'presidente') {
      return { ...(await fetchResult({ ...input, round: 1 })), fellBack: true };
    }
    throw error;
  }
}

async function fetchResult(input: ResultInput): Promise<ElectionResult> {
  const config = await fetchJson<{ pl: Array<{ c: string; e?: ElectionEntry[] }> }>(`${ORIGIN}/comum/config/ele-c.json`, 300);
  const cycle = `ele${input.year}`;
  const targetOffice = normalize(input.office);
  const electionEntry = (config.pl || []).filter(item => item.c === cycle).flatMap(item => item.e || []).find(election =>
    Number(election.t) === input.round && election.abr.some(area => area.cp.some(job => normalize(job.ds) === targetOffice)),
  );
  if (!electionEntry) throw new Error('Esta eleição, cargo ou turno não está disponível no TSE.');
  const job = electionEntry.abr.flatMap(area => area.cp).find(item => normalize(item.ds) === targetOffice);
  if (!job) throw new Error('Cargo não encontrado nos metadados do TSE.');

  let uf = input.uf?.toLowerCase() || 'br';
  let municipality = '';
  if (input.localityCode.toLowerCase() !== 'br' && input.localityCode.length > 2) {
    const matched = await officialMunicipality(input.localityCode, cycle, electionEntry.cd);
    uf = matched.uf;
    municipality = matched.municipality;
  } else if (input.localityCode.toLowerCase() === 'br') {
    uf = 'br';
  }

  const electionCode = electionEntry.cd.padStart(6, '0');
  const prefix = `${uf}${municipality}`;
  const dataUrl = `${ORIGIN}/${cycle}/${electionEntry.cd}/dados/${uf}/${prefix}-c${job.cd.padStart(4, '0')}-e${electionCode}-u.json`;
  const raw = await fetchJson<TSEResultFile>(dataUrl, 30);
  const cargo = raw.carg?.find(item => item.cd === job.cd);
  const candidates: CandidateResult[] = (cargo?.agr || []).flatMap(group => (group.par || []).flatMap(party => (party.cand || []).map(candidate => ({
    candidateId: candidate.sqcand,
    name: candidate.nmu || candidate.nm,
    party: party.sg || party.nm,
    votes: number(candidate.vap),
    percentage: number(candidate.pvap),
    color: colorFor(candidate.sqcand),
    photoUrl: candidate.sqcand === '280002542548' ? '/candidates/lula.jpg'
      : candidate.sqcand === '280002551544' ? '/candidates/flavio-bolsonaro.jpg'
      : `${ORIGIN}/${cycle}/${electionEntry.cd}/fotos/${uf === 'zz' ? 'br' : uf}/${candidate.sqcand}.jpeg`,
  }))));

  if (!candidates.length) throw new Error('O arquivo oficial do TSE ainda não publicou candidatos para esta localidade.');
  return {
    localityCode: input.localityCode,
    electionYear: input.year,
    office: job.ds,
    round: input.round,
    totalizedSections: number(raw.s?.st),
    totalSections: number(raw.s?.ts),
    validVotes: number(raw.v?.vv),
    blankVotes: number(raw.v?.vb),
    nullVotes: number(raw.v?.vn),
    abstentions: number(raw.e?.a),
    turnout: number(raw.e?.pc),
    candidates,
    updatedAt: raw.dg && raw.hg ? `${raw.dg} ${raw.hg} · horário de Brasília` : undefined,
    source: 'TSE — Resultados oficiais',
  };
}

export { colorFor };

export type ExteriorCity = { code: string; name: string; iso: string; country: string; lat: number; lng: number; voters: number; votes: Record<string, number> };

// Resultado do voto no exterior: total (ZZ) + cada cidade com seção eleitoral fora do Brasil.
export async function getExterior(year: number, round: number) {
  const total = await getOfficialResult({ localityCode: 'zz', uf: 'zz', year, round, office: 'Presidente' });
  const config = await fetchJson<{ pl: Array<{ c: string; e?: ElectionEntry[] }> }>(`${ORIGIN}/comum/config/ele-c.json`, 300);
  const cycle = `ele${year}`;
  const entry = (config.pl || []).filter(item => item.c === cycle).flatMap(item => item.e || []).find(e => Number(e.t) === round && e.abr.some(a => a.cp.some(j => normalize(j.ds) === 'presidente')));
  const job = entry?.abr.flatMap(a => a.cp).find(j => normalize(j.ds) === 'presidente');
  if (!entry || !job) throw new Error('Eleição presidencial não encontrada no TSE.');
  const pad = entry.cd.padStart(6, '0');
  const muns = await fetchJson<{ abr: Array<{ cd: string; mu: Array<{ cd: string; nm: string }> }> }>(`${ORIGIN}/${cycle}/${entry.cd}/config/mun-e${pad}-cm.json`, 86400);
  const list = muns.abr?.find(a => a.cd.toLowerCase() === 'zz')?.mu ?? [];
  const cities: ExteriorCity[] = [];
  const unmatched: string[] = [];
  for (let i = 0; i < list.length; i += 25) {
    await Promise.all(list.slice(i, i + 25).map(async city => {
      const place = locate(city.nm);
      if (!place) { unmatched.push(city.nm); return; }
      try {
        const raw = await fetchJson<TSEResultFile>(`${ORIGIN}/${cycle}/${entry.cd}/dados/zz/zz${city.cd}-c${job.cd.padStart(4, '0')}-e${pad}-u.json`, 60);
        const votes: Record<string, number> = {};
        (raw.carg?.find(c => c.cd === job.cd)?.agr || []).forEach(g => (g.par || []).forEach(p => (p.cand || []).forEach(c => { votes[c.sqcand] = number(c.vap); })));
        if (!Object.values(votes).some(v => v > 0)) return;
        cities.push({ code: city.cd, name: city.nm, iso: place.iso, country: place.country, lat: place.lat, lng: place.lng, voters: number(raw.e?.c) + number(raw.e?.a), votes });
      } catch { /* cidade ainda sem arquivo publicado */ }
    }));
  }
  return { total, cities, totalCities: list.length, unmatched: unmatched.slice(0, 60) };
}
