import { Suspense } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PoliticosClient from '@/components/PoliticosClient';
import Collapsible from '@/components/Collapsible';
import PartyMark from '@/components/PartyMark';
import { pickLang, t } from '@/i18n/messages';
import { GOVERNORS, CAPITAL_MAYORS, DF_MAYOR_NOTE, ELECTION_SOURCES } from '@/data/executive';
import { GOV_PHOTOS, MAYOR_PHOTOS, PRESIDENT_PHOTO } from '@/data/executive-photos';

export const metadata = {
  title: 'Diretório de políticos | Fiscaliza Brasil',
  description: 'Deputados federais e senadores em exercício, com fotos oficiais, partido e estado. Dados das APIs oficiais da Câmara dos Deputados e do Senado Federal.',
};

export default async function PoliticosPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const q = L === 'pt' ? '' : `?lang=${L}`;
  return (
    <main className="site">
      <SiteHeader active="politicos" lang={L} />
      <div className="site-body">
        <div className="exec-strip a" style={{ ['--ad' as any]: '40ms' }}>
          <span><b>{t(L, 'exec.title')}:</b> {t(L, 'exec.line')}</span>
          <a href="https://www.gov.br/pt-br" target="_blank" rel="noreferrer">gov.br ↗</a>
          <a href="https://www.gov.br/planalto/pt-br" target="_blank" rel="noreferrer">Palácio do Planalto ↗</a>
          <span className="fine">{t(L, 'exec.limit')}</span>
        </div>
        <Link href={`/politicos/executivo/presidencia${q}`} className="pres-card a" style={{ ['--ad' as any]: '70ms' }}>
          {PRESIDENT_PHOTO
            ? <img className="exec-photo big" src={PRESIDENT_PHOTO.src} alt="Luiz Inácio Lula da Silva" loading="lazy" referrerPolicy="no-referrer" />
            : <span className="profile-photo mono" aria-hidden="true"><span>PR</span></span>}
          <span>
            <b>Luiz Inácio Lula da Silva — {t(L, 'pres.h')}</b>
            <small>{t(L, 'pres.card')}</small>
          </span>
          <span className="go">→</span>
        </Link>
        <div className="exec-blocks a" style={{ ['--ad' as any]: '110ms' }}>
          <Collapsible id="governadores" title={t(L, 'gov.h')} badge={<span className="status-tag on">{GOVERNORS.length}</span>} defaultOpen>
            <p className="sub">{t(L, 'gov.sub')}</p>
            <ul className="exec-grid">
              {GOVERNORS.map(g => {
                const photo = GOV_PHOTOS[g.uf];
                return (
                <li key={g.uf}>
                  <a className="exec-card" href={g.portal} target="_blank" rel="noreferrer">
                    {photo
                      ? <img className="exec-photo" src={photo.src} alt={g.name} loading="lazy" referrerPolicy="no-referrer" />
                      : <span className="exec-uf">{g.uf}</span>}
                    <span className="exec-who"><b>{g.name}</b><small><PartyMark party={g.party} size="sm" /> {g.party} · {g.uf}</small></span>
                  </a>
                </li>
                );
              })}
            </ul>
            <p className="fine"><a href={ELECTION_SOURCES[0].url} target="_blank" rel="noreferrer">{t(L, 'exec.election')} ↗</a></p>
          </Collapsible>
          <Collapsible id="prefeitos" title={t(L, 'may.h')} badge={<span className="status-tag on">{CAPITAL_MAYORS.length}</span>}>
            <p className="sub">{t(L, 'may.sub')}</p>
            <ul className="exec-grid">
              {CAPITAL_MAYORS.map(m => {
                const photo = MAYOR_PHOTOS[m.uf];
                return (
                <li key={m.uf}>
                  <span className="exec-card">
                    {photo
                      ? <img className="exec-photo" src={photo.src} alt={m.name} loading="lazy" referrerPolicy="no-referrer" />
                      : <span className="exec-uf">{m.uf}</span>}
                    <span className="exec-who"><b>{m.name}</b><small>{m.city} · <PartyMark party={m.party} size="sm" /> {m.party}</small></span>
                  </span>
                </li>
                );
              })}
              <li className="exec-note"><span className="exec-card as-note"><small>{t(L, 'may.df')}</small></span></li>
            </ul>
            <p className="fine"><a href={ELECTION_SOURCES[0].url} target="_blank" rel="noreferrer">{t(L, 'exec.election')} ↗</a></p>
          </Collapsible>
        </div>
        <Suspense fallback={<div className="map-loading"><span className="spinner" />…</div>}>
          <PoliticosClient
            L={L}
            labels={{
              h1: t(L, 'dir.h1'),
              sub: t(L, 'dir.sub'),
              mandates: t(L, 'dir.mandates'),
              search: t(L, 'dir.search'),
              searchPh: t(L, 'dir.searchPh'),
              clear: t(L, 'dir.clear'),
              state: t(L, 'dir.state'),
              ufAll: t(L, 'dir.uf.all'),
              party: t(L, 'dir.party'),
              partyAll: t(L, 'dir.party.all'),
              chamber: t(L, 'dir.chamber'),
              chamberAll: t(L, 'dir.chamber.all'),
              camara: t(L, 'dir.camara'),
              senate: t(L, 'today.senate'),
              loading: t(L, 'dir.loading'),
              of: t(L, 'dir.of'),
              none: t(L, 'dir.none'),
              sourcesLine: t(L, 'dir.sourcesLine'),
              failed: t(L, 'dir.failed'),
              failedSub: t(L, 'dir.failedSub'),
              retry: t(L, 'dir.retry'),
            }}
          />
        </Suspense>
      </div>
      <SiteFooter lang={L} detail={t(L, 'footer.sources')} />
    </main>
  );
}
