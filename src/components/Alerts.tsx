'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Avatar from './Avatar';
import type { ElectionResult, GeoCollection, Outcome } from '@/types/geo';

export type Alert = { id: number; time: string; kind: 'estado' | 'virada' | 'progresso' | 'info'; title: string; text: string; color: string; code?: string; candidateId?: string; name?: string };
type Draft = Omit<Alert, 'id' | 'time'>;
const MILESTONES = [10, 25, 50, 75, 90, 100];
const pct = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

// Gera avisos a partir de mudanças reais nos dados do TSE (nenhum texto é inventado).
export function useAlerts({ outcomes, national, names, resetKey }: { outcomes: Record<string, Outcome>; national: ElectionResult | null; names: Record<string, string>; resetKey: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [banner, setBanner] = useState<Alert | null>(null);
  const prev = useRef<Record<string, Outcome> | null>(null);
  const prevNat = useRef<{ leader: string; counted: number } | null>(null);
  const queue = useRef<Alert[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const next = useCallback(() => {
    const item = queue.current.shift() ?? null;
    setBanner(item);
    timer.current = item ? setTimeout(next, 7000) : null;
  }, []);
  const push = useCallback((drafts: Draft[], showBanner = true) => {
    if (!drafts.length) return;
    const time = new Date().toLocaleTimeString('pt-BR');
    const full = drafts.map(d => ({ ...d, id: ++seq.current, time }));
    setAlerts(list => [...full.slice().reverse(), ...list].slice(0, 80));
    if (showBanner) {
      queue.current.push(...full.sort((a, b) => Number(b.kind === 'virada') - Number(a.kind === 'virada')).slice(0, 4));
      queue.current = queue.current.slice(-6);
      if (!timer.current) next();
    }
  }, [next]);

  useEffect(() => { prev.current = null; prevNat.current = null; queue.current = []; setAlerts([]); }, [resetKey]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    const cur: Record<string, Outcome> = {};
    Object.entries(outcomes).forEach(([code, o]) => { if (code.length === 2 && o.candidateId && o.name) cur[code] = o; });
    const codes = Object.keys(cur);
    if (!codes.length) { prev.current = null; return; }
    if (!prev.current) {
      prev.current = cur;
      const count = new Map<string, { n: number; color: string }>();
      codes.forEach(c => { const o = cur[c]; count.set(o.name!, { n: (count.get(o.name!)?.n ?? 0) + 1, color: o.color }); });
      const ranking = Array.from(count.entries()).sort((a, b) => b[1].n - a[1].n);
      push([{ kind: 'info', title: `${codes.length} estados com resultado`, text: ranking.map(([name, v]) => `${name.split(' ')[0]} lidera em ${v.n}`).join(' · '), color: ranking[0][1].color }], false);
      return;
    }
    const drafts: Draft[] = [];
    codes.forEach(code => {
      const o = cur[code], p = prev.current![code], place = names[code] ?? o.sigla ?? code;
      const base = { color: o.color, code, candidateId: o.candidateId, name: o.name };
      if (!p) drafts.push({ ...base, kind: 'estado', title: `${o.name!.split(' ')[0]} lidera em ${place}`, text: `${pct(o.percentage ?? 0)} dos votos válidos, ${(o.lead ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p. à frente.` });
      else if (p.candidateId !== o.candidateId) drafts.push({ ...base, kind: 'virada', title: `Virada em ${place}`, text: `${o.name} passou à frente de ${p.name ?? 'quem liderava'} (${pct(o.percentage ?? 0)}).` });
    });
    prev.current = cur;
    push(drafts);
  }, [outcomes, names, push]);

  useEffect(() => {
    if (!national?.totalizedSections || !national.totalSections) return;
    const ranked = national.candidates.slice().sort((a, b) => b.votes - a.votes);
    const [a, b] = ranked;
    if (!a) return;
    const counted = (national.totalizedSections / national.totalSections) * 100;
    const p = prevNat.current;
    prevNat.current = { leader: a.candidateId, counted };
    const summary = `${a.name.split(' ')[0]} ${pct(a.percentage)}${b ? ` · ${b.name.split(' ')[0]} ${pct(b.percentage)}` : ''}`;
    if (!p) { push([{ kind: 'info', title: `Apuração em ${pct(counted)}`, text: `${a.name} lidera. ${summary}.`, color: a.color, candidateId: a.candidateId, name: a.name }], false); return; }
    const drafts: Draft[] = [];
    if (p.leader !== a.candidateId) drafts.push({ kind: 'virada', title: `${a.name.split(' ')[0]} assume a liderança`, text: `Virada na apuração nacional. ${summary}.`, color: a.color, candidateId: a.candidateId, name: a.name });
    MILESTONES.filter(m => p.counted < m && counted >= m).forEach(m => drafts.push({ kind: 'progresso', title: `${m}% das seções apuradas`, text: summary, color: a.color, candidateId: a.candidateId, name: a.name }));
    push(drafts);
  }, [national, push]);

  return { alerts, banner };
}

function MiniBrazil({ states, highlight, color }: { states: GeoCollection; highlight?: string; color: string }) {
  const { paths, box } = useMemo(() => {
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    const k = Math.cos((14 * Math.PI) / 180);
    const ring = (r: number[][]) => r.map(([lng, lat], i) => { const x = lng * k, y = -lat; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); return `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`; }).join('') + 'Z';
    const list = states.features.map(f => {
      const g: any = f.geometry;
      const polys: number[][][][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      return { code: f.properties.codarea, d: polys.map(poly => poly.map(ring).join('')).join('') };
    });
    return { paths: list, box: `${minX - 1} ${minY - 1} ${maxX - minX + 2} ${maxY - minY + 2}` };
  }, [states]);
  return <svg className="mini-br" viewBox={box} aria-hidden="true">{paths.map(p => <path key={p.code} d={p.d} className={p.code === highlight ? 'hl' : ''} style={p.code === highlight ? { fill: color } : undefined} />)}</svg>;
}

const LABEL: Record<Alert['kind'], string> = { estado: 'AO VIVO', virada: 'VIRADA', progresso: 'APURAÇÃO', info: 'RESUMO' };

export function AlertBanner({ alert, states, photos }: { alert: Alert | null; states: GeoCollection; photos: Record<string, string> }) {
  if (!alert) return null;
  const photoUrl = alert.candidateId ? photos[alert.candidateId] : undefined;
  return <div className="banner" key={alert.id} style={{ ['--c' as any]: alert.color }} role="status">
    <span className="banner-tag">{LABEL[alert.kind]}</span>
    {alert.name && <Avatar c={{ name: alert.name, photoUrl, color: alert.color }} cls="banner-av" />}
    {alert.code && states.features.length > 0 && <MiniBrazil states={states} highlight={alert.code} color={alert.color} />}
    <div className="banner-text"><div className="banner-title">{alert.title}</div><small>{alert.text}</small></div>
    <time>{alert.time}</time>
  </div>;
}

export function FeedDrawer({ alerts, open, onClose }: { alerts: Alert[]; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <aside className="feed" aria-label="Avisos ao vivo">
    <div className="feed-head"><b>Avisos ao vivo</b><span className="live"><i />tempo real</span><button onClick={onClose} aria-label="Fechar avisos">×</button></div>
    <div className="feed-list">
      {alerts.length === 0 && <p className="feed-empty">Os avisos aparecem aqui quando um estado for apurado, houver virada ou a apuração passar de 10%, 25%, 50%…</p>}
      {alerts.map(a => <div className={`feed-item ${a.kind}`} key={a.id}><i style={{ background: a.color }} /><div><b>{a.title}</b><span>{a.text}</span></div><time>{a.time}</time></div>)}
    </div>
    <div className="feed-foot">Avisos automáticos gerados a partir dos dados do TSE.</div>
  </aside>;
}
