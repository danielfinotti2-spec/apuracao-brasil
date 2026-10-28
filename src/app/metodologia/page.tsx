import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Seal from '@/components/Seal';
import Reveal from '@/components/Reveal';
import { pickLang, t, type Locale } from '@/i18n/messages';
import type { VerificationStatus } from '@/types/politician';

export const metadata = {
  title: 'Metodologia de verificação | Fiscaliza Brasil',
  description: 'Como o Fiscaliza Brasil coleta, verifica e rotula cada informação: selos de confiança, rastreio de fontes, neutralidade política e o que o portal nunca faz.',
};

type SealText = { status: VerificationStatus; text: string };
type Content = {
  h1: string; lede: string;
  sealsH: string; sealsSub: string; seals: SealText[];
  rulesH: string; rules: [string, string][];
  flowH: string; flowSub: string; flow: string[]; flowFine: string;
  corrH: string; corrP1: string; corrP2: string; corrBtn: string;
};

const CONTENT: Record<Locale, Content> = {
  pt: {
    h1: 'Metodologia de verificação',
    lede: 'Cada registro do portal carrega três coisas: a fonte consultada, a data da coleta e um selo de verificação. Os selos pertencem a cada dado — não existe pontuação geral de políticos.',
    sealsH: 'Os quatro selos',
    sealsSub: 'Aplicados por regras de origem e evidência, nunca pela “confiança” de um modelo de IA.',
    seals: [
      { status: 'oficial-confirmada', text: 'A informação foi encontrada e validada em um registro oficial identificável — por exemplo, a API de Dados Abertos da Câmara, o serviço de Dados Abertos do Senado ou malhas do IBGE. Cada registro guarda a URL exata consultada e a data da coleta.' },
      { status: 'corroborada', text: 'A informação foi confirmada por fontes independentes confiáveis, com evidências verificáveis. Reproduções da mesma matéria original em vários sites não contam como fontes independentes.' },
      { status: 'em-verificacao', text: 'A informação ainda não tem evidências suficientes ou apresenta divergências. Nesse estado, ela não é publicada como fato — aparece, quando aparece, marcada como não confirmada.' },
      { status: 'corrigida', text: 'O registro foi substituído, corrigido ou perdeu atualidade. Correções ficam registradas no histórico, nunca apagadas silenciosamente.' },
    ],
    rulesH: 'Regras do portal',
    rules: [
      ['Não inventamos dados', 'Se uma API oficial não publicou uma informação, a interface mostra a indisponibilidade e a última sincronização conhecida, em vez de preencher com estimativas ou números genéricos.'],
      ['Falhas de fonte ficam visíveis', 'Quando um órgão sai do ar ou muda o formato, a página exibe o aviso de indisponibilidade e o erro registrado. Sincronizações com erro nunca são escondidas.'],
      ['Sem conclusões por ausência', 'Não encontrar um evento público não prova que o político não trabalhou. Ausência de registro não é prova de ausência de atividade.'],
      ['Processo não é prova de culpa', 'Investigação, inquérito, denúncia, ação judicial, condenação recorrível e condenação definitiva são situações diferentes e serão sempre rotuladas separadamente quando o módulo judiciário entrar no ar.'],
      ['Identidade exige evidência', 'Nunca associamos processos, viagens ou notícias a um político apenas por semelhança de nome. Exigimos identificadores ou elementos suficientes para confirmar a correspondência.'],
      ['Resumos, não cópias', 'Notícias automáticas (fase futura) serão resumos originais com link para a fonte. Não copiamos matérias protegidas por direitos autorais.'],
      ['Neutralidade política', 'Não criamos rankings de melhores ou piores políticos, nem atribuímos notas de honestidade ou competência.'],
    ],
    flowH: 'Fluxo de coleta e atualização',
    flowSub: 'O que acontece entre a API oficial e a tela.',
    flow: [
      'Consulta. O servidor chama a API oficial (Câmara, Senado, IBGE) com cache e limites próprios.',
      'Validação. Formatos, datas e identificadores são conferidos e normalizados antes de exibir.',
      'Rastreio. A URL exata e o horário da coleta são guardados junto ao dado.',
      'Publicação. A página exibe o dado com o selo correspondente e os links de fonte.',
      'Indisponibilidade explícita. Se a fonte falha ou muda de formato, mostramos o aviso até ela voltar.',
    ],
    flowFine: 'Hoje a atualização acontece por revalidação de cache no servidor: diretório a cada hora, perfis a cada 30 minutos, quadro do dia a cada 15 minutos. O pipeline agendado com filas e histórico completo é uma das fases planejadas e ainda não está implementado.',
    corrH: 'Correções e direito de resposta',
    corrP1: 'Encontrou um erro? Descreva o problema na página de melhorias, nas issues do GitHub ou pelos canais públicos do projeto, informando a página e, se possível, a fonte oficial que comprova a correção.',
    corrP2: 'Alegações criminais, informações judiciais ambíguas e divergências de identidade sempre passarão por revisão humana antes de qualquer publicação.',
    corrBtn: 'Voltar ao diretório',
  },
  en: {
    h1: 'Verification methodology',
    lede: 'Every record in the portal carries three things: the queried source, the collection date and a verification seal. Seals belong to each record — there is no overall politician score.',
    sealsH: 'The four seals',
    sealsSub: 'Applied by origin-and-evidence rules, never by an AI model’s “confidence”.',
    seals: [
      { status: 'oficial-confirmada', text: 'The information was found and validated in an identifiable official record — for example, the Chamber’s open-data API, the Senate’s open-data service or IBGE meshes. Every record keeps the exact URL queried and the collection date.' },
      { status: 'corroborada', text: 'The information was confirmed by trustworthy independent sources with verifiable evidence. Reposts of the same original story on several sites do not count as independent sources.' },
      { status: 'em-verificacao', text: 'The information does not yet have sufficient evidence or shows divergences. In this state it is not published as fact — it appears, when it appears, marked as unconfirmed.' },
      { status: 'corrigida', text: 'The record was replaced, corrected or became outdated. Corrections stay in the history, never silently erased.' },
    ],
    rulesH: 'Portal rules',
    rules: [
      ['We never invent data', 'If an official API did not publish an item, the interface shows the unavailability and the last known sync instead of filling in estimates or generic numbers.'],
      ['Source failures stay visible', 'When a body goes offline or changes format, the page shows the unavailability notice and the recorded error. Failed syncs are never hidden.'],
      ['No conclusions from absence', 'Not finding a public event does not prove the politician did not work. Absence of records is not proof of absence of activity.'],
      ['A case is not proof of guilt', 'Investigation, inquiry, charge, lawsuit, appealable conviction and final conviction are different situations and will always be labeled separately when the judicial module goes live.'],
      ['Identity requires evidence', 'We never link cases, trips or news to a politician by name similarity alone. We require identifiers or sufficient elements to confirm the match.'],
      ['Summaries, not copies', 'Automated news (future phase) will be original summaries linking the source. We do not copy copyrighted stories.'],
      ['Political neutrality', 'We do not rank best or worst politicians, nor assign honesty or competence scores.'],
    ],
    flowH: 'Collection and update flow',
    flowSub: 'What happens between the official API and your screen.',
    flow: [
      'Query. The server calls the official API (Chamber, Senate, IBGE) with its own cache and limits.',
      'Validation. Formats, dates and identifiers are checked and normalized before display.',
      'Traceability. The exact URL and collection time are stored with the record.',
      'Publication. The page shows the record with the matching seal and source links.',
      'Explicit unavailability. If the source fails or changes format, we show the notice until it is back.',
    ],
    flowFine: 'Today, updates happen via server cache revalidation: directory hourly, profiles every 30 minutes, daily board every 15 minutes. The scheduled pipeline with queues and full history is a planned phase and is not implemented yet.',
    corrH: 'Corrections and right of reply',
    corrP1: 'Found an error? Describe the problem on the feedback page, in GitHub issues or through the project’s public channels, naming the page and, if possible, the official source proving the correction.',
    corrP2: 'Criminal allegations, ambiguous judicial information and identity divergences will always go through human review before any publication.',
    corrBtn: 'Back to the directory',
  },
  es: {
    h1: 'Metodología de verificación',
    lede: 'Cada registro del portal lleva tres cosas: la fuente consultada, la fecha de recolección y un sello de verificación. Los sellos pertenecen a cada dato — no existe una puntuación general de políticos.',
    sealsH: 'Los cuatro sellos',
    sealsSub: 'Aplicados por reglas de origen y evidencia, nunca por la “confianza” de un modelo de IA.',
    seals: [
      { status: 'oficial-confirmada', text: 'La información fue encontrada y validada en un registro oficial identificable — por ejemplo, la API de datos abiertos de la Cámara, el servicio de datos abiertos del Senado o mallas del IBGE. Cada registro guarda la URL exacta consultada y la fecha de recolección.' },
      { status: 'corroborada', text: 'La información fue confirmada por fuentes independientes confiables, con evidencia verificable. Las republicaciones de la misma historia original en varios sitios no cuentan como fuentes independientes.' },
      { status: 'em-verificacao', text: 'La información aún no tiene evidencia suficiente o presenta divergencias. En este estado no se publica como hecho — aparece, cuando aparece, marcada como no confirmada.' },
      { status: 'corrigida', text: 'El registro fue reemplazado, corregido o quedó desactualizado. Las correcciones quedan registradas en el historial, nunca eliminadas silenciosamente.' },
    ],
    rulesH: 'Reglas del portal',
    rules: [
      ['No inventamos datos', 'Si una API oficial no publicó una información, la interfaz muestra la indisponibilidad y la última sincronización conocida, en lugar de rellenar con estimaciones o números genéricos.'],
      ['Las fallas de fuente quedan visibles', 'Cuando un órgano se cae o cambia el formato, la página muestra el aviso de indisponibilidad y el error registrado. Las sincronizaciones con error nunca se esconden.'],
      ['Sin conclusiones por ausencia', 'No encontrar un evento público no prueba que el político no trabajó. La ausencia de registro no es prueba de ausencia de actividad.'],
      ['Un proceso no es prueba de culpabilidad', 'Investigación, pesquisa, denuncia, acción judicial, condena apelable y condena definitiva son situaciones distintas y siempre se rotularán por separado cuando el módulo judicial entre en el aire.'],
      ['La identidad exige evidencia', 'Nunca asociamos procesos, viajes o noticias a un político solo por similitud de nombre. Exigimos identificadores o elementos suficientes para confirmar la correspondencia.'],
      ['Resúmenes, no copias', 'Las noticias automáticas (fase futura) serán resúmenes originales con enlace a la fuente. No copiamos artículos protegidos por derechos de autor.'],
      ['Neutralidad política', 'No creamos rankings de mejores o peores políticos ni asignamos notas de honestidad o competencia.'],
    ],
    flowH: 'Flujo de recolección y actualización',
    flowSub: 'Lo que pasa entre la API oficial y tu pantalla.',
    flow: [
      'Consulta. El servidor llama a la API oficial (Cámara, Senado, IBGE) con caché y límites propios.',
      'Validación. Formatos, fechas e identificadores se verifican y normalizan antes de mostrarse.',
      'Rastreo. La URL exacta y la hora de recolección se guardan junto al dato.',
      'Publicación. La página muestra el dato con el sello correspondiente y los enlaces de fuente.',
      'Indisponibilidad explícita. Si la fuente falla o cambia de formato, mostramos el aviso hasta que vuelva.',
    ],
    flowFine: 'Hoy la actualización ocurre por revalidación de caché en el servidor: directorio cada hora, perfiles cada 30 minutos, tablero del día cada 15 minutos. El pipeline programado con colas e historial completo es una fase planificada y aún no está implementada.',
    corrH: 'Correcciones y derecho de respuesta',
    corrP1: '¿Encontraste un error? Describe el problema en la página de mejoras, en las issues de GitHub o por los canales públicos del proyecto, indicando la página y, si es posible, la fuente oficial que comprueba la corrección.',
    corrP2: 'Las alegaciones penales, la información judicial ambigua y las divergencias de identidad siempre pasarán por revisión humana antes de cualquier publicación.',
    corrBtn: 'Volver al directorio',
  },
};

