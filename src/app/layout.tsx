import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fiscaliza Brasil — Transparência política com fontes oficiais',
  description: 'Portal independente de transparência política: perfis de deputados e senadores com dados oficiais, atividade do dia no Congresso e mapa da representação por estado. Cada dado exibe fonte, data de coleta e selo de verificação.',
};

// Aplica o tema antes da pintura para evitar flash de cor.
const themeScript = `(function(){try{var t=localStorage.getItem('fb-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
