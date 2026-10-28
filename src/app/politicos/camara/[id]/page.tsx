import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Seal from '@/components/Seal';
import CountUp from '@/components/CountUp';
import PartyMark from '@/components/PartyMark';
import Collapsible from '@/components/Collapsible';
import SourceList from '@/components/SourceList';
import { getDeputadoProfile } from '@/services/camara';
import { formatDate, formatDateTime, formatMoney, MONTHS } from '@/lib/format';
import { pickLang, t } from '@/i18n/messages';

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getDeputadoProfile(id).catch(() => null);
  return {
    title: profile ? `${profile.summary.name} — Deputado(a) Federal | Fiscaliza Brasil` : 'Deputado(a) Federal | Fiscaliza Brasil',
    description: profile
      ? `Perfil de ${profile.summary.name} (${profile.summary.party}/${profile.summary.uf}): despesas da cota parlamentar, proposições de autoria, agenda oficial e fontes, coletados da API de Dados Abertos da Câmara.`
      : 'Perfil de deputado federal com dados oficiais da Câmara dos Deputados.',
  };
}

export default async function DeputadoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const q = L === 'pt' ? '' : `?lang=${L}`;
  const localeTag = L === 'en' ? 'en-US' : L === 'es' ? 'es-ES' : 'pt-BR';
  const { id } = await params;
  const profile = await getDeputadoProfile(id).catch(() => null);
  if (!profile) notFound();
  const p = profile.summary;

  return (
    <main className="site">
      <SiteHeader active="politicos" lang={L} />
      <div className="site-body">
        <nav className="crumbs profile-crumbs" aria-label="Navegação">
          <Link href={`/${q}`}>{t(L, 'profile.backHome')}</Link><span> / </span><Link href={`/politicos${q}`}>{t(L, 'nav.politicians')}</Link><span> / </span><span className="on">{p.name}</span>
        </nav>

        <header className="profile-hero a" style={{ ['--ad' as any]: '80ms' }}>
          <img className="profile-photo" src={p.photoUrl} alt={p.name} referrerPolicy="no-referrer" />
          <div className="profile-id">
            <div className="profile-tags">
              <span className="status-tag on">{p.office}</span>
              <PartyMark party={p.party} size="md" />
              <span className="status-tag">{p.uf}</span>
              {profile.status && <span className="status-tag">{profile.status}</span>}
              <Seal status="oficial-confirmada" lang={L} />
            </div>
            <h1>{p.name}</h1>
            <p className="sub">
              {t(L, 'profile.facts.civil')}: {profile.civilName}
              {profile.electoralCondition ? ` — ${t(L, 'profile.facts.condition')}: ${profile.electoralCondition}` : ''}
            </p>
            <div className="profile-contacts">
              {profile.email && <span>{profile.email}</span>}
              {profile.officeRoom && <span>{t(L, 'profile.facts.cabinet')} {profile.officeRoom}{profile.officePhone ? ` · ${profile.officePhone}` : ''}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer">{t(L, 'profile.website')}</a>}
              <a href={p.officialUrl} target="_blank" rel="noreferrer">{t(L, 'profile.camaraPage')}</a>
            </div>
          </div>
        </header>

        <nav className="profile-nav a" style={{ ['--ad' as any]: '150ms' }} aria-label={t(L, 'profile.nav.goto')}>
          <span>{t(L, 'profile.nav.goto')}:</span>
          <a href="#identificacao">{t(L, 'profile.overview')}</a>
          <a href="#salario">{t(L, 'profile.salary.h')}</a>
          <a href="#despesas">{t(L, 'profile.sec.expenses')}</a>
          <a href="#proposicoes">{t(L, 'profile.sec.bills')}</a>
          <a href="#agenda">{t(L, 'profile.sec.agenda')}</a>
          <a href="#fontes">{t(L, 'common.source')}</a>
        </nav>

        <section className="profile-kpis a" style={{ ['--ad' as any]: '180ms' }} aria-label={t(L, 'profile.any.section')}>
          <div>
            <span>{t(L, 'profile.kpi.bills')}</span>
            <b><CountUp value={profile.proposals.length} locale={localeTag} /></b>
            <small>{t(L, 'profile.kpi.billsSub')}</small>
          </div>
          <div>
            <span>{t(L, 'profile.kpi.expenses')}</span>
            <b><CountUp value={profile.expenses.periodTotal} format="money" locale={localeTag} /></b>
            <small>{profile.expenses.loadedMonths}</small>
          </div>
          <div>
            <span>{t(L, 'profile.kpi.events')}</span>
            <b><CountUp value={profile.events.items.length} locale={localeTag} /></b>
            <small>{t(L, 'profile.kpi.eventsSub')}</small>
          </div>
        </section>

        <div className="profile-grid a" style={{ ['--ad' as any]: '280ms' }}>
          <section className="profile-section" id="identificacao" aria-label={t(L, 'profile.sec.id')}>
            <h2>{t(L, 'profile.overview')}</h2>
            <dl className="facts">
              <div><dt>{t(L, 'profile.facts.civil')}</dt><dd>{profile.civilName}</dd></div>
              <div><dt>{t(L, 'profile.facts.party')}</dt><dd>{p.party}</dd></div>
              <div><dt>{t(L, 'profile.facts.uf')}</dt><dd>{p.uf}</dd></div>
              {profile.birthDate && <div><dt>{t(L, 'profile.facts.birth')}</dt><dd>{formatDate(profile.birthDate)}{profile.birthCity ? ` — ${profile.birthCity}${profile.birthUf ? `/${profile.birthUf}` : ''}` : ''}</dd></div>}
              {profile.schooling && <div><dt>{t(L, 'profile.facts.school')}</dt><dd>{profile.schooling}</dd></div>}
              {profile.status && <div><dt>{t(L, 'profile.facts.status')}</dt><dd>{profile.status}</dd></div>}
              {profile.electoralCondition && <div><dt>{t(L, 'profile.facts.condition')}</dt><dd>{profile.electoralCondition}</dd></div>}
            </dl>
            <p className="fine">{t(L, 'profile.fine.cadCamara')}</p>
          </section>

          <section className="profile-section" id="salario" aria-label={t(L, 'profile.salary.h')}>
            <h2>{t(L, 'profile.salary.h')}</h2>
            <p>{t(L, 'profile.salary.p.camara')}</p>
            <p className="fine">
              <a href="https://www.camara.leg.br/transparencia" target="_blank" rel="noreferrer">{t(L, 'profile.salary.link')}</a>
            </p>
          </section>

          <Collapsible id="despesas" defaultOpen title={<>{t(L, 'profile.sec.expenses')} <Seal status="oficial-confirmada" compact lang={L} /></>}>
            <p className="sub">{t(L, 'profile.expenses.period')}: {profile.expenses.loadedMonths}. {t(L, 'profile.expenses.net')}</p>
            {profile.expenses.groups.length === 0 && <p className="empty-note">{t(L, 'profile.expenses.empty')}</p>}
            {profile.expenses.groups.length > 0 && (
              <table className="table">
                <thead>
                  <tr><th>{t(L, 'profile.expenses.group')}</th><th className="num">{t(L, 'profile.expenses.notes')}</th><th className="num">{t(L, 'profile.expenses.total')}</th></tr>
                </thead>
                <tbody>
                  {profile.expenses.groups.slice(0, 8).map(g => (
                    <tr key={g.type}>
                      <td>{g.type}</td>
                      <td className="num">{g.count}</td>
                      <td className="num">{formatMoney(g.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {profile.expenses.recent.length > 0 && (
              <>
                <h3 className="inner-title">{t(L, 'profile.expenses.last')}</h3>
                <ul className="record-list">
                  {profile.expenses.recent.slice(0, 10).map((e, i) => (
                    <li key={i}>
                      <time>{MONTHS[e.month] ?? e.month}/{e.year}</time>
                      <div><b>{e.type}</b><small>{e.supplier}{e.supplierDocument ? ` — ${e.supplierDocument}` : ''}</small></div>
                      <b>{formatMoney(e.netValue)}</b>
                      {e.documentUrl && <a href={e.documentUrl} target="_blank" rel="noreferrer" aria-label={t(L, 'profile.doc')}>{t(L, 'profile.doc')}</a>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Collapsible>

          <Collapsible id="proposicoes" title={<>{t(L, 'profile.sec.bills')} <Seal status="oficial-confirmada" compact lang={L} /></>}>
            <p className="sub">{t(L, 'profile.bills.sub')}</p>
            {profile.proposals.length === 0 && <p className="empty-note">{t(L, 'profile.bills.empty')}</p>}
            <ul className="record-list">
              {profile.proposals.map(pr => (
                <li key={pr.id}>
                  <span className="prop-id">{pr.type} {pr.number}{pr.year ? `/${pr.year}` : ''}</span>
                  <div><b>{pr.summary}</b>{pr.presentedAt && <small>{t(L, 'profile.presentedAt')} {formatDate(pr.presentedAt)}</small>}</div>
                  <a href={pr.portalUrl} target="_blank" rel="noreferrer">{t(L, 'profile.tramit')}</a>
                </li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible id="agenda" title={<>{t(L, 'profile.sec.agenda')} <Seal status="oficial-confirmada" compact lang={L} /></>}>
            <p className="sub">
              {formatDate(profile.events.periodStart)} — {formatDate(profile.events.periodEnd)}. {t(L, 'profile.agenda.note')}
            </p>
            {profile.events.items.length === 0 && <p className="empty-note">{t(L, 'profile.agenda.empty')}</p>}
            <ul className="record-list">
              {profile.events.items.slice(0, 12).map(ev => (
                <li key={ev.id}>
                  <time>{formatDateTime(ev.startsAt)}</time>
                  <div><b>{ev.type}</b><small>{ev.title}{ev.location ? ` — ${ev.location}` : ''}{ev.situation ? ` (${ev.situation})` : ''}</small></div>
                </li>
              ))}
            </ul>
          </Collapsible>
        </div>

        <p className="pending-note">{t(L, 'profile.pending')}</p>

        <div id="fontes">
          <SourceList lang={L} sources={profile.sources} failed={profile.failedSources} />
        </div>
      </div>
      <SiteFooter lang={L} />
    </main>
  );
}
