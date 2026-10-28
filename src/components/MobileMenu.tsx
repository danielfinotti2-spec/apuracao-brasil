'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { t, type Locale } from '@/i18n/messages';

/**
 * Menu hambúrguer do mobile: só aparece abaixo de 760px (CSS).
 * Abre um drawer lateral com as opções (em cascata) + fundo esmaecido.
 * Fecha ao tocar fora, navegar ou apertar o X.
 */
export default function MobileMenu({ active, lang }: { active?: string; lang: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const q = lang === 'pt' ? '' : `?lang=${lang}`;

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.classList.toggle('menu-lock', open);
    return () => document.body.classList.remove('menu-lock');
  }, [open]);

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
      <div className="menu-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
      <nav className="mobile-nav-panel" id="mobile-nav-panel" aria-hidden={!open} aria-label={t(lang, 'nav.main')}>
        <div className="mobile-nav-head">
          <span className="brand-mark"><i /><i /><i /></span>
          <span className="brand-text">Fiscaliza<b>Brasil</b></span>
        </div>
        <div className="mobile-nav-inner">
          {links.map((l, i) => (
            <Link
              key={l.key}
              href={l.href}
              className={active === l.key ? 'active' : ''}
              style={{ ['--i' as any]: i }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mobile-nav-foot">{t(lang, 'footer.line')}</p>
      </nav>
    </div>
  );
}
