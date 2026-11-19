# 01 — Análise de concorrentes e referências

> Pesquisa feita em 18/11/2026 com busca e leitura direta das fontes. Onde uma informação não pôde ser verificada, está marcada como **não confirmado**.
> Contexto do produto: app web privado para duas pessoas (casal), uso majoritariamente mobile, notas individuais de 0 a 10 em passos de 0,5, comparação de notas, filtros por tags/gênero/humor, sorteio "o que vamos jogar hoje?" e vínculo opcional com Steam.

## Aviso sobre as fontes

- Boa parte das análises comparativas disponíveis em 2026 vem do site **Two Average Gamers**, cujo autor desenvolve um concorrente (SavePoint) e o promove nos próprios artigos. Os fatos verificáveis (preços, existência de app, statuses) foram aproveitados; os julgamentos de valor devem ser lidos com desconto. O relatório "State of Game Tracking 2026" do mesmo autor declara esse conflito de interesse e admite que as fatias de mercado são estimativas, não pesquisa direta.
- Reddit e ResetEra não puderam ser lidos diretamente nesta pesquisa. As reclamações citadas vêm de avaliações da App Store, do roadmap público do Backloggd (contagem de votos), de fóruns Steam, do Tildes e de reviews de terceiros.
- As páginas iniciais de Infinite Backlog e Grouvee não retornaram conteúdo legível (renderização por JavaScript ou bloqueio 403); o que consta sobre eles vem de fontes secundárias.

---

## 1. Backloggd (backloggd.com)

