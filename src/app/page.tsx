import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import CountUp from '@/components/CountUp';
import SourceMark from '@/components/SourceMark';
import SocialLinks from '@/components/SocialLinks';
import HomeMap from '@/components/HomeMap';
import PartyMark from '@/components/PartyMark';
import { listAllPoliticians } from '@/services/politicians';

export const metadata = {
  title: 'Fiscaliza Brasil — Transparência política com fontes oficiais',
  description:
    'Portal independente de transparência política: perfis de deputados e senadores com fotos oficiais, despesas, proposições e votações, o registro do dia no Congresso e o mapa da representação por estado. Cada informação exibe fonte, data de coleta e selo de verificação.',
};

export const revalidate = 3600;

export default async function Home() {
  const data = await listAllPoliticians().catch(() => null);
  const deputados = data?.politicians.filter(p => p.chamber === 'camara').length ?? null;
  const senadores = data?.politicians.filter(p => p.chamber === 'senado').length ?? null;
  const failed = data?.failedSources.length ?? 0;
  const fetchedAt = data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : null;

  const counts: Record<string, number> = {};
  data?.politicians.forEach(p => { counts[p.uf] = (counts[p.uf] ?? 0) + 1; });
  const topStates = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topParties = new Map<string, number>();
  data?.politicians.forEach(p => topParties.set(p.party, (topParties.get(p.party) ?? 0) + 1));
  const partiesTop = Array.from(topParties.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <main className="site">
      <SiteHeader active="home" />
      <div className="site-body">
        <section className="masthead">
          <div>
            <h1 className="a" style={{ ['--ad' as any]: '60ms' }}>Fiscalize quem você elegeu.</h1>
            <p className="lede a" style={{ ['--ad' as any]: '150ms' }}>
              Portal independente de transparência política. Reunimos o registro oficial de deputados
              federais e senadores — foto, despesas da cota, proposições e votações — coletado das APIs
              públicas das duas casas, sempre com a fonte e a data da coleta na tela. Sem rankings,
              sem notas subjetivas, sem dados inventados.
            </p>
            <div className="hero-actions a" style={{ ['--ad' as any]: '240ms' }}>
              <Link className="btn primary" href="/hoje">O que seu eleito fez hoje</Link>
              <Link className="btn" href="/politicos">Buscar políticos</Link>
            </div>
            {failed > 0 && (
              <p className="sync-warning a" style={{ ['--ad' as any]: '330ms' }} role="alert">
                <b>Fonte indisponível:</b> {failed} fonte oficial não respondeu na última sincronização.
                Os detalhes estão visíveis no diretório.
              </p>
            )}
          </div>
          <aside className="monitor a" style={{ ['--ad' as any]: '320ms' }} aria-label="Monitoramento das fontes">
            <h2>Monitoramento</h2>
            <dl>
              <div><dt>Deputados federais em exercício</dt><dd><CountUp value={deputados} /></dd></div>
              <div><dt>Senadores em exercício</dt><dd><CountUp value={senadores} /></dd></div>
              <div><dt>Fontes oficiais integradas</dt><dd><CountUp value={data ? data.sources.length + 2 : null} /></dd></div>
              <div><dt>Mandatos no diretório</dt><dd><CountUp value={data ? data.politicians.length : null} /></dd></div>
            </dl>
            <p className="sync">
              Última sincronização: <b>{fetchedAt ?? 'indisponível'}</b> (horário de Brasília).
              O diretório atualiza a cada hora e o dia oficial, a cada 15 minutos.
            </p>
          </aside>
        </section>

        <section className="bloco a" style={{ ['--ad' as any]: '400ms' }} aria-label="Mapa da representação" id="mapa">
          <header>
            <h2>Mapa da representação</h2>
            <p className="sub">Parlamentares monitorados por estado, sobre a malha oficial do IBGE. Clique num estado para abrir o diretório filtrado.</p>
          </header>
          <div className="map-split">
            <div className="map-canvas a"><HomeMap counts={counts} /></div>
            <aside className="map-side">
              <h3>Maiores bancadas</h3>
              <ol className="top-states">
                {topStates.map(([uf, n]) => (
                  <li key={uf}>
                    <Link href={`/politicos?uf=${uf}`}>{uf}</Link>
                    <span className="state-bar"><i style={{ width: `${topStates[0] ? (n / topStates[0][1]) * 100 : 0}%` }} /></span>
                    <b>{n}</b>
                  </li>
                ))}
              </ol>
              <h3>Partidos mais presentes</h3>
              <ul className="top-parties">
                {partiesTop.map(([party, n]) => (
                  <li key={party}><PartyMark party={party} /><b>{n}</b></li>
                ))}
              </ul>
              <p className="fine">Malha territorial: IBGE (qualidade mínima). Contadores: diretório das APIs da Câmara e do Senado.</p>
            </aside>
          </div>
        </section>

        <section className="module-list" aria-label="Módulos do portal">
          <Link className="module-row a" style={{ ['--ad' as any]: '480ms' }} href="/politicos">
            <h2>Diretório de políticos</h2>
            <p>
              Busque por nome, partido, estado ou casa legislativa. Cada perfil traz foto oficial,
              situação do mandato, despesas da cota parlamentar, proposições de autoria, agenda e
              votações nominais.
            </p>
            <span className="go">Abrir diretório</span>
          </Link>
          <Link className="module-row a" style={{ ['--ad' as any]: '560ms' }} href="/hoje">
            <h2>O dia de hoje</h2>
            <p>
              O que seu eleito fez hoje: proposições apresentadas, votações nominais, agenda oficial
              e presenças registradas — com destaque do dia e confronto de presenças.
            </p>
            <span className="go">Ver o dia de hoje</span>
          </Link>
          <Link className="module-row a" style={{ ['--ad' as any]: '640ms' }} href="/metodologia">
            <h2>Metodologia de verificação</h2>
            <p>
              Como cada registro recebe origem, data de coleta e um dos quatro selos de confiança —
              e por que o portal informa indisponibilidade em vez de inventar números.
            </p>
            <span className="go">Ler a metodologia</span>
          </Link>
        </section>

        <section className="bloco a" style={{ ['--ad' as any]: '720ms' }} aria-label="Fontes oficiais">
          <header>
            <h2>Fontes oficiais consultadas</h2>
            <p className="sub">O portal lê diretamente os serviços públicos abaixo.</p>
          </header>
          <table className="table">
            <thead>
              <tr><th>Fonte</th><th>Uso no portal</th><th className="num">Situação</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="source-flex"><SourceMark name="Câmara dos Deputados" size={24} /><a href="https://dadosabertos.camara.leg.br/swagger/api.html" target="_blank" rel="noreferrer">Câmara dos Deputados — Dados Abertos</a></span></td>
                <td>Diretório, perfis, despesas, proposições, agenda e presenças do dia.</td>
                <td className="num"><span className="status-tag on">integrada</span></td>
              </tr>
              <tr>
                <td><span className="source-flex"><SourceMark name="Senado Federal" size={24} /><a href="https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html" target="_blank" rel="noreferrer">Senado Federal — Dados Abertos</a></span></td>
                <td>Lista e perfil de senadores, votações nominais.</td>
                <td className="num"><span className="status-tag on">integrada</span></td>
              </tr>
              <tr>
                <td><span className="source-flex"><SourceMark name="IBGE" size={24} /><a href="https://servicodados.ibge.gov.br/api/docs/" target="_blank" rel="noreferrer">IBGE — Localidades e Malhas</a></span></td>
                <td>Limites de estados usados no mapa da representação.</td>
                <td className="num"><span className="status-tag on">integrada</span></td>
              </tr>
              <tr>
                <td><span className="source-flex"><SourceMark name="TSE Dados Abertos" size={24} /><a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noreferrer">TSE — Repositório de dados eleitorais</a></span></td>
                <td>Presidente, governadores e prefeitos: histórico de candidaturas e resultados completos.</td>
                <td className="num"><span className="status-tag">planejada</span></td>
              </tr>
              <tr>
                <td><span className="source-flex"><SourceMark name="Portal da Transparência" size={24} /><a href="https://portaldatransparencia.gov.br/" target="_blank" rel="noreferrer">Portal da Transparência</a></span></td>
                <td>Despesas do Executivo e dados de viagens.</td>
                <td className="num"><span className="status-tag">planejada</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="bloco a" style={{ ['--ad' as any]: '800ms' }} aria-label="Estado do projeto">
          <header>
            <h2>O que já funciona e o que vem a seguir</h2>
            <p className="sub">Funcionalidades marcadas como planejadas ainda não estão no ar.</p>
          </header>
          <div className="two-col">
            <div>
              <h3>Em produção</h3>
              <ul className="ok">
                <li>Diretório de deputados federais e senadores em exercício, com fotos oficiais.</li>
                <li>Perfis com despesas da cota, proposições de autoria, agenda oficial e votações nominais.</li>
                <li>O registro público do dia: proposições, votações, agenda e presenças.</li>
                <li>Mapa da representação por estado, sobre a malha oficial do IBGE.</li>
                <li>Fonte, data de coleta e selo de verificação em cada informação exibida.</li>
              </ul>
            </div>
            <div>
              <h3>Planejado</h3>
              <ul className="plan">
                <li>Presidente, governadores e prefeitos, importando os arquivos eleitorais do TSE.</li>
                <li>Banco de dados próprio (PostgreSQL) com histórico completo de mudanças.</li>
                <li>Notícias automáticas resumidas, sempre com link da fonte original.</li>
                <li>Módulo de processos judiciais com identidade confirmada e presunção de inocência.</li>
                <li>Deputados estaduais e vereadores, conforme as fontes de cada assembleia e câmara.</li>
                <li>Painel administrativo de sincronizações, correções e direito de resposta.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <footer className="foot">
        <span>Fiscaliza Brasil — informação para fortalecer a democracia.</span>
        <SocialLinks />
      </footer>
    </main>
  );
}
