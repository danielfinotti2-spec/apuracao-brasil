// Ícones das fontes oficiais em SVG próprio, desenhados para o portal.
// Não são logotipos oficiais dos órgãos — são glifos autorais que remetem à instituição:
// Câmara (prato côncavo + colunas), Senado (cúpulas gêmeas), TSE (urna), IBGE (pin de mapa),
// Transparência (lupa sobre documento) e genérico (documento oficial).

type Glyph = 'camara' | 'senado' | 'tse' | 'ibge' | 'transparencia' | 'generico';

export function glyphFor(name: string): Glyph {
  const n = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (n.includes('camara')) return 'camara';
  if (n.includes('senado')) return 'senado';
  if (n.includes('tse') || n.includes('eleitoral')) return 'tse';
  if (n.includes('ibge')) return 'ibge';
  if (n.includes('transparencia')) return 'transparencia';
  return 'generico';
}

function Paths({ glyph }: { glyph: Glyph }) {
  switch (glyph) {
    case 'camara':
      return <>
        <path d="M3.2 9.2 C6.2 5.4 17.8 5.4 20.8 9.2 C19.9 12.9 16.3 15 12 15 C7.7 15 4.1 12.9 3.2 9.2 Z" />
        <path d="M5.5 17.5 h13" /><path d="M8 17.5 v2.6" /><path d="M16 17.5 v2.6" /><path d="M12 15 v2.5" />
      </>;
    case 'senado':
      return <>
        <path d="M4 19 V11 A4.2 6.4 0 0 1 10.4 11 V19" />
        <path d="M13.6 19 V11 A4.2 6.4 0 0 1 20 11 V19" />
        <path d="M2.6 19.4 h18.8" />
      </>;
    case 'tse':
      return <>
        <rect x="4" y="7.5" width="16" height="12.5" rx="1.8" />
        <path d="M8.5 7.5 h7" strokeWidth="2.4" />
        <path d="M10 7.5 V4.6 h3.4 l1.4 2.1" />
        <path d="M9.4 13.4 l2 2 l3.4 -3.6" />
      </>;
    case 'ibge':
      return <>
        <path d="M12 3.2 a6.2 6.2 0 0 1 6.2 6.2 c0 4.4 -6.2 11.4 -6.2 11.4 S5.8 13.8 5.8 9.4 A6.2 6.2 0 0 1 12 3.2 Z" />
        <circle cx="12" cy="9.4" r="2.4" />
      </>;
    case 'transparencia':
      return <>
        <rect x="5" y="3.4" width="11" height="14" rx="1.6" />
        <path d="M8 7.2 h5.5" /><path d="M8 10 h5.5" />
        <circle cx="13.5" cy="15.5" r="4.2" fill="#f4f4f1" />
        <circle cx="13.5" cy="15.5" r="4.2" />
        <path d="M16.5 18.5 l3.2 3.2" strokeWidth="2.2" />
      </>;
    default:
      return <>
        <path d="M6 3.5 h9 l3.5 3.5 v13 h-12.5 Z" />
        <path d="M14.5 3.5 v4 h4" />
        <path d="M8.6 11 h6.8" /><path d="M8.6 14.4 h6.8" />
      </>;
  }
}

export default function SourceMark({ name, size = 22 }: { name: string; size?: number }) {
  const glyph = glyphFor(name);
  return (
    <svg
      className={`source-mark source-mark-${glyph}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={`Fonte: ${name}`}
      style={{ flex: 'none' }}
    >
      <Paths glyph={glyph} />
    </svg>
  );
}
