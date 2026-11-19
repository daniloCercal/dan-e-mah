# Pendências de aprovação

Atualizado em 18/11/2026. Nada além de protótipos descartáveis será construído antes das respostas do item 1.

## 1. Direção visual (portão obrigatório)

Abra `http://localhost:5173/design-lab` no computador, ou `http://192.168.1.46:5173/design-lab` no celular (mesmo Wi-Fi).

| | Direção | Ideia |
|---|---|---|
| A | Sala de projeção | Cinema particular: escura, capas como pôsteres, créditos de cartaz, sorteio como estreia |
| B | Clube de dois | Clara, uma cor por pessoa, dois círculos que se sobrepõem onde é "dos dois", carimbos ao zerar |
| C | Fliperama | Ultravioleta e amarelo, cartas que viram, placar de dois jogadores, baralho que embaralha no sorteio |

Preciso saber:

1. Qual direção segue — ou o que misturar (por exemplo, a base de uma com o sorteio de outra).
2. O que incomodou em qualquer uma delas.
3. Se o tom dos textos e dos apelidos está na medida.

## 2. Decisões de produto que tomei e você pode mudar

| Decisão | Alternativa |
|---|---|
| Navegação: Início, Biblioteca, Diário, Nós + ação "Adicionar jogo" | Trocar "Adicionar" por "Sortear" como ação central |
| Filtros começam por "Humor ou ocasião", não por gênero | Gênero primeiro |
| PWA (instalar no celular) entra no MVP | Deixar para a V2 |
| O estado da outra pessoa é só leitura; cada um muda o seu | Qualquer um muda qualquer estado |
| Sem estatísticas na tela inicial | — |
| Nota às cegas (a nota do outro aparece depois da sua) como experimento a testar cedo | Não fazer |

## 3. Decisões técnicas para a Fase 3

- Catálogo de jogos pela IGDB (exige conta Twitch Developer).
- Hospedagem na Vercel, plano gratuito.
- Instalar ou não o motor do Impeccable (hook automático + binário baixado). Hoje uso só os arquivos de referência.
- Nome do produto: "Jogos em dupla" é provisório.

## 4. Limitações conhecidas dos protótipos

- Dados fictícios e em memória: o que você edita some ao recarregar a página.
- Em A e B, a página "Nós" não reflete edições feitas durante a navegação; em C, reflete.
- As capturas foram feitas com animações reduzidas. As animações (sorteio, transição da capa, carimbos) foram vistas só em quadros intermediários, não avaliadas em movimento por mim: **precisam do seu olhar no aparelho**.
- Nada foi testado em celular físico. O gesto de segurar para embaralhar (direção C) é o que mais depende desse teste.
- Direção B não tem a transição da capa para a página do jogo.
- Direção A: o painel de filtros fecha sem animação; o sorteio só restringe por humor e modo.
- Direção C: na tela de sorteio, a barra de navegação marca "Início" como ativo.
- Operações em lote, desfazer exclusão e login não fazem parte destes protótipos.
- Mobbin e Dribbble bloquearam o acesso automatizado; as referências desses dois sites não foram inspecionadas diretamente.
