import { NextResponse } from 'next/server';

export const revalidate = 86400;
const IBGE = 'https://servicodados.ibge.gov.br/api';

export async function GET() {
  try {
    const [statesResponse, outlineResponse] = await Promise.all([
      fetch(`${IBGE}/v1/localidades/estados?orderBy=nome`, { next: { revalidate: 86400 } }),
      fetch(`${IBGE}/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=UF`, { next: { revalidate: 604800 } }),
    ]);
    if (!statesResponse.ok || !outlineResponse.ok) throw new Error('IBGE indisponível');
    const states: Array<{ id: number; nome: string; sigla: string }> = await statesResponse.json();
    const outlines: any = await outlineResponse.json();
    const features = outlines.features || [];
    const byCode = new Map(states.map(state => [String(state.id), state]));
    const normalized = features.map((feature: any) => {
      const code = String(feature.properties?.codarea ?? '');
      const state = byCode.get(code);
      return { ...feature, id: code, properties: { ...feature.properties, codarea: code, nome: state?.nome ?? code, sigla: state?.sigla ?? '' } };
    }).filter((feature: any) => feature.properties.nome);
    if (normalized.length !== 27) throw new Error('Malha estadual incompleta');
    return NextResponse.json({ type: 'FeatureCollection', features: normalized }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar os limites oficiais do IBGE.' }, { status: 503 });
  }
}
