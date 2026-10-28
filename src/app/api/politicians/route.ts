import { NextResponse } from 'next/server';
import { listAllPoliticians } from '@/services/politicians';

export const revalidate = 3600;

/** Diretório agregado de políticos em exercício (Câmara + Senado), com rastreio de fontes. */
export async function GET() {
  try {
    const data = await listAllPoliticians();
    if (!data.politicians.length) {
      return NextResponse.json(
        { ...data, error: 'As fontes oficiais estão indisponíveis no momento.' },
        { status: 503 },
      );
    }
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'As fontes oficiais estão indisponíveis no momento.', detail: error instanceof Error ? error.message : String(error) },
      { status: 503 },
    );
  }
}
