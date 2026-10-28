import Dashboard from '@/components/Dashboard';

export const metadata = {
  title: 'Apuração eleitoral | Fiscaliza Brasil',
  description: 'Mapa de apuração com malhas territoriais do IBGE e resultados oficiais publicados pelo TSE, por cargo, turno, estado, município e voto no exterior.',
};

export default function ApuracaoPage() {
  return <Dashboard />;
}
