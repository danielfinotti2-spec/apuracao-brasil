'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Destaque do dia — a proposição mais recente publicada hoje na fonte oficial.
 * Entra "parabenizando" o autor: selo que estoura e varredura de brilho, uma só vez.
 * Honesto por construção: o destaque é um FATO (mais recente), não um julgamento.
 */
export default function DestaqueMotion({ badge, title, note, children }: { badge: string; title: string; note?: React.ReactNode; children: React.ReactNode }) {
  const [celebrate, setCelebrate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = requestAnimationFrame(() => setCelebrate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={ref} className={`destaque ${celebrate ? 'celebrate' : ''}`}>
      <div className="destaque-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3.6 14.5 8.6 20.1 9.5 16.1 13.5 17.1 19.2 12 16.6 6.9 19.2 7.9 13.5 3.9 9.5 9.5 8.6 Z" />
        </svg>
        <span>{badge}</span>
      </div>
      <div className="destaque-body">
        <h2>{title}</h2>
        {children}
        {note && <p className="destaque-note">{note}</p>}
      </div>
      {celebrate && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <i key={i} style={{ ['--x' as any]: `${(i - 6.5) * 9}px`, ['--r' as any]: `${(i % 2 === 0 ? 1 : -1) * (40 + (i % 5) * 22)}deg`, ['--d' as any]: `${(i % 4) * 45}ms` }} />
          ))}
        </div>
      )}
    </div>
  );
}
