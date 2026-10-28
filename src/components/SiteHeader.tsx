'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/politicos', label: 'Políticos' },
  { href: '/apuracao', label: 'Apuração eleitoral' },
  { href: '/metodologia', label: 'Metodologia' },
];

/** Cabeçalho compartilhado das páginas do portal (o painel de apuração tem o próprio). */
export default function SiteHeader() {
  const pathname = usePathname();
  return (
    <>
      <div className="flag-stripe" aria-hidden="true" />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Fiscaliza Brasil, início">
          <span className="brand-mark"><i /><i /><i /></span>
          <span className="brand-text">Fiscaliza<b>Brasil</b></span>
        </Link>
        <nav className="site-nav" aria-label="Navegação do portal">
          {LINKS.map(link => (
            <Link key={link.href} href={link.href} className={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'on' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
