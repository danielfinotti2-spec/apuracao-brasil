import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import DestaqueMotion from '@/components/DestaqueMotion';
import PresenceTabs from '@/components/PresenceTabs';
import CountUp from '@/components/CountUp';
import Collapsible from '@/components/Collapsible';
import SourceList from '@/components/SourceList';
import { getTodayData } from '@/services/hoje';
import { listAllPoliticians } from '@/services/politicians';
import { formatDateTime } from '@/lib/format';
import { pickLang, t } from '@/i18n/messages';

export const revalidate = 900;

export const metadata = {
  title: 'O que seu eleito fez hoje | Fiscaliza Brasil',
  description: 'O registro público deste dia no Congresso: proposições apresentadas, votações, agenda oficial e presenças registradas — direto das fontes oficiais.',
};

const fmtTime = (iso: string | null) => (iso ? iso.slice(11, 16) : '—');

export default async function HojePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const q = L === 'pt' ? '' : `?lang=${L}`;
  const localeTag = L === 'en' ? 'en-US' : L === 'es' ? 'es-ES' : 'pt-BR';
  const [today, directory] = await Promise.all([getTodayData(), listAllPoliticians()]);
  const spotlight = today.proposals[0] ?? null;
  const gloss: Record<string, string | undefined> = {
    REQ: t(L, 'today.spotType.REQ'),
    PL: t(L, 'today.spotType.PL'),
    PEC: t(L, 'today.spotType.PEC'),
    PDC: t(L, 'today.spotType.PDC'),
    PLP: t(L, 'today.spotType.PL'),
    MPV: t(L, 'today.spotType.MPV'),
  };

  return (
    <main className="site">
      <SiteHeader active="hoje" lang={L} />
      <div className="site-body">
        <section className="page-head a" style={{ ['--ad' as any]: '60ms' }}>
          <h1>{t(L, 'today.h1')}</h1>
          <p className="lede">{today.dateLabel}. {t(L, 'today.lede')}</p>
        </section>

        {today.dayNote && <p className="sync-warning" role="alert"><b>{t(L, 'home.sourceUnavailable')}:</b> {t(L, 'today.failNote')}</p>}

        {spotlight && (
          <DestaqueMotion badge={t(L, 'today.badge')} title={`${spotlight.type} ${spotlight.number}${spotlight.year ? `/${spotlight.year}` : ''}`} note={gloss[spotlight.type] ?? t(L, 'today.spotType.generico')}>
            <p className="destaque-ementa">{spotlight.summary}</p>
            <p className="destaque-meta">
              {t(L, 'today.spotIntro')} {fmtTime(spotlight.presentedAt)} {t(L, 'today.spotBy')}{' '}
              {spotlight.authors.map((a, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {a.deputyId ? <Link href={`/politicos/camara/${a.deputyId}${q}`}>{a.name}</Link> : a.name}
                </span>
              ))}
              {' — '}<a href={spotlight.portalUrl} target="_blank" rel="noreferrer">{t(L, 'today.spotLink')}</a>
            </p>
          </DestaqueMotion>
        )}

        <section className="monitor hoje-kpis a" style={{ ['--ad' as any]: '160ms' }} aria-label={t(L, 'home.monitoring')}>
          <dl>
            <div><dt>{t(L, 'today.kpi.bills')}</dt><dd><CountUp value={today.proposals.length} locale={localeTag} /></dd></div>
            <div><dt>{t(L, 'today.kpi.votes')}</dt><dd><CountUp value={today.votings.length} locale={localeTag} /></dd></div>
            <div><dt>{t(L, 'today.kpi.events')}</dt><dd><CountUp value={today.events.length} locale={localeTag} /></dd></div>
            <div><dt>{t(L, 'today.kpi.present')}</dt><dd><CountUp value={today.present.length} locale={localeTag} /></dd></div>
          </dl>
        </section>

        <div className="hoje-grid">
          <Collapsible id="props" title={t(L, 'today.bills')} defaultOpen>
            {today.proposals.length === 0 ? (
              <p className="empty-note">{t(L, 'today.bills.empty')}</p>
            ) : (
              <ul className="record-list">
                {today.proposals.map(p => (
                  <li key={p.id}>
                    <div className="prop-id-row">
                      <span className="prop-id">{p.type} {p.number}{p.year ? `/${p.year}` : ''}</span>
                      {p.authors[0] && <small className="prop-author">
                        {p.authors[0].deputyId ? <Link href={`/politicos/camara/${p.authors[0].deputyId}${q}`}>{p.authors[0].name}</Link> : p.authors[0].name}
                        {p.authors.length > 1 ? ` +${p.authors.length - 1}` : ''}
                      </small>}
                    </div>
                    <p className="prop-ementa">{p.summary}</p>
                    <div className="record-meta">
                      <span>{fmtTime(p.presentedAt)}</span>
                      <a href={p.portalUrl} target="_blank" rel="noreferrer">{t(L, 'today.spotLink')}</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Collapsible>

          <Collapsible id="votos" title={t(L, 'today.votes')}>
            {today.votings.length === 0 ? (
              <p className="empty-note">{t(L, 'today.votes.empty')}</p>
            ) : (
              <ul className="record-list">
                {today.votings.map(v => (
                  <li key={v.id}>
                    <div className="prop-id-row">
                      <span className="prop-id">{v.org}</span>
                      {v.approved != null && <span className={`vote vote-${v.approved ? 's' : 'n'}`}>{v.approved ? 'Aprovada' : 'Rejeitada'}</span>}
                    </div>
                    <p className="prop-ementa">{v.description}</p>
                    <div className="record-meta">
                      <span>{fmtTime(v.registeredAt)}</span>
                      {v.votersCount != null && <span>{v.votersCount}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Collapsible>

          <Collapsible id="agenda" title={t(L, 'today.agenda')}>
            {today.events.length === 0 ? (
              <p className="empty-note">{t(L, 'today.agenda.empty')}</p>
            ) : (
              <ul className="record-list events">
                {today.events.slice(0, 20).map(e => (
                  <li key={e.id}>
                    <span className="event-date">{fmtTime(e.startsAt)}</span>
                    <div>
                      <b>{e.type}{e.orgs ? ` — ${e.orgs}` : ''}</b>
                      {e.title && e.title !== e.type && <p>{e.title}</p>}
                      {e.location && <small>{e.location}</small>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Collapsible>
        </div>

        <Collapsible id="presenca" title={t(L, 'today.presence')} badge={<span className="status-tag on">{today.present.length}</span>}>
          <p className="sub">{t(L, 'today.presence.sub')}</p>
          <PresenceTabs
            present={today.present}
            roster={directory.politicians}
            langPrefix={q}
            labels={{
              on: t(L, 'today.pres.on'),
              off: t(L, 'today.pres.off'),
              note1: t(L, 'today.pres.note1'),
              note2: t(L, 'today.pres.note2'),
              none: t(L, 'today.pres.none'),
              offLine: t(L, 'today.pres.offLine'),
              senate: t(L, 'today.senate'),
              group: t(L, 'today.presence'),
            }}
          />
        </Collapsible>

        <SourceList lang={L} sources={today.sources} failed={today.failedSources} />
        <p className="fine a" style={{ ['--ad' as any]: '560ms' }}>
          {t(L, 'today.generated')} {formatDateTime(today.sources.find(s => s.url.includes('eventos?'))?.fetchedAt ?? today.sources[0]?.fetchedAt ?? new Date().toISOString())} (America/Sao_Paulo). {t(L, 'today.execNote')}
        </p>
      </div>

      <SiteFooter lang={L} />
    </main>
  );
}
