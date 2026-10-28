// Dados do dia nas fontes oficiais da Câmara dos Deputados.
// Cobre: proposições apresentadas hoje, votações do plenário hoje,
// agenda oficial de hoje e presenças confirmadas nesses eventos/votações.
//
// REGRA EDITORIAL: este módulo descreve o que as fontes registraram.
// A ausência de registro numa fonte NÃO significa ausência de trabalho —
// os órgãos não publicam o dia a dia completo de cada parlamentar.

import { fetchTrackedJson } from './http';
import { CAMARA_SOURCE } from './camara';
import type { SourceRef } from '@/types/politician';
import type { PresentPolitician, TodayData, TodayEvent, TodayProposal, TodayVoting } from '@/types/today';

const API = 'https://dadosabertos.camara.leg.br/api/v2';

const seal = (fetchedAt: string, url: string): SourceRef => ({
  name: CAMARA_SOURCE, url, fetchedAt, status: 'oficial-confirmada',
});

export function brasiliaToday(): { date: string; label: string } {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const label = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  return { date, label };
}

type ApiEvento = {
  id?: number; descricaoTipo?: string; descricao?: string;
  dataHoraInicio?: string | null; situacao?: string;
  localCamara?: { nome?: string }; orgaos?: Array<{ sigla?: string }>;
};

type ApiProposicao = { id: number; siglaTipo: string; numero: number; ano: number | null; ementa: string; dataApresentacao: string | null };
type ApiAutor = { nome?: string; uri?: string };
type ApiVotacao = { id?: string; siglaOrgao?: string; descricao?: string; dataHoraRegistro?: string | null; aprovacao?: number | boolean | null; votos?: number };

// Tipos de CONTEÚDO (não de procedimento): entra no quadro e no ranking o que
// propõe norma, emenda ou fiscalização. Ofícios, redações finiais e
// requerimentos de votação/retirada de pauta ficam fora para não inflar contagens.
const SUBSTANTIVE_TYPES = new Set([
  'PL', 'PEC', 'PLP', 'PLV', 'MPV', 'PDL', 'PDC', 'PLN', 'PLOA', 'PLDO', 'PL', 'RIC', 'INC', 'REQ', 'PRC',
]);

const normEmenta = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').slice(0, 80);

