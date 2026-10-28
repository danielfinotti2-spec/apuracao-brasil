import { expect, test } from '@playwright/test';

// Malha simulada mínima: dois estados com polígonos simples.
const geoFixture = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: '11', properties: { codarea: '11', nome: 'Rondônia', sigla: 'RO' }, geometry: { type: 'Polygon', coordinates: [[[-45, -20], [-44, -20], [-44, -19], [-45, -19], [-45, -20]]] } },
    { type: 'Feature', id: '35', properties: { codarea: '35', nome: 'São Paulo', sigla: 'SP' }, geometry: { type: 'Polygon', coordinates: [[[-43, -21], [-42, -21], [-42, -20], [-43, -20], [-43, -21]]] } },
  ],
};

test('mapa da representação: renderiza estados e leva ao diretório filtrado', async ({ page }) => {
  await page.route('**/api/geo/states', route => route.fulfill({ json: geoFixture }));
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Mapa da representação' })).toBeVisible();
  await expect(page.locator('.rep-map .leaflet-interactive')).toHaveCount(2);

  await page.locator('.rep-map .leaflet-interactive').first().click();
  await expect(page).toHaveURL(/\/politicos\?uf=(RO|SP)/);
});

test('mapa da representação: falha da malha aparece como aviso honesto', async ({ page }) => {
  await page.route('**/api/geo/states', route => route.fulfill({ status: 503, json: { error: 'IBGE indisponível' } }));
  await page.goto('/');
  await expect(page.locator('.map-canvas .sync-warning')).toContainText('Mapa indisponível');
});
