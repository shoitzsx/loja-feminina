# Reestruturação visual da Barb's Closet: 4 temas comparáveis

Data: 2026-11-03 · Branch: `feat/temas-visuais` · Status: aguardando revisão

## 1. Objetivo e entendimento

**O que foi pedido (Lucas):** reestruturar visualmente o site inteiro. O fundo atual de triângulos rosa e dourado não agrada. Em vez de escolher uma direção antes, construir as 4 direções e deixar a cliente (esposa do Lucas) escolher vendo o site pronto.

**Resultado esperado:** o site funciona em 4 temas visuais, alternáveis ao vivo por um seletor temporário. Depois da escolha, fica só o tema vencedor e o seletor sai.

**Critérios de sucesso**
1. Os 4 temas funcionam em todas as páginas (home, produtos, produto, carrinho, checkout, conta, admin), no celular e no computador.
2. Trocar de tema não recarrega a página e não pisca (sem flash do tema errado).
3. Nenhuma regra de negócio muda: preço, cupom, frete, estoque e checkout seguem como estão (os 11 testes de `pricing.test.ts` continuam passando).
4. Contraste de texto em nível AA (4,5:1) em todos os temas.
5. `npm run lint`, `npx tsc --noEmit`, `npm test` e `npm run build` passam.

**Não faz parte:** novas funções da loja, pagamento real, banco de dados, mudança de textos de marketing, SEO além de manter o que existe.

**Decisões tomadas pelo Claude (corrija se discordar)**
- O tema padrão é o **Rosa vibrante limpo**, por ser o mais próximo do site atual.
- O seletor é temporário, controlado por variável de ambiente, e também aceita `?tema=` na URL para a cliente abrir cada tema por link.
- As 8 fotos de produto novas substituem as fotos de categoria hoje reaproveitadas nos produtos.

## 2. Estado atual do código (verificado em 2026-11-03)

- O fundo vem de `body` em `src/app/globals.css`: dois `linear-gradient` (triângulos rosa e dourado a 135°) sobre um degradê vertical rosa. Não é imagem.
- A paleta é fixa em `tailwind.config.ts` (`rosebrand-50..900`, `champagne`, `ink`, `plum`, `blush`) e usada por classe: **168** usos de `rosebrand-*`, **70** de `ink/plum/champagne/blush`, **48** de `neutral-*`, **25** de `bg-white*` e **16** cores hex escritas à mão em `.tsx`.
- `tailwind.config.ts` aponta para as fontes `--font-inter` e `--font-playfair`, mas `layout.tsx` **não carrega nenhuma fonte**. Hoje cai em `Inter`/`system-ui`.
- O hero em `src/app/page.tsx` usa `public/images/hero/barbs-closet-hero.png` com degradê rosa por cima.
- Os 8 produtos usam só 4 imagens de categoria (`data.ts`, linhas 3 a 6 e `images:`).
- `three`, `@react-three/fiber`, `gsap` e `framer-motion` **não estão instalados**.

## 3. Abordagem escolhida

**Camada de tokens + `data-theme`**, em vez de 4 cópias do site.

Duas alternativas foram descartadas:
- *Quatro branches ou deploys separados:* a cliente teria 4 links e a correção de um bug teria de ser repetida 4 vezes.
- *Reescrever cada componente por tema:* multiplica o código por 4 e deixa o tema vencedor cheio de resto morto.

### 3.1 Tokens

Em `globals.css`, cada tema é um bloco `[data-theme="..."]` que define variáveis:

| Grupo | Variáveis |
|---|---|
| Cor da marca | `--rb-50` a `--rb-900` (em canais RGB, ex.: `255 22 137`) |
| Superfície e texto | `--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`, `--border` |
| Destaque | `--accent`, `--on-accent`, `--gold` |
| Forma | `--radius-card`, `--radius-btn`, `--shadow-card`, `--shadow-glow` |
| Tipografia | `--font-display`, `--font-body` |
| Fundo | `--page-bg` (imagem e overlay), `--hero-img` |

