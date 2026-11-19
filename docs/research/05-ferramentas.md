# 05 — Avaliação de ferramentas

Data da pesquisa: 2026-11-18. Ambiente alvo: Windows 11, Node 24, npm 11, Claude Code.

Método: versões lidas direto do registro npm (`registry.npmjs.org/<pacote>/latest`); dados de repositório lidos da API do GitHub (`pushed_at`, licença, estrelas) e dos READMEs/manifestos; limites e políticas lidos da documentação oficial (Next.js, Supabase, Tailwind, Playwright, WebKit, GSAP, 21st.dev). Nada foi instalado nem executado. Onde a fonte não confirmou, está escrito "não confirmado".

Já instalados (ponto de comparação): plugin oficial `frontend-design` (direção estética, tipografia, anti-template) e a skill Impeccable v4.9.2 (somente arquivos de skill; sem o hook de design e sem o binário do motor). O Impeccable cobre comandos de direção (`bolder`, `quieter`, `distill`, `colorize`, `typeset`, `layout`, `animate`, `delight`), revisão (`critique`, `audit`), acabamento (`polish`, `harden`, `clarify`, `adapt`, `optimize`, `onboard`) e planejamento (`shape`, `init` -> `PRODUCT.md`, `document` -> `DESIGN.md`).

---

## 1. Skills e plugins de design

### 1.1 21st.dev Claude Code Plugin + 21st MCP (ex-"Magic")

| Item | Achado |
|---|---|
| O que é | Plugin que empacota skills do CLI da 21st e o servidor MCP remoto da 21st (catálogo de componentes React/shadcn, temas, logos SVG e geração de UI por IA). |
| Links | https://github.com/21st-dev/claude-code-plugin · https://21st.dev/mcp · https://github.com/21st-dev/magic-mcp |
| Mantenedor | Organização 21st-dev (empresa). |
| Última atividade | Plugin: criado em 2026-07-03, último push 2026-09-09, 24 estrelas, 7 commits. `magic-mcp`: último push 2026-09-09, ~6,6 mil estrelas. |
| Licença | Plugin: Apache-2.0. `magic-mcp`: ISC. O serviço em si é proprietário. |
| Instalação | `export API_KEY_21ST="sk_..."`, depois `/plugin marketplace add 21st-dev/claude-code-plugin` e `/plugin install 21st@21st`. Alternativa só MCP: `npx @21st-dev/cli@latest init --client claude` (imprime a config; `--write` grava em disco). |
| O que executa | Sem hooks e sem binários no plugin. Registra um servidor MCP HTTP remoto (`https://21st.dev/api/mcp`) e skills (`21st-cli-use`, `21st-ai`, `21st-registry`, `21st-design-sync`; o README diz "sete", o layout lista quatro). As skills ensinam o Claude a rodar `npx @21st-dev/cli`, ou seja, código baixado do npm sob demanda. |
| Chave de API | **Sim, obrigatória** (`API_KEY_21ST`, enviada no header `x-api-key`). A chave é gratuita de gerar em 21st.dev/mcp. Chaves antigas do "Magic" foram zeradas e não funcionam mais. |
| Plano gratuito | Free (US$ 0): navegação e busca de metadados ilimitadas, busca de logos ilimitada, **2 cópias/instalações/recuperações de código por dia** (somadas entre web, CLI e MCP). `generate` (IA) exige assinatura com créditos. Builder: US$ 6/mês (anual) ou US$ 8/mês (trimestral), recuperação ilimitada, sem créditos de IA. Builder + AI: a partir de US$ 15/mês (500 créditos). |
| O que envia para fora | A chave em toda requisição; consultas de busca; pedidos de componente; **prompts de geração** (descrição do que você quer construir); e, se usar `21st-design-sync`/`21st-registry`, **publica tokens de design/componentes do projeto** na 21st. A documentação pública não descreve retenção nem política de uso desses dados ("não confirmado"). |
| Sobreposição | Baixa com `frontend-design`/Impeccable (aquelas são orientação; esta é catálogo + geração remota). Sobrepõe-se ao próprio registro do shadcn/ui, que já entrega os componentes de graça e localmente. |
| **Veredito** | **Descartar.** App privado de duas pessoas não justifica chave de terceiro, limite de 2 recuperações/dia, envio de prompts para fora e skills capazes de publicar tokens do projeto. O shadcn CLI cobre a necessidade de componentes. |

Observação: "Magic MCP" foi renomeado para "21st MCP"; o pacote `@21st-dev/magic` continua existindo apenas como proxy de compatibilidade que repassa todas as mensagens MCP ao servidor novo.

### 1.2 UI UX Pro Max

