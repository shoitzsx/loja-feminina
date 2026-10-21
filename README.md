<div align="center">

# 🛍️ Closet · loja virtual de moda feminina

**Vitrine on-line de roupas e semijoias: ver os produtos, buscar, montar o carrinho e simular a compra.**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

[![Ver demonstração](https://img.shields.io/badge/Ver_demonstra%C3%A7%C3%A3o-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://loja-feminina-beta.vercel.app)

[🛠️ Ver a parte técnica](#parte-tecnica)

</div>

> 🧪 **Protótipo de front-end.** A navegação, o carrinho e o cálculo do pedido funcionam. Conta de cliente, pagamento, nota fiscal e banco de dados ainda são simulados ou não foram implementados. A interface usa a marca **Barb's Closet**.

---

## 🎯 Para que serve

Uma loja virtual pensada para moda feminina e semijoias, em que a cliente consegue:

- 👗 navegar pelas categorias e ver os detalhes de cada produto;
- 🔎 encontrar o que procura pela busca;
- 🛒 montar o carrinho, aplicar cupom e escolher o frete;
- 💳 seguir até o checkout e escolher a forma de pagamento.

## ✅ O que já funciona

- 🏬 **Vitrine** com categorias (roupas, colares, pulseiras e brincos), novidades, promoções e mais vendidos.
- 👗 **Página de produto** com tamanhos e variações.
- 🔎 **Busca** de produtos no catálogo.
- 🛒 **Carrinho** que fica salvo no navegador, com cupons de desconto de exemplo e três opções de frete.
- 💳 **Checkout**: o servidor confere os dados e **calcula o preço** a partir do catálogo (o preço nunca vem do navegador) e gera um pagamento **simulado** por PIX, cartão ou boleto.
- 📮 **Consulta de CEP** pelo ViaCEP, quando ativada na configuração.
- 📄 **Páginas institucionais**: sobre, contato, guia de tamanhos, políticas de entrega e de privacidade, trocas e devoluções, termos e cookies, com aviso de cookies.
- 💬 **Botão de WhatsApp**, quando o número da loja está configurado.
- 📱 **Layout responsivo**, para celular e computador.

## 🚧 O que ainda é simulado ou não existe

- 🔑 **Login e cadastro**: as telas existem e os dados são validados, mas nenhuma conta é criada nem autenticada ainda.
- ❤️ **Favoritos**: o botão de favoritar não salva a escolha; a página de favoritos mostra produtos recomendados.
- 📦 **Minha conta e Meus pedidos** mostram dados de exemplo.
- 💸 **Pagamento, nota fiscal, e-mail e WhatsApp automáticos** funcionam em modo simulado: nenhum serviço real é chamado.
- 🗄️ **Banco de dados**: os produtos vêm de um catálogo fixo no código. O banco (Prisma) só tem o modelo definido.
- 🔐 **Painel administrativo**: é uma demonstração, liberada por um código conferido no próprio navegador, sem proteção real.

## 👤 Quem fez

Projeto desenvolvido por **Lucas Izaias** para uma cliente, com a marca **Barb's Closet**.

- 🌐 Demonstração: [loja-feminina-beta.vercel.app](https://loja-feminina-beta.vercel.app)
- 📂 Repositório: [github.com/shoitzsx/loja-feminina](https://github.com/shoitzsx/loja-feminina)
- 🐙 GitHub: [github.com/shoitzsx](https://github.com/shoitzsx)
- ✉️ E-mail: [lucas.mateus.izaias.santos@gmail.com](mailto:lucas.mateus.izaias.santos@gmail.com)

---

<a name="parte-tecnica"></a>

## 🛠️ Parte técnica

Esta seção explica como o projeto foi feito, para quem quer avaliar o código ou rodá-lo localmente.

### Linguagens e tecnologias

| Área | Tecnologias |
|---|---|
| Linguagens | TypeScript, CSS |
| Interface | Next.js 15 (App Router), React 19, Tailwind CSS 3, Lucide |
| Servidor | Route handlers do Next.js (`src/app/api`), zod para validação, argon2 e bcryptjs para hash de senha |
| Banco de dados | Prisma (somente o modelo em `prisma/schema.prisma`; ainda não usado pelo código) |
| Qualidade | TypeScript e ESLint (`eslint-config-next`) |

### Como funciona

- **Catálogo:** produtos, categorias, opções de frete e cupons ficam em `src/lib/data.ts`.
- **Preço sempre no servidor:** o navegador envia só produto, variação e quantidade. O checkout (`src/app/api/checkout`) usa `src/lib/pricing.ts` para recalcular subtotal, cupom e frete a partir do catálogo antes de gerar o pedido.
- **Validação e limite de requisições:** as rotas de login, cadastro e checkout validam a entrada com zod e limitam tentativas por IP (`src/server/security.ts`). O limite fica na memória de cada instância do servidor.
- **Integrações preparadas:** pagamento, nota fiscal, e-mail, WhatsApp e CEP ficam em `src/server/integrations/`. Sem as chaves de API configuradas, cada uma responde em modo simulado. Com as chaves, pagamento, e-mail, nota fiscal e WhatsApp recusam o envio, porque os adaptadores para os serviços reais ainda não foram implementados.
- **Webhooks assinados:** as rotas `src/app/api/webhooks/payment` e `src/app/api/webhooks/fiscal` conferem a assinatura HMAC antes de aceitar a notificação.
- **SEO:** metadados por página, `sitemap.ts`, `robots.ts` e dados estruturados (JSON-LD), com URLs montadas a partir de `NEXT_PUBLIC_SITE_URL`.

<details>
<summary><strong>📁 Estrutura do projeto</strong></summary>

```text
.
├── prisma/
│   └── schema.prisma     # modelo de dados (ainda não usado pelo código)
├── public/
│   ├── brand/            # logo e favicon
│   └── images/           # imagens de categorias e destaque
└── src/
    ├── app/              # páginas (App Router) e rotas de API
    ├── components/       # componentes por área: carrinho, checkout, produto, conta, admin, layout
    ├── lib/              # catálogo, cálculo de preço, formatação e URLs do site
    └── server/           # pedido, segurança e integrações externas
```

</details>

### Executar localmente

**Pré-requisitos:** Node.js e npm (verificado com Node.js 24 e npm 11).

```bash
git clone https://github.com/shoitzsx/loja-feminina.git
cd loja-feminina
npm install
npm run dev      # http://127.0.0.1:3000
```

> ℹ️ Use `npm install`: hoje o `package-lock.json` está desatualizado em relação ao `package.json`, então o `npm ci` falha.

Para navegar pela loja não é preciso configurar nada. Para testar as integrações, copie `.env.example` para `.env.local`:

| Variáveis | Para que servem |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL base usada nos metadados, sitemap e links absolutos |
| `NEXT_PUBLIC_BRAND_LOGO_PATH`, `NEXT_PUBLIC_BRAND_FAVICON_PATH` | Caminhos da logo e do favicon em `public/brand/` |
| `PAYMENT_*`, `FISCAL_*`, `EMAIL_*`, `WHATSAPP_*`, `CEP_PROVIDER`, `SHIPPING_API_KEY` | Integrações. Sem elas, tudo funciona em modo simulado; use `CEP_PROVIDER=viacep` para ativar a consulta de CEP |
| `DATABASE_URL`, `AUTH_SECRET`, `SESSION_COOKIE_NAME`, `S3_*` | Reservadas para banco, sessão e armazenamento, que ainda não estão em uso |

```bash
npm run lint     # ESLint
npm run build    # build de produção
npm run start    # serve o build
```

### Testes

Ainda não há testes automatizados. A verificação atual é feita com `npm run lint` e `npm run build`.

### Limitações conhecidas

- Sem autenticação real, sem persistência de pedidos e sem banco de dados em uso.
- O limite de requisições é guardado em memória e não é compartilhado entre instâncias do servidor.
- O `package-lock.json` precisa ser atualizado para o `npm ci` voltar a funcionar.
- As integrações de pagamento, nota fiscal e WhatsApp ainda precisam ser configuradas e validadas antes de qualquer uso real.
