import { NextResponse } from 'next/server';

export const revalidate = 86400;
export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (term.length < 2) return NextResponse.json([]);
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome', { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error();
    const data: Array<{ id: number; nome: string; microrregiao?: { mesorregiao?: { UF?: { id: number; nome: string; sigla: string } } } }> = await response.json();
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const query = normalize(term);
    return NextResponse.json(data.filter(item => normalize(item.nome).includes(query)).slice(0, 8).map(item => ({ type: 'Feature', id: String(item.id), properties: { codarea: String(item.id), nome: item.nome, ufCode: String(item.microrregiao?.mesorregiao?.UF?.id ?? ''), ufName: item.microrregiao?.mesorregiao?.UF?.nome ?? '', ufSigla: item.microrregiao?.mesorregiao?.UF?.sigla ?? '' }, geometry: { type: 'Point', coordinates: [] } })), { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
  } catch { return NextResponse.json({ error: 'Busca territorial indisponível.' }, { status: 503 }); }
}