| Item | Achado |
|---|---|
| O que é | Skill com banco de dados local pesquisável: 80 estilos, 194 paletas, 74 pares de fontes, 25 tipos de gráfico, 22 stacks (inclui Next.js, Tailwind, shadcn/ui), 130 diretrizes de UX, 194 regras de raciocínio. |
| Link | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| Mantenedor | Conta `nextlevelbuilder` (há divulgação de um nível "premium" pago no README). |
| Última atividade | Push em 2026-11-18 (dia da pesquisa); ~151 mil estrelas; plugin na versão 2.15.0. |
| Licença | MIT. |
| Instalação | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` + `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`; ou `npx ui-ux-pro-max-cli init --ai claude` (CLI `uipro`). |
| O que executa | `plugin.json` verificado: só `skills`, **sem hooks, sem MCP, sem comandos**. A skill manda rodar `search.py` (**exige Python 3.x**, só biblioteca padrão); o README afirma que os scripts não instalam nada e não fazem chamadas de rede. Flags `--persist`/`--preview` gravam arquivos no projeto (`design-system/<projeto>/MASTER.md`, `preview.html`). Sem chave de API. O comportamento de rede do instalador npm não está descrito ("não confirmado"). |
| Sobreposição | Alta. Paletas, tipografia e direção de estilo já são papel do `frontend-design`; diretrizes de UX, acessibilidade e auditoria já são papel do Impeccable. O diferencial é ser "catálogo de receitas", o que tende a puxar para estilos pré-prontos, o oposto do que o `frontend-design` pede. |
| **Veredito** | **Descartar.** Redundante com o que já está instalado, adiciona dependência de Python no Windows e um terceiro "dono" das decisões visuais (risco de instruções conflitantes e de gasto de contexto). |

### 1.3 Emil Kowalski — Design Engineering (skills)

| Item | Achado |
|---|---|
| O que é | Conjunto de 19 skills de engenharia de design, com foco em animação e polimento de interação: `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `choreograph`, `animation-performance`, `animation-vocabulary`, `gestures`, `mobile-native`, `break-ui`, `pick-ui-library`, `prototype`, `apple-design`, `learn-taste`, `ask-emil`, `ask-sonner`, `animate-expo`. |
| Link | https://github.com/emilkowalski/skills (o endereço `emilkowalski/skill` resolve para este repositório). |
| Mantenedor | Emil Kowalski (autor de Sonner e Vaul; segundo o README, baseado na experiência dele na Vercel e na Linear). |
| Última atividade | Push em 2026-11-15; ~58 mil estrelas; 69 commits. |
| Licença | MIT. |
| Instalação | `npx skills@latest add emilkowalski/skills` (o CLI `skills` é baixado do npm e executado; aceita `--skill <nome>` para instalar apenas uma). Como são só arquivos, também dá para copiar a pasta da skill manualmente para `.claude/skills/`. |
| O que executa | Árvore do repositório verificada (não truncada): **apenas Markdown**. Sem hooks, sem `.claude-plugin`, sem scripts, sem binários, sem `package.json`, sem chave de API. Há um arquivo `.pl` de 0 byte na raiz, inerte. |
| Sobreposição | Parcial com o `animate`/`polish` do Impeccable e com o `frontend-design`. Mas é mais profunda e específica em movimento (easing, duração, propriedades, performance, gestos, web mobile), exatamente a área de Motion for React em um app mobile-first. |
| **Veredito** | **Opcional (recomendado com escopo reduzido).** Instalar só `emil-design-eng` e, no máximo, `review-animations`, `gestures` e `mobile-native`. Não instalar as 19 (várias colidem com comandos do Impeccable, e `animate-expo`/`apple-design` não se aplicam). É a única das quatro que agrega algo sem executar nada na máquina. |

### 1.4 Taste Skill

