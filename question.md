# Questões de Revisão — Codex de Resiliência Doméstica

## Arquitetura e Estrutura

**Q1.** O projeto utiliza o padrão IIFE com export via `window.*` (UMD-like) sem bundler nem framework. Quais são as vantagens e desvantagens dessa abordagem para uma PWA offline-first deste porte?

**Q2.** A separação em três camadas — `domain.js` (lógica pura), `state.js` (persistência) e `app.js` (UI/rendering) — é adequada? Que benefícios essa separação traz para testabilidade e manutenção?

**Q3.** Todo o CSS (~600 linhas) está inline no `index.html`. Considerando que o service worker já cacheia assets locais, quais seriam os trade-offs de extrair o CSS para um arquivo separado (`styles.css`)?

---

## Segurança

**Q4.** A renderização via `innerHTML` com template literals é usada em toda a camada de UI (`app.js`). Embora os dados hoje sejam estáticos (vindos de `domain.js`), a função `importAppState` aceita JSON arbitrário. Qual o risco de XSS e como mitigá-lo?

**Q5.** Que impacto teria a criação de uma função `escapeHtml()` aplicada nos templates? Há cenários onde o escape poderia quebrar funcionalidade existente?

---

## Performance

**Q6.** O evento `input` dispara `persistState()` (JSON.stringify + localStorage.setItem) a cada keystroke. Digitar "150" gera 3 escritas. Qual a técnica recomendada para resolver isso e por que ela é importante em dispositivos lentos?

**Q7.** A função `toggleChecklist()` chama `renderMain()`, reconstruindo todo o DOM via innerHTML. Compare isso com `syncInventoryRow()` que faz update cirúrgico. Por que o re-render completo é problemático especificamente para checklists?

**Q8.** A troca de abas (`showTab`) reconstrói toda a navegação e conteúdo via `renderNavigation()` + `renderMain()`. Qual seria uma abordagem mais eficiente para alternar entre abas já renderizadas?

---

## Dados e Domínio

**Q9.** Em `computeStockSnapshot`, o uso de `{ ...item, current, days, coverage, ... }` mistura dados de domínio com dados computados via spread. Qual o risco de colisão silenciosa e como o retorno poderia ser reestruturado?

**Q10.** A função `groupBy` em `app.js` assume que a propriedade-chave sempre existe no item. O que acontece quando um item não possui a propriedade e como isso deveria ser tratado?

---

## PWA e Cache

**Q11.** O `CACHE_NAME` em `pwa-config.js` é fixo (`'codex-shell-v1'`). Quando o JavaScript é atualizado, o que acontece com usuários que já têm a versão antiga cacheada? Qual mecanismo deveria ser implementado?

**Q12.** O service worker usa cache-first para assets e network-first para navegação. Explique por que cada estratégia foi escolhida para seu respectivo tipo de recurso.

---

## Acessibilidade

**Q13.** O modal implementa `aria-modal="true"` mas não possui focus trap. Qual o problema prático de acessibilidade para usuários de teclado e leitores de tela? Que elemento HTML nativo resolveria isso automaticamente?

**Q14.** Os botões de checkbox (`.check-box`) não possuem `aria-label` nem `aria-labelledby`. O texto descritivo está em um sibling `.check-text` sem associação programática. Como isso afeta a experiência com leitores de tela e qual a correção recomendada?

---

## Testes

**Q15.** O módulo `app.js` (~800 linhas) possui zero testes, enquanto `domain.js` e `state.js` têm boa cobertura. Quais funções de `app.js` são candidatas a extração e teste unitário sem dependência de DOM?

**Q16.** Os testes utilizam o test runner nativo do Node.js (`node --test`). Quais são as vantagens dessa escolha em relação a frameworks como Jest ou Vitest para um projeto sem dependências?

---

## Estado e Persistência

**Q17.** O `hydrateAppState` detecta chaves legadas v2, migra para v3 e limpa as chaves antigas automaticamente. Por que essa migração transparente é importante para uma PWA que persiste dados no localStorage do usuário?

