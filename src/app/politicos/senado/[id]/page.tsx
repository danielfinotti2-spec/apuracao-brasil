import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import Seal from '@/components/Seal';
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

const voteClass = (vote: string) => {
  const v = vote.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (v.startsWith('sim')) return 'vote-yes';
  if (v.startsWith('nao')) return 'vote-no';
  return 'vote-other';
};

export default async function SenadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getSenadorProfile(id).catch(() => null);
  if (!profile) notFound();
  const p = profile.summary;

  return (
    <main className="site">
      <SiteHeader />
      <nav className="crumbs profile-crumbs" aria-label="Navegação">
        <Link href="/">Início</Link><span>/</span><Link href="/politicos">Políticos</Link><span>/</span><span className="on">{p.name}</span>
      </nav>

      <header className="profile-hero">
        <img className="profile-photo" src={p.photoUrl} alt={`Foto oficial de ${p.name}`} referrerPolicy="no-referrer" />
        <div className="profile-id">
          <div className="profile-tags">
            <span className="badge">{p.office}</span>
            <span className="badge">{p.party} · {p.uf}</span>
            <Seal status="oficial-confirmada" />
          </div>
          <h1>{p.name}</h1>
          <p className="sub">Nome completo: {profile.fullName}</p>
          <div className="profile-contacts">
            {profile.email && <span>✉ {profile.email}</span>}
            {profile.officeAddress && <span>🏛 {profile.officeAddress}</span>}
            {p.officialUrl && <a href={p.officialUrl} target="_blank" rel="noreferrer">Página no Senado ↗</a>}
          </div>
        </div>
      </header>

      <section className="profile-kpis">
        <div><span>Votações nominais registradas</span><b>{profile.votes.length}</b><small>histórico publicado pelo serviço do Senado</small></div>
        <div><span>Votos "Sim"</span><b>{profile.votes.filter(v => v.vote.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().startsWith('sim')).length}</b><small>neste histórico</small></div>
        <div><span>Votos "Não"</span><b>{profile.votes.filter(v => v.vote.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().startsWith('nao')).length}</b><small>neste histórico</small></div>
      </section>

      <div className="profile-grid">
        <section className="profile-section" aria-label="Informações institucionais">
          <h2>Visão geral</h2>
          <dl className="facts">
            <div><dt>Nome completo</dt><dd>{profile.fullName}</dd></div>
            <div><dt>Partido atual</dt><dd>{p.party}</dd></div>
            <div><dt>Estado</dt><dd>{p.uf}</dd></div>
            {profile.birthDate && <div><dt>Nascimento</dt><dd>{formatDate(profile.birthDate)}{profile.birthCity ? ` · ${profile.birthCity}${profile.birthUf ? `/${profile.birthUf}` : ''}` : ''}</dd></div>}
            {profile.gender && <div><dt>Sexo declarado</dt><dd>{profile.gender}</dd></div>}
            {profile.officeAddress && <div><dt>Endereço parlamentar</dt><dd>{profile.officeAddress}</dd></div>}
          </dl>
          <p className="fine">Dados do cadastro institucional do Senado Federal, conforme publicados pela fonte oficial.</p>
        </section>

        <section className="profile-section votes-section" aria-label="Votações nominais">
          <h2>Votações nominais <Seal status="oficial-confirmada" compact /></h2>
          <p className="sub">
            Registro nominal publicado pelo Senado para cada votação de Plenário. O voto exibido é o voto oficial
            do parlamentar naquela votação — não é uma interpretação do portal.
          </p>
          {profile.votesNote && <p className="sync-warning">⚠ {profile.votesNote}</p>}
          {profile.votes.length === 0 && <p className="empty-note">O serviço do Senado não retornou votações para este senador.</p>}
          <ul className="record-list votes">
            {profile.votes.slice(0, 30).map((v, i) => (
              <li key={`${v.matterCode}-${v.date}-${i}`}>
                <time>{formatDate(v.date)}</time>
                <div>
                  <b>{v.matter || v.description || 'Votação nominal'}</b>
                  <small>{v.description}{v.result ? ` · Resultado: ${v.result}` : ''}{v.secret ? ' · votação secreta' : ''}</small>
                </div>
                <span className={`vote ${voteClass(v.vote)}`}>{v.vote || '—'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="pending-note">
        Módulos ainda não implementados neste perfil: matérias de autoria, presenças detalhadas, despesas da cota do Senado
        exercidas como cota parlamentar detalhada, viagens oficiais, notícias e informações judiciais. Eles entram nas
        próximas fases — acompanhe o planejamento na <Link href="/metodologia">metodologia</Link>.
      </p>

      <SourceList sources={profile.sources} failed={profile.failedSources} />
    </main>
  );
}
