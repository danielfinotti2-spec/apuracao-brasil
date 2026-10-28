import Link from 'next/link';
import type { VerificationStatus } from '@/types/politician';

/** Selo de confiança por registro (ver metodologia em /metodologia). */
export const SEAL: Record<VerificationStatus, { label: string; className: string; hint: string }> = {
  'oficial-confirmada': {
    label: 'Fonte oficial confirmada',
    className: 'seal-ok',
    hint: 'Informação encontrada e validada em registro oficial identificável, com URL e data de coleta.',
  },
  'corroborada': {
    label: 'Corroborado por fontes independentes',
    className: 'seal-mid',
    hint: 'Informação confirmada por fontes independentes confiáveis, com evidências verificáveis.',
  },
  'em-verificacao': {
    label: 'Em verificação',
    className: 'seal-warn',
    hint: 'A informação ainda não tem evidências suficientes ou apresenta divergências.',
  },
  'corrigida': {
    label: 'Informação corrigida ou desatualizada',
    className: 'seal-off',
    hint: 'O registro foi substituído, corrigido ou perdeu atualidade.',
  },
};

export default function Seal({ status, compact = false }: { status: VerificationStatus; compact?: boolean }) {
  const seal = SEAL[status];
  return (
    <Link href="/metodologia" className={`seal ${seal.className}`} title={`${seal.label} — ${seal.hint} (ver metodologia)`}>
      <i aria-hidden="true" />{compact ? seal.label.split(' ')[0] : seal.label}
    </Link>
  );
}
