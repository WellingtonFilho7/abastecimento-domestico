# Premium Soft Mobile-First UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reposicionar o `abastecimento-domestico` como um app mobile-first premium, suave e adulto, priorizando ação imediata na home sem perder a operação de inventário no desktop.

**Architecture:** Manter a stack atual em JavaScript vanilla e o contrato entre `domain.js`, `state.js` e `app.js`. O redesign acontece primeiro na casca visual e na estrutura de renderização de `app.js`, sem replatforming para React nesta fase. A home passa a ser orientada a ação, o inventário vira `cards no mobile + tabela no desktop`, e a navegação vira `bottom nav no mobile + topo no desktop`.

**Tech Stack:** HTML semântico, CSS inline em `index.html`, JavaScript vanilla em `app.js`, domínio em `domain.js`, persistência local em `state.js`, PWA estático.

## Visual Brief

### Product Feel

- `Premium suave`, não corporativo, não infantil
- sensação de app iOS polido, sem copiar iOS literalmente
- interface calma, clara, tátil e muito legível no celular
- uso de forma, cor, sombra e tipografia; sem imagens

### Visual Direction

- fundo claro, limpo e luminoso
- cards brancos e frios, com profundidade discreta
- acentos em azul acinzentado, slate claro e cinzas frios
- estados de alerta evidentes, mas equilibrados
- arredondamento generoso, porém adulto

### Experience Priorities

1. Mostrar o que exige ação agora
2. Tornar compras e revisão semanal visíveis em 1 toque
3. Manter a leitura do estoque confortável no mobile
4. Preservar densidade operacional no desktop

## Information Architecture

### Home / Hoje

Esta é a tela principal e deve abrir por padrão.

Ordem dos blocos:

1. `Busca global` fixa/visível no topo
2. `Hero de ação` com resumo curto do dia e CTA primário
3. `Itens críticos agora`
4. `Lista de compras da semana`
5. `Resumo do estoque da casa`
6. `Atalhos rápidos`
7. `Estado do sistema` em nível secundário

### Navegação

- mobile:
  - bottom nav fixa
  - 4 ou 5 destinos máximos
  - labels curtas
- desktop:
  - navegação no topo
  - mesma taxonomia do mobile

Taxonomia sugerida:

- `Hoje`
- `Estoque`
- `Compras`
- `Protocolos`
- `Sistema`

### Inventário

- mobile:
  - cards empilhados por item
  - cada card mostra nome, tags, estoque atual, cobertura, status, quantidade a comprar
  - input grande e tátil
- desktop:
  - tabela como vista primária
  - cabeçalho sticky apenas se não piorar a legibilidade

## UI System

### Color Tokens

Use tokens CSS, sem cores hardcoded espalhadas.

```css
:root {
  --bg: #f5f7fa;
  --bg-soft: #eef3f7;
  --surface: #ffffff;
  --surface-soft: #f8fbfd;
  --surface-elevated: rgba(255, 255, 255, 0.82);
  --text: #16202a;
  --text-soft: #5f6d7a;
  --text-faint: #8a97a3;
  --line: rgba(94, 112, 128, 0.14);
  --line-strong: rgba(94, 112, 128, 0.24);
  --accent: #6f8fa8;
  --accent-soft: #dfe8ef;
  --accent-strong: #43657f;
  --ok: #3f8c77;
  --ok-soft: #dff1eb;
  --warn: #d59a3a;
  --warn-soft: #fff1d9;
  --alert: #d86262;
  --alert-soft: #ffe3e3;
  --shadow-sm: 0 10px 24px rgba(86, 107, 128, 0.08);
  --shadow-md: 0 18px 40px rgba(86, 107, 128, 0.12);
}
```

### Typography

Evitar serif e evitar cara genérica de dashboard.

Escolha recomendada:

- UI/body: `Manrope`
- mono/dados: `IBM Plex Mono`

Escala sugerida:

- hero title: `40/44`
- section title: `28/32`
- card title: `20/24`
- body: `15/22`
- meta: `12/16`
- micro label: `11/14`

### Shape & Spacing

- radius principal: `24px`
- radius secundário: `18px`
- radius de pills/badges: `999px`
- spacing base: múltiplos de `4px`
- cards com respiro generoso no mobile
- sombras limpas, sem peso marrom/escuro excessivo

### Motion

- transições curtas e suaves
- foco em:
  - troca de aba
  - abertura do modal/lista
  - hover/focus de cards e botões
- sem microanimação em excesso

## Component Rules

### Search Bar

- deve ser a primeira coisa visível na home
- aparência de campo premium, sem borda dura
- placeholder curto
- ícone à esquerda
- CTA ou atalho opcional à direita

### Action Hero

- não usar banner escuro dramático
- usar card claro com acento frio
- título curto e operacional
- texto com no máximo 2 linhas
- CTA principal: abrir compras ou revisar críticos

### Critical Items

- cards horizontais no mobile
- status visível com combinação de:
  - badge
  - acento de cor
  - número principal
- sem vermelho agressivo como fundo integral

### Shopping Module

- visual de checklist premium
- cada item precisa mostrar:
  - nome
  - quantidade a comprar
  - estoque atual
  - ciclo de compra
- modal deve parecer sheet nativo no mobile

### Inventory Cards

Cada card mobile deve conter:

- nome do item
- tags pequenas
- input de estoque
- unidade
- cobertura/diagnóstico
- badge de status
- recomendação de compra

### Summary Cards

- 3 cards na home:
  - críticos
  - compras da semana
  - cobertura geral
- linguagem curta, numérica e orientada a decisão