| Item | Achado |
|---|---|
| O que é | Skill "anti-slop" (`design-taste-frontend`, tasteskill 2.5.1) para gerar **sites institucionais/landing pages**, com verificador em navegador real e "finish gate". |
| Link | https://github.com/Leonxlnx/taste-skill |
| Mantenedor | Leonxlnx (individual). |
| Última atividade | Push em 2026-11-08; ~118 mil estrelas; 321 commits. |
| Licença | MIT. |
| Instalação | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`; ou `/plugin marketplace add Leonxlnx/taste-skill` + `/plugin install taste-skill@taste-skill`; ou `./install.sh` a partir de um clone. |
| O que executa | **Bastante coisa.** (1) O frontmatter do `SKILL.md` registra um **hook `Stop`** com timeout de 600 s que procura e roda `gate.mjs --hook claude`. O hook está na própria skill, não no manifesto do plugin, então vem junto mesmo instalando "só os arquivos". (2) Scripts Node 22+ (`start.mjs`, `gate.mjs`, `shoot.mjs`, `perf.mjs`, `photos.mjs`, `icons.mjs`, `copy-lint.mjs`, `consistency.mjs`, etc.). (3) Abre **Chrome/Edge/Chromium headless** local. (4) **Rede**: baixa fotos (Wikimedia Commons/Unsplash), Google Fonts e ícones de marca. ffmpeg opcional. Sem chave de API. Suporte a Windows nativo não é declarado (o README só cita Git Bash para o link de instalação): "não confirmado". |
| Sobreposição | Mesmo território do `frontend-design` e do Impeccable (anti-genérico), porém com premissas incompatíveis com este projeto: referência desktop 1440x900, "uma seção por tela", entrada de hero obrigatória, fotos com crédito no rodapé, e **projetos Next.js viram `output: 'export'`** (exportação estática, sem rotas autenticadas nem recursos de servidor). |
| **Veredito** | **Descartar.** Feita para páginas públicas de marketing, não para um app autenticado mobile-first. Traz hook de Stop, scripts, navegador headless e downloads, que é justamente o tipo de execução evitado ao instalar o Impeccable sem hook/binário. |

### 1.5 Resumo da seção

Manter `frontend-design` + Impeccable como base. Único acréscimo que vale a pena: `emil-design-eng` (e poucas irmãs) para movimento. As outras três ou duplicam o que já existe, ou executam/enviam coisas demais para o porte do projeto.

---

## 2. Bibliotecas — versões estáveis atuais e compatibilidade

Versões lidas da dist-tag `latest` do npm em 2026-11-18.

| Pacote | Versão `latest` | Requisitos declarados |
|---|---|---|
| `next` | **16.4.6** | Node >= 20.9.0; peer `react`/`react-dom` `^18.2.0 \|\| ^19.0.0`; peer opcional `@playwright/test ^1.51.1` |
| `react` / `react-dom` | **19.3.1** | — |
| `tailwindcss` | **4.3.5** | sem `engines`; navegadores: Chrome 111+, Safari 16.4+, Firefox 128+ |
| `shadcn` (CLI) | **4.23.0** | Node >= 20.18.1 |
| `motion` | **14.14.0** | peer `react`/`react-dom` `^18.0.0 \|\| ^19.0.0`; MIT |
| `gsap` | **3.15.1** | licença "Standard no charge license" (proprietária) |
| `@supabase/supabase-js` | **2.119.1** | **Node >= 22.0.0** |
| `@supabase/ssr` | **0.12.7** | peer `@supabase/supabase-js ^2.114.0` |
| `@playwright/test` | **1.65.1** | Node >= 20 |
| `@axe-core/playwright` | **4.14.0** | peer `playwright-core >= 1.0.0`; `axe-core ~4.14.0`; MPL-2.0 |
| `@lhci/cli` | 0.16.1 | Node >= 22.19.0; usa `lighthouse` 13.6.0 |
| `@serwist/next` | 9.5.15 | peer `next >= 14`, `react >= 18` |

TypeScript: versão `latest` não consultada ("não confirmado"); o Next.js 16 exige TypeScript >= 5.1.0.

### 2.1 Compatibilidade entre si

- **Node 24** atende a todos os `engines` acima (o mais exigente é `@lhci/cli`, >= 22.19.0, seguido de `@supabase/supabase-js`, >= 22).
- **Next 16.4.6 + React 19.3.1**: dentro do intervalo de peer (`^19.0.0`). O App Router do Next 16 usa internamente um canal canary do React com os recursos do 19.2 (View Transitions, `useEffectEvent`, `Activity`).
- **Motion 14.14.0 + React 19**: dentro do intervalo de peer. Importar de `motion/react`. No App Router, usar `"use client"` no arquivo ou `import * as motion from "motion/react-client"` para Server Components. A página de instalação cita apenas "React 18.2+" no texto; o suporte a 19 vem do `peerDependencies`.
- **Tailwind 4.3.5 + Next 16**: o `create-next-app` já configura Tailwind. Mínimo Safari 16.4 coincide com o mínimo de navegadores do próprio Next 16 (Safari 16.4+) e com o mínimo de Web Push no iOS (16.4).
- **shadcn CLI 4.23.0**: `npx shadcn@latest init -t next` (ou `init` em projeto existente). Suporta Tailwind v4 e React 19.
- **`@supabase/ssr` 0.12.7 + `@supabase/supabase-js` 2.119.1**: 2.119.1 satisfaz o peer `^2.114.0`. Instalar os dois juntos e não fixar um `supabase-js` anterior a 2.114.
- **Playwright 1.65.1 + `@axe-core/playwright` 4.14.0**: compatíveis (peer `playwright-core >= 1.0.0`). Playwright 1.65.1 também satisfaz o peer opcional do Next (`^1.51.1`).

### 2.2 Mudanças recentes que quebram coisas

**Next.js 16** (guia oficial de upgrade, atualizado em 2026-11-18):

- **`middleware.ts` -> `proxy.ts`**, com a função exportada `proxy`. O `proxy` roda só em runtime `nodejs` (sem `edge`). Impacto direto no Supabase: a renovação de sessão passa a morar em `proxy.ts`. Tutoriais antigos com `middleware.ts` estão desatualizados para Next 16; inversamente, em Next 15 ou anterior o `proxy.ts` nunca é chamado.
- **APIs de requisição somente assíncronas**: `cookies()`, `headers()`, `draftMode()`, `params` e `searchParams` exigem `await`; o acesso síncrono foi removido. Usar `npx next typegen` e os tipos `PageProps`/`LayoutProps`.
- **Turbopack é o padrão** em `next dev` e `next build`. Um `webpack` customizado no config (inclusive vindo de plugin) **faz o build falhar**, a menos que se use `--webpack`. Afeta plugins de PWA baseados em webpack (ver seção 5).
- **`next lint` removido**; `next build` não roda mais lint. Usar o ESLint CLI (flat config; `eslint-config-next@16` exige ESLint 9+) ou Biome.
- `revalidateTag` exige segundo argumento (perfil de `cacheLife`); novos `updateTag` e `refresh` para Server Actions.
- `next/image`: `images.qualities` padrão virou `[75]`; `minimumCacheTTL` padrão virou 4 h; `16` saiu de `imageSizes`; imagens locais com query string exigem `images.localPatterns`; `images.domains` está depreciado (usar `remotePatterns`, por exemplo para capas de jogos em hosts externos).
- Rotas paralelas exigem `default.js` explícito.
- `serverRuntimeConfig`/`publicRuntimeConfig`, AMP e flags experimentais de PPR removidos (PPR agora via `cacheComponents`).
- `scroll-behavior: smooth` não é mais sobrescrito nas navegações (opt-in via `data-scroll-behavior="smooth"` no `<html>`).
- `next dev` grava em `.next/dev` e usa lockfile (dev e build podem rodar em paralelo).

**shadcn/ui** (changelog oficial):

- **Jul/2026: Base UI passou a ser a base padrão** no lugar do Radix. Radix continua suportado (opção `--base` no `init`). Exemplos e respostas de IA baseados em Radix podem não bater com o código gerado. Decidir a base no `init` e não misturar.
- Fev/2026: pacote unificado `radix-ui` (substitui os vários `@radix-ui/react-*`).
- Mar/2026: shadcn/cli v4. Dez/2025: `npx shadcn create`.
- Set/2026: pacote `cn` substitui o helper `clsx` + `tailwind-merge` (`shadcn migrate cn`); projetos existentes continuam funcionando.
- Uso de `tw-animate-css` no lugar de `tailwindcss-animate` com Tailwind v4: "não confirmado" nesta pesquisa (a página de instalação consultada não trata disso).

**Tailwind CSS v4**:

- Configuração CSS-first (`@import "tailwindcss"`, `@theme`); não foi pensado para Sass/Less/Stylus.
- CSS Modules funcionam, mas são desaconselhados (`@apply` em módulos exige `@reference`).
- Mínimos de navegador mais altos que os do v3: Chrome 111, Safari 16.4, Firefox 128.

**Supabase**:

- **Chaves**: a documentação atual usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`) e chave secreta (`sb_secret_...`). As chaves legadas `anon` e `service_role` (JWT) estão sendo **depreciadas "até o fim de 2026"**. Começar projeto novo já com publishable/secret. Se projetos novos ainda recebem as chaves legadas: "não confirmado".
- **Validação no servidor**: usar `supabase.auth.getClaims()` (verifica a assinatura do JWT) para proteger páginas e dados. `getUser()` faz chamada de rede ao servidor de Auth. `getSession()` **não** deve ser usado para autorização em código de servidor.
- **Cookies**: `@supabase/ssr` usa apenas `getAll`/`setAll`. `setAll` também recebe headers de cache (`Cache-Control`, `Expires`, `Pragma`) que precisam ser aplicados à resposta. No `proxy.ts`, retornar exatamente a resposta construída pelo `setAll`. Criar um cliente de servidor novo por requisição.
- Refresh tokens são de uso único: renovar em dois lugares pode disparar detecção de reuso e deslogar o usuário.
- `@supabase/supabase-js` atual exige Node >= 22 (atenção à versão de Node do host de deploy).

