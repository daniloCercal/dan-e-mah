# 04 — APIs de catálogo e integração com a Steam

> Pesquisa feita em 18/11/2026. As afirmações marcadas como **verificado ao vivo** foram testadas nesta data com requisições anônimas a endpoints públicos, sem chave e sem dados pessoais. Onde algo não pôde ser confirmado em fonte primária, está escrito **não confirmado**.
> Contexto: app privado, não comercial, para duas pessoas; Next.js + Supabase (plano gratuito).

## Limitações desta pesquisa

- Nenhuma chamada autenticada foi feita (não havia chave de API). O comportamento de `GetOwnedGames`, `GetRecentlyPlayedGames` e `GetPlayerAchievements` vem de documentação oficial e de relatos de fórum, não de teste próprio.
- A wiki de desenvolvedores da Valve (developer.valvesoftware.com) bloqueia leitura automatizada; usei a documentação Steamworks (partner.steamgames.com) e a referência não oficial xPaw.
- O corpo do artigo de suporte da Steam sobre contas limitadas é renderizado por JavaScript e não pôde ser lido; a regra dos US$ 5 vem de fontes secundárias que citam esse artigo.
- O texto atual do Twitch Developer Services Agreement e a página da API do MobyGames também não puderam ser lidos diretamente.

---

## Parte A — APIs de catálogo

### Tabela comparativa

| Critério | **IGDB** | **RAWG** | **Steam Store `appdetails`** (não oficial) | **SteamGridDB** | **Giant Bomb** | **MobyGames** |
|---|---|---|---|---|---|---|
| **Cobertura** | Multiplataforma; o Backloggd, que usa IGDB, lista 385 mil jogos | "500.000+ jogos", 50 plataformas | Apenas jogos da Steam | Apenas arte (capas, heroes, logos, ícones) feita pela comunidade | Wiki de jogos; tamanho atual **não confirmado** | Forte em jogos antigos; tamanho **não confirmado** |
| **Capa** | Sim, vertical (`cover`), tamanhos até 1080p | Imagem de fundo horizontal; capa vertical **não confirmada** | `header_image` e `capsule_image` horizontais; vertical por URL de CDN (ver abaixo) | Sim, é a especialidade (grids verticais) | Sim (**detalhes não confirmados**) | Sim (**detalhes não confirmados**) |
| **Screenshots** | Sim | Sim (2,1 milhões) | Sim | Não | **Não confirmado** | **Não confirmado** |
| **Gêneros e temas** | `genres`, `themes`, `keywords`, `player_perspectives` | Gêneros e 58 mil tags | `genres` e `categories` | Não | **Não confirmado** | **Não confirmado** |
| **Modos e co-op** | `game_modes` e `multiplayer_modes` com campos detalhados (ver abaixo) | Via tags; campo dedicado **não confirmado** | `categories` com ids estáveis para co-op (ver abaixo) | Não | **Não confirmado** | **Não confirmado** |
| **Plataformas** | Sim | Sim | Windows, Mac, Linux | Não | **Não confirmado** | Sim |
| **Trailers** | `videos` (endpoint `game_videos`, campo `video_id`) | Vídeos de gameplay listados só no plano Business | `movies` (HLS e DASH) | Não | **Não confirmado** | **Não confirmado** |
| **ID Steam** | Sim, via `external_games` (`uid` + `external_game_source`) | Links de loja listados só no plano Business | É a própria chave (appid) | Busca por appid Steam (`/grids/steam/{id}`) | **Não confirmado** | **Não confirmado** |
| **Tempo para zerar** | Sim (`game_time_to_beats`: `hastily`, `normally`, `completely`) | Tempo médio de jogo | Não | Não | Não | Não |
| **Textos em PT-BR** | Localização de nomes; descrições em PT-BR **não confirmadas** | **Não confirmado** | Sim, com `l=brazilian` (**verificado ao vivo**) | Não se aplica | Não | Não |
| **Autenticação** | Conta Twitch com 2FA; app no console de dev; OAuth2 client credentials; cabeçalhos `Client-ID` e `Authorization: Bearer` | Chave por query string | Nenhuma | Chave pessoal em `Authorization: Bearer` | Chave no perfil, enviada como `api_key` | Chave no perfil, enviada como `api_key` |
| **Limite** | 4 req/s; até 8 requisições abertas; máximo de 500 itens por consulta; multi-query com até 10 consultas | 20.000 req/mês no plano gratuito | Sem documentação; relatos de cerca de 200 req a cada 5 min por IP | Não documentado na especificação | **Não confirmado** | 360 req/hora e no máximo 1 req/s |
| **Uso privado não comercial** | Permitido e gratuito | Permitido e gratuito | Sem termos próprios para esse endpoint; zona cinzenta | **Termos não confirmados** | **Não confirmado** | API gratuita para uso sem fins lucrativos |
| **Atribuição** | Exigida explicitamente na parceria comercial; recomendada sempre | **Obrigatória**: link ativo para a RAWG em toda página que use os dados | Nenhuma definida | **Não confirmado** | **Não confirmado** | **Não confirmado** |
| **Cache e armazenamento** | **Permitido e incentivado** pelo FAQ oficial | Não tratado explicitamente; cláusula genérica proíbe copiar conteúdo sem consentimento | Sem termos | **Não confirmado** | **Não confirmado** | **Não confirmado** |
| **Confiabilidade** | Mantida pela Twitch/Amazon; mudanças de esquema avisadas com 6 meses | Termos de 2021; RAWG já anunciou mudanças no acesso gratuito | Pode mudar ou sumir sem aviso | Projeto comunitário | Site mudou de dono em 2025 e relançou; API em transição | Estável, porém lenta pelo limite |

