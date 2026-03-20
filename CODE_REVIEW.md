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

---

## Respostas — Questões de Revisão (Q1–Q40)

### Arquitetura e Estrutura

**R1.** O padrão IIFE com export via `window.*`, sem bundler nem framework, é defensável para este porte. **Vantagens:** simplicidade operacional, zero build, menos pontos de falha, debug direto no browser, deploy previsível (só servir arquivos estáticos). **Desvantagens:** acoplamento global via `window`, risco de colisão de nomes, modularidade limitada, escala pior com crescimento, sem tree-shaking/code splitting, tipagem e tooling avançado mais difíceis. Para o porte atual, funciona. Para crescer muito, tende a cobrar juros.

**R2.** Sim, a separação é boa. `domain.js` (regras puras), `state.js` (persistência), `app.js` (UI) — cada camada com responsabilidade clara. Facilita testar regras sem DOM, reduz impacto de mudanças visuais nas regras, melhora legibilidade e permite evoluir persistência sem mexer na lógica.

**R3.** Extrair CSS para `styles.css`: **Prós** — HTML menor e mais legível, CSS cacheável separadamente, manutenção melhor, diff mais claro. **Contras** — mais uma request inicial, possível atraso na pintura, ganho mais organizacional que técnico em app minúscula. Com service worker e cache local, eu tenderia a extrair. O custo extra da primeira carga é pequeno e o ganho de manutenção compensa.

---

### Segurança

**R4.** Há risco real de XSS. `importAppState` aceita JSON arbitrário. Se qualquer campo importado for interpolado em `innerHTML`, pode conter payloads como `<img onerror=...>` ou `<svg onload=...>`. **Mitigação:** escapar strings antes de injetar em innerHTML, preferir `textContent`, validar/sanitizar JSON importado rigidamente, restringir schema do backup, usar DOM APIs nas partes sensíveis.

**R5.** Uma função `escapeHtml()` (convertendo `&`, `<`, `>`, `"`, `'`) melhora bastante a segurança. **Onde pode quebrar:** se algum campo depende de HTML intencional, se usada em atributos já processados, ou se causar dupla-escapada. Se a UI é textual, não é problema. Se houver campos com markup legítimo, tratamento deve ser seletivo.

---

### Performance

**R6.** A técnica recomendada é **debounce** (250–400ms). Reduz escritas repetidas, chamadas a `JSON.stringify`, travadas em celulares lentos e melhora fluidez. Para formulários, debounce é uma das otimizações com melhor custo-benefício.

**R7.** Re-render completo é especialmente ruim para checklist porque a interação é frequente, rápida e repetitiva. `renderMain()` destrói/recria o DOM, pode perder foco, gerar flicker e resetar interações em andamento. Update cirúrgico mantém o resto intacto. Checklists pedem resposta imediata e leve.

**R8.** Melhor manter abas já renderizadas e alternar visibilidade (classes de ativação, `hidden`, `display: none`). Isso evita recriar navegação e conteúdo, preserva estado local e dá sensação de app mais sólida.

---

### Dados e Domínio

**R9.** O spread `{ ...item, current, days, coverage }` cria risco de colisão silenciosa. Se `item` já tiver uma propriedade com mesmo nome de um campo computado, o valor é sobrescrito sem aviso. **Melhor:** `{ item, metrics: { current, days, coverage } }` — separa dado original de dado derivado.

**R10.** Se a propriedade não existir, `groupBy` agrupa em `"undefined"`. Dados malformados passam despercebidos. **Melhor:** validar se a chave existe e decidir explicitamente entre ignorar, lançar erro ou enviar para grupo "Outros".

---

### PWA e Cache

**R11.** Com `CACHE_NAME` fixo, código novo pode não chegar ao usuário. **Mecanismo correto:** versionar o cache e limpar caches antigos no `activate`. Também ajuda: `skipWaiting`, `clients.claim`, aviso de "nova versão disponível".

**R12.** **Cache-first para assets:** JS/CSS/ícones mudam pouco, leitura local é rápida, melhora uso offline. **Network-first para navegação:** tenta buscar HTML atualizado, cai no cache se falhar. Assets estáveis favorecem cache-first; documento de navegação favorece tentativa de atualização primeiro.

---

### Acessibilidade

**R13.** Sem focus trap, o usuário de teclado "escapa" do modal e navega no conteúdo de fundo. Gera confusão de contexto e foco em elementos invisíveis. **Solução nativa:** `<dialog>` com `showModal()` entrega focus trap automaticamente.

