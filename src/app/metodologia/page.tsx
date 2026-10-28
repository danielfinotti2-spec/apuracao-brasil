import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import Seal from '@/components/Seal';

export const metadata = {
  title: 'Metodologia de verificação | Fiscaliza Brasil',
  description: 'Como o Fiscaliza Brasil coleta, verifica e rotula cada informação: selos de confiança, rastreio de fontes, neutralidade política e o que o portal nunca faz.',
};

const SEALS = [
  {
    status: 'oficial-confirmada' as const,
    text: 'A informação foi encontrada e validada em um registro oficial identificável — por exemplo, a API de Dados Abertos da Câmara, o serviço de Dados Abertos do Senado ou a divulgação de resultados do TSE. Cada registro guarda a URL exata consultada e a data da coleta.',
  },
  {
    status: 'corroborada' as const,
    text: 'A informação foi confirmada por fontes independentes confiáveis, com evidências verificáveis. Reproduções da mesma matéria original em vários sites não contam como fontes independentes.',
  },
  {
    status: 'em-verificacao' as const,
    text: 'A informação ainda não tem evidências suficientes ou apresenta divergências. Nesse estado, ela não é publicada como fato — aparece (quando aparece) marcada como não confirmada.',
  },
  {
    status: 'corrigida' as const,
    text: 'O registro foi substituído, corrigido ou perdeu atualidade. Correções ficam registradas no histórico, nunca apagadas silenciosamente.',
  },
];

const RULES = [
  ['Não inventamos dados', 'Se uma API oficial não publicou uma informação, a interface mostra a indisponibilidade e a última sincronização conhecida, em vez de preencher com estimativas ou números genéricos.'],
  ['Falhas de fonte ficam visíveis', 'Quando um órgão sai do ar ou muda o formato, a página exibe o aviso de indisponibilidade e o erro registrado. Sincronizações com erro nunca são escondidas.'],
  ['Sem conclusões por ausência', 'Não encontrar um evento público não prova que o político não trabalhou; ausência de registro não é prova de ausência de atividade.'],
  ['Processo não é prova de culpa', 'Investigação, inquérito, denúncia, ação judicial, condenação recorrível e condenação definitiva são situações diferentes e serão sempre rotuladas separadamente quando o módulo judiciário entrar no ar.'],
  ['Identidade exige evidência', 'Nunca associamos processos, viagens ou notícias a um político apenas por semelhança de nome. Exigimos identificadores ou elementos suficientes para confirmar a correspondência.'],
  ['Resumos, não cópias', 'Notícias automáticas (fase futura) serão resumos originais com link para a fonte. Não copiamos matérias protegidas por direitos autorais.'],
  ['Neutralidade política', 'Não criamos rankings de melhores ou piores políticos, nem atribuímos notas de honestidade ou competência.'],
];

export default function MetodologiaPage() {
  return (
    <main className="site">
      <SiteHeader />
      <section className="page-head">
        <p className="kicker">Como verificamos</p>
        <h1>Metodologia de verificação</h1>
        <p className="hero-sub">
          Cada registro do portal carrega três coisas: a fonte consultada, a data da coleta e um selo de verificação.
          Os selos pertencem a cada dado — não existe uma pontuação geral de políticos.
        </p>
      </section>

      <section className="profile-section metodo-section" aria-label="Selos de confiança">
        <h2>Os quatro selos</h2>
        <div className="seal-grid">
          {SEALS.map(s => (
            <div className="seal-card" key={s.status}>
              <Seal status={s.status} />
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <p className="fine">
          O estado do selo é determinado por regras de validação, origem e consistência registradas —
          nunca pela "confiança textual" de um modelo de IA.
        </p>
      </section>

      <section className="profile-section metodo-section" aria-label="Regras editoriais">
        <h2>Regras do portal</h2>
        <ul className="rules">
          {RULES.map(([title, text]) => (
            <li key={title}><b>{title}</b><p>{text}</p></li>
          ))}
        </ul>
      </section>

      <section className="profile-section metodo-section" aria-label="Fluxo de coleta">
        <h2>Fluxo de coleta e atualização</h2>
        <ol className="flow">
          <li><b>Consulta</b> — o servidor chama a API oficial (Câmara, Senado, TSE, IBGE) com cache e limites próprios.</li>
          <li><b>Validação e normalização</b> — formatos, datas e identificadores são conferidos antes de exibir.</li>
          <li><b>Rastreio</b> — a URL exata e o horário da coleta são guardados junto ao dado.</li>
          <li><b>Publicação com selo</b> — a página exibe o dado com o selo correspondente e os links de fonte.</li>
          <li><b>Indisponibilidade explícita</b> — se a fonte falha ou muda, mostramos o aviso até ela voltar.</li>
        </ol>
        <p className="sub">
          Hoje a atualização acontece por revalidação de cache no servidor (diretório a cada hora, perfis a cada
          30 minutos, apuração a cada 30 segundos). O pipeline agendado com filas e histórico completo é a Fase 5
          do planejamento e ainda não está implementado.
        </p>
      </section>

      <section className="profile-section metodo-section" aria-label="Correções e direito de resposta">
        <h2>Correções e direito de resposta</h2>
        <p>
          Encontrou um erro? Descreva o problema informando a página e, se possível, a fonte oficial que comprova a
          correção. Enquanto o formulário dedicado não entra no ar, use os canais públicos do projeto
          (<a href="https://www.instagram.com/euodeene" target="_blank" rel="noreferrer">Instagram</a> ou{' '}
          <a href="https://x.com/euodeene" target="_blank" rel="noreferrer">X</a>) ou abra uma issue no{' '}
          <a href="https://github.com/danielfinotti2-spec/apuracao-brasil" target="_blank" rel="noreferrer">GitHub</a>.
        </p>
        <p className="fine">
          Alegações criminais, informações judiciais ambíguas e divergências de identidade sempre passarão por revisão
          humana antes de qualquer publicação.
        </p>
        <p><Link className="btn primary" href="/politicos">Voltar ao diretório</Link></p>
      </section>

      <footer className="foot">
        <span>Fiscaliza Brasil · Informação para fortalecer a democracia.</span>
        <span className="social-links">
          <a href="https://www.instagram.com/euodeene" target="_blank" rel="noreferrer">Instagram @euodeene</a>
          <a href="https://x.com/euodeene" target="_blank" rel="noreferrer">X</a>
          <a href="https://github.com/danielfinotti2-spec" target="_blank" rel="noreferrer">GitHub</a>
        </span>
      </footer>
    </main>
  );
}
