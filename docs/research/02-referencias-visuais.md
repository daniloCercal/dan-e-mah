# 02 — Referências visuais

Pesquisa feita em 2026-11-18 com busca e leitura de páginas públicas. Produto: app web privado para duas pessoas (biblioteca de jogos compartilhada + diário em dupla + descoberta "O que vamos jogar hoje?"), tela primária de 375px.

Direções a prototipar:

- **A — Cinematic Game Library**: escuro, capas grandes, editorial.
- **B — Cozy Co-op Club**: acolhedor, cor com personalidade, afetivo sem ser infantil.
- **C — Premium Interactive Arcade**: expressivo, motion, experimental.

Restrições do dono: nada de dashboard SaaS genérico, glassmorphism indiscriminado, gradiente sem função ou animação em toda parte.

## Como ler este documento

- "Não confirmado" marca tudo o que não foi possível verificar na fonte original nesta pesquisa.
- Várias páginas foram lidas por extração de texto, sem ver as imagens. Onde a descrição visual vem de legenda, resenha ou notícia (e não de inspeção da tela), isso está dito na própria referência.
- Nenhuma referência deve ser copiada; cada uma está aqui por um padrão específico.

## Acesso às fontes obrigatórias

| Fonte | Resultado | O que foi usado |
|---|---|---|
| 21st.dev | Acessível. Listagens e páginas de componente abrem sem login; instalar via CLI exige chave de API e a conta gratuita tem limite diário de cópias | Listagens de Docks, Carousels, Filters, Numbers; páginas individuais; Termos; artigo do blog sobre navegação mobile |
| mobbin.com | Home abre; a biblioteca (`/explore/...`) devolveu HTTP 403. A home diz que conta gratuita dá "acesso limitado" | Nada da biblioteca. Substituído por screensdesign.com (telas do Letterboxd) e pelo artigo da NN/g sobre bottom sheets |
| godly.design | Acessível, mas a curadoria atual é quase toda de sites de marketing de SaaS/IA; não há filtro por indústria, estilo ou tema | Nenhuma referência aproveitável para biblioteca de mídia. Registrado como achado negativo |
| awwwards.com | Acessível | Categoria Games & Entertainment; páginas de Grail e Trek Cards |
| dribbble.com | Busca e páginas de tag voltaram com conteúdo vazio para acesso automatizado | Só a existência das tags `game-library`, `game-tracker`, `dark_game_ui` via buscador. Nenhum shot individual foi inspecionado |
| github.com/yihui-dev/awesome-opus5-5-videos | Acessível (README, LICENSE, `data/videos.json` com 703 prompts) | Detalhado em `03-motion.md` |

Outras falhas: literal.club devolveu HTTP 403; a página de tvOS das Human Interface Guidelines da Apple veio sem corpo de texto.

---

## Referências

### 1. Letterboxd (iOS)

- **Link**: https://letterboxd.com/ · telas: https://screensdesign.com/apps/letterboxd/
- **Origem**: Letterboxd Ltd. Telas catalogadas por screensdesign.com (lidas por legenda, não por imagem).
- **Visualmente interessante**: tema escuro em que o pôster é o único elemento colorido; grade densa de pôsteres (uma tela descrita como quatro colunas com filtro no topo); estrelas verdes como único acento; diário como lista vertical agrupada por data.
- **Problema de UX que resolve**: registrar uma sessão em poucos toques. A ficha do filme tem uma barra inferior com quatro ações (Watch, Like, Rate, Watchlist) e o formulário de log é curto: nota, data, texto, toggles, salvar. Ordenação fica em menu separado do filtro.
- **Adaptação**: barra de ações fixa na ficha do jogo ("Jogamos hoje", "Zeramos", "Quero jogar", nota de cada um). Diário agrupado por data com as duas notas lado a lado. Serve **A** (estrutura e densidade) e **B** (diário).
- **Limitações e riscos**: quatro colunas a 375px deixa a capa com cerca de 80px; para biblioteca de casal (dezenas a poucas centenas de jogos) duas ou três colunas funcionam melhor. O modelo é individual + social, o nosso é uma dupla fechada: não importar feed, seguidores nem perfil público.
- **Licença**: marca e interface proprietárias. Só o padrão.

