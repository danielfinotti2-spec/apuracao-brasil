import { Suspense } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PoliticosClient from '@/components/PoliticosClient';
import { pickLang, t } from '@/i18n/messages';

export const metadata = {
  title: 'Diretório de políticos | Fiscaliza Brasil',
  description: 'Deputados federais e senadores em exercício, com fotos oficiais, partido e estado. Dados das APIs oficiais da Câmara dos Deputados e do Senado Federal.',
};

export default async function PoliticosPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  return (
    <main className="site">
      <SiteHeader active="politicos" lang={L} />
      <div className="site-body">
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
