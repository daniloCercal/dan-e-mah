# Plano de implementação — Dan & Mah

Versão 1.0 para aprovação, 18/11/2026. Cada etapa termina com algo que você consegue abrir e conferir. Nenhuma etapa começa antes de a anterior estar verificada.

## Onde o código fica

O site definitivo nasce em `D:\projetos\jogos-em-dupla\app` (pasta nova). O protótipo em `prototypes\design-lab` fica intacto como referência visual; as telas são portadas dele, não reescritas do zero.

## Etapas

| # | Etapa | O que fica pronto | Como é verificado |
|---|---|---|---|
| 0 | **Base** | Projeto Next.js, TypeScript estrito, CSS e fontes do protótipo, ícones, tema claro e escuro, casca com navegação | Site abre em `localhost:3000` com a casca igual ao protótipo; capturas comparadas |
| 1 | **Banco** | Migrations do modelo de dados, RLS, tags iniciais, depósitos de arquivos | "Advisors" de segurança do Supabase sem alertas; testes de RLS por papel (visitante, não sócio, sócio) |
| 2 | **Login** | Entrar com Google, hook que recusa outros e-mails, e-mail e senha desligado, `proxy.ts`, telas de entrada e de "sem acesso", sair | Vocês dois entram; uma terceira conta Google é recusada e não aparece na lista de usuários; teste automático de acesso negado |
| 3 | **Biblioteca** | Lista real em grade e lista, busca, ordenação, estados de carregamento e vazio | Biblioteca vazia mostra o convite; com jogos, igual ao protótipo |
| 4 | **Adicionar jogo** | Busca na IGDB pelo servidor, importação, duplicatas, cadastro manual com capa e links de loja | Adicionar por busca e à mão; tentar adicionar duas vezes; simular falha da IGDB |
| 5 | **Página do jogo e estados** | Três estados, editar, arquivar, remover com desfazer, links de loja | Um sócio não consegue mudar o estado do outro (teste automático) |
| 6 | **Filtros e tags** | Painel de filtros, E/OU, chips, contador, tags próprias, atalhos salvos, filtros no endereço | Combinações de filtros conferidas contra consultas diretas ao banco |
| 7 | **Notas** | Avaliar, editar, média e diferença, "um jogo, duas opiniões", nota às cegas (se aprovada) | Média só aparece com duas notas; um não altera a nota do outro |
| 8 | **Nós dois queremos e sorteio** | Match, fila e pacote, filtros do sorteio | Sorteio só usa jogos elegíveis; resultado decidido antes da animação |
| 9 | **Perfil e preferências** | Foto, nome, apelidos, tema, papel de parede, exportar tudo | Foto aparece para o outro sócio; exportação abre e contém tudo |
| 10 | **Instalar no celular** | Manifesto, ícones, tela cheia, tarefa diária que mantém o banco ativo | Instalação testada em Android e iPhone; login dentro do app instalado |
| 11 | **Qualidade** | Testes de ponta a ponta, acessibilidade (axe), capturas em 375, 768 e 1440 px nos dois temas, revisão de segurança | Relatório com o que passou e o que ficou pendente |
| 12 | **Publicar** | GitHub (repositório privado), Vercel, variáveis de produção, endereço de retorno do Google atualizado | **Só com a sua autorização explícita** |

Depois do MVP, em ordem: diário de sessões e "zeramos juntos", estatísticas da dupla, Steam, coleções e retrospectiva.

O diário e as estatísticas já têm tela no protótipo e tabelas no modelo de dados; ficam fora do MVP só pela ordem combinada no início. Se preferir, entram junto: são as etapas mais baratas.

## Regras de trabalho durante a construção

- **Banco:** toda mudança de esquema vira arquivo de migration versionado no repositório. Se o projeto `mah-dev` for aprovado, as migrations são aplicadas e testadas nele primeiro e só depois no `mah`.
- **Segredos:** só em `.env.local` e nas variáveis da Vercel. Nunca no git, nunca no chat.
- **Git:** um commit por etapa verificada, numa branch de trabalho. Nada é enviado ao GitHub sem você pedir.
- **Testes:** escritos junto com cada etapa, não no fim. Os de autorização são obrigatórios nas etapas 1, 2, 5 e 7.
- **Visual:** qualquer diferença em relação ao protótipo aprovado é mostrada em captura antes de seguir.
- **Dados fictícios:** só no `mah-dev`. O `mah` começa vazio e recebe apenas o que vocês cadastrarem.

## O que preciso de você ao longo do caminho

| Quando | O quê |
|---|---|
| Agora | Aprovar a arquitetura e as sete decisões de `01-arquitetura.md` |
| Etapa 2 | Confirmar no painel do Google que os dois e-mails são usuários de teste; fazer o primeiro login de cada um |
| Etapa 10 | Testar a instalação nos dois celulares |
| Etapa 12 | Conectar GitHub e Vercel e autorizar a publicação |

## Riscos e o que faço se acontecerem

| Risco | Sinal | Plano |
|---|---|---|
| Hook de cadastro não bloquear como esperado | Conta estranha aparece na lista de usuários no teste da etapa 2 | Parar e corrigir antes de qualquer dado real; o RLS já impediria leitura |
| Login com Google falhar dentro do app instalado no iPhone | Volta para o Safari ou não mantém a sessão | Ajustar o fluxo de retorno; em último caso, orientar o uso pelo Safari no iPhone |
| IGDB mudar campos ou sair do ar | Busca falha | Camada única de acesso, mensagem clara e cadastro manual |
| Diferença visual ao portar para o Next | Capturas diferentes do protótipo | Corrigir antes de avançar a etapa |
| Projeto Supabase pausar | Site sem dados | Tarefa diária de atividade; reativação manual pelo painel se necessário |
