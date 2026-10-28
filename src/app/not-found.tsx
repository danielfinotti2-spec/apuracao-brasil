import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { pickLang, t } from '@/i18n/messages';

/** 404 editorial: a mesma honestidade dos dados — se não existe, não inventamos. */
export default async function NotFound({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const L = searchParams ? pickLang(await searchParams) : 'pt';
  const q = L === 'pt' ? '' : `?lang=${L}`;
  return (
    <main className="site">
      <SiteHeader lang={L} />
      <div className="site-body">
        <section className="nf a" style={{ ['--ad' as any]: '60ms' }}>
          <span className="nf-code" aria-hidden="true">404</span>
          <h1>{t(L, 'nf.h1')}</h1>
          <p className="lede">{t(L, 'nf.p')}</p>
          <div className="hero-actions">
            <Link className="btn primary" href={`/${q}`}>{t(L, 'nf.back')}</Link>
            <Link className="btn" href={`/politicos${q}`}>{t(L, 'home.cta.directory')}</Link>
          </div>
        </section>
      </div>
      <SiteFooter lang={L} />
    </main>
  );
}
