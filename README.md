# Barb's Closet

E-commerce feminino em Next.js, React, TypeScript, Tailwind CSS, Prisma e PostgreSQL.

## Arquitetura

- Front-end: Next.js App Router com páginas públicas, conta, checkout e painel administrativo.
- Back-end: Route handlers em `src/app/api`, serviços em `src/server` e cálculo de preço sempre no servidor.
- Banco: Prisma/PostgreSQL em `prisma/schema.prisma`.
- Segurança: RBAC preparado, cookies seguros, rate limiting, validação server-side, webhooks assinados e logs de auditoria.
- Integrações: pagamento, e-mail, WhatsApp Business, CEP, storage S3 e fiscal por variáveis de ambiente.

## Mapa de páginas

- `/`
- `/produtos`
- `/produto/[slug]`
- `/categoria/[slug]`
- `/promocoes`
- `/novidades`
- `/mais-vendidos`
- `/busca`
- `/carrinho`
- `/checkout`
- `/login`
- `/cadastro`
- `/minha-conta`
- `/meus-pedidos`
- `/favoritos`
- `/guia-de-tamanhos`
- `/sobre`
- `/contato`
- `/politica-de-privacidade`
- `/trocas-e-devolucoes`
- `/admin`

## Rodando localmente

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` e preencha credenciais reais antes de integrar banco, pagamentos, WhatsApp, e-mail e emissão fiscal.

## URLs de SEO

O projeto usa `NEXT_PUBLIC_SITE_URL` para montar URLs absolutas de metadados, canonical, Open Graph, Twitter, sitemap, robots.txt e JSON-LD.

Em desenvolvimento, `.env.local` deve conter:

```bash
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

No painel do Vercel, configure a mesma variável em **Environment Variables** com a URL real de produção atual:

```bash
NEXT_PUBLIC_SITE_URL="https://lojafeminina-jdb2xmxsl-lucasizaias.vercel.app"
```

Se o domínio mudar no futuro, atualize apenas essa variável no Vercel e faça um novo deploy.

## Logo oficial

Substitua os arquivos abaixo pela logo oficial mantendo os nomes:

- `public/brand/logo.svg`
- `public/brand/favicon.svg`

Esses caminhos já são usados no cabeçalho, autenticação, checkout e metadados.