O líder de fato da categoria "Letterboxd para jogos". A home exibe 73,4 milhões de jogos marcados como jogados, 385 mil jogos, 44,2 milhões de notas e 875 mil listas ([home](https://backloggd.com/)).

| Dimensão | O que faz |
|---|---|
| **Organização da biblioteca** | Dois níveis de status. No nível do jogo, quatro alternâncias: *Played, Playing, Backlog, Wishlist*. No nível do registro (log), o tipo de "jogado": *Played, Completed, Abandoned, Retired, Shelved*. Cada log representa uma jogada (playthrough) e tem nota, review, plataforma e mídia próprias. Há ainda "Library Entries" para registrar posse por plataforma ([About](https://backloggd.com/about/)). |
| **Avaliação** | Estrelas; o roadmap lista "Star Customization" como entregue (v1.3.0), descrito como escolha entre sistema de 5 ou 10 estrelas ([roadmap](https://backloggd.com/roadmap/)). Reviews de terceiros descrevem 5 estrelas com meias estrelas ([TAG](https://www.twoaveragegamers.com/backloggd-review/)). Só uma nota por jogo conta para a média do site (por padrão, a do log mais recente). Ao ordenar por nota, o site usa uma média ponderada, sinalizada com asterisco azul ([About](https://backloggd.com/about/)). |
| **Busca e descoberta** | Seções na home: em alta, reviews populares, listas populares, mais aguardados, "Coming Soon" (próximos 7 e 14 dias, filtrável pela wishlist) e "Sleeper Hits" ([home](https://backloggd.com/), [changelog 1.11.0](https://backloggd.com/changelog/1_11_0)). |
| **Filtros e taxonomias** | Gêneros e franquias vindos do IGDB. Tags próprias existem apenas no diário: até 8 tags por sessão de jogo, com filtro do diário por tag ([About](https://backloggd.com/about/)). "More Advanced Filters" (6,5 mil votos), "Game Categorization" (5,8 mil) e "Better Genres" (1,3 mil) continuam pendentes no roadmap. |
| **Perfil** | Favoritos, estatísticas (as de todos os tempos são benefício de apoiador), seção de biblioteca e busca dentro do perfil (v1.18.0). |
| **Histórico e atividade** | Diário em formato de calendário, onde se marcam os dias em que jogou; feed de atividade de quem você segue; estatística de "maior sequência no diário". |
| **Cards** | Capa do jogo em destaque com título abaixo; alguns cards mostram data de lançamento ou média. Cards de review trazem capa, selo de status ("Completed"), selo de plataforma, data, trecho do texto e contagens. Cards de lista são uma colagem de 4 a 5 capas ([home](https://backloggd.com/)). |
| **Mobile** | Sem app nativo público. Android está em beta fechado para apoiadores; beta público previsto para a primavera de 2027 ([home](https://backloggd.com/), [Insider Gaming](https://insider-gaming.com/backloggd-gamings-version-of-letterboxd-gets-first-mobile-app-closed-beta/)). O site mobile funciona, mas um reviewer estima cerca de 45 segundos para registrar uma sessão no celular ([TAG](https://www.twoaveragegamers.com/backloggd-review/)). |
| **Adicionar e editar** | Buscar o jogo e abrir o editor de log. Mudar a nota no editor marca o log como jogado automaticamente; novos logs herdam a nota do jogo ([changelog](https://backloggd.com/changelog/1_11_0)). Jogos ausentes precisam ser cadastrados no IGDB e aprovados lá. |
| **Preço** | Gratuito; apoiador a US$ 3/mês via Patreon (sem anúncios, selo, estatísticas, betas) ([About](https://backloggd.com/about/)). |

**Problemas conhecidos**

- **Sem importação da Steam**: é o item mais votado do roadmap público, com 20 mil votos. Em seguida vêm recomendações de jogos (18 mil), app iOS (15 mil), mais informações de jogo (8,2 mil) e exportação (7,5 mil) ([roadmap](https://backloggd.com/roadmap/)).
- **Não ajuda a decidir o que jogar**: crítica central do review do TAG ("tracks games but doesn't help choose what to play tonight"). A fonte é concorrente, mas o pedido de recomendações com 18 mil votos aponta na mesma direção.
- **Média ponderada**: a mudança de 2025 no cálculo das notas foi publicamente chamada de controversa ([TAG](https://www.twoaveragegamers.com/backloggd-review/)).
- **Páginas duplicadas e edições**: o relatório do TAG lista duplicatas crescentes; o próprio Backloggd criou a "combinação de edições" (v1.15.0) para mitigar.
- **Dois níveis de status confundem**: não achei reclamação textual, mas a própria página About precisa explicar a diferença entre status de jogo e status de log, o que sugere atrito.
- Usuário no Tildes (dez/2023): "It has its quirks but has been very nice to use for the most part"; outro elogia o lado social, mas considera o layout inferior ao do Letterboxd ([Tildes](https://tildes.net/~games/1d5i/letterboxd_goodreads_storygraph_but_for_video_games)).

---

## 2. GG (ggapp.io)

O principal concorrente com apps nativos para iOS e Android.

| Dimensão | O que faz |
|---|---|
| **Organização** | Status: *Playing, Beaten, Completed, Shelved, Abandoned, Want to Play* e wishlist; backlog e wishlist chegaram na v1.9.0, de maio de 2023 ([TAG](https://www.twoaveragegamers.com/gg-app-review/), [App Store](https://apps.apple.com/us/app/gg/id1320588074)). |
| **Avaliação** | Notas e reviews; distribuição de notas adicionada na v1.8.0. A escala atual é **não confirmada**: avaliações da App Store de 2019 e 2023 pedem "half stars or point scales" e "5- or 10-point rating scale". |
| **Busca e descoberta** | Lançamentos em alta, mais bem avaliados, listas curadas, feed social. |
| **Filtros** | **Não confirmado** nas fontes consultadas. |
| **Perfil** | Histórico, favoritos, notas, reviews e listas; personalização do perfil é paga (Elite). |
| **Atividade** | Feed de amigos e retrospectiva anual. |
| **Cards** | **Não confirmado** em detalhe. A v1.9.0 trouxe ações rápidas por toque longo no card. |
| **Mobile** | Apps nativos. Nota 4,1/5 com 204 avaliações na App Store dos EUA; 3,8 no Google Play segundo o TAG. A versão 1.12.0 corrigiu envios duplicados por toque duplo. |
| **Adicionar** | Buscar, tocar, escolher status: cerca de dez segundos ([TAG](https://www.twoaveragegamers.com/gg-app-review/)). |
| **Preço** | Gratuito com Elite a US$ 4,99/mês ou US$ 48,99/ano (clonar e mesclar listas, personalizar perfil, sem anúncios). |

**Problemas conhecidos** (citações de avaliações da [App Store](https://apps.apple.com/us/app/gg/id1320588074))

- Paywall: "Most of the useful features are paid version only"; "everything unique and what it's useful for is locked behind that subscription" (out/2022).
- Busca com ordenação ruim: "the game I search for is often far down the list of results" (nov/2019); "the title I'm looking for is below many others" (ago/2020).
- Estado desatualizado: "you have to refresh once after adding them if you haven't closed the app".
- Escala de nota limitada: pedidos de meias estrelas ou escala de pontos (mar/2023).
- Avaliações em outras lojas regionais reclamam que não é possível dar nota sem escrever review e que jogos ainda não lançados podem ser avaliados; um usuário pediu um **sorteador para escolher um jogo de uma lista** e não encontrou ([App Store DE](https://apps.apple.com/de/app/gg/id1320588074?l=en)).
- Sem importação de lojas, sem registro de plataforma de posse, sem tempo de jogo; desenvolvimento lento (dev solo) ([TAG](https://www.twoaveragegamers.com/gg-app-review/)).
- Confusão com múltiplas edições nos resultados de busca ([relatório TAG, PDF](https://s3.us-east-2.amazonaws.com/tag-media-bucket/2026/02/25035915/state-of-game-tracking-2026.pdf)).

---

## 3. Biblioteca Steam e Steam Community

Referência obrigatória porque parte da biblioteca do casal provavelmente já mora lá.

| Dimensão | O que faz |
|---|---|
| **Organização** | Coleções manuais e **coleções dinâmicas** (filtros salvos que se atualizam sozinhos), exibidas como prateleiras. |
| **Avaliação** | Binária (recomendo / não recomendo) nas análises públicas; não há nota pessoal privada. |
| **Descoberta** | Fila de descoberta e recomendações na loja; na biblioteca, apenas o que você já possui. |
| **Filtros e taxonomias** | Tags da comunidade, gêneros, recursos (categorias como "Cooperativo on-line", "Tela dividida", "Remote Play Together") e status de jogo. Desde setembro de 2022 há filtro por **jogos que você e amigos escolhidos possuem**, utilizável em coleções dinâmicas ([GamingOnLinux](https://gamingonlinux.com/2022/09/steam-beta-lets-you-create-a-collection-filtered-by-games-you-and-friends-own)). |
| **Perfil e atividade** | Perfil público com jogos recentes, horas e conquistas, sujeitos às configurações de privacidade. |
| **Cards** | Cápsulas verticais 600x900 na grade da biblioteca. |
| **Mobile** | Detalhes da experiência de biblioteca no app mobile: **não confirmado** nesta pesquisa. |

**Problemas conhecidos**

- **Filtros só combinam com E**: pedido antigo no fórum do beta, "treat everything as a big old AND filter"; usuários pedem OU e exclusão de tags ([fórum Steam Client Beta](https://steamcommunity.com/groups/SteamClientBeta/discussions/3/1627412171707199564), [pedido de melhorias](https://steamcommunity.com/discussions/forum/10/601902145259748358)).
- **Dependência das tags da loja**: coleções dinâmicas ficam "à mercê" das tags, exigindo poda manual ([PC Powerplay](https://www.pressreader.com/australia/pcpowerplay/20200106/281578062564537)).
- **Dois lugares para filtrar**: o menu de filtro afeta só a barra lateral, não a grade principal, o que gera confusão ([fórum Steam, mai/2023](https://steamcommunity.com/discussions/forum/1/6821308966007191566)).
- **Instabilidade**: relatos de coleções dinâmicas sumindo e do filtro de amigos retornando vazio ([fórum Steam Client Beta](https://steamcommunity.com/groups/SteamClientBeta/discussions/0/4416424085348125904/)).
- Nada disso serve para um casal avaliar junto, anotar ou decidir: a Steam organiza posse, não experiência compartilhada.

---

## 4. HowLongToBeat (howlongtobeat.com)

| Dimensão | O que faz |
|---|---|
| **Proposta** | Responde "quanto tempo dura este jogo?" com quatro categorias: *Main Story, Main + Extras, Completionist, All Styles*. Os tempos são enviados manualmente por jogadores ([TAG](https://www.twoaveragegamers.com/howlongtobeat-review-still-the-best-free-answer-to-how-long-is-this-game/)). |
| **Biblioteca** | Tem backlog e registro de conclusão, descritos como secundários. |
| **Avaliação** | Escala de nota: **não confirmado**. |
| **Importação Steam** | Fontes conflitantes: o relatório do TAG lista "Steam" em importação; uma comparação de 2026 diz que não há importação automática. **Não confirmado**. |
| **Mobile** | Existe app na App Store ([listagem](https://apps.apple.com/app/id1600472119)); qualidade **não confirmada**. |

**Problemas conhecidos**: interface descrita como datada e pouco intuitiva e rastreamento que "parece um anexo" ([relatório TAG](https://s3.us-east-2.amazonaws.com/tag-media-bucket/2026/02/25035915/state-of-game-tracking-2026.pdf), fonte com viés); tempos menos confiáveis em jogos de nicho. Um usuário do Tildes resume o uso típico: "I mostly just care about playtime".

**Relevância para nós**: a duração estimada é um ótimo critério de sorteio ("algo curto para hoje"). O HLTB não tem API pública oficial (**não confirmado**); o IGDB oferece um endpoint próprio de tempo para zerar (ver documento 04).

---

## 5. Letterboxd (referência de diário e avaliação)

Não é de jogos, mas é o padrão de comparação que todos os trackers usam.

- **Diário, não review**: cada entrada guarda data em que assistiu, nota em meias estrelas (0,5 a 5,0), texto opcional, coração de "gostei" e indicador de revisita. Chamar de "diário" desloca o usuário de se exibir para refletir ([análise de design](https://blakecrosley.com/guides/design/letterboxd)).
- **Nota e "gostei" são separados**: é possível dar 3 estrelas e ainda marcar o coração. São sinais diferentes (qualidade versus afeto).
- **Grade de pôsteres**: cards 2:3 em grade fluida; o pôster funciona como atalho visual denso para gênero, época e tom. Título e ano só aparecem em sobreposição.
- **Calendário com miniaturas** nos dias assistidos torna o histórico visível.
- **Cor com significado**: verde para ações e afirmações (assistido, curtido, avaliado), laranja para recursos pagos, azul para links. Fundo escuro em camadas com texto off-white.
- **Registro rápido**: um usuário relata cerca de 10 segundos por registro e por isso registra após cada filme ([Desirability Lab](https://desirabilitylab.com/backfill/backfill-2022-247-letterboxd-social-film-logging)).
- **Comparação entre duas pessoas**: existe comparação de watchlist com outro usuário ([Popular Science](https://www.popsci.com/diy/how-to-use-letterboxd/)), mas não encontrei comparação oficial de notas lado a lado; isso é feito por ferramentas de terceiros ([exemplo](https://github.com/BBottoml/Letterboxd-friend-ranker)). Um usuário conta que comparar meias estrelas com amigos após assistir junto gera mais conversa do que o filme em si ([Desirability Lab](https://desirabilitylab.com/backfill/backfill-2025-162-letterboxd-film-community)).

---

## 6. Infinite Backlog (infinitebacklog.net)

- **Diferencial**: integra direto com as lojas e importa bibliotecas de Steam, PlayStation, Xbox e GOG automaticamente; acompanha conquistas; exporta CSV ([iTechGuides](https://www.itechguides.com/best/game-backlog-trackers/), [AlternativeTo](https://alternativeto.net/software/infinite-backlog/about/)).
- **Modelo**: gratuito, com Patreon de cerca de US$ 3/mês para tags personalizadas e extras; somente web ([relatório TAG](https://s3.us-east-2.amazonaws.com/tag-media-bucket/2026/02/25035915/state-of-game-tracking-2026.pdf)).
- **Fraquezas citadas**: sem app mobile, comunidade pequena. O relatório do TAG observa que a automação serve bem à gestão de coleção e mal ao diário, que exige entrada manual.
- Escala de nota, filtros e design de cards: **não confirmado** (o site não pôde ser lido).
- **Lição**: tags personalizadas são valiosas o bastante para serem o item pago. No nosso caso são o centro do produto e devem ser gratuitas e rápidas.

## 7. Grouvee (grouvee.com)

- Catálogo vindo da API do Giant Bomb; prateleiras e status de jogo; listas personalizadas; importação da biblioteca Steam; cada jogo mostra a média dos usuários ([MakeUseOf, espelho](https://secumapekuse.pages.dev/like-goodreads-but-for-video-games-manage-your-game-collection-better)).
- Exportação em CSV enviada por e-mail a partir das configurações (mesma fonte).
- Sem app nativo; web mobile classificada como "Fair" pelo relatório do TAG, que também lista "sem exportação/importação" como reclamação, em conflito com a fonte anterior. **Não confirmado** qual está atual.
- Escala de nota: **não confirmado**.

## 8. Completionator (completionator.com)

- Site para acompanhar coleção e jogos jogados, com vários tipos de conclusão (história principal, 100%, todas as conquistas), além de estatísticas, desafios e modelos de metas ([About](https://completionator.com/About), [Destructoid](https://destructoid.com/?p=452235)).
- Descrito como mais detalhado, porém menos bonito e menos fácil que alternativas; voltado a colecionadores ([Streamers Playbook](https://streamersplaybook.com/?p=10858)).
- Importação Steam, notas e mobile: **não confirmado**.
- **Lição**: profundidade de colecionador é o oposto do que um casal precisa. Serve de alerta contra excesso de campos.

## 9. Apps de watchlist para casais (referência do modelo "a dois")

Nenhum tracker de jogos pesquisado é pensado para duas pessoas. Os apps de filmes para casais são a referência mais próxima:

- **Shared Watchlist: Couple match**: cada um desliza sozinho; títulos curtidos pelos dois caem numa seção "Matched". Convidar o parceiro exige assinatura ([App Store](https://apps.apple.com/us/app/shared-watchlist/id6755390014)).
- **Dunno – Swipe and Watch**: desliza-se individualmente e, quando os dois curtem o mesmo título, vira um "Watch"; tem sessão ao vivo por QR code sem cadastro ([AlternativeTo](https://alternativeto.net/software/dunno--swipe-and-watch/about/)).
- **WeWatch Together**: lista compartilhada, adicionar rápido, avaliar o que terminou; vínculo do casal via iCloud ([App Store](https://apps.apple.com/us/app/wewatch-together/id6755074651)).
- **Pairly**: adiciona o parceiro, ambos avaliam e o app gera recomendações conjuntas para a noite ([listagem](https://mwm.ai/apps/pairly/6758665473)).
- **Our Cinema**: lista conjunta, planejamento de noites, registro de notas e "memórias" ([AlternativeTo](https://alternativeto.net/software/our-cinema/about/)).

Padrões recorrentes: (1) voto individual e cego seguido de revelação do que coincide, (2) lista única compartilhada em vez de duas listas, (3) decisão da noite como recurso principal e (4) memórias além de notas. As descrições vêm de páginas de loja, isto é, material de marketing; a qualidade real é **não confirmada**.

---

## Síntese: reclamações que se repetem na categoria

| Reclamação | Onde aparece | Fonte |
|---|---|---|
| Entrada manual cansativa, sem importação | Backloggd, GG | [roadmap Backloggd](https://backloggd.com/roadmap/) (20 mil votos) |
| Não ajuda a decidir o que jogar | Backloggd, GG | roadmap (18 mil votos em recomendações); pedido de sorteador na App Store do GG |
| Experiência mobile fraca ou inexistente | Backloggd, Infinite Backlog, Grouvee | relatório TAG; roadmap (15 mil votos em iOS) |
| Busca que não traz o jogo certo primeiro; edições duplicadas | GG, Backloggd | App Store do GG; relatório TAG |
| Escala de nota pouco granular | GG | App Store do GG |
| Filtros limitados (só E, sem exclusão) | Steam, Backloggd | fóruns Steam; roadmap (6,5 mil votos) |
| Hábito não se sustenta além de poucas semanas | Todos | relatório TAG (análise de fóruns, com viés) |
| Recursos básicos atrás de paywall | GG | App Store do GG |

---

## O que aproveitar conceitualmente

1. **Capa como card** (Letterboxd, Backloggd, Steam): grade de capas verticais com o mínimo de texto. A arte já comunica gênero e tom.
2. **Registro em cerca de dez segundos** (GG, Letterboxd): buscar, tocar, escolher status. Todo o resto é opcional e fica para depois.
3. **Status separado do desfecho** (Backloggd, GG): "jogado" não basta; distinguir zerado, pausado e abandonado tem valor real. Porém em um nível só, sem a dupla camada do Backloggd.
4. **Nota separada de afeto** (Letterboxd): a nota de 0 a 10 mede qualidade; um marcador de "favorito do casal" ou "quero repetir" mede vontade.
5. **Diário com data real de jogo** (Letterboxd, Backloggd): registrar quando jogaram, não quando cadastraram. O calendário com capas vira o álbum de memórias.
6. **Coleções dinâmicas** (Steam): filtros salvos que se atualizam sozinhos, como "co-op curto no sofá".
7. **Voto cego com revelação** (apps de casal): cada um opina sem ver o outro, e o app mostra o resultado.
8. **Catálogo terceirizado com atribuição** (Backloggd usa "Powered by IGDB"): não manter base própria de jogos.
9. **Categorias de co-op da Steam** (on-line, tela dividida, Remote Play Together): são exatamente a taxonomia que um casal precisa para filtrar.

## O que fazer melhor num produto exclusivo de duas pessoas

1. **Toda tela mostra as duas notas lado a lado.** Nos concorrentes a nota é individual e a comparação exige visitar outro perfil ou usar ferramenta de terceiros. Aqui o card do jogo já deve exibir nota A, nota B e a diferença.
2. **Nota cega até os dois avaliarem.** Esconder a nota do parceiro até que ambos tenham registrado a sua e então revelar, de preferência com um pequeno momento de destaque. Evita ancoragem e transforma a avaliação em ritual.
3. **Controle de nota feito para polegar.** Escala de 0 a 10 com passo 0,5 são 21 valores: usar slider largo com encaixe e retorno tátil, ou seletor em duas etapas (inteiro e depois "+0,5"), com o número grande visível durante o gesto. Os concorrentes sofrem com escalas pouco granulares; nós temos o problema inverso, que é a precisão do toque.
4. **Permitir nota sem texto.** Reclamação explícita no GG. O comentário é sempre opcional.
5. **"O que vamos jogar hoje?" como ação principal da home**, não como recurso escondido. É a lacuna mais citada da categoria. O sorteio deve aceitar restrições rápidas (tempo disponível, humor, local ou on-line) e permitir sortear de novo sem punição.
6. **Sorteio ponderado pelos dois.** Peso maior para jogos que ambos marcaram como "quero jogar", com opção de veto individual por rodada. Isso só é viável com duas pessoas.
7. **Uma lista conjunta, não duas bibliotecas.** O objeto central é "nosso jogo", com campos por pessoa (nota, vontade, quem possui). Elimina seguir, feed público, privacidade e moderação.
8. **Tags de humor próprias e gratuitas**, criadas em um toque na hora de registrar. No Infinite Backlog isso é pago; no Backloggd as tags só existem no diário.
9. **Filtros com E, OU e exclusão desde o início**, em chips grandes roláveis horizontalmente, com contagem de resultados em tempo real. Corrige a reclamação antiga da Steam.
10. **Busca que acerta de primeira**: priorizar jogo principal sobre edições, DLCs e pacotes, e ordenar por popularidade. Reclamação recorrente no GG e no Backloggd.
11. **Adicionar em três toques e enriquecer depois**: buscar, tocar, escolher "quero jogar" ou "jogamos". Gênero, modos de co-op e capa vêm do catálogo automaticamente.
12. **Importação da Steam como atalho opcional, nunca como requisito.** É o pedido número um do Backloggd, mas depende de perfil público (ver documento 04). Se falhar, o app continua completo.
13. **Mobile primeiro de verdade**: ações na metade inferior da tela, folhas inferiores (bottom sheets) em vez de páginas de edição, prevenção de toque duplo (bug real corrigido no GG 1.12.0) e atualização otimista da interface (o GG exigia recarregar após adicionar).
14. **Sem gamificação de streak diária.** A tese do relatório do TAG é que o hábito morre em 45 dias e que XP resolve. Para um casal, a motivação é o ritual compartilhado. Preferir lembretes suaves ligados a eventos reais ("vocês zeraram há 3 dias, que nota dão?") a sequências que geram culpa.
15. **Memórias além de notas**: uma linha de anotação e a data em que jogaram juntos. Uma retrospectiva anual do casal (onde mais concordaram e mais discordaram) é barata de produzir com os dados já coletados.

---

## Fontes

- Backloggd: [home](https://backloggd.com/), [About](https://backloggd.com/about/), [roadmap](https://backloggd.com/roadmap/), [changelog 1.11.0](https://backloggd.com/changelog/1_11_0)
- [Insider Gaming: beta fechado do app Backloggd](https://insider-gaming.com/backloggd-gamings-version-of-letterboxd-gets-first-mobile-app-closed-beta/)
- [GG na App Store (EUA)](https://apps.apple.com/us/app/gg/id1320588074) e [App Store (DE)](https://apps.apple.com/de/app/gg/id1320588074?l=en)
- Two Average Gamers (autor de produto concorrente): [review do Backloggd](https://www.twoaveragegamers.com/backloggd-review/), [review do GG](https://www.twoaveragegamers.com/gg-app-review/), [review do HowLongToBeat](https://www.twoaveragegamers.com/howlongtobeat-review-still-the-best-free-answer-to-how-long-is-this-game/), [State of Game Tracking 2026 (PDF)](https://s3.us-east-2.amazonaws.com/tag-media-bucket/2026/02/25035915/state-of-game-tracking-2026.pdf)
- [Tildes: Letterboxd/Goodreads para videogames](https://tildes.net/~games/1d5i/letterboxd_goodreads_storygraph_but_for_video_games)
- Steam: [filtros E/OU no beta](https://steamcommunity.com/groups/SteamClientBeta/discussions/3/1627412171707199564), [pedido de melhor ordenação e prateleiras](https://steamcommunity.com/discussions/forum/10/601902145259748358), [confusão do filtro lateral](https://steamcommunity.com/discussions/forum/1/6821308966007191566), [GamingOnLinux: filtro por jogos de amigos](https://gamingonlinux.com/2022/09/steam-beta-lets-you-create-a-collection-filtered-by-games-you-and-friends-own), [PC Powerplay](https://www.pressreader.com/australia/pcpowerplay/20200106/281578062564537)
- Letterboxd: [análise de design](https://blakecrosley.com/guides/design/letterboxd), [Desirability Lab 2022](https://desirabilitylab.com/backfill/backfill-2022-247-letterboxd-social-film-logging), [Desirability Lab 2025](https://desirabilitylab.com/backfill/backfill-2025-162-letterboxd-film-community), [Popular Science](https://www.popsci.com/diy/how-to-use-letterboxd/)
- Infinite Backlog: [iTechGuides](https://www.itechguides.com/best/game-backlog-trackers/), [AlternativeTo](https://alternativeto.net/software/infinite-backlog/about/)
- Grouvee: [MakeUseOf (espelho)](https://secumapekuse.pages.dev/like-goodreads-but-for-video-games-manage-your-game-collection-better)
- Completionator: [About](https://completionator.com/About), [Destructoid](https://destructoid.com/?p=452235), [Streamers Playbook](https://streamersplaybook.com/?p=10858)
- Apps de casal: [Shared Watchlist](https://apps.apple.com/us/app/shared-watchlist/id6755390014), [WeWatch Together](https://apps.apple.com/us/app/wewatch-together/id6755074651), [Dunno](https://alternativeto.net/software/dunno--swipe-and-watch/about/), [Our Cinema](https://alternativeto.net/software/our-cinema/about/), [Pairly](https://mwm.ai/apps/pairly/6758665473)
