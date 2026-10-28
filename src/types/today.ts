import type { SourceRef } from './politician';

export type TodayEvent = {
  id: string; type: string; title: string; startsAt: string | null;
  location: string; orgs: string; situation: string;
};

export type TodayProposal = {
  id: number; type: string; number: number; year: number | null;
  summary: string; presentedAt: string | null;
  authors: { name: string; deputyId: string | null }[];
  portalUrl: string;
};

export type TodayVoting = {
  id: string; org: string; description: string; registeredAt: string | null;
  approved: boolean | null; votersCount: number | null;
};

export type PresentPolitician = {
  id: string; name: string; party: string; uf: string; activities: string[];
};

export type TodayData = {
  date: string;                 // YYYY-MM-DD no fuso de Brasília
  dateLabel: string;            // ex.: "quarta-feira, 28 de outubro de 2026"
  proposals: TodayProposal[];
  votings: TodayVoting[];
  events: TodayEvent[];
  /** Parlamentares com participação pública registrada em eventos/votações hoje. */
  present: PresentPolitician[];
  /** Código-fonte usado para buscar o contraste "sem registro". */
  sources: SourceRef[];
  failedSources: { name: string; url: string; error: string }[];
  dayNote: string | null;
};
