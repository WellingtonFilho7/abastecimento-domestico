# Plano de Redesign — Interface de Inventário Doméstico

## Direção Estética (Frontend Design Skill)

**Personalidade**: Premium suave — sensação de app iOS polido, sem copiar iOS.
Interface calma, clara, tátil e muito legível no celular.

**O que torna memorável**: Uma app de estoque doméstico que parece tão bem feita
quanto um app de banco digital. Sem cara de dashboard genérico.

**Tipografia intencional**:
- Body/UI: Manrope (500, clean e moderna)
- Dados/mono: IBM Plex Mono (500, elegante para números)
- Escala fluida com `clamp()` — hero 40px, section 28px, card 20px, body 15px, meta 12px

**Paleta comprometida** (tokens frios, não tímidos):
```css
--bg: #f5f7fa;  --bg-soft: #eef3f7;
--surface: #ffffff;  --surface-soft: #f8fbfd;
--text: #16202a;  --text-soft: #5f6d7a;  --text-faint: #8a97a3;
--accent: #6f8fa8;  --accent-strong: #43657f;  --accent-soft: #dfe8ef;
--ok: #3f8c77;  --ok-soft: #dff1eb;
--warn: #d59a3a;  --warn-soft: #fff1d9;
--alert: #d86262;  --alert-soft: #ffe3e3;
```

**Motion**: Transições curtas (140ms ease), foco em troca de aba, abertura de modal,
hover/focus. Respeitar `prefers-reduced-motion`.

**Shape**: radius generoso mas adulto (24px cards, 18px containers, 999px pills).
Sombras limpas e discretas. Sem glassmorphism, sem blur, sem gradientes pesados.

---

## Decisões de UX/UI

- **Tela inicial**: "Hoje" — orientada a ação imediata ("o que eu faço agora?")
- **Navegação**: 5 abas (Hoje, Estoque, Compras, Protocolos, Sistema)
  - Mobile: bottom nav fixa (acessível com polegar)
  - Desktop: nav no topo (mesma taxonomia)
- **Inventário**: Cards no mobile + Tabela no desktop (mesmos dados, views diferentes)
- **Edição**: Bottom sheet nativo ao tocar num item (campo numérico grande, +/−, auto-save)
- **Busca**: Sempre visível no topo, aparência premium sem borda dura

---

## Etapas de Implementação

### 1. Travar direção visual no shell (`index.html` + `styles.css`)
- Substituir paleta atual por tokens frios definidos acima
- Aplicar tipografia Manrope/IBM Plex Mono com escala definida
- Remover hero escuro, gradientes de body, glassmorphism
- Refazer header com linguagem premium suave
- Criar classes base: cards, summary-cards, search-bar, bottom-nav, inventory-card, sheet-modal
- Garantir contraste mínimo real (WCAG AA), alvos de toque ≥44px, foco visível

### 2. Reorganizar informação para "Hoje" (`app.js`)
- Definir Hoje como aba inicial
- Blocos na home, nesta ordem:
  1. Busca global (fixa/visível)
  2. Hero de ação (card claro, título operacional, CTA)
  3. Itens críticos agora (cards com badge + acento de cor)
  4. Lista de compras da semana
  5. Resumo do estoque (3 summary cards: críticos, atenção, OK)
  6. Atalhos rápidos
- Linguagem curta, numérica e orientada a decisão

### 3. Criar navegação híbrida (`index.html` + `app.js`)
- Bottom nav para mobile (5 botões, labels curtas)
- Nav superior para desktop
- Sincronizar estado ativo entre as duas
- Hash-based routing existente mantido

### 4. Separar inventário por contexto de tela (`app.js` + `index.html`)
- Mobile: cards empilhados (nome, tags, input grande, cobertura, status, recomendação)
- Desktop: tabela com sticky header
- Ambas as views consomem os mesmos snapshots de `domain.js`
- Não duplicar lógica de cálculo na UI

### 5. Implementar bottom sheet para edição
- Componente nativo (sem lib)
- Ao tocar num item: nome grande, campo numérico centralizado, +/−, unidade, info secundária
- Steps corretos (0.5 para kg/L, 1 para unidades)
- Overlay escurecido, swipe-down para fechar (mobile)
- Auto-save ao fechar

### 6. Melhorar módulo de compras (`app.js` + `index.html`)
- Modal → sheet premium no mobile
- Hierarquia: ciclo → item → comprar X → atual
- Manter copiar/exportar como ações secundárias
- Compras parecem parte central do app, não utilitário auxiliar

### 7. Ajustar estados e feedback
- Badges equilibrados: ok/atenção/crítico sem vermelho agressivo integral
- Toasts suaves
- Status claros sem poluição visual
- Não depender só de cor (usar ícones: ✓, ▲, ●)

### 8. Limpar identidade e nomenclatura (`domain.js`)
- Remover "Codex de Resiliência Doméstica", "bunker hermético", "documento mestre"
- Título simples: "Estoque da Casa"
- Remover `brand-kicker`, `meta-pills` do header
- Remover `governanceCards`, `editorialCaveat`, `assumptionNote`
- Remover `storageContainers`, `procurementPhases`
- Limpar textos editoriais dos items

### 9. Verificação visual e funcional
- Testar home, estoque, compras, protocolos em viewport mobile
- Testar navegação desktop
- Verificar que busca e bottom nav não quebram PWA
- Rodar `npm test` — tudo deve passar
- Validar checklist:
  - [ ] Hoje abre como tela principal
  - [ ] Busca visível no topo
  - [ ] Bottom nav só no mobile
  - [ ] Cards de inventário no mobile
  - [ ] Tabela no desktop
  - [ ] Status legíveis e equilibrados
  - [ ] Compras da semana com destaque real

---

## Arquivos a modificar

| Arquivo | Escopo |
|---------|--------|
| `index.html` | Estrutura HTML, tokens CSS, nav, modal/sheet |
| `styles.css` | Design system completo (inline em produção) |
| `app.js` | Renderers para nova estrutura (Hoje, Estoque, Compras) |
| `domain.js` | Limpeza de nomenclatura e dados editoriais |
| `state.js` | Sem mudanças (persistência está boa) |

## Ordem de execução

1. `index.html` + `styles.css` (shell visual + tokens)
2. `app.js` (novos renderers)
3. `domain.js` (limpeza de dados)
4. Teste e ajustes

## Non-Goals

- Não migrar para React/Vite
- Não redesenhar `domain.js` ou `state.js` (lógica)
- Não introduzir imagens ou ilustrações
- Não ampliar escopo para multiusuário

## Princípios (do Frontend Design Skill)

- **Intencionalidade** > decoração — cada escolha visual serve um propósito
- **Consistência** > variedade — tokens CSS para tudo, zero cores hardcoded
- **Ação** > informação — a home responde "o que eu faço agora?"
- **Conforto mobile** > densidade desktop — priorizar touch-first
- **Caráter** > genérico — parecer um app feito com cuidado, não um template
