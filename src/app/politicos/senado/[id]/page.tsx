import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import Seal from '@/components/Seal';
import CountUp from '@/components/CountUp';
import SourceList from '@/components/SourceList';
import { getSenadorProfile } from '@/services/senado';
import { formatDate } from '@/lib/format';

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

export default async function SenadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getSenadorProfile(id).catch(() => null);
  if (!profile) notFound();
  const p = profile.summary;
  const yes = profile.votes.filter(v => strip(v.vote).startsWith('sim')).length;
  const no = profile.votes.filter(v => strip(v.vote).startsWith('nao')).length;

  return (
    <main className="site">
      <SiteHeader />
      <div className="site-body">
        <nav className="crumbs profile-crumbs" aria-label="Navegação">
          <Link href="/">Início</Link><span> / </span><Link href="/politicos">Políticos</Link><span> / </span><span className="on">{p.name}</span>
        </nav>

        <header className="profile-hero a" style={{ ['--ad' as any]: '80ms' }}>
          <img className="profile-photo" src={p.photoUrl} alt={`Foto oficial de ${p.name}`} referrerPolicy="no-referrer" />
          <div className="profile-id">
            <div className="profile-tags">
              <span className="status-tag on">{p.office}</span>
              <span className="status-tag">{p.party} / {p.uf}</span>
              <Seal status="oficial-confirmada" />
            </div>
            <h1>{p.name}</h1>
            <p className="sub">Nome completo: {profile.fullName}</p>
            <div className="profile-contacts">
              {profile.email && <span><b>E-mail:</b> {profile.email}</span>}
              {profile.officeAddress && <span><b>Endereço parlamentar:</b> {profile.officeAddress}</span>}
              {p.officialUrl && <a href={p.officialUrl} target="_blank" rel="noreferrer">Página no Senado</a>}
            </div>
          </div>
        </header>

        <section className="profile-kpis a" style={{ ['--ad' as any]: '180ms' }} aria-label="Resumo de votações">
          <div>
            <span>Votações nominais registradas</span>
            <b><CountUp value={profile.votes.length} /></b>
            <small>histórico publicado pelo serviço do Senado</small>
          </div>
          <div>
            <span>Votos “Sim”</span>
            <b><CountUp value={yes} /></b>
            <small>neste histórico</small>
          </div>
          <div>
            <span>Votos “Não”</span>
            <b><CountUp value={no} /></b>
            <small>neste histórico</small>
          </div>
        </section>

        <div className="profile-grid a" style={{ ['--ad' as any]: '280ms' }}>
          <section className="profile-section" aria-label="Informações institucionais">
            <h2>Visão geral</h2>
            <dl className="facts">
              <div><dt>Nome completo</dt><dd>{profile.fullName}</dd></div>
              <div><dt>Partido atual</dt><dd>{p.party}</dd></div>
              <div><dt>Estado</dt><dd>{p.uf}</dd></div>
              {profile.birthDate && <div><dt>Nascimento</dt><dd>{formatDate(profile.birthDate)}{profile.birthCity ? ` — ${profile.birthCity}${profile.birthUf ? `/${profile.birthUf}` : ''}` : ''}</dd></div>}
              {profile.gender && <div><dt>Sexo declarado</dt><dd>{profile.gender}</dd></div>}
              {profile.officeAddress && <div><dt>Endereço parlamentar</dt><dd>{profile.officeAddress}</dd></div>}
            </dl>
            <p className="fine">
              Cadastro institucional do Senado Federal, conforme publicado pela fonte oficial.
            </p>
          </section>

          <section className="profile-section votes-section" aria-label="Votações nominais">
            <h2>Votações nominais <Seal status="oficial-confirmada" compact /></h2>
            <p className="sub">
              Registro nominal publicado pelo Senado para cada votação de Plenário. O voto exibido
              é o voto oficial do parlamentar naquela votação — não é uma interpretação do portal.
            </p>
            {profile.votesNote && <p className="sync-warning" role="note"><b>Aviso da fonte:</b> {profile.votesNote}</p>}
            {profile.votes.length === 0 && <p className="empty-note">O serviço do Senado não retornou votações para este senador.</p>}
            <table className="table votes-table">
              <thead>
                <tr><th>Data</th><th>Matéria e votação</th><th className="num">Voto</th></tr>
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
          </section>
        </div>

        <p className="pending-note">
          Ainda não implementado neste perfil: matérias de autoria, presenças detalhadas, despesas da cota,
          viagens oficiais, notícias e informações judiciais. Esses módulos entram nas próximas fases —
          consulte o planejamento na <Link href="/metodologia">metodologia</Link>.
        </p>

        <SourceList sources={profile.sources} failed={profile.failedSources} />
      </div>
    </main>
  );
}
