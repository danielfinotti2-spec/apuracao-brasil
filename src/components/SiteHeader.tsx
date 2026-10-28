import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import LangSwitcher from './LangSwitcher';
import MobileMenu from './MobileMenu';
import { t, type Locale } from '@/i18n/messages';

export default function SiteHeader({ active, lang = 'pt' }: { active?: string; lang?: Locale }) {
  const q = lang === 'pt' ? '' : `?lang=${lang}`;
  return (
    <>
      <div className="flag-stripe" aria-hidden="true" />
      <header className="site-header">
        <Link href={`/${q}`} className="wordmark" aria-label="Fiscaliza Brasil">
          <span className="brand-mark"><i /><i /><i /></span>
          <span className="brand-text">Fiscaliza<b>Brasil</b></span>
        </Link>
        <nav className="site-nav" aria-label={t(lang, 'nav.main')}>
          <Link href={`/${q}`} className={active === 'home' ? 'active' : ''}>{t(lang, 'nav.home')}</Link>
          <Link href={`/politicos${q}`} className={active === 'politicos' ? 'active' : ''}>{t(lang, 'nav.politicians')}</Link>
          <Link href={`/hoje${q}`} className={active === 'hoje' ? 'active' : ''}>{t(lang, 'nav.today')}</Link>
          <Link href={`/rankings${q}`} className={active === 'rankings' ? 'active' : ''}>{t(lang, 'nav.rankings')}</Link>
          <Link href={`/metodologia${q}`} className={active === 'metodologia' ? 'active' : ''}>{t(lang, 'nav.methodology')}</Link>
        </nav>
        <div className="hdr-tools">
          <LangSwitcher lang={lang} />
          <ThemeToggle lang={lang} />
          <MobileMenu active={active} lang={lang} />
        </div>
      </header>
    </>
  );
}
