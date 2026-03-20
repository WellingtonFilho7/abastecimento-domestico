# Backup Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Endurecer backup/import e metadados de auditoria em `state.js` sem quebrar o contrato atual do app.

**Architecture:** A mudança fica confinada a `state.js` e `tests/state.test.js`, preservando `app.js` e `domain.js`. Primeiro os testes falham, depois a implementação mínima faz passar, mantendo o modelo local-first e o storage versionado.

**Tech Stack:** JavaScript vanilla, `node --test`, storage local versionado.

### Task 1: Reproduzir os bugs em teste

**Files:**
- Modify: `tests/state.test.js`
- Test: `tests/state.test.js`

**Step 1: Write the failing test**

- adicionar teste que prova que `importAppState()` não deve aceitar JSON arbitrário sem schema compatível
- adicionar teste que prova que `exportedAt` deve sobreviver ao ciclo exportar -> hidratar

**Step 2: Run test to verify it fails**

Run: `node --test tests/state.test.js`

Expected:
- falha no caso do import permissivo
- falha no caso da perda de `exportedAt`

### Task 2: Implementar a correção mínima

**Files:**
- Modify: `state.js`
- Test: `tests/state.test.js`

**Step 1: Write minimal implementation**

- validar shape/version no import
- preservar `exportedAt` no meta normalizado

**Step 2: Run targeted test**

Run: `node --test tests/state.test.js`

Expected:
- novos testes passam
- testes antigos permanecem verdes

### Task 3: Verificar regressão global

**Files:**
- Modify if needed: `README.md`

**Step 1: Run full suite**

Run: `npm test`

Expected:
- tudo verde

**Step 2: Validate syntax**

Run:
- `node --check state.js`
- `node --check app.js`

Expected:
- sem erro