### IGDB em detalhe (fonte primária lida integralmente)

Todos os itens abaixo vêm da [documentação oficial](https://api-docs.igdb.com/).

- **Licença**: "The IGDB.com API is free for non-commercial usage under the terms of the Twitch Developer Service Agreement". Para projetos comerciais há parceria, na qual pedem atribuição visível ao usuário.
- **Cache**: no FAQ, à pergunta "Am I allowed to store/cache the data locally?", a resposta é "Yes. In fact, we prefer if you store and serve the data to your end users". O FAQ também afirma que os dados obtidos podem ser mantidos mesmo após o fim de uma parceria.
- **Ressalva**: o Twitch Developer Services Agreement, de aplicação geral, tem histórico de cláusula restringindo cache a 24 horas para dados da Twitch ([discussão no fórum](https://discuss.dev.twitch.com/t/storage-of-data-from-twitch-api/63884)). O texto atual não pôde ser lido e a relação entre essa cláusula e o FAQ do IGDB é **não confirmada**. O FAQ do IGDB é específico e explícito, e é nele que a recomendação se apoia.
- **Autenticação**: `POST https://id.twitch.tv/oauth2/token` com `client_id`, `client_secret` e `grant_type=client_credentials`. O token dura cerca de 60 dias e há limite de 25 tokens ativos por aplicação. O tipo de cliente precisa ser "Confidential".
- **Sem CORS**: a API não aceita chamadas do navegador, justamente para não vazar o token. É obrigatório um proxy no servidor. Com Next.js isso é um Route Handler ou Server Action, sem custo extra.
- **Limites**: "4 requests per second"; acima disso, HTTP 429. "Up to 8 open requests at any moment". Paginação com `limit` padrão 10 e máximo 500.
- **Imagens**: `https://images.igdb.com/igdb/image/upload/t_{size}/{image_id}.jpg`. Tamanhos: `cover_small` 90x128, `cover_big` 264x374, `screenshot_med` 569x320, `screenshot_big` 889x500, `screenshot_huge` 1280x720, `720p`, `1080p`, `thumb`, `micro`, `logo_med`. O sufixo `_2x` entrega versão retina. Imagens removidas ou substituídas continuam existindo por 30 dias, o que importa para a lógica de cache.
- **Co-op**: o endpoint `multiplayer_modes` tem `campaigncoop`, `dropin`, `lancoop`, `offlinecoop`, `offlinecoopmax`, `offlinemax`, `onlinecoop`, `onlinecoopmax`, `onlinemax`, `splitscreen`, `splitscreenonline`, por plataforma. É a melhor fonte estruturada encontrada para "dá para jogar a dois, local ou on-line, e com quantos jogadores".
- **ID Steam**: `external_games` com `uid` (o id no outro serviço) e `external_game_source`. No enum antigo, Steam vale 1.
- **Migração de esquema em andamento**: campos como `external_game.category` passam a `external_game_source`, e `website.category` a `type`. A documentação descreve período de migração "starting on February 18 to August 31 (6 months)", após o qual os nomes antigos são removidos. O ano não aparece no trecho lido (**não confirmado**; presumivelmente já concluído). Bibliotecas e tutoriais antigos que usam `category` podem estar quebrados: usar os nomes novos.
- **Extras**: webhooks para receber alterações; dumps diários em CSV, exclusivos para parceiros de dados; servidor MCP oficial.

### RAWG em detalhe

- [Termos da API](https://rawg.io/tos_api), última atualização em 1º de março de 2021: gratuita para uso pessoal desde que se atribua a RAWG como fonte e se adicione "an active hyperlink from every page where the data of RAWG is used". Limite de 20.000 requisições por mês no plano gratuito.
- A [página de planos](https://rawg.io/apidocs) descreve o plano gratuito como uso não comercial e lista links de lojas, jogos similares e vídeos sob o plano Business (US$ 149/mês, até 50.000 requisições). Se os links de loja, e portanto o appid da Steam, estão mesmo indisponíveis no plano gratuito é **não confirmado**.
- Os termos não tratam de cache; há apenas a cláusula genérica 6.2 contra copiar ou reproduzir conteúdo sem consentimento. Para um app que precisa guardar o catálogo no Supabase, isso é um risco de conformidade que o IGDB não tem.
- A RAWG publicou aviso de que o acesso gratuito mudaria ([Medium](https://medium.com/rawg/dont-lose-your-access-to-rawg-api-df46eca95090)); estado atual **não confirmado**.

### Steam Store `appdetails` (não oficial)

**Verificado ao vivo** com `https://store.steampowered.com/api/appdetails?appids=1426210&l=brazilian`:

- Não exige chave. Devolve, entre outros: `name`, `short_description`, `header_image`, `capsule_image`, `categories`, `genres`, `screenshots`, `movies`, `platforms`, `release_date`, `metacritic`, `controller_support`, `achievements`, `price_overview`.
- Com `l=brazilian` os textos vêm em português do Brasil, inclusive gêneros e categorias.
- `categories` traz ids numéricos estáveis, o que permite filtrar sem depender do texto traduzido. No exemplo: 1 Multijogador, 9 Cooperativo, 38 Cooperativo on-line, 39 Cooperativo em tela dividida/compartilhada, 24 Tela dividida/compartilhada, 44 Remote Play Together, 22 Conquistas Steam.
- **Limite**: não documentado pela Valve. Relatos convergem em cerca de 200 requisições a cada 5 minutos por IP, com HTTP 429 ao exceder; outra fonte recomenda cerca de 1 requisição por segundo ([Medium](https://medium.com/codex/scraping-information-of-all-games-from-steam-with-python-6e44eb01a299), [apis.io](https://apis.io/rate-limits/steam/steam-rate-limits/)). Tratar como estimativa.
- **Riscos**: sem contrato nem garantia de estabilidade; preço e disponibilidade variam pela região do IP do servidor; jogos removidos ou bloqueados por região retornam `success: false`.

**Capa vertical da Steam**: `https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/library_600x900.jpg` respondeu HTTP 200 no teste (**verificado ao vivo** para um appid). Porém o SteamDB mostra que alguns apps têm o arquivo sob caminho com hash, o que quebra a URL previsível ([exemplo no SteamDB](https://steamdb.info/app/1643320/)). É preciso tratar 404 e cair para a capa do IGDB.

### SteamGridDB

Fonte: [especificação OpenAPI oficial](https://www.steamgriddb.com/api/v2) (arquivo `/static/openapi.yml`, lido diretamente).

- Autenticação por `Authorization: Bearer <token>`, com chave gerada nas preferências do perfil.
- Endpoints: `/search/autocomplete/{term}`, `/games/id/{gameId}`, `/games/{platform}/{platformId}`, e para cada tipo de arte (`grids`, `heroes`, `logos`, `icons`) as variantes `/game/{gameId}` e `/{platform}/{id}`, que aceitam appid da Steam. Filtros por estilo, dimensões, tipo de arquivo e marcações `nsfw`, `humor` e `epilepsy`.
- A especificação não menciona limite de requisições. Termos de uso e licença das imagens (arte feita por fãs): **não confirmado**.
- Papel sugerido: opcional, como alternativa quando a capa do IGDB for ruim ou quando o casal quiser escolher uma capa diferente. Sempre filtrar `nsfw=false`.

### Giant Bomb e MobyGames

- **Giant Bomb**: a Fandom vendeu o site à própria equipe em maio de 2025 ([Fandom](https://about.fandom.com/news/fandom-sells-giant-bomb-to-independent-creators)); o relançamento do site estava previsto para 6 de dezembro de 2025 ([FAQ](https://giantbomb.com/articles/giant-bomb-is-under-new-ownership-heres-an-faq)). Um post de dezembro de 2025 diz que a chave de API voltou a estar disponível na página de perfil ([Community Spotlight](https://giantbomb.com/posts/the-community-spotlight-20251213)). Limites, termos e estabilidade da API no novo site: **não confirmado**. Não recomendado como base enquanto durar a transição.
- **MobyGames**: a documentação oficial, segundo trecho indexado, oferece API gratuita para uso sem fins lucrativos, com chave obtida no perfil, limite de 360 requisições por hora e no máximo uma por segundo ([docs](https://www.mobygames.com/info/api/)). O plano MobyPro dobra o limite horário ([MobyPro](https://www.mobygames.com/mobypro/)). Campos disponíveis: **não confirmado**. Útil apenas como complemento para jogos antigos.

### Recomendação

**IGDB como catálogo principal, com `appdetails` da Steam como enriquecimento opcional e cache próprio no Supabase.**

Motivos:

1. É a única opção cuja documentação **autoriza e incentiva explicitamente** armazenar os dados, que é o que o app precisa fazer. A RAWG não trata do assunto e exige link em toda página.
2. Tem os dados que definem este produto: modos de co-op estruturados (local, on-line, tela dividida, número máximo de jogadores), tempo para zerar e mapeamento para o appid da Steam.
3. Capas verticais prontas em vários tamanhos, inclusive retina, ideais para grade no celular.
4. Uso não comercial gratuito, com limite (4 req/s) muito acima do necessário para duas pessoas.
5. É o catálogo do Backloggd, o que serve de prova de adequação ao caso de uso.

Arquitetura sugerida:

- **Busca**: Route Handler do Next.js chama o IGDB (o token nunca vai ao cliente), com espera de 300 a 400 ms entre teclas. Filtrar para o jogo principal, evitando DLCs e edições, usando `game_type` (nome novo do campo; conferir na documentação no momento da implementação).
- **Ao adicionar um jogo**: copiar para uma tabela `games` no Supabase os campos necessários (id IGDB, nome, `image_id` da capa, gêneros, temas, modos, dados de co-op, appid Steam, tempo para zerar). A partir daí a biblioteca do casal não depende mais da API.
- **Imagens**: guardar apenas o `image_id` e montar a URL do CDN do IGDB. Não copiar arquivos para o Storage do Supabase, o que preserva a cota do plano gratuito.
- **Token**: guardar o token de aplicação com sua validade (em tabela ou variável) e renovar antes de expirar; não gerar um por requisição, por causa do limite de 25 tokens ativos.
- **Enriquecimento Steam**: se o jogo tiver appid, uma única chamada a `appdetails` com `l=brazilian` para obter descrição curta em português e as categorias de co-op e Remote Play Together. Guardar o resultado; não repetir a chamada.
- **Atribuição**: exibir "Dados de jogos: IGDB" numa tela fixa (rodapé ou "Sobre"). Não é exigência documentada para uso não comercial, mas é o que o IGDB pede a parceiros e o que o Backloggd faz.

Volume esperado: duas pessoas adicionando algumas dezenas de jogos por mês geram centenas de requisições mensais, muito abaixo de qualquer limite da tabela.

---

## Parte B — Steam em 2026

### B.1 Steam OpenID (login "Sign in through Steam")

- A [documentação Steamworks](https://partner.steamgames.com/doc/features/auth) continua descrevendo a Steam como provedor **OpenID 2.0**, com endpoint `https://steamcommunity.com/openid/`. Após a autenticação, o Claimed ID tem o formato `https://steamcommunity.com/openid/id/<steamid>` e contém o SteamID de 64 bits.
- A [página de desenvolvedores da comunidade](https://steamcommunity.com/dev) reforça que pedir usuário e senha da Steam no próprio site viola os termos da API.
- O OpenID entrega **somente a identidade (SteamID)**. Não há escopos nem token de acesso; não concede permissão para ler dados privados.
- Não encontrei anúncio de descontinuação até 2026, e há bibliotecas mantidas em 2026 ([better-auth-steam](https://www.pkgstats.com/pkg:better-auth-steam), [proposta no Auth.js](https://github.com/nextauthjs/next-auth/discussions/13431)). Um teste ao vivo do fluxo não foi feito.
- **Cuidados de segurança**: validar a resposta reenviando os parâmetros à Steam com `openid.mode=check_authentication`; conferir que `openid.return_to` é exatamente a URL esperada; validar o formato do `claimed_id`; proteger contra reuso de nonce. Há registro de que o `passport-steam` não validava `return_to`, permitindo forjar respostas ([modern-passport-steam](https://github.com/easton36/modern-passport-steam)).
- OAuth da Steam para sites de terceiros comuns: **não confirmado** (a documentação pública só o cita na navegação).
- Suporte nativo da Steam como provedor no Supabase Auth: **não verificado nesta pesquisa**. Planejar o vínculo como rota própria no Next.js que apenas grava o SteamID no perfil, mantendo o login do app independente da Steam.

**Observação prática para duas pessoas**: como os dois usuários são conhecidos e confiáveis, o OpenID é dispensável. Colar o SteamID64 ou a URL do perfil nas configurações tem o mesmo efeito funcional, porque o OpenID não libera nenhum dado adicional. O OpenID só serviria para provar que a conta pertence a quem a vinculou.

### B.2 Chave da Steam Web API

- "All use of the Steam Web API requires the use of an API Key", obtida pelo formulário em `steamcommunity.com/dev/apikey` ([fonte](https://steamcommunity.com/dev)).
- **Requisito de conta**: contas limitadas não conseguem chave. Fontes secundárias citam o artigo de suporte da Steam, segundo o qual é preciso ter gasto ao menos US$ 5 na loja e que lista "Accessing the Steam Web API" entre os recursos bloqueados ([artigo de suporte](https://help.steampowered.com/en/faqs/view/71D3-35C2-AD96-AA3A), [guia que o cita](https://nicconike.github.io/Steam-Stats/getting-started/prerequisites)). Ativação de chave de varejo e presentes recebidos não contam ([fórum Steam](https://steamcommunity.com/discussions/forum/7/412446292754537839)). O texto do artigo não pôde ser lido diretamente.
- Exigência de informar um nome de domínio no formulário e de ter o Steam Guard ativo: **não confirmado** (o formulário exige login).
- [Termos de uso da API](https://steamcommunity.com/dev/apiterms):
  - limite de **100.000 chamadas por dia**;
  - a chave é confidencial e não pode ser compartilhada com terceiros; logo, fica só no servidor, nunca no código do cliente;
  - é preciso publicar política de privacidade sobre o uso de dados não públicos e informar ao usuário quais dados da Steam serão armazenados;
  - a Valve pode encerrar o acesso a qualquer momento, por qualquer motivo, sem aviso.
- Uma única chave, de qualquer um dos dois, basta para consultar os dois SteamIDs.

### B.3 Privacidade do perfil: o fator que decide tudo

- Em abril de 2018 a Valve criou a configuração "Detalhes dos jogos" (jogos possuídos, lista de desejos, conquistas e tempo de jogo), com opções público, só amigos e privado, além da opção separada de manter o tempo total de jogo sempre privado ([Engadget](https://www.engadget.com/2018/04/11/steam-new-privacy-features-disable-steam-spy/), [ComputerBase](https://www.computerbase.de/2018-04/steam-privacy-policy-game-details/)).
- O padrão passou a ser não público (as reportagens divergem entre "só amigos" e "oculto"), o que inviabilizou o SteamSpy na época.
- A documentação oficial de `GetOwnedGames` diz que ele retorna os jogos "if their owned games/game details are visible to you" ([IPlayerService](https://partner.steamgames.com/doc/webapi/IPlayerService)).
- **Consequência**: para a importação funcionar, cada pessoa precisa deixar o perfil **e** os detalhes dos jogos como públicos, expondo a biblioteca a qualquer pessoa na internet. Para ver horas, é preciso ainda desmarcar "sempre manter meu tempo total de jogo privado".
- Se a chave do próprio dono enxerga os dados privados dele mesmo, ou os de amigos com visibilidade "só amigos": **não confirmado**. Um relato de fórum indica que não: o usuário recebeu objeto vazio para a própria conta e dados completos para um perfil público com a mesma chave ([fórum Steam, jun/2024](https://steamcommunity.com/discussions/forum/1/4333105935814636670)).

### B.4 Endpoints

| Recurso | O que retorna | Requisitos | Falhas conhecidas | Classificação |
|---|---|---|---|---|
| **Steam OpenID** | SteamID64 verificado | Nenhuma chave; implementação correta da validação | Bibliotecas antigas com validação fraca de `return_to` | **Comprovadamente implementável** |
| **Obter chave da Web API** | Chave de 32 caracteres | Conta não limitada (cerca de US$ 5 gastos); aceitar os termos | Conta limitada não consegue; chave revogável pela Valve | **Comprovadamente implementável**, desde que um dos dois tenha conta não limitada |
| **`IPlayerService/GetOwnedGames`** | Lista de appids com tempo de jogo em minutos (`playtime_forever`); com `include_appinfo`, nome e ícone | Chave + SteamID; perfil e detalhes dos jogos públicos. Jogos gratuitos só aparecem com `include_played_free_games` ([docs](https://partner.steamgames.com/doc/webapi/IPlayerService), [xPaw](https://steamapi.xpaw.me/IPlayerService)) | Relatos indicam que perfil não visível devolve objeto vazio (`{"response":{}}`) em vez de erro explícito (código HTTP **não confirmado**); há também relatos de respostas vazias intermitentes e de 429 mesmo com chave nova ([fórum](https://steamcommunity.com/discussions/forum/1/601902348018676495)) | **Condicionado a visibilidade** |
| **`IPlayerService/GetRecentlyPlayedGames`** | Jogos jogados recentemente (janela de duas semanas), com tempo recente e total | Chave + SteamID; mesmas condições de privacidade. A documentação oficial não traz nota de privacidade para este método; a dependência é inferida do comportamento geral da API | Lista vazia se nada foi jogado no período ou se o tempo de jogo for privado (detalhe exato **não confirmado**) | **Condicionado a visibilidade** |
| **`ISteamUserStats/GetPlayerAchievements`** | Conquistas desbloqueadas pelo usuário em um jogo | Chave + SteamID + appid; uma chamada por jogo ([docs](https://partner.steamgames.com/doc/webapi/ISteamUserStats)) | Falha para perfis não públicos e para jogos sem conquistas; textos e códigos exatos dos erros **não confirmados**. Custo: N jogos = N chamadas | **Condicionado a visibilidade** |
| **`ISteamUserStats/GetSchemaForGame`** | Definição das conquistas e estatísticas do jogo (nomes, descrições, ícones), com idioma opcional | Chave + appid; não envolve usuário nem privacidade. **Verificado ao vivo**: sem chave, responde HTTP 400 "Required parameter 'key' is missing" | Jogos sem conquistas retornam esquema vazio (**não confirmado** o formato exato) | **Comprovadamente implementável** |
| **`ISteamUserStats/GetGlobalAchievementPercentagesForApp`** | Percentual global de cada conquista | Nenhuma chave. **Verificado ao vivo**: HTTP 200 com dados | — | **Comprovadamente implementável** |
| **Store `appdetails`** | Metadados da loja | Nenhuma chave (**verificado ao vivo**) | Limite não documentado; sem garantia de estabilidade | **Comprovadamente implementável**, com risco de mudança |
| **Ler biblioteca, horas ou conquistas de perfil privado ou "só amigos"** | — | — | A API respeita a privacidade; o OpenID não concede permissão | **Inviável** |
| **Login pedindo usuário e senha da Steam** | — | — | Viola os termos da API | **Inviável** |
| **Jogos acessíveis via Steam Families no `GetOwnedGames`** | — | Existe `IFamilyGroupsService` na referência não oficial ([xPaw](https://steamapi.xpaw.me/IFamilyGroupsService)) | Se `GetOwnedGames` inclui jogos compartilhados pela família: **não confirmado**; métodos de família exigem token de usuário (**não confirmado**) | **Não confirmado**; tratar como inviável no MVP |
| **Escrever na Steam** (criar coleções, marcar jogos) | — | — | Nenhum método público documentado encontrado | **Inviável** |

Parâmetros adicionais de `GetOwnedGames` vistos na referência não oficial: `include_free_sub`, `skip_unvetted_apps`, `include_extended_appinfo`, `language`.

### B.5 Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Biblioteca privada, que é o padrão | Importação devolve vazio | Detectar resposta vazia e mostrar instrução clara de como tornar "Detalhes dos jogos" público, deixando explícito o custo de privacidade. Manter adição manual sempre disponível |
| Resposta vazia indistinguível de erro | Usuário acha que o app quebrou | Tratar `{"response":{}}` como "perfil não visível"; nunca apagar dados já importados com base em resposta vazia |
| Tempo de jogo oculto | Horas zeradas ou ausentes | Tratar horas como opcionais; não usar em lógica essencial |
| Jogos compartilhados por Steam Families podem não aparecer | Biblioteca incompleta justamente no caso típico de casal | Importação é atalho, não fonte da verdade; adicionar manualmente o que faltar |
| Chave vazar no cliente | Violação dos termos e revogação | Chamar a Steam apenas em código de servidor; chave em variável de ambiente |
| Valve mudar ou encerrar o acesso | Recurso para de funcionar | Isolar a integração num módulo; o app não pode depender dela para funcionar |
| `appdetails` não oficial | Enriquecimento falha | Cachear o resultado; cair para dados do IGDB |
| Conquistas custam uma chamada por jogo | Lentidão; 429 | Buscar sob demanda (ao abrir o jogo) e guardar; não sincronizar tudo em lote |
| Exposição pública da biblioteca | Privacidade do casal | Decisão dos usuários. Alternativa: tornar público, importar e voltar a privado, com reimportação manual quando quiserem |

### B.6 Recomendação para o MVP

1. **Vincular Steam = informar SteamID** (colar URL do perfil), sem OpenID. É mais simples e, para duas pessoas de confiança, equivalente.
2. **Importação sob demanda** por `GetOwnedGames` com `include_appinfo=1` e `include_played_free_games=1`, com uma chave única no servidor.
3. **Casar appid com o IGDB** via `external_games` e deixar o usuário escolher quais jogos entram na lista do casal. Não despejar a biblioteca inteira.
4. **Cruzar as duas bibliotecas**: "jogos que os dois possuem" e "só um possui" são derivados locais simples e muito úteis para o sorteio.
5. **Conquistas e jogados recentemente**: deixar para depois do MVP. Dependem da mesma visibilidade, custam mais chamadas e entregam menos valor para a decisão "o que jogar hoje".
6. **O que testar primeiro, com uma chave real**: resposta de `GetOwnedGames` para perfil público, para perfil privado e para detalhes dos jogos em "só amigos"; se jogos de Steam Families aparecem; formato dos erros de `GetPlayerAchievements`. Esses pontos estão marcados como não confirmados acima e são baratos de validar em uma tarde.

---

## Fontes

**IGDB**
- [Documentação oficial da API IGDB](https://api-docs.igdb.com/) (lida integralmente: licença, FAQ de cache, limites, imagens, `multiplayer_modes`, `external_games`, migração de campos)
- [Fórum Twitch: armazenamento de dados da API](https://discuss.dev.twitch.com/t/storage-of-data-from-twitch-api/63884)
- [Twitch Developer Services Agreement](https://legal.twitch.com/en/legal/developer-agreement/) (texto não pôde ser lido)

**RAWG**
- [Termos de uso da API](https://rawg.io/tos_api)
- [Planos e documentação](https://rawg.io/apidocs)
- [Aviso sobre o acesso gratuito](https://medium.com/rawg/dont-lose-your-access-to-rawg-api-df46eca95090)

**Steam**
- [Steam Web API: página de desenvolvedores](https://steamcommunity.com/dev)
- [Termos de uso da Steam Web API](https://steamcommunity.com/dev/apiterms)
- [Steamworks: autenticação e OpenID](https://partner.steamgames.com/doc/features/auth)
- [Steamworks: IPlayerService](https://partner.steamgames.com/doc/webapi/IPlayerService)
- [Steamworks: ISteamUserStats](https://partner.steamgames.com/doc/webapi/ISteamUserStats)
- [Referência não oficial xPaw: IPlayerService](https://steamapi.xpaw.me/IPlayerService) e [IFamilyGroupsService](https://steamapi.xpaw.me/IFamilyGroupsService)
- [Suporte Steam: contas limitadas](https://help.steampowered.com/en/faqs/view/71D3-35C2-AD96-AA3A) e [guia que cita a restrição](https://nicconike.github.io/Steam-Stats/getting-started/prerequisites)
- [Fórum Steam: o que conta para os US$ 5](https://steamcommunity.com/discussions/forum/7/412446292754537839)
- [Fórum Steam: GetOwnedGames vazio para a própria conta](https://steamcommunity.com/discussions/forum/1/4333105935814636670)
- [Fórum Steam: erro 429 com chave nova](https://steamcommunity.com/discussions/forum/1/601902348018676495)
- Mudança de privacidade de 2018: [Engadget](https://www.engadget.com/2018/04/11/steam-new-privacy-features-disable-steam-spy/), [ComputerBase](https://www.computerbase.de/2018-04/steam-privacy-policy-game-details/)
- Limite do `appdetails`: [Medium](https://medium.com/codex/scraping-information-of-all-games-from-steam-with-python-6e44eb01a299), [apis.io](https://apis.io/rate-limits/steam/steam-rate-limits/)
- OpenID: [modern-passport-steam](https://github.com/easton36/modern-passport-steam), [better-auth-steam](https://www.pkgstats.com/pkg:better-auth-steam), [discussão no Auth.js](https://github.com/nextauthjs/next-auth/discussions/13431)
- [SteamDB: exemplo de caminho de capa com hash](https://steamdb.info/app/1643320/)

**Outras**
- [SteamGridDB API v2](https://www.steamgriddb.com/api/v2)
- Giant Bomb: [venda pela Fandom](https://about.fandom.com/news/fandom-sells-giant-bomb-to-independent-creators), [FAQ da nova gestão](https://giantbomb.com/articles/giant-bomb-is-under-new-ownership-heres-an-faq), [Community Spotlight de 13/12/2025](https://giantbomb.com/posts/the-community-spotlight-20251213)
- MobyGames: [documentação da API](https://www.mobygames.com/info/api/), [MobyPro](https://www.mobygames.com/mobypro/)