/** Monta o quadro do dia. Tolerante a falha parcial (registrada em failedSources). */
export async function getTodayData(): Promise<TodayData> {
  const { date, label } = brasiliaToday();
  const sources: SourceRef[] = [];
  const failed: TodayData['failedSources'] = [];

  // 1) Proposições apresentadas hoje
  const proposalsP = (async () => {
    const url = `${API}/proposicoes?dataApresentacaoInicio=${date}&dataApresentacaoFim=${date}&ordem=DESC&ordenarPor=id&itens=40&pagina=1`;
    const result = await fetchTrackedJson<{ dados: ApiProposicao[] }>(url, 600);
    // filtra procedimento e deduplica ementas repetidas (req. + votação nominal do req.)
    const seen = new Set<string>();
    const items = (result.data.dados ?? [])
      .filter(p => SUBSTANTIVE_TYPES.has(p.siglaTipo))
      .filter(p => {
        const key = normEmenta(p.ementa ?? '');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
    const authors = await Promise.all(items.slice(0, 12).map(async p => {
      try {
        const a = await fetchTrackedJson<{ dados: ApiAutor[] }>(`${API}/proposicoes/${p.id}/autores`, 600);
        return (a.data.dados ?? []).slice(0, 4).map(x => ({
          name: x.nome ?? 'Autor não identificado',
          deputyId: x.uri?.match(/deputados\/(\d+)/)?.[1] ?? null,
        }));
      } catch { return []; }
    }));
    const proposals: TodayProposal[] = items.map((p, i) => ({
      id: p.id, type: p.siglaTipo, number: p.numero, year: p.ano ?? null,
      summary: p.ementa, presentedAt: p.dataApresentacao ?? null,
      authors: authors[i] ?? [],
      portalUrl: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`,
    }));
    return { proposals, url };
  })();

  // 2) Votações nominais registradas hoje
  const votingsP = (async () => {
    const url = `${API}/votacoes?dataInicio=${date}&dataFim=${date}&ordem=DESC&ordenarPor=dataHoraRegistro&itens=15&pagina=1`;
    const result = await fetchTrackedJson<{ dados: ApiVotacao[] }>(url, 600);
    const votings: TodayVoting[] = (result.data.dados ?? []).map(v => ({
      id: String(v.id ?? ''), org: v.siglaOrgao ?? 'Plenário',
      description: v.descricao ?? 'Votação nominal',
      registeredAt: v.dataHoraRegistro ?? null,
      approved: v.aprovacao == null ? null : Boolean(v.aprovacao),
      votersCount: typeof v.votos === 'number' ? v.votos : null,
    }));
    return { votings, url };
  })();

  // 3) Agenda oficial de hoje
  const eventsP = (async () => {
    const url = `${API}/eventos?dataInicio=${date}&dataFim=${date}&ordem=ASC&ordenarPor=dataHoraInicio&itens=60&pagina=1`;
    const result = await fetchTrackedJson<{ dados: ApiEvento[] }>(url, 600);
    const events: TodayEvent[] = (result.data.dados ?? []).map(e => ({
      id: String(e.id ?? ''), type: e.descricaoTipo ?? 'Evento',
      title: (e.descricao ?? '').trim() || e.descricaoTipo || 'Evento oficial',
      startsAt: e.dataHoraInicio ?? null,
      location: e.localCamara?.nome ?? '',
      orgs: (e.orgaos ?? []).map(o => o.sigla).filter(Boolean).join(', '),
      situation: e.situacao ?? '',
    }));
    return { events, url };
  })();

  const [proposals, votings, events] = await Promise.all([
    proposalsP.catch((e: Error) => { failed.push({ name: `${CAMARA_SOURCE} — proposições do dia`, url: `${API}/proposicoes`, error: e?.message ?? 'falha' }); return null; }),
    votingsP.catch((e: Error) => { failed.push({ name: `${CAMARA_SOURCE} — votações do dia`, url: `${API}/votacoes`, error: e?.message ?? 'falha' }); return null; }),
    eventsP.catch((e: Error) => { failed.push({ name: `${CAMARA_SOURCE} — agenda do dia`, url: `${API}/eventos`, error: e?.message ?? 'falha' }); return null; }),
  ]);
  if (proposals) sources.push(seal(new Date().toISOString(), proposals.url));
  if (votings) sources.push(seal(new Date().toISOString(), votings.url));
  if (events) sources.push(seal(new Date().toISOString(), events.url));

  // 4) Presenças: participantes confirmados dos primeiros eventos do dia.
  //    Cada chamada é documentada (/eventos/{id}/deputados). Falhas não bloqueiam a página.
  const presentMap = new Map<string, PresentPolitician>();
  let presenceOk = true;
  const eventSlice = (events?.events ?? []).slice(0, 12);
  await Promise.all(eventSlice.map(async ev => {
    try {
      const url = `${API}/eventos/${ev.id}/deputados`;
      const result = await fetchTrackedJson<{ dados: Array<{ id?: number; nome?: string; siglaPartido?: string; siglaUf?: string }> }>(url, 600);
      (result.data.dados ?? []).forEach(d => {
        const pid = String(d.id ?? d.nome ?? '');
        if (!pid) return;
        const entry = presentMap.get(pid) ?? { id: pid, name: d.nome ?? '—', party: d.siglaPartido ?? '—', uf: d.siglaUf ?? '—', activities: [] };
        if (!entry.activities.includes(ev.type)) entry.activities.push(ev.type);
        presentMap.set(pid, entry);
      });
    } catch { presenceOk = false; }
  }));
  if (eventSlice.length > 0) {
    sources.push(seal(new Date().toISOString(), `${API}/eventos/{id}/deputados (${eventSlice.length} eventos consultados)`));
    if (!presenceOk) failed.push({ name: `${CAMARA_SOURCE} — presenças em eventos`, url: `${API}/eventos/{id}/deputados`, error: 'uma ou mais consultas de presença falharam' });
  }

  return {
    date,
    dateLabel: label,
    proposals: proposals?.proposals ?? [],
    votings: votings?.votings ?? [],
    events: events?.events ?? [],
    present: Array.from(presentMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    sources,
    failedSources: failed,
    dayNote: !proposals || !votings || !events
      ? 'Alguns quadros do dia estão indisponíveis por falha de fonte — veja a lista de fontes no rodapé.'
      : null,
  };
}
