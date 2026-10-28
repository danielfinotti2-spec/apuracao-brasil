# Fiscaliza Brasil

Portal independente de transparência política em Next.js + TypeScript. Cada informação
exibida vem de uma fonte oficial identificável e carrega a URL consultada, a data da
coleta e um selo de verificação. O portal **não inventa dados**: quando uma fonte não
publica uma informação, a interface mostra a indisponibilidade.

Este repositório nasceu do painel **Apuração Brasil** — o mapa eleitoral foi preservado
e agora é um módulo do portal, em [`/apuracao`](src/app/apuracao/page.tsx).

## O que já está implementado

| Módulo | Conteúdo | Fonte oficial |
| --- | --- | --- |
| Diretório `/politicos` | Deputados federais e senadores em exercício, com foto oficial, partido e UF; busca e filtros | API Dados Abertos da Câmara + serviço Dados Abertos do Senado |
| Perfil `/politicos/camara/[id]` | Identificação oficial, situação do mandato, despesas da cota parlamentar (com grupos e documentos), proposições de autoria, agenda oficial de 90 dias | API Dados Abertos da Câmara |
| Perfil `/politicos/senado/[id]` | Identificação oficial e votações nominais com o voto do parlamentar | serviço Dados Abertos do Senado |
| Mapa `/apuracao` | Apuração por cargo, turno, estado, município e voto no exterior; avisos ao vivo | divulgação de resultados do TSE + malhas do IBGE |
| `/metodologia` | Os quatro selos de verificação, regras editoriais e fluxo de coleta | — |

Todo perfil termina com **Fontes utilizadas nesta página**: as URLs exatas consultadas,
o horário de cada coleta e, quando ocorre, a lista de consultas que falharam (falhas
nunca são escondidas).

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para produção: `npm run build` e `npm start`.


## Testes e verificação

```bash
npm run typecheck   # tipos TypeScript
npm run build       # build de produção (valida rotas e SSR)
npm run test:e2e    # testes Playwright (sobe o servidor de produção na porta 3011)
```

Os testes e2e interceptam as rotas internas (`/api/...`) para rodar de forma
determinística, sem depender da disponibilidade das fontes externas.

## Fontes integradas (verificadas em chamadas reais)

- **Câmara dos Deputados — Dados Abertos**: `GET /api/v2/deputados` (lista paginada),
  `GET /api/v2/deputados/{id}`, `GET /api/v2/deputados/{id}/despesas`,
  `GET /api/v2/proposicoes?idDeputadoAutor=…`, `GET /api/v2/deputados/{id}/eventos`.
  Documentação: https://dadosabertos.camara.leg.br/swagger/api.html
- **Senado Federal — Dados Abertos**: `GET /dadosabertos/senador/lista/atual.json`,
  `GET /dadosabertos/senador/{cod}.json`, `GET /dadosabertos/senador/{cod}/votacoes.json`.
  Documentação: https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html
  (A API avisa que o serviço de votações está "em descontinuação"; o aviso é repassado
  na tela. Enquanto o serviço responde, usamos seus dados oficiais.)
- **TSE — divulgação de resultados**: arquivos JSON do aplicativo oficial
  (https://resultados.tse.jus.br/oficial/app/index.html).
- **IBGE**: APIs de Localidades e Malhas (https://servicodados.ibge.gov.br/api/docs/).

Cache do servidor: diretório 1 h, perfis 30 min, apuração 30 s. A última sincronização
é exibida na página inicial, no diretório e no rodapé dos resultados.

## Planejado e ainda não implementado

- Banco PostgreSQL (schema pronto em [`db/migrations/001_foundation.sql`](db/migrations/001_foundation.sql), documentado em [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)) + pipeline agendado com filas (Fase 5).
- Importação do repositório de arquivos do TSE (candidaturas históricas, fotos) com deduplicação de pessoas.
- Notícias automáticas com IA (resumos próprios, sempre com link da fonte; nenhuma notícia fictícia).
- Módulo de processos judiciais com critérios rigorosos de identidade e presunção de inocência.
- Governadores, prefeitos, deputados estaduais e vereadores, conforme a disponibilidade das fontes.
- Painel administrativo (sincronizações, correções, direito de resposta) e formulário público de correção.

## Estrutura

- `src/app/page.tsx` — portal (início).
- `src/app/politicos` — diretório; `src/app/politicos/{camara,senado}/[id]` — perfis.
- `src/app/apuracao` — painel de apuração (mapa preservado do Apuração Brasil).
- `src/app/metodologia` — selos e regras de verificação.
- `src/services/camara.ts`, `src/services/senado.ts` — adaptadores das APIs oficiais, com rastreio de fonte.
- `src/services/tse.ts` — leitura da configuração e dos arquivos oficiais de apuração do TSE.
- `src/app/api/politicians` — agregação Câmara + Senado com tolerância a falha e lista de fontes com erro.
- `src/components/Seal.tsx` — selo de verificação; `src/components/SourceList.tsx` — proveniência dos dados.

## Privacidade e chaves

Não há chaves secretas em uso nesta fase (todas as fontes são públicas e sem autenticação).
Variáveis de ambiente futuras (IA, banco) ficam no servidor — nada com prefixo
`NEXT_PUBLIC_` recebe segredo. Ver `.env.example`.
