'use client';

import { useEffect, useState } from 'react';

/**
 * Seção dobrável com abertura animada (grid-rows 0fr → 1fr, sem libs).
 * Começa fechada por padrão para a página não ficar gigante; reduced-motion abre direto.
 */
export default function Collapsible({ id, title, badge, defaultOpen = false, children }: {
  id: string; title: React.ReactNode; badge?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setOpen(true);
  }, []);

  return (
    <section className={`profile-section coll ${open ? 'open' : ''}`} id={id}>
      <h2>
        <button
          className="coll-head"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen(v => !v)}
        >
          <span className="coll-title">{title}</span>
          {badge}
          <svg className="coll-chevron" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </h2>
      <div className="coll-panel" id={`${id}-panel`} role="region" aria-hidden={!open}>
        <div className="coll-inner">
          {children}
        </div>
      </div>
    </section>
  );
}
