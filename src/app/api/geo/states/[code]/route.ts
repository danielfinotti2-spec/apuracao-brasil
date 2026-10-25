import { NextResponse } from 'next/server';

export const revalidate = 86400;
const IBGE = 'https://servicodados.ibge.gov.br/api';
type Locality = { id: number; nome: string };

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^\d{2}$/.test(code)) return NextResponse.json({ error: 'Código de UF inválido.' }, { status: 400 });
  try {
    const [geometryResponse, localitiesResponse] = await Promise.all([
      fetch(`${IBGE}/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio`, { next: { revalidate: 604800 } }),
      fetch(`${IBGE}/v1/localidades/estados/${code}/municipios`, { next: { revalidate: 604800 } }),
    ]);
    if (!geometryResponse.ok || !localitiesResponse.ok) throw new Error('IBGE indisponível');
    const [geometry, localities]: [any, Locality[]] = await Promise.all([geometryResponse.json(), localitiesResponse.json()]);
    const names = new Map(localities.map(locality => [String(locality.id), locality.nome]));
    geometry.features = (geometry.features || []).map((feature: any) => {
      const code = String(feature.properties?.codarea ?? '');
      return { ...feature, id: code, properties: { ...feature.properties, codarea: code, nome: names.get(code) ?? code } };
    });
    return NextResponse.json(geometry, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar os limites oficiais do IBGE.' }, { status: 503 });
  }
}
