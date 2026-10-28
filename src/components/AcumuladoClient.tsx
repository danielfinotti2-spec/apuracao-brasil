'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PartyMark from '@/components/PartyMark';

type HistRow = { camara: string; person_id: string; propostas: number; presencas: number; desde: string };
type DirPerson = { id: string; name: string; party: string; uf: string; chamber: 'camara' | 'senado' };

export default function AcumuladoClient({ labels, langPrefix }: { labels: { title: string; sub: string; none: string; since: string; bills: string; pres: string; }; langPrefix: string }) {
  const [state, setState] = useState<{ configured: boolean; since: string | null; rows: HistRow[] } | null>(null);
  const [dir, setDir] = useState<Map<string, DirPerson>>(new Map());

  useEffect(() => {
    fetch('/api/stats/history').then(r => r.json()).then(setState).catch(() => setState({ configured: false, since: null, rows: [] }));
    fetch('/api/politicians').then(r => r.json()).then((body: { politicians?: DirPerson[] }) => {
      const m = new Map<string, DirPerson>();
      body.politicians?.forEach(p => m.set(`${p.chamber}:${p.id}`, p));
      setDir(m);
    }).catch(() => {});
  }, []);

  if (!state) return <div className="map-loading"><span className="spinner" /></div>;
  if (!state.configured || state.rows.length === 0) {
    return <p className="empty-note">{labels.none}</p>;
  }

  const pt = langPrefix.includes('es') ? 'es-ES' : langPrefix.includes('en') ? 'en-US' : 'pt-BR';

  return (
    <div>
      <p className="sub">{labels.since} <b>{new Date(`${state.since}T12:00:00`).toLocaleDateString(pt)}</b> — {labels.sub}</p>
      <table className="table rank-table">
        <thead>
          <tr><th>#</th><th>Nome</th><th>{labels.bills}</th><th className="num">{labels.pres}</th></tr>
        </thead>
        <tbody>
          {state.rows.map((r, i) => {
            const person = dir.get(`${r.camara}:${r.person_id}`);
            return (
              <tr key={`${r.camara}-${r.person_id}`}>
                <td className="num rank-pos">{i + 1}</td>
                <td>
                  {person ? (
                    <Link className="rank-name" href={`/politicos/${r.camara}/${r.person_id}${langPrefix}`}>
                      <b>{person.name}</b> <small className="party-line"><PartyMark party={person.party} /> {person.uf}</small>
                    </Link>
                  ) : `#${r.person_id}`}
                </td>
                <td className="num"><b>{r.propostas}</b></td>
                <td className="num">{r.presencas}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
