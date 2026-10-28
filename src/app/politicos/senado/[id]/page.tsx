import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Seal from '@/components/Seal';
import CountUp from '@/components/CountUp';
import PartyMark from '@/components/PartyMark';
import Collapsible from '@/components/Collapsible';
import SourceList from '@/components/SourceList';
import { getSenadorProfile } from '@/services/senado';
import { formatDate } from '@/lib/format';
import { pickLang, t } from '@/i18n/messages';

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getSenadorProfile(id).catch(() => null);
  return {
    title: profile ? `${profile.summary.name} — Senador(a) | Fiscaliza Brasil` : 'Senador(a) | Fiscaliza Brasil',
    description: profile
      ? `Perfil de ${profile.summary.name} (${profile.summary.party}/${profile.summary.uf}): identificação oficial e votações nominais, coletados da API de Dados Abertos do Senado Federal.`
      : 'Perfil de senador com dados oficiais do Senado Federal.',
  };
}

const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const voteClass = (vote: string) => {
  const v = strip(vote);
  if (v.startsWith('sim')) return 'vote-yes';
  if (v.startsWith('nao')) return 'vote-no';
  return 'vote-other';
};

export default async function SenadorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const q = L === 'pt' ? '' : `?lang=${L}`;
  const localeTag = L === 'en' ? 'en-US' : L === 'es' ? 'es-ES' : 'pt-BR';
  const { id } = await params;
  const profile = await getSenadorProfile(id).catch(() => null);
  if (!profile) notFound();
  const p = profile.summary;
  const yes = profile.votes.filter(v => strip(v.vote).startsWith('sim')).length;
  const no = profile.votes.filter(v => strip(v.vote).startsWith('nao')).length;

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
              <Seal status="oficial-confirmada" lang={L} />
            </div>
            <h1>{p.name}</h1>
            <p className="sub">{t(L, 'profile.facts.civil')}: {profile.fullName}</p>
            <div className="profile-contacts">
              {profile.email && <span>{profile.email}</span>}
              {profile.officeAddress && <span>{profile.officeAddress}</span>}
              {p.officialUrl && <a href={p.officialUrl} target="_blank" rel="noreferrer">{t(L, 'profile.senadoPage')}</a>}
            </div>
          </div>
        </header>

        <nav className="profile-nav a" style={{ ['--ad' as any]: '150ms' }} aria-label={t(L, 'profile.nav.goto')}>
          <span>{t(L, 'profile.nav.goto')}:</span>
          <a href="#identificacao">{t(L, 'profile.overview')}</a>
          <a href="#votacoes">{t(L, 'profile.sec.votes')}</a>
          <a href="#salario">{t(L, 'profile.salary.h')}</a>
          <a href="#fontes">{t(L, 'common.source')}</a>
        </nav>

        <section className="profile-kpis a" style={{ ['--ad' as any]: '180ms' }} aria-label={t(L, 'profile.any.section')}>
          <div>
            <span>{t(L, 'profile.votes.kpi')}</span>
            <b><CountUp value={profile.votes.length} locale={localeTag} /></b>
            <small>{t(L, 'profile.votes.kpiSub')}</small>
          </div>
          <div>
            <span>{t(L, 'profile.votes.yes')}</span>
            <b><CountUp value={yes} locale={localeTag} /></b>
            <small>{t(L, 'profile.votes.thisHist')}</small>
          </div>
          <div>
            <span>{t(L, 'profile.votes.no')}</span>
            <b><CountUp value={no} locale={localeTag} /></b>
            <small>{t(L, 'profile.votes.thisHist')}</small>
          </div>
        </section>

        <div className="profile-grid a" style={{ ['--ad' as any]: '280ms' }}>
          <section className="profile-section" id="identificacao" aria-label={t(L, 'profile.sec.id')}>
            <h2>{t(L, 'profile.overview')}</h2>
            <dl className="facts">
              <div><dt>{t(L, 'profile.facts.civil')}</dt><dd>{profile.fullName}</dd></div>
              <div><dt>{t(L, 'profile.facts.party')}</dt><dd>{p.party}</dd></div>
              <div><dt>{t(L, 'profile.facts.uf')}</dt><dd>{p.uf}</dd></div>
              {profile.birthDate && <div><dt>{t(L, 'profile.facts.birth')}</dt><dd>{formatDate(profile.birthDate)}{profile.birthCity ? ` — ${profile.birthCity}${profile.birthUf ? `/${profile.birthUf}` : ''}` : ''}</dd></div>}
              {profile.gender && <div><dt>{t(L, 'profile.facts.status')}</dt><dd>{profile.gender}</dd></div>}
              {profile.officeAddress && <div><dt>{t(L, 'profile.facts.cabinet')}</dt><dd>{profile.officeAddress}</dd></div>}
            </dl>
            <p className="fine">{t(L, 'profile.fine.cadSenado')}</p>
          </section>

          <section className="profile-section" id="salario" aria-label={t(L, 'profile.salary.h')}>
            <h2>{t(L, 'profile.salary.h')}</h2>
            <p>{t(L, 'profile.salary.p.senado')}</p>
            <p className="fine">
              <a href="https://www.senado.leg.br/transparencia" target="_blank" rel="noreferrer">{t(L, 'profile.salary.link')}</a>
            </p>
          </section>

          <Collapsible id="votacoes" defaultOpen title={<>{t(L, 'profile.sec.votes')} <Seal status="oficial-confirmada" compact lang={L} /></>}>
            <p className="sub">{t(L, 'profile.votes.sub')}</p>
            {profile.votesNote && <p className="sync-warning" role="note"><b>{t(L, 'common.source')}:</b> {t(L, 'profile.votes.noteDeprec')}</p>}
            {profile.votes.length === 0 && <p className="empty-note">{t(L, 'profile.votes.empty')}</p>}
            <table className="table votes-table">
              <thead>
                <tr><th>{L === 'en' ? 'Date' : L === 'es' ? 'Fecha' : 'Data'}</th><th>{L === 'en' ? 'Matter and vote' : L === 'es' ? 'Materia y votación' : 'Matéria e votação'}</th><th className="num">{L === 'en' ? 'Vote' : 'Voto'}</th></tr>
              </thead>
              <tbody>
                {profile.votes.slice(0, 30).map((v, i) => (
                  <tr key={`${v.matterCode}-${v.date}-${i}`}>
                    <td className="num">{formatDate(v.date)}</td>
                    <td>
                      <b>{v.matter || v.description || 'Votação nominal'}</b>
                      <small style={{ display: 'block', marginTop: 2 }}>
                        {v.description}
                        {v.result ? ` — resultado: ${v.result}` : ''}
                        {v.secret ? ' — votação secreta' : ''}
                      </small>
                    </td>
                    <td className="num"><span className={`vote ${voteClass(v.vote)}`}>{v.vote || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
