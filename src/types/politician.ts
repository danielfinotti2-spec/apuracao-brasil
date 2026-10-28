// Tipos do módulo de políticos do Fiscaliza Brasil.
// Todos os dados exibidos vêm de APIs oficiais (Câmara dos Deputados e Senado Federal)
// e carregam referência da fonte, horário da coleta e selo de verificação.

export type Chamber = 'camara' | 'senado';

/** Estados do selo de confiança definidos na metodologia do portal. */
export type VerificationStatus = 'oficial-confirmada' | 'corroborada' | 'em-verificacao' | 'corrigida';

export type SourceRef = {
  /** Nome legível da fonte, ex.: "API de Dados Abertos da Câmara dos Deputados". */
  name: string;
  /** URL exata consultada pelo sistema. */
  url: string;
  /** Data/hora (ISO) em que o sistema consultou a fonte. */
  fetchedAt: string;
  status: VerificationStatus;
};

/** Linha do diretório de políticos (deputados federais e senadores em exercício). */
export type PoliticianSummary = {
  /** Identificador oficial na casa legislativa (não é o nome). */
  id: string;
  chamber: Chamber;
  office: string;
  name: string;
  party: string;
  uf: string;
  photoUrl: string;
  /** Página oficial do parlamentar no site da casa. */
  officialUrl: string;
};

export type PoliticianListResult = {
  politicians: PoliticianSummary[];
  /** Fontes consultadas com sucesso. */
  sources: SourceRef[];
  /** Fontes que falharam nesta sincronização (exibidas, nunca escondidas). */
  failedSources: { name: string; url: string; error: string }[];
  fetchedAt: string;
};

// ---------- Câmara dos Deputados ----------

export type CamaraExpenseGroup = { type: string; total: number; count: number };
export type CamaraExpense = {
  year: number; month: number; type: string;
  supplier: string; supplierDocument: string;
  documentValue: number; netValue: number;
  documentUrl: string | null; documentDate: string | null;
};

export type CamaraProposal = {
  id: number; type: string; number: number; year: number | null;
  summary: string; presentedAt: string | null; apiUrl: string; portalUrl: string;
};

export type CamaraEvent = {
  id: string; type: string; title: string;
  startsAt: string | null; endsAt: string | null;
  situation: string; location: string;
};

export type CamaraProfile = {
  summary: PoliticianSummary;
  civilName: string;
  birthDate: string | null;
  birthCity: string | null;
  birthUf: string | null;
  schooling: string | null;
  gender: string | null;
  status: string | null;
  electoralCondition: string | null;
  officeRoom: string | null;
  officePhone: string | null;
  email: string | null;
  website: string | null;
  expenses: { groups: CamaraExpenseGroup[]; recent: CamaraExpense[]; periodTotal: number; loadedMonths: string };
  proposals: CamaraProposal[];
  events: { items: CamaraEvent[]; periodStart: string; periodEnd: string };
  sources: SourceRef[];
  /** Fontes que falharam durante a montagem do perfil. */
  failedSources: { name: string; url: string; error: string }[];
};

// ---------- Senado Federal ----------

export type SenadoVote = {
  date: string; session: string; matter: string; matterCode: string;
  description: string; result: string; vote: string; secret: boolean;
};

export type SenadoProfile = {
  summary: PoliticianSummary;
  fullName: string;
  birthDate: string | null;
  birthCity: string | null;
  birthUf: string | null;
  gender: string | null;
  officeAddress: string | null;
  email: string | null;
  votes: SenadoVote[];
  votesNote: string | null;
  sources: SourceRef[];
  failedSources: { name: string; url: string; error: string }[];
};
