import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CountUp from '@/components/CountUp';
import SourceMark from '@/components/SourceMark';
import Reveal from '@/components/Reveal';
import MapaClient, { type MapFace } from '@/components/MapaClient';
import EscandaloDoDia from '@/components/EscandaloDoDia';
import { listAllPoliticians } from '@/services/politicians';
import { pickLang, t } from '@/i18n/messages';

export const metadata = {
  title: 'Fiscaliza Brasil — Transparência política com fontes oficiais',
  description:
    'Portal independente de transparência política: perfis de deputados e senadores com dados oficiais, o registro do dia no Congresso e o mapa da representação por estado.',
};

export const revalidate = 3600;

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const q = L === 'pt' ? '' : `?lang=${L}`;
  const data = await listAllPoliticians().catch(() => null);
  const deputados = data?.politicians.filter(p => p.chamber === 'camara').length ?? null;
  const senadores = data?.politicians.filter(p => p.chamber === 'senado').length ?? null;
  const failed = data?.failedSources.length ?? 0;
  const fetchedAt = data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString(L === 'en' ? 'en-US' : L === 'es' ? 'es-ES' : 'pt-BR', { timeZone: 'America/Sao_Paulo' }) : null;

  const counts: Record<string, number> = {};
  const faces: Record<string, MapFace[]> = {};
  data?.politicians.forEach(p => {
    counts[p.uf] = (counts[p.uf] ?? 0) + 1;
    (faces[p.uf] = faces[p.uf] ?? []).push({ id: p.id, chamber: p.chamber, name: p.name, photoUrl: p.photoUrl, party: p.party });
  });
  Object.values(faces).forEach(list => list.sort((a, b) => a.name.localeCompare(b.name, 'pt')));

  return (
    <main className="site">
      <SiteHeader active="home" lang={L} />
      <div className="site-body">
        <section className="masthead">
          <div>
            <h1 className="a" style={{ ['--ad' as any]: '60ms' }}>{t(L, 'home.h1')}</h1>
            <p className="lede a" style={{ ['--ad' as any]: '150ms' }}>{t(L, 'home.lede')}</p>
            <div className="hero-actions a" style={{ ['--ad' as any]: '240ms' }}>
              <Link className="btn primary" href={`/hoje${q}`}>{t(L, 'home.cta.today')}</Link>
              <Link className="btn" href={`/politicos${q}`}>{t(L, 'home.cta.directory')}</Link>
            </div>
            {failed > 0 && (
              <p className="sync-warning a" style={{ ['--ad' as any]: '330ms' }} role="alert">
                <b>{t(L, 'home.sourceUnavailable')}:</b> {failed} {t(L, 'home.sourceFailed')}
              </p>
            )}
          </div>
          <aside className="monitor a" style={{ ['--ad' as any]: '320ms' }} aria-label={t(L, 'home.monitoring')}>
            <h2>{t(L, 'home.monitoring')}</h2>
            <dl>
              <div><dt>{t(L, 'home.mon deputies')}</dt><dd><CountUp value={deputados} /></dd></div>
              <div><dt>{t(L, 'home.mon.senators')}</dt><dd><CountUp value={senadores} /></dd></div>
              <div><dt>{t(L, 'home.mon.sources')}</dt><dd><CountUp value={data ? data.sources.length + 2 : null} /></dd></div>
              <div><dt>{t(L, 'home.mon.terms')}</dt><dd><CountUp value={data ? data.politicians.length : null} /></dd></div>
            </dl>
            <p className="sync">
              {t(L, 'home.lastSync')}: <b>{fetchedAt ?? '—'}</b>. {t(L, 'home.syncNote')}
            </p>
          </aside>
        </section>

        <EscandaloDoDia
          langPrefix={q}
          labels={{
            eyebrow: t(L, 'scandal.eyebrow'),
            empty: t(L, 'scandal.none'),
            evidence: t(L, 'scandal.evidence'),
            innocent: t(L, 'scandal.innocent'),
            caseSeal: t(L, 'scandal.caseSeal'),
          }}
        />

        <Reveal>
          <section className="bloco" aria-label={t(L, 'home.mapTitle')} id="mapa">
            <header>
              <h2>{t(L, 'home.mapTitle')}</h2>
              <p className="sub">{t(L, 'home.mapSub')}</p>
            </header>
            <div className="map-split">
              <MapaClient
                counts={counts}
                faces={faces}
                lang={L}
                labels={{
                  loading: t(L, 'map.loading'),
                  unavailable: t(L, 'map.unavailable'),
                  errorFine: t(L, 'map.errorFine'),
                  watchedSing: t(L, 'map.watchedSing'),
                  watchedPlur: t(L, 'map.watchedPlur'),
                  faces: t(L, 'map.faces'),
                  facesHint: t(L, 'map.facesHint'),
                  bigCaucus: t(L, 'home.bigCaucus'),
                  topParties: t(L, 'home.topParties'),
                  mapFine: t(L, 'home.mapFine'),
                }}
              />
            </div>
          </section>
        </Reveal>

        <section className="module-list" aria-label={t(L, 'home.modules')}>
          <Link className="module-row a" style={{ ['--ad' as any]: '480ms' }} href={`/politicos${q}`}>
            <h2>{t(L, 'home.mod.dir.h')}</h2>
            <p>{t(L, 'home.mod.dir.p')}</p>
            <span className="go">{t(L, 'home.mod.dir.go')}</span>
          </Link>
          <Link className="module-row a" style={{ ['--ad' as any]: '560ms' }} href={`/hoje${q}`}>
            <h2>{t(L, 'home.mod.today.h')}</h2>
            <p>{t(L, 'home.mod.today.p')}</p>
            <span className="go">{t(L, 'home.mod.today.go')}</span>
          </Link>
          <Link className="module-row a" style={{ ['--ad' as any]: '640ms' }} href={`/metodologia${q}`}>
            <h2>{t(L, 'home.mod.method.h')}</h2>
            <p>{t(L, 'home.mod.method.p')}</p>
            <span className="go">{t(L, 'home.mod.method.go')}</span>
          </Link>
        </section>

        <Reveal delay={80}>
          <section className="bloco" aria-label={t(L, 'home.fontesTitle')}>
            <header>
              <h2>{t(L, 'home.fontesTitle')}</h2>
              <p className="sub">{t(L, 'home.fontesSub')}</p>
            </header>
            <table className="table">
              <thead>
                <tr><th>{t(L, 'home.th.source')}</th><th>{t(L, 'home.th.use')}</th><th className="num">{t(L, 'home.th.status')}</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="source-flex"><SourceMark name="Câmara dos Deputados" size={24} /><a href="https://dadosabertos.camara.leg.br/swagger/api.html" target="_blank" rel="noreferrer">Câmara dos Deputados — Dados Abertos</a></span></td>
                  <td>{t(L, 'home.use.camara')}</td>
                  <td className="num"><span className="status-tag on">{t(L, 'home.status.on')}</span></td>
                </tr>
                <tr>
                  <td><span className="source-flex"><SourceMark name="Senado Federal" size={24} /><a href="https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html" target="_blank" rel="noreferrer">Senado Federal — Dados Abertos</a></span></td>
                  <td>{t(L, 'home.use.senado')}</td>
                  <td className="num"><span className="status-tag on">{t(L, 'home.status.on')}</span></td>
                </tr>
                <tr>
                  <td><span className="source-flex"><SourceMark name="IBGE" size={24} /><a href="https://servicodados.ibge.gov.br/api/docs/" target="_blank" rel="noreferrer">IBGE — Localidades e Malhas</a></span></td>
                  <td>{t(L, 'home.use.ibge')}</td>
                  <td className="num"><span className="status-tag on">{t(L, 'home.status.on')}</span></td>
                </tr>
                <tr>
                  <td><span className="source-flex"><SourceMark name="TSE Dados Abertos" size={24} /><a href="https://dadosabertos.tse.jus.br/" target="_blank" rel="noreferrer">TSE — Repositório de dados eleitorais</a></span></td>
                  <td>{t(L, 'home.use.tse')}</td>
                  <td className="num"><span className="status-tag">{t(L, 'home.status.plan')}</span></td>
                </tr>
                <tr>
                  <td><span className="source-flex"><SourceMark name="Portal da Transparência" size={24} /><a href="https://portaldatransparencia.gov.br/" target="_blank" rel="noreferrer">Portal da Transparência</a></span></td>
                  <td>{t(L, 'home.use.transp')}</td>
                  <td className="num"><span className="status-tag">{t(L, 'home.status.plan')}</span></td>
                </tr>
              </tbody>
            </table>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="bloco" aria-label={t(L, 'home.roadmap.h')}>
            <header>
              <h2>{t(L, 'home.roadmap.h')}</h2>
              <p className="sub">{t(L, 'home.roadmap.sub')}</p>
            </header>
            <div className="two-col">
              <div>
                <h3>{t(L, 'home.roadmap.now')}</h3>
                <ul className="ok">
                  <li>{t(L, 'home.now.1')}</li>
                  <li>{t(L, 'home.now.2')}</li>
                  <li>{t(L, 'home.now.3')}</li>
                  <li>{t(L, 'home.now.4')}</li>
                  <li>{t(L, 'home.now.5')}</li>
                </ul>
              </div>
              <div>
                <h3>{t(L, 'home.roadmap.next')}</h3>
                <ul className="plan">
                  <li>{t(L, 'home.plan.1')}</li>
                  <li>{t(L, 'home.plan.2')}</li>
                  <li>{t(L, 'home.plan.3')}</li>
                  <li>{t(L, 'home.plan.4')}</li>
                  <li>{t(L, 'home.plan.5')}</li>
                  <li>{t(L, 'home.plan.6')}</li>
                </ul>
              </div>
            </div>
          </section>
        </Reveal>
      </div>

      <SiteFooter lang={L} />
    </main>
  );
}
