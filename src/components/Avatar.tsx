'use client';

import { useEffect, useState } from 'react';

const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export default function Avatar({ c, cls }: { c?: { photoUrl?: string; name: string; color?: string }; cls: string }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [c?.photoUrl]);
  if (!c) return null;
  if (!c.photoUrl || bad) return <div className={`${cls} ph`} style={{ borderColor: c.color }}>{initials(c.name)}</div>;
  return <img className={cls} src={c.photoUrl} alt={`Foto de ${c.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} />;
}
