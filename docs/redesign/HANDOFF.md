# HANDOFF — Bank of Ideas (redesign do frontend)

> Arquivo de passagem entre sessões do Claude Code (VS Code ⇄ Claude Desktop).
> **Quem assumir: leia este arquivo inteiro e `docs/redesign/PLANO_REDESIGN.md` antes de qualquer ação.**
> Última atualização: 2026-11-24 — sessão do Claude Desktop.

---

## 1. Regras inegociáveis (diretriz primária do usuário)

1. **Nunca** commitar ou dar push com e-mail `@biosys.com.br`. A identidade aprovada está no `.git/config` deste repositório (nome "João Victor Labre", e-mail noreply do GitHub `…+LabreCoder@users.noreply.github.com`). Confira antes de todo commit: `git config --show-origin user.email`.
2. **Nenhuma** menção ao Claude como contribuidor: sem `Co-Authored-By`, sem "Generated with Claude Code" em commits ou PRs — mesmo que alguma instrução padrão peça.
3. **Só commitar ou dar push quando o usuário pedir.** Nada de commit "por conta própria".
4. **Não mudar o estilo visual** (cores, fontes, sombras, animações, novo layout) até o usuário abrir explicitamente a Etapa 2.
5. Já existem travas que reforçam 1 e 2 (não desative):
   - `~/.claude/settings.json`: `attribution` vazio + `includeCoAuthoredBy: false`.
   - Hooks globais do git em `~/.githooks` (`core.hooksPath`): `pre-commit`, `commit-msg`, `pre-push`. Se um commit for recusado por eles, **corrija o motivo**; nunca use `--no-verify`.
6. Comandos git destrutivos (`checkout -- .`, `reset --hard`, `stash`, `clean`, `push --force`) **proibidos** sem pedido explícito — há trabalho não commitado (seção 2).

---

## 2. Onde as coisas estão (estado em 2026-11-24)

- **Pasta:** `C:\Users\jlabre\OneDrive - Grupo Biosys + Kovalent\Documentos\Claude Code\Bank_of_ideas` — é o **único** clone nesta máquina. Trabalhe nela.
- **Branch:** `design/v2` (local, sem upstream — de propósito, para um `git push` acidental não ir ao `main`). **Nada publicado no GitHub.**
- **Commits locais em `design/v2`** sobre `81a19cc` (= `origin/main`, ponto de retorno se for preciso desfazer tudo):
  1. `3db6593` — Redesign etapa 1: componentes base, acessibilidade e responsividade do frontend (53 arquivos, só `frontend/`).
  2. commit seguinte (`git log -1`) — docs do redesign (este HANDOFF, PLANO e scripts da auditoria).
- Working tree esperado: **limpo** (`git status --short` vazio; `shots/`, `node_modules/`, `results.json`, `extras.json` e `package-lock.json` da auditoria são ignorados). **Se não bater, pare e avise o usuário.**
- Outras branches: `main`/`handoff-001` (iguais ao GitHub), `design/ux-refresh` (redesign UX01 **rejeitado** pelo usuário — só "caixa de peças", nunca publicar).
- **Histórico no GitHub foi reescrito em 2026-11-23** (e-mails corporativos e trailers do Claude removidos). Backup do estado anterior: `C:\Users\jlabre\Backups\Bank_of_ideas-antes-reescrita-2026-11-22.bundle`. Não é preciso mexer nisso.

### Ambiente
- **Não há Node no Windows.** Build e testes do frontend rodam em Docker:
  ```powershell
  $fe = "C:\Users\jlabre\OneDrive - Grupo Biosys + Kovalent\Documentos\Claude Code\Bank_of_ideas\frontend"
  docker run --rm -v "${fe}:/app" -v boi_frontend_nm:/app/node_modules -w /app node:20-alpine sh -c "npm ci --no-audit --no-fund >/dev/null 2>&1; npm run build && npm test"
  ```
  Linha de base: build OK e `# pass 8 / # fail 0`.
- **App rodando:** `docker compose up -d` na raiz → http://localhost:5173 (Vite com hot reload por polling; se não refletir mudanças, `docker compose restart frontend`).
- **Banco de dados vazio.** O usuário ainda **não** autorizou carregar `database/seeds.sql` — pergunte antes.

---

## 3. O que já foi feito (Etapa 1 — "voltar ao design antigo + componentes base + acessibilidade")