### 2. Steam Deck UI / Big Picture — "Big Art"

- **Link**: https://www.pcgamer.com/games/steams-latest-beta-brings-big-art-to-big-picture-mode-and-steam-deck-and-customizable-screensavers-too/ · contexto: https://pcgamer.com/at-long-last-the-steam-deck-ui-has-replaced-steams-big-picture-mode
- **Origem**: Valve. Descrição vinda de cobertura de imprensa sobre o beta; não há documentação de design oficial.
- **Visualmente interessante**: a home começa em "jogados recentemente"; no modo Big Art o carrossel desce e a arte do jogo em foco ocupa o fundo. Uma nota de atualização de 2025 diz que o item em destaque do carrossel passou a usar a imagem de cabeçalho maior.
- **Problema de UX que resolve**: "continuar de onde paramos" como primeira tela, sem obrigar a navegar pela biblioteca inteira.
- **Adaptação**: primeira dobra = "Jogando agora" com uma capa grande e o fundo tingido pela arte; a grade completa vem abaixo. Serve **A** diretamente.
- **Limitações e riscos**: foi desenhado para controle e tela horizontal; no celular o carrossel horizontal compete com o gesto de voltar do iOS nas bordas. Detalhes do beta podem ter mudado.
- **Licença**: proprietário. Capas de jogos são de seus detentores; ver nota sobre capas no final.

### 3. PlayStation 5 — home e Game Hub

- **Link**: https://gamespot.com/articles/playstation-5s-biggest-ui-changes-how-sony-is-reinventing-its-interface-for-ps5/1100-6483379/ · https://www.playstation.com/en-th/support/account/welcome-hub/
- **Origem**: Sony Interactive Entertainment. Fontes são notícias de 2020 em diante e a página de suporte.
- **Visualmente interessante**: destacar um jogo troca o fundo inteiro pela arte dele; cada jogo tem uma pilha de cartões (atividades, capturas, progresso).
- **Problema de UX que resolve**: dá contexto sem abrir a ficha, e o hub junta tudo de um jogo num lugar só.
- **Adaptação**: a ficha do jogo vira um "hub do casal": cartões empilhados com última sessão, notas dos dois, entradas do diário. Fundo com cor extraída da capa. Serve **A** e, na metáfora de pilha de cartões, **C**.
- **Limitações e riscos**: a troca de fundo depende de foco de controle. No toque não existe foco; a troca precisa ser acionada por item centralizado no scroll (scroll-snap) ou só acontecer na ficha. Trocar imagem de fundo em tela cheia a cada item é caro em celular.
- **Licença**: proprietário.

### 4. Plex — redesign mobile (2024–2025)

- **Link**: https://techcrunch.com/2025/03/31/streaming-service-plex-rolls-out-a-revamped-mobile-app · https://plex.tv/blog/the-new-plex-experience
- **Origem**: Plex Inc.; cobertura do TechCrunch, 9to5Mac e Engadget.
- **Visualmente interessante**: arte ampliada nas páginas de detalhe e logotipo do título no lugar de texto.
- **Problema de UX que resolve**: trocou o menu hambúrguer por abas inferiores; bibliotecas e watchlist ganharam lugar de primeiro nível.
- **Adaptação**: confirma abas inferiores com "Biblioteca" e "Quero jogar" no primeiro nível. Serve **A**; a decisão de navegação vale para as três.
- **Limitações e riscos**: logotipo do título exige um asset por jogo que nem toda fonte de metadados fornece; precisa de fallback tipográfico bom, o que pesa a favor de escolher bem a fonte de display.
- **Licença**: proprietário.

### 5. Playnite

