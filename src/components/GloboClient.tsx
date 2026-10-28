'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import PartyMark from '@/components/PartyMark';

export type GlobeFace = { id: string; chamber: 'camara' | 'senado'; name: string; photoUrl: string | null; party: string; uf: string };

/**
 * Globo dos eleitos: fotos oficiais girando num anel 3D (CSS transforms, sem libs).
 * Pausa ao passar o mouse; respeita prefers-reduced-motion.
 */
export default function GloboClient({ faces, langPrefix }: { faces: GlobeFace[]; langPrefix: string }) {
  const axis = useRef<HTMLDivElement>(null);
  const rot = useRef(0);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (!paused.current && axis.current) {
        rot.current = (rot.current + dt * 0.012) % 360;
        axis.current.style.setProperty('--rot', `${rot.current}deg`);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const N = faces.length;
  if (!N) return null;
  const ring1 = faces.filter((_, i) => i % 2 === 0);
  const ring2 = faces.filter((_, i) => i % 2 === 1);

  const item = (f: GlobeFace, i: number, total: number, tilt: number) => {
    const a = (360 / total) * i;
    return (
      <Link
        key={`${f.chamber}-${f.id}`}
        href={`/politicos/${f.chamber}/${f.id}${langPrefix}`}
        className="globe-item"
        title={`${f.name} (${f.party}/${f.uf})`}
        style={{ ['--a' as any]: `${a}deg`, ['--tilt' as any]: `${tilt}deg` }}
      >
        {f.photoUrl ? (
          <img src={f.photoUrl} alt={f.name} loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <span className="globe-ph"><PartyMark party={f.party} size="lg" /></span>
        )}
      </Link>
    );
  };

  return (
    <div
      className="globe"
      role="img"
      aria-label="Globo com fotos oficiais dos políticos em exercício"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <div className="globe-axis tilt-a" ref={axis} style={{ ['--rot' as any]: '0deg' }}>
        {ring1.map((f, i) => item(f, i, ring1.length, 0))}
      </div>
      <div className="globe-axis tilt-b" style={{ ['--rot' as any]: '0deg' }}>
        {ring2.map((f, i) => item(f, i, ring2.length, 52))}
      </div>
      <span className="globe-core" aria-hidden="true" />
    </div>
  );
}
