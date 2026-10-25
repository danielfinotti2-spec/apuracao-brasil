import { NextResponse } from 'next/server';
import { getOfficialResult } from '@/services/tse';

export const revalidate = 60;
const IBGE_STATES = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const year = Number(query.get('year') || 2026);
  const round = Number(query.get('round') || 2);
  const office = query.get('office') || 'Presidente';
  try {
    const response = await fetch(IBGE_STATES, { next: { revalidate: 604800 } });
    if (!response.ok) throw new Error('IBGE indisponível');
    const states: Array<{ id: number; sigla: string }> = await response.json();
    const localities = await Promise.all(states.map(async state => {
      try {
        const result = await getOfficialResult({ localityCode: String(state.id), uf: state.sigla, year, round, office });
        const [winner, second] = result.candidates.slice().sort((a, b) => b.votes - a.votes);
        return winner && result.totalizedSections ? { localityCode: result.localityCode, sigla: state.sigla, candidateId: winner.candidateId, name: winner.name, color: winner.color, turnout: result.turnout, percentage: winner.percentage, lead: winner.percentage - (second?.percentage ?? 0) } : null;
      } catch { return null; }
    }));
    return NextResponse.json({ localities: localities.filter(Boolean) }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch {
    return NextResponse.json({ error: 'Dados oficiais indisponíveis no momento', localities: [] }, { status: 503 });
  }
}
