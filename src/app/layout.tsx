import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fiscaliza Brasil — Transparência política com fontes oficiais',
  description: 'Portal independente de transparência política: perfis de deputados e senadores com dados oficiais, e mapa de apuração eleitoral do TSE com malhas do IBGE. Cada dado exibe fonte, data de coleta e selo de verificação.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
