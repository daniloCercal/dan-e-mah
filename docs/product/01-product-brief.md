# Product brief — Jogos em dupla

Nome provisório. Versão 0.1, 18/11/2026. Documento de interpretação: o que entendi do pedido e o que proponho. Itens marcados como **proposta** são decisões minhas, ainda não aprovadas.

## O que é

Um site privado, para duas pessoas (Danilo e Maellen), que guarda tudo o que a dupla jogou, está jogando e quer jogar. Ele é ao mesmo tempo biblioteca, diário e ferramenta de escolha.

Não é uma rede social, não tem perfil público e não precisa convencer ninguém a se cadastrar. Isso muda quase todas as decisões em relação a Backloggd, GG ou Steam: não há feed de estranhos, seguidores, moderação nem onboarding. Sobra espaço para o que esses produtos não fazem — tratar duas pessoas como a unidade principal.

## Para quem

| Pessoa | Como aparece no produto |
|---|---|
| Danilo | Nome próprio |
| Maellen | Nome próprio, com apelidos rotativos em saudações e pequenos momentos (Mahsterchef, Mahdame, Mahgnata, Mahnhosa, Mahmimada) |

Os dois têm os mesmos poderes. Não existe "dono" e "convidada".

## Onde será usado

**Principalmente no celular.** A tela de 375 px é a tela primária; o desktop é a adaptação. Consequências práticas:

- Navegação principal alcançável com o polegar (barra inferior).
- Filtros em painel que sobe de baixo, nunca em coluna lateral.
- Nada depende de passar o mouse por cima.
- Alvos de toque de pelo menos 44 px.
- Instalável na tela inicial do celular (PWA) já no MVP — **proposta**: sair da lista "a investigar" e entrar no MVP.

## As duas perguntas

1. **"O que vamos jogar hoje?"** — é a pergunta da tela inicial. A resposta precisa caber na primeira tela do celular, sem rolar: o que está em andamento, o que os dois querem, e um atalho para sortear.
2. **"O que já vivemos jogando juntos?"** — é a pergunta do diário e das estatísticas. Vem depois, mais abaixo ou em área própria.

## Objetivos

- Registrar um jogo em menos de 20 segundos, do toque em "Adicionar jogo" até salvar.
- Achar um jogo para hoje em no máximo três toques a partir da tela inicial.
- Cada pessoa avalia sozinha; a comparação só aparece quando existem as duas notas.
- Continuar rápido com centenas de jogos.
- Ter identidade própria: parecer feito para esta dupla.

## O que fica de fora

- Perfis públicos, feed social, seguidores, comentários de terceiros.
- Recomendações por IA paga. Sorteio e sugestões saem de filtros e regras simples.
- Loja, preços, alertas de promoção (pode ser investigado depois; não é MVP).
- Guardar cópias de imagens dos jogos em massa. As capas vêm da fonte do catálogo.

## O que faria o produto falhar mesmo funcionando

- Parecer um painel corporativo com tema de videogame.
- Exigir muitos campos para registrar um jogo.
- Mostrar a média da dupla quando só uma pessoa avaliou, ou assumir que os dois zeraram porque um zerou.
- Apresentar dado inventado como real (horas da Steam, estatísticas, metadados).
- Ser lento ou desajeitado no celular.
- Animação que atrasa uma ação.

## Regras de dados que afetam o design

- **Três estados por jogo:** o de Danilo, o de Maellen e o da dupla. São independentes.
- **Match:** os dois marcaram "quero jogar" e a dupla ainda não zerou nem abandonou.
- **Média conjunta e diferença:** só existem com duas notas.
- **Tempo da Steam é individual.** Não prova que uma sessão foi em dupla; sessões do diário são registradas à mão e mostradas separadas das horas importadas.

## Como vou medir se a primeira entrega serviu

Você consegue abrir as três direções no celular e no computador, navegar por início, biblioteca, filtros, detalhes e adicionar jogo, e dizer qual prefere — ou o que misturar.

## Perguntas em aberto para você

Estão reunidas em `docs/decisions/pendencias-de-aprovacao.md`.
