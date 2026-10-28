import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import Seal from '@/components/Seal';
import { listAllPoliticians } from '@/services/politicians';

export const metadata = {
  title: 'Fiscaliza Brasil — Transparência política com fontes oficiais',
  description:
    'Portal independente de transparência política: perfis de deputados e senadores com fotos oficiais, despesas, proposições e votações, além do mapa de apuração do TSE. Cada informação exibe fonte, data de coleta e selo de verificação.',
};

export const revalidate = 3600;

export default async function Home() {
  const data = await listAllPoliticians().catch(() => null);
  const deputados = data?.politicians.filter(p => p.chamber === 'camara').length ?? null;
  const senadores = data?.politicians.filter(p => p.chamber === 'senado').length ?? null;
  const failed = data?.failedSources.length ?? 0;
  const fetchedAt = data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : null;

  return (
    <main className="site">
      <SiteHeader />

      <section className="hero">
        <p className="kicker">Transparência política verificável</p>
        <h1>
          Fiscalize quem você <em>elegeu</em>.
        </h1>
        <p className="hero-sub">
          Perfis de deputados federais e senadores com fotografia oficial, despesas, proposições e votações —
          tudo coletado de APIs oficiais e exibido com a fonte, a data da coleta e o selo de verificação.
          Sem rankings, sem notas subjetivas, sem dados inventados.
        </p>
        <div className="hero-actions">
          <Link className="btn primary" href="/politicos">Buscar políticos</Link>
          <Link className="btn" href="/apuracao">Abrir mapa da apuração</Link>
        </div>
        <dl className="hero-stats">
          <div><dt>Deputados federais</dt><dd>{deputados ?? '—'}</dd></div>
          <div><dt>Senadores</dt><dd>{senadores ?? '—'}</dd></div>
          <div><dt>Fontes oficiais integradas</dt><dd>{data ? data.sources.length + 2 : '—'}</dd></div>
          <div><dt>Última sincronização</dt><dd className="small-dd">{data ? fetchedAt : 'indisponível'}</dd></div>
        </dl>
        {failed > 0 && (
          <p className="sync-warning" role="alert">
            ⚠ {failed} fonte oficial ficou indisponível durante a última sincronização. Detalhes no diretório.
          </p>
        )}
      </section>

      <section className="modules" aria-label="Módulos do portal">
        <Link className="module-card" href="/politicos">
          <span className="module-tag">Diretório</span>
          <h2>Perfis de políticos</h2>
          <p>
            Busque por nome, partido ou estado. Cada perfil mostra foto oficial, situação do mandato,
            despesas da cota parlamentar, proposições de autoria, agenda e votações nominais.
          </p>
          <span className="module-go">Explorar {data ? `${data.politicians.length} perfis` : 'o diretório'} →</span>
          <span className="module-seal"><Seal status="oficial-confirmada" compact /></span>
        </Link>
        <Link className="module-card" href="/apuracao">
          <span className="module-tag">Mapa</span>
          <h2>Apuração eleitoral</h2>
          <p>
            Mapa interativo com malhas oficiais do IBGE e resultados publicados pelo TSE, por cargo, turno,
            estado e município — incluindo o voto no exterior.
          </p>
          <span className="module-go">Abrir o mapa →</span>
          <span className="module-seal"><Seal status="oficial-confirmada" compact /></span>
        </Link>
        <Link className="module-card" href="/metodologia">
          <span className="module-tag">Confiança</span>
          <h2>Metodologia e selos</h2>
          <p>
            Entenda como cada registro recebe origem, data de coleta e um dos quatro selos de verificação —
            e por que o portal não inventa dados quando uma fonte falha.
          </p>
          <span className="module-go">Ler a metodologia →</span>
        </Link>
      </section>

      <section className="sources-panel">
        <h2>Fontes oficiais consultadas</h2>
        <p className="sub">
          O portal consulta diretamente os serviços públicos abaixo. Se uma fonte não publicou o dado, a interface
          informa a indisponibilidade em vez de preencher com estimativas.
        </p>
        <div className="source-grid">
          <a href="https://dadosabertos.camara.leg.br/swagger/api.html" target="_blank" rel="noreferrer">
            <b>Câmara dos Deputados</b><span>Perfil, despesas, proposições, agenda</span><em>integrada</em>
          </a>
          <a href="https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html" target="_blank" rel="noreferrer">
            <b>Senado Federal</b><span>Perfil e votações nominais</span><em>integrada</em>
          </a>
          <a href="https://resultados.tse.jus.br/oficial/app/index.html" target="_blank" rel="noreferrer">
            <b>TSE — Divulgação de resultados</b><span>Apuração por cargo e localidade</span><em>integrada</em>
          </a>
          <a href="https://servicodados.ibge.gov.br/api/docs/" target="_blank" rel="noreferrer">
            <b>IBGE</b><span>Malhas territoriais e localidades</span><em>integrada</em>
          </a>
          <a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noreferrer">
            <b>TSE — Dados abertos eleitorais</b><span>Candidaturas, resultados históricos, fotos</span><em>planejada</em>
          </a>
          <a href="https://portaldatransparencia.gov.br/" target="_blank" rel="noreferrer">
            <b>Portal da Transparência</b><span>Despesas do Executivo e beneficiários</span><em>planejada</em>
          </a>
        </div>
      </section>

      <section className="roadmap">
        <h2>O que já funciona e o que vem a seguir</h2>
        <div className="roadmap-cols">
          <div>
            <h3>Em produção nesta versão</h3>
            <ul className="check">
              <li>Diretório de deputados federais e senadores em exercício com fotos oficiais.</li>
              <li>Perfis com despesas da cota parlamentar, proposições de autoria, agenda oficial e votações nominais.</li>
              <li>Mapa de apuração do TSE por cargo, turno, estado, município e voto no exterior.</li>
              <li>Rastreio de fonte, data de coleta e selo de verificação em cada dado.</li>
            </ul>
          </div>
          <div>
            <h3>Planejado e ainda não implementado</h3>
            <ul className="todo">
              <li>Banco de dados próprio (PostgreSQL) com histórico completo de mudanças.</li>
              <li>Notícias automáticas resumidas por IA a partir de fontes oficiais e RSS.</li>
              <li>Importação de candidaturas, resultados históricos e fotos do repositório do TSE.</li>
              <li>Módulo de processos judiciais e tribunais, com critérios rigorosos de identidade.</li>
              <li>Governadores, prefeitos, deputados estaduais e vereadores, conforme a disponibilidade das fontes.</li>
              <li>Painel administrativo de sincronizações, correções e direito de resposta.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="foot">
        <span>Fiscaliza Brasil · Informação para fortalecer a democracia.</span>
        <span className="social-links">
          <a href="https://www.instagram.com/euodeene" target="_blank" rel="noreferrer">Instagram @euodeene</a>
          <a href="https://x.com/euodeene" target="_blank" rel="noreferrer">X</a>
          <a href="https://github.com/danielfinotti2-spec" target="_blank" rel="noreferrer">GitHub</a>
        </span>
      </footer>
    </main>
  );
}
