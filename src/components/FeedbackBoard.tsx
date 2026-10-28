'use client';

import { useEffect, useState } from 'react';

type Item = { id: number; kind: 'melhoria' | 'erro'; name: string; message: string; created_at: string };
export type FeedbackLabels = {
  formTitle: string; kindImprove: string; kindBug: string; namePh: string; messagePh: string;
  submit: string; sending: string; submitted: string; listTitle: string; empty: string;
  noDb: string; githubHint: string;
};

export default function FeedbackBoard({ labels, localeTag }: { labels: FeedbackLabels; localeTag: string }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [kind, setKind] = useState<'melhoria' | 'erro'>('melhoria');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch('/api/improvements')
      .then(r => r.json())
      .then(body => { setConfigured(Boolean(body.configured)); setItems(body.items ?? []); })
      .catch(() => { setConfigured(false); setItems([]); });

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await fetch('/api/improvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, name, message, website }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || 'Falha ao enviar');
      setDone(true); setMessage(''); setName('');
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="feedback-grid">
      <form className="feedback-form" onSubmit={submit}>
        <h2>{labels.formTitle}</h2>
        <div className="seg" role="group" aria-label={labels.formTitle}>
          <button type="button" className={kind === 'melhoria' ? 'on' : ''} onClick={() => setKind('melhoria')}>{labels.kindImprove}</button>
          <button type="button" className={kind === 'erro' ? 'on' : ''} onClick={() => setKind('erro')}>{labels.kindBug}</button>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={labels.namePh} maxLength={80} />
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={labels.messagePh} rows={5} required minLength={10} maxLength={1200} />
        <input className="hp" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} aria-hidden="true" />
        <button className="btn primary" disabled={busy}>{busy ? labels.sending : labels.submit}</button>
        {done && <p className="ok-note" role="status">{labels.submitted}</p>}
        {error && <p className="sync-warning" role="alert">{error}</p>}
        {configured === false && (
          <p className="fine">
            {labels.noDb} <a href="https://github.com/danielfinotti2-spec/apuracao-brasil/issues" target="_blank" rel="noreferrer">GitHub Issues</a>.
          </p>
        )}
      </form>

      <section className="feedback-list" aria-label={labels.listTitle}>
        <h2>{labels.listTitle}</h2>
        {!items ? (
          <div className="map-loading"><span className="spinner" /></div>
        ) : items.length === 0 ? (
          <p className="empty-note">{labels.empty}</p>
        ) : (
          <ul>
            {items.map(it => (
              <li key={it.id} className={`fb-item ${it.kind}`}>
                <div className="fb-head">
                  <span className={`fb-kind ${it.kind}`}>{it.kind === 'erro' ? labels.kindBug : labels.kindImprove}</span>
                  <b>{it.name || 'Anônimo'}</b>
                  <time>{new Date(it.created_at).toLocaleString(localeTag)}</time>
                </div>
                <p>{it.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
