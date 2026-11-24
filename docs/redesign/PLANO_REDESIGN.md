# Plano de redesign — Bank of Ideas (frontend)

> Status: **Etapa 1 em andamento** — volta ao design antigo (branch `design/v2`, a partir de `origin/main`),
> extração de componentes base (`frontend/src/components/ui/`) e acessibilidade, **sem mudar o estilo**.
> A nova direção visual (Fases 1–3 e 5) só começa depois, com decisão explícita. Sem commits até pedido.
> Base: design antigo = commit `2aba517` (árvore idêntica a `origin/main`).
> Descartado como base: `0472f78` "UX01" (branch local `design/ux-refresh`, nunca publicado).

---

## Etapa 1 — o que já foi feito (não commitado)

**Componentes base** em `frontend/src/components/ui/`: `Button` (variantes primary, secondary, soft, ghost, danger, text, muted, muted-danger, muted-accent, danger-text, accent-text; tamanhos xs/sm/md/lg/inline), `ButtonLink`, `IconButton` (exige `label`), `Input`/`Select`/`Textarea`/`Label`, `Badge`, `Card`. Usos: 57 Button, 27 Label, 25 Input, 16 Card, 14 Badge, 9 Select, 7 Textarea, 6 IconButton, 2 ButtonLink. `bg-accent-600` caiu de 30 para 12 ocorrências (as restantes são preenchimentos/indicadores).

**Acessibilidade:** foco visível por teclado (`:focus-visible`), `prefers-reduced-motion`, link "Skip to content", tamanho de texto (Settings > Theme), `localStorage` à prova de falha, tokens de contraste `ui-accent*` (modo claro idêntico; escuro legível), `lang="en"`, `type` em todos os botões, `role="tab"`/`aria-selected` nas abas, `aria-label` em botões de ícone e células de calendário, Esc fecha o menu mobile, anel branco da timeline de Cycles corrigido no escuro, `Sidebar.jsx` (sem uso) removido, typo `mr-2text-lg` corrigido.

**Normalizações visuais (diferenças pequenas e intencionais):**
- Botões primários de Settings: `accent-500` → `accent-600` (igual ao resto do app); "+ New Idea/Planning/Cycle" perderam `shadow-sm` e hover `800` → `700`.
- Formulários de ideia e Dashboard: campos/botão `py-2.5` → `py-2` (4px mais baixos), anel de foco `ring-1` → `ring-2`, selects do formulário de ideia usam o fundo padrão de campo.
- Botões pequenos inline (Save/Cancel de edição, Add, Bind): padding unificado nos tamanhos xs/md.
- "Confirm & Apply Date" (Cycles) era azul fixo → cor de destaque do tema.
- Botões de texto ganharam `font-medium`; ações destrutivas de texto sublinham no hover.
- Setas ‹ › do calendário 8px mais largas; badges do detalhe da ideia 4px mais estreitos.

**Ainda não feito (decidir antes):** alvos de toque de 44px e animação `fade-in` (classe usada nas páginas mas sem keyframe) — ambos mudam o visual.

---

## 0. Regras de git (diretriz primária — vale para todas as fases)

1. **Nunca** commitar/publicar com e-mail `@biosys.com.br`. Usar só a identidade do `~/.gitconfig` global.
2. **Nenhuma** menção ao Claude como contribuidor (sem `Co-Authored-By`, sem "Generated with Claude Code" em PR).
3. Antes de todo commit: `git config --show-origin user.email` → precisa vir de `C:/Users/jlabre/.gitconfig` e não ser `@biosys.com.br`.

**Situação encontrada (22/11/2026):**

| Item | Estado |
|---|---|
| `~/.gitconfig` global | só tem `user.useConfigOnly = true` — **sem `user.name`/`user.email`**. Qualquer commit hoje falha até a identidade global ser definida. |
| Config local do repo | vazia (bom — nada forçando o e-mail corporativo) |
| UX01 (`0472f78`) | autor `@biosys.com.br` + trailer `Co-Authored-By: Claude`. **Só local** — não publicar como está. |
| `origin/main` no GitHub | **36 commits** já publicados com autor `@biosys.com.br`, a maioria com trailer do Claude (A02 → E03). Corrigir exige reescrever histórico + force push — decisão do dono do repo, fora deste plano. |

Proteções sugeridas (a configurar só com aprovação):
- Desligar a atribuição automática do Claude Code nas settings (`attribution` vazio para commit e PR).
- Hook `PreToolUse` que bloqueia `git commit` se `user.email` terminar em `@biosys.com.br` ou se a mensagem contiver `Co-Authored-By`.

---

## 1. Diagnóstico: o que o UX01 mudou

O UX01 misturou **duas coisas diferentes** num commit só: correções de acessibilidade (boas, neutras em estética) e uma camada de estética forte (o que provavelmente desagradou). A estratégia é separar.

### 1.1 Estética do UX01 — candidatas a descarte