**Q18.** As funções `sanitizeStock`, `sanitizeChecklist` e `normalizeMeta` protegem contra dados corrompidos. Em que cenários dados corrompidos podem aparecer no localStorage e por que a sanitização defensiva é necessária?

---

## Deploy e Configuração

**Q19.** O `vercel.json` configura `Cache-Control: must-revalidate` para arquivos mutáveis e `immutable` para ícones. Explique a lógica por trás dessa diferenciação de headers.

**Q20.** O `manifest.webmanifest` configura a PWA como `"display": "standalone"`. Qual o efeito prático dessa configuração na experiência do usuário e quais são as alternativas disponíveis?

---

## Frontend — Renderização e DOM

**Q21.** Toda a UI é construída via template literals concatenados e atribuídos a `innerHTML`. Quais são os riscos dessa abordagem em termos de performance (reflow/repaint), segurança (injeção de HTML) e manutenibilidade? Compare com alternativas como `document.createElement`, `<template>` elements ou lit-html.

**Q22.** A função `renderMain()` reconstrói todo o conteúdo da seção ativa a cada interação. Por que isso pode causar perda de estado de inputs (ex.: posição do cursor, seleção de texto) e como o padrão de "reconciliação" (diffing) resolveria esse problema sem adotar um framework?

**Q23.** O `app.js` usa event delegation via `document.addEventListener('click', ...)` com `data-action` attributes. Quais são as vantagens desse padrão em relação a `onclick` inline ou listeners por elemento? Há algum risco de memory leaks ou conflito de eventos nessa implementação?

**Q24.** As funções `renderInventoryRow()` e `renderCategorySummaryCards()` geram HTML como strings. Se o número de itens crescesse significativamente (ex.: 200+ itens), qual seria o impacto na performance de renderização e que técnica (virtualização, lazy rendering) poderia ser aplicada?

---

## UI — Design Visual e Componentes

**Q25.** O projeto utiliza duas famílias tipográficas serif (`Cormorant Garamond`) e sans-serif (`IBM Plex Sans`) com uma monospace (`IBM Plex Mono`). Qual o impacto de carregar 3 famílias de fontes externas na performance de First Contentful Paint (FCP) em conexões rurais lentas? Como `font-display: swap` e fontes de fallback do sistema poderiam mitigar isso?

**Q26.** Os badges de status usam cores semânticas (verde/amarelo/vermelho) para indicar níveis de estoque. Para usuários daltônicos (~8% da população masculina), essa comunicação exclusivamente cromática é problemática. Além do texto já presente nos badges, que outros indicadores visuais (ícones, padrões, formas) poderiam reforçar a distinção?

**Q27.** O modal de lista de compras (`#shopping-modal`) usa `position: fixed` com `backdrop-filter: blur(16px)`. Em dispositivos Android mais antigos, `backdrop-filter` pode ter suporte parcial ou causar jank de renderização. Qual seria uma estratégia de fallback gracioso (graceful degradation)?

**Q28.** As tabelas de inventário transformam-se em layout de blocos no mobile (`display: block` em `<td>`) usando `data-label` + `::before`. Essa técnica é eficaz para tabelas simples, mas quais problemas de alinhamento e legibilidade surgem quando há muitas colunas? Existe uma alternativa UX melhor que tabelas para inventário em telas pequenas?

**Q29.** O sticky nav (`position: sticky; top: 0`) com 6 abas e ícones Unicode pode ocupar espaço vertical significativo em telas mobile de 5". Que padrões de navegação alternativos (bottom navigation, hamburger menu, swipe entre seções) seriam mais adequados para o contexto de uso rural em smartphones?

**Q30.** O sistema de cores usa uma paleta terrosa (`#1b1916`, `#f2eadf`, `#3a6643`) que remete ao contexto rural. O contraste entre o texto e o fundo atende ao nível AA da WCAG (4.5:1 para texto normal)? Como verificar e corrigir possíveis falhas de contraste, especialmente nos elementos `.pill` e `.badge`?

