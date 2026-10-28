'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GeoCollection, GeoFeature, ElectionResult, Outcome } from '@/types/geo';
import Avatar from './Avatar';
import { AlertBanner, FeedDrawer, useAlerts } from './Alerts';
import { aggregate, type ExteriorCity } from './exterior-utils';

const WorldMap = dynamic(() => import('./WorldMap'), { ssr: false, loading: () => <div className="map-loading"><span className="spinner" />Carregando mapa-múndi…</div> });
type ExteriorData = { total: ElectionResult; cities: ExteriorCity[]; totalCities: number; unmatched: string[] };

// Anima os números do placar até o valor novo.
function useCountUp(target?: number) {
  const [value, setValue] = useState(target ?? 0);
  const from = useRef(target ?? 0);
  useEffect(() => {
    if (target == null) return;
    const start = from.current, t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => { const k = Math.min((now - t0) / 800, 1); const v = start + (target - start) * (1 - Math.pow(1 - k, 3)); from.current = v; setValue(v); if (k < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

const MapView = dynamic(() => import('./MapView'), { ssr: false, loading: () => <div className="map-loading"><span className="spinner" />Carregando mapa interativo…</div> });
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
  const [resultError, setResultError] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<GeoFeature[]>([]);
  const [office, setOffice] = useState('Presidente');
  const [year, setYear] = useState(2026);
  const [round, setRound] = useState(2);
  const [view, setView] = useState<'Vencedor' | 'Participação'>('Vencedor');
  const [mapOutcomes, setMapOutcomes] = useState<Record<string, Outcome>>({});
  const [scope, setScope] = useState<'brasil' | 'exterior'>('brasil');
  const [exterior, setExterior] = useState<ExteriorData | null>(null);
  const [feedOpen, setFeedOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [photos, setPhotos] = useState<Record<string, string>>({});
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
    if (scope === 'exterior') return;
    let active = true;
    setListFilter(''); setShowAll(false);
    if (office !== 'Presidente' && !state) { setResult(null); return; }
    const load = () => fetch(`/api/results?locality=${area?.properties.codarea ?? 'br'}&uf=${state?.properties.sigla ?? 'br'}&year=${year}&office=${encodeURIComponent(office)}&round=${round}`).then(async response => { if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || 'Dados indisponíveis'); } return response.json(); }).then((data: ElectionResult) => { if (active) { setResultError(''); setResult(data); const winner = data.totalizedSections ? data.candidates.slice().sort((a,b) => b.votes-a.votes)[0] : null; if (winner) setMapOutcomes(current => ({ ...current, [data.localityCode]: { ...current[data.localityCode], color: winner.color, turnout: data.turnout } })); } }).catch((e: Error) => { if (active) { setResult(null); setResultError(e.message); } });
    setResult(null); setResultError('');
    load();
    const timer = setInterval(load, 60_000);
    return () => { active = false; clearInterval(timer); };
  }, [area, state, office, round, year, scope]);
  useEffect(() => {
    if (scope !== 'exterior') return;
    let active = true;
    setExterior(null); setResult(null); setResultError('');
    const load = () => fetch(`/api/results/exterior?year=${year}&round=${round}`).then(async response => { if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || 'Dados do exterior indisponíveis'); } return response.json(); }).then((data: ExteriorData) => { if (active) { setExterior(data); setResult(data.total); setResultError(''); } }).catch((e: Error) => { if (active) setResultError(e.message); });
    load();
    const timer = setInterval(load, 60_000);
    return () => { active = false; clearInterval(timer); };
  }, [scope, year, round]);
  useEffect(() => { if (result?.candidates) setPhotos(current => ({ ...Object.fromEntries(result.candidates.filter(c => c.photoUrl).map(c => [c.candidateId, c.photoUrl!])), ...current })); }, [result]);
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
  const shownFirst = useCountUp(first?.percentage);
  const shownSecond = useCountUp(second?.percentage);
  const stateNames = useMemo(() => Object.fromEntries(states.features.map(f => [f.properties.codarea, f.properties.nome])), [states]);
  const { alerts, banner } = useAlerts({ outcomes: mapOutcomes, national: scope === 'brasil' && office === 'Presidente' && !state ? result : null, names: stateNames, resetKey: `${year}-${office}-${round}` });
  const countries = useMemo(() => exterior ? aggregate(exterior.cities, exterior.total.candidates) : [], [exterior]);
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
      <Link className="brand" href="/" aria-label="Fiscaliza Brasil, início"><span className="brand-mark"><i /><i /><i /></span><span className="brand-text">Fiscaliza<b>Brasil</b></span></Link>
      <div className="seg" role="group" aria-label="Escopo">{(['brasil', 'exterior'] as const).map(item => <button key={item} className={scope === item ? 'on' : ''} onClick={() => { if (item === 'exterior') { setOffice('Presidente'); goBrazil(); } setScope(item); }}>{item === 'brasil' ? 'Brasil' : 'Exterior'}</button>)}</div>
      <nav className="tabs" aria-label="Cargo">{offices.map(item => <button key={item} className={office === item ? 'on' : ''} onClick={() => { setOffice(item); if (item !== 'Presidente') setScope('brasil'); }}>{item}</button>)}</nav>
      <div className="top-meta">TSE + IBGE</div>
      <div className="top-actions">
        <button className={`feed-btn ${feedOpen ? 'on' : ''}`} onClick={() => { setFeedOpen(v => !v); setSeen(alerts.length); }}><span className="live-dot" />Avisos{!feedOpen && alerts.length > seen && <em>{alerts.length - seen}</em>}</button>
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
          <div className="seg-l" style={{ width: `${first?.percentage ?? 50}%`, background: first?.color ?? '#2a3140' }}><b>{first ? percent(shownFirst) : '—'}</b><span>{first ? `${format(first.votes)} votos` : ''}</span></div>
          {others > 0.5 && <div className="seg-o" style={{ width: `${others}%` }} />}
          <div className="seg-r" style={{ width: `${second?.percentage ?? 50}%`, background: second?.color ?? '#2a3140' }}><span>{second ? `${format(second.votes)} votos` : ''}</span><b>{second ? percent(shownSecond) : '—'}</b></div>
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
        <p className="sub">{office} · {result?.round ?? round}º turno{result?.fellBack ? ' (este cargo não tem 2º turno aqui)' : ` · ${dataDates[`${year}-${round}`]}`}</p>
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
          {scope === 'exterior' ? <nav className="crumbs"><button onClick={() => setScope('brasil')}>Brasil</button><span>/</span><span className="on">Exterior</span></nav> : <nav className="crumbs" aria-label="Navegação"><button onClick={goBrazil} className={!state ? 'on' : ''}>Brasil</button>{state && <><span>/</span><button className={!city ? 'on' : ''} onClick={() => setCity(null)}>{state.properties.nome}</button></>}{city && <><span>/</span><span className="on">{city.properties.nome}</span></>}</nav>}
          {scope === 'brasil' && <div className="seg small" role="group" aria-label="Modo do mapa">{(['Vencedor', 'Participação'] as const).map(item => <button key={item} onClick={() => setView(item)} className={view === item ? 'on' : ''}>{item}</button>)}</div>}
        </div>
        <div className="map-frame">{scope === 'exterior' ? (exterior ? <WorldMap cities={exterior.cities} candidates={exterior.total.candidates} /> : resultError ? <div className="map-error">{resultError}</div> : <div className="map-loading"><span className="spinner" />Carregando votos no exterior…</div>) : busy && !mapData.features.length ? <div className="map-loading"><span className="spinner" />Carregando limites oficiais do IBGE…</div> : mapData.features.length ? <MapView data={mapData} level={level} selectedCode={city?.properties.codarea ?? state?.properties.codarea} outcomes={mapOutcomes} mode={view} onSelect={selectFeature} /> : <div className="map-error">{mapError || 'Nenhuma área geográfica disponível.'}<button onClick={() => location.reload()}>Tentar novamente</button></div>}
          <AlertBanner alert={banner} states={states} photos={photos} />
          {state && <button className="map-reset" onClick={goBrazil}>← Brasil</button>}
          <div className="legend">{scope === 'exterior' ? 'Círculo = nº de eleitores' : view === 'Participação' ? 'Cor = comparecimento' : 'Cor mais forte = maior vantagem'}{ranked.slice(0, 2).map(c => <span key={c.candidateId}><i style={{ background: c.color }} />{c.party}</span>)}</div>
        </div>
      </article>

      <aside className="panel right-panel">
        <div className="r-head"><div><h3>{scope === 'exterior' ? 'Exterior' : area ? area.properties.nome : 'Brasil'}</h3><p className="sub">{scope === 'exterior' ? `${format(exterior?.cities.length)} cidades no mapa · ${format(result?.totalizedSections)} seções` : city ? `${state?.properties.nome} · ${state?.properties.sigla}` : state ? `Unidade federativa · ${state.properties.sigla}` : 'Selecione um estado no mapa'}</p></div><span className="badge">{result?.round ?? round}º TURNO</span></div>
        {!result && needsState && <div className="results-empty"><b>Selecione um estado</b><p>Os candidatos a {office} são definidos por estado. Clique em uma UF no mapa para ver nomes, fotos e votos.</p></div>}{!result && !needsState && <div className="results-empty"><b>{unavailable}</b><p>Aguarde a resposta oficial do TSE para esta localidade, cargo e turno.</p>{resultError && <p className="err-detail">{resultError}</p>}<a href="https://resultados.tse.jus.br/oficial/app/index.html" target="_blank" rel="noreferrer">Abrir divulgação oficial do TSE ↗</a></div>}
        {result && scope === 'exterior' && <div className="cands">
          {ranked.slice(0, 3).map(c => <div className="cand" key={c.candidateId}><Avatar c={c} cls="cphoto" /><div className="cinfo"><b>{c.name}</b><small>{c.party}</small><div className="vbar"><i style={{ width: `${c.percentage}%`, background: c.color }} /></div></div><div className="cvote"><b>{percent(c.percentage)}</b><small>{format(c.votes)}</small></div></div>)}
          <div className="section-title"><span>Por país</span><span>{countries.length} países</span></div>
          {countries.map(c => <div className="country" key={c.iso}><span className="iso" style={{ background: c.winner?.color ?? '#2a3140' }}>{c.iso}</span><div className="cinfo"><b>{c.country}</b><small>{c.cities} {c.cities === 1 ? 'cidade' : 'cidades'} · {format(c.voters)} eleitores</small></div><div className="cwin"><Avatar c={c.winner} cls="mini-av" /><b style={{ color: c.winner?.color }}>{c.winnerPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</b></div></div>)}
          {exterior && exterior.unmatched.length > 0 && <p className="empty-note">{exterior.unmatched.length} cidades sem coordenada no mapa (já contam no total acima).</p>}
        </div>}
        {result && scope === 'brasil' && <div className="cands">{ranked.length > 8 && <input className="list-filter" placeholder={`Buscar entre ${format(ranked.length)} candidatos…`} value={listFilter} onChange={e => setListFilter(e.target.value)} />}{visible.map(c => <div className="cand" key={c.candidateId}><span className="rank">{String(ranked.indexOf(c) + 1).padStart(2, '0')}</span><Avatar c={c} cls="cphoto" /><div className="cinfo"><b>{c.name}</b><small>{c.party}</small><div className="vbar"><i style={{ width: `${c.percentage}%`, background: c.color }} /></div></div><div className="cvote"><b>{percent(c.percentage)}</b><small>{format(c.votes)}</small></div></div>)}
          {!term && filtered.length > 12 && <button className="more" onClick={() => setShowAll(v => !v)}>{showAll ? 'Mostrar menos' : `Ver todos (${format(filtered.length)})`}</button>}{term && filtered.length === 0 && <p className="empty-note">Nenhum candidato encontrado.</p>}<div className="kpis two"><div><span>Votos válidos</span><b>{format(result.validVotes)}</b></div><div><span>Abstenções</span><b>{format(result.abstentions)}</b></div></div></div>}
        <div className="r-foot"><span>Última atualização</span><b>{updateAt ?? 'Não informada'}</b><span>✓ Fontes oficiais: TSE + IBGE</span></div>
      </aside>
    </section>
    <footer className="foot"><span>Fiscaliza Brasil · Informação para fortalecer a democracia.</span><span className="social-links"><a href="https://www.instagram.com/euodeene" target="_blank" rel="noreferrer">Instagram @euodeene</a><a href="https://x.com/euodeene" target="_blank" rel="noreferrer">X</a><a href="https://github.com/danielfinotti2-spec" target="_blank" rel="noreferrer">GitHub</a></span></footer>
  <FeedDrawer alerts={alerts} open={feedOpen} onClose={() => { setFeedOpen(false); setSeen(alerts.length); }} />
  </main>;
}
