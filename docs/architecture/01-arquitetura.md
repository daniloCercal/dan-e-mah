# Arquitetura — Dan & Mah

Versão 1.0 para aprovação, 18/11/2026. Substitui a recomendação preliminar (`00-recomendacao-tecnica-preliminar.md`). Modelo de dados em `02-modelo-de-dados.md`; plano de construção em `03-plano-de-implementacao.md`.

## Resumo em uma tela

- **O que é construído:** um site Next.js, instalável no celular (PWA), hospedado na Vercel, com banco e login no Supabase (projeto `mah`, região Ohio).
- **Quem entra:** só os dois Gmails de vocês, com "Entrar com Google". Três barreiras independentes garantem isso; nenhuma depende do navegador.
- **De onde vêm os jogos:** busca na IGDB feita pelo servidor; os dados do jogo são copiados para o nosso banco na hora de adicionar. Cadastro manual sempre disponível.
- **O visual:** o protótipo aprovado vira o site. O CSS do protótipo é reaproveitado como está.
- **Custo:** zero. Tudo cabe nos planos gratuitos.

## Peças

| Peça | Escolha | Versão | Papel |
|---|---|---|---|
| Framework | Next.js, App Router | 16.4 | Páginas, rotas do servidor, ações |
| Interface | React | 19.3 | Componentes; `<ViewTransition>` para a capa que viaja |
| Linguagem | TypeScript estrito | — | |
| Animação | Motion for React | 14.14 | Sorteio, pacote, troca de aba |
| Estilo | CSS do protótipo (tokens em variáveis) | — | Ver "Decisões para aprovar", item 1 |
| Banco, login, arquivos | Supabase (Postgres 17, Auth, Storage) | supabase-js 2.119, ssr 0.12 | Dados, Google OAuth, capas e fotos |
| Catálogo | IGDB (Twitch) | v4 | Busca e metadados dos jogos |
| Hospedagem | Vercel, plano gratuito | — | Site e rotas do servidor |
| Testes | Playwright + axe | 1.65 / 4.14 | Fluxos, acessibilidade, capturas |

## Como uma página é servida

1. O pedido passa pelo `proxy.ts` do Next (o antigo "middleware"), que renova a sessão do Supabase guardada em cookie.
2. Sem sessão válida, a pessoa vai para `/entrar`.
3. Com sessão, o servidor confere a identidade com `getClaims()` (valida a assinatura do token) e se o usuário é um dos dois sócios.
4. A página é montada no servidor já com os dados, lidos com o cliente do Supabase que carrega o cookie da pessoa. O banco aplica as regras de acesso (RLS) em toda leitura.
5. Toda alteração (dar nota, adicionar jogo, registrar sessão) é uma ação do servidor: valida a entrada, confere a identidade de novo e grava. O banco aplica as regras outra vez.

O navegador nunca fala com a IGDB nem recebe chave secreta. A única chave que chega ao navegador é a "publishable" do Supabase, que sozinha não dá acesso a nada: sem sessão de sócio, o RLS devolve zero linhas.

## Login e as três barreiras

| # | Barreira | Onde fica | O que impede |
|---|---|---|---|
| 1 | **Hook "Before User Created"** | Supabase Auth, função no Postgres | A conta nem é criada se o e-mail não está na lista de dois. A documentação confirma que o hook roda também em login por Google |
| 2 | **RLS em todas as tabelas** | Postgres | Sem linha na tabela de sócios, nenhuma política libera leitura ou escrita |
| 3 | **Verificação no servidor** | `proxy.ts`, páginas e ações | Página e ação conferem identidade e condição de sócio antes de responder |

Configurações do projeto que acompanham:

- Provedor de e-mail e senha **desligado** (hoje está ligado por padrão). Só Google.
- Escopos do Google: apenas `openid`, `email`, `profile`.
- Lista de endereços de retorno restrita ao domínio do site e ao `localhost` de desenvolvimento.
- A chave secreta do Supabase **não é usada pelo site no MVP**. Tudo passa pela sessão da pessoa e pelo RLS. Ela só existirá nos testes automáticos (ver item 2 das decisões).

A lista dos dois e-mails fica numa tabela em um esquema que a API não expõe; ninguém a lê pelo navegador.

## Catálogo de jogos

- A busca ("Adicionar jogo") chama uma rota do nosso servidor, que consulta a IGDB com as credenciais da Twitch e devolve só o necessário: título, ano, estúdio, capa, gêneros, modos de jogo, identificador da Steam quando existir.
- O resultado é ordenado para trazer primeiro os jogos principais e conhecidos; o teste real mostrou que a ordem crua da IGDB coloca homônimos obscuros na frente.
- Ao adicionar, os metadados são **copiados para o nosso banco**. Abrir a biblioteca não consulta a IGDB. A IGDB autoriza guardar os dados.
- Gêneros e modos chegam em inglês e são traduzidos para as nossas categorias por uma tabela de correspondência no código. O que não tiver correspondência não é inventado: fica sem a tag.
- Capas: o site usa o endereço de imagem da IGDB. Só as capas enviadas à mão (cadastro manual) ocupam espaço no nosso Storage.
- Se a IGDB falhar: mensagem clara, "Tentar de novo" e "Cadastrar manualmente", como no protótipo.
- Link da Steam colado no cadastro manual: o servidor procura na IGDB pelo identificador da Steam e preenche. Não achou, não preenche.

