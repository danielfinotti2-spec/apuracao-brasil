'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/** Dispara o contador de visitas agregado a cada mudança de rota (sem dados pessoais). */
export default function VisitBeacon() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => { /* contagem é best-effort: nunca atrapalha a navegação */ });
  }, [pathname]);

  return null;
}
