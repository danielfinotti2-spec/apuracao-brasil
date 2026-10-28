// Integração com o serviço de Dados Abertos do Senado Federal.
// Documentação oficial: https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html
// Os endpoints abaixo foram verificados em chamadas reais durante o desenvolvimento.

import { fetchTrackedJson } from './http';
import type { PoliticianSummary, SenadoProfile, SenadoVote, SourceRef } from '@/types/politician';

const API = 'https://legis.senado.leg.br/dadosabertos';
export const SENADO_SOURCE = 'API de Dados Abertos do Senado Federal';

const seal = (fetchedAt: string, url: string): SourceRef => ({
  name: SENADO_SOURCE, url, fetchedAt, status: 'oficial-confirmada',
});

type ApiListaAtual = {
  ListaParlamentarEmExercicio?: {
    Parlamentares?: {
      Parlamentar?: Array<{
        IdentificacaoParlamentar?: {
          CodigoParlamentar?: string; NomeParlamentar?: string;
          SiglaPartidoParlamentar?: string; UfParlamentar?: string;
          UrlFotoParlamentar?: string; UrlPaginaParlamentar?: string;
        };
      }>;
    };
  };
};

const https = (url?: string) => (url ?? '').replace(/^http:\/\//, 'https://');

/** Lista todos os senadores em exercício. */
export async function listSenadores(): Promise<{ list: PoliticianSummary[]; source: SourceRef }> {
  const result = await fetchTrackedJson<ApiListaAtual>(`${API}/senador/lista/atual.json`, 3600);
  const rows = result.data.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar ?? [];
  const list = rows.map(row => {
    const p = row.IdentificacaoParlamentar ?? {};
    return {
      id: String(p.CodigoParlamentar ?? ''),
      chamber: 'senado' as const,
      office: 'Senador(a) da República',
      name: p.NomeParlamentar ?? '—',
      party: p.SiglaPartidoParlamentar ?? '—',
      uf: p.UfParlamentar ?? '—',
      photoUrl: https(p.UrlFotoParlamentar),
      officialUrl: https(p.UrlPaginaParlamentar),
    };
  }).filter(p => p.id && p.id !== '');
  return { list, source: seal(result.fetchedAt, result.url) };
}

type ApiDetalhe = {
  DetalheParlamentar?: {
    Parlamentar?: {
      IdentificacaoParlamentar?: {
        CodigoParlamentar?: string; NomeParlamentar?: string; NomeCompletoParlamentar?: string;
        SexoParlamentar?: string; UrlFotoParlamentar?: string; UrlPaginaParlamentar?: string;
        EmailParlamentar?: string; SiglaPartidoParlamentar?: string; UfParlamentar?: string;
      };
      DadosBasicosParlamentar?: {
        DataNascimento?: string; Naturalidade?: string; UfNaturalidade?: string; EnderecoParlamentar?: string;
      };
    };
  };
};

type ApiVotacoes = {
  VotacaoParlamentar?: {
    Metadados?: { Descontinuacao?: { UrlServicoSubstituto?: string } };
    Parlamentar?: {
      Votacoes?: {
        Votacao?: Array<{
          SessaoPlenaria?: { DataSessao?: string; HoraInicioSessao?: string; SiglaTipoSessao?: string; NumeroSessao?: string };
          Materia?: { Codigo?: string; DescricaoIdentificacao?: string; Ementa?: string };
          DescricaoVotacao?: string; DescricaoResultado?: string;
          SiglaDescricaoVoto?: string; IndicadorVotacaoSecreta?: string;
        }>;
      };
    };
  };
};

/** Perfil de um senador: identificação oficial + votações nominais publicadas. */
export async function getSenadorProfile(cod: string): Promise<SenadoProfile | null> {
  if (!/^\d+$/.test(cod)) return null;
  const failures: SenadoProfile['failedSources'] = [];
  const sources: SourceRef[] = [];

  const detalheUrl = `${API}/senador/${cod}.json`;
  const votacoesUrl = `${API}/senador/${cod}/votacoes.json`;

  const detalhe = await fetchTrackedJson<ApiDetalhe>(detalheUrl, 1800).catch(() => null);
  if (!detalhe?.data?.DetalheParlamentar?.Parlamentar?.IdentificacaoParlamentar) return null;
  sources.push(seal(detalhe.fetchedAt, detalhe.url));

  const parl = detalhe.data.DetalheParlamentar.Parlamentar;
  const ident = parl.IdentificacaoParlamentar!;
  const basicos = parl.DadosBasicosParlamentar ?? {};

  const votacoes = await fetchTrackedJson<ApiVotacoes>(votacoesUrl, 1800).catch((e: Error) => {
    failures.push({ name: `${SENADO_SOURCE} — votações nominais`, url: votacoesUrl, error: e?.message ?? 'falha desconhecida' });
    return null;
  });

  let votes: SenadoVote[] = [];
  let votesNote: string | null = null;
  if (votacoes) {
    sources.push(seal(votacoes.fetchedAt, votacoes.url));
    // A própria API avisa quando o serviço está em descontinuação; repassamos o aviso.
    const substituto = votacoes.data.VotacaoParlamentar?.Metadados?.Descontinuacao?.UrlServicoSubstituto;
    if (substituto) votesNote = `O Senado marcou este serviço como "em descontinuação" e indica ${substituto} como substituto. Os dados exibidos ainda vêm da resposta oficial acima.`;
    const rows = votacoes.data.VotacaoParlamentar?.Parlamentar?.Votacoes?.Votacao ?? [];
    votes = rows.map(v => ({
      date: v.SessaoPlenaria?.DataSessao ?? '',
      session: [v.SessaoPlenaria?.SiglaTipoSessao, v.SessaoPlenaria?.NumeroSessao].filter(Boolean).join(' '),
      matter: v.Materia?.DescricaoIdentificacao ?? '',
      matterCode: v.Materia?.Codigo ?? '',
      description: v.DescricaoVotacao ?? '',
      result: v.DescricaoResultado ?? '',
      vote: v.SiglaDescricaoVoto ?? '',
      secret: String(v.IndicadorVotacaoSecreta ?? '').toLowerCase().startsWith('s'),
    })).sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  return {
    summary: {
      id: String(ident.CodigoParlamentar ?? cod),
      chamber: 'senado',
      office: 'Senador(a) da República',
      name: ident.NomeParlamentar ?? ident.NomeCompletoParlamentar ?? `Senador ${cod}`,
      party: ident.SiglaPartidoParlamentar ?? '—',
      uf: ident.UfParlamentar ?? '—',
      photoUrl: https(ident.UrlFotoParlamentar),
      officialUrl: https(ident.UrlPaginaParlamentar),
    },
    fullName: ident.NomeCompletoParlamentar ?? ident.NomeParlamentar ?? '',
    birthDate: basicos.DataNascimento ?? null,
    birthCity: basicos.Naturalidade ?? null,
    birthUf: basicos.UfNaturalidade ?? null,
    gender: ident.SexoParlamentar ?? null,
    officeAddress: (basicos.EnderecoParlamentar ?? '').trim() || null,
    email: ident.EmailParlamentar ?? null,
    votes,
    votesNote,
    sources,
    failedSources: failures,
  };
}
