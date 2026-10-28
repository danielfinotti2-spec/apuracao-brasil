// Integração com a API de Dados Abertos da Câmara dos Deputados.
// Documentação oficial: https://dadosabertos.camara.leg.br/swagger/api.html
// Nenhum dado é inventado: tudo o que a interface mostra vem das chamadas abaixo.

import { fetchAllPages, fetchTrackedJson } from './http';
import type {
  CamaraEvent, CamaraExpense, CamaraExpenseGroup, CamaraProfile, CamaraProposal,
  PoliticianSummary, SourceRef,
} from '@/types/politician';

const API = 'https://dadosabertos.camara.leg.br/api/v2';
export const CAMARA_SOURCE = 'API de Dados Abertos da Câmara dos Deputados';

const seal = (fetchedAt: string, url: string): SourceRef => ({
  name: CAMARA_SOURCE, url, fetchedAt, status: 'oficial-confirmada',
});

type ApiDeputado = { id: number; nome: string; siglaPartido?: string; siglaUf?: string; urlFoto?: string; uri?: string };

/** Lista todos os deputados da legislatura atual (paginado). */
export async function listDeputados(): Promise<{ list: PoliticianSummary[]; source: SourceRef }> {
  const result = await fetchAllPages<ApiDeputado>(
    page => `${API}/deputados?ordem=ASC&ordenarPor=nome&itens=100&pagina=${page}`,
    body => body?.dados,
  );
  const list = result.data.map(d => ({
    id: String(d.id),
    chamber: 'camara' as const,
    office: 'Deputado(a) Federal',
    name: d.nome,
    party: d.siglaPartido ?? '—',
    uf: d.siglaUf ?? '—',
    photoUrl: d.urlFoto ?? '',
    officialUrl: `https://www.camara.leg.br/deputados/${d.id}`,
  }));
  return { list, source: seal(result.fetchedAt, result.url) };
}

type ApiDeputadoDetalhe = {
  dados: {
    id: number; uri: string; nomeCivil?: string; sexo?: string;
    dataNascimento?: string; municipioNascimento?: string; ufNascimento?: string; escolaridade?: string;
    urlWebsite?: string; redeSocial?: string[];
    ultimoStatus?: {
      nome?: string; siglaPartido?: string; siglaUf?: string; urlFoto?: string;
      situacao?: string; condicaoEleitoral?: string; email?: string;
      gabinete?: { nome?: string; telefone?: string };
    };
  };
};

type ApiDespesa = {
  ano: number; mes: number; tipoDespesa: string;
  nomeFornecedor: string; cnpjCpfFornecedor?: string;
  valorDocumento: number; valorLiquido: number;
  urlDocumento: string | null; dataDocumento: string | null;
};

type ApiProposicao = {
  id: number; siglaTipo: string; numero: number; ano: number | null;
  ementa: string; dataApresentacao: string | null; uri: string;
};

type ApiEvento = {
  id: number; dataHoraInicio: string | null; dataHoraFim: string | null;
  situacao?: string; descricaoTipo?: string; descricao?: string; localCamara?: { nome?: string };
};

const toNumber = (v: unknown) => Number(v ?? 0) || 0;