| Mudança | Onde | Efeito visual |
|---|---|---|
| Fraunces (serifada) em títulos + Plus Jakarta Sans no corpo, via Google Fonts | `index.html`, `tailwind.config.js` | Tom "editorial", título até `text-6xl`; dependência externa num app self-hosted |
| Texto em gradiente (`.text-gradient-accent`) | `DashboardHeader` | "Real momentum." colorido em degradê |
| Fundo "aurora" (halos radiais na cor do tema) | `index.css`, `MainLayout` | Brilho de fundo constante, muda com cada um dos 10 temas |
| Botões pílula (`rounded-full`) com `shadow-glow` e `hover:-translate-y-0.5` | `PageHeader`, `DashboardHeader`, filtros | Visual "landing page", chamativo |
| Cards `rounded-2xl` com sombra, elevação no hover e faixa colorida da categoria no topo | `.card-interactive`, `IdeaCard`, `PlanningCard` | Mais ruído por card |
| Saudação por horário + bolinha pulsando (`animate-ping`) | `DashboardHeader` | Movimento contínuo na tela inicial |
| `PageHeader` grande (eyebrow mono + título display 5xl + subtítulo) em todas as listas | `Ideas`, `Planning`, `Cycles`, `Settings` | Muito espaço vertical antes do conteúdo |

### 1.2 Acessibilidade/robustez do UX01 — candidatas a reaproveitar (independente do visual)

- Foco visível global (`:focus-visible`) e `prefers-reduced-motion`.
- Link "Skip to content" + `<main id="main">`.
- `localStorage` em `try/catch` e validação de tema salvo (`ThemeContext`).
- Tamanho de texto ajustável (Default / Large / Extra large) — escala via `rem`.
- Alvos de toque de 44px; correções de contraste (`text-accent-700` no escuro, `bg-accent-50` no escuro).
- `lang="en"` (a interface é em inglês).
- Keyframe `fade-in` (já era usada no código e não existia no config).
- Remoção de `Sidebar.jsx` (sem uso) e typo `mr-2text-lg`.
- Funcionalidades a decidir conforme a nova direção: paleta de comandos (Ctrl/Cmd+K), barra inferior no celular, componente `Icon`.

Reaproveitamento sempre por **cópia de arquivo/trecho** (`git checkout 0472f78 -- <arquivo>` ou `git cherry-pick -n`), gerando commits novos com a identidade correta — nunca reaproveitando o commit UX01 em si.

### 1.3 Pontos fortes do design antigo (manter)

- **Arquitetura de tema por variáveis CSS** (`theme-variables.css` + `tailwind.config.js`): tokens `ui-*`, `status-*` e escala `accent-50…900` trocados em runtime por `data-theme`/`data-mode`. É a melhor base para um redesign — trocar a estética é, em boa parte, trocar valores de token.
- Visual sóbrio: topbar simples, cards `rounded-lg` com borda, pouca sombra.

### 1.4 Problema estrutural (vale para qualquer direção)

O estilo está **repetido inline** em vez de concentrado em componentes: `bg-accent-600` aparece **30 vezes em 23 arquivos**; o mesmo botão primário foi escrito à mão em `PageHeader` e `DashboardHeader`. Por isso o UX01 precisou tocar 35 arquivos — e qualquer redesign futuro também precisará.

➡ **Estratégia: "refatorar e depois re-estilizar".** Primeiro extrair primitivos (`Button`, `Card`, `Badge`, `Input/Select`, `PageHeader`, `Modal`) **mantendo o visual antigo pixel a pixel**; depois o redesign passa a ser mexer em tokens + ~6 componentes.

---

## 2. Estratégia em fases

### Fase 0 — Preparação segura (sem commits)
- [ ] Definir identidade global: `git config --global user.name "…"` / `user.email "…"` (pessoal).
- [ ] Desligar atribuição do Claude Code + hook de proteção (seção 0).
- [ ] Voltar ao design antigo **sem perder o UX01**: `git switch -c design/v2 origin/main` (cria branch, não cria commit). `design/ux-refresh` fica intacto como "caixa de peças".

### Fase 1 — Linha de base visual
- [ ] Subir o app (`docker compose up`) com dados de exemplo (`database/seeds.sql`).
- [ ] Capturar telas do design antigo **e** do UX01: Dashboard, Ideas, Idea detail, Planning, Cycles, Settings — modo claro e escuro, desktop e celular (~375px).
- [ ] Anotar sobre cada tela: o que funciona, o que incomoda (usuário).

### Fase 2 — Referências e direções
- [ ] Moodboard de 8–12 produtos de referência, com o *porquê* de cada um (densidade, tipografia, navegação, cards, calendário).
- [ ] Destilar em **3 direções** distintas (ver seção 3), cada uma com: princípios, paleta, tipografia, raio/sombra, densidade, exemplo de card e de botão.
- [ ] Protótipo estático (HTML ou Figma) de **Dashboard + lista de Ideas** em cada direção, nos dois modos.
- [ ] Usuário escolhe uma direção (ou mistura explícita).

