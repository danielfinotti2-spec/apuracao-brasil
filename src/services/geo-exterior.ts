// Coordenadas das cidades do exterior (seções eleitorais do TSE) para o mapa-múndi.
// Formato: apelidos separados por "/" | ISO3 | País | latitude | longitude
const TABLE = `
lisboa|PRT|Portugal|38.72|-9.14
porto|PRT|Portugal|41.15|-8.61
faro|PRT|Portugal|37.02|-7.93
coimbra|PRT|Portugal|40.21|-8.43
madri/madrid|ESP|Espanha|40.42|-3.70
barcelona|ESP|Espanha|41.39|2.17
paris|FRA|França|48.86|2.35
marselha|FRA|França|43.30|5.37
lyon|FRA|França|45.76|4.84
londres|GBR|Reino Unido|51.51|-0.13
edimburgo|GBR|Reino Unido|55.95|-3.19
manchester|GBR|Reino Unido|53.48|-2.24
dublin|IRL|Irlanda|53.35|-6.26
berlim|DEU|Alemanha|52.52|13.40
frankfurt|DEU|Alemanha|50.11|8.68
munique|DEU|Alemanha|48.14|11.58
hamburgo|DEU|Alemanha|53.55|9.99
roma|ITA|Itália|41.90|12.50
milao|ITA|Itália|45.46|9.19
veneza|ITA|Itália|45.44|12.32
genebra|CHE|Suíça|46.20|6.14
zurique|CHE|Suíça|47.37|8.54
berna|CHE|Suíça|46.95|7.45
viena|AUT|Áustria|48.21|16.37
bruxelas|BEL|Bélgica|50.85|4.35
amsterda/amsterdam|NLD|Países Baixos|52.37|4.90
haia|NLD|Países Baixos|52.08|4.31
luxemburgo|LUX|Luxemburgo|49.61|6.13
estocolmo|SWE|Suécia|59.33|18.07
oslo|NOR|Noruega|59.91|10.75
copenhague|DNK|Dinamarca|55.68|12.57
helsinque/helsinki|FIN|Finlândia|60.17|24.94
praga|CZE|Tchéquia|50.08|14.44
varsovia|POL|Polônia|52.23|21.01
budapeste|HUN|Hungria|47.50|19.04
bucareste|ROU|Romênia|44.43|26.10
atenas|GRC|Grécia|37.98|23.73
moscou|RUS|Rússia|55.76|37.62
kiev/kyiv|UKR|Ucrânia|50.45|30.52
istambul|TUR|Turquia|41.01|28.98
ancara|TUR|Turquia|39.93|32.86
nova york/nova iorque/new york|USA|Estados Unidos|40.71|-74.01
boston|USA|Estados Unidos|42.36|-71.06
miami|USA|Estados Unidos|25.76|-80.19
orlando|USA|Estados Unidos|28.54|-81.38
washington|USA|Estados Unidos|38.91|-77.04
atlanta|USA|Estados Unidos|33.75|-84.39
houston|USA|Estados Unidos|29.76|-95.37
chicago|USA|Estados Unidos|41.88|-87.63
los angeles|USA|Estados Unidos|34.05|-118.24
sao francisco/san francisco|USA|Estados Unidos|37.77|-122.42
hartford|USA|Estados Unidos|41.76|-72.68
newark|USA|Estados Unidos|40.74|-74.17
framingham|USA|Estados Unidos|42.28|-71.42
denver|USA|Estados Unidos|39.74|-104.99
dallas|USA|Estados Unidos|32.78|-96.80
seattle|USA|Estados Unidos|47.61|-122.33
filadelfia|USA|Estados Unidos|39.95|-75.17
toronto|CAN|Canadá|43.65|-79.38
montreal|CAN|Canadá|45.50|-73.57
ottawa|CAN|Canadá|45.42|-75.70
vancouver|CAN|Canadá|49.28|-123.12
cidade do mexico|MEX|México|19.43|-99.13
havana|CUB|Cuba|23.11|-82.37
panama|PAN|Panamá|8.98|-79.52
san jose|CRI|Costa Rica|9.93|-84.08
guatemala|GTM|Guatemala|14.63|-90.51
kingston|JAM|Jamaica|18.00|-76.79
porto principe|HTI|Haiti|18.59|-72.31
santo domingo|DOM|República Dominicana|18.49|-69.93
caracas|VEN|Venezuela|10.48|-66.90
bogota|COL|Colômbia|4.71|-74.07
quito|ECU|Equador|-0.18|-78.47
lima|PER|Peru|-12.05|-77.04
la paz|BOL|Bolívia|-16.50|-68.15
santa cruz de la sierra|BOL|Bolívia|-17.78|-63.18
cobija|BOL|Bolívia|-11.03|-68.77
santiago|CHL|Chile|-33.45|-70.67
buenos aires|ARG|Argentina|-34.60|-58.38
montevideu/montevideo|URY|Uruguai|-34.90|-56.16
assuncao|PRY|Paraguai|-25.26|-57.58
ciudad del este|PRY|Paraguai|-25.51|-54.61
pedro juan caballero|PRY|Paraguai|-22.55|-55.73
encarnacion|PRY|Paraguai|-27.33|-55.87
georgetown|GUY|Guiana|6.80|-58.16
paramaribo|SUR|Suriname|5.85|-55.20
caiena|GUF|Guiana Francesa|4.92|-52.33
oiapoque|GUF|Guiana Francesa|4.14|-51.65
tóquio/toquio|JPN|Japão|35.68|139.69
nagoia|JPN|Japão|35.18|136.91
hamamatsu|JPN|Japão|34.71|137.73
osaka|JPN|Japão|34.69|135.50
pequim|CHN|China|39.90|116.41
xangai|CHN|China|31.23|121.47
cantao|CHN|China|23.13|113.26
hong kong|HKG|Hong Kong|22.32|114.17
seul|KOR|Coreia do Sul|37.57|126.98
nova delhi|IND|Índia|28.61|77.21
mumbai|IND|Índia|19.08|72.88
dubai|ARE|Emirados Árabes|25.20|55.27
abu dhabi|ARE|Emirados Árabes|24.45|54.38
doha|QAT|Catar|25.29|51.53
riade|SAU|Arábia Saudita|24.71|46.68
jedda|SAU|Arábia Saudita|21.54|39.17
tel aviv|ISR|Israel|32.09|34.78
jerusalem|ISR|Israel|31.77|35.21
beirute|LBN|Líbano|33.89|35.50
teera|IRN|Irã|35.69|51.39
bagda|IRQ|Iraque|33.31|44.37
cingapura|SGP|Singapura|1.35|103.82
bangcoc|THA|Tailândia|13.76|100.50
jacarta|IDN|Indonésia|-6.21|106.85
manila|PHL|Filipinas|14.60|120.98
kuala lumpur|MYS|Malásia|3.14|101.69
hanoi|VNM|Vietnã|21.03|105.85
sydney|AUS|Austrália|-33.87|151.21
canberra|AUS|Austrália|-35.28|149.13
perth|AUS|Austrália|-31.95|115.86
melbourne|AUS|Austrália|-37.81|144.96
wellington|NZL|Nova Zelândia|-41.29|174.78
joanesburgo|ZAF|África do Sul|-26.20|28.05
cidade do cabo|ZAF|África do Sul|-33.92|18.42
pretoria|ZAF|África do Sul|-25.75|28.19
luanda|AGO|Angola|-8.84|13.23
maputo|MOZ|Moçambique|-25.97|32.57
cairo|EGY|Egito|30.04|31.24
rabat|MAR|Marrocos|34.02|-6.84
argel|DZA|Argélia|36.75|3.06
tunis|TUN|Tunísia|36.81|10.18
lagos|NGA|Nigéria|6.52|3.38
abuja|NGA|Nigéria|9.08|7.40
acra|GHA|Gana|5.60|-0.19
dacar|SEN|Senegal|14.72|-17.47
nairobi|KEN|Quênia|-1.29|36.82
adis abeba|ETH|Etiópia|9.03|38.74
praia|CPV|Cabo Verde|14.93|-23.51
bissau|GNB|Guiné-Bissau|11.86|-15.60
sao tome|STP|São Tomé e Príncipe|0.34|6.73
windhoek|NAM|Namíbia|-22.56|17.08
harare|ZWE|Zimbábue|-17.83|31.05
dili|TLS|Timor-Leste|-8.56|125.57
`;
const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

export type Place = { iso: string; country: string; lat: number; lng: number };
const INDEX = new Map<string, Place>();
for (const line of TABLE.trim().split('\n')) {
  const [names, iso, country, lat, lng] = line.split('|');
  for (const name of names.split('/')) INDEX.set(norm(name), { iso, country, lat: Number(lat), lng: Number(lng) });
}

export function locate(cityName: string): Place | null {
  const key = norm(cityName);
  if (INDEX.has(key)) return INDEX.get(key)!;
  let found: Place | null = null;
  INDEX.forEach((place, name) => { if (!found && name.length >= 5 && (key.startsWith(name) || key.endsWith(name))) found = place; });
  return found;
}
