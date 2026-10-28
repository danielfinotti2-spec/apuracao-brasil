# Fiscaliza Brasil

Portal independente de transparência política em Next.js + TypeScript. Cada informação
exibida vem de uma fonte oficial identificável e carrega a URL consultada, a data da
coleta e um selo de verificação. O portal **não inventa dados**: quando uma fonte não
publica uma informação, a interface mostra a indisponibilidade.

Este repositório nasceu do painel **Apuração Brasil** — o mapa (Leaflet + malhas do IBGE)
foi preservado e reaproveitado como **mapa da representação** na página inicial; o módulo
de apuração eleitoral em tempo real foi descontinuado nesta fase.

## O que já está implementado

| Módulo | Conteúdo | Fonte oficial |
| --- | --- | --- |
| Diretório `/politicos` | Deputados federais e senadores em exercício, com foto oficial, partido e UF; busca, filtros e filtro por UF vindo do mapa (`?uf=`) | API Dados Abertos da Câmara + serviço Dados Abertos do Senado |
| Perfil `/politicos/camara/[id]` | Identificação oficial, situação do mandato, despesas da cota parlamentar (com grupos e documentos), proposições de autoria, agenda oficial de 90 dias | API Dados Abertos da Câmara |
| Perfil `/politicos/senado/[id]` | Identificação oficial e votações nominais com o voto do parlamentar | serviço Dados Abertos do Senado |
| O dia de hoje `/hoje` | "O que seu eleito fez hoje": proposições apresentadas na data, votações nominais, agenda oficial e presenças registradas nos eventos, com destaque do dia e confronto de presenças | API Dados Abertos da Câmara |
| Mapa da representação (home) | Estados coloridos pelo número de parlamentares monitorados; clique filtra o diretório | diretório do portal + malhas do IBGE |
| `/metodologia` | Os quatro selos de verificação, regras editoriais e fluxo de coleta | — |
| `/termos` | Termos de uso, neutralidade, presunção de inocência, LGPD e limites de responsabilidade | — |
| `/apoiar` | Formas de apoiar o projeto (compartilhar, reportar erros, contribuir com código, patrocínio) | — |
| `/melhorias` | Quadro público de melhorias e erros, com formulário | Postgres (Vercel) com fallback honesto quando não configurado |
| Tema claro/escuro | Botão no cabeçalho; preferência persistida no navegador | — |
| Idiomas | Português (padrão), English e Español via `?lang=` em todas as páginas | — |

Todo perfil e a página do dia terminam com **Fontes utilizadas nesta página**: as URLs
exatas consultadas, o horário de cada coleta e, quando ocorre, a lista de consultas que
falharam (falhas nunca são escondidas).

### Regra editorial sobre “presenças do dia”

A aba *Sem registro público hoje* descreve **o que a fonte consultada publicou**, nunca o
parlamentar: ausência de registro público numa data não é prova de falta, descuido ou
ausência de trabalho. O aviso é exibido junto das listas, sempre.

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
  `GET /api/v2/proposicoes?idDeputadoAutor=…`, `GET /api/v2/deputados/{id}/eventos`,
  e o quadro do dia: `GET /api/v2/proposicoes?dataApresentacaoInicio=…`,
  `GET /api/v2/votacoes?dataInicio=…`, `GET /api/v2/eventos?dataInicio=…`,
  `GET /api/v2/eventos/{id}/deputados`.
  Documentação: https://dadosabertos.camara.leg.br/swagger/api.html
- **Senado Federal — Dados Abertos**: `GET /dadosabertos/senador/lista/atual.json`,
  `GET /dadosabertos/senador/{cod}.json`, `GET /dadosabertos/senador/{cod}/votacoes.json`.
  Documentação: https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html
  (A API avisa que o serviço de votações está "em descontinuação"; o aviso é repassado
  na tela. Enquanto o serviço responde, usamos seus dados oficiais.)
- **IBGE**: APIs de Localidades e Malhas (https://servicodados.ibge.gov.br/api/docs/).

Cache do servidor: diretório 1 h, perfis 30 min, quadro do dia 15 min. A última
sincronização é exibida na página inicial, no diretório e na página do dia.

## Deploy na Vercel

O projeto roda na Vercel sem configuração extra (Next.js detectado, região `gru1` em
[`vercel.json`](vercel.json)). Dois caminhos:

1. **Pelo painel**: vercel.com → *Add New → Project* → importar `danielfinotti2-spec/apuracao-brasil` → Deploy.
2. **Pela CLI**: `npx vercel --prod` (pede login na conta da Vercel).

Banco do quadro de melhorias: no painel da Vercel, **Storage → Postgres → Create** e
*Connect to Project*. Isso injeta `POSTGRES_URL` automaticamente; a tabela
`improvements` é criada pelo próprio código no primeiro uso.

## Planejado e ainda não implementado

- Presidente, governadores e prefeitos, importando os arquivos eleitorais do repositório
  de Dados Abertos do TSE (candidaturas, resultados e fotos oficiais).
- Banco PostgreSQL (schema pronto em [`db/migrations/001_foundation.sql`](db/migrations/001_foundation.sql), documentado em [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)) + pipeline agendado com filas.
- Notícias automáticas com IA (resumos próprios, sempre com link da fonte; nenhuma notícia fictícia).
- Módulo de processos judiciais com critérios rigorosos de identidade e presunção de inocência.
- Deputados estaduais e vereadores, conforme a disponibilidade das fontes de cada assembleia e câmara.
- Painel administrativo (sincronizações, correções, direito de resposta) e formulário público de correção.

## Estrutura

- `src/app/page.tsx` — portal (início) + mapa da representação embutido.
- `src/app/politicos` — diretório; `src/app/politicos/{camara,senado}/[id]` — perfis.
- `src/app/hoje` — o registro público do dia.
- `src/app/metodologia` — selos e regras de verificação.
- `src/services/camara.ts`, `src/services/senado.ts`, `src/services/hoje.ts` — adaptadores das APIs oficiais, com rastreio de fonte.
- `src/app/api/politicians` — agregação Câmara + Senado com tolerância a falha e lista de fontes com erro.
- `src/components/Seal.tsx`, `SourceList.tsx` — verificação e proveniência; `PartyMark.tsx`, `SourceMark.tsx` — símbolos SVG autorais; `ThemeToggle.tsx` — claro/escuro; `DestaqueMotion.tsx` — animação do destaque do dia.

## Privacidade e chaves

Não há chaves secretas em uso nesta fase (todas as fontes são públicas e sem autenticação).
Variáveis de ambiente futuras (IA, banco) ficam no servidor — nada com prefixo
`NEXT_PUBLIC_` recebe segredo. Ver `.env.example`.
