# 03 — Motion

Pesquisa feita em 2026-11-18. Fonte principal: repositório https://github.com/yihui-dev/awesome-opus5-5-videos (README, LICENSE e `data/videos.json` lidos na íntegra por script; 15 prompts lidos um a um).

## O que é o repositório e o que ele não é

- Coleção de 703 prompts (369 de motion graphics, 117 de 3D, 116 explicativos, 101 interativos) usados para gerar **vídeos** por código, com link para o post original de cada criador no X.
- Tecnologias marcadas nos prompts: canvas (267), SVG (183), Three.js (131), shaders (92), GSAP (86), CSS (57).
- Licença do repositório: MIT. O README ressalva que vídeos e prompts pertencem aos criadores. Tratamos os prompts como inspiração de técnica, sem copiar texto nem assets.

Três limites importantes para o nosso uso:

1. **São filmes, não interfaces.** Os melhores prompts mandam calcular cada quadro como função pura do tempo (`seek(t)`), sem transições CSS nem estado, e renderizar com Playwright + ffmpeg com subquadros para motion blur. Nada disso se aplica a um app; o que se aproveita é a direção de arte do movimento.
2. **Quase tudo é dirigido por cursor.** Cliques, arrastos e tooltips de hover. Precisam ser traduzidos para toque.
3. **Só 3 dos 703 prompts mencionam "reduced"** (motion reduzido) e nenhum trata disso como requisito de produto. Toda a coluna de `prefers-reduced-motion` abaixo é decisão nossa, não da fonte.

O achado mais útil do repositório não é um efeito, e sim as **listas de proibições** que se repetem nos prompts mais bem acabados (twoclipping, rossaxbt, flxrnc, ultimaxbt): nada de easing saltitante, explosão de partículas, brilhos, gradiente no chrome da interface, tempo morto ou "qualquer coisa que pareça template". Coincide com as restrições do dono.

## Verificações pedidas

### Licença do GSAP

- Fonte: https://gsap.com/community/standard-license/ (vigente desde 2025-04-30) e https://webflow.com/blog/gsap-becomes-free.
- **Gratuito, inclusive para uso comercial, com todos os plugins**, incluindo os que eram pagos (SplitText, MorphSVG). Não exige chave nem cadastro.
- **Não é open source.** É a licença proprietária "Standard no charge"; a Webflow detém a propriedade intelectual e pode revogar o acesso em caso de descumprimento.
- Restrição relevante: proibido usar em ferramentas visuais/no-code de animação que concorram com a Webflow. Não é o nosso caso. O FAQ diz que código GSAP gerado por IA não é uso proibido.
- Versão vista no jsDelivr: 3.15.0.
- **Conclusão para o projeto**: a licença não impede o uso, mas o GSAP não é necessário. O que planejamos se resolve com CSS, View Transitions e Motion (MIT). Adotar GSAP só se uma direção exigir linha do tempo complexa ou SplitText, e nesse caso carregar sob demanda.

### View Transitions API no Safari iOS

