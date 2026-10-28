import type { SourceRef } from '@/types/politician';
import SourceMark from '@/components/SourceMark';
import { formatDateTime } from '@/lib/format';
import { t, type Locale } from '@/i18n/messages';

/** Bloco de procedência exibido no rodapé de cada página de dados: URLs exatas, data de coleta e falhas. */
export default function SourceList({ sources, failed, lang = 'pt' }: { sources: SourceRef[]; failed: { name: string; url: string; error: string }[]; lang?: Locale }) {
  return (
    <section className="profile-section sources-section" aria-label={t(lang, 'common.sources')}>
      <h2>{t(lang, 'common.sources')}</h2>
      <p className="sub">{t(lang, 'common.sourcesSub')}</p>
      <ul className="source-list">
        {sources.map((s, i) => (
          <li key={i}>
            <SourceMark name={s.name} size={22} />
            <div>
              <b>{s.name}</b>
              <small>{t(lang, 'common.collectedAt')} {formatDateTime(s.fetchedAt)}{s.url.includes(' | ') ? ` — ${s.url.split(' | ').length} URLs` : ''}</small>
            </div>
            <span className="seal seal-ok"><i />{t(lang, 'seal.oficial-confirmada')}</span>
            <a href={s.url.split(' | ')[0]} target="_blank" rel="noreferrer">{t(lang, 'common.openUrl')}</a>
          </li>
        ))}
      </ul>
      {failed.length > 0 && (
        <div className="sync-warning" role="alert">
          <b>{t(lang, 'common.failedQueries')}</b>
          <ul>
            {failed.map((f, i) => <li key={i}><SourceMark name={f.name} size={18} /> {f.name} — <span className="err-detail">{f.error}</span></li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
