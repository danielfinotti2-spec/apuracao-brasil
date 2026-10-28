'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PartyMark from '@/components/PartyMark';
import type { Locale } from '@/i18n/messages';

const RepresentacaoMap = dynamic(() => import('./RepresentacaoMap'), { ssr: false });

export type MapFace = { id: string; chamber: 'camara' | 'senado'; name: string; photoUrl: string; party: string };
export type MapLabels = {
  loading: string; unavailable: string; errorFine: string;
  watchedSing: string; watchedPlur: string; faces: string; facesHint: string;
  bigCaucus: string; topParties: string; mapFine: string;
};

function FaceImg({ face }: { face: MapFace }) {
  const [bad, setBad] = useState(false);
  if (!face.photoUrl || bad) {
    return (
      <Link className="map-face ph" href={`/politicos/${face.chamber}/${face.id}`} title={face.name}>
        {face.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
      </Link>
    );
  }
  return (
    <Link className="map-face" href={`/politicos/${face.chamber}/${face.id}`} title={face.name}>
      <img src={face.photoUrl} alt={face.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />
    </Link>
  );
}

/** Mapa + painel lateral: contadores por UF e, ao passar o mouse num estado, as fotos da bancada. */
export default function MapaClient({ counts, faces, labels, lang }: { counts: Record<string, number>; faces: Record<string, MapFace[]>; labels: MapLabels; lang: Locale }) {
  const [geo, setGeo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoverUf, setHoverUf] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/geo/states')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('malha do IBGE indisponível'))))
      .then(data => { if (alive) setGeo(data); })
      .catch((e: Error) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, []);

  const topStates = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const partyCount = new Map<string, number>();
  Object.values(faces).forEach(list => list.forEach(f => partyCount.set(f.party, (partyCount.get(f.party) ?? 0) + 1)));
  const partiesTop = Array.from(partyCount.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const hoverFaces = hoverUf ? (faces[hoverUf] ?? []) : [];

  return (
    <>
      <div className="map-canvas">
        {error ? (
          <div className="rep-map-loading sync-warning" role="alert">
            <div><b>{labels.unavailable}:</b> {error}. {labels.errorFine}</div>
          </div>
        ) : (
          <RepresentacaoMap
            geo={geo}
            counts={counts}
            labels={{ watchedSing: labels.watchedSing, watchedPlur: labels.watchedPlur, loading: labels.loading }}
            onHoverUf={setHoverUf}
          />
        )}
      </div>
      <aside className="map-side a" style={{ ['--ad' as any]: '520ms' }}>
        {hoverUf ? (
          <>
            <h3>{labels.faces} — {hoverUf}</h3>
            <div className="map-faces">
              {hoverFaces.map(f => <FaceImg key={`${f.chamber}-${f.id}`} face={f} />)}
            </div>
            <p className="fine">{counts[hoverUf] ?? 0} {((counts[hoverUf] ?? 0) === 1 ? labels.watchedSing : labels.watchedPlur)} · <Link href={`/politicos?uf=${hoverUf}${lang === 'pt' ? '' : `&lang=${lang}`}`}>{lang === 'en' ? 'open filtered directory' : lang === 'es' ? 'abrir directorio filtrado' : 'abrir diretório filtrado'}</Link></p>
          </>
        ) : (
          <>
            <h3>{labels.bigCaucus}</h3>
            <ol className="top-states">
              {topStates.map(([uf, n]) => (
                <li key={uf}>
                  <Link href={`/politicos?uf=${uf}${lang === 'pt' ? '' : `&lang=${lang}`}`}>{uf}</Link>
                  <span className="state-bar"><i style={{ width: `${topStates[0] ? (n / topStates[0][1]) * 100 : 0}%` }} /></span>
                  <b>{n}</b>
                </li>
              ))}
            </ol>
            <h3>{labels.topParties}</h3>
            <ul className="top-parties">
              {partiesTop.map(([party, n]) => (
                <li key={party}><PartyMark party={party} /><b>{n}</b></li>
              ))}
            </ul>
            <p className="fine">{labels.facesHint}</p>
          </>
        )}
        <p className="fine">{labels.mapFine}</p>
      </aside>
    </>
  );
}
