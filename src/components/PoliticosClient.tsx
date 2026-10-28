'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import PartyMark from '@/components/PartyMark';
import type { PoliticianListResult, PoliticianSummary } from '@/types/politician';

const BRAZIL_UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function Photo({ p }: { p: PoliticianSummary }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [p.photoUrl]);
  if (!p.photoUrl || bad) {
    return <div className="pol-photo ph">{p.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>;
  }
  return <img className="pol-photo" src={p.photoUrl} alt={`Foto oficial de ${p.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
}

export type DirLabels = {
  h1: string; sub: string; mandates: string; search: string; searchPh: string; clear: string;
  state: string; ufAll: string; party: string; partyAll: string; chamber: string;
  chamberAll: string; camara: string; senate: string; loading: string; of: string; none: string;
  sourcesLine: string; failed: string; failedSub: string; retry: string;
};

export default function PoliticosClient({ L, labels }: { L: 'pt' | 'en' | 'es'; labels: DirLabels }) {
  const params = useSearchParams();
  const [data, setData] = useState<PoliticianListResult | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [uf, setUf] = useState(() => {
    const fromUrl = (params.get('uf') ?? '').toUpperCase();
    return BRAZIL_UFS.includes(fromUrl) ? fromUrl : '';
  });
  const [party, setParty] = useState('');
  const [chamber, setChamber] = useState<'' | PoliticianSummary['chamber']>('');

  useEffect(() => {
    let active = true;
    fetch('/api/politicians')
      .then(async response => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error || 'Fontes oficiais indisponíveis no momento');
        return body as PoliticianListResult;
      })
      .then(body => { if (active) setData(body); })
      .catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  const parties = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.politicians.map(p => p.party))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = strip(query.trim());
    return data.politicians.filter(p =>
      (!term || strip(p.name).includes(term)) &&
      (!uf || p.uf === uf) &&
      (!party || p.party === party) &&
      (!chamber || p.chamber === chamber),
    );
  }, [data, query, uf, party, chamber]);

  const fetchedAt = data ? new Date(data.fetchedAt).toLocaleString(L === 'en' ? 'en-US' : L === 'es' ? 'es-ES' : 'pt-BR', { timeZone: 'America/Sao_Paulo' }) : null;
  const q = L === 'pt' ? '' : `?lang=${L}`;
  const CHAMBER_LABEL: Record<PoliticianSummary['chamber'], string> = { camara: labels.camara, senado: labels.senate };

  return (
    <section className="directory">
      <div className="directory-head">
        <div>
          <h1>{labels.h1}</h1>
          <p className="sub">
            {labels.sub}
            {fetchedAt && <> {t_homeLastSyncLabel(L)}: <b>{fetchedAt}</b>.</>}
          </p>
        </div>
        {data && <span className="count-tag">{data.politicians.length} {labels.mandates}</span>}
      </div>

      <div className="filters a" style={{ ['--ad' as any]: '120ms' }} role="search">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input aria-label={labels.search} placeholder={labels.searchPh} value={query} onChange={e => setQuery(e.target.value)} />
          {query && <button className="clear-search" onClick={() => setQuery('')} aria-label={labels.clear}>×</button>}
        </div>
        <label className="select-pill"><select aria-label={labels.state} value={uf} onChange={e => setUf(e.target.value)}>
          <option value="">{labels.ufAll}</option>
          {BRAZIL_UFS.map(u => <option key={u} value={u}>{u}</option>)}
        </select></label>
        <label className="select-pill"><select aria-label={labels.party} value={party} onChange={e => setParty(e.target.value)}>
          <option value="">{labels.partyAll}</option>
          {parties.map(p => <option key={p} value={p}>{p}</option>)}
        </select></label>
        <div className="seg" role="group" aria-label={labels.chamber}>
          {([['', 'all'], ['camara', 'camara'], ['senado', 'senado']] as const).map(([value, key]) => (
            <button key={value} className={chamber === value ? 'on' : ''} onClick={() => setChamber(value)}>{key === 'all' ? labels.chamberAll : key === 'camara' ? labels.camara : labels.senate}</button>
          ))}
        </div>
      </div>

      {error && (
        <div className="directory-note">
          <b>{error}</b>
          <p>{labels.failedSub}</p>
          <button className="btn" onClick={() => location.reload()}>{labels.retry}</button>
        </div>
      )}

      {data?.failedSources.length ? (
        <div className="sync-warning" role="alert">
          <b>{labels.failed}</b>
          <ul>
            {data.failedSources.map(f => <li key={f.name}>{f.name} — <span className="err-detail">{f.error}</span></li>)}
          </ul>
        </div>
      ) : null}

      {!data && !error && <div className="map-loading"><span className="spinner" />{labels.loading}</div>}

      {data && (
        <>
          <p className="result-count" aria-live="polite">{filtered.length} {L === 'en' ? 'of' : L === 'es' ? 'de' : 'de'} {data.politicians.length} {labels.of}</p>
          <div className="pol-grid">
            {filtered.map((p, i) => (
              <Link
                key={`${p.chamber}-${p.id}`}
                className="pol-card a"
                style={{ ['--ad' as any]: `${180 + Math.min(i, 14) * 34}ms` }}
                href={`/politicos/${p.chamber}/${p.id}${q}`}
              >
                <Photo p={p} />
                <div className="pol-info">
                  <b>{p.name}</b>
                  <small className="party-line"><PartyMark party={p.party} /> {p.uf}</small>
                </div>
                <span className="house-tag">{CHAMBER_LABEL[p.chamber]}</span>
              </Link>
            ))}
            {filtered.length === 0 && <p className="empty-note">{labels.none}</p>}
          </div>
          <p className="sources-line">
            {labels.sourcesLine} {data.sources.map(s => s.name).join(', ')}
          </p>
        </>
      )}
    </section>
  );
}

function t_homeLastSyncLabel(L: 'pt' | 'en' | 'es') {
  return L === 'en' ? 'Last sync' : L === 'es' ? 'Última sincronización' : 'Última sincronização';
}