- **Link**: https://playnite.link/ · temas: https://playnite.link/addons.html#themesDesktop
- **Origem**: projeto open source de Josef Nemec e comunidade.
- **Visualmente interessante**: a mesma biblioteca aparece em modo desktop e em modo fullscreen para controle, e os temas vão de troca de cor a layouts inteiros.
- **Problema de UX que resolve**: unifica jogos de várias lojas numa biblioteca só, com metadados e capas baixados automaticamente.
- **Adaptação**: campo "onde temos" (Steam, Switch, PS5, Game Pass) como filtro de primeiro nível; nosso caso também é multi-plataforma. A galeria de temas é um bom catálogo de variações de grade de capas para **A**.
- **Limitações e riscos**: é desktop e voltado a quem gosta de configurar; densidade e painéis laterais não cabem em 375px. A página oficial não descreve o painel de filtros (não confirmado).
- **Licença**: código sob MIT. Temas são de terceiros, cada um com licença própria: não reaproveitar assets sem checar.

### 6. Sofa

- **Link**: https://www.sofahq.com/
- **Origem**: Shawn Hickman / Astrio, LLC.
- **Visualmente interessante**: tom lúdico e personalizável (mais de 100 temas, formatos de lista ajustáveis); listas com imagem de capa, título grande e descrição.
- **Problema de UX que resolve**: separa "quero" de "terminei" com um logbook; oferece cinco modos de acompanhar, do checklist simples ao diário completo; listas inteligentes preenchidas por filtro.
- **Adaptação**: deixar o casal escolher a profundidade do registro (só marcar "jogamos" ou escrever uma entrada). Listas inteligentes como "Co-op local curtos", "Abandonados que merecem outra chance". Serve **B**.
- **Limitações e riscos**: é generalista e acumula recursos (planner, podcasts, viagens); copiar a amplitude dilui o produto. Mais de 100 temas é o oposto de uma direção de arte com opinião.
- **Licença**: proprietário.

### 7. GameTrack

- **Link**: https://www.macstories.net/reviews/gametrack-review-an-elegant-way-to-discover-track-and-share-videogames/
- **Origem**: app de Joe Kimberlin (autoria não confirmada nesta pesquisa); resenha do MacStories.
- **Visualmente interessante**: segundo a resenha, blocos guiados pela arte do jogo e painéis em estilo cartão funcionam especialmente bem no iPhone.
- **Problema de UX que resolve**: barra de abas com quatro seções (Lists, Discover, Activity, Statistics) cobre guardar, descobrir e lembrar.
- **Adaptação**: nosso equivalente em quatro destinos: Biblioteca, Hoje (descoberta), Diário, Nós. Serve **A** e **B**.
- **Limitações e riscos**: a mesma resenha diz que a navegação ainda parecia difícil; estatísticas tendem a virar dashboard, que o dono não quer. Se houver números, que sejam poucos e narrativos ("14 noites de co-op este ano").
- **Licença**: proprietário.

### 8. Backloggd

- **Link**: https://backloggd.com/
- **Origem**: Backloggd (site independente).
- **Visualmente interessante**: home construída só com capas: grade grande no topo e fileiras menores por seção.
- **Problema de UX que resolve**: estados claros (joguei, jogando, quero jogar), diário diário opcional, listas com progresso ou ranking.
- **Adaptação**: vocabulário de estados em português e pensado para dupla: "Jogando juntos", "Na fila", "Zeramos", "Largamos". Serve **A** (grade) e **B** (linguagem).
- **Limitações e riscos**: parede de capas sem hierarquia vira ruído; precisa de uma capa-herói por seção. A paleta não está descrita no texto da página (não confirmado).
- **Licença**: proprietário.

### 9. Are.na

- **Link**: https://www.are.na/about
- **Origem**: Are.na (empresa independente, financiada por assinantes). Usa a tipografia própria Areal, da Dinamo.
- **Visualmente interessante**: quase nenhum chrome; blocos em grade ou tabela, um único tipo de letra, modo escuro. A página não descreve o sistema visual em detalhe; a leitura de "minimalismo" é interpretação.
- **Problema de UX que resolve**: coleção colaborativa sem algoritmo: canais com colaboradores convidados e privacidade por canal (aberto, fechado, privado).
- **Adaptação**: listas como "canais" que os dois editam; um jogo pode estar em várias listas. Reforça que um app de duas pessoas não precisa de recomendação algorítmica: a descoberta é sorteio + filtros + o que o outro salvou. Serve **A** (contenção editorial).
- **Limitações e riscos**: a sobriedade pode ficar fria para um produto afetivo; não serve sozinha para **B**.
- **Licença**: proprietário; Areal é fonte comercial, não usar.

