import Link from 'next/link';
import type { VerificationStatus } from '@/types/politician';
import { t, type Locale } from '@/i18n/messages';

/** Selo de confiança por registro (ver metodologia em /metodologia). */
export const SEAL_HINT: Record<VerificationStatus, string> = {
  'oficial-confirmada': 'Informação encontrada e validada em registro oficial identificável, com URL e data de coleta.',
  'corroborada': 'Informação confirmada por fontes independentes confiáveis, com evidências verificáveis.',
  'em-verificacao': 'A informação ainda não tem evidências suficientes ou apresenta divergências.',
  'corrigida': 'O registro foi substituído, corrigido ou perdeu atualidade.',
};

const CLS: Record<VerificationStatus, string> = {
  'oficial-confirmada': 'seal-ok',
  'corroborada': 'seal-mid',
  'em-verificacao': 'seal-warn',
  'corrigida': 'seal-off',
};

export default function Seal({ status, compact = false, lang = 'pt' }: { status: VerificationStatus; compact?: boolean; lang?: Locale }) {
  const label = t(lang, `seal.${status}` as never);
  return (
    <Link href={`/metodologia${lang === 'pt' ? '' : `?lang=${lang}`}`} className={`seal ${CLS[status]}`} title={`${label} — ${SEAL_HINT[status]}`}>
      <i aria-hidden="true" />{compact ? label.split(' ')[0] : label}
    </Link>
  );
}
