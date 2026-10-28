import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PartyMark from '@/components/PartyMark';
import Reveal from '@/components/Reveal';
import AcumuladoClient from '@/components/AcumuladoClient';
import { getTodayData } from '@/services/hoje';
import { pickLang, t } from '@/i18n/messages';

export const revalidate = 900;
export const maxDuration = 60;

export const metadata = {
  title: 'Rankings e tabelas | Fiscaliza Brasil',
  description: 'Números objetivos do que as fontes oficiais registram: proposições do dia, participações registradas, acumulado e subsídios por cargo — sem notas de “melhor” ou “pior”.',
};

export default async function RankingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const q = L === 'pt' ? '' : `?lang=${L}`;
  const today = await getTodayData();

  // Ranking do dia: proposições por autor
  const byAuthor = new Map<string, { name: string; id: string | null; n: number }>();
  today.proposals.forEach(p => p.authors.forEach(a => {
    const key = a.deputyId ?? a.name;
    const cur = byAuthor.get(key) ?? { name: a.name, id: a.deputyId, n: 0 };
    cur.n += 1;
    byAuthor.set(key, cur);
  }));
  const topAuthors = Array.from(byAuthor.values()).sort((a, b) => b.n - a.n).slice(0, 15);

  // Ranking do dia: participações registradas
  const topPresence = [...today.present]
    .sort((a, b) => b.activities.length - a.activities.length)
    .slice(0, 15);

  return (
    <main className="site">
      <SiteHeader active="rankings" lang={L} />
      <div className="site-body">
        <section className="page-head a" style={{ ['--ad' as any]: '60ms' }}>
          <h1>{t(L, 'rank.h1')}</h1>
          <p className="lede">{t(L, 'rank.lede')}</p>
        </section>

        <Reveal>
          <section className="profile-section" aria-label={t(L, 'rank.history')}>
            <h2>{t(L, 'rank.history')}</h2>
            <p className="sub">{t(L, 'rank.historySub')}</p>
            <AcumuladoClient
              langPrefix={q}
              labels={{
                title: t(L, 'rank.history'),
                sub: t(L, 'rank.historySub'),
                none: t(L, 'rank.history.none7'),
                since: t(L, 'rank.since'),
                bills: t(L, 'rank.colCount'),
                pres: t(L, 'today.pres.on'),
              }}
            />
          </section>
        </Reveal>

        <div className="hoje-grid two">
          <Reveal delay={60}>
            <section className="profile-section vx" aria-label={t(L, 'rank.today.props')}>
              <h2>{t(L, 'rank.today.props')}</h2>
              <p className="sub">{t(L, 'rank.today.propsSub')}</p>
              {topAuthors.length === 0 ? <p className="empty-note">{t(L, 'rank.noData')}</p> : (
                <table className="table rank-table">
                  <thead><tr><th>#</th><th>{t(L, 'dir.party')}</th><th className="num">{t(L, 'rank.colCount')}</th></tr></thead>
                  <tbody>
                    {topAuthors.map((a, i) => (
                      <tr key={a.name + i}>
                        <td className="num rank-pos">{i + 1}</td>
                        <td>{a.id ? <Link className="rank-name" href={`/politicos/camara/${a.id}${q}`}>{a.name}</Link> : a.name}</td>
                        <td className="num"><b>{a.n}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </Reveal>

          <Reveal delay={120}>
            <section className="profile-section vx" aria-label={t(L, 'rank.today.pres')}>
              <h2>{t(L, 'rank.today.pres')}</h2>
              <p className="sub">{t(L, 'rank.today.presSub')}</p>
              {topPresence.length === 0 ? <p className="empty-note">{t(L, 'rank.noData')}</p> : (
                <table className="table rank-table">
                  <thead><tr><th>#</th><th>{L === 'en' ? 'Name' : L === 'es' ? 'Nombre' : 'Nome'}</th><th className="num">{t(L, 'rank.colCount')}</th></tr></thead>
                  <tbody>
                    {topPresence.map((p, i) => (
                      <tr key={p.id}>
                        <td className="num rank-pos">{i + 1}</td>
                        <td>
                          <Link className="rank-name" href={`/politicos/camara/${p.id}${q}`}>
                            <b>{p.name}</b> <small className="party-line"><PartyMark party={p.party} /> {p.uf}</small>
                          </Link>
                        </td>
                        <td className="num"><b>{p.activities.length}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <section className="profile-section" aria-label={t(L, 'rank.salary')}>
            <h2>{t(L, 'rank.salary')}</h2>
            <p className="sub">{t(L, 'rank.salarySub')}</p>
            <table className="table">
              <thead>
                <tr><th>{t(L, 'rank.office')}</th><th>{t(L, 'rank.where')}</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>{L === 'en' ? 'Federal deputy' : L === 'es' ? 'Diputado federal' : 'Deputado federal'}</td>
                  <td><a href="https://www.camara.leg.br/transparencia" target="_blank" rel="noreferrer">camara.leg.br/transparencia ↗</a></td>
                </tr>
                <tr>
                  <td>{L === 'en' ? 'Senator' : L === 'es' ? 'Senador' : 'Senador(a)'}</td>
                  <td><a href="https://www.senado.leg.br/transparencia" target="_blank" rel="noreferrer">senado.leg.br/transparencia ↗</a></td>
                </tr>
                <tr>
                  <td>{L === 'en' ? 'President, ministers of state, federal judges' : L === 'es' ? 'Presidente, ministros de Estado y jueces' : 'Presidente(a), ministros de Estado e magistratura'}</td>
                  <td><a href="https://www.portaltransparencia.gov.br/" target="_blank" rel="noreferrer">portaltransparencia.gov.br ↗</a></td>
                </tr>
                <tr>
                  <td>{t(L, 'rank.ceiling')}</td>
                  <td><a href="https://www.stf.jus.br/" target="_blank" rel="noreferrer">stf.jus.br ↗</a></td>
                </tr>
              </tbody>
            </table>
          </section>
        </Reveal>

        <p className="fine" style={{ maxWidth: 820 }}>
          {t(L, 'rank.nextNote')}{' '}
          <a href="https://dadosabertos.camara.leg.br/swagger/api.html" target="_blank" rel="noreferrer">dadosabertos.camara.leg.br ↗</a>
        </p>
      </div>
      <SiteFooter lang={L} />
    </main>
  );
}
