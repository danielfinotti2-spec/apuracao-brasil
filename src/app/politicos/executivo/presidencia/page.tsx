import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PartyMark from '@/components/PartyMark';
import Seal from '@/components/Seal';
import SourceList from '@/components/SourceList';
import Collapsible from '@/components/Collapsible';
import { pickLang, t } from '@/i18n/messages';
import type { SourceRef } from '@/types/politician';
import { PRESIDENT_PHOTO } from '@/data/executive-photos';

export const metadata = {
  title: 'Presidente da República | Fiscaliza Brasil',
  description: 'Perfil institucional da Presidência da República com links oficiais para agenda, biografia e subsídio. Informação verificada nos canais do Governo Federal.',
};

export const dynamic = 'force-static';

const SOURCES: Omit<SourceRef, 'fetchedAt'>[] = [
  { name: 'Palácio do Planalto — Presidência da República', url: 'https://www.gov.br/planalto/pt-br', status: 'oficial-confirmada' },
  { name: 'Conheça a Presidência — biografia oficial (gov.br)', url: 'https://www.gov.br/planalto/pt-br/conheca-a-presidencia', status: 'oficial-confirmada' },
  { name: 'Agenda de compromissos oficial (Planalto)', url: 'https://www.gov.br/planalto/pt-br/acesso-a-informacao/agenda-compromissos', status: 'oficial-confirmada' },
  { name: 'Portal da Transparência — remuneração de agentes públicos', url: 'https://www.portaltransparencia.gov.br/', status: 'oficial-confirmada' },
];

export default async function PresidentePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const q = L === 'pt' ? '' : `?lang=${L}`;
  const collectedAt = new Date().toISOString();
  const sources: SourceRef[] = SOURCES.map(s => ({ ...s, fetchedAt: collectedAt }));

  return (
    <main className="site">
      <SiteHeader active="politicos" lang={L} />
      <div className="site-body profile-view">
        <header className="profile-header a">
          {PRESIDENT_PHOTO
            ? <img className="profile-photo" src={PRESIDENT_PHOTO.src} alt="Luiz Inácio Lula da Silva" referrerPolicy="no-referrer" />
            : <div className="profile-photo mono" aria-hidden="true"><span>PR</span></div>}
          <div>
            <p className="profile-chamber"><span className="dot" />{t(L, 'pres.type')}</p>
            <h1>Luiz Inácio Lula da Silva <Seal status="oficial-confirmada" lang={L} /></h1>
            <p className="profile-sub">
              {t(L, 'pres.h')} · <PartyMark party="PT" size="md" /> <b>PT</b> · {t(L, 'pres.mandate')}
            </p>
            <div className="profile-contacts">
              <a href="https://www.gov.br/pt-br" target="_blank" rel="noreferrer">{t(L, 'pres.links.gov')}</a>
              <a href="https://www.gov.br/planalto/pt-br" target="_blank" rel="noreferrer">{t(L, 'pres.links.pal')}</a>
              <a href="https://www.gov.br/planalto/pt-br/conheca-a-presidencia" target="_blank" rel="noreferrer">{t(L, 'pres.links.bio')}</a>
            </div>
          </div>
        </header>

        <div className="profile-grid a" style={{ ['--ad' as any]: '120ms' }}>
          <section className="profile-section" id="identificacao" aria-label={t(L, 'profile.overview')}>
            <h2>{t(L, 'profile.overview')}</h2>
            <dl className="facts">
              <div><dt>{t(L, 'profile.facts.civil')}</dt><dd>Luiz Inácio Lula da Silva</dd></div>
              <div><dt>{t(L, 'pres.facts.party')}</dt><dd>PT</dd></div>
              <div><dt>{t(L, 'pres.facts.born')}</dt><dd>{t(L, 'pres.facts.born.v')}</dd></div>
              <div><dt>{t(L, 'pres.facts.election')}</dt><dd>{t(L, 'pres.facts.election.v')}</dd></div>
              <div><dt>{t(L, 'pres.facts.inaug')}</dt><dd>{t(L, 'pres.facts.inaug.v')}</dd></div>
              <div><dt>{t(L, 'pres.facts.vice')}</dt><dd>{t(L, 'pres.facts.vice.v')}</dd></div>
            </dl>
          </section>

          <section className="profile-section" id="salario" aria-label={t(L, 'pres.salary')}>
            <h2>{t(L, 'pres.salary')}</h2>
            <p className="sub">{t(L, 'pres.salary.p')}</p>
            <p className="fine"><a href="https://www.portaltransparencia.gov.br/" target="_blank" rel="noreferrer">{t(L, 'pres.salary.link')} ↗</a></p>
          </section>
        </div>

        <Collapsible id="agenda" defaultOpen title={t(L, 'pres.agenda')}>
          <p className="sub">{t(L, 'pres.agenda.p')}</p>
          <p><a className="btn primary" href="https://www.gov.br/planalto/pt-br/acesso-a-informacao/agenda-compromissos" target="_blank" rel="noreferrer">{t(L, 'pres.links.ago')} ↗</a></p>
        </Collapsible>

        <p className="pending-note a" style={{ ['--ad' as any]: '200ms' }}>{t(L, 'pres.note')}</p>

        <div id="fontes">
          <SourceList lang={L} sources={sources} failed={[]} />
        </div>
        <p className="fine"><Link href={`/politicos${q}`}>← {t(L, 'nav.politicians')}</Link></p>
      </div>
      <SiteFooter lang={L} detail={t(L, 'footer.sources')} />
    </main>
  );
}
