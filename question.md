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
