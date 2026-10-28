import Link from 'next/link';
import SocialLinks from './SocialLinks';
import VisitsCounter from './VisitsCounter';
import { t, type Locale } from '@/i18n/messages';

export default function SiteFooter({ lang = 'pt', detail }: { lang?: Locale; detail?: string }) {
  const q = lang === 'pt' ? '' : `?lang=${lang}`;
  return (
    <footer className="foot">
      <span>{detail ?? t(lang, 'footer.line')}</span>
      <VisitsCounter label={t(lang, 'visits.label')} />
      <span className="foot-links">
        <Link href={`/termos${q}`}>{t(lang, 'nav.terms')}</Link>
        <Link href={`/apoiar${q}`}>{t(lang, 'nav.support')}</Link>
        <Link href={`/melhorias${q}`}>{t(lang, 'nav.feedback')}</Link>
      </span>
      <SocialLinks />
    </footer>
  );
}
