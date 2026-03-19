# Code Review — Codex de Resiliência Doméstica

## Resumo do projeto

Aplicação PWA local-first para gerenciamento de abastecimento doméstico rural em Gurinhém/PB. Gerencia estoque de despensa (SG/SL), proteínas/freezer, feira semanal, higiene/limpeza e itens de contingência para uma família de 6 pessoas. Funciona 100% offline após primeira visita, com backup/import via JSON.

---

## Arquitetura

| Arquivo | Responsabilidade | LOC |
|---|---|---|
| `domain.js` | Dados de domínio (itens, perfil, categorias) e lógica pura (snapshot, shopping list, status) | ~1250 |
| `state.js` | Persistência localStorage, migração de legacy, sanitização, CRUD de estado | ~230 |
| `app.js` | Bootstrap, rendering (innerHTML), eventos, UI (tabs, modal, toast, checklist) | ~800 |
| `index.html` | Shell HTML + CSS completo inline (~625 linhas de style) | ~670 |
| `service-worker.js` | Cache-first para assets, network-first para navegação | ~60 |
| `pwa-config.js` | Lista de assets do app shell e nome do cache | ~27 |

**Padrão geral:** IIFE com UMD-like export (`window.CodexDomain`, `window.CodexState`), sem bundler, sem framework. Adequado para o escopo.

---

## Pontos positivos

1. **Separação domain/state/app** — A lógica de domínio é pura e testável, o estado é isolado, e a UI é a única camada com side-effects do DOM. Boa separação para um projeto sem framework.

2. **Testes existentes e passando** — 13 testes cobrindo domain, state, PWA config e vercel config. Todos passam.

3. **Migração de legacy transparente** — `hydrateAppState` detecta chaves v2 antigas, migra para v3 e limpa as chaves legadas automaticamente.

4. **Sanitização defensiva** — `sanitizeStock`, `sanitizeChecklist` e `normalizeMeta` protegem contra dados corrompidos no localStorage ou em imports JSON.

5. **PWA bem configurada** — Service worker com cache-first para assets locais, network-first para navegação, limpeza de caches antigos no activate, e `skipWaiting`/`clients.claim` para update imediato.

6. **Acessibilidade básica presente** — `role="tablist"`, `aria-selected`, `aria-controls`, `aria-pressed`, `aria-live="polite"` no toast, `aria-label` nos inputs.

7. **Responsividade** — Media queries para mobile com tabela colapsando em cards via `data-label` + `::before`.

8. **Vercel headers corretos** — `Cache-Control: must-revalidate` para arquivos mutáveis, `immutable` para ícones.

---

## Problemas encontrados

### Severidade Alta

#### 1. XSS via innerHTML com dados do domínio
**Arquivos:** `app.js` (linhas 144, 163, 370–443, 527–543)

Toda a renderização usa `innerHTML` com template literals. Embora hoje os dados venham de `domain.js` (estáticos), a função `importAppState` aceita JSON arbitrário e o stock é exibido via `input.value` no template. Se um item.label ou item.note contiver HTML, ele será interpretado.

**Risco:** Baixo hoje (dados estáticos), mas qualquer evolução para dados dinâmicos (API, import de catálogo) abre vetor de XSS.

**Sugestão:** Criar uma função `escapeHtml()` e usar nos templates, ou migrar para `textContent`/`createElement` nas partes que exibem dados de usuário.

#### 2. Rendering completo a cada interação de checklist
**Arquivo:** `app.js:606-610`

```js
function toggleChecklist(checkId) {
    state.persisted = toggleChecklistValue(state.persisted, checkId, nowIso());
    persistState();
    renderMain(); // re-renderiza TODA a main
}
```

`renderMain()` reconstrói todo o DOM via innerHTML. Para checklist, isso causa perda de foco, scroll reset e trabalho desnecessário. Compare com `syncInventoryRow` que faz update cirúrgico.

**Sugestão:** Criar `syncChecklistItem(checkId)` análogo ao padrão já usado em inventory.

#### 3. `computeStockSnapshot` espalha item inteiro no retorno
**Arquivo:** `domain.js:1164`

```js
return { ...item, current, days, coverage, ... };
```

O spread de `item` no snapshot mistura dados de domínio com dados computados. Se um campo novo for adicionado ao item com o mesmo nome de um campo computado (ex: `status`, `coverage`), haverá colisão silenciosa.

**Sugestão:** Retornar o item como propriedade aninhada: `{ item, current, days, ... }` ou pelo menos documentar que os campos computados sobrescrevem os do item.

### Severidade Média

#### 4. Service worker não versiona o cache com o conteúdo
**Arquivo:** `pwa-config.js:10`

```js
const CACHE_NAME = 'codex-shell-v1';
```

