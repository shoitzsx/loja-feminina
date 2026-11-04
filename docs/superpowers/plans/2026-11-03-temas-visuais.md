# Temas visuais da Barb's Closet: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o site em 4 temas visuais (vibrante, editorial, vitrine 3D, escuro), alternáveis ao vivo, para a cliente escolher.

**Architecture:** Camada de tokens CSS por `[data-theme]` em `src/app/themes.css`; o Tailwind lê as cores dessas variáveis, então as classes `rosebrand-*` existentes mudam de cor sem edição. Um `ThemeProvider` aplica `data-theme` em `<html>` (um script inline evita o flash). O tema 3D usa Three.js carregado só quando ativo.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind 3, Vitest 5.1, `next/font`, `sharp` (já instalado via Next), `three` + `@react-three/fiber` (só na Task 8).

**Spec:** `docs/superpowers/specs/2026-11-03-temas-visuais-design.md`

## Global Constraints

- Ids de tema, exatamente: `vibrante`, `editorial`, `vitrine-3d`, `escuro`. Padrão: `vibrante`.
- Chave do `localStorage`: `barbs_theme`. Parâmetro de URL: `?tema=`. Seletor só com `NEXT_PUBLIC_THEME_SWITCHER=1`.
- Nenhum arquivo de regra de negócio muda (`src/lib/pricing.ts`, `src/app/api/**`); os 11 testes de `pricing.test.ts` continuam passando.
- Contraste mínimo AA (4,5:1) para `text` sobre `bg`, `text` sobre `surface` e `on-accent` sobre `accent`, nos 4 temas.
- `prefers-reduced-motion` respeitado, inclusive no 3D.
- A fase 1 não muda nada visível no tema padrão (inclusive os triângulos, que só saem na Task 5).
- Cada tarefa termina com `npm run lint`, `npx tsc --noEmit`, `npm test` e `npm run build` verdes, e um commit. Commitar só os arquivos da tarefa (nunca `git add .`).
- Windows: comandos para Git Bash; `NEXT_PUBLIC_*` vai em `.env.local` (já ignorado pelo git).

## Review Focus