/** Perfil completo de um deputado: detalhes, despesas, proposições de autoria e agenda recente. */
export async function getDeputadoProfile(id: string): Promise<CamaraProfile | null> {
  if (!/^\d+$/.test(id)) return null;
  const failures: CamaraProfile['failedSources'] = [];
  const sources: SourceRef[] = [];

  // Detalhes são obrigatórios; o restante é tolerante a falha (cada falha é exibida).
  const detalhe = await fetchTrackedJson<ApiDeputadoDetalhe>(`${API}/deputados/${id}`, 1800).catch((error: Error) => {
    return null;
  });
  if (!detalhe) return null;
  sources.push(seal(detalhe.fetchedAt, detalhe.url));

  const d = detalhe.data.dados;
  const status = d.ultimoStatus ?? {};
  const summary: PoliticianSummary = {
    id: String(d.id),
    chamber: 'camara',
    office: 'Deputado(a) Federal',
    name: status.nome ?? d.nomeCivil ?? `Deputado ${id}`,
    party: status.siglaPartido ?? '—',
    uf: status.siglaUf ?? '—',
    photoUrl: status.urlFoto ?? '',
    officialUrl: `https://www.camara.leg.br/deputados/${d.id}`,
  };

  // Despesas: páginas recentes (limite de 300 lançamentos para manter a página leve).
  const expensesPromise = (async () => {
    const url = `${API}/deputados/${id}/despesas?ordem=DESC&ordenarPor=ano&itens=100&pagina=1`;
    const rows: ApiDespesa[] = [];
    const urls: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const pageUrl = `${API}/deputados/${id}/despesas?ordem=DESC&ordenarPor=ano&itens=100&pagina=${page}`;
      const result = await fetchTrackedJson<{ dados: ApiDespesa[]; links?: { rel: string }[] }>(pageUrl, 1800);
      urls.push(result.url);
      rows.push(...(result.data.dados ?? []));
      if (!(result.data.links ?? []).some(l => l.rel === 'next') || !(result.data.dados ?? []).length) break;
    }
    const mapped: CamaraExpense[] = rows.map(r => ({
      year: r.ano, month: r.mes, type: r.tipoDespesa,
      supplier: r.nomeFornecedor, supplierDocument: r.cnpjCpfFornecedor ?? '',
      documentValue: toNumber(r.valorDocumento), netValue: toNumber(r.valorLiquido),
      documentUrl: r.urlDocumento ?? null, documentDate: r.dataDocumento ?? null,
    }));
    const groups = new Map<string, CamaraExpenseGroup>();
    mapped.forEach(row => {
      const group = groups.get(row.type) ?? { type: row.type, total: 0, count: 0 };
      group.total += row.netValue; group.count += 1; groups.set(row.type, group);
    });
    const months = new Set(mapped.map(r => `${r.year}-${String(r.month).padStart(2, '0')}`));
    const sortedMonths = Array.from(months).sort();
    return {
      groups: Array.from(groups.values()).sort((a, b) => b.total - a.total),
      recent: mapped.slice(0, 25),
      periodTotal: mapped.reduce((s, r) => s + r.netValue, 0),
      loadedMonths: sortedMonths.length ? `${sortedMonths[0]} a ${sortedMonths[sortedMonths.length - 1]} (${Math.min(rows.length, 300)} lançamentos carregados)` : 'sem lançamentos no período carregado',
      usedUrl: urls.join(' | '),
    };
  })();

  // Proposições de autoria (mais recentes primeiro).
  const proposalsPromise = (async () => {
    const pageUrl = `${API}/proposicoes?idDeputadoAutor=${id}&ordem=DESC&ordenarPor=id&itens=25&pagina=1`;
    const result = await fetchTrackedJson<{ dados: ApiProposicao[] }>(pageUrl, 1800);
    const items: CamaraProposal[] = (result.data.dados ?? []).map(p => ({
      id: p.id, type: p.siglaTipo, number: p.numero, year: p.ano ?? null,
      summary: p.ementa, presentedAt: p.dataApresentacao ?? null, apiUrl: p.uri,
      portalUrl: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`,
    }));
    return { items, usedUrl: result.url };
  })();

  // Agenda oficial do deputado nos últimos 90 dias (participações em eventos).
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - 90 * 24 * 60 * 60 * 1000);
  const fmt = (date: Date) => date.toISOString().slice(0, 10);
  const eventsPromise = (async () => {
    const pageUrl = `${API}/deputados/${id}/eventos?dataInicio=${fmt(periodStart)}&dataFim=${fmt(periodEnd)}&ordem=DESC&ordenarPor=dataHoraInicio&itens=60&pagina=1`;
    const result = await fetchTrackedJson<{ dados: ApiEvento[] }>(pageUrl, 1800);
    const items: CamaraEvent[] = (result.data.dados ?? []).map(e => ({
      id: String(e.id), type: e.descricaoTipo ?? 'Evento',
      title: (e.descricao ?? '').trim() || e.descricaoTipo || 'Evento oficial',
      startsAt: e.dataHoraInicio ?? null, endsAt: e.dataHoraFim ?? null,
      situation: e.situacao ?? '', location: e.localCamara?.nome ?? '',
    }));
    return { items, usedUrl: result.url };
  })();

  const expensesUrl = `${API}/deputados/${id}/despesas`;
  const proposalsUrl = `${API}/proposicoes?idDeputadoAutor=${id}`;
  const eventsUrl = `${API}/deputados/${id}/eventos`;

  const [expenses, proposals, events] = await Promise.all([
    expensesPromise.catch((e: Error) => { failures.push({ name: `${CAMARA_SOURCE} — despesas`, url: expensesUrl, error: e?.message ?? 'falha desconhecida' }); return null; }),
    proposalsPromise.catch((e: Error) => { failures.push({ name: `${CAMARA_SOURCE} — proposições`, url: proposalsUrl, error: e?.message ?? 'falha desconhecida' }); return null; }),
    eventsPromise.catch((e: Error) => { failures.push({ name: `${CAMARA_SOURCE} — agenda`, url: eventsUrl, error: e?.message ?? 'falha desconhecida' }); return null; }),
  ]);

  const fetchedAt = new Date().toISOString();
  if (expenses) sources.push(seal(fetchedAt, expenses.usedUrl));
  if (proposals) sources.push(seal(fetchedAt, proposals.usedUrl));
  if (events) sources.push(seal(fetchedAt, events.usedUrl));

  return {
    summary,
    civilName: d.nomeCivil ?? summary.name,
    birthDate: d.dataNascimento ?? null,
    birthCity: d.municipioNascimento ?? null,
    birthUf: d.ufNascimento ?? null,
    schooling: d.escolaridade ?? null,
    gender: d.sexo ?? null,
    status: status.situacao ?? null,
    electoralCondition: status.condicaoEleitoral ?? null,
    officeRoom: status.gabinete?.nome ?? null,
    officePhone: status.gabinete?.telefone ?? null,
    email: status.email ?? null,
    website: d.urlWebsite ?? null,
    expenses: expenses ?? { groups: [], recent: [], periodTotal: 0, loadedMonths: 'indisponível' },
    proposals: proposals?.items ?? [],
    events: { items: events?.items ?? [], periodStart: fmt(periodStart), periodEnd: fmt(periodEnd) },
    sources,
    failedSources: failures.map(f => ({ name: f.name, url: typeof f.url === 'string' ? f.url : String(f.url), error: f.error })),
  };
}