**R14.** Sem `aria-label` ou associação programática, leitor de tela pode anunciar só "botão" sem contexto. **Correção:** `aria-labelledby` apontando para o texto, ou `<label>` envolvendo o checkbox, ou controle nativo `<input type="checkbox">` associado a label.

---

### Testes

**R15.** Candidatas a extração e teste: normalização de input numérico, formatação de valores, agrupamentos (`groupBy`), composição de dados para render, lógica de indicadores visuais, builders de listas/summaries, parsing de parâmetros de UI, `getChecklistProgress`, `formatAuditTimestamp`. Extrair para utilitários puros e testar fora do DOM.

**R16.** `node --test` faz sentido: zero dependência extra, setup mínimo, menor superfície de manutenção, execução rápida. Jest/Vitest brilham com ecossistema maior, mocks complexos e snapshots. Para projeto sem dependências e módulos puros, runner nativo é boa escolha.

---

### Estado e Persistência

**R17.** Migração transparente é vital porque PWA vive no browser do usuário e os dados são dele. Sem isso, update de versão pode quebrar estado salvo, perder dados, gerar tela vazia ou exigir intervenção manual. Protege continuidade — uma das coisas mais importantes em app com persistência local.

**R18.** Dados corrompidos podem vir de: edição via devtools, import de backup ruim, versão antiga incompatível, interrupção de escrita, bugs anteriores, extensões do browser, storage parcialmente sobrescrito. localStorage não é banco confiável nem tipado — se o app assume dados limpos, corrupção pequena quebra toda a experiência.

---

### Deploy e Configuração

**R19.** **Mutáveis com `must-revalidate`:** força cliente a verificar se há versão nova. **Imutáveis com `immutable`:** ícones raramente mudam, browser pode evitar revalidação. O header acompanha a natureza do arquivo.

**R20.** `"display": "standalone"` faz a PWA parecer app instalado — remove UI do browser, dá sensação nativa. **Alternativas:** `browser` (site comum), `minimal-ui` (pouca UI), `fullscreen` (tela inteira). Standalone é o mais equilibrado para este caso.

---

### Frontend — Renderização e DOM

**R21.** Construir UI com strings + `innerHTML` é rápido para começar, mas cobra preço. **Performance:** mais reflow/repaint, pior escalabilidade. **Segurança:** maior risco de XSS. **Manutenibilidade:** templates grandes ficam frágeis, interpolação excessiva dificulta leitura. **Alternativas:** `document.createElement` (mais seguro e controlado), `<template>` (equilíbrio declarativo), lit-html (atualização eficiente). Para app pequena ainda passa, mas com crescimento o custo de manutenção sobe rápido.

**R22.** `renderMain()` destrói e reconstrói inputs, causando perda de posição do cursor, seleção de texto e foco — interface "brigando" com o usuário. **Reconciliação sem framework:** updates cirúrgicos por seletor, patch de trechos específicos, preservação explícita de foco/seleção, render por componentes pequenos em vez do bloco inteiro.

**R23.** Event delegation com `data-action` é bom padrão. **Vantagens:** menos listeners, funciona com elementos dinâmicos, simplifica wiring, separa estrutura e comportamento. **Riscos:** captura de cliques não previstos, handler virando switch gigante, ambiguidade de alvo. Memory leak não é o maior risco; complexidade de roteamento de eventos é.

**R24.** Com 200+ itens: mais custo de montagem de string, parse HTML, layout e pintura, maior latência percebida. **Técnicas:** virtualização (renderizar só o visível), lazy rendering (por partes), paginação por categoria, diff parcial ao atualizar uma linha.

---

### UI — Design Visual e Componentes

**R25.** 3 famílias externas impactam FCP em rede rural lenta: mais requests, mais bytes, risco de FOIT ou troca visual tardia. **Mitigações:** `font-display: swap`, fallback de sistema bem escolhido, reduzir pesos carregados, considerar cortar uma família, hospedar fontes localmente. Num app utilitário, desempenho geralmente vale mais que sofisticação tipográfica.

**R26.** Só cor não basta para acessibilidade. **Reforços:** ícones diferentes por status, padrões de fundo, bordas/formatos distintos, intensidade de preenchimento, marcadores visuais (triângulo de alerta, check, ponto crítico). O ideal é redundância semântica: cor + texto + forma.

**R27.** **Fallback para `backdrop-filter`:** usar overlay sem blur, manter fundo semitransparente escuro, aplicar blur só com `@supports`. Melhor perder o efeito visual do que introduzir jank em dispositivos antigos.