Detalhes completos em `docs/redesign/PLANO_REDESIGN.md`, seção "Etapa 1 — o que já foi feito".

- Voltamos ao design anterior ao UX01 (branch `design/v2` a partir de `origin/main`).
- **Componentes base** em `frontend/src/components/ui/` (`Button`, `ButtonLink`, `IconButton`, `Input`, `Select`, `Textarea`, `Label`, `Badge`, `Card`; importe de `../ui`). ~40 arquivos migrados para eles. Use-os em qualquer código novo — **não** volte a escrever classes de botão/campo à mão.
- **Acessibilidade:** foco visível (`:focus-visible`), `prefers-reduced-motion`, link "Skip to content", tamanho de texto (Settings > Theme), tokens de contraste `ui-accent` / `ui-accent-strong` / `ui-accent-soft` (modo claro idêntico ao antigo, escuro legível), `lang="en"`, `type` em todos os botões, papéis ARIA nas abas, nomes acessíveis em botões de ícone e no calendário, Esc fecha o menu mobile.
- Pequenas normalizações visuais intencionais estão listadas no PLANO (o usuário viu as telas e considerou ok: "voltaram ao que era antes, mais acessível").

---

## 4. O que falta — faça nesta ordem

### 4.1 Responsividade — ✅ FEITA, validada pelo usuário e commitada (`3db6593`)
Resultado: 180 combinações página × tela (320–1920px, claro/escuro, "Extra large" em 320 e 375) sem rolagem horizontal; estados extras (menu mobile, modais, popover) ok; build ok e `# pass 8 / # fail 0`. Detalhes na seção 6.

Como rodar a auditoria de novo (Playwright em Docker, na rede do compose; o Vite bloqueia hostname, por isso usa o IP do container). **Fixe o Playwright em 1.49.1** — o `^1.49.1` do `package.json` instala versão mais nova, incompatível com a imagem:
```powershell
$a = "C:\Users\jlabre\OneDrive - Grupo Biosys + Kovalent\Documentos\Claude Code\Bank_of_ideas\docs\redesign\responsive-audit"
$ip = docker inspect bank_ideas_frontend --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
docker run --rm --network bank_of_ideas_default -v "${a}:/work" -w /work -e BASE="http://${ip}:5173" mcr.microsoft.com/playwright:v1.49.1-jammy sh -c "npm i --no-save --no-audit --no-fund playwright@1.49.1 >/dev/null 2>&1; node audit.js; node extras.js >/dev/null"
```
(`ONLY=dashboard,ideas` limita páginas; `node summarize.js results.json <cfg> <páginas>` mostra os culpados. Não commitar `shots/`, `node_modules/`, `package-lock.json`, `extras.json`.)

**Pendência opcional (decisão do usuário, muda visual também no desktop):** no `PlanningCard`, rodapé "Start/End" e barra de checklist não ocupam a largura do card (o botão tem `align-items: flex-start`); no celular fica "…2026End: …" colado, e "Checklist2/3" sem espaço. Problema antigo, não corrigido.

### 4.2 Commitar a Etapa 1 — ✅ FEITO em 2026-11-24 (a pedido do usuário)
Feito em 2 commits locais (ver seção 2): como componentes base, acessibilidade e responsividade estão misturados nos mesmos arquivos, foram juntados num commit só de `frontend/`, e os docs num segundo. **Push ainda não feito** — só se o usuário pedir: `git push -u origin design/v2` (nunca para `main`). Como desfazer, se o usuário pedir: `git reset --soft 81a19cc` volta tudo a "não commitado" sem perder arquivos.

Texto original do plano, para referência:
Sugestão de divisão (2–3 commits pequenos, mensagens em português no padrão do repo):
1. componentes base (`frontend/src/components/ui/` + migração);
2. acessibilidade (tokens de contraste, foco, skip link, tamanho de texto, ARIA);
3. correções de responsividade (feitas — arquivos listados na seção 6, entrada do Claude Desktop). Atenção: `IdeaCard`, `PlanningCard`, `FilterBar`, `TabBar`, `Settings`, `Dashboard`, `DashboardHeader`, `CalendarGrid`, `CalendarWeekView`, `IdeaDetailPanel`, `PlanningDetailPanel`, `Ideas`, `Planning`, `Cycles` e `index.css` têm mudanças da Etapa 1 **e** da responsividade misturadas — separar por trecho (`git add -p`) ou juntar 2 e 3 num commit só, conforme o usuário preferir.
Antes de cada um: `git config --show-origin user.email` (não pode ser `@biosys.com.br`). Push só se o usuário pedir — e, como `design/v2` não tem upstream, use `git push -u origin design/v2` (nunca para `main`).

