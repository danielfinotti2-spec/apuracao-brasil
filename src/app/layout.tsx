import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apuração Brasil | Eleições 2026',
  description: 'Acompanhe a apuração eleitoral brasileira com dados territoriais do IBGE e resultados oficiais do TSE.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
