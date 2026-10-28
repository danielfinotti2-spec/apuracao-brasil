'use client';

import { GeoJSON, MapContainer } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

// Mapa institucional reaproveitado da apuração: pinta as UFs pelo número de
// parlamentares monitorados no diretório (dado real do portal, não eleitoral).
// Clique numa UF abre o diretório já filtrado.

const RAMP = ['#e0e9e1', '#b3d3ba', '#7cb68a', '#3f9261', '#17643a'];

function rampFor(count: number, max: number) {
  if (max <= 0 || count <= 0) return RAMP[0];
  const t = Math.min(1, count / max);
  return RAMP[Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))];
}

export default function RepresentacaoMap({ geo, counts }: { geo: any; counts: Record<string, number> }) {
  const router = useRouter();
  const max = Math.max(0, ...Object.values(counts));

  const styleFor = (feature: any) => ({
    fillColor: rampFor(counts[feature?.properties?.sigla] ?? 0, max || 1),
    fillOpacity: 0.92,
    color: 'var(--paper, #f4f4f1)',
    weight: 1.4,
  });

  const onEach = (feature: any, layer: any) => {
    const sigla = feature?.properties?.sigla ?? '';
    const nome = feature?.properties?.nome ?? sigla;
    const total = counts[sigla] ?? 0;
    layer.bindTooltip(
      `<b>${nome}</b><br/>${total} parlamentar${total === 1 ? '' : 'es'} monitorado${total === 1 ? '' : 's'}`,
      { sticky: true, direction: 'top', className: 'rep-tip' },
    );
    layer.on({
      mouseover: () => layer.setStyle({ weight: 2.2, fillOpacity: 1, color: '#146c43' }),
      mouseout: () => layer.setStyle(styleFor(feature)),
      click: () => router.push(`/politicos?uf=${sigla}`),
    });
  };

  if (!geo) {
    return <div className="rep-map-loading" role="status">Carregando malha oficial do IBGE…</div>;
  }

  return (
    <MapContainer
      className="rep-map"
      center={[-14.5, -52.5]}
      zoom={4.1}
      minZoom={3.4}
      maxZoom={6}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
      dragging={true}
      doubleClickZoom={true}
    >
      <GeoJSON data={geo} style={styleFor} onEachFeature={onEach} />
    </MapContainer>
  );
}
