'use client';

import { useState } from 'react';
import Link from 'next/link';
import PartyMark from '@/components/PartyMark';
import type { PresentPolitician } from '@/types/today';
import type { PoliticianSummary } from '@/types/politician';

type RosterRow = Pick<PoliticianSummary, 'id' | 'name' | 'party' | 'uf' | 'chamber'>;

export type PresenceLabels = {
  on: string; off: string; note1: string; note2: string; none: string; offLine: string; senate: string; group: string;
};

/**
 * Aba "Presenças de hoje" — confronto de fatos públicos:
 * quem teve participação registrada x quem não consta nos registros consultados.
 * REGRA: "sem registro" descreve a fonte, nunca o parlamentar (ver aviso na tela).
 */
export default function PresenceTabs({ present, roster, labels, langPrefix }: { present: PresentPolitician[]; roster: RosterRow[]; labels: PresenceLabels; langPrefix: string }) {
  const [tab, setTab] = useState<'on' | 'off'>('on');
  const presentIds = new Set(present.map(p => p.id));
  const absent = roster.filter(p => !presentIds.has(String(p.id)));

  return (
    <div className="presence">
      <div className="presence-tabs" role="tablist" aria-label={labels.group}>
        <button role="tab" aria-selected={tab === 'on'} className={tab === 'on' ? 'on' : ''} onClick={() => setTab('on')}>
          {labels.on} <b>{present.length}</b>
        </button>
        <button role="tab" aria-selected={tab === 'off'} className={tab === 'off' ? 'on' : ''} onClick={() => setTab('off')}>
          {labels.off} <b>{absent.length}</b>
        </button>
      </div>

      <p className="presence-note">
        {labels.note1} <b>{labels.note2}</b>
      </p>

      {tab === 'on' ? (
        present.length === 0 ? (
          <p className="empty-note">{labels.none}</p>
        ) : (
          <ul className="presence-grid">
            {present.map((p, i) => (
              <li key={p.id} className="a" style={{ ['--ad' as any]: `${Math.min(i, 12) * 26}ms` }}>
                <Link href={`/politicos/camara/${p.id}${langPrefix}`}>
                  <span className="presence-name"><b>{p.name}</b></span>
                  <span className="presence-meta"><PartyMark party={p.party} /> {p.uf}</span>
                  <small>{p.activities.slice(0, 2).join(' · ')}{p.activities.length > 2 ? ` +${p.activities.length - 2}` : ''}</small>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className="presence-grid plain">
          {absent.map((p, i) => (
            <li key={`${p.chamber}-${p.id}`} className="a" style={{ ['--ad' as any]: `${Math.min(i, 12) * 26}ms` }}>
              <Link href={`/politicos/${p.chamber}/${p.id}${langPrefix}`}>
                <span className="presence-name"><b>{p.name}</b></span>
                <span className="presence-meta"><PartyMark party={p.party} /> {p.uf} {p.chamber === 'senado' ? `· ${labels.senate}` : ''}</span>
                <small>{labels.offLine}</small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
