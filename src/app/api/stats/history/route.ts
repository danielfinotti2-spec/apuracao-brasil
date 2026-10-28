import { NextResponse } from 'next/server';

// Somas do acumulado diário (alimentado pelo cron). Sem banco: fallback honesto.

const hasDb = () => Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDb()) return NextResponse.json({ configured: false, since: null, rows: [] });
  try {
    const { sql } = await import('@vercel/postgres');
    const { rows } = await sql`
      SELECT camara, person_id,
             SUM(propostas)::int AS propostas,
             SUM(presencas)::int AS presencas,
             MIN(date)::text AS desde
      FROM daily_stats
      GROUP BY camara, person_id
      ORDER BY SUM(propostas) DESC, SUM(presencas) DESC
      LIMIT 40;
    `;
    const since = rows.length ? rows[0].desde.slice(0, 10) : null;
    return NextResponse.json({ configured: true, since, rows });
  } catch (e) {
    if ((e as Error).message.includes('daily_stats')) {
      return NextResponse.json({ configured: true, since: null, rows: [] });
    }
    return NextResponse.json({ configured: true, since: null, rows: [], error: (e as Error).message }, { status: 503 });
  }
}