**Motion**: o pacote se chama `motion` e o import é `motion/react` (não mais `framer-motion`).

**GSAP — licença atual**: gratuito, inclusive para uso comercial, com **todos os plugins incluídos** (SplitText, MorphSVG e os antigos "Club"). **Não é open source/MIT**: é licença proprietária da Webflow ("Standard no charge license"), que proíbe uso em ferramentas visuais no-code de animação concorrentes da Webflow, pode ser alterada pela Webflow e pode ser rescindida em caso de violação. Para este app o uso seria permitido, mas Motion (MIT) já cobre o necessário.

### 2.3 Conjunto recomendado

`next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`, `tailwindcss@4.3.5`, `shadcn@4.23.0` (via `npx shadcn@latest`), `motion@14.14.0`, `@supabase/supabase-js@2.119.1`, `@supabase/ssr@0.12.7`, `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.0`. GSAP: não instalar agora.

---

## 3. Acessibilidade e regressão visual

### 3.1 `@axe-core/playwright` (4.14.0, Deque, MPL-2.0)

Roda o axe-core dentro das páginas dos testes Playwright (`new AxeBuilder({ page }).analyze()`). Detecta só a parte automatizável de WCAG (contraste, nomes acessíveis, ARIA, labels); não substitui teste manual de teclado e leitor de tela. Sem serviço externo, sem chave. **Usar.**