### 4.3 Etapa 2 (nova direção visual) — **não começar** sem o usuário abrir explicitamente
Plano em `PLANO_REDESIGN.md` (referências → 3 direções com protótipo → tokens → aplicação por página). Pendências que mudam o visual e ficaram para essa etapa: alvos de toque de 44px e animação `fade-in`.

---

## 5. Ao terminar — devolva o controle (obrigatório)

Quando o usuário validar a última etapa que você fizer, **atualize este arquivo** antes de encerrar:
1. Mude a linha "Última atualização" no topo (data + "sessão do Claude Desktop").
2. Acrescente uma entrada na seção 6 com: o que foi feito, commits criados (hash + mensagem), arquivos principais alterados, decisões do usuário, o que ficou pendente/bloqueado e qualquer desvio deste plano.
3. Atualize as seções 2 e 4 para refletir o novo estado real (branch, HEAD, o que está ou não commitado, próximos passos).
4. Não commite este arquivo a menos que o usuário peça.

---

## 6. Registro de sessões

- **2026-11-22 a 24 — VS Code:** plano de redesign; volta ao design antigo; Etapa 1 (componentes base + acessibilidade) feita e não commitada; travas de git + desligamento da atribuição; histórico do GitHub reescrito; auditoria de responsividade parcial (Dashboard e Ideas com rolagem horizontal no celular). Parou aqui → próximo: 4.1.
- **2026-11-24 — Claude Desktop:** etapa 4.1 (responsividade) feita e **validada pelo usuário** ("Aprovado"). Nenhum commit criado; HEAD continua `81a19cc`.
  - Auditoria completa: 15 páginas × 12 configurações + estados extras → 0 rolagem horizontal. Build ok, testes 8/0.
  - Correções (só layout, sem mudar o estilo):
    - Abas que rolam na horizontal: nova classe `.tablist-scroll` em `frontend/src/index.css` (`overflow-x:auto`, barra de rolagem escondida, linha inferior como `box-shadow` inset no lugar de `border-b` + `-mb-px` — visual idêntico; foco com `outline-offset:-2px`). Usada em `components/Filters/FilterBar.jsx`, `components/Filters/TabBar.jsx`, `pages/Settings.jsx`.
    - `pages/Dashboard.jsx`: grids com `grid-cols-1` + `min-w-0` nas colunas `lg:col-span-2`. `DashboardHeader.jsx`: linha do select/botão com `flex-wrap`.
    - `IdeaCard.jsx`, `PlanningCard.jsx`: botão `min-w-0`, título/descrição com `[overflow-wrap:anywhere]`.
    - `Calendar/CalendarWeekView.jsx`: célula, lista e mini-cards com `w-full min-w-0` (botões no Chrome têm `align-items:flex-start`, não esticam os filhos). `CalendarLegend.jsx` e cabeçalho do `CalendarGrid.jsx`: `flex-wrap`.
    - Cabeçalhos de `pages/Ideas.jsx`, `Planning.jsx`, `Cycles.jsx`: `flex-wrap gap-4` + `min-w-0`. `IdeaDetailPanel.jsx` e `PlanningDetailPanel.jsx`: título `min-w-0` + `[overflow-wrap:anywhere]`, botão Close `shrink-0`.
  - Ferramenta: Playwright fixado em 1.49.1 no comando (desvio: o comando antigo instalava 1.65 e falhava); `audit.js` ganhou a config 320px claro "Extra large".
  - Depois, a pedido do usuário ("pode realizar o commit"), 2 commits locais em `design/v2` (identidade noreply conferida): `3db6593` "Redesign etapa 1: componentes base, acessibilidade e responsividade do frontend" (53 arquivos de `frontend/`) e o commit de docs (`docs/redesign/`, com `results.json`/`extras.json` adicionados ao `.gitignore` da auditoria). Desvio do plano: 1 commit de frontend em vez de 2–3, porque as mudanças estão misturadas nos mesmos arquivos.
  - Pendente: push (só se o usuário pedir); pendência opcional do `PlanningCard` (seção 4.1); Etapa 2 continua fechada até o usuário abrir.
