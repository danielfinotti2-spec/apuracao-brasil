import { NextResponse } from 'next/server';
import { getOfficialResult } from '@/services/tse';

export const revalidate = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const localityCode = searchParams.get('locality') || 'br';
  const year = searchParams.get('year') || '2026';
  const office = searchParams.get('office') || 'Presidente';
  const round = Number(searchParams.get('round') || '2');
  const uf = searchParams.get('uf') || 'br';
  if (!/^(br|\d{2}(?:\d{5})?)$/i.test(localityCode) || !Number.isInteger(Number(year)) || ![1, 2].includes(round)) {
    return NextResponse.json({ error: 'Parâmetros eleitorais inválidos.' }, { status: 400 });
  }
  try {
    const data = await getOfficialResult({ localityCode, uf, year: Number(year), office, round });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } });
  } catch {
    return NextResponse.json({ error: 'Dados oficiais indisponíveis no momento', source: 'TSE' }, { status: 503 });
  }
}
