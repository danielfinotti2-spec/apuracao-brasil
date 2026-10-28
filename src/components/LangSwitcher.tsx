'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LOCALES, type Locale } from '@/i18n/messages';

function Switcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const hrefFor = (loc: Locale) => {
    const next = new URLSearchParams(params.toString());
    if (loc === 'pt') next.delete('lang'); else next.set('lang', loc);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  return (
    <span className="lang-switch" role="group" aria-label="Idioma / Language / Idioma">
      {LOCALES.map(l => (
        <Link key={l.key} href={hrefFor(l.key)} className={lang === l.key ? 'on' : ''} aria-current={lang === l.key ? 'true' : undefined}>
          {l.label}
        </Link>
      ))}
    </span>
  );
}

export default function LangSwitcher({ lang }: { lang: Locale }) {
  return (
    <Suspense fallback={null}>
      <Switcher lang={lang} />
    </Suspense>
  );
}