### Fase 3 — Design system (tokens)
- [ ] Manter a arquitetura de variáveis; redefinir valores: superfícies, bordas, texto, status.
- [ ] Escala tipográfica fixa (ex.: 12/14/16/20/24/32) e **fontes self-hosted** (sem Google Fonts em runtime).
- [ ] Tokens de raio, sombra/elevação, espaçamento e movimento.
- [ ] Revisar os **10 temas de destaque × 2 modos = 20 combinações**: toda decisão precisa funcionar em todas, ou reduzir/curar a lista de temas (ex.: amarelo e stone são os mais frágeis em contraste).

### Fase 4 — Primitivos (refatoração sem mudança visual)
- [ ] Extrair `Button` (primary/secondary/ghost/danger), `Card`, `Badge` (status), `Field` (input/select/textarea), `PageHeader`, `Modal`.
- [ ] Substituir os usos inline. Critério de aceite: screenshots idênticos à Fase 1.
- [ ] Aqui entram as correções de acessibilidade do UX01 (seção 1.2), também sem mudar a estética.

### Fase 5 — Aplicar a nova direção, incremental
Ordem sugerida, um commit pequeno por passo (identidade verificada a cada um):
1. Tokens + fontes → 2. Layout/Topbar/navegação → 3. Primitivos → 4. Dashboard → 5. Ideas (lista + detalhe) → 6. Planning → 7. Cycles → 8. Calendário → 9. Settings/Appearance.

Cada passo: screenshot antes/depois nos dois modos + celular.

### Fase 6 — Revisão
- [ ] Contraste WCAG AA nas 20 combinações tema×modo.
- [ ] Teclado (foco, Esc em modais, ordem de tab), leitor de tela básico.
- [ ] Responsivo (375 / 768 / 1280 / 1700).
- [ ] Consistência: nenhuma cor/raio/sombra fora dos tokens (grep por hex e por `rounded-` soltos).

---

## 3. Direções candidatas (ponto de partida para a Fase 2)

| | A. Workspace calmo | B. Caderno de ideias | C. Painel vivo |
|---|---|---|---|
| Inspiração | Linear, Notion, Height, Things 3 | Bear, iA Writer, Notion Calendar, Readwise | Raycast, Arc, Vercel dashboard |
| Sensação | Ferramenta de trabalho, foco, densa | Papel, tinta, pessoal — combina com "banco de ideias" | Tecnológico, contrastado, energia |
| Superfícies | Cinzas neutros, bordas finas, quase sem sombra | Off-white quente / grafite, textura sutil | Escuro profundo, bordas luminosas finas |
| Tipografia | Sans geométrica (Inter/Geist), títulos pequenos | Serifa de leitura nos títulos, sans no corpo | Sans + mono para números/datas |
| Cor de destaque | Usada só em ação primária e seleção | Tons de tinta (azul, vermelho, verde) | Destaque forte, gradientes discretos em gráficos |
| Navegação | Sidebar recolhível | Topbar simples | Sidebar compacta com ícones |
| Risco | Ficar genérico | Parecer "blog", menos denso | Repetir os excessos do UX01 |

Não precisa ser uma dessas — servem para provocar a escolha.

---

## 4. Agentes propostos (`.claude/agents/`, a criar após aprovação)

| Agente | Papel | Ferramentas | Entregável |
|---|---|---|---|
| `design-researcher` | Pesquisa referências, monta moodboard e as 3 direções | WebSearch, WebFetch, Read | `docs/redesign/referencias.md` |
| `design-system-architect` | Traduz a direção escolhida em tokens (`theme-variables.css`, `tailwind.config.js`) e escala tipográfica | Read, Edit, Write | Tokens + doc do design system |
| `ui-implementer` | Extrai primitivos (Fase 4) e aplica a direção página a página (Fase 5) | Read, Edit, Write, Bash | Mudanças por página, sem commitar |
| `ui-reviewer` | Revisão independente: contraste, foco, responsivo, aderência aos tokens; não opina sobre gosto | Read, Grep, Glob, Bash | Lista de achados por arquivo/linha |

Todos com as regras da seção 0 no prompt; nenhum deles commita — commits só pela sessão principal, a pedido.

---

## 5. Decisões pendentes (usuário)

1. O que mais incomodou no UX01? (tipografia serifada, brilhos/gradientes, botões pílula, tamanho dos títulos, cards, navegação inferior/paleta…)
2. Há sites/apps que você já gosta como referência?
3. Manter os 10 temas de destaque ou curar para poucos?
4. Quais funcionalidades do UX01 ficam: paleta Ctrl+K, barra inferior no celular, tamanho de texto?
5. Identidade global de git a configurar (nome/e-mail pessoal).
