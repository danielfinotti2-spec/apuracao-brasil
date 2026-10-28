import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fiscaliza Brasil — Transparência política com fontes oficiais',
  description: 'Portal independente de transparência política: perfis de deputados e senadores com dados oficiais, atividade do dia no Congresso e mapa da representação por estado. Cada dado exibe fonte, data de coleta e selo de verificação.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#17643a',
};

// Aplica o tema antes da pintura para evitar flash de cor.
const themeScript = `(function(){try{var t=localStorage.getItem('fb-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

// Splash de entrada (~2s): pula se já foi visto nesta sessão ou se o usuário pede movimento reduzido.
const splashScript = `(function(){try{var skip=sessionStorage.getItem('fb-splash')||window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.splash=skip?'skip':'show';sessionStorage.setItem('fb-splash','1');}catch(e){document.documentElement.dataset.splash='skip';}})();`;

const fontsHref = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650;9..144,750&family=IBM+Plex+Mono:wght@400;500&display=swap';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* carrega sem bloquear a renderização: se a rede externa falhar, o site abre com a fonte fallback */}
        <link rel="stylesheet" href={fontsHref} media="print" data-fb-fonts="1" />
        <script dangerouslySetInnerHTML={{ __html: "addEventListener('DOMContentLoaded',function(){var l=document.querySelector('link[data-fb-fonts]');if(l){l.media='all'}});" }} />
      </head>
      <body>
        <div className="splash" aria-hidden="true">
          <div className="splash-core">
            <span className="splash-mark"><i /><i /><i /></span>
            <span className="splash-name">Fiscaliza<b>Brasil</b></span>
            <span className="splash-sub">dados oficiais, nada mais</span>
            <span className="splash-bar"><span /></span>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
