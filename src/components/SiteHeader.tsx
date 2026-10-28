import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function SiteHeader({ active }: { active?: 'home' | 'politicos' | 'hoje' | 'metodologia' }) {
  return (
    <>
      <div className="flag-stripe" aria-hidden="true" />
      <header className="site-header">
        <Link href="/" className="wordmark" aria-label="Fiscaliza Brasil, início">
          <span className="brand-mark"><i /><i /><i /></span>
          <span className="brand-text">Fiscaliza<b>Brasil</b></span>
        </Link>
        <nav className="site-nav" aria-label="Navegação principal">
          <Link href="/" className={active === 'home' ? 'active' : ''}>Início</Link>
          <Link href="/politicos" className={active === 'politicos' ? 'active' : ''}>Políticos</Link>
          <Link href="/hoje" className={active === 'hoje' ? 'active' : ''}>O dia de hoje</Link>
          <Link href="/metodologia" className={active === 'metodologia' ? 'active' : ''}>Metodologia</Link>
        </nav>
        <ThemeToggle />
      </header>
    </>
  );
}