### 3.2 `toHaveScreenshot` (nativo do Playwright)

- Baselines ficam em `<arquivo>.spec.ts-snapshots/`, com nome que inclui **projeto/navegador e plataforma** (ex.: `chromium-win32`). Devem ser commitadas.
- A renderização varia por SO, versão, fontes, hardware e modo headless: a doc recomenda gerar e comparar **sempre no mesmo ambiente**. Baselines geradas no Windows 11 não servem para um CI Linux (seriam `-linux`). Para este projeto: rodar a regressão visual só localmente no Windows, ou só em CI Linux (gerando as baselines lá, por exemplo via imagem Docker do Playwright), nunca misturar.
- Opções úteis: `threshold` (padrão 0,2), `maxDiffPixels`, `stylePath` (CSS para esconder elementos voláteis). Mover o mouse para posição neutra antes da captura. Atualização: `npx playwright test --update-snapshots`. (`maxDiffPixelRatio`, `animations` e `mask` não constavam na página consultada: "não confirmado" aqui.)
- Com Motion: usar `reducedMotion: 'reduce'` no contexto de teste e respeitar `prefers-reduced-motion` no app, para capturas estáveis.
- **Usar**, em poucas telas-chave e em viewports mobile.

### 3.3 Lighthouse CI (`@lhci/cli` 0.16.1)

Ativo (push em 2026-11-17, não arquivado), Lighthouse 13.6.0, Node >= 22.19. Mede performance, acessibilidade, boas práticas e SEO com orçamentos. Porém a auditoria de acessibilidade do Lighthouse usa o próprio axe (subconjunto), SEO é irrelevante em app privado atrás de login, e auditar páginas autenticadas exige script de login extra. **Descartar por ora**; rodar o Lighthouse manualmente no DevTools do Chrome quando houver dúvida de performance.

### 3.4 Alternativas

- Serviços de regressão visual hospedados (Chromatic, Percy, Argos): resolvem a diferença entre sistemas operacionais, mas adicionam conta, upload de screenshots e limites de plano. Planos e preços atuais: "não confirmado". Desnecessários para duas pessoas.
- `eslint-plugin-jsx-a11y`: verificação estática barata de acessibilidade em JSX. Versão atual e compatibilidade com ESLint 9/10 flat config: "não confirmado". Opcional.
- Storybook com addon de a11y: só faz sentido se o projeto adotar Storybook, o que não é o caso.

### 3.5 Conjunto mínimo recomendado

1. `@playwright/test` com projetos mobile (um Chromium tipo Pixel e um WebKit tipo iPhone).
2. `@axe-core/playwright` em um teste por rota principal (falha em violações `serious`/`critical`).
3. `toHaveScreenshot` em 3 a 5 telas-chave, baselines commitadas, um único ambiente.
4. Checagem manual: navegação por teclado e VoiceOver/TalkBack nas telas principais, uma vez por marco.

---

## 4. Supabase

### 4.1 Limites do Free Tier (página de preços, 2026-11-18)

| Recurso | Limite Free |
|---|---|
| Banco de dados | 500 MB por projeto (CPU compartilhada, 500 MB de RAM) |
| Storage de arquivos | 1 GB; upload máximo de 50 MB por arquivo |
| Egress | 5 GB + 5 GB de egress em cache |
| Usuários ativos mensais (MAU) | 50.000 |
| Projetos gratuitos | 2 ativos por organização (projetos pausados não contam) |
| Edge Functions | 500.000 invocações/mês |
| Realtime | 200 conexões simultâneas; 2 milhões de mensagens/mês; 256 KB por mensagem |
| Backups | **sem backups automáticos**, sem PITR |
| Retenção de logs | 1 dia |

Para duas pessoas, todos os limites sobram. Os riscos reais são a pausa por inatividade e a ausência de backup.

### 4.2 Pausa por inatividade

