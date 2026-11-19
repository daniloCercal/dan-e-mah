# Recomendação técnica preliminar

Versão 0.1, 18/11/2026. É uma recomendação, não uma decisão: a arquitetura completa (modelo de dados, RLS, prova técnica da Steam) é a Fase 3 e só começa depois da aprovação visual. Detalhes e fontes em `docs/research/04-apis-catalogo-e-steam.md` e `docs/research/05-ferramentas.md`.

## Stack recomendada

Sua preferência inicial se confirma. Versões lidas do registro npm em 18/11/2026:

| Camada | Escolha | Versão | Observação |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.4 | `middleware.ts` virou `proxy.ts`; `cookies()` e `params` exigem `await`; Turbopack é o padrão |
| UI | React | 19.3 | `<ViewTransition>` estável: serve para a transição capa → detalhes |
| Linguagem | TypeScript estrito | — | |
| Estilo | Tailwind CSS | 4.3 | Tokens da direção aprovada viram variáveis CSS |
| Componentes | shadcn/ui (CLI) | 4.23 | Base UI é a base padrão desde jul/2026; escolher no `init` |
| Animação | Motion for React | 14.14 | Cobre o sorteio e as microinterações |
| Banco e login | Supabase (Postgres + Auth) | supabase-js 2.119, ssr 0.12 | Usar as chaves novas (publishable/secret); `anon`/`service_role` saem de uso até o fim de 2026 |
| Testes | Playwright + axe | 1.65 / 4.14 | `toHaveScreenshot` para regressão visual |
| Hospedagem | Vercel (plano gratuito) | — | A confirmar na Fase 3 |

**Descartado por ora:** GSAP (gratuito, mas licença proprietária da Webflow; Motion resolve), Lighthouse CI e Serwist (sem ganho para um app privado atrás de login), Realtime do Supabase (duas pessoas não precisam de sincronização ao vivo).

## Catálogo de jogos: IGDB

| | IGDB | RAWG |
|---|---|---|
| Custo | Gratuita para uso não comercial | Gratuita com atribuição |
| Limite | 4 requisições por segundo | Cota mensal |
| Guardar os dados (cache) | Autorizado explicitamente no FAQ | Termos não tratam do assunto |
| Cooperativo | Estruturado: local, on-line, tela dividida, nº de jogadores | Só tags |
| ID da Steam | Sim, por `external_games` | Parcial |
| Exigência | Chamadas só pelo servidor; conta Twitch Developer | Link para a RAWG em toda página |

Recomendo **IGDB**, chamada por uma rota do servidor, com os metadados gravados no nosso banco na hora de adicionar o jogo (uma consulta por jogo, nunca por visita). Complemento opcional: a página `appdetails` da loja Steam para descrição em português — é não oficial e sem limite documentado, então fica como enriquecimento que pode falhar sem quebrar nada. Cadastro manual cobre qualquer falha.

## Login e segurança

- Google OAuth pelo Supabase Auth, pedindo só identidade (sem Gmail, Drive ou outros escopos).
- Três barreiras, nenhuma no navegador:
  1. **Before User Created Hook** recusa a criação de conta para qualquer e-mail fora da lista de dois (disponível no plano gratuito; o comportamento com Google OAuth especificamente ainda precisa ser testado na Fase 3).
  2. **Tabela de membros** + **RLS em todas as tabelas**: sem linha em `members`, nenhuma política libera nada.
  3. **Verificação no servidor** em toda rota e ação (`getClaims()`), antes de tocar no banco.
- Chave secreta do Supabase, chave da IGDB e chave da Steam ficam só no servidor.

## Supabase gratuito: dois cuidados

- **Pausa após 7 dias de pouca atividade.** Prever um acesso diário agendado (cron gratuito da Vercel) para manter o projeto ativo.
- **Sem backup automático.** Prever exportação periódica (o recurso de exportar CSV/JSON do roadmap serve também para isso).

## Steam: o que esperar

| Recurso | Situação |
|---|---|
| Vincular a conta | Viável. OpenID comprova a titularidade e entrega só o SteamID |
| Biblioteca, horas, jogados recentemente, conquistas | **Condicionado**: exigem perfil e "detalhes dos jogos" públicos, e o padrão da Steam é privado. Perfil fechado devolve resposta vazia, não erro |
| Chave da Web API | Exige conta Steam não limitada (cerca de US$ 5 já gastos na loja) |
| Jogos de Steam Families na importação | Não confirmado |

Nada disso foi testado com chave real ainda; a prova técnica é item da Fase 3. A Steam fica fora do MVP e nenhum dado dela aparece nos protótipos.

## Celular

- PWA com o manifest nativo do Next.js, sem biblioteca extra.
- No iPhone não há aviso automático de instalação (a pessoa usa "Adicionar à Tela de Início"), e a sessão do Safari não vale no app instalado: o login precisa ser feito de novo lá dentro. O login com Google dentro do app instalado no iOS ainda precisa ser testado.

## Riscos principais

| Risco | Efeito | Como reduzir |
|---|---|---|
| Hook de cadastro não se comportar como esperado com Google | Conta de terceiro seria criada (sem acesso a dados, por causa do RLS) | Testar na Fase 3; o RLS é a barreira que não pode falhar |
| Perfis Steam privados | Importação vazia | Tela explicando como abrir a visibilidade; produto funciona sem Steam |
| Pausa do Supabase | Site fora do ar até reativar | Acesso diário agendado |
| IGDB mudar campos (já renomeou alguns) | Importação quebra | Camada única de acesso + cadastro manual |
| Login no PWA do iOS | Fricção ou falha ao entrar | Testar cedo em aparelho real |
