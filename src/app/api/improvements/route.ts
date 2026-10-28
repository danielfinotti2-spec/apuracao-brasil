import { NextRequest, NextResponse } from 'next/server';

// Quadro público de melhorias e comentários, persistido no Postgres da Vercel.
// Sem DATABASE_URL/POSTGRES_URL configurada, a API avisa honestamente que o
// armazenamento ainda não foi conectado (nada é fingido).

const hasDb = () => Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);

async function ensureTable() {
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS improvements (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      approved BOOLEAN NOT NULL DEFAULT TRUE
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS improvements_created_idx ON improvements (created_at DESC);`;
  return sql;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDb()) {
    return NextResponse.json({ configured: false, items: [] });
  }
  try {
    const sql = await ensureTable();
    const { rows } = await sql`
      SELECT id, kind, name, message, created_at
      FROM improvements
      WHERE approved
      ORDER BY created_at DESC
      LIMIT 60;
    `;
    return NextResponse.json({ configured: true, items: rows });
  } catch (e) {
    return NextResponse.json({ configured: true, items: [], error: (e as Error).message }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!hasDb()) {
    return NextResponse.json(
      { error: 'Banco de dados ainda não conectado neste ambiente. Enquanto isso, use as issues do GitHub.' },
      { status: 503 },
    );
  }
  let body: { kind?: string; name?: string; message?: string; website?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  // honeypot: bots preenchem o campo invisível "website"
  if (body.website) return NextResponse.json({ ok: true });

  const kind = body.kind === 'erro' ? 'erro' : 'melhoria';
  const name = String(body.name ?? '').slice(0, 80).trim();
  const message = String(body.message ?? '').slice(0, 1200).trim();
  if (message.length < 10) {
    return NextResponse.json({ error: 'Mensagem muito curta — descreva em pelo menos 10 caracteres.' }, { status: 400 });
  }

  try {
    const sql = await ensureTable();
    await sql`INSERT INTO improvements (kind, name, message) VALUES (${kind}, ${name}, ${message});`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
