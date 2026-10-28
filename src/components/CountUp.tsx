'use client';

import { useEffect, useRef, useState } from 'react';

/** Sobe o número até o valor real quando o dado chega. Respeita reduced-motion (mostra o valor direto). */
export default function CountUp({ value, format = 'int', locale = 'pt-BR' }: { value: number | null | undefined; format?: 'int' | 'money'; locale?: string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (value == null) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = from.current;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const k = Math.min((now - t0) / 900, 1);
      const v = start + (value - start) * (1 - Math.pow(1 - k, 3));
      from.current = v;
      setShown(v);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  if (value == null) return <>—</>;
  return <>{format === 'money' ? shown.toLocaleString(locale, { style: 'currency', currency: 'BRL' }) : Math.round(shown).toLocaleString(locale)}</>;
}
