This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testes de ponta a ponta

Os testes (Playwright + axe) ficam em `tests/` e rodam contra um site já em pé. **Use só o projeto de testes (`mah-dev`)**: eles criam e apagam um jogo e mexem no perfil dos dois sócios de teste.

1. Suba o site apontando para o `mah-dev` (`.env.local` com a URL e a chave publicável do `mah-dev`), por exemplo `npx next build && npx next start -p 3100`.
2. Defina, no ambiente do terminal (nunca em arquivo versionado):
   - `E2E_BASE_URL` (padrão `http://localhost:3100`)
   - `E2E_SUPABASE_URL` e `E2E_SUPABASE_KEY` (a chave publicável do `mah-dev`)
   - `E2E_DAN_EMAIL`, `E2E_DAN_PASSWORD`, `E2E_MAH_EMAIL`, `E2E_MAH_PASSWORD` (os dois sócios de teste, com senha)
   - `E2E_CHROMIUM_PATH` (opcional: caminho de um Chromium já instalado; sem ele vale o do `npx playwright install chromium`)
3. `npm run test:e2e`

Cobertura: porta de entrada e rotas protegidas, redirecionamento do login sem saída para fora, tarefa diária protegida, manifesto, perfil (nome, tema, papel de parede, foto vista pelo outro sócio), jogo + sessão + exportação, axe (WCAG 2 A e AA) nas telas principais nos dois temas e capturas em 375, 768 e 1440 px com checagem de rolagem lateral (em `test-results/screens/`).

## Tarefa diária (manter o banco ativo)

`vercel.json` agenda `GET /api/cron/keepalive` todo dia. A rota exige `Authorization: Bearer $CRON_SECRET` (a Vercel envia isso sozinha quando a variável `CRON_SECRET` existe no projeto) e faz uma consulta trivial (`public.keepalive()`).
