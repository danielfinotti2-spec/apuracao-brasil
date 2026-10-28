'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { t, type Locale } from '@/i18n/messages';

/**
 * Menu hambúrguer do mobile: só aparece abaixo de 760px (CSS).
 * Abre/fecha animado, virando X; fecha ao navegar.
 */
export default function MobileMenu({ active, lang }: { active?: string; lang: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const q = lang === 'pt' ? '' : `?lang=${lang}`;

  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { href: `/${q}`, key: 'home', label: t(lang, 'nav.home') },
    { href: `/politicos${q}`, key: 'politicos', label: t(lang, 'nav.politicians') },
    { href: `/hoje${q}`, key: 'hoje', label: t(lang, 'nav.today') },
    { href: `/rankings${q}`, key: 'rankings', label: t(lang, 'nav.rankings') },
    { href: `/metodologia${q}`, key: 'metodologia', label: t(lang, 'nav.methodology') },
  ];

  return (
    <div className={`mobile-menu${open ? ' open' : ''}`}>
      <button
        className="burger"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={t(lang, 'nav.menu')}
        onClick={() => setOpen(v => !v)}
      >
        <span /><span /><span />
      </button>
      <nav className="mobile-nav-panel" id="mobile-nav-panel" aria-hidden={!open} aria-label={t(lang, 'nav.main')}>
        <div className="mobile-nav-inner">
          {links.map(l => (
            <Link
              key={l.key}
              href={l.href}
              className={active === l.key ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