- Projetos Free com **baixa atividade no banco ao longo de 7 dias** podem ser pausados. O dono recebe e-mail de aviso antes e de confirmação depois.
- Restauração: a doc atual de pausa diz **até 1 ano** após a pausa, pelo Dashboard ("Resume project"). Um changelog de 2024 falava em 90 dias; fontes divergem, então trate 90 dias como prazo seguro.
- Como evitar, segundo a doc: "algumas requisições de usuário ao banco por dia tipicamente bastam"; contam visitas ao projeto no Dashboard, chamadas de API e requisições de um app conectado. Plano pago nunca pausa.
- Prática: se o casal usar o app toda semana, não pausa. Como garantia, um job agendado (ex.: GitHub Actions `schedule` ou cron do host) fazendo um `select` leve por dia pela API. A doc não endossa formalmente keep-alive por cron ("não confirmado" como garantia oficial), mas é coerente com o critério descrito.
- **Backup**: como o Free não tem backup automático, agendar um dump periódico (`pg_dump`/`supabase db dump`) para armazenamento próprio.

### 4.3 Before User Created Hook

- **Disponível no Free**: a página de Auth Hooks lista "Before User Created" em "Free, Pro" (junto com Custom Access Token, Send SMS e Send Email). Só os hooks de verificação de MFA e de senha são restritos a Teams/Enterprise. Se está em beta ou GA: "não confirmado" (a página não informa).
- **Funcionamento**: roda antes de o usuário ser gravado em `auth.users`. Recebe JSON com `metadata` (`uuid`, `time`, `ip_address`, `name`) e `user` (o registro pendente, com `email` e `app_metadata.provider`). Para permitir: retornar `{}`. Para bloquear: retornar `{"error": {"http_code": 400, "message": "..."}}`; a mensagem volta ao cliente.
- **Implementação**: função Postgres (`jsonb -> jsonb`, timeout de 2 s) ou HTTP/Edge Function (timeout de 5 s, verificação de assinatura Standard Webhooks). Para este caso, função Postgres é o mais simples.
- **Google OAuth**: a doc indica que o hook roda em cadastros por fluxo OAuth e pode inspecionar `app_metadata.provider`, mas não cita o Google nominalmente. **Validar no projeto** tentando entrar com uma terceira conta Google.
- **Restrição a e-mails autorizados** (esboço):

```sql
create table public.emails_autorizados (email text primary key);
alter table public.emails_autorizados enable row level security; -- sem policies: invisível pela API
grant select on public.emails_autorizados to supabase_auth_admin;
revoke all on public.emails_autorizados from anon, authenticated, public;

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.emails_autorizados
    where email = lower(event->'user'->>'email')
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error',
    jsonb_build_object('http_code', 403, 'message', 'Cadastro não autorizado.'));
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_before_user_created(jsonb) from authenticated, anon, public;
```

  Recomendações da doc: **não** usar `security definer` na função do hook; conceder acesso explícito a `supabase_auth_admin` (inclusive uma policy de RLS para esse papel se a tabela consultada tiver RLS e a leitura falhar); versionar como migration; ativar o hook em Authentication > Hooks. Os dois e-mails entram na tabela pelo SQL Editor ou por seed fora do repositório, não no código.
- Alternativa complementar: desativar novos cadastros no painel de Auth depois que as duas contas existirem. A existência atual dessa opção no Dashboard não foi verificada nesta pesquisa ("não confirmado").

### 4.4 RLS para uma lista de dois membros

O hook é a primeira barreira; a RLS é a que de fato protege os dados e deve funcionar sozinha, mesmo que uma terceira conta consiga existir.

1. **Tabela de membros** com `user_id uuid primary key references auth.users(id)`, populada manualmente ou por trigger pós-cadastro a partir de `emails_autorizados`. Sem policies de escrita para `authenticated`.
2. **Função auxiliar em schema não exposto** (ex.: `private.is_member()`), `security definer`, `set search_path = ''`, nomes qualificados por schema, verificando `exists (select 1 from public.membros where user_id = (select auth.uid()))`. Evita recursão de policies e repetição.
3. **Policies por operação** (uma para `select`, uma para `insert`, uma para `update`, uma para `delete`; evitar `for all`), sempre com `to authenticated` e `using ((select private.is_member()))`. Em `insert`/`update`, incluir `with check` (membro, e `criado_por = (select auth.uid())` onde houver autoria). Toda policy de `update` precisa de uma de `select` correspondente.
4. **RLS habilitada em todas as tabelas** do schema exposto; revogar privilégios padrão de `anon` (o app não tem conteúdo público) e conceder a `authenticated` só o necessário.
5. Envolver `auth.uid()`/`auth.jwt()` em `(select ...)` para cache por statement; indexar as colunas usadas nas policies.
6. **Não** autorizar com base em `user_metadata` (editável pelo usuário) nem em e-mail vindo do cliente. Se usar claims, apenas `app_metadata`.
7. Views com `security_invoker = true`.
8. Chave secreta (`sb_secret_...`) só no servidor e apenas para tarefas administrativas; o caminho normal do app usa a sessão do usuário, sujeita à RLS.
9. Testes: pgTAP (`supabase test db`) cobrindo "membro vê", "autenticado não membro não vê" e "anon não vê"; mais um teste Playwright com uma conta não autorizada, se viável.

