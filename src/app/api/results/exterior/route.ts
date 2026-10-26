import { NextResponse } from 'next/server';
import { getExterior } from '@/services/tse';

export const revalidate = 60;
export const maxDuration = 30;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const year = Number(query.get('year') || 2026);
  const round = Number(query.get('round') || 2);
  if (!Number.isInteger(year) || ![1, 2].includes(round)) return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  try {
    return NextResponse.json(await getExterior(year, round), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    return NextResponse.json({ error: 'Dados do exterior indisponíveis', detail: error instanceof Error ? error.message : String(error) }, { status: 503 });
  }
}