O nome do cache é fixo. Quando o JS muda, o SW precisa ser atualizado manualmente para invalidar o cache. Sem hash ou versão dinâmica, usuários podem ficar presos em versões antigas.

**Sugestão:** Bumpar `CACHE_NAME` a cada deploy, ou adicionar um mecanismo de verificação de versão.

#### 5. Modal não captura foco (focus trap)
**Arquivo:** `app.js:632-634`, `index.html:651-660`

O modal tem `aria-modal="true"` mas não implementa focus trap. O usuário pode Tab para fora do modal, interagindo com elementos por trás do overlay.

**Sugestão:** Implementar focus trap básico ou usar `<dialog>` nativo que já fornece isso.

#### 6. Evento `input` dispara save no localStorage a cada keystroke
**Arquivo:** `app.js:105-114`

```js
document.addEventListener('input', event => {
    ...
    state.persisted = updateStockValue(...);
    persistState(); // JSON.stringify + localStorage.setItem a cada tecla
    syncInventoryRow(...);
});
```

Digitar "150" no campo de ovos gera 3 saves (`1`, `15`, `150`). Em devices lentos, isso pode causar jank.

**Sugestão:** Debounce de 300-500ms no `persistState`, mantendo o state in-memory atualizado imediatamente.

#### 7. `groupBy` assume que `key` sempre existe
**Arquivo:** `app.js:703-710`

Se um item não tiver a propriedade `group`, o groupKey será `undefined` e os itens ficarão agrupados sob a chave string `"undefined"`.

**Sugestão:** Adicionar fallback: `const groupKey = item[key] || 'Outros';`

### Severidade Baixa

#### 8. CSS inline no HTML (~600 linhas)
**Arquivo:** `index.html:16-625`

Todo o CSS está inline no `<style>`. Isso funciona para PWA (menos requests), mas dificulta manutenção e não permite cache separado do HTML.

**Sugestão:** Considerar extrair para `styles.css` e adicionar ao `APP_SHELL_ASSETS`. O SW já cacheia assets locais.

#### 9. `showTab` recria todo o DOM
**Arquivo:** `app.js:545-550`

Trocar de aba chama `renderNavigation()` + `renderMain()`, reconstruindo todo o DOM. Para um app deste tamanho é aceitável, mas com crescimento pode causar lentidão.

**Sugestão:** Alternar classes `.active` nos sections já renderizados, sem re-render.

#### 10. Acessibilidade — checkboxes sem label visível associada
**Arquivo:** `app.js:529-536`

Os botões `.check-box` não têm `aria-label`. O texto está no sibling `.check-text`, mas sem associação programática (`aria-labelledby`).

**Sugestão:** Adicionar `aria-labelledby` apontando para um id no `.check-text`.

#### 11. `formatAuditTimestamp` duplicada conceitualmente
**Arquivo:** `app.js:723-737`

A função valida e formata timestamps. Se `domain.js` ou `state.js` precisar de formatação similar, terá que reimplementar.

**Sugestão:** Mover para `state.js` ou criar um módulo de formatação compartilhado se necessário.

#### 12. `backupImportInput.click()` sem feedback de loading
**Arquivo:** `app.js:95`

O import de backup usa `file.text().then(...)` — se o arquivo for grande, não há indicação visual de que o import está em andamento.

---

## Cobertura de testes

| Módulo | Testes | Cobertura |
|---|---|---|
| `domain.js` | Snapshot computation, shopping list, status, formatação | Boa |
| `state.js` | CRUD, migração legacy, sanitização, export/import | Boa |
| `pwa-config.js` | Estrutura do config | Básica |
| `vercel.json` | Estrutura de headers | Básica |
| `app.js` | **Nenhum** | Zero |

**Lacuna principal:** `app.js` não tem testes. A lógica de renderização e event handling está toda acoplada ao DOM, dificultando testes unitários. As funções puras (como `groupBy`, `formatAuditTimestamp`, `getChecklistProgress`) poderiam ser extraídas e testadas.

---

## Recomendações prioritárias

1. **Adicionar `escapeHtml`** nos templates que exibem dados — previne XSS futuro com esforço mínimo
2. **Sync cirúrgico no checklist** em vez de `renderMain()` — melhoria de UX imediata
3. **Debounce no persist** do input de estoque — evita writes excessivos
4. **Focus trap no modal** ou migrar para `<dialog>` — acessibilidade
5. **Versionar `CACHE_NAME`** a cada release — evita cache stale

---

## Conclusão

O projeto está bem estruturado para seu escopo: separação clara de responsabilidades, testes passando, PWA funcional e dados de domínio ricos. Os problemas mais relevantes são o rendering desnecessário no checklist, a falta de escape HTML nos templates e o debounce ausente no input de estoque. São correções pontuais que não exigem reestruturação.
