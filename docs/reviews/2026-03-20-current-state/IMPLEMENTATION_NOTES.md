# Implementation Notes

## Summary

Esta execução do fluxo foi rodada em modo `advisory`.

Nenhuma mudança de código foi aplicada nesta fase. O objetivo aqui foi converter as respostas e assunções atuais em um backlog de implementação seguro e ordenado.

## Decision Mapping

### D1. Manter o produto como single-user, local-first e estático
- **Decision:** preservar a arquitetura atual sem backend, login ou sincronização
- **Action taken:** nenhuma mudança de código; escopo mantido
- **Status:** `verified`

### D2. Preservar `domain.js` e `state.js` como áreas estáveis
- **Decision:** manter esses módulos como contratos centrais do sistema
- **Action taken:** nenhuma mudança de código; registrado como restrição para próximas rodadas
- **Status:** `verified`

### D3. Tratar o fluxo de backup/import como prioridade de corretude
- **Decision:** considerar a validação permissiva de backup como item prioritário
- **Action taken:** entrou como primeira correção recomendada
- **Status:** `partial`

### D4. Corrigir a perda de metadados de auditoria
- **Decision:** alinhar o modelo para preservar `exportedAt` ou remover o campo do export
- **Action taken:** entrou como segunda correção recomendada
- **Status:** `partial`

### D5. Reforçar testes antes de refactor maior ou migração de stack
- **Decision:** não iniciar replatforming grande sem cobertura adicional da camada de UI
- **Action taken:** registrado como gate para próximas rodadas
- **Status:** `partial`

### D6. Adiar React/Vite/Tailwind e redesign visual
- **Decision:** manter a migração como trabalho futuro, após estabilização do baseline
- **Action taken:** backlog explicitamente marcado como `deferred`
- **Status:** `deferred`

## Applied Changes

- Nenhuma mudança de código nesta execução.
- Foram adicionados os documentos de workflow adaptado e os artefatos desta revisão.

## Recommended Implementation Order

### 1. Correctness fixes
- endurecer `importAppState()` com validação explícita de shape/version
- alinhar o comportamento de metadados de auditoria em `exportAppState()` e `hydrateAppState()`
- decidir e documentar a semântica final de `resetState()`

### 2. Test hardening
- adicionar testes para `normalizeNumber()` e seus edge cases
- adicionar testes focados em `app.js` para:
  - input de estoque
  - import/export
  - reset
  - modal de compras

### 3. Operability improvements
- adicionar sinalização mínima para falha de registro do service worker
- revisar se persistência por keystroke continua aceitável ou deve migrar para debounce/blur

### 4. Deferred major work
- migração para React/Vite/TypeScript
- redesign completo da interface
- revisão mais profunda de experiência mobile

## Tests Updated

- Nenhum teste alterado nesta execução.

## Docs Updated

- `docs/review-workflow/solo-review-cycle.md`
- `docs/reviews/2026-03-20-current-state/QUESTIONS.md`
- `docs/reviews/2026-03-20-current-state/IMPLEMENTATION_NOTES.md`
- `docs/reviews/2026-03-20-current-state/VERIFICATION.md`
- `docs/reviews/2026-03-20-current-state/RELEASE_READINESS.md`

## Deferred Items

- migração de stack
- redesign visual
- refactor estrutural maior de `app.js`

## Blocked Items

- nenhum bloqueio técnico imediato para as correções pequenas
- release mais amplo ou handoff seguem bloqueados por cobertura/operabilidade insuficientes
