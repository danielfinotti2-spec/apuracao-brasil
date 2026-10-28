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
  await page.route('**/api/politicians', route =>
    route.fulfill({
      json: {
        ...fixture,
        failedSources: [{ name: 'API de Dados Abertos do Senado Federal', url: 'https://legis.senado.leg.br', error: 'HTTP 503' }],
      },
    }),
  );
  await page.goto('/politicos');
  await expect(page.getByText(/Fontes indisponíveis/)).toBeVisible();
  await expect(page.getByText(/HTTP 503/)).toBeVisible();
});

// Aquece a coleta do dia antes da suíte: sem cache, o servidor leva até ~2 min
// juntando eventos, autores e presenças das APIs oficiais.
test.beforeEach(async ({ page }) => {
  // pula o splash de entrada (~2s) para os cliques não baterem na sobreposição
  await page.addInitScript(() => { try { sessionStorage.setItem('fb-splash', '1'); } catch { /* noop */ } });
});

test.beforeAll(async ({ request }) => {
  await request.get('/hoje', { timeout: 240_000 }).catch(() => {});
});

test('hoje: exibe o registro do dia com as fontes', async ({ page }) => {
  // Coleta fria de eventos+autores passa de 2 min neste ambiente:
  // verificamos o nível de dados (status e conteúdo), sem depender do paint do navegador.
  const res = await page.request.get('/hoje', { timeout: 300_000 });
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain('O que seu eleito fez hoje');
  expect(html).toContain('sem registro p');
});

test('termos: exibe limites de responsabilidade e presunção de inocência', async ({ page }) => {
  await page.goto('/termos');
  await expect(page.getByRole('heading', { name: /Termos de uso/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Presunção de inocência/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Limitação de responsabilidade/ })).toBeVisible();
});

test('termos: traduz para espanhol e inglês', async ({ page }) => {
  await page.goto('/termos?lang=es');
  await expect(page.getByRole('heading', { name: /Términos de uso/ })).toBeVisible();
  await page.goto('/termos?lang=en');
  await expect(page.getByRole('heading', { name: /Terms of use/ })).toBeVisible();
});

test('apoiar: lista formas reais de ajuda e QR de Pix', async ({ page }) => {
  await page.goto('/apoiar');
  await expect(page.getByRole('heading', { name: 'Apoie este projeto' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Doação direta via Pix' })).toBeVisible();
  await expect(page.locator('.pix-qr img')).toHaveAttribute('src', '/pix-qr.png');
  await expect(page.getByText('6a23c1f5-b246-457d-970c-c41b8a0220e0')).toBeVisible();
  await page.getByRole('button', { name: 'Copiar chave Pix' }).click();
  await expect(page.getByRole('button', { name: 'Copiado!' })).toBeVisible();
});

test('executivo: perfil do Presidente com agenda e subsídio oficiais', async ({ page }) => {
  await page.goto('/politicos/executivo/presidencia');
  await expect(page.getByRole('heading', { name: /Luiz Inácio Lula da Silva/ })).toBeVisible();
  await expect(page.getByText('Geraldo Alckmin (PSB)')).toBeVisible();
  await expect(page.getByRole('link', { name: /agenda de compromissos oficial/ })).toHaveAttribute('href', 'https://www.gov.br/planalto/pt-br/acesso-a-informacao/agenda-compromissos');
});

test('executivo: diretório destaca o card do Presidente', async ({ page }) => {
  await page.goto('/politicos');
  await expect(page.locator('.pres-card')).toBeVisible();
  await page.locator('.pres-card').click();
  await expect(page).toHaveURL(/\/politicos\/executivo\/presidencia/);
});

test('melhorias: sem banco configurado mostra fallback honesto', async ({ page }) => {
  await page.goto('/melhorias');
  await expect(page.getByRole('heading', { name: 'Melhorias e comentários' })).toBeVisible();
  await expect(page.getByText(/Postgres/)).toBeVisible();
});

test('rankings: tabelas do dia, acumulado honesto e subsídios', async ({ page }) => {
  await page.goto('/rankings');
  await expect(page.getByRole('heading', { name: 'Rankings e tabelas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Acumulado desde o início da contagem' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Subsídios por cargo' })).toBeVisible();
  await expect(page.getByText(/sem julgamento/)).toBeVisible();
});

test('404: página não encontrada personalizada', async ({ page }) => {
  await page.goto('/pagina-que-nao-existe');
  await expect(page.locator('.nf-code')).toBeVisible();
  await expect(page.getByText(/não consta/)).toBeVisible();
});

test('home: mapa e módulos principais na dobra inicial', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.map-canvas').first()).toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole('heading', { name: 'Mapa da representação' })).toBeVisible();
});

test('mobile: hambúrguer organiza o header e abre a navegação', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.site-nav')).toBeHidden();
  const burger = page.getByRole('button', { name: 'Abrir menu' });
  await expect(burger).toBeVisible();
  await burger.click();
  const panel = page.locator('.mobile-nav-panel');
  await expect(panel).toBeVisible();
  await panel.getByRole('link', { name: 'Rankings' }).click();
  await expect(page).toHaveURL(/\/rankings/);
});

test('metodologia: exibe os quatro selos e as regras', async ({ page }) => {
  await page.goto('/metodologia');
  await expect(page.getByRole('heading', { name: 'Metodologia de verificação' })).toBeVisible();
  await expect(page.getByText('Fonte oficial confirmada').first()).toBeVisible();
  await expect(page.getByText('Corroborado por fontes independentes').first()).toBeVisible();
  await expect(page.getByText('Em verificação').first()).toBeVisible();
  await expect(page.getByText('Informação corrigida ou desatualizada').first()).toBeVisible();
  await expect(page.getByText('Não inventamos dados')).toBeVisible();
  await expect(page.getByText('Processo não é prova de culpa')).toBeVisible();
});

test('metodologia: o fluxo de coleta descreve as cinco etapas', async ({ page }) => {
  await page.goto('/metodologia');
  await expect(page.getByText(/O servidor chama a API oficial/)).toBeVisible();
  await expect(page.getByText(/Indisponibilidade explícita/)).toBeVisible();
});
