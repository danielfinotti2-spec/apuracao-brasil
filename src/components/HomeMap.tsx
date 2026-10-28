'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const RepresentacaoMap = dynamic(() => import('./RepresentacaoMap'), { ssr: false });

/** Busca a malha do IBGE e recebe os contadores reais por UF vindos do servidor. */
export default function HomeMap({ counts }: { counts: Record<string, number> }) {
  const [geo, setGeo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/geo/states')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('malha do IBGE indisponível'))))
      .then(data => { if (alive) setGeo(data); })
      .catch((e: Error) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, []);

  if (error) {
    return (
      <div className="rep-map-loading sync-warning" role="alert">
        <b>Mapa indisponível:</b> {error}. Os números ao lado continuam válidos.
      </div>
    );
  }

  return <RepresentacaoMap geo={geo} counts={counts} />;
}
