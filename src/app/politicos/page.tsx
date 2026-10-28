import SiteHeader from '@/components/SiteHeader';
import PoliticosClient from '@/components/PoliticosClient';

export const metadata = {
  title: 'Diretório de políticos | Fiscaliza Brasil',
  description: 'Deputados federais e senadores em exercício, com fotos oficiais, partido e estado. Dados das APIs oficiais da Câmara dos Deputados e do Senado Federal.',
};

export default function PoliticosPage() {
  return (
    <main className="site">
      <SiteHeader />
      <PoliticosClient />
      <footer className="foot">
        <span>Fiscaliza Brasil · dados coletados das APIs oficiais e marcados com fonte e data de coleta.</span>
        <span className="social-links">
          <a href="https://www.instagram.com/euodeene" target="_blank" rel="noreferrer">Instagram @euodeene</a>
          <a href="https://x.com/euodeene" target="_blank" rel="noreferrer">X</a>
          <a href="https://github.com/danielfinotti2-spec" target="_blank" rel="noreferrer">GitHub</a>
        </span>
      </footer>
    </main>
  );
}
