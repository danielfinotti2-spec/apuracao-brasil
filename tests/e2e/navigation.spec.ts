import { expect, test } from '@playwright/test';

const feature = (code: string, name: string, west: number, south: number, east: number, north: number) => ({
  type: 'Feature', id: code,
  properties: { codarea: code, nome: name, sigla: code === '35' ? 'SP' : '' },
  geometry: { type: 'Polygon', coordinates: [[[west,south],[east,south],[east,north],[west,north],[west,south]]] },
});
const geo = (...features: ReturnType<typeof feature>[]) => ({ type: 'FeatureCollection', features });

test('navega do Brasil ao estado e ao município e retorna pelos breadcrumbs', async ({ page }) => {
  await page.route('**/api/geo/states/35', route => route.fulfill({ json: geo(
    feature('3550308', 'Município Alfa', -50.4,-23.8,-49.8,-23.2),
    feature('3509502', 'Município Beta', -49.7,-23.8,-49.1,-23.2),
  ) }));
  await page.route('**/api/geo/states', route => route.fulfill({ json: geo(
    feature('35', 'Estado Alfa', -51,-24,-48,-21),
    feature('33', 'Estado Beta', -44,-24,-41,-21),
  ) }));
  await page.route('**/api/results**', route => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Dados oficiais indisponíveis no momento' }) }));

  await page.goto('/');
  await expect(page.locator('.leaflet-interactive')).toHaveCount(2);
  await page.locator('.leaflet-interactive').first().click();
  await expect(page.getByText('2 MUNICÍPIOS')).toBeVisible();
  await expect(page.locator('.leaflet-interactive')).toHaveCount(2);

  await page.locator('.leaflet-interactive').nth(1).click();
  await expect(page.locator('.results-head h2')).toHaveText('Município Beta');
  await expect(page.getByText('Dados oficiais indisponíveis no momento')).toBeVisible();
  await page.getByLabel('ANO').selectOption('2022');
  await expect(page.locator('.results-bottom')).toContainText('2022');

  await page.getByRole('navigation', { name: 'Navegação' }).getByRole('button', { name: 'Estado Alfa' }).click();
  await expect(page.locator('.results-head h2')).toHaveText('Estado Alfa');
  await page.getByRole('navigation', { name: 'Navegação' }).getByRole('button', { name: 'Brasil' }).click();
  await expect(page.locator('.map-heading h2')).toContainText('Brasil');
  await expect(page.locator('.results-head h2')).toHaveText('Visão geral');
});
