'use client';

import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Tooltip, ZoomControl } from 'react-leaflet';
import type { CandidateResult } from '@/types/geo';
import { aggregate, type ExteriorCity } from './exterior-utils';

export default function WorldMap({ cities, candidates }: { cities: ExteriorCity[]; candidates: CandidateResult[] }) {
  const [world, setWorld] = useState<any>(null);
  useEffect(() => { fetch('/world.geojson').then(r => r.json()).then(setWorld).catch(() => setWorld(null)); }, []);
  const countries = useMemo(() => aggregate(cities, candidates), [cities, candidates]);
  const byIso = useMemo(() => new Map(countries.map(c => [c.iso, c])), [countries]);
  const maxVoters = Math.max(...cities.map(c => c.voters), 1);
  const nameOf = (id: string) => candidates.find(c => c.candidateId === id);
  const style = (feature?: any) => {
    const agg = byIso.get(feature?.id);
    const lead = agg ? Math.min(Math.max(agg.winnerPct - 50, 0) * 2 + 10, 50) : 0;
    return { color: '#07090d', weight: 0.6, fillColor: agg?.winner?.color ?? '#161b24', fillOpacity: agg?.winner ? 0.35 + (lead / 50) * 0.4 : 1 };
  };
  return <MapContainer center={[22, 5]} zoom={2} minZoom={2} maxZoom={7} zoomControl={false} worldCopyJump attributionControl={false} className="map-canvas" maxBounds={[[-85, -200], [85, 200]]}>
    <ZoomControl position="bottomright" />
    {world && <GeoJSON key={`${cities.length}-${candidates.length}`} data={world} style={style} onEachFeature={(f: any, layer: any) => {
      const agg = byIso.get(f.id);
      if (agg) layer.bindTooltip(`<b>${agg.country}</b><br/>${agg.winner?.name ?? ''} ${agg.winnerPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`, { sticky: true, className: 'map-tooltip' });
    }} />}
    {cities.map(city => {
      const top = Object.entries(city.votes).sort((a, b) => b[1] - a[1])[0];
      const winner = top ? nameOf(top[0]) : undefined;
      const total = Object.values(city.votes).reduce((s, v) => s + v, 0);
      return <CircleMarker key={city.code} center={[city.lat, city.lng]} radius={3 + 11 * Math.sqrt(city.voters / maxVoters)} pathOptions={{ color: '#ffffffcc', weight: 1, fillColor: winner?.color ?? '#8d97a8', fillOpacity: 0.9 }}>
        <Tooltip className="map-tooltip" direction="top"><b>{city.name}</b>{winner && total ? ` · ${winner.name} ${((top[1] / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : ''}<br />{city.voters.toLocaleString('pt-BR')} eleitores</Tooltip>
      </CircleMarker>;
    })}
  </MapContainer>;
}
