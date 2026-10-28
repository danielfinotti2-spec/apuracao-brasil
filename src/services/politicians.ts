// Agregação do diretório: deputados federais + senadores em exercício.
// Tolerante a falha parcial: se uma casa estiver indisponível, a outra ainda aparece
// e a falha é reportada em `failedSources` (nunca escondida).

import { listDeputados, CAMARA_SOURCE } from './camara';
import { listSenadores, SENADO_SOURCE } from './senado';
import type { PoliticianListResult } from '@/types/politician';

export async function listAllPoliticians(): Promise<PoliticianListResult> {
  const [camara, senado] = await Promise.allSettled([listDeputados(), listSenadores()]);
  const result: PoliticianListResult = { politicians: [], sources: [], failedSources: [], fetchedAt: new Date().toISOString() };

  if (camara.status === 'fulfilled') {
    result.politicians.push(...camara.value.list);
    result.sources.push(camara.value.source);
  } else {
    result.failedSources.push({
      name: CAMARA_SOURCE,
      url: 'https://dadosabertos.camara.leg.br/api/v2/deputados',
      error: camara.reason instanceof Error ? camara.reason.message : String(camara.reason),
    });
  }
  if (senado.status === 'fulfilled') {
    result.politicians.push(...senado.value.list);
    result.sources.push(senado.value.source);
  } else {
    result.failedSources.push({
      name: SENADO_SOURCE,
      url: 'https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json',
      error: senado.reason instanceof Error ? senado.reason.message : String(senado.reason),
    });
  }
  return result;
}