`tailwind.config.ts` passa a declarar `rosebrand`, `ink`, `plum`, `blush` e `champagne` como `rgb(var(--...) / <alpha-value>)`. Assim as 168 classes `rosebrand-*` já existentes **mudam de cor sem edição**, e o suporte a opacidade (`/80`) continua funcionando.

Trabalho de migração que não é automático:
- Trocar os 16 hex soltos (Button, Badge, Header, CartProvider, CheckoutFlow, WhatsAppButton) por classes ou variáveis.
- Trocar `bg-white*` por `bg-surface` e `text-neutral-*` por `text-muted` onde o tema escuro precisa inverter.

### 3.2 Troca de tema

- `ThemeProvider` (client): lê, nesta ordem, `?tema=` na URL, `localStorage["barbs_theme"]` e o padrão. Valor inválido cai no padrão. Grava em `localStorage` e aplica `data-theme` em `<html>`.
- Um `<script>` inline curto no `<head>` aplica o tema antes da pintura, para evitar o flash.
- `ThemeSwitcher`: botão flutuante com os 4 nomes, só aparece com `NEXT_PUBLIC_THEME_SWITCHER=1`.
- Identificadores: `vibrante`, `editorial`, `vitrine-3d`, `escuro`.

### 3.3 Fundos e imagens

- Os triângulos saem. Cada tema define seu `--page-bg` (cor lisa, degradê suave ou a imagem do tema com overlay).
- As 17 imagens de `public/images/novas/` entram no projeto, convertidas para WebP/AVIF e redimensionadas (hoje há PNGs de até 490 KB; os fundos só precisam de ~1024 px porque são suaves).
- `data.ts` passa a apontar cada produto para sua foto nova (mapa na seção 5).
- O hero troca por tema (`hero-novo.png` no editorial e no vibrante; cena própria no 3D; fundo escuro com ouro no escuro).

## 4. Os 4 temas

| | Vibrante limpo | Editorial suave | Vitrine 3D | Escuro sofisticado |
|---|---|---|---|---|
| Fundo da página | `#fff0f8` liso, sem triângulos | marfim `#faf6f1` | rosé `#f6e3e0` | vinho `#1a0a12` |
| Superfície | `#ffffff` | `#ffffff` | vidro (branco 70% + blur) | `#2a1220` |
| Destaque | rosa `#ff1689` | rosé-ouro `#b76e79` | rosé `#c9707a` | ouro `#e0a458` e rosa `#ff4fac` |
| Texto | `#211820` | `#2a2326` | `#2a1a20` | `#f7e9ee` |
| Tipografia | Inter em tudo (como hoje) | Playfair nos títulos, Inter no corpo | Inter, títulos em Playfair | Playfair nos títulos, Inter no corpo |
| Forma | cantos 12 a 16 px | cantos 2 a 4 px, bordas finas | cantos 16 px, vidro | cantos 8 px, brilho dourado |
| Fundo/hero | `fundo-vibrante` suave nas faixas e no hero | `fundo-editorial` com muito espaço em branco | cena `fundo-3d-cena` + Three.js | `fundo-escuro` com partículas douradas |
| Botão principal | degradê rosa | contorno fino, preenche ao passar o mouse | rosé com brilho | dourado com texto escuro |

Os valores de cor são ponto de partida. Cada tema passa por checagem de contraste antes de ser considerado pronto.

### 4.1 Vitrine 3D (o mais pesado)

- Bibliotecas novas: `three`, `@react-three/fiber`, `@react-three/drei`. Carregadas com `dynamic(..., { ssr: false })` e **só montadas quando o tema ativo é `vitrine-3d`**; nos outros temas não entram no carregamento.
- Cena do hero: joia, tecido e brinco (`3d-*.png` recortados) flutuando em planos, com leve rotação e a câmera acompanhando o scroll. Sem modelos 3D reais nesta fase; são imagens em planos com profundidade.
- Degradação: sem WebGL, com `prefers-reduced-motion` ou em celular fraco (`devicePixelRatio` limitado a 1,5), mostra o hero estático com a mesma arte.
- Meta: o canvas não bloqueia a interação nem o carregamento do restante da página.

