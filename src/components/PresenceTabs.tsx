'use client';

import { useState } from 'react';
import Link from 'next/link';
import PartyMark from '@/components/PartyMark';
import type { PresentPolitician } from '@/types/today';
import type { PoliticianSummary } from '@/types/politician';

type RosterRow = Pick<PoliticianSummary, 'id' | 'name' | 'party' | 'uf' | 'chamber'>;

/**
 * Aba "Presenças de hoje" — confronto de fatos públicos:
 * quem teve participação registrada x quem não consta nos registros consultados.
 * REGRA: "sem registro" descreve a fonte, nunca o parlamentar (ver aviso na tela).
 */
export default function PresenceTabs({ present, roster }: { present: PresentPolitician[]; roster: RosterRow[] }) {
  const [tab, setTab] = useState<'on' | 'off'>('on');
  const presentIds = new Set(present.map(p => p.id));
  const absent = roster.filter(p => !presentIds.has(String(p.id)));

  return (
    <div className="presence">
      <div className="presence-tabs" role="tablist" aria-label="Registros do dia">
        <button role="tab" aria-selected={tab === 'on'} className={tab === 'on' ? 'on' : ''} onClick={() => setTab('on')}>
          Com registro de atividade hoje <b>{present.length}</b>
        </button>
        <button role="tab" aria-selected={tab === 'off'} className={tab === 'off' ? 'on' : ''} onClick={() => setTab('off')}>
          Sem registro público hoje <b>{absent.length}</b>
        </button>
      </div>

      <p className="presence-note">
        Fonte: participantes confirmados dos eventos oficiais de hoje (Câmara dos Deputados).
        <b> Atenção:</b> “sem registro público” significa apenas que a fonte consultada não
        registrou atividade da pessoa nesta data. <b>Não é prova de falta, descuido ou ausência de trabalho</b> —
        os órgãos não publicam o dia a dia completo dos parlamentares. Senadores não são cobertos
        por esta consulta.
      </p>

      {tab === 'on' ? (
        present.length === 0 ? (
          <p className="empty-note">Nenhuma presença registrada ainda hoje nesta fonte — normal em dias de recesso ou antes do início das reuniões.</p>
        ) : (
          <ul className="presence-grid">
            {present.map((p, i) => (
              <li key={p.id} className="a" style={{ ['--ad' as any]: `${Math.min(i, 12) * 26}ms` }}>
                <Link href={`/politicos/camara/${p.id}`}>
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
              <Link href={`/politicos/${p.chamber}/${p.id}`}>
                <span className="presence-name"><b>{p.name}</b></span>
                <span className="presence-meta"><PartyMark party={p.party} /> {p.uf} {p.chamber === 'senado' ? '· Senado' : ''}</span>
                <small>sem registro nesta fonte hoje</small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
