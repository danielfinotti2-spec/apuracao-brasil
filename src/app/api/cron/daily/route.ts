import { NextResponse } from 'next/server';
import { getTodayData } from '@/services/hoje';

// Cron diário da Vercel (ver vercel.json): conta propostas e participações do
// dia e grava no Postgres. Idempotente — rodar duas vezes no mesmo dia só
// atualiza os números (UPSERT por (camara, person_id, date)).

const hasDb = () => Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);

async function ensureTable() {
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS daily_stats (
      camara TEXT NOT NULL,
      person_id TEXT NOT NULL,
      date DATE NOT NULL,
      propostas INT NOT NULL DEFAULT 0,
      presencas INT NOT NULL DEFAULT 0,
      PRIMARY KEY (camara, person_id, date)
    );
  `;
  return sql;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  // Em produção, só com o segredo do cron — em dev local, executa livre.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
  }
  if (!hasDb()) {
    return NextResponse.json({ skipped: true, reason: 'Postgres não conectado (Storage → Postgres no painel da Vercel).' });
  }

  const data = await getTodayData();
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  const perPerson = new Map<string, { propostas: number; presencas: number }>();
  const bump = (id: string, kind: 'propostas' | 'presencas') => {
    const cur = perPerson.get(id) ?? { propostas: 0, presencas: 0 };
    cur[kind] += 1;
    perPerson.set(id, cur);
  };
  data.proposals.forEach(p => p.authors.forEach(a => a.deputyId && bump(String(a.deputyId), 'propostas')));
  data.present.forEach(p => bump(p.id, 'presencas'));

  try {
    const sql = await ensureTable();
    let wrote = 0;
    for (const [id, v] of Array.from(perPerson.entries())) {
      await sql`
        INSERT INTO daily_stats (camara, person_id, date, propostas, presencas)
        VALUES ('camara', ${id}, ${day}::date, ${v.propostas}, ${v.presencas})
        ON CONFLICT (camara, person_id, date)
        DO UPDATE SET propostas = EXCLUDED.propostas, presencas = EXCLUDED.presencas;
      `;
      wrote += 1;
    }
    return NextResponse.json({ ok: true, day, wrote });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