export default async function MetodologiaPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const c = CONTENT[L];
  const q = L === 'pt' ? '' : `?lang=${L}`;
  return (
    <main className="site">
      <SiteHeader active="metodologia" lang={L} />
      <div className="site-body">
        <section className="page-head a" style={{ ['--ad' as any]: '80ms' }}>
          <h1>{c.h1}</h1>
          <p className="lede">{c.lede}</p>
        </section>

        <section className="bloco metodo-section a" style={{ ['--ad' as any]: '180ms' }} aria-label={c.sealsH}>
          <header>
            <h2>{c.sealsH}</h2>
            <p className="sub">{c.sealsSub}</p>
          </header>
          <div className="seal-grid">
            {c.seals.map(s => (
              <div className="seal-card" key={s.status}>
                <Seal status={s.status} lang={L} />
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <Reveal>
          <section className="bloco metodo-section" aria-label={c.rulesH}>
            <header><h2>{c.rulesH}</h2></header>
            <ul className="rules">
              {c.rules.map(([title, text]) => (
                <li key={title}><b>{title}</b><p>{text}</p></li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={80}>
          <section className="bloco metodo-section" aria-label={c.flowH}>
            <header>
              <h2>{c.flowH}</h2>
              <p className="sub">{c.flowSub}</p>
            </header>
            <ol className="flow">
              {c.flow.map((f, i) => <li key={i}>{f}</li>)}
            </ol>
            <p className="fine">{c.flowFine}</p>
          </section>
        </Reveal>

        <Reveal delay={140}>
          <section className="bloco metodo-section" aria-label={c.corrH}>
            <header><h2>{c.corrH}</h2></header>
            <p className="sub">{c.corrP1}</p>
            <p className="fine">{c.corrP2}</p>
            <p><Link className="btn primary" href={`/politicos${q}`}>{c.corrBtn}</Link></p>
          </section>
        </Reveal>
      </div>

      <SiteFooter lang={L} />
    </main>
  );
}
