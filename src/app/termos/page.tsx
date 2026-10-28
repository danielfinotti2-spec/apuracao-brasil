import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Reveal from '@/components/Reveal';
import { pickLang, type Locale } from '@/i18n/messages';

export const metadata = { title: 'Termos de uso | Fiscaliza Brasil' };

type Section = { h: string; ps: string[] };
const CONTENT: Record<Locale, { h1: string; v: string; intro: string; sections: Section[] }> = {
  pt: {
    h1: 'Termos de uso e limites de responsabilidade',
    v: 'Versão 1.0 — leia com atenção. Ao usar o Fiscaliza Brasil, você concorda com estas condições.',
    intro: 'Este portal é um projeto independente de transparência pública. Ele reúne, organiza e republica dados oficiais, mas não é um site do governo, de partido, de tribunal ou de qualquer casa legislativa.',
    sections: [
      { h: '1. Natureza do portal', ps: [
        'O Fiscaliza Brasil é uma iniciativa editorial independente, sem vínculo com órgãos públicos, partidos ou candidatos. Os símbolos de instituições e os distintivos partidários exibidos são representações autorais e não são os logotipos oficiais registrados.',
        'Nada aqui constitui comunicado oficial do Estado brasileiro, nem substitui os portais oficiais das fontes.',
      ] },
      { h: '2. Precisão e disponibilidade dos dados', ps: [
        'Todo conteúdo é coletado de fontes oficiais públicas, com a URL exata e a data da coleta exibidas na página. Mesmo assim, atrasos, mudanças de formato e indisponibilidades das fontes podem ocorrer sem aviso.',
        'O portal é oferecido “como está”, sem garantia de exatidão integral, completude ou disponibilidade contínua. Antes de tomar decisões — judiciais, eleitorais, jornalísticas ou de qualquer natureza — confira sempre a fonte oficial.',
        'Quando uma fonte não publica uma informação, mostramos a indisponibilidade em vez de estimar números. Ausência de registro numa fonte não é prova de ausência de atividade do parlamentar.',
      ] },
      { h: '3. Neutralidade política', ps: [
        'Não criamos rankings de “melhores” ou “piores” políticos, não atribuímos notas de honestidade ou competência e não damos recomendações de voto. Destaques automatizados (como o destaque do dia) são critérios objetivos e declarados, nunca julgamento de valor.',
      ] },
      { h: '4. Presunção de inocência', ps: [
        'Investigação, denúncia, ação judicial, condenação recorrível e condenação definitiva são situações jurídicas diferentes. Quando houver módulo judicial, os rótulos serão sempre separados e a presunção de inocência prevalecerá.',
        'Um processo não é prova de culpa. Nenhum conteúdo do portal deve ser interpretado como afirmação de crime por parte de qualquer pessoa.',
      ] },
      { h: '5. Conteúdo de terceiros', ps: [
        'Comentários e sugestões publicados na página de melhorias são de responsabilidade de seus autores. Podemos remover, sem aviso, conteúdo ilegal, calunioso, difamatório, discriminatório ou que exponha dados pessoais.',
        'Fotos de parlamentares são as fotos oficiais publicadas pelas casas legislativas para divulgação.',
      ] },
      { h: '6. Privacidade (LGPD)', ps: [
        'O portal não coleta dados pessoais identificáveis além dos enviados voluntariamente no formulário de melhorias (nome opcional e mensagem), usados apenas para exibição e moderação no quadro público correspondente.',
        'Não usamos rastreadores de terceiros. As preferências de tema e idioma são gravadas apenas no seu navegador.',
      ] },
      { h: '7. Limitação de responsabilidade', ps: [
        'Na máxima extensão permitida pela lei brasileira, o criador do portal não responde por danos diretos, indiretos ou consequentes decorrentes do uso, da indisponibilidade ou de interpretações do conteúdo, sem prejuízo do dever de corrigir informações.',
      ] },
      { h: '8. Correções e direito de resposta', ps: [
        'Erros podem ser relatados na página de melhorias, nas issues do GitHub ou pelos canais públicos do projeto. Correções ficam registradas e ninguém é responsabilizado por alegações sem revisão prévia.',
        'Identificado um erro ou querendo responder a um conteúdo, a pessoa retratada ou seu defensor tem direito de resposta, com a mesma evidência.',
      ] },
      { h: '9. Lei aplicável e foro', ps: [
        'Estes termos seguem a legislação brasileira, incluindo o Marco Civil da Internet (Lei nº 12.965/2014) e a LGPD (Lei nº 13.709/2018). Fica eleito o foro da comarca do domicílio do criador do portal para eventuais controvérsias.',
      ] },
    ],
  },
  en: {
    h1: 'Terms of use and limits of liability',
    v: 'Version 1.0 — read carefully. By using Fiscaliza Brasil you agree to these conditions.',
    intro: 'This portal is an independent public-transparency project. It gathers, organizes and republishes official data, but it is not a government, party, court or legislative-chamber website.',
    sections: [
      { h: '1. Nature of the portal', ps: [
        'Fiscaliza Brasil is an independent editorial initiative with no ties to public bodies, parties or candidates. Institution icons and party badges shown are original representations, not the official registered logos.',
        'Nothing here constitutes an official statement of the Brazilian State, nor replaces the official portals of the sources.',
      ] },
      { h: '2. Data accuracy and availability', ps: [
        'All content is collected from public official sources, with the exact URL and collection date shown on the page. Even so, delays, format changes and source outages may happen without notice.',
        'The portal is provided “as is”, with no warranty of full accuracy, completeness or continuous availability. Before making decisions — legal, electoral, journalistic or otherwise — always check the official source.',
        'When a source does not publish an item, we show the unavailability instead of estimating numbers. Absence of a record in a source is not proof of a member’s inactivity.',
      ] },
      { h: '3. Political neutrality', ps: [
        'We do not rank “best” or “worst” politicians, assign honesty or competence scores, or recommend votes. Automated highlights (such as the daily highlight) follow stated objective criteria, never value judgments.',
      ] },
      { h: '4. Presumption of innocence', ps: [
        'Investigation, charge, lawsuit, appealable conviction and final conviction are different legal situations. Whenever a judicial module goes live, labels will stay separated and the presumption of innocence will prevail.',
        'A case is not proof of guilt. No content in this portal should be read as an accusation of crime against any person.',
      ] },
      { h: '5. Third-party content', ps: [
        'Comments and suggestions published on the feedback page are their authors’ responsibility. We may remove, without notice, illegal, libelous, defamatory, discriminatory or personal-data-exposing content.',
        'Politicians’ photos are the official photos published by the legislative chambers for publicity.',
      ] },
      { h: '6. Privacy (LGPD)', ps: [
        'The portal collects no personally identifiable data beyond what is voluntarily sent in the feedback form (optional name and message), used only for display and moderation on the corresponding public board.',
        'We use no third-party trackers. Theme and language preferences are stored only in your browser.',
      ] },
      { h: '7. Limitation of liability', ps: [
        'To the maximum extent allowed by Brazilian law, the creator of the portal is not liable for direct, indirect or consequential damages arising from use, unavailability or interpretation of the content, without prejudice to the duty to correct information.',
      ] },
      { h: '8. Corrections and right of reply', ps: [
        'Errors can be reported on the feedback page, in GitHub issues or through the project’s public channels. Corrections are recorded, and no one is treated as responsible for allegations without prior review.',
        'Once an error is flagged or a reply requested, the depicted person or their counsel has a right of reply with the same prominence.',
      ] },
      { h: '9. Applicable law and venue', ps: [
        'These terms follow Brazilian law, including the Brazilian Internet Bill of Rights (Law 12,965/2014) and the LGPD (Law 13,709/2018). The competent venue is the court of the portal creator’s domicile.',
      ] },
    ],
  },
  es: {
    h1: 'Términos de uso y límites de responsabilidad',
    v: 'Versión 1.0 — lea con atención. Al usar Fiscaliza Brasil, usted acepta estas condiciones.',
    intro: 'Este portal es un proyecto independiente de transparencia pública. Reúne, organiza y republica datos oficiales, pero no es un sitio del gobierno, de un partido, de un tribunal ni de ninguna cámara legislativa.',
    sections: [
      { h: '1. Naturaleza del portal', ps: [
        'Fiscaliza Brasil es una iniciativa editorial independiente, sin vínculos con órganos públicos, partidos o candidatos. Los íconos de instituciones y distintivos partidarios son representaciones autorales, no los logotipos oficiales registrados.',
        'Nada aquí constituye un comunicado oficial del Estado brasileño ni reemplaza los portales oficiales de las fuentes.',
      ] },
      { h: '2. Precisión y disponibilidad de los datos', ps: [
        'Todo el contenido se recolecta de fuentes oficiales públicas, con la URL exacta y la fecha de recolección mostradas en la página. Aun así, retrasos, cambios de formato e indisponibilidades de las fuentes pueden ocurrir sin aviso.',
        'El portal se ofrece “tal cual”, sin garantía de exactitud integral, integridad o disponibilidad continua. Antes de tomar decisiones — judiciales, electorales, periodísticas o de cualquier tipo — verifique siempre la fuente oficial.',
        'Cuando una fuente no publica una información, mostramos la indisponibilidad en lugar de estimar números. La ausencia de registro en una fuente no es prueba de ausencia de actividad del parlamentario.',
      ] },
      { h: '3. Neutralidad política', ps: [
        'No creamos rankings de “mejores” o “peores” políticos, no asignamos notas de honestidad o competencia y no recomendamos voto. Los destacados automatizados (como el del día) siguen criterios objetivos declarados, nunca juicios de valor.',
      ] },
      { h: '4. Presunción de inocencia', ps: [
        'Investigación, denuncia, acción judicial, condena apelable y condena definitiva son situaciones jurídicas distintas. Cuando el módulo judicial entre en el aire, los rótulos se mantendrán separados y la presunción de inocencia prevalecerá.',
        'Un proceso no es prueba de culpabilidad. Ningún contenido del portal debe interpretarse como afirmación de delito contra cualquier persona.',
      ] },
      { h: '5. Contenido de terceros', ps: [
        'Los comentarios y sugerencias publicados en la página de mejoras son responsabilidad de sus autores. Podemos eliminar, sin aviso, contenido ilegal, calumnioso, difamatorio, discriminatorio o que exponga datos personales.',
        'Las fotos de parlamentarios son las fotos oficiales publicadas por las cámaras legislativas para divulgación.',
      ] },
      { h: '6. Privacidad (LGPD)', ps: [
        'El portal no recolecta datos personales identificables más allá de los enviados voluntariamente en el formulario de mejoras (nombre opcional y mensaje), usados solo para exhibición y moderación en el tablero público correspondiente.',
        'No usamos rastreadores de terceros. Las preferencias de tema e idioma se guardan solo en su navegador.',
      ] },
      { h: '7. Limitación de responsabilidad', ps: [
        'En la máxima medida permitida por la ley brasileña, el creador del portal no responde por daños directos, indirectos o consecuentes derivados del uso, la indisponibilidad o la interpretación del contenido, sin perjuicio del deber de corregir informaciones.',
      ] },
      { h: '8. Correcciones y derecho de respuesta', ps: [
        'Los errores pueden informarse en la página de mejoras, en las issues de GitHub o por los canales públicos del proyecto. Las correcciones quedan registradas y nadie es tratado como culpable por alegaciones sin revisión previa.',
        'Una vez señalado un error o solicitada una respuesta, la persona retratada o su defensor tiene derecho de respuesta con la misma prominencia.',
      ] },
      { h: '9. Ley aplicable y fuero', ps: [
        'Estos términos siguen la legislación brasileña, incluido el Marco Civil de Internet (Ley 12.965/2014) y la LGPD (Ley 13.709/2018). El fuero elegido es el del domicilio del creador del portal.',
      ] },
    ],
  },
};

export default async function TermosPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const L = pickLang(await searchParams);
  const c = CONTENT[L];
  return (
    <main className="site">
      <SiteHeader lang={L} />
      <div className="site-body">
        <section className="page-head a" style={{ ['--ad' as any]: '60ms' }}>
          <h1>{c.h1}</h1>
          <p className="lede">{c.v}</p>
          <p className="sub">{c.intro}</p>
        </section>
        {c.sections.map((s, i) => (
          <Reveal key={s.h} delay={Math.min(i * 60, 240)}>
            <section className="bloco metodo-section">
              <header><h2>{s.h}</h2></header>
              {s.ps.map((p, j) => <p className="sub" key={j}>{p}</p>)}
            </section>
          </Reveal>
        ))}
      </div>
      <SiteFooter lang={L} />
    </main>
  );
}