- Fonte: https://caniuse.com/view-transitions e https://caniuse.com/cross-document-view-transitions; documentação do Chrome em https://developer.chrome.com/docs/web-platform/view-transitions.
- **Mesmo documento (SPA)**: Safari e Safari iOS a partir da **18.0**. Firefox a partir da 144. Cobertura global informada: 93,17%.
- **Entre documentos (MPA)**: Safari iOS a partir da **18.2**. A documentação do Chrome lista Firefox como sem suporte.
- Eventos `pageswap`/`pagereveal`: a documentação do Chrome lista Safari 26.2.
- Grupos aninhados de view transition (Chrome 140): listados como não suportados no Safari numa página de outubro de 2025; pode estar desatualizado (não confirmado).
- iOS 17 e anteriores não têm suporte: a navegação acontece sem animação, o que é um fallback aceitável.
- Interação com o gesto de voltar pela borda no iOS (risco de animação dupla): não confirmado nesta pesquisa; testar em aparelho.
- **React**: o componente `<ViewTransition>` ficou estável no React 19.3 (post de 2026-09-09 em https://react.dev/blog/2026/09/09/react-19-3); antes disso só existia em canary. Usa a API nativa e simplesmente não anima onde ela falta.
- **Next.js**: as fontes divergem. A documentação do 16.2 descreve `experimental.viewTransition: true`; um rastreador de releases de julho de 2026 menciona a remoção desse flag. Não confirmado: checar as notas da versão que o projeto usar.

### Motion (antigo Framer Motion)

- Licença MIT (arquivo LICENSE do repositório `motiondivision/motion`).
- `layoutId` faz transição de elemento compartilhado com transforms, sem animar largura e altura; para voltar à origem precisa de `AnimatePresence` (https://motion.dev/docs/react-layout-animations).
- Diferente da View Transitions API, permite vários elementos com o mesmo `layoutId`.
- Animar por escala pode distorcer `border-radius` e `box-shadow`; a biblioteca corrige quando esses valores são passados por `style`.
- A opção `reducedMotion` do `MotionConfig` não aparece na página lida: não confirmado nesta pesquisa; conferir na documentação antes de depender dela.

## Regras de base (valem para as três direções)

- Animar só `transform` e `opacity`. Nada de animar `width`, `height`, `top`, `filter: blur()` ou `box-shadow` em listas.
- Sem hover. Todo feedback nasce de `:active`/`pointerdown`.
- Durações: 120–200ms para feedback, 250–400ms para navegação, até 900ms para o momento assinatura da direção, que é único.
- Com `prefers-reduced-motion: reduce`: sem deslocamento, escala, rotação ou partículas; sobra, no máximo, um crossfade de até 150ms. Nenhuma informação pode existir só na animação.
- Dois cuidados tirados dos prompts: não aplicar `opacity` ou `filter` num elemento com `preserve-3d` (ele achata e as duas faces aparecem; aplicar no wrapper), e não pôr `will-change` em algo que será escalado com texto dentro (o texto borra).

---

## Ideias avaliadas

### 1. Capa → detalhes como elemento compartilhado

- **Fonte**: princípio "nada corta: cada cena nasce da anterior" e "botões se expandem em páginas" dos prompts `rossaxbt-312793` (https://x.com/rossaxbt/status/2107483570885312793) e `ultimaxbt-549714` (https://x.com/ultimaxbt/status/2108210884799549714).
- **Uso**: transição capa→detalhes.
- **Técnica**: View Transitions API com `view-transition-name` único por capa (via `<ViewTransition>` do React 19.3 ou `document.startViewTransition`). Alternativa: `layoutId` do Motion se for preciso interromper a transição no meio do gesto.
- **Custo no mobile**: baixo a médio. O navegador anima capturas na GPU. O custo real é a imagem: usar a mesma URL de capa nas duas telas para não decodificar de novo, e nomear só a capa tocada, não a grade toda.
- **Reduced motion**: troca instantânea ou crossfade de 150ms, definido em `@media (prefers-reduced-motion: reduce)` sobre `::view-transition-group(*)`.
- **Veredito**: **usar**. É a transição mais valiosa do app e degrada sozinha em iOS 17.

### 2. Entrada da biblioteca em cascata curta

- **Fonte**: "nome, número e tipo aparecem em cascata rápida" em `thegrootdev-966114` (https://x.com/TheGrootDev/status/2103516567824966114); "sem tempo morto" em `twoclipping-402193`.
- **Uso**: entrada na biblioteca.
- **Técnica**: CSS puro. `@keyframes` de opacidade + 8px de translação, com `animation-delay` calculado por índice (`calc(var(--i) * 30ms)`), aplicado só aos 6–8 cards da primeira dobra e só na primeira visita da sessão.
- **Custo no mobile**: muito baixo. O risco é atrasar a percepção de conteúdo: a cascata inteira deve terminar em menos de 400ms.
- **Reduced motion**: sem animação; os cards já aparecem.
- **Veredito**: **usar**, com o limite de itens. Cascata na grade inteira ou a cada volta para a tela: descartar.

### 3. Revelação do sorteio: embaralhar, virar, pousar

- **Fonte**: faixa de cartões que desliza e pousa no escolhido, que então se eleva com uma pílula "Best match", em `ultimaxbt-549714`; molas fechadas com overshoot mínimo (amortecimento 0,72, assentamento em 0,35s) em `flxrnc-251921` (https://x.com/flxrnc/status/2108242454105251921).
- **Uso**: revelação do jogo sorteado.
- **Técnica**: Motion for React. Pilha de até 5 capas com `transform` (translação, rotação pequena, escala); a carta escolhida vira com `rotateY` e pousa com mola. **O resultado é decidido antes da animação**; ela só encena.
- **Custo no mobile**: médio. Manter no máximo 5 elementos animados e imagens já carregadas; `backface-visibility: hidden` nas duas faces.
- **Reduced motion**: sem embaralhar nem virar; a capa escolhida aparece com crossfade e o nome é anunciado em região `aria-live`.
- **Veredito**: **usar**. É o momento assinatura de C e, em versão sóbria (sem virar, só crescer), o de A. Precisa de um toque para pular.

### 4. Feedback de toque: afundar e voltar

- **Fonte**: "arrastos são manipulação direta: ao soltar, volta com mola de onde estava" em `twoclipping-402193` (https://x.com/twoclipping/status/2103273003555402193). Convergente com a recomendação do blog do 21st.dev de usar `:active` com leve redução de escala (https://21st.dev/blog/react-mobile-navigation-components).
- **Uso**: interação de cards no toque.
- **Técnica**: CSS. `:active { transform: scale(0.97) }` com transição de 120ms para entrar e 200ms para sair. Opcional em C: `whileTap` do Motion com mola.
- **Custo no mobile**: desprezível.
- **Reduced motion**: trocar escala por mudança de opacidade ou de fundo.
- **Veredito**: **usar** em tudo que é tocável. Substitui todos os estados de hover.

### 5. Celebração ao zerar: uma rajada, uma vez

- **Fonte**: confete caindo depois do título em `ayi-ainotes-933194` (https://x.com/AYi_AInotes/status/2106784005911933194). Contrapeso: "explosão de partículas" está na lista de proibições de quatro dos prompts mais polidos.
- **Uso**: celebração ao zerar um jogo.
- **Técnica**: canvas, com `canvas-confetti` (ISC), em rajada única de cerca de 80 partículas nas cores dos dois jogadores, disparada do ponto do toque, seguida do carimbo (ideia 6). Carregar a biblioteca sob demanda.
- **Custo no mobile**: médio por cerca de 1,5s, depois zero. O canvas deve ser removido ao terminar. A biblioteca oferece execução em worker e a opção `disableForReducedMotion` (conferir na documentação: não confirmado nesta pesquisa).
- **Reduced motion**: sem partículas; fica só o selo "Zeramos" aparecendo com fade.
- **Veredito**: **usar**, com a regra de raridade: só no evento de zerar, nunca em ações rotineiras. É justamente por ser o único efeito de partícula do app que ele funciona.

### 6. Carimbo / selo com assentamento

- **Fonte**: "amortecimento firme, overshoot minúsculo" em `thegrootdev-966114` e `rossaxbt-707651` (https://x.com/rossaxbt/status/2107121188027707651).
- **Uso**: celebração ao zerar (direção B) e confirmações.
- **Técnica**: CSS `@keyframes`: escala 1,4 → 1 com rotação de 4 graus e opacidade, 250ms, curva com leve overshoot.
- **Custo no mobile**: muito baixo.
- **Reduced motion**: fade simples.
- **Veredito**: **usar** em B; **talvez** em A e C.

### 7. Título que sobe por uma linha de máscara

- **Fonte**: "o texto sobe de uma linha de máscara" em `ultimaxbt-549714`; "revelações de tipo mascaradas" em `twoclipping-000267` (https://x.com/twoclipping/status/2102554209166000267).
- **Uso**: ficha do jogo e tela do sorteado (direção A).
- **Técnica**: CSS. Wrapper com `overflow: hidden` e o texto entrando com `translateY(100%) → 0`, por linha e não por letra. Sem SplitText.
- **Custo no mobile**: muito baixo.
- **Reduced motion**: texto estático.
- **Veredito**: **talvez**. Bonito em A, mas só para o título principal; em mais de um elemento por tela vira maneirismo.

### 8. Inundação de cor a partir do toque

- **Fonte**: "um círculo se abre a partir do botão para uma cena escura" em `twoclipping-000267`; "a cor inunda a partir de um objeto e depois encolhe para outro" em `ultimaxbt-549714`; íris em `twoclipping-747965`.
- **Uso**: revelação do sorteado (C) e abertura/login.
- **Técnica**: View Transitions com `clip-path: circle()` animado no `::view-transition-new(root)`, com origem nas coordenadas do toque. Alternativa: pseudo-elemento circular com `transform: scale()`.
- **Custo no mobile**: médio. `clip-path` em tela cheia repinta a cada quadro; a versão com `transform: scale()` é mais barata. Testar em aparelho intermediário.
- **Reduced motion**: crossfade.
- **Veredito**: **talvez**. Vale no sorteio de C; no login, uma vez só. Em navegação comum, descartar.

### 9. Indicador de aba que estica

- **Fonte**: "as duas bordas do indicador seguem molas diferentes, então a da frente estica antes da de trás" em `twoclipping-402193`.
- **Uso**: transições de navegação (barra inferior de C).
- **Técnica**: Motion. Um elemento com `layoutId` compartilhado entre as abas dá o deslize; o efeito de esticar exige animar as bordas separadamente (`scaleX` com `transform-origin` alternado).
- **Custo no mobile**: baixo.
- **Reduced motion**: o indicador troca de lugar sem deslizar.
- **Veredito**: **talvez**. A versão simples (deslize com `layoutId`) entra em C; a versão com duas molas só se sobrar tempo.

### 10. Uma forma, nunca cortada: do login à biblioteca

- **Fonte**: conceito central de `twoclipping-402193`, `flxrnc-251921` e `thegrootdev-966114`: um único elemento muda de tamanho, raio e cor entre estados, e o conteúdo troca com um blur curto (12px, 0,15s).
- **Uso**: abertura/login. O botão "Entrar" vira carregador, vira confirmação e se expande até virar a tela da biblioteca.
- **Técnica**: Motion com `layout`/`layoutId`, ou View Transitions com o botão nomeado.
- **Custo no mobile**: médio. O blur de troca de conteúdo é a parte cara; substituir por fade.
- **Reduced motion**: estados trocam com fade, sem morph.
- **Veredito**: **talvez**. Cabe em C como abertura; exagerado para A e B, onde um fade com a marca basta. O login acontece raramente num app de duas pessoas com sessão persistente, então o retorno sobre o esforço é baixo.

### 11. Números que rolam

- **Fonte**: "o contador rola de F 000 a F 840" e "trocas de palavra rolam na vertical" em `flxrnc-251921`.
- **Uso**: contadores do diário, nota do jogo.
- **Técnica**: componente Sliding Number (Motion Primitives, MIT, https://21st.dev/@ibelick/components/sliding-number) ou CSS com `translateY` por dígito. Usar `font-variant-numeric: tabular-nums`.
- **Custo no mobile**: baixo.
- **Reduced motion**: valor final direto.
- **Veredito**: **talvez**. Só quando o número muda por ação da pessoa; nunca como contagem decorativa ao abrir a tela.

### 12. Carrossel 3D com reflexo no chão

- **Fonte**: `twoclipping-000267`; componente equivalente: Cover Flow no 21st.dev.
- **Técnica**: CSS 3D (`perspective`, `preserve-3d`) com Motion.
- **Custo no mobile**: alto. Muitas camadas compostas, e o reflexo duplica as imagens.
- **Reduced motion**: lista horizontal plana.
- **Veredito**: **descartar** para a biblioteca. Admissível apenas como variante do sorteio em C, com até 5 capas e sem reflexo.

### 13. Holofote "raio-x" que segue o cursor

- **Fonte**: `iamtanzil-120030` (https://x.com/iamtanzil_/status/2103459843831120030): `mask-image` em CSS seguindo o mouse.
- **Custo no mobile**: irrelevante, porque depende de hover.
- **Veredito**: **descartar**. Sem ponteiro, não existe.

### 14. Câmera que dá zoom, sincronia com batida, motion blur por subquadros

- **Fonte**: quase todos os prompts de twoclipping, rossaxbt e flxrnc.
- **Veredito**: **descartar**. São técnicas de vídeo renderizado; num app, zoom de câmera desorienta e som sincronizado não tem lugar.

### 15. Three.js, shaders e partículas contínuas

- **Fonte**: 131 prompts com Three.js e 92 com shaders.
- **Custo no mobile**: alto em bateria, peso de bundle e aquecimento.
- **Veredito**: **descartar**. Nenhuma tela de biblioteca, diário ou sorteio precisa de WebGL. Fundo animado permanente também contraria "sem animação em toda parte".

---

## Resumo por uso

| Uso | Ideia | Técnica | Veredito |
|---|---|---|---|
| Entrada na biblioteca | 2. Cascata curta | CSS | Usar |
| Capa → detalhes | 1. Elemento compartilhado | View Transitions (ou Motion `layoutId`) | Usar |
| Revelação do sorteado | 3. Embaralhar, virar, pousar | Motion | Usar |
| Revelação do sorteado | 8. Inundação de cor | View Transitions / CSS | Talvez |
| Celebração ao zerar | 5. Rajada única de confete | canvas | Usar |
| Celebração ao zerar | 6. Carimbo | CSS | Usar em B |
| Transições de navegação | 9. Indicador que estica | Motion | Talvez |
| Cards no toque | 4. Afundar e voltar | CSS | Usar |
| Abertura / login | 10. Uma forma, nunca cortada | Motion / View Transitions | Talvez |
| Tipografia | 7. Linha de máscara | CSS | Talvez |
| Números | 11. Dígitos que rolam | Motion / CSS | Talvez |
| — | 12 a 15 | — | Descartar |

## Pilha recomendada

1. **CSS** para feedback de toque, cascata, carimbo e máscara de texto.
2. **View Transitions API** para capa→detalhes e navegação, com iOS 17 caindo em troca sem animação.
3. **Motion** (MIT) só onde há gesto ou mola interrompível: pilha do sorteio, indicador de aba, sheets (via Vaul).
4. **canvas-confetti** (ISC) carregado sob demanda para o evento de zerar.
5. **GSAP**: não adotar por padrão.

## Pendências de teste em aparelho

- Transição capa→detalhes no Safari iOS 18 com o gesto de voltar pela borda.
- Sorteio com 5 capas em um Android intermediário.
- Inundação de cor com `clip-path` em tela cheia, comparada com a versão por `transform`.
- Todas as telas com "Reduzir movimento" ligado no sistema.