1. `localStorage` bloqueado (Safari privado lança erro) ou `?tema=` inválido: cai no padrão, sem quebrar a página. Teste na Task 2.
2. Trocar de tema no checkout não recarrega a página nem apaga o que a cliente digitou. Verificação manual na Task 4.
3. Divergência de hidratação: o script já coloca `data-theme` antes do React. `<html>` precisa de `suppressHydrationWarning`. Verificação na Task 4.
4. Produto cujo arquivo de imagem não existe aparece quebrado. Teste na Task 1.
5. Sem WebGL, com movimento reduzido ou com perda de contexto, o hero 3D mostra a versão estática. Teste na Task 8.

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/optimize-images.mjs` | converte e redimensiona `public/images/novas/*` para WebP |
| `src/lib/theme.ts` | ids, padrão, `resolveTheme`, `themeInitScript` (sem React) |
| `src/app/themes.css` | tokens dos 4 temas (única fonte das cores e formas) |
| `src/components/theme/ThemeProvider.tsx` | contexto `useTheme`, grava `localStorage`, aplica `data-theme` |
| `src/components/theme/ThemeSwitcher.tsx` | botão flutuante temporário |
| `src/lib/hero3d-config.ts` | `shouldRender3D`, `dprFor` (puros, testáveis) |
| `src/components/theme/Hero3D.tsx` e `Hero3DLoader.tsx` | cena Three.js e carregador dinâmico |
| `scripts/white-to-alpha.mjs` | transforma o fundo branco dos itens 3D em transparência |

---

### Task 1: Imagens otimizadas e fotos de produto

**Files:**
- Create: `scripts/optimize-images.mjs`, `src/lib/data.test.ts`
- Modify: `src/lib/data.ts:3-6,50,80,109,136,163,189,217,243`
- Create (gerados): `public/images/novas/*.webp`; remover os `.png` originais depois de convertidos

**Interfaces:**
- Produces: caminhos `/images/novas/produto-<slug>.webp` usados em `data.ts`; `/images/novas/hero-novo.webp`, `fundo-*.webp`, `textura-cetim-rosa.webp`, `3d-*.png` (os 3 itens 3D ficam PNG até a Task 8).

- [ ] **Step 1: Escrever o teste que falha** em `src/lib/data.test.ts`: `todo produto aponta para arquivos que existem em public/` percorre `products[*].images` e faz `expect(existsSync(join("public", img))).toBe(true)` para cada um; `nenhum produto usa a foto de categoria como principal` exige `images[0]` começando com `/images/novas/produto-`.
- [ ] **Step 2: Rodar** `npx vitest run src/lib/data.test.ts` → FAIL no segundo teste.
- [ ] **Step 3: Implementar `scripts/optimize-images.mjs`** com `sharp`: produtos 825×1024 e fundos/hero 1024×572 viram WebP qualidade 82; texturas e itens 3D 1024×1024. Rodar `node scripts/optimize-images.mjs` e apagar os `.png` dos produtos, fundos e hero.
- [ ] **Step 4: Trocar `images`** em `data.ts` na ordem: Vestido → `produto-vestido-midi`, Camisa → `produto-camisa-cetim`, Colar Prata → `produto-colar-prata`, Colar Dourado → `produto-colar-dourado`, Kit Brincos → `produto-kit-brincos`, Pulseira Charms → `produto-pulseira-charms`, Bracelete → `produto-bracelete-no`, Brinco Cristal → `produto-brinco-cristal`. O vestido passa a ter só a foto nova (sai a imagem antiga de hero da galeria). As constantes `clothingImage…braceletImage` seguem para as `categories`.
- [ ] **Step 5: Rodar** `npx vitest run` → tudo PASS; `npm run build` verde.
- [ ] **Step 6: Commit** `public/images/novas`, `scripts/optimize-images.mjs`, `src/lib/data.ts`, `src/lib/data.test.ts` com `feat: fotos de produto novas e imagens otimizadas`.

---

### Task 2: Lógica de tema

**Files:**
- Create: `src/lib/theme.ts`, `src/lib/theme.test.ts`

**Interfaces:**
- Produces:
  - `THEME_IDS: readonly ["vibrante","editorial","vitrine-3d","escuro"]`, `type ThemeId`, `DEFAULT_THEME: ThemeId`, `THEME_STORAGE_KEY = "barbs_theme"`, `THEME_LABELS: Record<ThemeId, string>` (`Vibrante`, `Editorial`, `Vitrine 3D`, `Escuro`)
  - `isThemeId(value: unknown): value is ThemeId`
  - `resolveTheme(input: { search?: string; stored?: string | null }): ThemeId`
  - `themeInitScript(): string` (JS que lê URL e `localStorage` e faz `document.documentElement.dataset.theme = <id>`)

- [ ] **Step 1: Escrever os testes que falham** em `theme.test.ts`:
  - `resolveTheme({ search: "?tema=escuro", stored: "editorial" })` → `"escuro"`
  - `resolveTheme({ stored: "editorial" })` → `"editorial"`
  - `resolveTheme({ search: "?tema=xyz", stored: "editorial" })` → `"editorial"`
  - `resolveTheme({ search: "?tema=xyz", stored: "lixo" })` → `DEFAULT_THEME`
  - `resolveTheme({})` → `"vibrante"`
  - `themeInitScript aplica o tema`: executar o script com `new Function("document","localStorage","location", script)` e stubs; com `location.search = "?tema=escuro"` o `dataset.theme` vira `"escuro"`.
  - `themeInitScript não quebra com localStorage bloqueado`: `localStorage.getItem` lança; o resultado é `"vibrante"`, sem exceção (Review Focus 1).
- [ ] **Step 2: Rodar** `npx vitest run src/lib/theme.test.ts` → FAIL (módulo não existe).
- [ ] **Step 3: Implementar** `theme.ts`. O script inline é uma string autocontida (sem imports), com `try/catch` em volta do `localStorage` e da leitura da URL.
- [ ] **Step 4: Rodar** o mesmo comando → PASS.
- [ ] **Step 5: Commit** `src/lib/theme.ts`, `src/lib/theme.test.ts` com `feat: logica de selecao de tema`.

---

### Task 3: Tokens, Tailwind e migração das cores soltas

**Files:**
- Create: `src/app/themes.css`, `src/lib/theme-tokens.test.ts`
- Modify: `tailwind.config.ts:11-33`, `src/app/layout.tsx` (importar `./themes.css`), `src/app/globals.css`, `src/components/ui/Button.tsx:8`, `src/components/ui/Badge.tsx:5`, `src/components/cart/CartProvider.tsx:99`, `src/components/layout/Header.tsx:188`, `src/components/checkout/CheckoutFlow.tsx:129`

**Interfaces:**
- Consumes: `THEME_IDS` de `src/lib/theme.ts`.
- Produces: variáveis CSS por tema. Cores como canais RGB separados por espaço (`255 22 137`), usadas como `rgb(var(--x) / <alpha-value>)`. Lista obrigatória (`REQUIRED_TOKENS`):
  `rb-50, rb-100, rb-200, rb-300, rb-400, rb-500, rb-600, rb-700, rb-800, rb-900, plum, blush, gold, bg, surface, surface-2, text, text-muted, border, accent, on-accent, radius-card, radius-btn, shadow-card, shadow-glow, font-display, font-body, page-bg, hero-img, brand-gradient, topbar-gradient, toast-gradient`.
  Tailwind: `rosebrand-N` → `--rb-N`; `ink` → `--text`; `plum`, `blush`; `champagne` → `--gold`; novas `surface`, `surface-2`, `muted` (→ `--text-muted`), `on-accent`. Sombras `soft/card/glow` → `--shadow-*`.

- [ ] **Step 1: Escrever os testes que falham** em `theme-tokens.test.ts`, lendo `src/app/themes.css` como texto:
  - `cada tema define todos os tokens obrigatórios`: para cada `THEME_IDS`, o bloco `[data-theme="<id>"]` contém `--<token>:` para todo `REQUIRED_TOKENS`.
  - `o tema vibrante também vale em :root` (seletor `:root, [data-theme="vibrante"]`).
  - `contraste AA`: função local `contrast(a, b)` (luminância relativa WCAG) aplicada a `text`/`bg`, `text`/`surface` e `on-accent`/`accent` de cada tema; `expect(ratio).toBeGreaterThanOrEqual(4.5)`.
  - `vibrante reproduz a paleta atual`: `--rb-500` = `255 22 137`, `--rb-600` = `230 0 119`, `--brand-gradient` contém `#ff1689`, `#ff4fac`, `#e60077`.
- [ ] **Step 2: Rodar** `npx vitest run src/lib/theme-tokens.test.ts` → FAIL.
- [ ] **Step 3: Escrever `themes.css`** com os 4 blocos, usando as cores da tabela da seção 4 do spec como ponto de partida. O `vibrante` copia os valores atuais de `tailwind.config.ts` e dos hex soltos. No `escuro`, a escala `rb-50…900` é **invertida** (50 = superfície escura, 900 = texto claro) para que `bg-rosebrand-50` e `text-rosebrand-700` continuem legíveis. Nesta tarefa os temas `editorial`, `vitrine-3d` e `escuro` recebem só as **cores** certas; forma (`--radius-*`), fontes, `--page-bg` e `--hero-img` ficam iguais aos do vibrante e são definidos nas Tasks 5 a 8. Ajustar as cores até o teste de contraste passar.
- [ ] **Step 4: Ligar o Tailwind** (`rgb(var(--…) / <alpha-value>)`) e importar `themes.css` em `layout.tsx` depois de `globals.css`. Em `globals.css`, criar `.bg-brand-gradient`, `.bg-topbar-gradient`, `.bg-toast-gradient` (usam as variáveis `*-gradient`) e `body { font-family: var(--font-body) }`.
- [ ] **Step 5: Migrar os 5 pontos com hex solto** para essas classes; nos botões e selos com degradê trocar `text-white` por `text-on-accent`. `#25D366` do WhatsApp fica como está (cor da marca WhatsApp).
- [ ] **Step 6: Rodar** `npm test` → PASS; `npm run build` verde.
- [ ] **Step 7: Verificar que nada mudou** com o servidor de dev: abrir `/` e `/carrinho` e comparar com a captura anterior; `getComputedStyle(document.body).backgroundImage` ainda contém os triângulos. Qualquer diferença visível é bug.
- [ ] **Step 8: Commit** os arquivos da tarefa com `feat: tokens de tema e paleta via variaveis CSS`.

---

### Task 4: ThemeProvider, seletor e fontes

**Files:**
- Create: `src/components/theme/ThemeProvider.tsx`, `src/components/theme/ThemeSwitcher.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `resolveTheme`, `themeInitScript`, `THEME_*` (Task 2).
- Produces: `ThemeProvider({ children })` (client); `useTheme(): { theme: ThemeId; setTheme(id: ThemeId): void }`; `ThemeSwitcher()` renderiza `null` se `process.env.NEXT_PUBLIC_THEME_SWITCHER !== "1"`.

- [ ] **Step 1: Implementar `ThemeProvider`**: estado inicial lido de `document.documentElement.dataset.theme` (já definido pelo script), `setTheme` grava `localStorage` (dentro de `try/catch`), atualiza `data-theme` e a URL com `history.replaceState` sem recarregar.
- [ ] **Step 2: Implementar `ThemeSwitcher`**: botão flutuante canto inferior esquerdo, `z-40`, com os 4 `THEME_LABELS`; `aria-pressed` no ativo; não cobre o botão do WhatsApp (canto direito).
- [ ] **Step 3: Ajustar `layout.tsx`**: `<html lang="pt-BR" suppressHydrationWarning>`; `<script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />` como primeiro filho de `<head>`; fontes `Inter` e `Playfair_Display` de `next/font/google` expostas como `--font-inter` e `--font-playfair` no `<body>`; envolver com `ThemeProvider` e renderizar `ThemeSwitcher`. Criar `.env.local` com `NEXT_PUBLIC_THEME_SWITCHER=1`.
- [ ] **Step 4: Verificar no navegador**: abrir `/?tema=escuro` e ler `document.documentElement.dataset.theme` → `"escuro"` já no primeiro paint (sem piscar para vibrante); recarregar com `localStorage` limpo e sem query → `"vibrante"`; clicar nos 4 botões e conferir que o atributo muda sem recarregar (a aba não faz nova navegação).
- [ ] **Step 5: Verificar o Review Focus 2**: em `/checkout`, digitar um nome, trocar de tema e confirmar que o campo mantém o valor.
- [ ] **Step 6: Lint, tipos, testes, build** verdes. Commit dos 3 arquivos com `feat: provedor e seletor de tema`.

---

### Task 5: Tema vibrante (fim dos triângulos)

**Files:**
- Modify: `src/app/themes.css`, `src/app/globals.css:16-24`, `src/app/page.tsx:25-28`

**Interfaces:**
- Consumes: tokens `--page-bg`, `--hero-img` (Task 3).
- Produces: classe `.hero-media` (fundo do hero via `background-image: var(--hero-img)`, `background-size: cover`), usada por todos os temas.

- [ ] **Step 1: Escrever o teste que falha** em `theme-tokens.test.ts`: `nenhum tema usa o degradê de triângulos`: `globals.css` não contém `rgba(255, 22, 137, 0.08) 0 12%`.
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar**: `body { background: var(--page-bg) }` (cor lisa `#fff0f8` com degradê suave vertical, sem listras); no `page.tsx` trocar o `<Image>` do hero por um `<div className="hero-media absolute inset-0" />` mantendo os degradês de leitura; `--hero-img` do vibrante = `url(/images/novas/hero-novo.webp)`; faixas com `fundo-vibrante.webp` em baixa opacidade só como detalhe (não como fundo da página inteira).
- [ ] **Step 4: Rodar** `npm test` → PASS.
- [ ] **Step 5: Verificar no navegador** em 390 px e 1280 px: `/`, `/produtos`, `/produtos/<slug>`: sem listras, texto legível, hero carregando.
- [ ] **Step 6: Commit** com `feat: tema vibrante sem triangulos`.

---

### Task 6: Tema editorial

**Files:**
- Modify: `src/app/themes.css`, `src/app/globals.css`, `src/components/ui/Button.tsx`

**Interfaces:**
- Consumes: `--radius-card`, `--radius-btn`, `--font-display`, `--hero-img`.

- [ ] **Step 1: Escrever o teste que falha**: `editorial usa Playfair nos títulos e raio pequeno`: no bloco `[data-theme="editorial"]`, `--font-display` contém `--font-playfair` e `--radius-card` e `--radius-btn` ≤ `4px`.
- [ ] **Step 2: Rodar** → FAIL (a Task 3 deixou fonte e raio do editorial iguais aos do vibrante).
- [ ] **Step 3: Implementar**: títulos `h1…h3` usam `font-family: var(--font-display)`; botão principal vira contorno fino que preenche no hover (via `[data-theme="editorial"] .bg-brand-gradient`, com `--brand-gradient: none` e borda `rgb(var(--accent))`); `--page-bg` marfim com `fundo-editorial.webp` a 12% de opacidade; `--hero-img` = `hero-novo.webp`; espaçamento maior entre seções (`.container-shell` com mais padding vertical só neste tema).
- [ ] **Step 4: Verificar no navegador** em 390 e 1280 px as mesmas páginas da Task 5, mais o carrinho; contraste do botão no hover.
- [ ] **Step 5: Commit** com `feat: tema editorial`.

---

### Task 7: Tema escuro

**Files:**
- Modify: `src/app/themes.css`, todos os `.tsx` com `bg-white*` (25 usos) e `text-neutral-*` (48 usos) em `src/components/**` e `src/app/**`
- Test: `src/lib/theme-tokens.test.ts`

**Interfaces:**
- Consumes: classes Tailwind `surface`, `surface-2`, `muted` (Task 3).

- [ ] **Step 1: Escrever o teste que falha**: `componentes não usam bg-white nem text-neutral fixos`: varre `src/**/*.tsx` e exige zero ocorrências de `bg-white` e `text-neutral-` (exceto `WhatsAppButton.tsx`).
- [ ] **Step 2: Rodar** → FAIL listando os arquivos.
- [ ] **Step 3: Migrar**: `bg-white`, `bg-white/NN` → `bg-surface`, `bg-surface/NN`; `text-neutral-500/600/700` → `text-muted`. No tema vibrante e editorial `--text-muted` e `--surface` reproduzem o aspecto anterior.
- [ ] **Step 4: Finalizar `escuro`** em `themes.css`: fundo vinho, `--page-bg` com `fundo-escuro.webp` e overlay, `--hero-img` = `fundo-escuro.webp`, botão principal dourado com `--on-accent` escuro, sombras com brilho dourado. Ajustar `input`, `select`, `textarea` e o banner de cookies para usarem `surface`/`border`.
- [ ] **Step 5: Rodar** `npm test` → PASS (inclui contraste).
- [ ] **Step 6: Verificar no navegador** em 390 e 1280 px: `/`, `/produtos`, produto, `/carrinho`, `/checkout`, `/minha-conta`, `/admin`. Nenhum bloco branco chapado, nenhum texto escuro sobre fundo escuro.
- [ ] **Step 7: Commit** com `feat: tema escuro e tokens de superficie`.

---

### Task 8: Tema vitrine 3D

**Files:**
- Create: `scripts/white-to-alpha.mjs`, `src/lib/hero3d-config.ts`, `src/lib/hero3d-config.test.ts`, `src/components/theme/Hero3D.tsx`, `src/components/theme/Hero3DLoader.tsx`
- Modify: `package.json` (`three`, `@react-three/fiber`, `@types/three`), `src/app/page.tsx`, `src/app/themes.css`

**Interfaces:**
- Produces:
  - `shouldRender3D(input: { theme: ThemeId; prefersReducedMotion: boolean; hasWebGL: boolean }): boolean`
  - `dprFor(viewportWidth: number): number` (máx. 1,5; 1 para largura < 480)
  - `Hero3DLoader()` (client): `dynamic(() => import("./Hero3D"), { ssr: false })`, monta só se `shouldRender3D(...)`.

- [ ] **Step 1: Escrever os testes que falham** em `hero3d-config.test.ts`:
  - `shouldRender3D({ theme: "vitrine-3d", prefersReducedMotion: false, hasWebGL: true })` → `true`
  - mesmo com `theme: "vibrante"` → `false`
  - com `prefersReducedMotion: true` → `false`; com `hasWebGL: false` → `false` (Review Focus 5)
  - `dprFor(390)` → `1`; `dprFor(1280)` → `1.5`
- [ ] **Step 2: Rodar** → FAIL.
- [ ] **Step 3: Implementar** `hero3d-config.ts`.
- [ ] **Step 4: Recortar os itens 3D**: `node scripts/white-to-alpha.mjs` converte pixels quase brancos (> 245) de `3d-*.png` em transparência com borda suavizada e salva `3d-*.png` transparentes. Conferir a olho que não sobrou halo branco.
- [ ] **Step 5: Instalar** `npm install three @react-three/fiber` e `npm install -D @types/three`; `npm ci --dry-run` sem erro.
- [ ] **Step 6: Implementar `Hero3D.tsx`**: `Canvas` com `dpr={dprFor(window.innerWidth)}`, 3 planos com as texturas `3d-*.png`, rotação lenta, câmera que desloca com `window.scrollY`; `onCreated` registra `webglcontextlost` e chama um callback que volta ao hero estático. `Hero3DLoader` decide com `shouldRender3D`; o hero estático (`.hero-media` com `fundo-3d-cena.webp`) sempre fica por baixo.
- [ ] **Step 7: Rodar** `npm test`, lint, tipos e `npm run build`; conferir que o bundle da home em outros temas não inclui `three` (a saída de `next build` não aumenta o "First Load JS" da rota `/` além de ~5 kB).
- [ ] **Step 8: Verificar no navegador**: tema 3D em 1280 px (cena anima, scroll move a câmera) e em 390 px; ativar "reduzir movimento" no emulador e confirmar o hero estático; nos outros temas `document.querySelector("canvas")` é `null`.
- [ ] **Step 9: Commit** com `feat: tema vitrine 3D com Three.js`.

---

### Task 9: Verificação final e registro

**Files:**
- Modify: `D:\Memoria Obisidian\Vault\01 Projetos\Closet\Closet - Estado Atual e Próximos Passos.md`; criar nota em `12 Sessoes/`

- [ ] **Step 1: Matriz visual**: 4 temas × `/`, `/produtos`, produto, `/carrinho`, `/checkout`, `/minha-conta`, `/admin` × 390 e 1280 px, com captura de tela de cada combinação. Anotar e corrigir qualquer quebra.
- [ ] **Step 2: Rodar tudo**: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, todos verdes; `npm test` inclui os 11 testes de preço.
- [ ] **Step 3: Gerar os 4 links** da forma `/?tema=<id>` para a cliente (e o link da Vercel de preview, se publicado).
- [ ] **Step 4: Registrar no Vault** (estado do projeto + nota de sessão) e reler os arquivos gravados antes de afirmar que foram salvos.
- [ ] **Step 5: Commit** das correções restantes com `chore: ajustes finais dos temas`.

---

### Task 10: Escolha da cliente e limpeza (só depois da decisão)

**Files:** conforme o tema escolhido.

- [ ] **Step 1: Teste que falha**: `o seletor e os temas descartados foram removidos`: `themes.css` contém só o bloco do tema escolhido e `ThemeSwitcher.tsx` não existe.
- [ ] **Step 2: Remover** seletor, `ThemeProvider`, script inline, blocos dos temas não escolhidos, `three` (se o 3D não foi o escolhido) e as imagens sem uso; fixar `data-theme` no `<html>`.
- [ ] **Step 3: Lint, tipos, testes, build** verdes; atualizar as notas do Vault; commit com `refactor: manter apenas o tema escolhido`.

---

## Autorrevisão

- **Cobertura do spec:** tokens e Tailwind (T3); troca de tema, flash e seletor (T2, T4); fundos e imagens (T1, T5 a T8); 4 temas (T5 a T8); testes de tema, contraste e regressão de preço (T2, T3, T7); fases 0 a 6 (T1 a T10). Os riscos do spec aparecem assim: hero de 1024 px segue sem resolver (decisão do Lucas: ampliar ou regerar), recorte dos itens 3D (T8, passo 4), tema escuro (T7), fontes (T4).
- **Consistência de nomes:** `ThemeId`, `THEME_IDS`, `resolveTheme`, `themeInitScript`, `shouldRender3D`, `dprFor` e as classes `bg-brand-gradient`, `surface`, `muted`, `on-accent` são usados com a mesma grafia em todas as tarefas.
- **Divergência consciente do spec:** o spec fala em `--gold` para o dourado; o plano mantém `--gold` e mapeia `champagne` para ele. O spec fala em `next/image` no hero; o plano usa `background-image` por variável CSS para evitar troca na hidratação, ao custo de perder o `priority` do Next (aceitável para a fase de comparação).
