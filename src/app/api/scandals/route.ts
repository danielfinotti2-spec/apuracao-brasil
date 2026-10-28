import { NextRequest, NextResponse } from 'next/server';

// Registros de casos acompanhados pelo portal. Só entra caso com evidência
// oficial anexada (URL de órgão público) — inserção exige SCANDAL_ADMIN_KEY.
// Sem banco configurado: resposta honesta, sem fingir dados.

const hasDb = () => Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);

async function ensureTable() {
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS scandals (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      evidence_url TEXT NOT NULL,
      evidence_name TEXT NOT NULL DEFAULT '',
      persons JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS scandals_created_idx ON scandals (created_at DESC);`;
  return sql;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!hasDb()) return NextResponse.json({ configured: false, items: [] });
  try {
    const sql = await ensureTable();
    const person = (req.nextUrl.searchParams.get('person') ?? '').trim().toLowerCase();
    if (person) {
      const { rows } = await sql`
        SELECT id, title, summary, evidence_url, evidence_name, persons, created_at
        FROM scandals
        WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(persons) p
          WHERE lower(p->>'name') LIKE ${'%' + person + '%'}
        )
        ORDER BY created_at DESC LIMIT 10;
      `;
      return NextResponse.json({ configured: true, items: rows });
    }
    const { rows } = await sql`
      SELECT id, title, summary, evidence_url, evidence_name, persons, created_at
      FROM scandals ORDER BY created_at DESC LIMIT 20;
    `;
    return NextResponse.json({ configured: true, items: rows });
  } catch (e) {
    return NextResponse.json({ configured: true, items: [], error: (e as Error).message }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const key = process.env.SCANDAL_ADMIN_KEY;
  if (!key) {
    return NextResponse.json({ error: 'SCANDAL_ADMIN_KEY não configurada — cadastro de casos desabilitado.' }, { status: 503 });
  }
  if (req.headers.get('authorization') !== `Bearer ${key}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  if (!hasDb()) {
    return NextResponse.json({ error: 'Banco não conectado.' }, { status: 503 });
  }
  let body: { title?: string; summary?: string; evidenceUrl?: string; evidenceName?: string; persons?: { name?: string; role?: string }[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  const title = String(body.title ?? '').slice(0, 140).trim();
  const summary = String(body.summary ?? '').slice(0, 900).trim();
  const evidenceUrl = String(body.evidenceUrl ?? '').slice(0, 400).trim();
  const evidenceName = String(body.evidenceName ?? '').slice(0, 120).trim();
  const persons = Array.isArray(body.persons)
    ? body.persons.slice(0, 12).map(p => ({ name: String(p.name ?? '').slice(0, 120).trim(), role: String(p.role ?? '').slice(0, 140).trim() })).filter(p => p.name)
    : [];

  if (!title || !summary) return NextResponse.json({ error: 'Título e resumo são obrigatórios.' }, { status: 400 });
  if (!/^https:\/\/[a-z0-9.-]+\.(gov\.br|leg\.br|jus\.br|mpu\.mp\.br|tse\.jus\.br|stf\.jus\.br)/i.test(evidenceUrl)) {
    return NextResponse.json({
      error: 'Evidência precisa ser URL https de domínio oficial brasileiro (.jus.br, .leg.br, .gov.br etc).',
    }, { status: 400 });
  }

  try {
    const sql = await ensureTable();
    await sql`
      INSERT INTO scandals (title, summary, evidence_url, evidence_name, persons)
      VALUES (${title}, ${summary}, ${evidenceUrl}, ${evidenceName}, ${JSON.stringify(persons)});
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
