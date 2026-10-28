import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Reveal from '@/components/Reveal';
import SocialLinks from '@/components/SocialLinks';
import PixCopy from '@/components/PixCopy';
import { pickLang, t, type Locale } from '@/i18n/messages';

export const metadata = { title: 'Apoie o projeto | Fiscaliza Brasil' };

// Chave Pix (aleatória) do criador do portal — fornecida por ele nesta sessão.
const PIX_KEY = '6a23c1f5-b246-457d-970c-c41b8a0220e0';

const CONTENT: Record<Locale, {
  h1: string; lede: string;
  ways: { h: string; p: string }[];
  donateH: string; donateP: string;
  gh: string; questions: string; back: string;
}> = {
  pt: {
    h1: 'Apoie este projeto',
    lede: 'O Fiscaliza Brasil é mantido por uma pessoa, no tempo livre, sem verba de partido, empresa ou órgão público. Existem quatro formas reais de ajudar hoje.',
    ways: [
      { h: 'Use e compartilhe', p: 'Quanto mais gente olha os dados oficiais, mais forte a fiscalização. Compartilhe perfis e o quadro do dia — cada página já nasce pronta para isso.' },
      { h: 'Reporte erros', p: 'Dado errado, link quebrado, tradução ruim? Abra um comentário na página de melhorias ou uma issue no GitHub. Correções boas entram com registro público.' },
      { h: 'Contribua com código', p: 'O projeto é aberto. Issues, pull requests e revisões de acessibilidade e design são muito bem-vindas no repositório.' },
      { h: 'Desenvolvimento e infra', p: 'Servidor (Vercel), banco Postgres e horas de desenvolvimento custam dinheiro. Se quiser patrocinar, fale primeiro pelos canais abaixo para combinarmos a forma com total transparência — e confira que você está falando com o criador oficial.' },
    ],
    donateH: 'Sobre doações em dinheiro',
    donateP: 'Ainda não publicamos chave Pix nem conta. Até lá, desconfie de qualquer chave divulgada em nome do portal — não aceite intermediários. Quando o canal oficial existir, ele será publicado nesta página, vinculado ao criador, com prestação de contas visível.',
    gh: 'Abrir repositório no GitHub',
    questions: 'Falar com o criador',
    back: 'Voltar ao início',
  },
  en: {
    h1: 'Support this project',
    lede: 'Fiscaliza Brasil is run by one person, in their free time, with no money from parties, companies or public bodies. There are four real ways to help today.',
    ways: [
      { h: 'Use and share', p: 'The more people look at official data, the stronger the oversight. Share profiles and the daily board — every page is built ready for that.' },
      { h: 'Report errors', p: 'Wrong data, broken link, bad translation? Leave a comment on the feedback page or open a GitHub issue. Good corrections go in with a public record.' },
      { h: 'Contribute code', p: 'The project is open. Issues, pull requests and accessibility/design reviews are very welcome in the repository.' },
      { h: 'Development and infrastructure', p: 'Hosting (Vercel), the Postgres database and development hours cost money. If you want to sponsor, talk to us first through the channels below to agree on the form with full transparency — and make sure you are talking to the official creator.' },
    ],
    donateH: 'About cash donations',
    donateP: 'We have not published a Pix key or account yet. Until then, distrust any key shared in the portal’s name — do not accept intermediaries. When the official channel exists, it will be published on this page, tied to the creator, with visible accountability.',
    gh: 'Open the GitHub repository',
    questions: 'Talk to the creator',
    back: 'Back to home',
  },
  es: {
    h1: 'Apoya este proyecto',
    lede: 'Fiscaliza Brasil es mantenido por una persona, en su tiempo libre, sin dinero de partidos, empresas u órganos públicos. Hoy hay cuatro formas reales de ayudar.',
    ways: [
      { h: 'Usa y comparte', p: 'Cuanta más gente mira los datos oficiales, más fuerte es la fiscalización. Comparte perfiles y el tablero del día — cada página nace lista para eso.' },
      { h: 'Reporta errores', p: '¿Dato equivocado, enlace roto, mala traducción? Deja un comentario en la página de mejoras o abre una issue en GitHub. Las buenas correcciones entran con registro público.' },
      { h: 'Contribuye con código', p: 'El proyecto es abierto. Issues, pull requests y revisiones de accesibilidad y diseño son muy bienvenidas en el repositorio.' },
      { h: 'Desarrollo e infraestructura', p: 'Hosting (Vercel), la base Postgres y las horas de desarrollo cuestan dinero. Si quieres patrocinar, habla primero por los canales de abajo para acordar la forma con total transparencia — y verifica que hablas con el creador oficial.' },
    ],
    donateH: 'Sobre las donaciones en dinero',
    donateP: 'Todavía no publicamos clave Pix ni cuenta. Hasta entonces, desconfía de cualquier clave divulgada en nombre del portal — no aceptes intermediarios. Cuando exista el canal oficial, será publicado en esta página, vinculado al creador, con rendición de cuentas visible.',
    gh: 'Abrir el repositorio en GitHub',
    questions: 'Hablar con el creador',
    back: 'Volver al inicio',
  },
};

export default async function ApoiarPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const c = CONTENT[L];
  const q = L === 'pt' ? '' : `?lang=${L}`;
  return (
    <main className="site">
      <SiteHeader lang={L} />
      <div className="site-body">
        <section className="page-head a" style={{ ['--ad' as any]: '60ms' }}>
          <h1>{c.h1}</h1>
          <p className="lede">{c.lede}</p>
        </section>

        <div className="ways-grid">
          {c.ways.map((w, i) => (
            <Reveal key={w.h} delay={i * 80}>
              <div className="way-card">
                <span className="way-num">{String(i + 1).padStart(2, '0')}</span>
                <h2>{w.h}</h2>
                <p>{w.p}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <section className="bloco" aria-label={t(L, 'pix.h2')}>
            <header><h2>{t(L, 'pix.h2')}</h2></header>
            <p className="sub">{t(L, 'pix.note')}</p>
            <div className="pix-box">
              <span className="pix-qr"><img src="/pix-qr.png" alt="QR Code Pix do criador do portal" /></span>
              <div>
                <p className="pix-key">{PIX_KEY}</p>
                <PixCopy pixKey={PIX_KEY} cta={t(L, 'pix.cta')} copied={t(L, 'pix.copied')} />
              </div>
            </div>
          </section>
        </Reveal>

        <section className="bloco apoiar-actions">
          <a className="btn primary" href="https://github.com/danielfinotti2-spec/apuracao-brasil" target="_blank" rel="noreferrer">{c.gh}</a>
          <SocialLinks />
          <Link className="btn" href={`/${q}`}>{c.back}</Link>
        </section>
      </div>
      <SiteFooter lang={L} />
    </main>
  );
}