## Arquivos (capas manuais e fotos de perfil)

- Dois depósitos privados no Supabase Storage: `capas` e `fotos`.
- A imagem é reduzida no navegador antes do envio (capa até 600 px de largura, foto 256 px), em WebP. Com isso, mil capas manuais ocupam cerca de 60 MB; o plano gratuito tem 1 GB.
- Políticas de acesso: só sócios leem; cada um só grava a própria foto; qualquer sócio grava capas.

## Preferências

Tema claro ou escuro, papel de parede, jeito de sortear, animações e apelidos passam a ser guardados no perfil da pessoa, para acompanharem celular e computador. O navegador mantém uma cópia para aplicar o tema antes de a página aparecer, sem piscar.

## Filtros e busca na biblioteca

A lista da biblioteca é carregada inteira, em formato leve (sem descrições), e filtrada no próprio aparelho, como no protótipo. Para duas pessoas e até alguns milhares de jogos isso é instantâneo e dispensa idas ao servidor a cada chip. Os filtros continuam no endereço da página. Se a biblioteca passar de cerca de 3 mil jogos, a filtragem migra para o banco, que já terá os índices para isso.

## Instalável no celular (PWA)

- Manifesto e ícones (os do rosto, já gerados). Abre em tela cheia.
- **Sem funcionamento offline** no MVP: sem conexão, aparece o aviso que já existe no protótipo. Guardar dados offline e sincronizar depois traria risco de conflito entre os dois aparelhos sem benefício claro.
- A testar em iPhone real: login com Google dentro do app instalado.

## Plano gratuito: dois cuidados

| Risco | Solução |
|---|---|
| O Supabase pausa projetos gratuitos após cerca de 7 dias com pouca atividade | Uma tarefa agendada na Vercel faz uma leitura mínima no banco uma vez por dia |
| O plano gratuito não tem backup automático | Botão "Exportar tudo" em Nós (JSON com jogos, notas, sessões, tags), que também serve de cópia de segurança. Entra no MVP |

## Steam (depois do MVP)

Desenhada no modelo de dados, mas não construída no MVP. Vincular a conta comprova a titularidade pelo login da própria Steam (OpenID); biblioteca, horas e conquistas só aparecem com perfil e "detalhes dos jogos" públicos. Horas da Steam nunca são mostradas como tempo jogado em dupla.

## Segurança: lista de verificação que a construção segue

- RLS ligado em todas as tabelas do esquema público, com políticas separadas para ler, inserir, alterar e apagar.
- Políticas de alteração sempre com `USING` e `WITH CHECK`; a condição de sócio vem de uma função em esquema não exposto, nunca de dados editáveis pelo usuário.
- Visões com `security_invoker`.
- Toda entrada validada no servidor (tipos, tamanhos, endereços só `https`).
- Redirecionamento depois do login só para caminhos internos.
- Nenhum segredo no repositório; `.env.local` fora do git; variáveis de produção só na Vercel.
- Limite de chamadas na rota de busca da IGDB, por pessoa.
- Testes automáticos de autorização: visitante sem sessão, conta que não é sócia, e um sócio tentando alterar a nota do outro.
- Consulta aos "advisors" de segurança do Supabase depois de cada mudança de esquema.

## Decisões para aprovar

| # | Decisão | Recomendação | Alternativa |
|---|---|---|---|
| 1 | **Estilo: manter o CSS do protótipo, sem Tailwind nem shadcn/ui** | Manter. O visual aprovado está em CSS próprio com tokens; reescrever em Tailwind e trocar componentes por shadcn arriscaria mudar o que você aprovou e não traria ganho para duas pessoas. Diverge da sua preferência inicial, por isso peço confirmação | Reescrever em Tailwind + shadcn (mais demorado, risco de diferenças visuais) |
| 2 | **Segundo projeto Supabase, `mah-dev`, para desenvolvimento e testes** | Criar. Evita que testes automáticos e experimentos mexam nos dados reais de vocês. Gratuito; seus dois projetos antigos estão pausados e não contam no limite | Usar só o `mah` e aceitar dados de teste misturados |
| 3 | **Preferências guardadas na conta** (tema, papel de parede etc.) | Sim | Só no aparelho, como no protótipo |
| 4 | **Nota às cegas** (a nota do outro só aparece depois da sua) | Incluir como interruptor em Nós, desligado por padrão | Deixar para depois |
| 5 | **Sem offline no MVP** | Sim | Offline com sincronização (complexo) |
| 6 | **"Exportar tudo" no MVP** | Sim, é o backup | Depois |
| 7 | **Domínio** | Começar no endereço gratuito da Vercel (`algo.vercel.app`) | Comprar um domínio próprio |

## O que muda em relação ao protótipo

Nada visual. O protótipo vira a base das telas; os dados fictícios e os interruptores "Só no protótipo" (conexão lenta, falha ao salvar, trocar de pessoa) saem. O que hoje é simulado passa a ser real: login, busca na IGDB, salvar, fotos, exportar.