### 10. Literal

- **Link**: https://literal.club/
- **Origem**: Literal (clube de leitura social).
- **Status**: o site devolveu HTTP 403 ao acesso automatizado. Tudo abaixo é **não confirmado** nesta pesquisa e fica como hipótese a validar manualmente.
- **Hipótese de interesse**: estantes e clubes de leitura como modelo de "ler junto", transponível para "jogar junto" (destaques compartilhados, progresso lado a lado).
- **Adaptação**: se confirmado, serve **B**. Não basear decisões nesta referência antes de alguém abrir o site.
- **Licença**: não confirmado.

### 11. Apps para casais — Cozy Couples, Usie, Twyne Moments

- **Link**: https://screensdesign.com/apps/cozy-couples-relationship-app/ · https://apps.apple.com/app/id6757501446 (Usie) · https://apps.apple.com/app/id6754911019 (Twyne Moments)
- **Origem**: três apps independentes; descrições vindas das listagens de loja e do screensdesign.com. Nenhuma tela foi inspecionada.
- **Visualmente interessante**: Cozy Couples se apresenta como uma "casa" virtual que os dois constroem; Usie gira em torno de linha do tempo compartilhada e temas; Twyne se descreve como espaço privado e caloroso, sem feed público.
- **Problema de UX que resolve**: pareamento por código que coloca os dois num espaço só (padrão descrito também no estudo do app Smooch: https://contra.com/p/3AZFLZLL-smooch-a-shared-space-for-couples-or-i-os-app); sensação de lugar em vez de ferramenta.
- **Adaptação**: o app sempre sabe quem são os dois: cada pessoa tem uma cor e uma marca própria (inicial, selo), e toda entrada mostra de quem é. A linha do tempo do diário é o "lugar" do casal. Serve **B**.
- **Limitações e riscos**: o gênero escorrega para o infantil (corações, mascotes, tons pastel), justamente o que o briefing exclui. Aproveitar a estrutura (dupla, privacidade, linha do tempo) e descartar a estética.
- **Licença**: proprietários.

### 12. Grail (Awwwards Site of the Day, 2026-11-04)

- **Link**: https://www.awwwards.com/sites/grail · site: https://grail-app.com/
- **Origem**: creditado a "denormalized" no Awwwards.
- **Visualmente interessante**: paleta de duas cores apenas (ardósia escura `#182124` e off-white `#f2f0f0`); a página do Awwwards destaca preloader, "Totems", seção de stats e um "Quest Card Flow" como transição.
- **Problema de UX que resolve**: transforma progresso em estética de RPG sem parecer painel; nota de animação 8,00 e de performance 8,20 na avaliação de desenvolvedor.
- **Adaptação**: disciplina de duas cores + um acento para **C**; cartões de "missão" como modelo para a carta do jogo sorteado.
- **Limitações e riscos**: é um site promocional de rolagem com WebGL, Matter.js e Blender, não uma interface de uso diário. Acessibilidade foi a nota mais baixa (7,20). Inspirar a linguagem, não a tecnologia.
- **Licença**: proprietário.

### 13. Trek Cards (Awwwards Nominee, 2026-10-29)

- **Link**: https://www.awwwards.com/sites/trek-cards · site: https://trek.cards/
- **Origem**: enviado pelo usuário "trekcards"; estúdio não informado.
- **Visualmente interessante**: carta colecionável como unidade de interface; tags de ilustração, animação e transições. O Awwwards não descreve o visual em detalhe (não confirmado além das tags).
- **Problema de UX que resolve**: dá peso e valor a um item de coleção; a carta "ganha XP" ao ser usada, isto é, o objeto acumula história.
- **Adaptação**: em **C**, cada jogo é uma carta com frente (capa) e verso (história do casal com ele: noites jogadas, quem escolheu, nota de cada um). O verso enriquece com o uso.
- **Limitações e riscos**: estética de TCG pode deslizar para o gamer genérico; usa WebGL, que não se justifica para uma grade de capas.
- **Licença**: proprietário.

### 14. Bottom sheets — NN/g e Mobbin (via Eleken)

- **Link**: https://www.nngroup.com/articles/bottom-sheet/ · https://www.eleken.co/blog-posts/bottom-sheet-ui
- **Origem**: Nielsen Norman Group; Eleken cita exemplos do Mobbin (a biblioteca do Mobbin em si estava bloqueada).
- **Visualmente interessante**: não é referência estética, é de comportamento.
- **Problema de UX que resolve**: filtros sem sair da lista. Diretrizes da NN/g: suportar o botão/gesto Voltar para fechar; ter botão Fechar visível, sem depender só da alça; não empilhar sheets; usar só para interações curtas. A NN/g também diz que a alegação de que bottom sheet melhora o alcance do polegar é em grande parte incorreta. O padrão citado pela Eleken: a contagem de resultados atualiza enquanto o filtro é ajustado.
- **Adaptação**: vale para as três direções. Chips de filtro rápido em fileira horizontal acima da grade (plataforma, "co-op local", duração); o sheet "Filtros" guarda o resto e mostra o botão "Ver 12 jogos" com contagem viva. Uma sheet por vez.
- **Limitações e riscos**: arrastar para fechar conflita com rolagem interna; no Safari iOS o gesto de borda é do navegador.
- **Licença**: artigos; nada a reaproveitar além da orientação.

### 15. 21st.dev — Cover Flow (Louis Studios)

- **Link**: https://21st.dev/@louisstudios/components/cover-flow
- **Origem**: Louis Studios (`@louisstudios`).
- **Visualmente interessante**: capas giram em perspectiva, refletem no chão e deslizam com mola suave sobre um palco preto arredondado.
- **Problema de UX que resolve**: percorrer poucas capas dando peso a cada uma; aceita arrastar, rolar, clicar e setas do teclado.
- **Adaptação**: candidato ao sorteio em **C** ou à fileira "Jogando agora" em **A**, com até 8–10 capas. Não para a biblioteca inteira.
- **Limitações e riscos**: a página não lista dependências nem confirma toque (só "drag"): testar em iPhone real antes de adotar. Reflexo e perspectiva em 3D custam GPU.
- **Licença**: a página indica MIT. Os Termos do 21st.dev valem por cima (ver seção de componentes).

### 16. Dribbble — tags de biblioteca e tracker de jogos

- **Link**: https://dribbble.com/tags/game-library · https://dribbble.com/tags/game-tracker · https://dribbble.com/tags/dark_game_ui
- **Origem**: vários autores. O acesso automatizado voltou vazio; só os títulos apareceram no buscador ("Gaming Hub Mobile App", "Sleek Game Store App UI", "Gamer Game Launcher App", "LandCrate - MTG Collection Tracker").
- **Uso recomendado**: referência **negativa** e de exploração manual. Pelo que os títulos indicam, o material tende ao "gaming dashboard" com neon e cartões de vidro que o dono rejeitou. Vale abrir à mão para catalogar o que evitar e garimpar tratamentos de capa.
- **Limitações e riscos**: shots de conceito raramente resolvem estados reais (vazio, erro, título longo, capa ausente).
- **Licença**: cada shot pertence ao autor; não copiar.

### Referências tentadas e descartadas

- **godly.design**: 24 sites listados na página de Websites, todos de produto SaaS/IA (Cofounder, Gumloop, Griffin, Lightspark etc.). Útil apenas como amostra do que "SaaS genérico bem-feito" parece hoje, isto é, do que não fazer aqui.
- **Apple TV / tvOS HIG**: página sem corpo legível; não confirmado. Não usar como fonte.
- **MUBI**: a busca só achou trabalho de marca (Pentagram "MUBI Remix": https://www.pentagram.com/work/mubi-remix; Spin: https://spin.co.uk/projects/mubi, que cita a tipografia LL Riforma e uso expansivo de cor). Nenhum estudo do app mobile foi encontrado. Pode valer uma olhada manual para **A**, sem base suficiente para entrar na lista.
- **Xbox**: só notícias do redesign do app de PC (barra lateral Home/Biblioteca/Game Pass/Loja); nada útil para mobile.

---

## Componentes do 21st.dev que valem reaproveitar

Licença informada na página de cada componente no dia da pesquisa. "unknown" é o texto literal exibido pelo 21st.dev.

| Componente | Link | Autor | Dependências | Licença | Uso sugerido |
|---|---|---|---|---|---|
| Chip (filter chips) | https://21st.dev/@robertlib/components/chip/filter-chips | robertlib | lucide-react | MIT | Chips de filtro com estado pressionado e remoção. A, B, C |
| Chip (multi-select group) | https://21st.dev/@alexisroe/components/chip/multi-select-group | alexisroe | não confirmado | não confirmado | Alternativa para seleção múltipla |
| Animated Drawer | https://21st.dev/@arihantcodes_1f7b8c4d/components/animated-drawer | Arihant Jain (Spectrum UI) | vaul, motion, lucide-react, react-use-measure | Apache-2.0 | Sheet de filtros que muda de altura entre vistas (filtros → ordenar) sem empilhar |
| Smart Popover | https://21st.dev/community/components/sshahaider/smart-popover | sshahaider | Radix Popover + Vaul | não confirmado | Popover no desktop, drawer no mobile, com contexto único |
| Sliding Number | https://21st.dev/@ibelick/components/sliding-number | Julien Thibeaut (Motion Primitives) | motion, react-use-measure | MIT | Contadores do diário ("14 noites"), nota animada |
| Cover Flow | https://21st.dev/@louisstudios/components/cover-flow | Louis Studios | não informado | MIT | Sorteio em C; "Jogando agora" em A |
| Bottom Nav Bar | https://21st.dev/@arunachalam/components/bottom-nav-bar | Arunachalam | lucide-react, framer-motion | unknown | Só como referência de comportamento (pílula ativa com rótulo). Não copiar o código sem licença clara; além disso, esconder o rótulo das abas inativas contraria a recomendação do próprio blog do 21st.dev |
| CardStack | https://21st.dev/@ruixen.ui/components/card-stack | Ruixen UI | next, lucide-react, framer-motion | unknown | Só referência para a pilha do sorteio; reimplementar |
| BeUI Bottom Sheet | https://21st.dev/@starc007/components/beui-bottom-sheet | Saurabh (starc007) | clsx, motion, tailwind-merge | unknown | Não adotar; preferir Vaul diretamente |

Bibliotecas de base, licenças verificadas no arquivo LICENSE de cada repositório: **Vaul** (MIT, Emil Kowalski), **Motion** (MIT, Motion B.V.), **canvas-confetti** (ISC, Kiril Vatev).

**Termos do 21st.dev** (https://21st.dev/terms), em resumo:

- Não definem uma licença única; o código continua sendo do autor e da 21st Labs, e cada componente tem a própria licença.
- Demos, previews, capturas e descrições do site não vêm junto com o código.
- Se o componente deriva de trabalho open source, manter a licença original e o crédito.
- Republicar componentes em outros sites exige link visível para a página original.
- Uso comercial não é tratado diretamente.

Para um app privado de duas pessoas, o risco prático é baixo, mas a regra simples é: adotar só MIT/Apache-2.0 (mantendo o aviso de copyright no arquivo) e reescrever o que estiver como "unknown".

**Recomendações do blog do 21st.dev sobre navegação mobile** (https://21st.dev/blog/react-mobile-navigation-components), que adotamos:

- 3 a 5 destinos sempre visíveis, todos com rótulo, alvos de pelo menos 44×44.
- Estado ativo que não dependa só de cor.
- `padding-bottom: env(safe-area-inset-bottom)` com `viewport-fit=cover`; `100dvh` no lugar de `100vh`.
- Docks com efeito de ampliação dependem de hover e degradam no toque: não usar em telefone.
- Feedback de toque em `:active` (leve redução de escala), nunca em hover.

---

## Síntese por direção

Contrastes calculados pela fórmula WCAG 2.x. Fontes: existência confirmada consultando a API do Google Fonts (`fonts.googleapis.com/css2`) e a da Fontshare (`api.fontshare.com/v2/css`) em 2026-11-18. As licenças das fontes não foram lidas uma a uma: conferir a licença de cada família antes de publicar (não confirmado).

### A — Cinematic Game Library

**Paleta**

| Papel | Hex | Observação |
|---|---|---|
| Fundo | `#0B0B0D` | Quase preto, levemente frio |
| Superfície | `#17171B` | Cartões e sheets |
| Texto | `#F2EEE6` | Off-white quente; 16,99:1 sobre o fundo |
| Texto secundário | `#9A958C` | 6,6:1 sobre o fundo |
| Acento | `#E8B04A` | Âmbar de letreiro; 10,06:1. Usado em um elemento por tela |
| Alerta / "largamos" | `#C8553D` | 4,52:1 |
| Tinta dinâmica | derivada da capa | Só no fundo da ficha e da tela "hoje", sempre sob um véu escuro que preserve o contraste do texto |

O único gradiente é o véu que escurece a base da arte para o título ficar legível: tem função.

**Fontes**

- Principal: **Instrument Serif** (display, Google Fonts) + **Hanken Grotesk** (texto, Google Fonts) + **DM Mono** (metadados: plataforma, horas, datas).
- Alternativa: **Boska** + **Switzer** (ambas Fontshare).
- Alternativa mais dura: **Gloock** + **Schibsted Grotesk** (Google Fonts).

**Navegação mobile**: barra inferior fixa com quatro destinos rotulados (Biblioteca, Hoje, Diário, Nós), opaca, sem blur. O cabeçalho encolhe ao rolar. Filtros rápidos em chips horizontais sob o cabeçalho; o resto num bottom sheet único com contagem viva.

**Cards e capas**: capa em proporção de pôster (2:3), duas colunas, canto de 6px, sem borda, sem sombra e sem texto por cima. Título e uma linha de metadado em mono abaixo. A primeira dobra traz uma capa-herói em largura total ("Jogando agora"). Estado indicado por uma etiqueta tipográfica pequena, não por selo colorido.

**Momento assinatura — "Sessão de hoje"**: ao sortear, a tela escurece, a capa escolhida cresce até virar o fundo e o título sobe por uma linha de máscara em Instrument Serif, com um crédito no estilo de abertura de filme ("uma escolha de [quem pediu o sorteio]"). É a única animação longa do app (cerca de 900ms).

**Referências que sustentam**: 1, 2, 3, 4, 8, 9.

### B — Cozy Co-op Club

**Paleta**

| Papel | Hex | Observação |
|---|---|---|
| Fundo | `#F6EEDF` | Papel creme |
| Superfície | `#FFF9EE` | Cartões |
| Tinta | `#2B2320` | Marrom-café; 13,35:1 sobre o fundo |
| Texto secundário | `#6F625A` | 5,1:1 |
| Jogador 1 | `#C24A2C` | Terracota. Texto claro sobre ela: 4,65:1. Como texto sobre o creme dá 4,23:1: usar só em preenchimentos e texto grande |
| Jogador 2 | `#4F6B41` | Musgo; 5,19:1 sobre o creme, 5,71:1 com texto claro |
| Destaque | `#E9B44C` | Mostarda, sempre com tinta escura por cima (8,14:1) |
| Apoio | `#6B3F5C` | Ameixa; 7,31:1 |

A regra que dá personalidade: cada pessoa tem uma cor, e a cor significa "de quem é isto". Nunca distinguir os dois só pela cor: acompanhar de inicial ou selo. Versão escura sugerida, não testada: fundo `#231C1A`.

**Fontes**

- Principal: **Fraunces** (display, eixos de suavidade e "wonk"; Google Fonts) + **Figtree** (texto, Google Fonts).
- Alternativa: **Bricolage Grotesque** (display) + **Newsreader** (texto longo do diário), ambas Google Fonts.
- Alternativa mais arredondada: **Gabarito** + **Onest** (Google Fonts). Mais perto do infantil; usar com cuidado.

**Navegação mobile**: barra inferior com três destinos rotulados (Estante, Diário, Nós) e um botão central elevado "Hoje?" que abre o sorteio. Chips de filtro com cantos bem arredondados logo abaixo do título da página.

**Cards e capas**: capa com moldura clara e canto de 12px, levemente inclinada (1 a 2 graus) nas listas curtas e reta na grade. Sombra curta e dura em vez de blur. Entradas do diário como cartões de papel com data manuscrita em Fraunces itálica e as marcas dos dois. Sem mascote, sem coração, sem emoji decorativo.

**Momento assinatura — "Carimbo a dois"**: ao marcar um jogo como zerado, cada pessoa bate o próprio carimbo (na sua cor) no cartão do jogo. Com os dois carimbos, o cartão vai para a página "Zeramos juntos" do diário. Cada carimbo é uma animação de 250ms com leve rotação e marca de tinta.

**Referências que sustentam**: 1 (diário), 6, 7, 10 (se confirmada), 11.

### C — Premium Interactive Arcade

**Paleta**

| Papel | Hex | Observação |
|---|---|---|
| Fundo | `#101014` | Tinta |
| Superfície | `#1B1B22` | Cartas |
| Texto | `#F3F1EA` | 16,8:1 |
| Texto secundário | `#9C99A8` | 6,81:1 |
| Acento primário | `#C8F53C` | Lima; 14,99:1. Sempre com texto escuro por cima |
| Acento secundário | `#6C4DFF` | Ultravioleta como preenchimento (texto claro: 4,48:1, só texto grande). Para texto sobre o fundo usar `#9B85FF` (6,5:1) |
| Sinal | `#FF5A4E` | Coral; 6,17:1 |

Cores chapadas, sem brilho neon nem gradiente: a energia vem do movimento e da tipografia, seguindo a disciplina de duas cores + acento da referência 12.

**Fontes**

- Principal: **Anybody** (display de largura variável, bom para animar o eixo de largura; Google Fonts) + **Familjen Grotesk** (texto, Google Fonts) + **Martian Mono** (números e contadores, Google Fonts).
- Alternativa: **Clash Display** (Fontshare) + **Schibsted Grotesk** (Google Fonts).
- Alternativa mais extrema: **Panchang** + **Supreme** (ambas Fontshare).

**Navegação mobile**: barra flutuante em pílula, opaca, com três destinos rotulados e um indicador que estica entre as abas, mais um botão redondo "Sortear" à direita. Respeitar área segura e alvos de 44px. Na tela de sorteio, a pilha aceita arrastar, com botões equivalentes para quem não usa gesto.

**Cards e capas**: cada jogo é uma carta com frente (capa sangrada, canto de 14px) e verso (história do casal com o jogo). Toque: a carta afunda (escala 0,97) e volta com mola; toque longo vira a carta. Grade de duas colunas com cartas em alturas alternadas.

**Momento assinatura — "Baralho da noite"**: segurar o botão Sortear embaralha uma pilha de capas (a velocidade segue o tempo de pressão); ao soltar, uma carta salta, vira e pousa, e o fundo é inundado pela cor dominante da capa a partir do ponto do toque.

**Referências que sustentam**: 3 (pilha de cartões), 12, 13, 15.

---

## Notas transversais

- **Capas de jogos**: são material protegido dos detentores. Em app privado de duas pessoas o risco é baixo, mas a fonte das capas (IGDB, SteamGridDB, RAWG etc.) tem termos próprios de API e de atribuição que não foram pesquisados aqui (não confirmado). Decidir a fonte antes de fechar proporções de card, porque cada uma entrega formatos diferentes.
- **Sem hover**: nenhuma informação ou ação pode depender de hover em nenhuma das três direções.
- **Capa ausente e título longo**: todo protótipo deve mostrar esses dois estados; é onde as direções mais se diferenciam e onde conceitos de Dribbble costumam falhar.
- **Validação manual pendente**: Mobbin (telas de filtro e de log), Dribbble (tags listadas), literal.club, MUBI mobile.
