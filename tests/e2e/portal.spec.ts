import { expect, test } from '@playwright/test';

const fixture = {
  politicians: [
    { id: '204379', chamber: 'camara', office: 'Deputado(a) Federal', name: 'Acácio Favacho', party: 'MDB', uf: 'AP', photoUrl: 'https://www.camara.leg.br/internet/deputado/bandep/204379.jpg', officialUrl: 'https://www.camara.leg.br/deputados/204379' },
    { id: '220714', chamber: 'camara', office: 'Deputado(a) Federal', name: 'Adail Filho', party: 'MDB', uf: 'AM', photoUrl: '', officialUrl: 'https://www.camara.leg.br/deputados/220714' },
    { id: '5672', chamber: 'senado', office: 'Senador(a) da República', name: 'Alan Rick', party: 'REPUBLICANOS', uf: 'AC', photoUrl: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5672.jpg', officialUrl: 'https://www25.senado.leg.br/web/senadores/senador/-/perfil/5672' },
  ],
  sources: [{ name: 'API de Dados Abertos da Câmara dos Deputados', url: 'https://dadosabertos.camara.leg.br/api/v2/deputados', fetchedAt: '2026-10-28T13:00:00.000Z', status: 'oficial-confirmada' }],
  failedSources: [],
  fetchedAt: '2026-10-28T13:00:00.000Z',
};

test('portal: página inicial apresenta módulos e navegação', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Fiscalize quem você/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'O que seu eleito fez hoje', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buscar políticos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mapa da representação' })).toBeVisible();
  await page.getByRole('link', { name: 'Políticos' }).first().click();
  await expect(page).toHaveURL(/\/politicos/);
});

test('portal: tema claro/escuro alterna e persiste', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Escurecer a tela' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Clarear a tela' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('diretório: lista, filtra e expõe links de perfil (dados simulados só no teste)', async ({ page }) => {
  await page.route('**/api/politicians', route => route.fulfill({ json: fixture }));
  await page.goto('/politicos');

  await expect(page.getByText('3 mandatos em exercício')).toBeVisible();
  await expect(page.locator('.pol-card')).toHaveCount(3);

  // filtra por texto
  await page.getByLabel('Buscar político por nome').fill('alan');
  await expect(page.locator('.pol-card')).toHaveCount(1);
  await expect(page.locator('.pol-card b')).toHaveText('Alan Rick');

  // filtra por casa legislativa
  await page.getByLabel('Buscar político por nome').fill('');
  await page.getByRole('group', { name: 'Casa legislativa' }).getByRole('button', { name: 'Câmara' }).click();
  await expect(page.locator('.pol-card')).toHaveCount(2);

  // cada card aponta para o perfil correto
  await expect(page.locator('.pol-card').first()).toHaveAttribute('href', '/politicos/camara/204379');
});

test('diretório: aceita filtro de UF vindo do mapa (?uf=AC)', async ({ page }) => {
  await page.route('**/api/politicians', route => route.fulfill({ json: fixture }));
  await page.goto('/politicos?uf=AC');
  await expect(page.locator('.pol-card')).toHaveCount(1);
  await expect(page.locator('.pol-card b')).toHaveText('Alan Rick');
});

test('diretório: falha de fonte oficial fica visível, nunca escondida', async ({ page }) => {
  await page.route('**/api/politicians', route => route.fulfill({
    json: { ...fixture, failedSources: [{ name: 'API de Dados Abertos do Senado Federal', url: 'https://legis.senado.leg.br/x', error: 'HTTP 503' }] },
  }));
  await page.goto('/politicos');
  await expect(page.locator('.sync-warning[role="alert"]')).toContainText('Fontes indisponíveis nesta sincronização');
  await expect(page.locator('.sync-warning[role="alert"]')).toContainText('HTTP 503');
});

test('diretório: quando todas as fontes falham, mostra indisponibilidade', async ({ page }) => {
  await page.route('**/api/politicians', route => route.fulfill({ status: 503, json: { error: 'As fontes oficiais estão indisponíveis no momento.' } }));
  await page.goto('/politicos');
  await expect(page.getByText('As fontes oficiais estão indisponíveis no momento.')).toBeVisible();
});

test('hoje: exibe o registro do dia com as fontes', async ({ page }) => {
  await page.goto('/hoje');
  await expect(page.getByRole('heading', { name: 'O que seu eleito fez hoje' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Proposições de hoje' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Agenda oficial de hoje' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Presenças registradas hoje' })).toBeVisible();
  await expect(page.getByText(/sem registro público.*não é prova de falta/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fontes utilizadas nesta página' })).toBeVisible();
});

test('metodologia: exibe os quatro selos e as regras', async ({ page }) => {
  await page.goto('/metodologia');
  await expect(page.getByRole('heading', { name: 'Metodologia de verificação' })).toBeVisible();
  await expect(page.getByText('Fonte oficial confirmada').first()).toBeVisible();
  await expect(page.getByText('Corroborado por fontes independentes').first()).toBeVisible();
  await expect(page.getByText('Em verificação').first()).toBeVisible();
  await expect(page.getByText('Informação corrigida ou desatualizada').first()).toBeVisible();
  await expect(page.getByText('Não inventamos dados')).toBeVisible();
});
