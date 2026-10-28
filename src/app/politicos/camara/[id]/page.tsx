import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import Seal from '@/components/Seal';
import CountUp from '@/components/CountUp';
import SourceList from '@/components/SourceList';
import { getDeputadoProfile } from '@/services/camara';
import { formatDate, formatDateTime, formatMoney, MONTHS } from '@/lib/format';

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

export default async function DeputadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getDeputadoProfile(id).catch(() => null);
  if (!profile) notFound();
  const p = profile.summary;
  const maxExpense = profile.expenses.groups[0]?.total || 1;

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
              {profile.status && <span className="status-tag">{profile.status}</span>}
              <Seal status="oficial-confirmada" />
            </div>
            <h1>{p.name}</h1>
            <p className="sub">
              Nome civil: {profile.civilName}
              {profile.electoralCondition ? ` — condição eleitoral: ${profile.electoralCondition}` : ''}
            </p>
            <div className="profile-contacts">
              {profile.email && <span><b>E-mail:</b> {profile.email}</span>}
              {profile.officeRoom && <span><b>Gabinete:</b> {profile.officeRoom}{profile.officePhone ? `, tel. ${profile.officePhone}` : ''}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer">Site oficial</a>}
              <a href={p.officialUrl} target="_blank" rel="noreferrer">Página na Câmara</a>
            </div>
          </div>
        </header>

        <section className="profile-kpis a" style={{ ['--ad' as any]: '180ms' }} aria-label="Resumo">
          <div>
            <span>Proposições de autoria</span>
            <b><CountUp value={profile.proposals.length} /></b>
            <small>mais recentes registradas na API</small>
          </div>
          <div>
            <span>Despesas no período carregado</span>
            <b><CountUp value={profile.expenses.periodTotal} format="money" /></b>
            <small>{profile.expenses.loadedMonths}</small>
          </div>
          <div>
            <span>Eventos oficiais em 90 dias</span>
            <b><CountUp value={profile.events.items.length} /></b>
            <small>participações registradas na agenda</small>
          </div>
        </section>

        <div className="profile-grid a" style={{ ['--ad' as any]: '280ms' }}>
          <section className="profile-section" aria-label="Informações institucionais">
            <h2>Visão geral</h2>
            <dl className="facts">
              <div><dt>Nome civil</dt><dd>{profile.civilName}</dd></div>
              <div><dt>Partido atual</dt><dd>{p.party}</dd></div>
              <div><dt>Estado</dt><dd>{p.uf}</dd></div>
              {profile.birthDate && <div><dt>Nascimento</dt><dd>{formatDate(profile.birthDate)}{profile.birthCity ? ` — ${profile.birthCity}${profile.birthUf ? `/${profile.birthUf}` : ''}` : ''}</dd></div>}
              {profile.schooling && <div><dt>Escolaridade declarada</dt><dd>{profile.schooling}</dd></div>}
              {profile.status && <div><dt>Situação do mandato</dt><dd>{profile.status}</dd></div>}
              {profile.electoralCondition && <div><dt>Condição eleitoral</dt><dd>{profile.electoralCondition}</dd></div>}
            </dl>
            <p className="fine">
              Cadastro institucional da Câmara dos Deputados. Foto e dados pessoais exibidos
              conforme publicados pela fonte oficial.
            </p>
          </section>

          <section className="profile-section" aria-label="Despesas da cota parlamentar">
            <h2>Despesas da cota parlamentar <Seal status="oficial-confirmada" compact /></h2>
            <p className="sub">Período carregado: {profile.expenses.loadedMonths}. Valores líquidos reembolsados.</p>
            {profile.expenses.groups.length === 0 && <p className="empty-note">A API não retornou despesas para este período.</p>}
            {profile.expenses.groups.length > 0 && (
              <table className="table">
                <thead>
                  <tr><th>Tipo de despesa</th><th className="num">Notas</th><th className="num">Total líquido</th></tr>
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
                <h3 className="inner-title">Últimos lançamentos</h3>
                <ul className="record-list">
                  {profile.expenses.recent.slice(0, 10).map((e, i) => (
                    <li key={i}>
                      <time>{MONTHS[e.month] ?? e.month}/{e.year}</time>
                      <div><b>{e.type}</b><small>{e.supplier}{e.supplierDocument ? ` — ${e.supplierDocument}` : ''}</small></div>
                      <b>{formatMoney(e.netValue)}</b>
                      {e.documentUrl && <a href={e.documentUrl} target="_blank" rel="noreferrer" aria-label="Abrir documento fiscal">documento</a>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="profile-section" aria-label="Proposições de autoria">
            <h2>Proposições de autoria <Seal status="oficial-confirmada" compact /></h2>
            <p className="sub">Matérias mais recentes com autoria registrada na API da Câmara.</p>
            {profile.proposals.length === 0 && <p className="empty-note">Nenhuma proposição de autoria retornada pela API para este deputado.</p>}
            <ul className="record-list">
              {profile.proposals.map(pr => (
                <li key={pr.id}>
                  <span className="prop-id">{pr.type} {pr.number}{pr.year ? `/${pr.year}` : ''}</span>
                  <div><b>{pr.summary}</b>{pr.presentedAt && <small>apresentada em {formatDate(pr.presentedAt)}</small>}</div>
                  <a href={pr.portalUrl} target="_blank" rel="noreferrer">tramitação</a>
                </li>
              ))}
            </ul>
          </section>

          <section className="profile-section" aria-label="Agenda oficial recente">
            <h2>Agenda oficial <Seal status="oficial-confirmada" compact /></h2>
            <p className="sub">
              Participações em eventos oficiais entre {formatDate(profile.events.periodStart)} e {formatDate(profile.events.periodEnd)}.
              Se a lista estiver vazia, isso significa apenas que nenhuma participação foi registrada
              nesta fonte no período — não que o deputado não tenha trabalhado.
            </p>
            {profile.events.items.length === 0 && <p className="empty-note">A API não retornou eventos neste período para este deputado.</p>}
            <ul className="record-list">
              {profile.events.items.slice(0, 12).map(ev => (
                <li key={ev.id}>
                  <time>{formatDateTime(ev.startsAt)}</time>
                  <div><b>{ev.type}</b><small>{ev.title}{ev.location ? ` — ${ev.location}` : ''}{ev.situation ? ` (${ev.situation})` : ''}</small></div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="pending-note">
          Ainda não implementado neste perfil: notícias relacionadas, voto nominal em cada votação da Câmara,
          viagens oficiais, histórico partidário completo e informações judiciais. Esses módulos entram nas
          próximas fases — consulte o planejamento na <Link href="/metodologia">metodologia</Link>.
        </p>

        <SourceList sources={profile.sources} failed={profile.failedSources} />
      </div>
    </main>
  );
}