---

## UX — Experiência do Usuário

**Q31.** O fluxo de backup/restore exige que o usuário clique em "Exportar backup" (download de JSON) e "Importar backup" (upload de arquivo). Para um público não-técnico em contexto rural, esse processo é intuitivo? Que melhorias de UX (ex.: backup automático periódico, sincronização entre dispositivos via QR code, nomes de arquivo legíveis com data) poderiam reduzir o risco de perda de dados?

**Q32.** A edição de estoque é feita por inputs numéricos individuais em cada linha da tabela. Para o reabastecimento mensal (onde ~30 itens precisam ser atualizados), essa interação item-a-item pode ser tediosa. Que padrões de UX (ex.: modo de edição em lote, presets de compra, scanner de nota fiscal) poderiam acelerar esse fluxo?

**Q33.** Os protocolos (checklists) não possuem persistência temporal — uma vez marcados como "feitos", permanecem marcados até reset manual. Para rotinas semanais/mensais, qual seria o comportamento ideal? Deveria haver reset automático baseado em data, histórico de conclusões, ou lembretes periódicos?

**Q34.** A lista de compras gerada (`buildShoppingList`) calcula automaticamente "quanto comprar" com base no estoque ideal menos o atual. Porém, não há feedback visual durante a edição de estoque mostrando como as alterações afetam a lista de compras em tempo real. Que padrão de UI (ex.: preview lateral, indicador de "necessidade de compra" inline) melhoraria a percepção do usuário sobre o impacto de suas edições?

**Q35.** O botão "Resetar estado" (`data-action="reset"`) apaga todos os dados sem possibilidade de desfazer (undo). Apesar do `confirm()` nativo do browser, qual o risco de perda acidental de dados? Que padrões de UX (ex.: soft delete com período de recuperação, backup automático pré-reset, undo toast com timer) seriam mais seguros?

**Q36.** A aplicação não possui nenhum onboarding ou tutorial para primeiro uso. Um novo usuário vê a tela de Overview com métricas zeradas e pode não entender por onde começar. Que elementos de UX (ex.: empty states informativos, tour guiado, checklist de primeiro uso, tooltips contextuais) ajudariam na adoção?

**Q37.** Os toast notifications (`showToast`) aparecem por 2.5 segundos e desaparecem. Para ações destrutivas como "Importar backup" (que sobrescreve todos os dados), um toast de confirmação pós-ação é suficiente? Ou deveria haver um mecanismo de undo (desfazer) com janela de tempo antes de efetivar a ação?

**Q38.** A navegação entre seções (Despensa, Freezer, Feira, Casa) é feita por abas, mas não há indicação visual de quais seções precisam de atenção (ex.: itens em alerta). Que padrão de UX (ex.: badges numéricos nas abas, dot indicators, cor da aba refletindo status) ajudaria o usuário a priorizar sua atenção sem precisar visitar cada seção?

**Q39.** O campo de estoque aceita `inputmode="decimal"` para teclado numérico mobile, mas usa ponto como separador decimal (padrão JavaScript). No Brasil, o separador padrão é vírgula. A função `normalizeNumericInput` em `app.js` trata essa conversão, mas o feedback visual no campo mostra o valor com ponto. Isso pode causar confusão — como alinhar a exibição ao padrão brasileiro (pt-BR) sem quebrar os cálculos internos?

**Q40.** A aplicação foi projetada para uma família específica de 6 pessoas em Gurinhém/PB, com restrições alimentares fixas no código (`domain.js`). Se outro usuário quisesse adaptar o sistema, precisaria editar o código-fonte. Que decisões de UX permitiriam configurabilidade (ex.: tela de configuração de perfil, número de moradores editável, restrições alimentares selecionáveis) sem comprometer a simplicidade do sistema atual?
