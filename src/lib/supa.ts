// Cliente mínimo para Supabase/PostgREST (sem SDK — fetch direto).
// Só usa a SERVICE_ROLE key no servidor; se as envs não existem,
// as rotas respondem com { configured: false } (fallback honesto).

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supaConfigured = Boolean(URL_ && KEY);

async function supaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!URL_ || !KEY) throw new Error('Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  const res = await fetch(`${URL_}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Supabase respondeu HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Incrementa o contador de visitas de (dia, caminho) via RPC idempotente. */
export async function recordVisit(day: string, path: string): Promise<void> {
  await supaFetch('/rpc/increment_visit', {
    method: 'POST',
    body: JSON.stringify({ p_day: day, p_path: path }),
  });
}

/** Totais agregados: hoje (Brasília) e mês corrente. */
export async function getVisitTotals(today: string, monthStart: string): Promise<{ today: number; month: number }> {
  const rows = await supaFetch<{ day: string; count: number }[]>(`/visits?select=day,count&day=gte.${monthStart}`);
  let todayTotal = 0;
  let monthTotal = 0;
  for (const r of rows) {
    monthTotal += Number(r.count) || 0;
    if (r.day === today) todayTotal += Number(r.count) || 0;
  }
  return { today: todayTotal, month: monthTotal };
}
