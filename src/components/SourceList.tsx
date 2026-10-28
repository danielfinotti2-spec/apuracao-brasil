import type { SourceRef } from '@/types/politician';
import { formatDateTime } from '@/lib/format';

/** Bloco de procedência exibido no rodapé de cada perfil: URLs exatas, data de coleta e falhas. */
export default function SourceList({ sources, failed }: { sources: SourceRef[]; failed: { name: string; url: string; error: string }[] }) {
  return (
    <section className="profile-section sources-section" aria-label="Fontes utilizadas">
      <h2>Fontes utilizadas nesta página</h2>
      <p className="sub">Cada dado acima veio de uma destas consultas, feitas diretamente às APIs oficiais.</p>
      <ul className="source-list">
        {sources.map((s, i) => (
          <li key={i}>
            <span className="seal seal-ok"><i />Fonte oficial confirmada</span>
            <div><b>{s.name}</b><small>coletado em {formatDateTime(s.fetchedAt)}</small></div>
            <a href={s.url.split(' | ')[0]} target="_blank" rel="noreferrer">{s.url.split(' | ').length > 1 ? `ver 1ª URL (de ${s.url.split(' | ').length})` : 'abrir URL consultada'} ↗</a>
          </li>
        ))}
      </ul>
      {failed.length > 0 && (
        <div className="sync-warning" role="alert">
          ⚠ Consultas que falharam e não geraram dados nesta página:
          <ul>
            {failed.map((f, i) => <li key={i}><b>{f.name}</b> — <span className="err-detail">{f.error}</span></li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