Modelagem: com dois membros e uma única biblioteca compartilhada, não é preciso tabela de "casais/grupos"; "é membro" basta. Se houver chance de reaproveitar o app para outros pares, introduzir `grupo_id` desde o início sai mais barato que migrar depois.

---

## 5. PWA em Next.js App Router

### 5.1 Abordagem recomendada hoje (guia oficial, atualizado em 2026-07-30)

1. **Manifest nativo**: `app/manifest.ts` (ou `manifest.json`) com `name`, `short_name`, `start_url`, `display: 'standalone'`, `theme_color`, `background_color` e ícones 192 e 512 px. Sem biblioteca.
2. **Instalabilidade**: manifest válido + HTTPS. Não é necessário service worker nem suporte offline para o app ser instalável.
3. **Service worker manual, só se precisar**: o guia oficial escreve o SW à mão (para Web Push) e o registra com `navigator.serviceWorker.register(..., { scope: '/', updateViaCache: 'none' })`, com headers `Cache-Control: no-cache, no-store, must-revalidate` e CSP estrita para o arquivo do SW.
4. **Offline**: o Next tem um hook experimental `useOffline` (`experimental.useOffline`) para UI sensível a conectividade e reenvio de navegações/Server Actions. Para cache offline completo, a doc aponta o **Serwist**.
5. **Serwist**: com Next 16 (Turbopack padrão) usar **`@serwist/turbopack`** + `serwist` + `esbuild`: `withSerwist` no config, route handler `app/serwist/[path]/route.ts` com `createSerwistRoute`, `app/sw.ts` e `SerwistProvider` no layout (`swUrl="/serwist/sw.js"`). O `@serwist/next` (9.5.15) é o caminho **webpack** e exigiria `next build --webpack`, já que um config webpack faz o build com Turbopack falhar. Estabilidade do `@serwist/turbopack` (experimental ou estável) e sua versão atual: "não confirmado".
6. **Teste local**: `next dev --experimental-https`.

**Recomendação para este projeto**: fase 1 com manifest nativo + ícones + metadados Apple, **sem service worker**. O app depende de Supabase online e autenticação; cache offline de páginas autenticadas traz risco de dados velhos e de sessão. Adicionar SW manual apenas se quiser Web Push; adotar Serwist só se surgir requisito real de offline.

### 5.2 Limitações no iOS Safari

- **Sem `beforeinstallprompt`**: não há prompt de instalação programático; a instalação é manual (Compartilhar > Adicionar à Tela de Início). O próprio guia do Next recomenda um componente com instruções para iOS e desaconselha depender de `beforeinstallprompt`.
- **Web Push só em app instalado** na Tela de Início (iOS/iPadOS 16.4+), com manifest `display: standalone` ou `fullscreen`, e o pedido de permissão precisa partir de gesto direto do usuário. Badging (`setAppBadge`) funciona, mas o emblema só aparece com permissão de notificação.
- **Armazenamento**: por padrão é "best-effort" e pode ser removido por pressão de armazenamento ou falta de uso (ITP). `navigator.storage.persist()` pode ser concedido por heurística, e ser Home Screen Web App conta a favor. Cota por origem de até 60% do disco, igual em Safari e em app standalone (Safari 17+). Regra de expiração em 7 dias do ITP e sua isenção para apps instalados: "não confirmado" nesta pesquisa.
- **Armazenamento separado entre Safari e o app instalado** (fonte secundária): o login feito no Safari não vale para o app da Tela de Início; cada pessoa terá de logar de novo dentro do app instalado. **Testar o fluxo de Google OAuth dentro do app standalone no iPhone logo no início**: o redirecionamento OAuth em modo standalone é ponto historicamente problemático no iOS e seu comportamento atual é "não confirmado".
- **Sem Background Sync, Periodic Background Sync e Background Fetch** (fonte secundária).
- **iOS 26**: sites adicionados à Tela de Início passam a abrir como web app por padrão, mesmo sem manifest, com um seletor "Abrir como Web App" (fontes secundárias; não verificado em fonte Apple/WebKit).
- Outros navegadores no iOS usam WebKit; as mesmas limitações valem.
- Ícone: fornecer `apple-icon` (`app/apple-icon.png`); splash screens por dispositivo via `apple-touch-startup-image` são opcionais.

