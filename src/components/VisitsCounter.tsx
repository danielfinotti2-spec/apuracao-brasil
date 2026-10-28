'use client';

import { useEffect, useState } from 'react';

/** Mostra os totais agregados de visitas no rodapé; some se o banco não estiver configurado. */
export default function VisitsCounter({ label }: { label: string }) {
  const [totals, setTotals] = useState<{ today: number; month: number } | null>(null);

  useEffect(() => {
    fetch('/api/visit')
      .then(r => r.json())
      .then(d => { if (d?.configured) setTotals({ today: d.today ?? 0, month: d.month ?? 0 }); })
      .catch(() => {});
  }, []);

  if (!totals) return null;
  return (
    <span className="visits-counter" role="note">
      {label}: <b>{totals.today.toLocaleString('pt-BR')}</b> hoje · <b>{totals.month.toLocaleString('pt-BR')}</b> no mês
    </span>
  );
}
