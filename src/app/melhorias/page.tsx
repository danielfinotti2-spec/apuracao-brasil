import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import FeedbackBoard from '@/components/FeedbackBoard';
import { pickLang, type Locale } from '@/i18n/messages';

export const metadata = { title: 'Melhorias e comentários | Fiscaliza Brasil' };

const CONTENT: Record<Locale, {
  h1: string; lede: string;
  formTitle: string; kindImprove: string; kindBug: string; namePh: string; messagePh: string;
  submit: string; sending: string; submitted: string; listTitle: string; empty: string;
  noDb: string; githubHint: string;
}> = {
  pt: {
    h1: 'Melhorias e comentários',
    lede: 'Diga o que falta, o que está errado e o que quer ver a seguir. Seu comentário vai para o quadro público junto com a data — prioridades ficam visíveis.',
    formTitle: 'Enviar comentário', kindImprove: 'Melhoria', kindBug: 'Erro',
    namePh: 'Seu nome (opcional)', messagePh: 'Descreva a ideia ou o erro com o máximo de detalhes…',
    submit: 'Publicar no quadro', sending: 'Enviando…', submitted: 'Publicado. Obrigado por melhorar o portal!',
    listTitle: 'Quadro público', empty: 'Ainda não há comentários. Seja o primeiro.',
    noDb: 'O quadro público usa um banco Postgres que ainda não está conectado neste ambiente — enquanto isso, registre uma issue no',
    githubHint: 'no GitHub',
  },
  en: {
    h1: 'Improvements and comments',
    lede: 'Tell us what is missing, what is wrong and what you want next. Your comment goes to the public board with its date — priorities stay visible.',
    formTitle: 'Send a comment', kindImprove: 'Improvement', kindBug: 'Bug',
    namePh: 'Your name (optional)', messagePh: 'Describe the idea or the bug in as much detail as possible…',
    submit: 'Publish to the board', sending: 'Sending…', submitted: 'Published. Thanks for improving the portal!',
    listTitle: 'Public board', empty: 'No comments yet. Be the first.',
    noDb: 'The public board uses a Postgres database not yet connected in this environment — meanwhile, open an issue on',
    githubHint: 'on GitHub',
  },
  es: {
    h1: 'Mejoras y comentarios',
    lede: 'Diga qué falta, qué está mal y qué quieres ver después. Tu comentario entra al tablero público con la fecha — las prioridades quedan visibles.',
    formTitle: 'Enviar comentario', kindImprove: 'Mejora', kindBug: 'Error',
    namePh: 'Tu nombre (opcional)', messagePh: 'Describe la idea o el error con el máximo de detalles…',
    submit: 'Publicar en el tablero', sending: 'Enviando…', submitted: 'Publicado. ¡Gracias por mejorar el portal!',
    listTitle: 'Tablero público', empty: 'Todavía no hay comentarios. Sé el primero.',
    noDb: 'El tablero público usa una base Postgres aún no conectada en este ambiente — mientras tanto, registra una issue en',
    githubHint: 'en GitHub',
  },
};

export default async function MelhoriasPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const c = CONTENT[L];
  return (
    <main className="site">
      <SiteHeader lang={L} />
      <div className="site-body">
        <section className="page-head a" style={{ ['--ad' as any]: '60ms' }}>
          <h1>{c.h1}</h1>
          <p className="lede">{c.lede}</p>
        </section>
        <FeedbackBoard
          localeTag={L === 'en' ? 'en-US' : L === 'es' ? 'es-ES' : 'pt-BR'}
          labels={{
            formTitle: c.formTitle, kindImprove: c.kindImprove, kindBug: c.kindBug,
            namePh: c.namePh, messagePh: c.messagePh, submit: c.submit, sending: c.sending,
            submitted: c.submitted, listTitle: c.listTitle, empty: c.empty, noDb: c.noDb,
            githubHint: c.githubHint,
          }}
        />
        <p className="fine">
          {L === 'en'
            ? 'Text, email links and navigation routes require no database. The board table is created automatically on first use (CREATE TABLE IF NOT EXISTS improvements).'
            : L === 'es'
              ? 'La tabla del tablero se crea automáticamente en el primer uso (CREATE TABLE IF NOT EXISTS improvements).'
              : 'A tabela do quadro é criada automaticamente no primeiro uso (CREATE TABLE IF NOT EXISTS improvements). No banco configurado ficam: tipo, nome opcional, mensagem e data — nada mais.'}
        </p>
      </div>
      <SiteFooter lang={L} />
    </main>
  );
}
