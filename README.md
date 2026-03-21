# Codex de Resiliência Doméstica

Aplicação local-first para operação de abastecimento doméstico em contexto rural, guiada por um documento mestre de domínio.

## O que mudou

- O projeto deixou de depender de tabelas hardcoded dentro do HTML.
- O domínio agora vive em [`domain.js`](./domain.js): perfil da família, armazenagem, inventário, ciclos de compra e protocolos.
- A interface em [`index.html`](./index.html) e [`app.js`](./app.js) renderiza a partir dessa fonte estruturada.
- Itens recorrentes e itens de contingência passaram a ter regras diferentes de cálculo.

## Estrutura

- `index.html`: casca da interface e estilos do app.
- `app.js`: renderização, persistência local e interações.
- `domain.js`: dados estruturados + funções puras de cálculo.
- `state.js`: persistência local, migração e sanitização do estado.
- `tests/`: suíte de regressão com `node --test`.
- `docs/`: planos, revisões e material de apoio do projeto.

## Organização do repo

- A raiz concentra apenas arquivos de runtime, deploy e testes.
- Artefatos de revisão e questionários ficam em `docs/reviews/`.
- Planos e decisões de implementação ficam em `docs/plans/`.

## Fonte de verdade

O app está calibrado pelo documento mestre de resiliência doméstica:

- compra híbrida: atacado mensal + feira semanal;
- restrições alimentares: sem glúten e sem lactose/zero lactose;
- planejamento operacional para 6 pessoas;
- orçamento mensal de referência;
- bunker hermético e estratégia de freezer.

## Uso

Abra [`index.html`](./index.html) no navegador.

O estado é salvo localmente no `localStorage`.

Para usar o modo PWA instalável e o service worker, abra o projeto por `localhost` ou `https`.

Exemplo simples:

```bash
cd /Users/wellingtonfilho/Documents/GitHub/abastecimento-domestico
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173`.

## Backup e reset

- `Exportar backup`: gera um JSON com estoque, checklist e metadados de auditoria.
- `Importar backup`: reidrata esse JSON no navegador atual.
- `Resetar estado`: limpa o storage versionado local e reinicia o app.

## Vercel

O repo está pronto para deploy estático na Vercel.

- `Framework Preset`: `Other`
- `Build Command`: vazio
- `Output Directory`: vazio
- `Install Command`: vazio

O arquivo [`vercel.json`](./vercel.json) fixa headers para `service-worker.js`, `manifest.webmanifest`, scripts do shell e ícones do PWA.

## Testes

```bash
npm test
```
