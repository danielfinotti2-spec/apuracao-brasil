'use client';

import { useEffect } from 'react';
import { GeoJSON, MapContainer, ZoomControl, useMap } from 'react-leaflet';
import { geoJSON } from 'leaflet';
import type { Layer } from 'leaflet';
import type { GeoCollection, GeoFeature, Outcome } from '@/types/geo';

function FitToFeatures({ data, selectedCode }: { data: GeoCollection; selectedCode?: string }) {
  const map = useMap();
  useEffect(() => {
    const selected = data.features.find(feature => feature.properties.codarea === selectedCode);
    const bounds = selected ? geoJSON(selected as any).getBounds() : data.features.length ? geoJSON(data as any).getBounds() : null;
    if (bounds?.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: selected ? 9 : 7, animate: true });
    else map.setView([-14.2, -52.8], 4);
  }, [data, selectedCode, map]);
  return null;
}

const EMPTY_FILL = '#161b24';

export default function MapView({ data, level, selectedCode, outcomes = {}, mode = 'Vencedor', onSelect }: {
  data: GeoCollection; level: 'brasil' | 'estado'; selectedCode?: string;
  outcomes?: Record<string, Outcome>;
  mode?: 'Vencedor' | 'Participação'; onSelect: (feature: GeoFeature) => void;
}) {
  const participationColor = (value: number) => `hsl(${Math.max(0, 145 - value * 1.5)} 54% 45%)`;
  const fillFor = (code: string) => {
    const outcome = outcomes[code];
    if (!outcome) return { fillColor: EMPTY_FILL, fillOpacity: 1 };
    if (mode === 'Participação' && outcome.turnout != null) return { fillColor: participationColor(outcome.turnout), fillOpacity: 0.9 };
    // Quanto maior a margem sobre o 2º colocado, mais intensa a cor.
    const lead = Math.min(Math.max(outcome.lead ?? 10, 0), 40);
    return { fillColor: outcome.color, fillOpacity: 0.5 + (lead / 40) * 0.5 };
  };
  const style = (feature?: any) => {
    const code = String(feature?.properties?.codarea ?? '');
    const selected = code === selectedCode;
    return { color: selected ? '#ffffff' : '#07090d', weight: selected ? 2 : level === 'brasil' ? 1.2 : 0.6, opacity: 1, ...fillFor(code) };
  };
  const onEachFeature = (feature: GeoFeature, layer: Layer) => {
    const path = layer as any;
    const code = String(feature.properties.codarea);
    const outcome = outcomes[code];
    if (level === 'brasil' && feature.properties.sigla) {
      path.bindTooltip(`<span class="uf-sigla">${feature.properties.sigla}</span>${outcome?.percentage != null ? `<span class="uf-pct">${Math.round(outcome.percentage)}%</span>` : ''}`, { permanent: true, direction: 'center', className: 'uf-label', interactive: false });
    } else {
      path.bindTooltip(`<b>${feature.properties.nome}</b>${outcome?.percentage != null ? ` · ${outcome.percentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%${outcome.name ? ` ${outcome.name}` : ''}` : ''}`, { sticky: true, direction: 'top', className: 'map-tooltip' });
    }
    path.on({
      mouseover: () => path.setStyle({ weight: 2, color: '#ffffff' }),
      mouseout: () => path.setStyle(style(feature)),
      click: () => onSelect(feature),
    });
  };
  return <MapContainer center={[-14.2, -52.8]} zoom={4} minZoom={3} maxZoom={10} zoomControl={false} scrollWheelZoom attributionControl={false} className="map-canvas">
    <ZoomControl position="bottomright" />
    <FitToFeatures data={data} selectedCode={selectedCode} />
    <GeoJSON key={`${level}-${mode}-${selectedCode ?? ''}-${Object.keys(outcomes).length}-${data.features.length}`} data={data as any} style={style} onEachFeature={onEachFeature as any} />
  </MapContainer>;
}
