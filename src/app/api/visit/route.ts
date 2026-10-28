// Contador de visitas agregado via Supabase (dia + caminho apenas — sem IP, sem cookie, sem pessoa identificável).
// POST { path }  -> registra uma visita
// GET            -> { today, month } (ou { configured: false })

import { NextResponse } from 'next/server';
import { getVisitTotals, recordVisit, supaConfigured } from '@/lib/supa';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const brasiliaDay = (offset = 0) => {
  const d = new Date(Date.now() + offset * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d);
};

export async function POST(request: Request) {
  if (!supaConfigured) return NextResponse.json({ configured: false }, { status: 503 });
  try {
    const body = await request.json().catch(() => null) as { path?: string } | null;
    const path = typeof body?.path === 'string' && /^\/[a-z0-9\/-]*$/i.test(body.path) && body.path.length <= 64 ? body.path : '/';
    await recordVisit(brasiliaDay(), path);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ configured: true, error: error?.message ?? 'falha' }, { status: 502 });
  }
}

export async function GET() {
  if (!supaConfigured) return NextResponse.json({ configured: false });
  try {
    const today = brasiliaDay();
    const monthStart = today.slice(0, 8) + '01';
    const totals = await getVisitTotals(today, monthStart);
    return NextResponse.json({ configured: true, ...totals });
  } catch (error: any) {
    return NextResponse.json({ configured: true, error: error?.message ?? 'falha' }, { status: 502 });
  }
}
