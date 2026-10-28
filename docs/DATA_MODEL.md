# Modelo de dados do Fiscaliza Brasil

O modelo completo está em [`db/migrations/001_foundation.sql`](../db/migrations/001_foundation.sql)
(PostgreSQL). Resumo das decisões:

## Identidade estável de pessoas

- Cada político tem `person_key` única e uma tabela `politician_identifiers` com os
  identificadores oficiais (`camara_id`, `senado_codigo`, `tse_seq`…). A reconciliação
  entre fontes usa esses identificadores — **nunca apenas o nome**.
- Candidatos e eleitos não se misturam: `candidacies.situation` registra o resultado
  declarado pelo TSE (`eleito`, `suplente`, `nao_eleito`, `cassado`…), e `mandates`
  guarda o exercício efetivo do cargo.

## Proveniência obrigatória

Todo registro auditável guarda `source_id`, `collected_at` e, quando aplicável, a URL
exata consultada. `source_snapshots` preserva o payload bruto para evidência e replay.
`source_snapshots.payload_hash` e `news_articles.content_hash` alimentam a deduplicação.

## Selo por registro, não nota por político

`verification_records` referencia qualquer entidade (`entity_type` + `entity_id`) e
registra o selo (`oficial_confirmada`, `corroborada`, `em_verificacao`, `corrigida`),
a **regra aplicada** e as **evidências**. O portal não calcula pontuação de honestidade
ou competência.

## Presença e atividade sem conclusões inventadas

- `attendance_records.status` distingue `presente`, `ausente`, `ausente_justificada`,
  `remoto` e `indisponivel`. `indisponivel` nunca é apresentado como falta.
- `trips` exige `evidence_url` e `evidence_kind` (agenda, diário oficial ou prestação
  de contas) — viagem privada não vira "viagem oficial" por inferência.

## Informações judiciais com presunção de inocência

- `legal_cases.situation` usa vocabulário jurídico documentado (`investigacao`,
  `inquerito`, `denuncia`, `acao`, `condenacao_recorrivel`, `condenacao_definitiva`,
  `absolvido`, `arquivado`).
- `politician_id` fica `NULL` até a identidade estar confirmada por identificador —
  sem associação por semelhança de nome.
- `secrecy` marca processos sob sigilo; nesses casos só se publica o que for público.

## Auditoria e correções

- `sync_jobs` registra cada sincronização (início, fim, estatísticas, erro, próxima
  execução) — falhas ficam visíveis no painel administrativo e no rodapé das listas.
- `corrections` guarda denúncias e pedidos de correção com valor anterior e novo.
- `audit_logs` registra toda mutação relevante com ator e detalhe.

## Estado atual da implementação

Na **Fase 1** o Postgres ainda **não está conectado**: o portal lê as APIs oficiais em
tempo real com cache no servidor (diretório 1 h, perfis 30 min, apuração 30 s). A
conexão do banco e a fila de jobs (Celery/Redis ou equivalente) acontecem na Fase 5.
