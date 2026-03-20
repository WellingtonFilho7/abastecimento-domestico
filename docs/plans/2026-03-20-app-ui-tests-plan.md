# App UI Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adicionar cobertura mínima de DOM para `app.js`, focando nos fluxos mais frágeis da interface sem introduzir framework de frontend.

**Architecture:** Usar `jsdom` com `node --test` para montar a casca de `index.html`, injetar `domain.js` e `state.js`, executar `app.js` e validar comportamento observável no DOM. O foco fica em home inicial, busca, modal de compras e atualização visual do estoque.

**Tech Stack:** JavaScript vanilla, `node --test`, `jsdom`.

### Task 1: Criar harness de DOM

**Files:**
- Create: `tests/app.test.js`
- Modify: `package.json`

**Step 1: Write the failing test**
- carregar `index.html` em `jsdom`
- injetar `CodexDomain` e `CodexState`
- executar `app.js`
- validar que a aba inicial renderiza a home `Hoje`

**Step 2: Run targeted test**
Run: `node --test tests/app.test.js`
Expected: FAIL até a harness ficar correta

### Task 2: Cobrir busca e modal

**Files:**
- Modify: `tests/app.test.js`

**Step 1: Write failing tests**
- busca por `arroz` mostra resultado relacionado
- clicar em `Lista rápida` abre o modal de compras

**Step 2: Run targeted test**
Run: `node --test tests/app.test.js`
Expected: FAIL, depois PASS

### Task 3: Cobrir atualização de estoque

**Files:**
- Modify: `tests/app.test.js`

**Step 1: Write failing test**
- navegar para `Estoque`
- editar input de um item
- verificar que cobertura/status da UI mudam

**Step 2: Run targeted test**
Run: `node --test tests/app.test.js`
Expected: FAIL, depois PASS

### Task 4: Verificar regressão global

**Files:**
- Modify if needed: `README.md`

**Step 1: Run full suite**
Run: `npm test`

**Step 2: Verify syntax**
Run:
- `node --check app.js`
- `node --check state.js`

Expected:
- tudo verde
