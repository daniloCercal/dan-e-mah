# Mapa da experiência

Versão 0.1, 18/11/2026. Proposta para validar junto com os protótipos.

## Navegação

Quatro destinos e uma ação. No celular ficam numa barra inferior; no desktop, numa barra superior.

| Posição | Destino | Pergunta que responde |
|---|---|---|
| 1 | Início | O que vamos jogar hoje? |
| 2 | Biblioteca | O que temos? |
| centro | **Adicionar jogo** (ação) | — |
| 3 | Diário | O que já vivemos? |
| 4 | Nós | Como somos como dupla? (estatísticas, preferências, contas vinculadas) |

Busca não é um destino: mora no topo da Biblioteca e dentro de "Adicionar jogo".

## Páginas

### Início
Ordem de cima para baixo, no celular:

1. Saudação curta com o nome (ou apelido) de quem está vendo.
2. **Continuar** — o jogo em andamento mais recente, com acesso em um toque.
3. **Sortear** — o atalho para "O que vamos jogar?".
4. **Nós dois queremos jogar** — os matches, em fila horizontal.
5. **Falta a sua nota** — só aparece se existir jogo zerado sem avaliação de quem está vendo.
6. **Últimas sessões** — três entradas do diário.

Sem bloco de estatísticas na tela inicial. Números vivem em "Nós".

### Biblioteca
- Busca, botão de filtros com contador, ordenação, alternância grade/lista.
- Atalhos de filtros salvos em fila horizontal.
- Chips dos filtros ativos, contador de resultados, "limpar".
- Grade de capas (2 colunas no celular) ou lista compacta.
- Estado vazio que sugere qual filtro remover.

### Filtros
Painel que sobe de baixo no celular; painel lateral recolhível no desktop. Grupos, nesta ordem, com revelação progressiva (os dois primeiros abertos, o resto recolhido):

1. Humor ou ocasião
2. Modo de jogo
3. Gênero
4. Características
5. Quem quer / situação (match, eu quero, ela quer, sem nota, os dois têm, não jogado)
6. Nota mínima
7. Nossas tags

Humor vem primeiro porque é assim que a dupla decide ("hoje quero rir"), não por gênero. Dentro de um grupo, a combinação padrão é "todas" (E), com opção de trocar para "qualquer uma" (OU). O botão de fechar mostra quantos jogos restam.

Os filtros ficam na URL, então voltar, recarregar e compartilhar o link preservam a seleção.

### Detalhes do jogo
1. Capa, título, ano, desenvolvedora.
2. Estado da dupla e estado de cada um, editáveis no lugar.
3. Notas: a minha, a dela, média e diferença. Sem as duas, mostra o convite para avaliar.
4. Ações rápidas: quero jogar, registrar sessão, avaliar.
5. Tags.
6. Sessões deste jogo.
7. Sobre o jogo (descrição, modos, plataformas, loja).
8. Steam: horas e conquistas de cada um, quando vinculada.
9. Imagens e trailer, carregados só quando pedidos.

### Adicionar jogo
Uma tela, três momentos, sem modal sobre modal:

1. **Buscar** — digita, vê resultados com capa. Jogo já cadastrado aparece marcado, levando para a página dele.
2. **Confirmar** — metadados importados, só leitura.
3. **Personalizar** — estado, "quero jogar", tags. Tudo opcional; "Salvar" já funciona sem tocar em nada.

Se a busca falhar ou o jogo não existir: "Cadastrar manualmente", com título obrigatório e o resto opcional.

### Sortear ("O que vamos jogar?")
Parte dos matches por padrão. Permite restringir por humor, modo e duração. Mostra um jogo, com "sortear de novo" e "é esse". A animação de revelação é a única animação longa do produto e pode ser pulada com um toque.

### Diário
Linha do tempo das sessões, agrupada por mês. Registrar sessão: jogo, data, quem jogou, duração, observação, momento memorável.

### Nós
Estatísticas calculadas (jogos, zerados, média, top, gêneros, mais divergentes), preferências de cada um, apelidos, contas Steam vinculadas, opção de desligar animações decorativas.

## Fluxos críticos e meta de toques (celular)

| Fluxo | Caminho | Toques |
|---|---|---|
| Escolher o jogo de hoje | Início → Sortear → É esse | 2 |
| Ver o que os dois querem | Início (já visível) | 0 |
| Adicionar jogo | Adicionar → digitar → resultado → Salvar | 3 + digitação |
| Dar nota | Jogo → Avaliar → arrastar nota → Salvar | 3 |
| Filtrar "terror cooperativo" | Biblioteca → Filtros → 2 chips → Ver jogos | 4 |
| Registrar sessão | Jogo → Registrar sessão → Salvar | 3 |

## Prioridade de construção

| Ordem | Módulo | Por quê |
|---|---|---|
| 1 | Biblioteca + adicionar jogo | Sem jogos, nada mais existe |
| 2 | Filtros e tags | Prioridade alta do pedido; base do sorteio |
| 3 | Estados e avaliações individuais | Dá sentido à dupla |
| 4 | Match e sorteio | Motivo para abrir o site |
| 5 | Diário | Segunda pergunta do produto |
| 6 | Estatísticas | Depende de dados acumulados |
| 7 | Steam | Desejada, mas não pode travar o resto |
