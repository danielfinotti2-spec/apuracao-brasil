-- Fiscaliza Brasil — Fase 1: fundação do banco de dados (PostgreSQL 14+)
--
-- ATENÇÃO: este schema é o MODELO-ALVO do projeto. Ele ainda NÃO está conectado ao
-- site — na Fase 1 o portal lê as APIs oficiais em tempo real (com cache no servidor).
-- A conexão deste banco acontece na Fase 5 (atualização automática com fila de jobs).
--
-- Convenções:
--  * ids internos BIGSERIAL + identificadores externos oficiais preservados;
--  * todo dado auditável referencia sources.id e guarda collected_at;
--  * histórico via tabelas *_history ou valid_from/valid_to;
--  * upsert pelos índices únicos de identidade estável (nunca por nome).

BEGIN;

CREATE TABLE IF NOT EXISTS sources (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,                    -- ex.: "API Dados Abertos Câmara"
  kind          TEXT NOT NULL,                    -- api | arquivo | feed | manual
  base_url      TEXT NOT NULL,
  terms_url     TEXT,                             -- condições de uso/atribuição
  trust_level   TEXT NOT NULL DEFAULT 'oficial',  -- oficial | imprensa | comunitaria
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS politicians (
  id                BIGSERIAL PRIMARY KEY,
  -- Identidade estável: cpf/hash quando legalmente publicável, senão chave composta.
  person_key        TEXT NOT NULL UNIQUE,          -- ex.: "camara:204379" até reconciliação
  civil_name        TEXT,
  public_name       TEXT NOT NULL,
  gender            TEXT,
  birth_date        DATE,
  birth_city        TEXT,
  birth_uf          CHAR(2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reconciliação de identidade entre casas/eleições (evita duplicar pessoas).
CREATE TABLE IF NOT EXISTS politician_identifiers (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  scheme        TEXT NOT NULL,        -- camara_id | senado_codigo | tse_seq | tse_titulo
  value         TEXT NOT NULL,
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scheme, value)
);

CREATE TABLE IF NOT EXISTS parties (
  id         BIGSERIAL PRIMARY KEY,
  sigla      TEXT NOT NULL UNIQUE,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offices (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,   -- Presidente, Governador, Senador, Deputado Federal...
  branch      TEXT NOT NULL,          -- executivo | legislativo
  level       TEXT NOT NULL,          -- federal | estadual | municipal
  chamber_ref TEXT                    -- camara | senado | assembleia | camara_municipal
);

CREATE TABLE IF NOT EXISTS mandates (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  office_id     BIGINT NOT NULL REFERENCES offices(id),
  party_id      BIGINT REFERENCES parties(id),
  uf            CHAR(2),
  municipality  TEXT,
  started_on    DATE,
  ended_on      DATE,
  status        TEXT NOT NULL,        -- exercicio | suplente | afastado | encerrado | cassado | renunciou
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (politician_id, office_id, started_on)
);

CREATE TABLE IF NOT EXISTS party_affiliations (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  party_id      BIGINT NOT NULL REFERENCES parties(id),
  started_on    DATE,
  ended_on      DATE,
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS elections (
  id          BIGSERIAL PRIMARY KEY,
  year        INT NOT NULL,
  round       INT NOT NULL,
  type        TEXT NOT NULL,          -- ordinaria | suplementar
  election_day DATE,
  UNIQUE (year, round, type)
);

CREATE TABLE IF NOT EXISTS candidacies (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  election_id   BIGINT NOT NULL REFERENCES elections(id),
  office_id     BIGINT NOT NULL REFERENCES offices(id),
  party_id      BIGINT REFERENCES parties(id),
  uf            CHAR(2),
  tse_seq       TEXT,                 -- sq_candidato no TSE
  ballot_number TEXT,
  ballot_name   TEXT,
  -- candidato ≠ eleito: a situação final é registrada aqui, nunca presumida.
  situation     TEXT NOT NULL,        -- apto | eleito | eleito_por_media | suplente | nao_eleito | cassado | indeferido
  votes         BIGINT,
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (election_id, tse_seq)
);

-- Fotografias: arquivo + metadados de origem (uso permitido conferido por fonte).
CREATE TABLE IF NOT EXISTS photographs (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  storage_path  TEXT,                 -- quando espelhada em storage próprio
  width         INT,
  height        INT,
  attribution   TEXT,                 -- crédito exigido pela fonte
  usage_terms   TEXT,                 -- condições de uso da foto naquela fonte
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (politician_id, url)
);

-- Snapshots brutos das fontes (evidência e replay de ingestão).
CREATE TABLE IF NOT EXISTS source_snapshots (
  id          BIGSERIAL PRIMARY KEY,
  source_id   BIGINT NOT NULL REFERENCES sources(id),
  url         TEXT NOT NULL,
  payload     JSONB,
  payload_hash TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_id, url, collected_at)
);

CREATE TABLE IF NOT EXISTS sessions (
  id           BIGSERIAL PRIMARY KEY,
  chamber_ref  TEXT NOT NULL,         -- camara | senado | assembleia ...
  kind         TEXT NOT NULL,         -- plenario | comissao | evento_oficial
  external_ref TEXT,                  -- código da sessão na fonte
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  description  TEXT,
  source_id    BIGINT REFERENCES sources(id),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chamber_ref, external_ref)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id            BIGSERIAL PRIMARY KEY,
  session_id    BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  -- 'presenca confirmada' ≠ 'ausência comprovada': indisponível nunca vira falta.
  status        TEXT NOT NULL,        -- presente | ausente | ausente_justificada | remoto | indisponivel
  justification TEXT,
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, politician_id)
);

CREATE TABLE IF NOT EXISTS legislative_proposals (
  id           BIGSERIAL PRIMARY KEY,
  chamber_ref  TEXT NOT NULL,
  external_ref TEXT NOT NULL,         -- uri/id na API oficial
  type         TEXT,                  -- PL, PEC, PLP...
  number       INT,
  year         INT,
  title        TEXT,
  summary      TEXT,
  presented_on DATE,
  status       TEXT,                  -- tramitacao | aprovada | rejeitada | arquivada | sancionada | vetada
  portal_url   TEXT,
  source_id    BIGINT REFERENCES sources(id),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chamber_ref, external_ref)
);