---

## 6. Tabela final de decisões

| Ferramenta | Decisão | Motivo |
|---|---|---|
| `frontend-design` (plugin oficial) | Manter | Base de direção estética; já instalado. |
| Impeccable 4.9.2 (só skill) | Manter | Crítica, auditoria e polimento; sem hook/binário. |
| 21st.dev plugin + 21st MCP (Magic) | Descartar | Exige chave; Free limita a 2 recuperações/dia; envia prompts e pode publicar tokens; shadcn já cobre. |
| UI UX Pro Max | Descartar | Redundante com as duas skills instaladas; exige Python; catálogo de estilos prontos. |
| Emil Kowalski `emil-design-eng` | Opcional (recomendado) | Só Markdown, MIT, ativo; aprofunda movimento/gestos para Motion. Instalar 1 a 4 skills, não as 19. |
| Taste Skill | Descartar | Voltada a landing pages; hook de Stop, scripts Node, Chrome headless e downloads; força export estático. |
| Next.js 16.4.6 (App Router) | Usar | Estável atual; atenção a `proxy.ts`, APIs assíncronas e Turbopack padrão. |
| React 19.3.1 | Usar | Dentro do peer do Next 16 e do Motion. |
| Tailwind CSS 4.3.5 | Usar | Configuração CSS-first; mínimos de navegador compatíveis com o alvo. |
| shadcn/ui (CLI 4.23.0) | Usar | Escolher a base (Base UI é o padrão desde jul/2026) no `init` e não misturar. |
| Motion 14.14.0 | Usar | MIT; `motion/react`; compatível com React 19. |
| GSAP 3.15.1 | Descartar por ora | Gratuito, porém licença proprietária Webflow; Motion basta. |
| `@supabase/supabase-js` 2.119.1 + `@supabase/ssr` 0.12.7 | Usar | Par compatível; chaves publishable/secret; `getClaims()`; `proxy.ts`. |
| Supabase Free Tier | Usar | Limites sobram; mitigar pausa (7 dias) e falta de backup. |
| Before User Created Hook | Usar | Disponível no Free; função Postgres com lista de e-mails; validar com Google OAuth. |
| RLS com tabela de membros | Usar | Barreira real dos dados; independente do hook. |
| Playwright 1.65.1 | Usar | E2E em viewports mobile (Chromium + WebKit). |
| `@axe-core/playwright` 4.14.0 | Usar | A11y automatizada sem serviço externo. |
| `toHaveScreenshot` | Usar (poucas telas) | Nativo; baselines em um único ambiente/SO. |
| Lighthouse CI 0.16.1 | Descartar por ora | A11y duplicada pelo axe; SEO irrelevante; exige script de login. Lighthouse manual basta. |
| Chromatic/Percy/Argos | Descartar | Serviço externo desnecessário para duas pessoas. |
| `eslint-plugin-jsx-a11y` | Opcional | Barato; compatibilidade atual não confirmada. |
| Manifest nativo (`app/manifest.ts`) | Usar | Instalável sem dependências. |
| Service worker manual | Opcional | Só se quiser Web Push. |
| Serwist (`@serwist/turbopack`) | Descartar por ora | Offline não é requisito; cache de páginas autenticadas traz risco. |

---

## Fontes

- npm registry (`/latest`): next, react, tailwindcss, shadcn, motion, gsap, @supabase/supabase-js, @supabase/ssr, @playwright/test, @axe-core/playwright, @lhci/cli, @serwist/next
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/docs/app/guides/progressive-web-apps
- https://ui.shadcn.com/docs/changelog · https://ui.shadcn.com/docs/installation/next
- https://tailwindcss.com/docs/compatibility
- https://motion.dev/docs/react-installation
- https://gsap.com/community/standard-license/
- https://supabase.com/pricing
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://supabase.com/docs/guides/auth/auth-hooks
- https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook
- https://supabase.com/docs/guides/auth/server-side/nextjs
- https://supabase.com/docs/guides/api/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://playwright.dev/docs/test-snapshots
- https://serwist.pages.dev/docs/next/getting-started · https://serwist.pages.dev/docs/next/turbo
- https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- https://webkit.org/blog/14403/updates-to-storage-policy/
- https://github.com/21st-dev/claude-code-plugin · https://github.com/21st-dev/magic-mcp · https://21st.dev/mcp · https://21st.dev/llms.txt · https://21st.dev/pricing
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- https://github.com/emilkowalski/skills
- https://github.com/Leonxlnx/taste-skill
- https://github.com/pbakaus/impeccable
- https://github.com/GoogleChrome/lighthouse-ci
- Fontes secundárias para iOS (não primárias): firt.dev/notes/pwa-ios, magicbell.com, fóruns MacRumors
