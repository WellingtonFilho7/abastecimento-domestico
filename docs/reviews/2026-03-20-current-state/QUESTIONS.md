# QUESTIONS.md

## Project Understanding Summary

O `abastecimento-domestico` é um PWA estático em JavaScript vanilla, orientado por `domain.js` e `state.js`, com UI renderizada por `app.js`, persistência local em `localStorage` e deploy estático opcional na Vercel.

O centro arquitetural está em:

- `domain.js`: catálogo, regras de cálculo e agrupamentos
- `state.js`: hidratação, persistência, backup/import/export e metadados
- `app.js`: renderização, eventos, navegação e integração com o navegador

Áreas de maior risco no estado atual:

- robustez do fluxo de backup/importação
- preservação de metadados de auditoria
- falta de testes para `app.js`
- diagnosabilidade fraca do service worker

## How to Answer

Nesta versão adaptada para projeto solo, cada pergunta pode trazer:

- `Current answer / assumption`
- `Status`

Use estes rótulos:

- `verified`
- `partial`
- `blocked`
- `deferred`
- `out-of-scope`
- `caveat`

## Questions

### 1. Product & Intended Behavior

#### Q1. O alvo de release desta rodada é apenas uso pessoal e single-user?
- **Where:** `README.md`, `package.json`, decisões anteriores do projeto
- **Why this matters:** o nível aceitável de risco muda bastante entre uso pessoal, handoff e release mais amplo
- **Current answer / assumption:** sim; o alvo atual é uso pessoal em `localhost` ou deploy estático pessoal na Vercel
- **Status:** `verified`
- **Question:** existe algum alvo adicional nesta rodada, como handoff para outro dev ou uso compartilhado?

#### Q2. O modelo local-first sem backend, login ou sincronização continua sendo intencional?
- **Where:** `README.md`, arquitetura atual do repo
- **Why this matters:** isso define limites claros para storage, backup, UX e PWA
- **Current answer / assumption:** sim; permanece intencional e fora de escopo adicionar backend ou auth agora
- **Status:** `verified`
- **Question:** alguma exceção precisa ser considerada para export/import ou sincronização manual?

### 2. Architecture

#### Q3. A separação atual entre domínio, estado e UI deve ser preservada como contrato estável?
- **Where:** `domain.js`, `state.js`, `app.js`
- **Why this matters:** essa é a principal proteção contra regressão caso haja refactor ou migração futura
- **Current answer / assumption:** sim; `domain.js` e `state.js` devem continuar sendo módulos puros e reutilizáveis
- **Status:** `verified`
- **Question:** alguma mudança grande de stack deve esperar a correção dos riscos atuais primeiro?

#### Q4. A migração futura para React/Vite/Tailwind está aprovada agora ou segue como trilha futura?
- **Where:** decisões recentes do projeto
- **Why this matters:** evita misturar correção de bugs, redesign e replatforming num único pacote
- **Current answer / assumption:** permanece como trilha futura; primeiro corrigir baseline, reforçar testes e só depois migrar
- **Status:** `deferred`
- **Question:** há alguma pressão real para iniciar a migração antes de estabilizar o estado atual?

### 3. State, Backup & Auditability

#### Q5. Importar um JSON arbitrário válido e tratá-lo como backup vazio é comportamento aceitável?
- **Where:** `state.js`
- **Why this matters:** pode levar a sobrescrita silenciosa do estado local com sucesso falso de importação
- **Current answer / assumption:** não parece aceitável; o import deveria validar shape/version antes de aceitar
- **Status:** `partial`
- **Question:** o import deve falhar explicitamente para arquivos sem schema compatível?

#### Q6. O campo `exportedAt` deve sobreviver ao ciclo exportar -> carregar -> rehidratar?
- **Where:** `state.js`
- **Why this matters:** a feature de auditoria perde valor se o próprio app descarta seus metadados
- **Current answer / assumption:** sim, se o campo existe no backup ele deveria ser preservado; se não for útil, deve ser removido do export
- **Status:** `partial`
- **Question:** a intenção é preservar esse campo ou simplificar o modelo e parar de exportá-lo?

#### Q7. O reset do estado deve “limpar storage” ou “reinicializar o app com estado vazio”?
- **Where:** `state.js`, `app.js`
- **Why this matters:** helper e UI hoje contam histórias ligeiramente diferentes sobre o que significa resetar
- **Current answer / assumption:** para o usuário, o comportamento esperado parece ser reinicialização limpa do app
- **Status:** `caveat`
- **Question:** a copy e os testes devem ser alinhados a essa semântica?

### 4. Performance & Interaction

#### Q8. Persistir no `localStorage` a cada keystroke continua aceitável para este app?
- **Where:** `app.js`
- **Why this matters:** aumenta ruído de escrita, acopla input e persistência e dificulta refactor futuro
- **Current answer / assumption:** aceitável no curto prazo pelo tamanho do app, mas merece revisão
- **Status:** `caveat`
- **Question:** o comportamento desejado é persistir por debounce, por `blur`, ou continuar imediato?

### 5. Testing & QA

#### Q9. A ausência de testes de UI/DOM para `app.js` é aceitável antes de mudanças maiores?
- **Where:** `tests/`, `app.js`
- **Why this matters:** a camada mais frágil do projeto hoje é justamente a menos coberta
- **Current answer / assumption:** não é ideal; para refactor ou migração, isso deveria ser reforçado antes
- **Status:** `partial`
- **Question:** o próximo pacote de testes deve focar primeiro em backup/import/reset ou em renderização e interações de estoque?

#### Q10. `normalizeNumber()` precisa ter edge cases cobertos explicitamente?
- **Where:** `domain.js`, `tests/domain.test.js`
- **Why this matters:** esse utilitário afeta cálculo de cobertura, status e lista de compras
- **Current answer / assumption:** sim; faltam casos explícitos para `NaN`, negativos, string inválida e vírgula decimal
- **Status:** `partial`
- **Question:** o comportamento correto para negativos deve ser aceitar, normalizar para zero ou rejeitar?

### 6. PWA & Operability

#### Q11. Falha silenciosa no registro do service worker é aceitável para o alvo atual?
- **Where:** `app.js`, `service-worker.js`
- **Why this matters:** quando o offline não funciona, hoje há pouca visibilidade do motivo
- **Current answer / assumption:** aceitável para manter o app funcional sem SW, mas fraco para diagnóstico
- **Status:** `caveat`
- **Question:** deve haver ao menos um `console.warn` em ambiente normal para facilitar debug?

#### Q12. O nível atual de prontidão PWA é suficiente para uso pessoal, mas insuficiente para handoff?
- **Where:** `README.md`, `manifest.webmanifest`, `service-worker.js`, `tests/pwa.test.js`
- **Why this matters:** evita vender o mesmo nível de garantia para targets diferentes
- **Current answer / assumption:** sim; pessoal/estático está próximo do aceitável, handoff ainda não
- **Status:** `verified`
- **Question:** o próximo ciclo deve mirar robustez PWA ou estabilização da camada de estado?
