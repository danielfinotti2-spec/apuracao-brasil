'use client';

import { useEffect, useState } from 'react';

export type ScandalItem = {
  id: number; title: string; summary: string; evidence_url: string; evidence_name: string;
  persons: { name: string; role: string }[]; created_at: string;
};

export type ScandalLabels = {
  eyebrow: string; empty: string; evidence: string; innocent: string; caseSeal: string;
};

const initial = { configured: null as boolean | null, items: [] as ScandalItem[] };

export default function EscandaloDoDia({ labels, langPrefix }: { labels: ScandalLabels; langPrefix: string }) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    let alive = true;
    fetch('/api/scandals')
      .then(r => r.json())
      .then(body => { if (alive) setState({ configured: Boolean(body.configured), items: body.items ?? [] }); })
      .catch(() => { if (alive) setState({ configured: false, items: [] }); });
    const t = setInterval(() => {
      fetch('/api/scandals').then(r => r.json()).then(body => {
        if (alive) setState({ configured: Boolean(body.configured), items: body.items ?? [] });
      }).catch(() => {});
    }, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const top = state.items[0];

  // Sem caso registrado: o bloco simplesmente some (nada de placeholder).
  if (!top) return null;

  return (
    <section className="scandal a" style={{ ['--ad' as any]: '380ms' }} aria-label={labels.eyebrow}>
      <span className="scandal-eyebrow">{labels.eyebrow}</span>
      <div className="scandal-body">
          <h2>{top.title}</h2>
          <p>{top.summary}</p>
          {top.persons?.length > 0 && (
            <ul className="scandal-persons">
              {top.persons.map((p, i) => (
                <li key={i}><b>{p.name}</b> <small>{p.role}</small> <span className="scandal-seal">{labels.caseSeal}</span></li>
              ))}
            </ul>
          )}
          <p className="scandal-foot">
            <a href={top.evidence_url} target="_blank" rel="noreferrer">{top.evidence_name || labels.evidence} ↗</a>
            <small>{labels.innocent}</small>
          </p>
      </div>
    </section>
  );
}
