# Solo Review Cycle

Workflow adaptado para o `abastecimento-domestico`, inspirado na sequência:

1. codebase review question audit
2. questions resolution implementation
3. implementation verification pass
4. release readiness pass

## Objetivo

Criar um ciclo leve de revisão para um app `local-first`, `single-user`, sem backend, sem login e com deploy estático opcional.

Este fluxo serve melhor para:

- auditorias antes de refactor grande
- migração de stack
- revisão de bugs e inconsistências
- checagem de prontidão antes de deploy na Vercel

## Ajustes para este projeto

- Os artefatos ficam em `docs/reviews/YYYY-MM-DD-<slug>/`.
- `QUESTIONS.md` pode conter respostas inline quando a decisão já estiver clara no código, no README ou na conversa.
- A fase 2 pode rodar em modo `advisory`:
  - converte respostas em backlog e ordem de implementação
  - não exige mudança de código no mesmo ciclo
- A fase 4 deve avaliar prontidão contra um alvo realista:
  - demo local
  - uso pessoal em `localhost`
  - deploy estático pessoal na Vercel
  - handoff para outro dev

## Fase 1 — Discovery

Produz `QUESTIONS.md`.

Objetivo:

- entender o estado atual do repo
- transformar ambiguidades, riscos e decisões implícitas em perguntas claras

Perguntas obrigatórias para este repo:

- o alvo de release é pessoal ou de handoff?
- o comportamento local-first atual é intencional?
- backup/import/export está seguro o suficiente?
- a cobertura de testes é adequada para UI e estado?
- a camada PWA está operacional ou só configurada?

## Fase 2 — Resolution / Scoped Implementation

Produz `IMPLEMENTATION_NOTES.md`.

Objetivo:

- converter respostas em ações concretas
- separar `corrigir agora`, `adiar`, `fora de escopo`

Para este repo, a ordem preferida é:

1. corretude e preservação de dados
2. testes
3. observabilidade/operabilidade
4. refactor maior
5. redesign visual

## Fase 3 — Verification

Produz `VERIFICATION.md`.

Objetivo:

- verificar o estado atual ou as mudanças feitas
- distinguir `verified`, `partial`, `blocked`, `caveat`, `out-of-scope`

Comandos mínimos para este repo:

```bash
npm test
node --check app.js
node --check domain.js
node --check state.js
node --check service-worker.js
```

Áreas obrigatórias de revisão:

- `domain.js`
- `state.js`
- `app.js`
- `service-worker.js`
- `README.md`
- testes em `tests/`

## Fase 4 — Release Readiness

Produz `RELEASE_READINESS.md`.

Objetivo:

- decidir se o projeto está `Ready`, `Ready with caveats` ou `Not ready`

Dimensões mínimas:

- runtime local
- configuração
- validação e testes
- deploy estático
- observabilidade/falha
- documentação
- risco de produto

## Defaults deste repo

- `domain.js` e `state.js` são áreas de alta sensibilidade.
- `app.js` concentra a maior parte do risco de regressão por falta de testes.
- Para mudanças grandes, a sequência recomendada é:
  - primeiro paridade funcional
  - depois testes de UI
  - depois PWA
  - só então redesign ou migração de stack

## Saída esperada de cada rodada

- `QUESTIONS.md`: perguntas e respostas/assunções atuais
- `IMPLEMENTATION_NOTES.md`: decisão convertida em backlog ou mudança aplicada
- `VERIFICATION.md`: checagem factual do estado
- `RELEASE_READINESS.md`: veredito relativo ao alvo de release
