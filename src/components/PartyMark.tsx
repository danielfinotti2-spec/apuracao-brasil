// Distintivo partidário em SVG próprio (não é o logotipo registrado do partido):
// placa na cor de identidade visual da sigla, com a sigla em destaque.
// Cores de referência das identidades visuais públicas dos partidos; siglas sem
// mapeamento recebem uma cor estável derivada do nome (nunca aleatória por render).

type PartyStyle = { bg: string; fg: string; mark?: 'star' | 'split'; bg2?: string };

const PARTIES: Record<string, PartyStyle> = {
  PT: { bg: '#da251c', fg: '#ffffff', mark: 'star' },
  PL: { bg: '#0f5ba8', fg: '#ffffff' },
  MDB: { bg: '#0e9a50', fg: '#ffffff' },
  PP: { bg: '#0057a8', fg: '#ffffff' },
  'UNIÃO': { bg: '#0f62b6', fg: '#ffffff', mark: 'split', bg2: '#ee7801' },
  REPUBLICANOS: { bg: '#0051a0', fg: '#ffffff' },
  PSD: { bg: '#f7941e', fg: '#ffffff' },
  PSDB: { bg: '#1479c9', fg: '#ffffff' },
  PDT: { bg: '#d22b32', fg: '#ffffff' },
  PSB: { bg: '#fbc707', fg: '#a51e22' },
  PODE: { bg: '#00a39b', fg: '#ffffff' },
  NOVO: { bg: '#f26722', fg: '#ffffff' },
  SOLIDARIEDADE: { bg: '#e06d10', fg: '#ffffff' },
  CIDADANIA: { bg: '#e4007c', fg: '#ffffff' },
  REDE: { bg: '#0e9e8a', fg: '#ffffff' },
  PV: { bg: '#0b9444', fg: '#ffffff' },
  PCdoB: { bg: '#e03030', fg: '#ffffff' },
  AVANTE: { bg: '#dd9605', fg: '#ffffff' },
  AGIR: { bg: '#8059a8', fg: '#ffffff' },
  PRD: { bg: '#1b6fbb', fg: '#ffffff' },
};

function fallback(party: string): PartyStyle {
  let hash = 0;
  for (const c of party) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  const hue = Math.abs(hash) % 360;
  return { bg: `hsl(${hue} 46% 36%)`, fg: '#ffffff' };
}

const STAR = 'M4 0.1 L5.08 2.79 L8.04 2.93 L5.86 4.8 L6.62 7.6 L4 6.04 L1.38 7.6 L2.14 4.8 L-0.04 2.93 L2.92 2.79 Z';

export default function PartyMark({ party, size = 'sm' }: { party: string; size?: 'sm' | 'md' | 'lg' }) {
  const sigla = (party || '—').toUpperCase();
  const style = PARTIES[sigla] ?? fallback(sigla);
  const h = size === 'lg' ? 26 : size === 'md' ? 21 : 17;
  const fs = sigla.length > 3 ? h * 0.42 : h * 0.48;
  const star = style.mark === 'star';
  const textW = sigla.length * fs * 0.62;
  const w = Math.ceil(textW + h * 0.9 + (star ? h * 0.52 : 0));
  const textX = star ? h * 0.5 + h * 0.52 : w / 2;
  const rx = Math.min(4, h * 0.22);

  return (
    <svg
      className={`party-mark party-mark-${size}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Partido ${sigla}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', width: w, height: h }}
    >
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx={rx} fill={style.bg} />
      {style.mark === 'split' && style.bg2 && (
        <path d={`M ${w - Math.ceil(h * 0.62)} 0.5 h ${Math.ceil(h * 0.62) - 0.5} a ${rx} ${rx} 0 0 1 ${rx} ${rx} v ${h - 1 - rx} a ${rx} ${rx} 0 0 1 ${-rx} ${rx} h ${-(Math.ceil(h * 0.62) - 0.5)} Z`} fill={style.bg2} />
      )}
      <rect x="0.5" y="0.5" width={w - 1} height={h / 2} rx={rx} fill="#ffffff" opacity="0.09" />
      {star && (
        <g transform={`translate(${h * 0.24},${(h - h * 0.44) / 2}) scale(${h * 0.44 / 8})`}>
          <path d={STAR} fill={style.fg} />
        </g>
      )}
      <text
        x={star ? textX + 2 : textX}
        y={h / 2}
        dy="0.36em"
        textAnchor={star ? 'start' : 'middle'}
        fill={style.fg}
        style={{ fontSize: fs, fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.02em' }}
      >
        {sigla}
      </text>
    </svg>
  );
}