## 5. Mapa das imagens

| Arquivo novo | Uso |
|---|---|
| `produto-vestido-midi`, `produto-camisa-cetim`, `produto-colar-prata`, `produto-colar-dourado`, `produto-kit-brincos`, `produto-pulseira-charms`, `produto-bracelete-no`, `produto-brinco-cristal` | foto principal de cada produto (na ordem de `data.ts`: Vestido Midi Rosa Glam, Camisa Cetim Pérola, Colar Prata Ponto de Luz, Colar Dourado Sol, Kit Brincos Pérola & Argola, Pulseira Prata Charms, Bracelete Nó Dourado, Brinco Cristal Glam) |
| `fundo-editorial`, `fundo-vibrante`, `fundo-escuro`, `fundo-3d-cena` | fundo e hero de cada tema |
| `textura-cetim-rosa` | textura de faixas e rodapé |
| `3d-joia-colar`, `3d-tecido-seda`, `3d-brinco-cristal` | elementos do hero 3D |
| `hero-novo` | hero dos temas vibrante e editorial |

As 4 imagens de categoria atuais ficam no carrossel de categorias até serem trocadas.

## 6. Riscos e pendências

1. **Hero em baixa resolução:** `hero-novo` tem 1024 px de largura. Em tela cheia de computador fica mole. Decidir entre ampliar (créditos da ferramenta de imagem) ou regerar maior no Gemini.
2. **Itens 3D com fundo branco:** nos temas claros funciona com `mix-blend-mode: multiply`. No tema escuro e na cena 3D é preciso recorte real (remover fundo).
3. **Tema escuro:** é o de maior esforço, porque os `bg-white`, `text-neutral` e sombras claras precisam virar tokens. Admin e conta entram nesse esforço.
4. **Bracelete e camisa:** o bracelete saiu fino (parece anel) e a camisa saiu marfim. Conferir se batem com o produto real antes de publicar.
5. **Fontes:** `layout.tsx` não carrega fontes hoje. Entram via `next/font` (Inter e Playfair Display). O tema vibrante continua só com Inter, então o visual atual não muda; a Playfair só é aplicada nos temas que a usam.
6. **Peso:** garantir que o tema 3D não degrade o carregamento dos outros temas.

## 7. Testes e verificação

- **Unitário (Vitest):** resolução do tema (URL vence `localStorage`, que vence o padrão; valor inválido cai no padrão) e mapa de tokens (todos os 4 temas definem todas as variáveis obrigatórias).
- **Regressão:** `pricing.test.ts` segue passando; nenhum arquivo de regra de negócio é alterado.
- **Visual:** cada tema × páginas (home, listagem, produto, carrinho, checkout, conta, admin) × celular e desktop, com captura de tela, no navegador do app.
- **Acessibilidade:** contraste AA por tema; foco visível; `prefers-reduced-motion` respeitado (inclusive no 3D).
- **Build:** `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`.

## 8. Fases de implementação

0. Otimizar e versionar as imagens; ligar as fotos de produto em `data.ts`.
1. Tokens + `ThemeProvider` + seletor + fontes. O tema padrão reproduz o visual atual (sem mudança visível, inclusive o fundo de triângulos, que só sai na fase 2), para provar que a base não quebra nada.
2. Tema **vibrante** (remove os triângulos).
3. Tema **editorial**.
4. Tema **escuro** (migração de `bg-white` e `neutral`).
5. Tema **vitrine 3D**.
6. Polimento, escolha da cliente, remoção do seletor e dos temas não escolhidos.

Cada fase termina com lint, tipos, testes e build verdes e um commit.
