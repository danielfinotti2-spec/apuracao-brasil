'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GeoCollection, GeoFeature, ElectionResult, Outcome } from '@/types/geo';

const MapView = dynamic(() => import('./MapView'), { ssr: false, loading: () => <div className="map-loading"><span className="spinner" />Carregando mapa interativo…</div> });
const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
function Avatar({ c, cls }: { c?: { photoUrl?: string; name: string; color?: string }; cls: string }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [c?.photoUrl]);
  if (!c) return null;
  if (!c.photoUrl || bad) return <div className={`${cls} ph`} style={{ borderColor: c.color }}>{initials(c.name)}</div>;
  return <img className={cls} src={c.photoUrl} alt={`Foto de ${c.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
}
const unavailable = 'Dados oficiais indisponíveis no momento';
const initial: GeoCollection = { type: 'FeatureCollection', features: [] };
const offices = ['Presidente', 'Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual'];
const dataDates: Record<string, string> = { '2026-1': '4 de outubro, 2026', '2026-2': '25 de outubro, 2026', '2022-1': '2 de outubro, 2022', '2022-2': '30 de outubro, 2022' };
const format = (n?: number) => n == null ? '—' : new Intl.NumberFormat('pt-BR').format(n);
const percent = (n?: number) => n == null ? '—' : `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

export default function Dashboard() {
  const [states, setStates] = useState<GeoCollection>(initial);
  const [cities, setCities] = useState<GeoCollection>(initial);
  const [state, setState] = useState<GeoFeature | null>(null);
  const [city, setCity] = useState<GeoFeature | null>(null);
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [mapError, setMapError] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<GeoFeature[]>([]);
  const [office, setOffice] = useState('Presidente');
  const [year, setYear] = useState(2026);
  const [round, setRound] = useState(2);
  const [view, setView] = useState<'Vencedor' | 'Participação'>('Vencedor');
  const [mapOutcomes, setMapOutcomes] = useState<Record<string, Outcome>>({});
  const [listFilter, setListFilter] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(true);
  const area = city ?? state;
  const needsState = office !== 'Presidente' && !state;
  const level = state ? 'estado' : 'brasil';
  const mapData = state ? cities : states;

  useEffect(() => {
    fetch('/api/geo/states').then(async response => { if (!response.ok) throw new Error(); setStates(await response.json()); }).catch(() => setMapError('Não foi possível carregar os limites do IBGE. Verifique sua conexão e tente novamente.')).finally(() => setBusy(false));
  }, []);
  useEffect(() => {
    if (search.trim().length < 2) { setSearchResults([]); return; }
    let active = true;
    const timer = setTimeout(() => fetch(`/api/geo/search?q=${encodeURIComponent(search)}`).then(response => response.ok ? response.json() : []).then(data => { if (active) setSearchResults(data); }).catch(() => { if (active) setSearchResults([]); }), 180);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);
  useEffect(() => {
    if (!state) { setCities(initial); return; }
    let active = true; setBusy(true); setMapError('');
    fetch(`/api/geo/states/${state.properties.codarea}`).then(async response => { if (!response.ok) throw new Error(); const data = await response.json(); if (active) { setCities(data); setCity(current => current ? (data.features.find((feature: GeoFeature) => feature.properties.codarea === current.properties.codarea) ?? current) : null); } }).catch(() => { if (active) setMapError('Não foi possível carregar os limites municipais do IBGE.'); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [state]);
  useEffect(() => {
    let active = true;
    setListFilter(''); setShowAll(false);
    if (office !== 'Presidente' && !state) { setResult(null); return; }
    const load = () => fetch(`/api/results?locality=${area?.properties.codarea ?? 'br'}&uf=${state?.properties.sigla ?? 'br'}&year=${year}&office=${encodeURIComponent(office)}&round=${round}`).then(async response => { if (!response.ok) throw new Error(); return response.json(); }).then((data: ElectionResult) => { if (active) { setResult(data); const winner = data.totalizedSections ? data.candidates.slice().sort((a,b) => b.votes-a.votes)[0] : null; if (winner) setMapOutcomes(current => ({ ...current, [data.localityCode]: { color: winner.color, turnout: data.turnout } })); } }).catch(() => { if (active) setResult(null); });
    setResult(null);
    load();
    const timer = setInterval(load, 60_000);
    return () => { active = false; clearInterval(timer); };
  }, [area, state, office, round, year]);
  useEffect(() => {
    let active = true;
    setMapOutcomes({});
    const load = () => fetch(`/api/results/map?year=${year}&office=${encodeURIComponent(office)}&round=${round}`).then(response => response.ok ? response.json() : { localities: [] }).then(data => { if (active) setMapOutcomes(Object.fromEntries((data.localities ?? []).map((item: any) => [String(item.localityCode), item]))); }).catch(() => {});
    load();
    const timer = setInterval(load, 60_000);
    return () => { active = false; clearInterval(timer); };
  }, [office, round, year]);

  const selectFeature = useCallback((feature: GeoFeature) => {
    if (!state) { setState(feature); setCity(null); }
    else setCity(feature);
  }, [state]);
  const goBrazil = () => { setState(null); setCity(null); };
  const matching = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const localStates = states.features.filter(f => f.properties.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(term));
    const loadedCities = (state ? cities.features : []).filter(f => f.properties.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(term));
    return [...localStates, ...loadedCities, ...searchResults].slice(0, 8);
  }, [search, states, cities, state, searchResults]);
  const searchSelect = (feature: GeoFeature) => {
    if (String(feature.properties.codarea).length === 2) { setState(feature); setCity(null); }
    else { const ufCode = (feature.properties as any).ufCode; const parent = states.features.find(f => String(f.properties.codarea) === ufCode || String(feature.properties.codarea).startsWith(String(f.properties.codarea))); if (parent) setState(parent); setCity(feature); }
    setSearch('');
  };
  const ranked = result?.candidates?.slice().sort((a, b) => b.votes - a.votes) ?? [];
  const [first, second] = ranked;
  const others = Math.max(0, 100 - (first?.percentage ?? 0) - (second?.percentage ?? 0));
  const counted = result?.totalSections ? ((result.totalizedSections ?? 0) / result.totalSections) * 100 : 0;
  const updateAt = result?.updatedAt ?? null;
  const firstName = (name?: string) => name ? name.split(' ')[0] : '';
  const headline = needsState ? `Selecione um estado para ver ${office}` : !first ? 'Aguardando dados oficiais do TSE' : !result?.totalizedSections ? 'Aguardando totalização das seções' : `${first.name} lidera${second ? ` com ${percent(first.percentage - second.percentage).replace('%', '')} p.p. de vantagem` : ''}`;

  // Onde cada candidato lidera por mais pontos (visão Brasil, por UF).
  const leaders = useMemo(() => {
    const groups = new Map<string, { name: string; color: string; items: { sigla: string; lead: number }[] }>();
    Object.entries(mapOutcomes).filter(([code, o]) => code.length === 2 && o.candidateId && o.lead != null).forEach(([, o]) => {
      const g = groups.get(o.candidateId!) ?? { name: o.name ?? '', color: o.color, items: [] };
      g.items.push({ sigla: o.sigla ?? '', lead: o.lead! }); groups.set(o.candidateId!, g);
    });
    return Array.from(groups.values()).sort((a, b) => b.items.length - a.items.length).slice(0, 2).map(g => ({ ...g, items: g.items.sort((a, b) => b.lead - a.lead).slice(0, 6) }));
  }, [mapOutcomes]);
  const wonStates = (name: string) => Object.entries(mapOutcomes).filter(([code, o]) => code.length === 2 && o.name === name).length;

  const term = listFilter.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = ranked.filter(c => !term || `${c.name} ${c.party}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(term));
  const visible = showAll || term ? filtered : filtered.slice(0, 12);

  return <main className="app">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Apuração Brasil, início" onClick={e => { e.preventDefault(); goBrazil(); }}><span className="brand-mark"><i /><i /><i /></span><b>apuração</b></a>
      <nav className="tabs" aria-label="Cargo">{offices.map(item => <button key={item} className={office === item ? 'on' : ''} onClick={() => setOffice(item)}>{item}</button>)}</nav>
      <div className="top-meta">TSE · IBGE</div>
      <div className="top-actions">
        <div className="search-wrap"><span className="search-icon">⌕</span><input aria-label="Buscar estado ou município" placeholder="Buscar estado ou município…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setSearch(''); if (e.key === 'Enter' && matching[0]) searchSelect(matching[0]); }} />{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Limpar busca">×</button>}
          {matching.length > 0 && <div className="search-menu">{matching.map(feature => <button key={feature.properties.codarea} onClick={() => searchSelect(feature)}><span>{feature.properties.nome}<small>{String(feature.properties.codarea).length === 2 ? 'Estado' : 'Município'}</small></span><b>↗</b></button>)}</div>}</div>
        <label className="select-pill"><select aria-label="Ano" value={year} onChange={e => setYear(Number(e.target.value))}><option value={2026}>2026</option><option value={2022}>2022</option></select></label>
        <div className="seg" role="group" aria-label="Turno">{[1, 2].map(r => <button key={r} className={round === r ? 'on' : ''} onClick={() => setRound(r)}>{r}º turno</button>)}</div>
      </div>
    </header>

    <section className="scoreboard" aria-live="polite">
      <div className="who left"><Avatar c={first} cls="sb-av" /><div><h2>{first?.name ?? '—'} {first && <small style={{ color: first.color }}>{first.party}</small>}</h2></div></div>
      <div className="center">
        <div className="headline">{headline}</div>
        <div className="bar">
          <div className="seg-l" style={{ width: `${first?.percentage ?? 50}%`, background: first?.color ?? '#2a3140' }}><b>{first ? percent(first.percentage) : '—'}</b><span>{first ? `${format(first.votes)} votos` : ''}</span></div>
          {others > 0.5 && <div className="seg-o" style={{ width: `${others}%` }} />}
          <div className="seg-r" style={{ width: `${second?.percentage ?? 50}%`, background: second?.color ?? '#2a3140' }}><span>{second ? `${format(second.votes)} votos` : ''}</span><b>{second ? percent(second.percentage) : '—'}</b></div>
          <i className="half" />
        </div>
        <div className="counted"><b>{counted ? `${counted.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%` : '—'}</b> apurado · {format(result?.totalizedSections)} de {format(result?.totalSections)} seções</div>
      </div>
      <div className="who right"><div><h2>{second?.name ?? '—'} {second && <small style={{ color: second.color }}>{second.party}</small>}</h2></div><Avatar c={second} cls="sb-av" /></div>
      <div className="progress"><i style={{ width: `${counted}%` }} /></div>
    </section>

    <section className="grid">
      <aside className="panel left-panel">
        <h3>Apuração</h3>
        <p className="sub">{office} · {round}º turno · {dataDates[`${year}-${round}`]}</p>
        <div className="kpis">
          <div><span>Seções totalizadas</span><b>{format(result?.totalizedSections)}</b></div>
          <div><span>Comparecimento</span><b>{percent(result?.turnout)}</b></div>
          <div><span>Brancos</span><b>{format(result?.blankVotes)}</b></div>
          <div><span>Nulos</span><b>{format(result?.nullVotes)}</b></div>
        </div>
        <div className="divider" />
        <h3>Onde cada um lidera mais</h3>
        <p className="sub">Vantagem sobre o 2º colocado, em pontos percentuais</p>
        {leaders.length === 0 && <p className="empty-note">Sem estados totalizados ainda.</p>}
        {leaders.map(group => { const max = Math.max(...group.items.map(i => i.lead), 1); return <div className="lead-group" key={group.name}>
          <div className="lead-title"><i style={{ background: group.color }} />{firstName(group.name)} <small>{wonStates(group.name)} UFs</small></div>
          {group.items.map(item => <div className="lead-row" key={item.sigla}><span>{item.sigla}</span><div><i style={{ width: `${(item.lead / max) * 100}%`, background: group.color }} /></div><b>+{item.lead.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</b></div>)}
        </div>; })}
      </aside>

      <article className="map-card">
        <div className="map-top">
          <nav className="crumbs" aria-label="Navegação"><button onClick={goBrazil} className={!state ? 'on' : ''}>Brasil</button>{state && <><span>/</span><button className={!city ? 'on' : ''} onClick={() => setCity(null)}>{state.properties.nome}</button></>}{city && <><span>/</span><span className="on">{city.properties.nome}</span></>}</nav>
          <div className="seg small" role="group" aria-label="Modo do mapa">{(['Vencedor', 'Participação'] as const).map(item => <button key={item} onClick={() => setView(item)} className={view === item ? 'on' : ''}>{item}</button>)}</div>
        </div>
        <div className="map-frame">{busy && !mapData.features.length ? <div className="map-loading"><span className="spinner" />Carregando limites oficiais do IBGE…</div> : mapData.features.length ? <MapView data={mapData} level={level} selectedCode={city?.properties.codarea ?? state?.properties.codarea} outcomes={mapOutcomes} mode={view} onSelect={selectFeature} /> : <div className="map-error">{mapError || 'Nenhuma área geográfica disponível.'}<button onClick={() => location.reload()}>Tentar novamente</button></div>}
          {state && <button className="map-reset" onClick={goBrazil}>← Brasil</button>}
          <div className="legend">{view === 'Participação' ? 'Cor = comparecimento' : 'Cor mais forte = maior vantagem'}{ranked.slice(0, 2).map(c => <span key={c.candidateId}><i style={{ background: c.color }} />{c.party}</span>)}</div>
        </div>
      </article>

      <aside className="panel right-panel">
        <div className="r-head"><div><h3>{area ? area.properties.nome : 'Brasil'}</h3><p className="sub">{city ? `${state?.properties.nome} · ${state?.properties.sigla}` : state ? `Unidade federativa · ${state.properties.sigla}` : 'Selecione um estado no mapa'}</p></div><span className="badge">{round}º TURNO</span></div>
        {!result && needsState && <div className="results-empty"><b>Selecione um estado</b><p>Os candidatos a {office} são definidos por estado. Clique em uma UF no mapa para ver nomes, fotos e votos.</p></div>}{!result && !needsState && <div className="results-empty"><b>{unavailable}</b><p>Aguarde a resposta oficial do TSE para esta localidade, cargo e turno.</p><a href="https://resultados.tse.jus.br/oficial/app/index.html" target="_blank" rel="noreferrer">Abrir divulgação oficial do TSE ↗</a></div>}
        {result && <div className="cands">{ranked.length > 8 && <input className="list-filter" placeholder={`Buscar entre ${format(ranked.length)} candidatos…`} value={listFilter} onChange={e => setListFilter(e.target.value)} />}{visible.map(c => <div className="cand" key={c.candidateId}><span className="rank">{String(ranked.indexOf(c) + 1).padStart(2, '0')}</span><Avatar c={c} cls="cphoto" /><div className="cinfo"><b>{c.name}</b><small>{c.party}</small><div className="vbar"><i style={{ width: `${c.percentage}%`, background: c.color }} /></div></div><div className="cvote"><b>{percent(c.percentage)}</b><small>{format(c.votes)}</small></div></div>)}
          {!term && filtered.length > 12 && <button className="more" onClick={() => setShowAll(v => !v)}>{showAll ? 'Mostrar menos' : `Ver todos (${format(filtered.length)})`}</button>}{term && filtered.length === 0 && <p className="empty-note">Nenhum candidato encontrado.</p>}<div className="kpis two"><div><span>Votos válidos</span><b>{format(result.validVotes)}</b></div><div><span>Abstenções</span><b>{format(result.abstentions)}</b></div></div></div>}
        <div className="r-foot"><span>Última atualização</span><b>{updateAt ?? 'Não informada'}</b><span>✓ Fontes oficiais: TSE + IBGE</span></div>
      </aside>
    </section>
    <footer className="foot"><span>Apuração Brasil · Informação para fortalecer a democracia.</span><span className="social-links"><a href="https://www.instagram.com/euodeene" target="_blank" rel="noreferrer">Instagram @euodeene</a><a href="https://x.com/euodeene" target="_blank" rel="noreferrer">X</a><a href="https://github.com/danielfinotti2-spec" target="_blank" rel="noreferrer">GitHub</a></span></footer>
  </main>;
}
