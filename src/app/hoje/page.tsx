import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SocialLinks from '@/components/SocialLinks';
import DestaqueMotion from '@/components/DestaqueMotion';
import PresenceTabs from '@/components/PresenceTabs';
import PartyMark from '@/components/PartyMark';
import CountUp from '@/components/CountUp';
import SourceList from '@/components/SourceList';
import { getTodayData } from '@/services/hoje';
import { listAllPoliticians } from '@/services/politicians';
import { formatDateTime } from '@/lib/format';

export const revalidate = 900;

export const metadata = {
  title: 'O que seu eleito fez hoje | Fiscaliza Brasil',
  description: 'O registro público deste dia no Congresso: proposições apresentadas, votações, agenda oficial e presenças registradas — direto das fontes oficiais.',
};

const fmtTime = (iso: string | null) => (iso ? iso.slice(11, 16) : '—');

export default async function HojePage() {
  const [today, directory] = await Promise.all([getTodayData(), listAllPoliticians()]);

  const spotlight = today.proposals[0] ?? null;

  return (
    <main className="site">
      <SiteHeader active="hoje" />
      <div className="site-body">
        <section className="page-head a" style={{ ['--ad' as any]: '60ms' }}>
          <h1>O que seu eleito fez hoje</h1>
          <p className="lede">
            {today.dateLabel}. Tudo o que as fontes oficiais registraram nas últimas horas —
            proposições, votações, agenda e presenças. Atualizado ao longo do dia.
          </p>
        </section>

        {today.dayNote && <p className="sync-warning" role="alert"><b>Atenção:</b> {today.dayNote}</p>}

        {spotlight && (
          <DestaqueMotion badge="Destaque do dia" title={`${spotlight.type} ${spotlight.number}${spotlight.year ? `/${spotlight.year}` : ''}`}>
            <p className="destaque-ementa">{spotlight.summary}</p>
            <p className="destaque-meta">
              Apresentada às {fmtTime(spotlight.presentedAt)} por{' '}
              {spotlight.authors.map((a, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  {a.deputyId ? <Link href={`/politicos/camara/${a.deputyId}`}>{a.name}</Link> : a.name}
                </span>
              ))}
              {' — '}<a href={spotlight.portalUrl} target="_blank" rel="noreferrer">ver tramitação oficial</a>
            </p>
          </DestaqueMotion>
        )}

        <section className="monitor hoje-kpis a" style={{ ['--ad' as any]: '160ms' }} aria-label="Resumo do dia">
          <dl>
            <div><dt>Proposições apresentadas hoje</dt><dd><CountUp value={today.proposals.length} /></dd></div>
            <div><dt>Votações nominais hoje</dt><dd><CountUp value={today.votings.length} /></dd></div>
            <div><dt>Eventos oficiais na agenda</dt><dd><CountUp value={today.events.length} /></dd></div>
            <div><dt>Presenças registradas nos eventos</dt><dd><CountUp value={today.present.length} /></dd></div>
          </dl>
        </section>

        <div className="hoje-grid">
          <section className="profile-section a" style={{ ['--ad' as any]: '240ms' }}>
            <h2>Proposições de hoje</h2>
            {today.proposals.length === 0 ? (
              <p className="empty-note">A API não registrou proposições apresentadas nesta data até agora.</p>
            ) : (
              <ul className="record-list">
                {today.proposals.map(p => (
                  <li key={p.id}>
                    <div className="prop-id-row">
                      <span className="prop-id">{p.type} {p.number}{p.year ? `/${p.year}` : ''}</span>
                      {p.authors[0] && <small className="prop-author">
                        {p.authors[0].deputyId ? <Link href={`/politicos/camara/${p.authors[0].deputyId}`}>{p.authors[0].name}</Link> : p.authors[0].name}
                        {p.authors.length > 1 ? ` e mais ${p.authors.length - 1}` : ''}
                      </small>}
                    </div>
                    <p className="prop-ementa">{p.summary}</p>
                    <div className="record-meta">
                      <span>{fmtTime(p.presentedAt)}</span>
                      <a href={p.portalUrl} target="_blank" rel="noreferrer">tramitação oficial</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="profile-section a" style={{ ['--ad' as any]: '320ms' }}>
            <h2>Votações de hoje</h2>
            {today.votings.length === 0 ? (
              <p className="empty-note">Nenhuma votação nominal registrada nesta data — comum em dias sem deliberação de plenário. Quando houver, aparece aqui com a fonte.</p>
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
                      <span>registro às {fmtTime(v.registeredAt)}</span>
                      {v.votersCount != null && <span>{v.votersCount} votos</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="profile-section a" style={{ ['--ad' as any]: '400ms' }}>
            <h2>Agenda oficial de hoje</h2>
            {today.events.length === 0 ? (
              <p className="empty-note">Nenhum evento público na agenda nesta data.</p>
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
          </section>
        </div>

        <section className="profile-section a" style={{ ['--ad' as any]: '480ms' }}>
          <h2>Presenças registradas hoje</h2>
          <p className="sub">Confronto transparente: quem tem registro público de atividade nesta data e quem não consta.</p>
          <PresenceTabs present={today.present} roster={directory.politicians} />
        </section>

        <SourceList sources={today.sources} failed={today.failedSources} />
        <p className="fine a" style={{ ['--ad' as any]: '560ms' }}>
          Quadro das casas gerado às {formatDateTime(today.sources.find(s => s.url.includes('eventos?'))?.fetchedAt ?? today.sources[0]?.fetchedAt ?? new Date().toISOString())} (horário de Brasília).
          Presidente, governadores e prefeitos: as APIs abertas atuais não cobrem o Executivo — a cobertura vem com a importação dos arquivos eleitorais do TSE (fase planejada, documentada na metodologia).
        </p>
      </div>

      <footer className="foot">
        <span>Fiscaliza Brasil — informação para fortalecer a democracia.</span>
        <SocialLinks />
      </footer>
    </main>
  );
}
