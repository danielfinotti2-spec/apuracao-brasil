'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { PoliticianListResult, PoliticianSummary } from '@/types/politician';

const BRAZIL_UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const CHAMBER_LABEL: Record<PoliticianSummary['chamber'], string> = { camara: 'Câmara', senado: 'Senado' };

function Photo({ p }: { p: PoliticianSummary }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [p.photoUrl]);
  if (!p.photoUrl || bad) {
    return <div className="pol-photo ph">{p.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>;
  }
  return <img className="pol-photo" src={p.photoUrl} alt={`Foto oficial de ${p.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
}

export default function PoliticosClient() {
  const [data, setData] = useState<PoliticianListResult | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [uf, setUf] = useState('');
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

  const fetchedAt = data ? new Date(data.fetchedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : null;

  return (
    <section className="directory">
      <div className="directory-head">
        <div>
          <h1>Diretório de políticos</h1>
          <p className="sub">
            Deputados federais e senadores em exercício.
            {fetchedAt && <> Última sincronização: <b>{fetchedAt}</b> (horário de Brasília).</>}
          </p>
        </div>
        {data && <span className="count-tag">{data.politicians.length} mandatos em exercício</span>}
      </div>

      <div className="filters" role="search">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input aria-label="Buscar político por nome" placeholder="Buscar por nome…" value={query} onChange={e => setQuery(e.target.value)} />
          {query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Limpar busca">×</button>}
        </div>
        <label className="select-pill"><select aria-label="Estado" value={uf} onChange={e => setUf(e.target.value)}>
          <option value="">UF: todas</option>
          {BRAZIL_UFS.map(u => <option key={u} value={u}>{u}</option>)}
        </select></label>
        <label className="select-pill"><select aria-label="Partido" value={party} onChange={e => setParty(e.target.value)}>
          <option value="">Partido: todos</option>
          {parties.map(p => <option key={p} value={p}>{p}</option>)}
        </select></label>
        <div className="seg" role="group" aria-label="Casa legislativa">
          {([['', 'Todas'], ['camara', 'Câmara'], ['senado', 'Senado']] as const).map(([value, label]) => (
            <button key={value} className={chamber === value ? 'on' : ''} onClick={() => setChamber(value)}>{label}</button>
          ))}
        </div>
      </div>

      {error && (
        <div className="directory-note">
          <b>{error}</b>
          <p>O portal só exibe o que as fontes oficiais publicam. Tente novamente em instantes.</p>
          <button className="btn" onClick={() => location.reload()}>Tentar novamente</button>
        </div>
      )}

      {data?.failedSources.length ? (
        <div className="sync-warning" role="alert">
          <b>Fontes indisponíveis nesta sincronização:</b>
          <ul>
            {data.failedSources.map(f => <li key={f.name}>{f.name} — <span className="err-detail">{f.error}</span></li>)}
          </ul>
        </div>
      ) : null}

      {!data && !error && <div className="map-loading"><span className="spinner" />Consultando as APIs oficiais da Câmara e do Senado…</div>}

      {data && (
        <>
          <p className="result-count" aria-live="polite">{filtered.length} de {data.politicians.length} políticos</p>
          <div className="pol-grid">
            {filtered.map(p => (
              <Link key={`${p.chamber}-${p.id}`} className="pol-card" href={`/politicos/${p.chamber}/${p.id}`}>
                <Photo p={p} />
                <div className="pol-info">
                  <b>{p.name}</b>
                  <small>{CHAMBER_LABEL[p.chamber]} — {p.party} / {p.uf}</small>
                </div>
                <span className="house-tag">{CHAMBER_LABEL[p.chamber]}</span>
              </Link>
            ))}
            {filtered.length === 0 && <p className="empty-note">Nenhum político encontrado com esses filtros.</p>}
          </div>
          <p className="sources-line">
            Fontes: {data.sources.map(s => s.name).join(' e ')}. Cada perfil lista as URLs exatas consultadas.
          </p>
        </>
      )}
    </section>
  );
}