CREATE TABLE IF NOT EXISTS proposal_authors (
  proposal_id  BIGINT NOT NULL REFERENCES legislative_proposals(id) ON DELETE CASCADE,
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  role         TEXT NOT NULL DEFAULT 'autor',  -- autor | coautor | relator
  PRIMARY KEY (proposal_id, politician_id, role)
);

CREATE TABLE IF NOT EXISTS votes (
  id            BIGSERIAL PRIMARY KEY,
  session_id    BIGINT REFERENCES sessions(id),
  proposal_id   BIGINT REFERENCES legislative_proposals(id),
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  voted_at      TIMESTAMPTZ,
  vote          TEXT NOT NULL,        -- sim | nao | abstencao | obstrucao | ausente | secreto
  result        TEXT,                 -- resultado da votação como um todo
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, proposal_id, politician_id, vote)
);

CREATE TABLE IF NOT EXISTS expenses (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  year          INT NOT NULL,
  month         INT NOT NULL,
  type          TEXT NOT NULL,
  supplier_name TEXT,
  supplier_doc  TEXT,
  document_value NUMERIC(14,2),
  net_value      NUMERIC(14,2),
  document_url  TEXT,
  document_date DATE,
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expenses_politician_period ON expenses (politician_id, year, month);

CREATE TABLE IF NOT EXISTS trips (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  destination   TEXT,
  starts_on     DATE,
  ends_on       DATE,
  -- somente deslocamentos documentados (agenda, diário oficial, prestação de contas)
  evidence_url  TEXT NOT NULL,
  evidence_kind TEXT NOT NULL,        -- agenda | diario_oficial | prestacao_contas
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_articles (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,        -- resumo próprio, nunca cópia integral
  category      TEXT,
  event_date    DATE,
  published_at  TIMESTAMPTZ,
  source_url    TEXT NOT NULL,        -- link da fonte original
  source_name   TEXT,
  content_hash  TEXT UNIQUE,          -- deduplicação
  status        TEXT NOT NULL DEFAULT 'revisao',  -- rascunho | revisao | publicado | corrigido
  review_reason TEXT,
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_politicians (
  article_id    BIGINT NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  politician_id BIGINT NOT NULL REFERENCES politicians(id),
  confidence    NUMERIC(4,3),         -- pontuação de associação, auditável
  basis         TEXT,                 -- evidência usada na associação (nunca só o nome)
  PRIMARY KEY (article_id, politician_id)
);

CREATE TABLE IF NOT EXISTS legal_cases (
  id            BIGSERIAL PRIMARY KEY,
  politician_id BIGINT REFERENCES politicians(id), -- NULL até identidade confirmada
  court         TEXT NOT NULL,
  case_number   TEXT,                 -- quando público
  case_class    TEXT,
  subject       TEXT,
  -- situação jurídica documentada, nunca presumida:
  situation     TEXT NOT NULL,        -- investigacao | inquerito | denuncia | acao | condenacao_recorrivel | condenacao_definitiva | absolvido | arquivado
  secrecy       BOOLEAN NOT NULL DEFAULT FALSE,
  updated_on    DATE,
  details       TEXT,
  source_url    TEXT,
  source_id     BIGINT REFERENCES sources(id),
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_case_events (
  id          BIGSERIAL PRIMARY KEY,
  case_id     BIGINT NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
  happened_on DATE,
  description TEXT,
  decision    TEXT,
  source_url  TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Selo de verificação por registro (qualquer entidade), nunca "nota geral" do político.
CREATE TABLE IF NOT EXISTS verification_records (
  id          BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,          -- news | expense | vote | trip | legal_case ...
  entity_id   BIGINT NOT NULL,
  status      TEXT NOT NULL,          -- oficial_confirmada | corroborada | em_verificacao | corrigida
  rule_applied TEXT NOT NULL,         -- regra de validação usada (auditoria)
  evidence    JSONB,                  -- URLs, hashes, comparações
  decided_by  TEXT NOT NULL DEFAULT 'sistema', -- sistema | revisor
  decided_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id          BIGSERIAL PRIMARY KEY,
  source_id   BIGINT REFERENCES sources(id),
  job_key     TEXT NOT NULL,          -- ex.: "camara.deputados.lista"
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status      TEXT NOT NULL,          -- running | ok | erro | pulado
  stats       JSONB,                  -- novos, alterados, ignorados
  error       TEXT,
  next_run_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_key_latest ON sync_jobs (job_key, started_at DESC);

CREATE TABLE IF NOT EXISTS corrections (
  id          BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id   BIGINT NOT NULL,
  reported_by TEXT,                   -- contato do denunciante (opcional)
  reason      TEXT NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  status      TEXT NOT NULL DEFAULT 'aberta', -- aberta | aceita | rejeitada | aplicada
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT NOT NULL,          -- sistema | admin | pipeline
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   BIGINT,
  detail      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
