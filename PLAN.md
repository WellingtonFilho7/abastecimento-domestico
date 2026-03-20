# Plano de Redesign — Interface de Inventário Doméstico

## Decisões de UX/UI

- **Tela inicial**: Dashboard de status (raio-X rápido do estoque)
- **Navegação**: 3 abas (Estoque, Compras, Config) — Protocolos ficam dentro de Config
- **Itens**: Agrupados por categoria, colapsáveis, linhas compactas
- **Input**: Toque no item → bottom sheet com campo numérico grande + botões +/−
- **Visual**: Flat moderno, cores de status, sem glassmorphism/blur/gradientes excessivos

---

## Etapas de Implementação

### 1. Limpar identidade e nomenclatura
- Remover "Codex de Resiliência Doméstica", "bunker hermético", "documento mestre"
- Título simples: "Estoque da Casa" ou similar
- Remover `brand-kicker`, `meta-pills` do header (Gurinhém/PB, condomínio rural, etc.)
- Limpar `appProfile` em `domain.js` — remover campos editoriais desnecessários
- Remover `governanceCards`, `editorialCaveat`, `assumptionNote`

### 2. Redesign do CSS — Visual flat moderno
- Remover gradientes de fundo do `body` (radial-gradient, linear-gradient)
- Fundo: branco puro ou cinza muito claro (#f8f9fa)
- Remover `backdrop-filter: blur()` de todos os elementos
- Remover `box-shadow` decorativas pesadas, usar sombras mínimas
- Remover `glassmorphism` (backgrounds rgba com blur)
- Manter sistema de cores de status: vermelho (#d96666), amarelo (#d49b3b), verde (#3f8c77)
- Manter tipografia Manrope/IBM Plex Mono (boa escolha)
- Simplificar border-radius (de 28px/24px para 12px/8px — mais limpo)
- Cards com borda sutil e fundo branco sólido

### 3. Reestruturar navegação — 3 abas
- **Aba 1: Estoque** — Dashboard + lista agrupada por categoria
  - Topo: 3 cards de resumo (Críticos / Atenção / OK) com números grandes
  - Abaixo: grupos colapsáveis (Despensa, Freezer, Feira, Casa)
  - Cada item: uma linha com nome, qtd atual / meta, bolinha de status
- **Aba 2: Compras** — Lista do que falta
  - Gerada automaticamente do estoque
  - Organizada por ciclo de compra (atacado mensal / feira semanal)
  - Botão "Copiar lista" prominente
  - Checklist com checkboxes para marcar no mercado
- **Aba 3: Config** — Sistema + Protocolos + Backup
  - Seção "Protocolos" com os checklists existentes (rotina semanal, reabastecimento, isolamento)
  - Seção "Dados" com backup/import/reset
  - Sem cards elaborados, lista simples

### 4. Implementar bottom sheet para edição
- Componente de bottom sheet nativo (sem lib)
- Ao tocar num item da lista: abre sheet com:
  - Nome do item (grande)
  - Campo numérico centralizado (grande, fácil de digitar)
  - Botões +/− com step correto (0.5 para kg/L, 1 para unidades)
  - Unidade visível
  - Info secundária (meta min/ideal, ciclo de compra) em texto pequeno
  - Botão "Salvar" ou auto-save ao fechar
- Overlay escurecido atrás
- Swipe down para fechar (mobile)

### 5. Reestruturar app.js — Renderização
- Remover renderização de: hero cards, system-hero, protocol-callout, focus-grid, governance-grid, storage-grid, phase-grid
- Simplificar para 3 renderers: `renderEstoque()`, `renderCompras()`, `renderConfig()`
- `renderEstoque()`:
  - Dashboard cards (3 resumos)
  - Loop por categoria → grupo colapsável → linhas de item
- `renderCompras()`:
  - Lista agrupada por ciclo de compra
  - Cada item: checkbox + nome + "comprar X unid" + status atual
- `renderConfig()`:
  - Protocolos como accordion
  - Botões de backup/import/reset

### 6. Manter funcionalidades core intactas
- `domain.js`: manter toda a lógica de cálculo (computeStockSnapshot, buildShoppingList, etc.)
- `state.js`: manter localStorage persistence
- Busca global (search): simplificar mas manter funcional
- Modal de lista rápida: manter, é útil
- PWA/Service Worker: manter

### 7. Limpar domain.js
- Remover `storageContainers` (detalhe de potes não é core)
- Remover `procurementPhases` (fases de compra no supermercado — muito específico)
- Simplificar `sections` para 3 entries
- Manter `protocolCards` mas mover para Config
- Limpar textos editoriais dos items (notes como "bunker principal", "documento mestre", etc.)

---

## Arquivos a modificar

1. **`index.html`** — Reestruturar HTML, remover header pesado, simplificar nav
2. **`styles.css`** (inline no HTML) — Redesign completo do CSS
3. **`app.js`** — Reescrever renderers para nova estrutura
4. **`domain.js`** — Limpar nomenclatura e remover dados desnecessários
5. **`state.js`** — Sem mudanças significativas (lógica de persistência está boa)

## Ordem de execução

1. domain.js (limpeza de dados)
2. index.html (nova estrutura HTML + CSS inline)
3. app.js (novos renderers)
4. Teste manual e ajustes