### System Block

- backup, import, reset e última atualização ficam fora da zona principal da home
- manter em `Sistema`, com tratamento mais utilitário e menos visual

## Responsive Rules

### Mobile

- bottom nav fixa
- home com blocos em coluna única
- inventário em cards
- modal em bottom sheet
- busca e hero sempre acima da dobra quando possível

### Desktop

- nav superior
- grid com 2 colunas nas áreas de overview
- inventário em tabela
- modal central pode continuar aceitável

## Accessibility Rules

- contraste mínimo real em status e texto secundário
- foco visível e consistente
- alvos de toque de pelo menos `44px`
- não depender só da cor para status

## Files and Responsibilities

### `index.html`

Responsável por:

- novos tokens visuais
- tipografia
- layout base
- top nav desktop
- bottom nav mobile
- modal/bottom sheet
- estilos de cards e tabelas

### `app.js`

Responsável por:

- mudar a aba padrão para `Hoje`
- reorganizar a navegação conforme a nova taxonomia
- renderizar a home orientada a ação
- suportar a versão mobile por cards do inventário
- manter desktop com tabela
- manter busca global visível e funcional

### `domain.js`

Responsável por:

- permanecer estável
- só tocar se a busca exigir metadata nova ou agrupamento novo

### `state.js`

Responsável por:

- permanecer estável
- nenhuma mudança visual deve acoplar UI à lógica de storage

## Implementation Tasks

### Task 1: Travar a direção visual no shell da aplicação

**Files:**
- Modify: `index.html`
- Reference: `docs/reviews/2026-03-20-current-state/QUESTIONS.md`

**Steps:**
1. Substituir a paleta atual terrosa por tokens frios e claros.
2. Trocar a tipografia do shell para a dupla definida no brief.
3. Remover o hero escuro atual e refazer o cabeçalho com linguagem premium suave.
4. Criar classes base para:
   - cards
   - summary cards
   - search bar
   - bottom nav
   - inventory card mobile
   - sheet modal

**Acceptance:**
- o app não parece mais editorial terroso
- o visual transmite leveza, clareza e polimento mobile

### Task 2: Reorganizar a informação para “Hoje”

**Files:**
- Modify: `app.js`

**Steps:**
1. Ajustar a taxonomia das seções para `Hoje`, `Estoque`, `Compras`, `Protocolos`, `Sistema`.
2. Definir `Hoje` como aba inicial.
3. Reescrever `renderOverview()` para virar uma tela de ação imediata.
4. Ordenar os blocos da home nesta sequência:
   - busca
   - hero
   - críticos
   - compras da semana
   - resumo do estoque
   - atalhos

**Acceptance:**
- a primeira tela responde “o que eu faço agora?”

### Task 3: Criar navegação híbrida

**Files:**
- Modify: `index.html`
- Modify: `app.js`

**Steps:**
1. Manter navegação no topo para desktop.
2. Adicionar bottom nav exclusiva para mobile.
3. Sincronizar estado ativo entre as duas.
4. Garantir labels curtas e ícones discretos.

**Acceptance:**
- navegação mobile fica acessível com o polegar
- desktop mantém leitura limpa

### Task 4: Separar inventário por contexto de tela

**Files:**
- Modify: `app.js`
- Modify: `index.html`

**Steps:**
1. Preservar tabela para desktop.
2. Criar renderização em cards para mobile.
3. Garantir que as duas vistas consumam os mesmos snapshots de domínio.
4. Não duplicar lógica de cálculo em UI.

**Acceptance:**
- mobile não exige tabela comprimida
- desktop não perde densidade

### Task 5: Melhorar o módulo de compras

**Files:**
- Modify: `app.js`
- Modify: `index.html`

**Steps:**
1. Transformar o modal atual em sheet premium no mobile.
2. Melhorar a hierarquia visual da lista:
   - ciclo
   - item
   - comprar
   - atual
3. Preservar copiar/exportar como ações secundárias claras.

**Acceptance:**
- compras parecem parte central do app, não utilitário auxiliar

### Task 6: Ajustar estados e feedback

**Files:**
- Modify: `index.html`
- Modify: `app.js`

**Steps:**
1. Recalibrar badges para `ok`, `atenção`, `crítico` com visual equilibrado.
2. Suavizar toasts e feedbacks.
3. Garantir foco e acessibilidade.

**Acceptance:**
- status são claros sem poluição visual

### Task 7: Verificação visual e funcional

**Files:**
- Modify if needed: `README.md`

**Steps:**
1. Testar home, estoque, compras e protocolos em mobile.
2. Testar navegação desktop.
3. Verificar que busca e bottom nav não quebram PWA.
4. Rodar `npm test`.
5. Validar em navegador com viewport mobile.

**Acceptance:**
- navegação, leitura e ação imediata funcionam melhor do que na UI atual

## Non-Goals

- não migrar para React/Vite agora
- não redesenhar `domain.js` ou `state.js`
- não introduzir imagens ou ilustrações
- não ampliar escopo para multiusuário

## Implementation Notes

- O visual atual usa tons terrosos e serif forte; isso deve ser substituído, não apenas ajustado.
- A primeira entrega deve focar em `layout + informação + mobile behavior`.
- Se surgir conflito entre “beleza” e “agir rápido”, priorizar agir rápido.

## Verification Checklist

- `Hoje` abre como tela principal
- busca está visível no topo
- bottom nav aparece só no mobile
- cards de inventário existem no mobile
- tabela segue existindo no desktop
- status estão legíveis e equilibrados
- compras da semana ganham destaque real
- `npm test` continua passando
