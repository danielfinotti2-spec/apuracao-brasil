/** Executivos estaduais e das capitais — dados eleitorais curados.
 * Governadores: eleitos em out/2022 (mandato 2023–2026).
 * Prefeitos das capitais: eleitos em out/2024 (mandato 2025–2028).
 * FONTES: TSE (resultados oficiais) + portais estaduais brasileiros.
 * Afastamentos/sucessões posteriores NÃO entram automaticamente —
 * o bloco diz o que diz: quem venceu a eleição. Sucessões confirmadas
 * em fonte oficial são corrigidas manualmente.
 */

export type GovernorRow = { uf: string; name: string; party: string; portal: string };

export const GOVERNORS: GovernorRow[] = [
  { uf: 'AC', name: 'Gladson Cameli', party: 'PP', portal: 'https://www.ac.gov.br/' },
  { uf: 'AL', name: 'Paulo Dantas', party: 'MDB', portal: 'https://alagoas.al.gov.br/' },
  { uf: 'AP', name: 'Clécio Luís', party: 'Solidariedade', portal: 'https://www.portal.ap.gov.br/' },
  { uf: 'AM', name: 'Wilson Lima', party: 'União', portal: 'https://amazonas.am.gov.br/' },
  { uf: 'BA', name: 'Jerônimo Rodrigues', party: 'PT', portal: 'https://www.ba.gov.br/' },
  { uf: 'CE', name: 'Elmano de Freitas', party: 'PT', portal: 'https://www.ce.gov.br/' },
  { uf: 'DF', name: 'Ibaneis Rocha', party: 'MDB', portal: 'https://www.df.gov.br/' },
  { uf: 'ES', name: 'Renato Casagrande', party: 'PSB', portal: 'https://www.es.gov.br/' },
  { uf: 'GO', name: 'Ronaldo Caiado', party: 'União', portal: 'https://www.go.gov.br/' },
  { uf: 'MA', name: 'Carlos Brandão', party: 'PSB', portal: 'https://www.ma.gov.br/' },
  { uf: 'MT', name: 'Mauro Mendes', party: 'União', portal: 'https://www.mt.gov.br/' },
  { uf: 'MS', name: 'Eduardo Riedel', party: 'PSDB', portal: 'https://www.ms.gov.br/' },
  { uf: 'MG', name: 'Romeu Zema', party: 'Novo', portal: 'https://www.mg.gov.br/' },
  { uf: 'PA', name: 'Helder Barbalho', party: 'MDB', portal: 'https://www.pa.gov.br/' },
  { uf: 'PB', name: 'João Azevêdo', party: 'PSB', portal: 'https://paraiba.pb.gov.br/' },
  { uf: 'PR', name: 'Ratinho Junior', party: 'PSD', portal: 'https://www.pr.gov.br/' },
  { uf: 'PE', name: 'Raquel Lyra', party: 'PSDB', portal: 'https://www.pe.gov.br/' },
  { uf: 'PI', name: 'Rafael Fonteles', party: 'PT', portal: 'https://www.pi.gov.br/' },
  { uf: 'RJ', name: 'Cláudio Castro', party: 'PL', portal: 'https://www.rj.gov.br/' },
  { uf: 'RN', name: 'Fátima Bezerra', party: 'PT', portal: 'https://www.rn.gov.br/' },
  { uf: 'RS', name: 'Eduardo Leite', party: 'PSDB', portal: 'https://www.rs.gov.br/' },
  { uf: 'RO', name: 'Marcos Rocha', party: 'União', portal: 'https://www.ro.gov.br/' },
  { uf: 'RR', name: 'Antonio Denarium', party: 'PP', portal: 'https://roraima.rr.gov.br/' },
  { uf: 'SC', name: 'Jorginho Mello', party: 'PL', portal: 'https://www.sc.gov.br/' },
  { uf: 'SP', name: 'Tarcísio de Freitas', party: 'Republicanos', portal: 'https://www.sp.gov.br/' },
  { uf: 'SE', name: 'Fábio Mitidieri', party: 'PSD', portal: 'https://www.se.gov.br/' },
  { uf: 'TO', name: 'Wanderlei Barbosa', party: 'Republicanos', portal: 'https://www.to.gov.br/' },
];

export type MayorRow = { city: string; uf: string; name: string; party: string };

export const CAPITAL_MAYORS: MayorRow[] = [
  { city: 'Rio Branco', uf: 'AC', name: 'Tião Bocalom', party: 'PL' },
  { city: 'Maceió', uf: 'AL', name: 'JHC', party: 'PL' },
  { city: 'Macapá', uf: 'AP', name: 'Dr. Furlan', party: 'MDB' },
  { city: 'Manaus', uf: 'AM', name: 'David Almeida', party: 'Avante' },
  { city: 'Salvador', uf: 'BA', name: 'Bruno Reis', party: 'União' },
  { city: 'Fortaleza', uf: 'CE', name: 'Evandro Leitão', party: 'PT' },
  { city: 'Vitória', uf: 'ES', name: 'Lorenzo Pazolini', party: 'Republicanos' },
  { city: 'Goiânia', uf: 'GO', name: 'Sandro Mabel', party: 'União' },
  { city: 'São Luís', uf: 'MA', name: 'Eduardo Braide', party: 'PSD' },
  { city: 'Cuiabá', uf: 'MT', name: 'Abilio Brunini', party: 'PL' },
  { city: 'Campo Grande', uf: 'MS', name: 'Adriane Lopes', party: 'PP' },
  { city: 'Belo Horizonte', uf: 'MG', name: 'Fuad Noman', party: 'PSD' },
  { city: 'Belém', uf: 'PA', name: 'Igor Normando', party: 'MDB' },
  { city: 'João Pessoa', uf: 'PB', name: 'Cícero Lucena', party: 'PP' },
  { city: 'Curitiba', uf: 'PR', name: 'Eduardo Pimentel', party: 'PSD' },
  { city: 'Recife', uf: 'PE', name: 'João Campos', party: 'PSB' },
  { city: 'Teresina', uf: 'PI', name: 'Silvio Mendes', party: 'União' },
  { city: 'Rio de Janeiro', uf: 'RJ', name: 'Eduardo Paes', party: 'PSD' },
  { city: 'Natal', uf: 'RN', name: 'Paulinho Freire', party: 'União' },
  { city: 'Porto Alegre', uf: 'RS', name: 'Sebastião Melo', party: 'MDB' },
  { city: 'Porto Velho', uf: 'RO', name: 'Léo Moraes', party: 'Podemos' },
  { city: 'Boa Vista', uf: 'RR', name: 'Arthur Henrique', party: 'MDB' },
  { city: 'Florianópolis', uf: 'SC', name: 'Topazio Neto', party: 'PSD' },
  { city: 'São Paulo', uf: 'SP', name: 'Ricardo Nunes', party: 'MDB' },
  { city: 'Aracaju', uf: 'SE', name: 'Emília Corrêa', party: 'PL' },
  { city: 'Palmas', uf: 'TO', name: 'Janad Valcari', party: 'PL' },
];

export const DF_MAYOR_NOTE = 'Brasília não tem prefeito: o Distrito Federal é unidade federativa administrada por governador (bloco de governadores acima).';

export const ELECTION_SOURCES = [
  { name: 'Tribunal Superior Eleitoral — resultados oficiais', url: 'https://resultados.tse.jus.br/oficial' },
] as const;