**R28.** Tabela-em-blocos degrada com muitas colunas: leitura cansativa, desalinhamento mental rótulo/valor, comparação entre linhas ruim, densidade informacional despenca. **Alternativas mobile:** cards por item, seções colapsáveis, lista com resumo + tela de detalhe, edição inline só dos campos essenciais. Inventário funciona melhor como lista que como tabela em telas pequenas.

**R29.** Sticky nav com 6 abas pode ser demais em smartphone de 5". **Alternativas:** bottom navigation, cards com atalhos na home, seções colapsáveis, swipe entre painéis. Hamburger esconde demais — para uso frequente, bottom navigation ou home com atalhos claros funciona melhor no contexto rural.

**R30.** Contraste precisa ser medido, não presumido. Alvo AA: 4.5:1 para texto normal. **Pontos de atenção:** `.pill`, `.badge`, texto sobre fundos intermediários, verde sobre bege claro, tons suaves. **Correções:** escurecer texto, clarear fundo. Tons "bonitos" mas fracos não servem para texto funcional.

---

### UX — Experiência do Usuário

**R31.** Backup manual por JSON não é ideal para público não técnico. **Melhorias prioritárias:** nome de arquivo legível com data/hora, backup automático antes de operações destrutivas, lembrete de backup, exportação com texto explicativo. QR code para transferência é interessante mas aumenta complexidade.

**R32.** Edição item-a-item fica tediosa no reabastecimento mensal (~30 itens). **Padrões melhores:** modo de edição em lote, marcar múltiplos itens, preset de compra recorrente, atalho "repor até o ideal", fluxo de conferência de compra. Scanner de nota fiscal seria salto grande de complexidade — priorizar lote e presets.

**R33.** Checklists permanentes perdem valor operacional para rotinas periódicas. **Melhor:** reset automático por ciclo, histórico de conclusões, indicação de última execução, lembrete contextual. Checklist temporal > checklist permanente.

**R34.** Falta feedback de impacto em tempo real. **Padrões melhores:** indicador inline por item ("faltam 3"), resumo lateral/fixo de compra necessária, atualização instantânea ao editar estoque, destaque visual para itens abaixo do ideal. Indicador inline simples + resumo agregado no topo/rodapé.

**R35.** Risco real de perda acidental — toque rápido em mobile, leitura apressada do `confirm()`. **Soluções:** backup automático antes do reset (custo mínimo, proteção máxima), undo com tempo curto, reset em duas etapas.

**R36.** Sem onboarding, primeiro contato fica frio. **Elementos úteis:** empty states com instrução clara, checklist de primeiro uso, CTA tipo "comece preenchendo o estoque", dicas contextuais. Evitar tour longo — melhor tela inicial simples com passos claros.

**R37.** Para "Importar backup" (ação destrutiva), toast pós-ação não basta. **Melhor:** confirmação forte antes + backup automático do estado atual antes de importar + possibilidade de desfazer restaurando backup anterior. Undo temporário é muito mais seguro.

**R38.** Sem sinalização nas abas, usuário caça problemas manualmente. **Badge numérico** é o mais útil — transforma atenção difusa em prioridade concreta. Alternativas: ponto de alerta, cor de status, ícone com severidade.

**R39.** Ponto como separador confunde no Brasil. **Solução:** representação interna com ponto, exibição com `Intl.NumberFormat('pt-BR')`, aceitar vírgula na digitação e normalizar internamente, formatar visualmente em pt-BR ao sair do campo. Melhora confiança porque a interface fala a linguagem numérica do usuário.

**R40.** Sistema codificado para uma família específica. **Para configurabilidade sem perder simplicidade:** tela de perfil doméstico, moradores editável, restrições selecionáveis, categorias ativáveis/desativáveis, metas ajustáveis, presets ("família de 2", "família de 6"). Primeiro uso simples, configurações avançadas opcionais.

---

## Conclusão

O projeto está bem estruturado para seu escopo: separação clara de responsabilidades, testes passando, PWA funcional e dados de domínio ricos. Os problemas mais relevantes são o rendering desnecessário no checklist, a falta de escape HTML nos templates e o debounce ausente no input de estoque. São correções pontuais que não exigem reestruturação.

Do ponto de vista de **Frontend**, a principal dívida técnica é o re-render completo via `innerHTML` — funcional no porte atual, mas limitante para crescimento. Do ponto de vista de **UI**, as prioridades são verificação de contraste WCAG, fallback para `backdrop-filter` e otimização de fontes para rede lenta. Do ponto de vista de **UX**, os ganhos mais impactantes seriam: onboarding para primeiro uso, badges de status nas abas, backup automático pré-reset, e separador decimal brasileiro.
