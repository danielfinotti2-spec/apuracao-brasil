# Apuração Brasil

Painel de apuração eleitoral em Next.js, TypeScript e Leaflet. O mapa usa malhas territoriais oficiais do IBGE e os resultados vêm dos arquivos JSON publicados pelo aplicativo de divulgação do TSE. As fotos de Lula e Flávio Bolsonaro fornecidas para o projeto estão em `public/candidates/`.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para gerar a versão de produção, use `npm run build` e `npm start`.

## Fontes e funcionamento

- **Geografia:** API de Malhas e API de Localidades do IBGE. Uma única chamada carrega os polígonos das 27 UFs; ao selecionar um estado, a aplicação carrega os municípios correspondentes. Geometrias são armazenadas em cache por até sete dias.
- **Resultados:** o servidor lê a configuração eleitoral e os arquivos de apuração JSON usados pelo [aplicativo oficial de resultados do TSE](https://resultados.tse.jus.br/oficial/app/index.html). O painel atualiza a cada minuto e usa cache curto no servidor. A visão do Brasil colore UFs com resultado totalizado; selecionar uma UF ou município mostra os números publicados para aquela localidade.
- **Transparência:** se o TSE ainda não publicou dados para um cargo, turno ou localidade, a aplicação informa indisponibilidade em vez de inventar números. A estrutura dos arquivos do aplicativo oficial pode mudar; nesse caso, a rota apresenta indisponibilidade até ser atualizada.
- **Fotos:** Lula e Flávio Bolsonaro usam as imagens fornecidas pelo proprietário do projeto. Os demais candidatos usam as fotos disponibilizadas pelo TSE no aplicativo oficial.
- **Tema e créditos:** interface escura com texto em branco suave; links sociais ficam no rodapé.

## Estrutura

- `src/components/Dashboard.tsx`: filtros, busca, navegação e painel de resultados.
- `src/components/MapView.tsx`: mapa Leaflet e interação dos polígonos.
- `src/app/api/geo`: rotas de geometrias e nomes oficiais do IBGE.
- `src/app/api/results`: integração server-side com a publicação do TSE.
- `src/services/tse.ts`: leitura da configuração e dos arquivos oficiais de apuração.
- `src/app/globals.css`: layout responsivo e tema escuro.
