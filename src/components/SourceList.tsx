import type { SourceRef } from '@/types/politician';
import SourceMark from '@/components/SourceMark';
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
            <SourceMark name={s.name} size={22} />
            <div>
              <b>{s.name}</b>
              <small>coletado em {formatDateTime(s.fetchedAt)}{s.url.includes(' | ') ? ` — ${s.url.split(' | ').length} URLs paginadas` : ''}</small>
            </div>
            <span className="seal seal-ok"><i />Fonte oficial confirmada</span>
            <a href={s.url.split(' | ')[0]} target="_blank" rel="noreferrer">abrir URL consultada</a>
          </li>
        ))}
      </ul>
      {failed.length > 0 && (
        <div className="sync-warning" role="alert">
          <b>Consultas que falharam e não geraram dados nesta página:</b>
          <ul>
            {failed.map((f, i) => <li key={i}><SourceMark name={f.name} size={18} /> {f.name} — <span className="err-detail">{f.error}</span></li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
