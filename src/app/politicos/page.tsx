import { Suspense } from 'react';
import SiteHeader from '@/components/SiteHeader';
import SocialLinks from '@/components/SocialLinks';
import PoliticosClient from '@/components/PoliticosClient';

export const metadata = {
  title: 'Diretório de políticos | Fiscaliza Brasil',
  description: 'Deputados federais e senadores em exercício, com fotos oficiais, partido e estado. Dados das APIs oficiais da Câmara dos Deputados e do Senado Federal.',
};

export default function PoliticosPage() {
  return (
    <main className="site">
      <SiteHeader active="politicos" />
      <div className="site-body">
        <Suspense fallback={<div className="map-loading"><span className="spinner" />Abrindo o diretório…</div>}>
          <PoliticosClient />
        </Suspense>
      </div>
      <footer className="foot">
        <span>Fiscaliza Brasil — dados coletados das APIs oficiais e marcados com fonte e data de coleta.</span>
        <SocialLinks />
      </footer>
    </main>
  );
}
